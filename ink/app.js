/* ============================================================================
   墨迹 · Traces of Ink —— app.js
   中国书法笔法的时间性数字化与跨模态转译
   ----------------------------------------------------------------------------
   本文件包含四段原创算法（全部可从 node 直接 require 用于自动化验证）：

     resampleStroke(points, opts)      等时重采样 + 抖动滤除 + 速度/加速度/曲率序列
     extractFeatures(points, opts)     十维笔法特征提取
     matchStyle(features)              八书体加权余弦相似度匹配 + Top-3 + 解释
     sonify(features, timbre, opts)    确定性笔法声音化（返回音符事件数组）
   以及用于"笔法重演"的时间参数化生成器 buildReplay(styleId, strokeId)。

   浏览器侧：直接 <script src> 引入，自动挂到 window.MOJI；
   Node 侧：require('./app.js') 得到同一组纯函数（DOM 相关代码自动跳过）。
   零第三方依赖。
   ========================================================================== */
(function (root, factory) {
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.MOJI = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  /* ==========================================================================
     0 · 常量与小工具
     ========================================================================== */
  var VERSION = '1.0.0';

  var CFG = {
    dt: 16,                 // 等时重采样步长（ms），约 62.5Hz
    smoothWin: 2,           // 滑动平均半窗（点）
    dwellSpeed: 42,         // 驻笔判定速度阈值（px/s）
    dwellMinSeg: 16,        // 单段计入驻笔的最小时长（ms）
    turnDeg: 9,             // 转折点判定的切线角变化阈值（度）
    coreRange: [0.10, 0.90],// 计算速度统计时剔除起收的区域
    midRange: [0.30, 0.70], // 中段稳定性区间
    entropyBins: 8,         // 节奏熵的分箱数
    refCanvas: 1000,        // 书体档案标定所用的参考画布边长（px）
    minStrokePts: 3
  };

  /* 提按（press）与笔道宽度模型的全部可调参数 —— 见 §2.0 inkProfile。
     这些常量集中在此，使"提按比"的上界与 FEATURE_META.pressRatio.scale
     严格同源（都是 4.2），不会再出现"特征一个上限、渲染另一个上限"。 */
  var PRESS = {
    KP: 3.0,              // 压力动态范围 → 宽度倍数（满量程 0→1 得 4.0×）
    BETA: 0.70,           // 速度动态范围（ln）→ 宽度倍数 的对数压缩系数
    PCT_LO: 0.10,         // 速度下分位（抵抗驻笔处的近零速度）
    PCT_HI: 0.90,         // 速度上分位（抵抗飞白处的单点抖动）
    PCT_P_LO: 0.05,       // 压力下分位
    PCT_P_HI: 0.95,       // 压力上分位
    V_FLOOR: 12,          // px/s；低于此视为"驻笔到底"，不再放大比值
    RATIO_MAX: 4.2,       // 上界 = FEATURE_META.pressRatio.scale
    P_RANGE_MIN: 0.06,    // 压力分位差小于此值 → 判定为无压感设备（鼠标恒 0.5）
    W_MID: 0.95,          // 笔道几何平均宽度（相对 brushSize）
    TAPER_IN: 0.55,       // 起笔锋形起点
    TAPER_IN_SPAN: 0.05,  // 起笔 0–5% 长度内由 TAPER_IN 升到 1
    TAPER_OUT: 0.28,      // 收笔锋形末端
    TAPER_OUT_START: 0.94 // 收笔 94–100% 长度内由 1 收到 TAPER_OUT
  };

  var FEATURE_KEYS = [
    'startAngle', 'entryShape', 'avgSpeed', 'speedVar', 'pressRatio',
    'turnAngle', 'dwellTotal', 'rhythmEntropy', 'midStability', 'endDirection'
  ];

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function isNum(v) { return typeof v === 'number' && isFinite(v); }
  function deg(rad) { return rad * 180 / Math.PI; }
  function rad(d) { return d * Math.PI / 180; }
  function wrapPi(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
  function norm360(d) { var x = d % 360; return x < 0 ? x + 360 : x; }
  function mean(a) { if (!a.length) return 0; var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function stdev(a) {
    if (a.length < 2) return 0;
    var m = mean(a), s = 0;
    for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return Math.sqrt(s / a.length);
  }
  function median(a) {
    if (!a.length) return 0;
    var b = a.slice().sort(function (x, y) { return x - y; });
    var h = b.length >> 1;
    return b.length % 2 ? b[h] : (b[h - 1] + b[h]) / 2;
  }
  /* 线性插值分位数 q ∈ [0,1]。提按的强度用分位而不是单点极值：
     驻笔处速度近零、飞白处速度单点跳高，都会把极值推向噪声。
     quant() 作用于**已排序**的数组；sortedCopy() 提供排序副本（一笔只排两次）。 */
  function quant(b, q) {
    if (!b || !b.length) return 0;
    var pos = clamp(q, 0, 1) * (b.length - 1);
    var lo = Math.floor(pos), hi = Math.ceil(pos);
    return b[lo] + (b[hi] - b[lo]) * (pos - lo);
  }
  function sortedCopy(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function hypot(dx, dy) { return Math.sqrt(dx * dx + dy * dy); }
  function round(v, n) { var k = Math.pow(10, n || 0); return Math.round(v * k) / k; }

  /* 方向特征在相似度计算中按"笔迹轴向"折叠编码到 [0,1]：
     先折叠到 0–180°，再折叠到 0–90°，故 0° 与 180° 编码相同、
     90° 与 270° 编码相同，避免 0°/360° 边界跳变。 */
  function axisFold(d) {
    var a = norm360(d);
    var m = Math.min(a, 360 - a);      // → 0–180（同一条直线）
    if (m > 90) m = 180 - m;           // → 0–90（同一个轴）
    return m / 90;
  }

  /* ==========================================================================
     1 · resampleStroke —— 等时重采样 + 抖动滤除 + 运动学序列
     --------------------------------------------------------------------------
     输入 points：[{x, y, t(ms), p(0–1, 可选)}]，按时间递增。
     处理：
       ① 清洗：剔除非法点 / 时间非递增点 / 极小位移的重复点
       ② 抖动滤除：位置做半窗 win 的滑动平均（端点用收缩窗，保留端点位形）
       ③ 等时重采样：对 (t → x, y, p) 做线性插值，得到固定 dt 的序列
       ④ 派生量：v（速度 px/s，中心差分）、a（加速度）、theta（切线角）、
                 kappa（有符号曲率 = Δθ/Δs）、s（累计弧长）
     返回：样本数组；样本太少时返回 []。
     ========================================================================== */
  function resampleStroke(points, opts) {
    opts = opts || {};
    var dt = isNum(opts.dt) ? opts.dt : CFG.dt;
    var win = isNum(opts.window) ? opts.window : CFG.smoothWin;
    if (!points || points.length < 2) return [];

    /* ① 清洗 */
    var src = [], i, j, p, prev;
    for (i = 0; i < points.length; i++) {
      p = points[i];
      if (!p || !isNum(p.x) || !isNum(p.y)) continue;
      var t = isNum(p.t) ? p.t : (src.length ? src[src.length - 1].t + dt : 0);
      var pr = isNum(p.p) ? clamp(p.p, 0, 1) : 0.5;
      if (src.length) {
        prev = src[src.length - 1];
        if (t <= prev.t) t = prev.t + 0.5;
        if (hypot(p.x - prev.x, p.y - prev.y) < 0.02 && t - prev.t < dt) continue;
      }
      src.push({ x: p.x, y: p.y, t: t, p: pr });
    }
    if (src.length < 2) return [];

    /* ② 抖动滤除（滑动平均 + 端点镜像延拓）
       端点用线性镜像延拓采样（x[-k] = 2x₀ − x[k]），使匀速直线段的
       端点位置在平滑后严格不变，避免平滑把起笔点向内拉、污染起笔角。 */
    var N = src.length;
    function mir(key, idx) {
      if (idx < 0) return 2 * src[0][key] - src[Math.min(N - 1, -idx)][key];
      if (idx >= N) return 2 * src[N - 1][key] - src[Math.max(0, 2 * (N - 1) - idx)][key];
      return src[idx][key];
    }
    var sm = new Array(N);
    for (i = 0; i < N; i++) {
      var sx = 0, sy = 0, sp = 0, c = 0;
      for (j = i - win; j <= i + win; j++) {
        sx += mir('x', j); sy += mir('y', j); sp += mir('p', j); c++;
      }
      sm[i] = { x: sx / c, y: sy / c, t: src[i].t, p: sp / c };
    }

    /* ③ 等时重采样 */
    var t0 = sm[0].t, t1 = sm[sm.length - 1].t;
    if (!(t1 > t0)) return [];
    var want = Math.floor((t1 - t0) / dt) + 1;
    var out = [], k = 0;
    for (i = 0; i < want; i++) {
      var tt = t0 + i * dt;
      if (tt > t1 + 1e-9) break;
      while (k < sm.length - 2 && sm[k + 1].t < tt) k++;
      var A = sm[k], B = sm[k + 1] || sm[k];
      var span = (B.t - A.t) || 1e-6;
      var u = clamp((tt - A.t) / span, 0, 1);
      out.push({
        x: A.x + (B.x - A.x) * u,
        y: A.y + (B.y - A.y) * u,
        p: A.p + (B.p - A.p) * u,
        t: tt
      });
    }
    if (out.length < CFG.minStrokePts) return [];

    /* ④ 速度 / 切线 */
    var m = out.length, i0, i1, dtt, dx, dy;
    for (i = 0; i < m; i++) {
      i0 = Math.max(0, i - 1); i1 = Math.min(m - 1, i + 1);
      dx = out[i1].x - out[i0].x; dy = out[i1].y - out[i0].y;
      dtt = (out[i1].t - out[i0].t) / 1000;
      if (!(dtt > 0)) dtt = dt / 1000;
      out[i].v = hypot(dx, dy) / dtt;
      out[i].theta = Math.atan2(dy, dx);
    }
    /* 加速度 */
    for (i = 0; i < m; i++) {
      i0 = Math.max(0, i - 1); i1 = Math.min(m - 1, i + 1);
      dtt = (out[i1].t - out[i0].t) / 1000;
      if (!(dtt > 0)) dtt = dt / 1000;
      out[i].a = (out[i1].v - out[i0].v) / dtt;
    }
    /* 弧长 */
    out[0].s = 0;
    for (i = 1; i < m; i++) out[i].s = out[i - 1].s + hypot(out[i].x - out[i - 1].x, out[i].y - out[i - 1].y);
    /* 有符号曲率 κ = Δθ / Δs */
    for (i = 0; i < m; i++) {
      i0 = Math.max(0, i - 1); i1 = Math.min(m - 1, i + 1);
      var ds = out[i1].s - out[i0].s;
      var dth = wrapPi(out[i1].theta - out[i0].theta);
      out[i].kappa = Math.abs(ds) > 1e-6 ? dth / ds : 0;
    }
    out.duration = t1 - t0;
    out.length = m;
    return out;
  }

  /* ==========================================================================
     2 · extractFeatures —— 十维笔法特征
     --------------------------------------------------------------------------
     ① startAngle     起笔角     首段位移方向（度，0–360）
     ② entryShape     入锋形态   1 − 起笔段速度 / 峰值速度（0 露锋尖入 → 1 藏锋缓起）
     ③ avgSpeed       行笔速度均值  核心区（10–90%）速度均值（px/s，按参考画布折算）
     ④ speedVar       速度方差   (σ/μ)²，即归一化速度变异系数的平方（无量纲）
     ⑤ pressRatio     提按比     笔道最宽 / 最窄；有压感用真实压力，
                                 无压感时以行笔速度为代理（见 §2.0）
     ⑥ turnAngle      转折角均值  切线角变化超过阈值的转折点的平均角变化（度）
     ⑦ dwellTotal     驻笔总时长  原始采样中低速段时长之和（ms）
     ⑧ rhythmEntropy  节奏熵     速度分布的归一化香农熵（0–1）
     ⑨ midStability   中段稳定性 1 − 中段（30–70%）速度变异系数（0–1）
     ⑩ endDirection   收笔方向   末段位移方向（度，0–360）
     ========================================================================== */
  /* --------------------------------------------------------------------------
     2.0 · inkProfile —— 笔道宽度与提按的唯一模型
     --------------------------------------------------------------------------
     全文件只有这一处定义"笔道有多粗"：十维特征里的提按比、提按剖面图、
     以及 canvas 上真正画出的笔道，全部取自本函数。因此不可能再出现
     "剖面图一个上限、真实笔迹另一个上限"的不一致。

     提按的两条物理通道（同一量纲：宽度倍数，1 ≤ R ≤ 4.2）：

       ① 压力通道 —— 有真实压感时（数位板 / 支持 force 的触屏）。
          判据：沿笔道压力的 5%–95% 分位差 > 0.06。
          归一化 p′ = (p − p₅) / (p₉₅ − p₅)：本笔内部的满量程拉伸。
             · 恒定压力（鼠标按下时 Pointer Events 规范固定 p = 0.5）
               分位差为 0 → 自动落回通道 ②，不产生任何伪提按；
             · 真实压感则用真实压力，不再被"0.34 + 0.92·p"这种把 0.5 当成
               "中等按压"的写法折损（旧模型的 2.27 上限正是这么来的）。
          宽度倍数 R_p = 1 + K_p·(p₉₅ − p₅)，K_p = 3.0
             → 满量程 0→1 得 4.0×，不超过 FEATURE_META 的 scale 4.2。

       ② 速度通道 —— 无压感时的代理。书法规律"慢则按得重、快则提得轻"
          本身就是提按的运动学后果，因此速度是可测的替代量。
          取 10% / 90% 分位速度之比（不用单点极值：驻笔近零、飞白跳高都会
          污染极值），再把"速差倍数"压缩成"宽度倍数"：
             x = v₉₀ / max(v₁₀, v_floor)，v_floor = 12 px/s
             R_v = 1 + β·ln x，β = 0.70
          为什么用对数压缩而不是直接取幂 w ∝ v^−α：
             · 物理上笔毫的出墨是有限的（存墨量有限），速差越大、墨沉积越
               跟不上，宽度增长必然次线性；
             · 数学上 w = R_v^h 展开后仍是幂律 (v₉₀/v)^α_eff，但有效指数随
               本笔速差自适应：x=2 时 α_eff≈0.67，x=5 时 ≈0.47，x=35 时
               ≈0.35——速差越极端，指数越小，不会像固定 α 那样在 x≳18 处
               直接顶到 4.2 上界（固定 α=0.5 时任何带顿笔的笔迹都会饱和成
               4.20，该维反而变成常数）。
             · 数值上正好覆盖档案区间：x=3.5 → 1.87（赵体 1.90），x=6 →
               2.25（欧体 2.25），x=11.3 → 2.70（张迁 2.60），x=14 → 2.85
               （柳体 2.80），x=35 → 3.49（颜体 3.40）；上界 4.2 要到
               x≈96 才触到，真实书写几乎不会。

       两通道同为"最宽 / 最窄"的倍数，共用同一个上界 4.2，可直接比较；
       且两通道用同一个公式族 w = R^h（h 为"按下去的归一化程度"），
       所以换设备不会换物理意义。

       ③ 锋形层（不计入提按比，但如实出现在画布与剖面图上）：
          起笔 0–5% 长度内 0.55× → 1，收笔 94–100% 内 1 → 0.28×。
          它是每一笔都有的固定修饰，不携带笔间信息；若计入提按比，所有笔
          都会凭空多出 1/0.28 ≈ 3.57× 的"对比"，反而使该维失去区分度
          （平坦笔道的总宽比恒为 3.57，与写得好坏无关）。剖面图因此
          同时画出两条包络线并标注两个比值，读者可自行核对。

     返回（.w / .wSkeleton 均为"相对笔道几何平均宽度"的倍数）：
       w            骨架层 × 锋形层 = 画布上真实笔宽
       wSkeleton    骨架层包络，pressRatio 的定义域
       press        0 = 提到底，1 = 按到底（供声音化与可视化）
       taper        锋形系数
       ratioTotal   骨架层最宽/最窄 = pressRatio（与 wSkeleton 严格同源）
       ratioFull    含锋形层的最宽/最窄（画布上肉眼量到的比值）
       source       'pressure' | 'speed'
     -------------------------------------------------------------------------- */
  function taperAt(u) {
    var k = 1;
    if (u < PRESS.TAPER_IN_SPAN) k = PRESS.TAPER_IN + (1 - PRESS.TAPER_IN) * (u / PRESS.TAPER_IN_SPAN);
    if (u > PRESS.TAPER_OUT_START) {
      k *= 1 - (u - PRESS.TAPER_OUT_START) / (1 - PRESS.TAPER_OUT_START) * (1 - PRESS.TAPER_OUT);
    }
    return k;
  }

  function inkProfile(pts) {
    var n = pts ? pts.length : 0, i;
    var res = {
      w: [], wSkeleton: [], press: [], taper: [], v: [], vn: [],
      vmax: 1e-6, vLo: 0, vHi: 0, pLo: 0.5, pHi: 0.5,
      ratioTotal: 1, ratioFull: 1, ratioSpeed: 1, ratioPress: 1,
      source: 'speed'
    };
    if (!n) return res;

    /* ① 逐点速度（中心差分，与 resampleStroke 第 ④ 步完全同一算法） */
    var vs = new Array(n), ps = new Array(n), vmax = 1e-6;
    for (i = 0; i < n; i++) {
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      var dtt = (b.t - a.t) / 1000;
      vs[i] = dtt > 0 ? hypot(b.x - a.x, b.y - a.y) / dtt : 0;
      pts[i].v = vs[i];                          // 回写：飞白判定与悬浮读数复用
      ps[i] = isNum(pts[i].p) ? clamp(pts[i].p, 0, 1) : 0.5;
      if (vs[i] > vmax) vmax = vs[i];
    }

    /* ② 两条通道各自的动态范围 → 宽度倍数（分位：速度与压力各排序一次） */
    var bv = sortedCopy(vs), bp = sortedCopy(ps);
    var vHi = quant(bv, PRESS.PCT_HI);
    var vLo = Math.max(quant(bv, PRESS.PCT_LO), PRESS.V_FLOOR);
    if (!(vHi > vLo)) vHi = vLo;                 // 匀速：速差 1×，无提按
    var speedSpan = Math.log(vHi / vLo);          // ≥ 0
    var ratioSpeed = clamp(1 + PRESS.BETA * speedSpan, 1, PRESS.RATIO_MAX);

    var pLo = quant(bp, PRESS.PCT_P_LO), pHi = quant(bp, PRESS.PCT_P_HI);
    var hasPressure = (pHi - pLo) > PRESS.P_RANGE_MIN;
    var ratioPress = hasPressure
      ? clamp(1 + PRESS.KP * (pHi - pLo), 1, PRESS.RATIO_MAX) : 1;
    var ratioTotal = hasPressure ? ratioPress : ratioSpeed;

    /* ③ 逐点相对笔宽：w = R^h，h ∈ [0,1] 是"按下去的归一化程度"
       两通道同一公式族：raw 的最大/最小值之比恰为 R，再由几何平均归一
       （乘常数不改变比值），于是剖面图与 pressRatio 严格同源。 */
    var raw = new Array(n), sumLn = 0;
    if (hasPressure) {
      var pSpan = Math.max(1e-6, pHi - pLo);
      for (i = 0; i < n; i++) {
        var hp = clamp((ps[i] - pLo) / pSpan, 0, 1);
        raw[i] = Math.pow(ratioTotal, hp);
      }
    } else if (speedSpan > 1e-9) {
      for (i = 0; i < n; i++) {
        var hv = clamp(Math.log(vHi / clamp(vs[i], vLo, vHi)) / speedSpan, 0, 1);
        raw[i] = Math.pow(ratioTotal, hv);
      }
    } else {
      for (i = 0; i < n; i++) raw[i] = 1;        // 匀速：恒宽
    }
    for (i = 0; i < n; i++) sumLn += Math.log(Math.max(1e-6, raw[i]));
    var gmean = Math.exp(sumLn / n);

    var lnR = Math.log(ratioTotal);
    for (i = 0; i < n; i++) {
      var u = n > 1 ? i / (n - 1) : 0;
      res.wSkeleton[i] = raw[i] / gmean;
      res.taper[i] = taperAt(u);
      res.w[i] = res.wSkeleton[i] * res.taper[i];
      res.press[i] = lnR > 1e-9 ? clamp(Math.log(raw[i]) / lnR, 0, 1) : 0;
      res.v[i] = vs[i];
      res.vn[i] = clamp(vs[i] / vmax, 0, 1);
    }

    /* ④ 两个比值全部由同一组宽度直接量出，不做二次标定 */
    var mx = 0, mn = Infinity, mxf = 0, mnf = Infinity;
    for (i = 0; i < n; i++) {
      if (res.wSkeleton[i] > mx) mx = res.wSkeleton[i];
      if (res.wSkeleton[i] < mn) mn = res.wSkeleton[i];
      if (res.w[i] > mxf) mxf = res.w[i];
      if (res.w[i] < mnf) mnf = res.w[i];
    }
    res.ratioTotal = clamp(mn > 0 ? mx / mn : 1, 1, PRESS.RATIO_MAX);
    res.ratioFull = mnf > 0 ? mxf / mnf : 1;
    res.ratioSpeed = ratioSpeed;
    res.ratioPress = ratioPress;
    res.vmax = vmax;
    res.vLo = vLo; res.vHi = vHi;
    res.pLo = pLo; res.pHi = pHi;
    res.source = hasPressure ? 'pressure' : 'speed';
    return res;
  }

  function measureDwell(raw) {
    /* 在原始采样上测驻笔：相邻两点间"位移/时间"低于阈值即计入。
       真实的静止停顿在指针事件流中表现为"时间跨度大而位移近零"，此处可精确捕获。 */
    var total = 0, ranges = [], i;
    if (!raw || raw.length < 2) return { total: 0, ranges: [] };
    var cur = null;
    for (i = 1; i < raw.length; i++) {
      var dtms = raw[i].t - raw[i - 1].t;
      if (!(dtms > 0)) continue;
      var v = hypot(raw[i].x - raw[i - 1].x, raw[i].y - raw[i - 1].y) / (dtms / 1000);
      if (v < CFG.dwellSpeed && dtms >= CFG.dwellMinSeg) {
        total += dtms;
        if (cur) { cur.end = raw[i].t; cur.dur = cur.end - cur.start; }
        else { cur = { start: raw[i - 1].t, end: raw[i].t, dur: dtms }; ranges.push(cur); }
      } else {
        cur = null;
      }
    }
    return { total: total, ranges: ranges };
  }

  function extractFeatures(points, opts) {
    opts = opts || {};
    var S = resampleStroke(points, opts);
    var empty = emptyFeatures();
    if (!S.length) return empty;

    var n = S.length, i, i0, i1;
    /* 提按 / 笔宽：与剖面图、canvas 笔道同一个模型（§2.0） */
    var ink = inkProfile(S);
    var v = ink.v;
    var vMax = ink.vmax;
    var speedScale = isNum(opts.speedScale) ? opts.speedScale : 1;

    /* 核心区（剔除起收） */
    i0 = Math.floor(n * CFG.coreRange[0]);
    i1 = Math.max(i0 + 2, Math.ceil(n * CFG.coreRange[1]));
    var vCore = v.slice(i0, Math.min(i1, n));
    var vMean = mean(vCore) || 1e-6;
    var cv = stdev(vCore) / vMean;

    /* ① 起笔角 */
    var kS = Math.min(n - 1, Math.max(1, Math.round(n * 0.06)));
    var startAngle = norm360(deg(Math.atan2(S[kS].y - S[0].y, S[kS].x - S[0].x)));
    /* ⑩ 收笔方向 */
    var kE = Math.min(n - 1, Math.max(1, Math.round(n * 0.06)));
    var endDirection = norm360(deg(Math.atan2(
      S[n - 1].y - S[n - 1 - kE].y, S[n - 1].x - S[n - 1 - kE].x)));

    /* ② 入锋形态 */
    var headN = Math.max(2, Math.round(n * 0.08));
    var vStart = median(v.slice(0, headN));
    var entryShape = clamp(1 - vStart / (vMax || 1e-6), 0, 1);

    /* ③④ 速度均值与归一化方差 */
    var avgSpeed = vMean * speedScale;
    var speedVar = clamp(cv * cv, 0, 4);

    /* ⑤ 提按比（骨架层包络，不含起收锋；见 §2.0 为何不含）
       有真实压感 → 真实压力；无压感（鼠标 / 普通触屏压力恒 0.5）→ 速度代理。
       两条通道同为"最宽 / 最窄"倍数，上界 4.2 与 FEATURE_META 同源。 */
    var pressRatio = clamp(ink.ratioTotal, 1, PRESS.RATIO_MAX);

    /* ⑥ 转折角
       在"约 8% 笔画长度"的滑动窗内测量切线角的总变化，再取局部极大值平均。
       这样尺度无关：方折（角变化集中在一小段）读到接近 90°，圆转（同样 90°
       摊在很长一段上）只读到十几度——正是书论中"方笔 / 圆笔"的可测量差别。 */
    var half = Math.max(1, Math.round(n * 0.04));
    var dthArr = new Array(n);
    for (i = 0; i < n; i++) {
      var lo = Math.max(0, i - half), hi = Math.min(n - 1, i + half);
      dthArr[i] = Math.abs(deg(wrapPi(S[hi].theta - S[lo].theta)));
    }
    var turns = [], sumTurn = 0, peakMax = 0;
    for (i = 1; i < n - 1; i++) {
      if (!(dthArr[i] >= dthArr[i - 1] && dthArr[i] > dthArr[i + 1])) continue;
      if (dthArr[i] <= CFG.turnDeg) continue;
      turns.push({ index: i, deg: dthArr[i], t: S[i].t });
      sumTurn += dthArr[i];
      if (dthArr[i] > peakMax) peakMax = dthArr[i];
    }
    var turnAngle = turns.length ? sumTurn / turns.length : 0;

    /* ⑦ 驻笔 */
    var dw = measureDwell(points);
    var dwellTotal = dw.total;

    /* ⑧ 节奏熵 */
    var bins = new Array(CFG.entropyBins);
    for (i = 0; i < bins.length; i++) bins[i] = 0;
    for (i = 0; i < n; i++) {
      var b = Math.floor(clamp(v[i] / (vMax || 1e-6), 0, 0.999999) * CFG.entropyBins);
      bins[clamp(b, 0, CFG.entropyBins - 1)]++;
    }
    var H = 0;
    for (i = 0; i < bins.length; i++) {
      if (bins[i] > 0) { var pi = bins[i] / n; H -= pi * Math.log(pi) / Math.LN2; }
    }
    /* 归一化：除以 log2(分箱数)，得 0–1 的节奏熵 */
    var rhythmEntropy = clamp(H / (Math.log(CFG.entropyBins) / Math.LN2), 0, 1);

    /* ⑨ 中段稳定性 */
    var m0 = Math.floor(n * CFG.midRange[0]), m1 = Math.max(m0 + 2, Math.ceil(n * CFG.midRange[1]));
    var vMid = v.slice(m0, Math.min(m1, n));
    var cvMid = stdev(vMid) / (mean(vMid) || 1e-6);
    var midStability = clamp(1 - cvMid, 0, 1);

    return {
      /* —— 十维特征（顺序与 FEATURE_KEYS 一致） —— */
      startAngle: round(startAngle, 1),
      entryShape: round(entryShape, 3),
      avgSpeed: round(avgSpeed, 1),
      speedVar: round(speedVar, 4),
      pressRatio: round(pressRatio, 2),
      turnAngle: round(turnAngle, 1),
      dwellTotal: Math.round(dwellTotal),
      rhythmEntropy: round(rhythmEntropy, 3),
      midStability: round(midStability, 3),
      endDirection: round(endDirection, 1),
      /* —— 派生信息（不计入十维，供可视化与声音化使用） —— */
      sampleCount: n,
      rawPointCount: points.length,
      duration: Math.round(S.duration || 0),
      length: round(S[n - 1].s, 1),
      turnCount: turns.length,
      turnTotal: round(sumTurn, 1),
      turnPeak: round(peakMax, 1),
      dwellRanges: dw.ranges,
      turns: turns,
      /* widths 含起收锋 = 画布上真实画出的笔宽（剖面图实线）；
         skeletonWidths 不含起收锋 = pressRatio 的定义域（剖面图虚线）。
         两者同出 inkProfile，比值分别为 ratioFull / pressRatio。 */
      widths: ink.w,
      skeletonWidths: ink.wSkeleton,
      taper: ink.taper,
      press: ink.press,
      pressSource: ink.source,
      pressRatioFull: round(ink.ratioFull, 2),
      pressWeightMin: ink.wSkeleton.length ? round(Math.min.apply(null, ink.wSkeleton), 3) : 1,
      pressWeightMax: ink.wSkeleton.length ? round(Math.max.apply(null, ink.wSkeleton), 3) : 1,
      speedBand: [round(ink.vLo, 1), round(ink.vHi, 1)],
      pressureBand: [round(ink.pLo, 3), round(ink.pHi, 3)],
      avgSpeedRaw: round(vMean, 1),
      speeds: v,
      curvature: S.map(function (s) { return s.kappa; }),
      speedSeries: S.map(function (s) { return { t: s.t, v: s.v, x: s.x, y: s.y }; }),
      samples: S
    };
  }

  function emptyFeatures() {
    var o = {};
    for (var i = 0; i < FEATURE_KEYS.length; i++) o[FEATURE_KEYS[i]] = 0;
    o.sampleCount = 0; o.rawPointCount = 0; o.duration = 0; o.length = 0;
    o.turnCount = 0; o.turnTotal = 0; o.dwellRanges = []; o.turns = [];
    o.widths = []; o.skeletonWidths = []; o.taper = []; o.press = [];
    o.pressSource = 'speed'; o.pressRatioFull = 1;
    o.pressWeightMin = 1; o.pressWeightMax = 1;
    o.speedBand = [0, 0]; o.pressureBand = [0.5, 0.5]; o.avgSpeedRaw = 0;
    o.speeds = []; o.curvature = [];
    o.speedSeries = []; o.samples = [];
    return o;
  }

  /* ==========================================================================
     3 · matchStyle —— 八书体加权余弦相似度
     --------------------------------------------------------------------------
     归一化：x̂ = clamp(x / scale, 0, 1)；角度类特征先按轴向折叠（axisFold）。
     加权余弦：  sim = Σ wᵢ·aᵢ·bᵢ / ( √(Σ wᵢaᵢ²) · √(Σ wᵢbᵢ²) )
     说明：这是教学示意性的特征相似度，不构成书家或年代鉴定。
     ========================================================================== */
  function featureMeta() {
    var D = root.MOJI_STELES || null;
    return (D && D.FEATURE_META) || [];
  }
  function styleProfiles() {
    var D = root.MOJI_STELES || null;
    return (D && D.STYLES) || [];
  }
  function featureVector(features) {
    var meta = featureMeta(), out = {};
    for (var i = 0; i < meta.length; i++) {
      var m = meta[i], v = features[m.key] || 0;
      out[m.key] = (m.key === 'startAngle' || m.key === 'endDirection')
        ? axisFold(v) : clamp(v / (m.scale || 1), 0, 1);
    }
    return out;
  }

  function matchStyle(features) {
    var meta = featureMeta();
    var styles = styleProfiles();
    if (!meta.length || !styles.length) {
      return { ranked: [], top: null, top3: [], why_zh: '缺少书体档案数据。', why_en: 'Style profiles not loaded.', vector: {}, disclaimer_zh: '', disclaimer_en: '' };
    }
    var a = featureVector(features);
    var ranked = styles.map(function (st) {
      var num = 0, da = 0, db = 0;
      for (var i = 0; i < meta.length; i++) {
        var m = meta[i];
        var av = a[m.key];
        var bv = (m.key === 'startAngle' || m.key === 'endDirection')
          ? axisFold(st.feature[m.key] || 0)
          : clamp((st.feature[m.key] || 0) / (m.scale || 1), 0, 1);
        var w = m.w || 1;
        num += w * av * bv; da += w * av * av; db += w * bv * bv;
      }
      var sim = num / (Math.sqrt(da) * Math.sqrt(db) + 1e-9);
      var per = {};
      for (var j = 0; j < meta.length; j++) {
        var mm = meta[j];
        var xa = a[mm.key];
        var xb = (mm.key === 'startAngle' || mm.key === 'endDirection')
          ? axisFold(st.feature[mm.key] || 0) : clamp((st.feature[mm.key] || 0) / (mm.scale || 1), 0, 1);
        per[mm.key] = round(xa - xb, 3);
      }
      return {
        id: st.id, zh: st.zh, en: st.en,
        calligrapher_zh: st.calligrapher_zh, calligrapher_en: st.calligrapher_en,
        work_zh: st.work_zh, work_en: st.work_en, epithet_zh: st.epithet_zh, epithet_en: st.epithet_en,
        similarity: round(sim, 4),
        score: round(sim * 100, 1),
        delta: per,
        profile: st.feature
      };
    });
    ranked.sort(function (x, y) { return y.similarity - x.similarity; });
    var expl = explainMatch(features, a, ranked);
    var D = root.MOJI_STELES || {};
    return {
      ranked: ranked,
      top: ranked[0],
      top3: ranked.slice(0, 3),
      why_zh: expl.zh,
      why_en: expl.en,
      clauses_zh: expl.clauses_zh,
      clauses_en: expl.clauses_en,
      vector: a,
      disclaimer_zh: D.DISCLAIMER_zh || '',
      disclaimer_en: D.DISCLAIMER_EN || ''
    };
  }

  var DIM_PHRASE = {
    speedVar: {
      hi: { zh: '行笔速度起伏大', en: 'your speed fluctuates widely' },
      lo: { zh: '行笔速度方差偏小', en: 'your speed is unusually even' }
    },
    turnAngle: {
      hi: { zh: '转折见棱、偏方', en: 'your turns are angular' },
      lo: { zh: '转折偏圆', en: 'your turns are rounded' }
    },
    pressRatio: {
      hi: { zh: '提按幅度大、粗细对比强', en: 'your press varies strongly' },
      lo: { zh: '提按幅度小、线条匀净', en: 'your press varies little' }
    },
    dwellTotal: {
      hi: { zh: '驻笔时间长、笔笔有停', en: 'you dwell on the paper' },
      lo: { zh: '驻笔极短、行笔不停', en: 'you barely pause' }
    },
    avgSpeed: {
      hi: { zh: '行笔快', en: 'you write fast' },
      lo: { zh: '行笔沉缓', en: 'you write slowly' }
    },
    entryShape: {
      hi: { zh: '起笔藏锋缓入', en: 'your entries are concealed and gradual' },
      lo: { zh: '起笔露锋尖入', en: 'your entries are exposed and sharp' }
    },
    rhythmEntropy: {
      hi: { zh: '节奏变化丰富', en: 'your rhythm is varied' },
      lo: { zh: '节奏均匀单一', en: 'your rhythm is uniform' }
    },
    midStability: {
      hi: { zh: '中段极稳', en: 'your middle section is very steady' },
      lo: { zh: '中段起伏不定', en: 'your middle section wavers' }
    },
    startAngle: {
      hi: { zh: '起笔方向偏纵', en: 'your entries run vertical' },
      lo: { zh: '起笔方向偏横', en: 'your entries run horizontal' }
    },
    endDirection: {
      hi: { zh: '收笔方向偏纵', en: 'your exits run vertical' },
      lo: { zh: '收笔方向偏横', en: 'your exits run horizontal' }
    }
  };

  function explainMatch(features, a, ranked) {
    var meta = featureMeta();
    var top = ranked[0];
    if (!top) return { zh: '', en: '', clauses_zh: [], clauses_en: [] };
    /* 以八书体均值作为"中性参照"，找出用户偏离中性且与命中书体同向的维度 */
    var means = {};
    var styles = styleProfiles();
    for (var i = 0; i < meta.length; i++) {
      var k = meta[i].key;
      var acc = 0;
      for (var j = 0; j < styles.length; j++) {
        var sv = (k === 'startAngle' || k === 'endDirection')
          ? axisFold(styles[j].feature[k] || 0)
          : clamp((styles[j].feature[k] || 0) / (meta[i].scale || 1), 0, 1);
        acc += sv;
      }
      means[k] = acc / styles.length;
    }
    var cands = [];
    for (i = 0; i < meta.length; i++) {
      var mm = meta[i], key = mm.key;
      var du = a[key] - means[key];
      var bk = (key === 'startAngle' || key === 'endDirection')
        ? axisFold(top.profile[key] || 0)
        : clamp((top.profile[key] || 0) / (mm.scale || 1), 0, 1);
      var ds = bk - means[key];
      var aligned = (du * ds > 0);
      cands.push({ key: key, w: mm.w, du: du, aligned: aligned, score: Math.abs(du) * mm.w * (aligned ? 1.35 : 1) });
    }
    /* 若未检测到任何转折（turnAngle≈0），不得把"转折"作为解释维度，
       否则会出现"转折角 0.0° / 没有检测到明显转折"却解释成"转折偏圆"的自相矛盾。 */
    var hasTurns = (features.turnAngle || 0) > 0.5;
    if (!hasTurns) {
      cands = cands.filter(function (c) { return c.key !== 'turnAngle'; });
    }
    cands.sort(function (x, y) { return y.score - x.score; });
    var picked = cands.filter(function (c) { return c.aligned && Math.abs(c.du) > 0.045; }).slice(0, 2);
    if (picked.length < 2) {
      picked = cands.slice(0, 2);
    }
    var cz = [], ce = [], cz2 = [], ce2 = [];
    for (i = 0; i < Math.min(2, picked.length); i++) {
      var ph = DIM_PHRASE[picked[i].key];
      if (!ph) continue;
      var dir = picked[i].du >= 0 ? 'hi' : 'lo';
      cz.push(ph[dir].zh); ce.push(ph[dir].en);
      cz2.push(ph[dir].zh); ce2.push(ph[dir].en);
    }
    var zh = (cz.length ? '你的' + cz.join('、') + ' → ' : '') + '更接近' + top.zh + '的' + top.epithet_zh + '。';
    var en = (ce.length ? 'Your ' + ce.join(', and ') + ' → ' : '') + 'closer to the ' + top.en + ' — ' + top.epithet_en + '.';
    return { zh: zh, en: en, clauses_zh: cz2, clauses_en: ce2 };
  }

  /* ==========================================================================
     4 · sonify —— 确定性笔法声音化
     --------------------------------------------------------------------------
     映射：速度 → 音高（五声音阶离散化）；提按 → 音量包络；转折 → 谐波亮度。
     确定性：随机数来自以"量化后的十维特征"为种子的 mulberry32，
             不含 Math.random / Date / 任何外部状态 ⇒ 同输入必然逐字段相同。
     返回：{ timbre, seed, count, events:[{t, dur, freq, gain, harm:[…], …}], meta }
     ========================================================================== */
  var TIMBRES = [
    { id: 'guqin', zh: '古琴拨弦', en: 'Guqin pluck', harm: [1, 0.44, 0.22, 0.12, 0.07, 0.04], decay: 1.85, attack: 0.006 },
    { id: 'muyu', zh: '木鱼点', en: 'Wooden fish', harm: [1, 0.52, 0.34, 0.18], decay: 0.34, attack: 0.002 },
    { id: 'strings', zh: '弦乐持续', en: 'Sustained strings', harm: [1, 0.62, 0.42, 0.28, 0.18, 0.12, 0.08], decay: 2.9, attack: 0.09 }
  ];

  function fnv1a(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function mulberry32(a) {
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var PENTA = [0, 2, 4, 7, 9];        // 宫商角徵羽（D 调五声）
  var BASE_D = 146.832;               // D3

  function sonify(features, timbre, opts) {
    opts = opts || {};
    var T = null, i;
    for (i = 0; i < TIMBRES.length; i++) if (TIMBRES[i].id === timbre) T = TIMBRES[i];
    if (!T) T = TIMBRES[0];
    var f = features || emptyFeatures();

    /* 种子：量化十维特征 → 稳定哈希 */
    var q = FEATURE_KEYS.map(function (k) { return String(Math.round((f[k] || 0) * 1000)); }).join('|');
    var seed = fnv1a(q + '#' + T.id);
    var rnd = mulberry32(seed);
    /* 注意：先消耗固定序列，保证同输入下的随机数列完全一致 */
    var jitter = [];
    for (i = 0; i < 64; i++) jitter.push(rnd());

    var pressN = clamp(((f.pressRatio || 1) - 1) / 3, 0, 1);
    var speedN = clamp((f.avgSpeed || 0) / 900, 0, 1);
    var turnN = clamp((f.turnAngle || 0) / 90, 0, 1);
    var entN = clamp(f.rhythmEntropy || 0, 0, 1);
    var dwellN = clamp((f.dwellTotal || 0) / 700, 0, 1);
    var entryN = clamp(f.entryShape || 0, 0, 1);
    var stabN = clamp(f.midStability || 0, 0, 1);

    /* 事件数：由节奏熵与速度方差共同决定（8–24 个） */
    var count = Math.round(8 + entN * 12 + clamp((f.speedVar || 0) / 0.35, 0, 1) * 4);
    count = clamp(count, 8, 24);

    /* 步长：行笔越快，音点越密 */
    var baseStep = clamp(760 - speedN * 440, 300, 760);

    var events = [];
    var tAcc = 0;
    for (i = 0; i < count; i++) {
      var r1 = jitter[i % 64];
      var r2 = jitter[(i * 7 + 3) % 64];
      var r3 = jitter[(i * 13 + 5) % 64];
      var pos = count > 1 ? i / (count - 1) : 0;         // 0..1 在笔画中的相对位置
      /* 速度包络：中段快、起收慢（与真实笔迹速度曲线的形状一致） */
      var arc = Math.sin(Math.PI * Math.pow(pos, 0.85));
      var localSpeed = clamp(0.22 + 0.78 * arc + (r1 - 0.5) * (0.28 + 0.3 * entN), 0, 1);
      /* 音高：速度 → 音级（五声音阶两级八度） */
      var lvl = Math.round(localSpeed * 9 + (entryN - 0.5) * 2 + (r2 - 0.5) * 1.2);
      lvl = clamp(lvl, 0, 9);
      var oct = Math.floor(lvl / 5), degIdx = lvl % 5;
      var semi = PENTA[degIdx] + oct * 12;
      var freq = round(BASE_D * Math.pow(2, semi / 12), 3);
      /* 音量：提按比 + 驻笔 */
      var gain = round(clamp(0.075 + pressN * 0.20 + dwellN * 0.05 + (r3 - 0.5) * 0.035, 0.03, 0.34), 4);
      /* 时值：驻笔与中段稳定性影响音的延续 */
      var dur = round(baseStep * (0.55 + T.decay * 0.42) * (0.72 + dwellN * 0.7 + stabN * 0.28), 1);
      /* 谐波：转折角 → 高次谐波增益（音色亮度） */
      var bright = 0.42 + turnN * 1.5;
      var harm = T.harm.map(function (h, idx) {
        if (idx === 0) return round(h, 3);
        return round(h * (0.55 + bright * 0.75) / (1 + idx * 0.06), 3);
      });
      events.push({
        t: Math.round(tAcc),
        dur: dur,
        freq: freq,
        gain: gain,
        harm: harm,
        degree: lvl,
        vel: round(localSpeed, 3),
        pan: round(clamp((f.endDirection || 0) / 360 - 0.5 + (r3 - 0.5) * 0.4, -0.8, 0.8), 3),
        timbre: T.id
      });
      /* 下一个音点的间隔：受节奏熵扰动 */
      var stepVar = baseStep * (0.72 + (r2) * (0.2 + 0.55 * entN));
      if (dwellN > 0.4 && i === Math.floor(count * 0.42)) stepVar += dwellN * 320;   // 驻笔造成明显延宕
      if (turnN > 0.45 && i % 3 === 1) stepVar *= 0.72;                              // 转折处音点加密
      tAcc += Math.max(90, stepVar);
    }

    var total = Math.round(tAcc);
    return {
      timbre: T.id,
      timbre_zh: T.zh,
      timbre_en: T.en,
      seed: seed,
      count: events.length,
      durationMs: total,
      events: events,
      meta: {
        pressN: round(pressN, 3), speedN: round(speedN, 3), turnN: round(turnN, 3),
        entN: round(entN, 3), dwellN: round(dwellN, 3), entryN: round(entryN, 3), stabN: round(stabN, 3),
        baseStep: Math.round(baseStep), sampleRate: opts.sampleRate || 0
      }
    };
  }

  /* 若提供真实笔画的速度序列，则据此生成"由你自己的笔法驱动"的发音序列，
     仍然完全确定（无随机源，只依赖输入序列）。 */
  function sonifyFromStroke(features, timbre, opts) {
    opts = opts || {};
    var base = sonify(features, timbre, opts);
    var speeds = features && features.speeds;
    if (!speeds || speeds.length < 8) return base;
    var maxEv = 28;
    var bucketCount = Math.min(maxEv, Math.max(8, Math.round(speeds.length / 6)));
    var evs = [];
    var vMax = 1e-6, i;
    for (i = 0; i < speeds.length; i++) if (speeds[i] > vMax) vMax = speeds[i];
    var T = TIMBRES[0];
    for (i = 0; i < TIMBRES.length; i++) if (TIMBRES[i].id === base.timbre) T = TIMBRES[i];
    for (i = 0; i < bucketCount; i++) {
      var a = Math.floor(i * speeds.length / bucketCount);
      var b = Math.max(a + 1, Math.floor((i + 1) * speeds.length / bucketCount));
      var seg = speeds.slice(a, b);
      var vAvg = mean(seg);
      var localSpeed = clamp(vAvg / vMax, 0, 1);
      var lvl = clamp(Math.round(localSpeed * 9), 0, 9);
      var semi = PENTA[lvl % 5] + Math.floor(lvl / 5) * 12;
      var src = base.events[Math.min(base.events.length - 1, Math.round(i * base.events.length / bucketCount))];
      evs.push({
        t: Math.round(a * CFG.dt),
        dur: round(Math.max(120, src.dur * (0.7 + localSpeed * 0.7)), 1),
        freq: round(BASE_D * Math.pow(2, semi / 12), 3),
        gain: round(clamp(src.gain * (0.7 + localSpeed * 0.8), 0.03, 0.34), 4),
        harm: src.harm,
        degree: lvl,
        vel: round(localSpeed, 3),
        pan: src.pan,
        timbre: T.id
      });
    }
    return {
      timbre: base.timbre, timbre_zh: base.timbre_zh, timbre_en: base.timbre_en,
      seed: base.seed, count: evs.length,
      durationMs: Math.round(speeds.length * CFG.dt),
      events: evs, meta: base.meta, drivenByStroke: true
    };
  }

  /* ==========================================================================
     4b · 八体 A/B 对照试听 —— 同一根线条，两种性格
     --------------------------------------------------------------------------
     为什么需要它：「不认识汉字的人也能听出欧体峭拔与颜体沉厚」这句话，只靠
     "听自己写的那一笔"是**验证不了**的——用户听到的永远是自己那一笔 + 自己
     选的一档档案，没有对照物。这里把两档书体档案并排放：同一条参照线、同一
     音色、同一时长窗口，各播 3–5 秒（AB_TARGET_MS = 4000 ms）。
     确定性怎么保证：
       · 音序 = sonify(profile.feature, timbre)，仍然走 §4 那条管线，种子来自
         "量化后的十维特征 + 音色"，不含 Math.random / Date / 音频文件；
       · 唯一的新增步骤是"等比重定时长"：每个事件的 t 与 dur 同乘 k =
         target/natural，再对 t 做严格递增钳制（四舍五入可能撞点）。音高、
         力度、谐波一律不改，所以 A/B 的性格差**全部**来自两份档案本身。
       · 两侧压到同一时长，是为了去掉"谁的音更密"这个速度混淆项，让听者比
         的是音高走向 / 力度包络 / 谐波亮度。
     ========================================================================== */
  var AB_TARGET_MS = 4000;

  /* 三组预置对照（欧/颜：峭拔 vs 沉厚；颜/柳：沉厚 vs 瘦硬；
     曹全/张迁：秀逸 vs 方整）。用户也可以在下拉里任选 8 档中的任意两档。 */
  var AB_PAIRS = [
    { a: 'ou', b: 'yan', zh: '欧 / 颜', en: 'Ou / Yan' },
    { a: 'yan', b: 'liu', zh: '颜 / 柳', en: 'Yan / Liu' },
    { a: 'caoquan', b: 'zhangqian', zh: '曹全 / 张迁', en: 'Cao Quan / Zhang Qian' }
  ];

  function fitScore(score, targetMs) {
    if (!score || !score.events || !score.events.length) return score;
    var target = clamp(targetMs || AB_TARGET_MS, 1000, 20000);
    var natural = score.durationMs > 0 ? score.durationMs : target;
    var k = target / natural;
    var minGap = Math.max(1, Math.round(45 * k));
    var prev = -1, evs = [];
    for (var i = 0; i < score.events.length; i++) {
      var ev = score.events[i];
      var tt = Math.round(ev.t * k);
      if (tt <= prev) tt = prev + minGap;
      prev = tt;
      evs.push({
        t: tt, dur: Math.max(40, Math.round(ev.dur * k)),
        freq: ev.freq, gain: ev.gain, harm: ev.harm, degree: ev.degree,
        vel: ev.vel, pan: ev.pan, timbre: ev.timbre
      });
    }
    return {
      timbre: score.timbre, timbre_zh: score.timbre_zh, timbre_en: score.timbre_en,
      seed: score.seed, count: evs.length, durationMs: target,
      events: evs, meta: score.meta,
      naturalMs: natural, refitK: round(k, 3), ab: true
    };
  }

  /* 由一档书体档案生成 A/B 音序（同输入 → 逐字段同输出） */
  function abTone(styleId, timbre, targetMs) {
    var st = getStyle(styleId);
    if (!st) return null;
    var base = sonify(st.feature, timbre || 'guqin');
    if (!base) return null;
    return fitScore(base, targetMs || AB_TARGET_MS);
  }

  /* ==========================================================================
     5 · 笔法重演 —— 由书体特征向量时间参数化生成书写动画
     --------------------------------------------------------------------------
     不是贴图、不是预录动画：从归一化骨架点列出发，按该书体的结构参数
     （粗细 / 提按幅度 / 转折柔度 / 收笔外扩 / 中宫 / 欹侧 / 波势）重建
     轨迹与粗细，再按速度包络反解每个采样点的时刻 ⇒ 得到带时间戳的重演序列。
     ========================================================================== */
  function glyphData() { return root.MOJI_GLYPHS || { YONG_STROKES: [] }; }
  function steleData() { return root.MOJI_STELES || { STYLES: [], STELES: [] }; }

  function getStroke(id) {
    var arr = glyphData().YONG_STROKES || [];
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }
  function getStyle(id) {
    var arr = steleData().STYLES || [];
    for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
    return null;
  }

  /* 单调三次插值（Catmull-Rom 转 Hermite），用于把折线骨架变成圆顺轨迹 */
  function smoothPolyline(pts, samples) {
    if (pts.length < 2) return pts.slice();
    samples = samples || 8;
    var P = [pts[0]].concat(pts, [pts[pts.length - 1]]);
    var out = [];
    for (var i = 1; i < P.length - 2; i++) {
      var p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
      for (var s = 0; s < samples; s++) {
        var t = s / samples, t2 = t * t, t3 = t2 * t;
        out.push({
          x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
          y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
        });
      }
    }
    out.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
    return out;
  }

  /* 把单个笔画按书体结构参数变形（坐标均归一化 0–1，返回像素坐标） */
  function deformStroke(stroke, struct, boxW, boxH, opts) {
    opts = opts || {};
    var sp = smoothPolyline(stroke.skeleton.map(function (p) { return { x: p[0], y: p[1] }; }), 9);
    var sl = rad(struct.slant || 0) * (opts.slantScale == null ? 1 : opts.slantScale);
    var tight = 1 + ((struct.tight || 1) - 1) * (opts.tightScale == null ? 1 : opts.tightScale);
    var axis = stroke.axis;
    var wave = struct.wave || 0;
    var soft = struct.turnSoft || 0;
    var i, p, out = [];
    for (i = 0; i < sp.length; i++) {
      p = { x: sp[i].x, y: sp[i].y };
      /* 中宫收紧 / 舒展：以字心为原点缩放 */
      var cx = 0.5, cy = 0.5;
      p.x = cx + (p.x - cx) * tight;
      p.y = cy + (p.y - cy) * (2 - tight) * 0.5 + (p.y - cy) * 0.5;
      /* 欹侧：绕字心旋转 */
      var ca = Math.cos(sl), sa = Math.sin(sl);
      var rx = p.x - cx, ry = p.y - cy;
      p.x = cx + rx * ca - ry * sa;
      p.y = cy + rx * sa + ry * ca;
      /* 横势波势：横画与提画的中段起伏 */
      if (axis === 'h' || (axis === 'curve' && stroke.ord === 5)) {
        var ph = (sp[i].x - sp[Math.floor(sp.length / 2)].x);
        p.y += Math.sin((sp[i].x - 0.2) * Math.PI) * wave * 0.05;
      }
      /* 转折柔度：向平滑后的位置插值，soft 越大越圆（此处用弧长加权回拉） */
      if (soft > 0 && i > 1 && i < sp.length - 2) {
        var mx = (sp[i - 1].x + sp[i + 1].x) / 2, my = (sp[i - 1].y + sp[i + 1].y) / 2;
        p.x += (mx - p.x) * soft * 0.55;
        p.y += (my - p.y) * soft * 0.55;
      }
      out.push({ x: p.x * boxW, y: p.y * boxH });
    }
    /* 收笔外扩（燕尾 / 出锋） */
    if ((struct.flare || 0) > 0 && stroke.tail < 0.3) {
      var last = out[out.length - 1], prev = out[out.length - 2];
      var dx = last.x - prev.x, dy = last.y - prev.y, L = hypot(dx, dy) || 1;
      var fl = (struct.flare || 0) * 9;
      last.x += dx / L * fl; last.y += dy / L * fl;
    }
    /* 起笔方式：方切加一小段横向切锋；藏圆加一小段反向回锋 */
    var head = out[0], nx = out[1];
    var hdx = nx.x - head.x, hdy = nx.y - head.y, HL = hypot(hdx, hdy) || 1;
    if (struct.entry === 'square') {
      var cut = 5.5 * (opts.headScale == null ? 1 : opts.headScale);
      out.unshift({ x: head.x - hdy / HL * cut, y: head.y + hdx / HL * cut });
    } else if (struct.entry === 'round') {
      var rev = 4.2 * (opts.headScale == null ? 1 : opts.headScale);
      out.unshift({ x: head.x - hdx / HL * rev, y: head.y - hdy / HL * rev });
    }
    return out;
  }

  /* 依骨架与提按权重生成随时间变化的笔道宽度（像素）
     base = weight/1000 × 画布短边（书体档案中的 weight 是"千分比"）
     提按幅度 lift 只调制"最粗处"，最细处保持 base×0.6，避免笔画互相吞并。 */
  function widthProfile(stroke, struct, ptsLen, boxRef, opts) {
    opts = opts || {};
    var wScale = opts.widthScale == null ? 1 : opts.widthScale;
    var lScale = opts.liftScale == null ? 1 : opts.liftScale;
    var base = (struct.weight || 40) / 1000 * boxRef * wScale;
    var lift = (struct.lift == null ? 1.2 : struct.lift) * lScale;
    var srcPress = stroke.press;
    var out = new Array(ptsLen);
    for (var i = 0; i < ptsLen; i++) {
      var u = ptsLen > 1 ? i / (ptsLen - 1) : 0;
      var fi = u * (srcPress.length - 1);
      var i0 = Math.floor(fi), i1 = Math.min(srcPress.length - 1, i0 + 1);
      var frac = fi - i0;
      var pr = srcPress[i0] * (1 - frac) + srcPress[i1] * frac;
      var shaped = 0.35 + 0.65 * Math.pow(pr, 0.85);
      var t = clamp((shaped - 0.35) / 0.65, 0, 1);      /* 0 细 → 1 粗 */
      var k = 0.60 + 0.72 * t * (0.72 + 0.28 * lift);
      /* 起笔与收笔锋型 */
      if (u < 0.06) k *= 0.62 + 0.38 * (u / 0.06) * (0.5 + stroke.head * 0.5);
      if (u > 0.92) k *= 1 - (u - 0.92) / 0.08 * (1 - stroke.tail) * 0.6;
      out[i] = Math.max(0.8, base * k);
    }
    return out;
  }

  function buildReplay(styleId, strokeId, opts) {
    opts = opts || {};
    var st = getStyle(styleId) || (steleData().STYLES || [])[0];
    var sk = getStroke(strokeId) || (glyphData().YONG_STROKES || [])[0];
    if (!st || !sk) return null;
    var boxW = opts.boxW || 480, boxH = opts.boxH || 480;
    var pts = deformStroke(sk, st.struct, boxW, boxH, opts);
    var widths = widthProfile(sk, st.struct, pts.length, Math.min(boxW, boxH));
    /* 速度包络：起笔慢 → 中段最快 → 收笔慢；swing 决定摆动幅度 */
    var n = pts.length, i;
    var tempo = st.struct.tempo || 450;
    var swing = st.struct.swing == null ? 0.4 : st.struct.swing;
    var dwell = st.struct.dwell == null ? 0.6 : st.struct.dwell;
    var speed = new Array(n), sArr = new Array(n), tArr = new Array(n);
    var acc = 0;
    sArr[0] = 0;
    for (i = 1; i < n; i++) { acc += hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); sArr[i] = acc; }
    var totalLen = acc || 1;
    for (i = 0; i < n; i++) {
      var u = sArr[i] / totalLen;
      var env = 0.30 + 0.70 * Math.sin(Math.PI * Math.pow(u, 0.9));
      var osc = 1 + swing * 0.34 * Math.sin(u * Math.PI * 4.0);
      var dwellSlow = dwell * 0.7 * (Math.exp(-Math.pow(u / 0.09, 2)) + Math.exp(-Math.pow((1 - u) / 0.09, 2)));
      speed[i] = Math.max(24, tempo * env * osc * (1 - 0.55 * dwellSlow));
    }
    tArr[0] = 0;
    for (i = 1; i < n; i++) {
      var ds = sArr[i] - sArr[i - 1];
      var vAvg = (speed[i] + speed[i - 1]) / 2 || 1;
      tArr[i] = tArr[i - 1] + ds / vAvg * 1000;
    }
    var frames = [];
    for (i = 0; i < n; i++) {
      frames.push({
        x: round(pts[i].x, 2), y: round(pts[i].y, 2),
        w: round(widths[i], 2), t: Math.round(tArr[i]),
        v: Math.round(speed[i]), s: round(sArr[i], 2),
        press: round(sk.press[Math.min(sk.press.length - 1, Math.round(i / (n - 1) * (sk.press.length - 1)))], 3)
      });
    }
    return {
      styleId: st.id, style_zh: st.zh, style_en: st.en,
      strokeId: sk.id, stroke_zh: sk.zh, stroke_en: sk.en,
      duration: Math.round(tArr[n - 1]),
      length: round(totalLen, 1),
      frames: frames,
      skeleton: sk.skeleton.map(function (p) { return { x: p[0] * boxW, y: p[1] * boxH }; }),
      widthPx: Math.min(boxW, boxH),
      stroke: sk, struct: st.struct
    };
  }

  /* 以八笔拼合"永"字（用于碑帖廊）：返回可直接绘制/轮廓化的笔道数组
     碑帖小字格的笔画不宜互相吞并，故略收窄基准宽度并压低提按幅度。 */
  function buildGlyph(struct, boxW, boxH) {
    var order = glyphData().YONG_COMPOSE || [];
    var out = [];
    for (var i = 0; i < order.length; i++) {
      var sk = getStroke(order[i]);
      if (!sk) continue;
      var pts = deformStroke(sk, struct, boxW, boxH, { tightScale: 1, slantScale: 1 });
      var w = widthProfile(sk, struct, pts.length, Math.min(boxW, boxH),
        { widthScale: 0.92, liftScale: 0.72 });
      out.push({ id: sk.id, zh: sk.zh, en: sk.en, pts: pts, widths: w, axis: sk.axis });
    }
    return out;
  }

  /* 由中心线与宽度序列生成闭合轮廓路径（用于"字形轮廓"模式） */
  function outlinePathD(pts, widths) {
    if (!pts || pts.length < 2) return '';
    var L = [], R = [], i;
    for (i = 0; i < pts.length; i++) {
      var i0 = Math.max(0, i - 1), i1 = Math.min(pts.length - 1, i + 1);
      var dx = pts[i1].x - pts[i0].x, dy = pts[i1].y - pts[i0].y;
      var len = hypot(dx, dy) || 1;
      var nx = -dy / len, ny = dx / len;
      var half = (widths[i] || 1) / 2;
      L.push({ x: pts[i].x + nx * half, y: pts[i].y + ny * half });
      R.push({ x: pts[i].x - nx * half, y: pts[i].y - ny * half });
    }
    var d = 'M' + round(L[0].x, 1) + ' ' + round(L[0].y, 1);
    for (i = 1; i < L.length; i++) d += 'L' + round(L[i].x, 1) + ' ' + round(L[i].y, 1);
    for (i = R.length - 1; i >= 0; i--) d += 'L' + round(R[i].x, 1) + ' ' + round(R[i].y, 1);
    return d + 'Z';
  }
  function centerlinePathD(pts) {
    if (!pts || !pts.length) return '';
    var d = 'M' + round(pts[0].x, 1) + ' ' + round(pts[0].y, 1);
    for (var i = 1; i < pts.length; i++) d += 'L' + round(pts[i].x, 1) + ' ' + round(pts[i].y, 1);
    return d;
  }

  /* ==========================================================================
     6 · 浏览器侧：渲染工具
     ========================================================================== */
  var API = {
    VERSION: VERSION,
    CFG: CFG,
    FEATURE_KEYS: FEATURE_KEYS,
    TIMBRES: TIMBRES,
    resampleStroke: resampleStroke,
    extractFeatures: extractFeatures,
    matchStyle: matchStyle,
    sonify: sonify,
    sonifyFromStroke: sonifyFromStroke,
    AB_PAIRS: AB_PAIRS,
    AB_TARGET_MS: AB_TARGET_MS,
    abTone: abTone,
    fitScore: fitScore,
    buildReplay: buildReplay,
    buildGlyph: buildGlyph,
    outlinePathD: outlinePathD,
    centerlinePathD: centerlinePathD,
    smoothPolyline: smoothPolyline,
    measureDwell: measureDwell,
    inkProfile: inkProfile,
    strokeGeometry: strokeGeometry,
    taperAt: taperAt,
    PRESS: PRESS,
    axisFold: axisFold,
    featureVector: featureVector,
    explainMatch: explainMatch,
    _internals: { fnv1a: fnv1a, mulberry32: mulberry32, wrapPi: wrapPi, norm360: norm360, mean: mean, stdev: stdev, median: median }
  };

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    /* Node：只导出纯函数，跳过全部 DOM 逻辑 */
    return API;
  }

  /* ==========================================================================
     7 · 界面层
     ========================================================================== */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVGNS = 'http://www.w3.org/2000/svg';

  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    if (attrs) for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  var ST = {
    lang: 'zh',
    reduceMotion: false,
    strokes: [],          // 已完成的笔迹（原始点）
    current: null,        // 正在写的笔迹
    features: null,
    match: null,
    lockedFeature: null,  // 面板当前展示的特征
    hoverIndex: -1,
    brushSize: 18,
    showGrid: false,
    kbdMode: false,
    kbdPos: null,
    kbdDown: false,
    replay: null,
    replayTimer: 0,
    replayPlaying: false,
    replayT: 0,
    replaySpeed: 1,
    replayShowSkeleton: true,
    timbre: 'guqin',
    audioOn: false,
    galleryMode: 'bone',
    lastSonify: null,
    abA: null,
    abB: null
  };

  function L() { return ST.lang; }
  function t(zh, en) { return ST.lang === 'zh' ? zh : en; }
  function metaOf(key) {
    var M = steleData().FEATURE_META || [];
    for (var i = 0; i < M.length; i++) if (M[i].key === key) return M[i];
    return { key: key, zh: key, en: key, unit: '', scale: 1, w: 1 };
  }

  /* ---------- 语言 / 动效 ---------- */
  function setLang(l) {
    ST.lang = l;
    document.body.setAttribute('data-lang', l);
    document.documentElement.setAttribute('lang', l === 'zh' ? 'zh-CN' : 'en');
    var b = $('#langBtn');
    if (b) { b.textContent = l === 'zh' ? 'EN' : '中文'; b.setAttribute('aria-label', l === 'zh' ? 'Switch to English' : '切换到中文'); }
    var pb = $('#presentLang');
    if (pb) pb.textContent = l === 'zh' ? 'EN' : '中文';
    renderFeatures();
    renderMatch();
    renderTerms();
    renderGallery();
    renderReplayInfo();
    renderNoteLog();
    renderStelesNote();
    refreshABOptions();
    syncAB();
    if (PM.on) { PM.lastAnn = ''; pmRender(); }   /* 演示模式指示条跟随语言 */
    announce(t('界面语言已切换为中文', 'Interface language switched to English'));
  }

  function setReduceMotion(on) {
    ST.reduceMotion = on;
    document.body.classList.toggle('reduce-motion', on);
    document.documentElement.classList.toggle('reduce-motion', on);
    var b = $('#motionBtn');
    if (b) b.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function announce(msg) {
    var live = $('#liveStatus');
    if (live) live.textContent = msg;
  }

  /* ---------- 纸张质感（程序生成，无外部图片） ---------- */
  function makePaper(w, h, dpr) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w * dpr));
    c.height = Math.max(1, Math.round(h * dpr));
    var g = c.getContext('2d');
    g.scale(dpr, dpr);
    /* 底色 */
    g.fillStyle = '#f4f0e6';
    g.fillRect(0, 0, w, h);
    /* 纤维：低对比的细长条纹 */
    var seed = 20261106, rnd = mulberry32(seed);
    g.save();
    for (var i = 0; i < 260; i++) {
      var x = rnd() * w, y = rnd() * h, len = 12 + rnd() * 90, ang = (rnd() - 0.5) * 0.9;
      g.strokeStyle = 'rgba(120,104,80,' + (0.02 + rnd() * 0.045).toFixed(3) + ')';
      g.lineWidth = 0.5 + rnd() * 1.1;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(ang) * len * 0.5 + (rnd() - 0.5) * 6,
        y + Math.sin(ang) * len * 0.5 + (rnd() - 0.5) * 6,
        x + Math.cos(ang) * len, y + Math.sin(ang) * len);
      g.stroke();
    }
    /* 纸浆斑驳：轻微径向明暗 */
    for (i = 0; i < 34; i++) {
      var cx = rnd() * w, cy = rnd() * h, r = 40 + rnd() * 150;
      var grd = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      var a = 0.012 + rnd() * 0.022;
      grd.addColorStop(0, 'rgba(150,132,104,' + a.toFixed(3) + ')');
      grd.addColorStop(1, 'rgba(150,132,104,0)');
      g.fillStyle = grd;
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
    }
    g.restore();
    /* 四边微暗（装裱感） */
    var vg = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.78);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(90,78,58,0.10)');
    g.fillStyle = vg; g.fillRect(0, 0, w, h);
    return c;
  }

  function drawGrid(g, w, h) {
    g.save();
    g.strokeStyle = 'rgba(158,43,37,0.16)';
    g.lineWidth = 1;
    g.setLineDash([5, 5]);
    /* 米字格 */
    var cols = 2, rows = 2, cw = w / cols, ch = h / rows;
    for (var i = 1; i < cols; i++) { g.beginPath(); g.moveTo(i * cw, 0); g.lineTo(i * cw, h); g.stroke(); }
    for (var j = 1; j < rows; j++) { g.beginPath(); g.moveTo(0, j * ch); g.lineTo(w, j * ch); g.stroke(); }
    g.setLineDash([2, 6]);
    g.strokeStyle = 'rgba(158,43,37,0.10)';
    for (i = 0; i < cols; i++) for (j = 0; j < rows; j++) {
      g.beginPath();
      g.moveTo(i * cw, j * ch); g.lineTo((i + 1) * cw, (j + 1) * ch);
      g.moveTo((i + 1) * cw, j * ch); g.lineTo(i * cw, (j + 1) * ch);
      g.stroke();
    }
    g.restore();
  }

  /* ---------- 毛笔渲染：变宽笔道 + 墨量/飞白模型 ----------
     模型由三部分组成：
       ① 笔道宽度 W = size × PRESS.W_MID × inkProfile(pts).w
          —— 与"提按比"、"提按剖面图"完全同一套几何（§2.0），不再有第二套
          上限；肌肉可测的慢/重 → 粗，快/提 → 细，有真实压感则直接用笔压。
       ② 边缘毛糙：半宽乘以由点序号哈希出的确定性抖动，模拟笔毫参差
       ③ 飞白：速度高时以 destination-out 在笔道上打出细长空洞（露出纸色）
     因此"快则细、有飞白；慢则粗、墨浓"是可复算的几何结果，不是滤镜。 */
  function h32(n) {
    n = (n ^ 61) ^ (n >>> 16);
    n = (n + (n << 3)) | 0;
    n = n ^ (n >>> 4);
    n = Math.imul(n, 0x27d4eb2d);
    n = n ^ (n >>> 15);
    return (n >>> 0) / 4294967296;
  }

  function strokeGeometry(pts, size) {
    var n = pts.length, i;
    var ink = inkProfile(pts);
    var W = new Array(n), Wn = new Array(n), TH = new Array(n), NX = new Array(n), NY = new Array(n);
    for (i = 0; i < n; i++) {
      /* 唯一宽度来源：骨架层（提按）× 锋形层（起收锋），见 §2.0 */
      W[i] = Math.max(0.85, size * PRESS.W_MID * ink.w[i]);
      Wn[i] = ink.vn[i];
      var i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
      var dx = pts[i1].x - pts[i0].x, dy = pts[i1].y - pts[i0].y, len = hypot(dx, dy) || 1;
      TH[i] = Math.atan2(dy, dx);
      NX[i] = -dy / len; NY[i] = dx / len;
    }
    return { W: W, Wn: Wn, TH: TH, NX: NX, NY: NY, vmax: ink.vmax, ink: ink };
  }

  function renderStroke(g, pts, size, seedBase) {
    if (!pts || pts.length < 2) return;
    var G = strokeGeometry(pts, size);
    var n = pts.length, i;
    var seed = seedBase == null ? (pts.length * 2654435761) >>> 0 : seedBase;

    /* ① 变宽笔道（左右偏移多边形） */
    var Lx = new Array(n), Ly = new Array(n), Rx = new Array(n), Ry = new Array(n);
    for (i = 0; i < n; i++) {
      var wob = 0.90 + 0.20 * h32(seed + i * 131);
      var half = G.W[i] * 0.5 * wob;
      Lx[i] = pts[i].x + G.NX[i] * half; Ly[i] = pts[i].y + G.NY[i] * half;
      Rx[i] = pts[i].x - G.NX[i] * half; Ry[i] = pts[i].y - G.NY[i] * half;
    }
    g.save();
    g.beginPath();
    g.moveTo(Lx[0], Ly[0]);
    for (i = 1; i < n; i++) g.lineTo(Lx[i], Ly[i]);
    for (i = n - 1; i >= 0; i--) g.lineTo(Rx[i], Ry[i]);
    g.closePath();
    g.fillStyle = 'rgba(20,17,15,0.90)';
    g.fill();

    /* ② 中锋骨干：略窄的一层更深的墨，让线条有"心" */
    g.beginPath();
    g.moveTo(pts[0].x + G.NX[0] * G.W[0] * 0.10, pts[0].y + G.NY[0] * G.W[0] * 0.10);
    for (i = 1; i < n; i++) {
      var off = G.W[i] * 0.10 * (h32(seed + i * 37) - 0.5) * 2;
      g.lineTo(pts[i].x + G.NX[i] * off, pts[i].y + G.NY[i] * off);
    }
    g.strokeStyle = 'rgba(16,13,11,0.55)';
    g.lineWidth = Math.max(0.8, size * 0.34);
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.stroke();

    /* ③ 飞白：高速处沿笔道打出一串断续细缝（露出纸色）。
       两条硬约束，否则会把高速段整段掏空、只剩轮廓线（看起来像线框）：
         · 缝宽 ≤ 局部笔宽的 34%，横向偏移 ≤ ±0.26 笔宽 → 两侧始终留下墨边；
         · 相邻缝的沿笔道间距（step）大于缝长（gap）→ 缝不重叠，成"白丝"状。 */
    if (G.vmax > 90) {
      g.globalCompositeOperation = 'destination-out';
      g.lineCap = 'round';
      var step = Math.max(2, Math.round(n / 45));
      for (i = step; i < n - step; i += step) {
        var vn = G.Wn[i];
        if (vn < 0.48) continue;
        var strength = (vn - 0.48) / 0.52;
        var tries = 1 + Math.round(strength * 1.5);
        for (var k = 0; k < tries; k++) {
          var r1 = h32(seed + i * 977 + k * 31);
          if (r1 > 0.22 + strength * 0.42) continue;
          var lat = (h32(seed + i * 613 + k * 17) - 0.5) * G.W[i] * 0.52;
          var gap = 1 + Math.round(h32(seed + i * 29 + k) * 1.6);
          var j0 = Math.max(0, i - (gap >> 1)), j1 = Math.min(n - 1, j0 + gap);
          g.beginPath();
          g.moveTo(pts[j0].x + G.NX[j0] * lat, pts[j0].y + G.NY[j0] * lat);
          for (var q = j0 + 1; q <= j1; q++) {
            var latq = lat * (0.85 + 0.3 * h32(seed + q * 7));
            g.lineTo(pts[q].x + G.NX[q] * latq, pts[q].y + G.NY[q] * latq);
          }
          g.strokeStyle = 'rgba(0,0,0,' + (0.30 + 0.40 * strength).toFixed(3) + ')';
          g.lineWidth = Math.min(0.6 + h32(seed + i * 53 + k) * 1.5, Math.max(0.5, G.W[i] * 0.34));
          g.stroke();
        }
      }
    }
    g.restore();
  }

  /* ---------- 书写台 ---------- */
  var padCanvas, padCtx, paperC, inkC, inkCtx, scratchC, scratchCtx, padW = 0, padH = 0, padDPR = 1;

  function initPad() {
    padCanvas = $('#pad');
    if (!padCanvas) return;
    padCtx = padCanvas.getContext('2d');
    resizePad();
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { resizePad(); });
      ro.observe(padCanvas.parentElement || padCanvas);
    } else {
      window.addEventListener('resize', resizePad);
    }
    wirePadEvents();
    drawPad();
  }

  function resizePad() {
    var host = padCanvas.parentElement || padCanvas;
    var w = Math.max(320, Math.round(host.clientWidth));
    var ratio = padCanvas.getAttribute('data-aspect') || '1.28';
    var asp = parseFloat(ratio) || 1.28;
    var h = Math.round(w / asp);
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    if (w === padW && h === padH && dpr === padDPR && paperC) return;
    var sx = padW ? w / padW : 1, sy = padH ? h / padH : 1;
    padW = w; padH = h; padDPR = dpr;
    padCanvas.width = Math.round(w * dpr);
    padCanvas.height = Math.round(h * dpr);
    padCanvas.style.height = h + 'px';
    paperC = makePaper(w + 320, h + 320, dpr);
    inkC = document.createElement('canvas');
    inkC.width = padCanvas.width; inkC.height = padCanvas.height;
    inkCtx = inkC.getContext('2d');
    inkCtx.scale(dpr, dpr);
    /* 正在书写的一笔渲染在独立透明层上，飞白用 destination-out 挖空才安全 */
    scratchC = document.createElement('canvas');
    scratchC.width = padCanvas.width; scratchC.height = padCanvas.height;
    scratchCtx = scratchC.getContext('2d');
    scratchCtx.scale(dpr, dpr);
    /* 保留已写内容：按比例缩放点坐标后重烘焙 */
    if (sx !== 1 || sy !== 1) {
      ST.strokes.forEach(function (s) {
        s.forEach(function (p) { p.x *= sx; p.y *= sy; });
      });
    }
    bakeStrokes();
    drawPad();
  }

  function bakeStrokes() {
    if (!inkCtx) return;
    inkCtx.clearRect(0, 0, padW, padH);
    ST.strokes.forEach(function (s, idx) {
      renderStroke(inkCtx, s, ST.brushSize, ((idx + 1) * 2246822519) >>> 0);
    });
  }

  function drawPad(marker) {
    if (!padCtx) return;
    padCtx.setTransform(padDPR, 0, 0, padDPR, 0, 0);
    padCtx.clearRect(0, 0, padW, padH);
    /* 纸张（居中裁切，留出纤维边） */
    padCtx.drawImage(paperC, -160, -160, padW + 320, padH + 320);
    if (ST.showGrid) drawGrid(padCtx, padW, padH);
    /* 已烘焙笔迹 */
    padCtx.save();
    padCtx.setTransform(1, 0, 0, 1, 0, 0);
    padCtx.drawImage(inkC, 0, 0);
    padCtx.restore();
    /* 正在书写的一笔：先在透明层上成墨，再整层贴上来 */
    if (ST.current && ST.current.length > 1 && scratchCtx) {
      scratchCtx.clearRect(0, 0, padW, padH);
      renderStroke(scratchCtx, ST.current, ST.brushSize, 0x9E3779B9);
      padCtx.save();
      padCtx.setTransform(1, 0, 0, 1, 0, 0);
      padCtx.drawImage(scratchC, 0, 0);
      padCtx.restore();
    }
    /* 悬停 / 回放标记 */
    if (marker) drawMarker(padCtx, marker.x, marker.y, marker.label);
    /* 键盘笔尖 */
    if (ST.kbdMode && ST.kbdPos) {
      padCtx.save();
      padCtx.beginPath();
      padCtx.arc(ST.kbdPos.x, ST.kbdPos.y, ST.brushSize * 0.5, 0, Math.PI * 2);
      padCtx.strokeStyle = ST.kbdDown ? 'rgba(158,43,37,0.95)' : 'rgba(158,43,37,0.55)';
      padCtx.lineWidth = 1.4;
      padCtx.setLineDash(ST.kbdDown ? [] : [4, 4]);
      padCtx.stroke();
      padCtx.restore();
    }
  }

  function drawMarker(g, x, y, label) {
    g.save();
    g.beginPath();
    g.arc(x, y, 9, 0, Math.PI * 2);
    g.strokeStyle = 'rgba(158,43,37,0.9)';
    g.lineWidth = 1.6;
    g.stroke();
    g.beginPath();
    g.arc(x, y, 2.2, 0, Math.PI * 2);
    g.fillStyle = 'rgba(158,43,37,0.95)';
    g.fill();
    if (label) {
      g.font = '11px -apple-system,"Segoe UI","Noto Sans SC",sans-serif';
      g.fillStyle = 'rgba(158,43,37,0.95)';
      g.fillText(label, x + 13, y - 9);
    }
    g.restore();
  }

  /* 压力通道的来源与可信度（与 §2.0 的 pMax−pMin 判据配套）：
       · 数位笔 pointerType 'pen' → e.pressure 是真实笔压，直接用；
       · 鼠标 'mouse' → Pointer Events 规范规定按下时恒为 0.5，它不是压感，
         只是"按键已按下"的占位值。这里原样记 0.5，让 inkProfile 的压力
         分位差为 0，从而自动改走速度代理（不会产生伪提按）；
       · 触屏 'touch' → 多数设备无 force，同为 0.5；支持力度或手写笔的机
         型会给真实值，故按 pen 处理。
     这样"鼠标恒定 0.5"与"笔真实压在 0.5"不会混淆：前者没有动态范围。 */
  function pointerPressure(e) {
    var p = e && e.pressure, pt = e && e.pointerType;
    if (pt === 'mouse') return 0.5;
    if (isNum(p) && p > 0) return clamp(p, 0, 1);
    return 0.5;
  }

  function padPoint(e) {
    var r = padCanvas.getBoundingClientRect();
    return {
      x: e.clientX - r.left, y: e.clientY - r.top,
      t: performance.now(), p: pointerPressure(e)
    };
  }

  function wirePadEvents() {
    var drawing = false;
    padCanvas.addEventListener('pointerdown', function (e) {
      if (ST.kbdMode) return;
      if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
      e.preventDefault();
      padCanvas.setPointerCapture && padCanvas.setPointerCapture(e.pointerId);
      drawing = true;
      ST.current = [padPoint(e)];
      padCanvas.classList.add('drawing');
    });
    padCanvas.addEventListener('pointermove', function (e) {
      if (!drawing || !ST.current) return;
      e.preventDefault();
      var p = padPoint(e);
      var last = ST.current[ST.current.length - 1];
      /* 基于时间的采样：至少 4ms 间隔才记录，避免同帧堆积 */
      if (p.t - last.t < 4 && hypot(p.x - last.x, p.y - last.y) < 1.2) return;
      /* 合并事件中的历史点（高频笔） */
      var hist = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      if (hist && hist.length > 1) {
        for (var i = 0; i < hist.length; i++) {
          var r = padCanvas.getBoundingClientRect();
          ST.current.push({
            x: hist[i].clientX - r.left, y: hist[i].clientY - r.top,
            t: performance.now() - (hist.length - i) * 2,
            p: isNum(hist[i].pressure) && hist[i].pressure > 0
              ? clamp(hist[i].pressure, 0, 1) : p.p
          });
        }
      } else {
        ST.current.push(p);
      }
      drawPad();
    });
    var finish = function () {
      if (!drawing) return;
      drawing = false;
      padCanvas.classList.remove('drawing');
      if (ST.current && ST.current.length > 2) {
        ST.strokes.push(ST.current);
        ST.current = null;
        bakeStrokes();
        analyzeLatest();
      } else {
        ST.current = null;
      }
      drawPad();
    };
    padCanvas.addEventListener('pointerup', finish);
    padCanvas.addEventListener('pointercancel', finish);
    padCanvas.addEventListener('pointerleave', function () { if (drawing) finish(); });
    padCanvas.addEventListener('keydown', onPadKey);
    /* 悬停高亮 */
    padCanvas.addEventListener('pointermove', function (e) {
      if (drawing) return;
      /* 无操作时不重绘，避免抖动 */
    });
  }

  /* ---------- 键盘书写模式 ---------- */
  function onPadKey(e) {
    if (!ST.kbdMode) return;
    var step = e.shiftKey ? 24 : 8;
    var moved = false;
    if (!ST.kbdPos) ST.kbdPos = { x: padW / 2, y: padH / 2 };
    switch (e.key) {
      case 'ArrowLeft': ST.kbdPos.x -= step; moved = true; break;
      case 'ArrowRight': ST.kbdPos.x += step; moved = true; break;
      case 'ArrowUp': ST.kbdPos.y -= step; moved = true; break;
      case 'ArrowDown': ST.kbdPos.y += step; moved = true; break;
      case ' ':
      case 'Spacebar':
        e.preventDefault();
        ST.kbdDown = !ST.kbdDown;
        if (ST.kbdDown) {
          ST.current = [{ x: ST.kbdPos.x, y: ST.kbdPos.y, t: performance.now(), p: 0.62 }];
          announce(t('落笔，用方向键移动笔尖，再按空格收笔', 'Pen down. Move with arrow keys, press space to lift.'));
        } else if (ST.current && ST.current.length > 2) {
          ST.strokes.push(ST.current);
          ST.current = null;
          bakeStrokes();
          announce(t('已收笔，正在分析这一笔……', 'Pen up. Analysing the stroke…'));
          analyzeLatest();
        } else {
          ST.current = null;
          announce(t('这一笔太短，没有记录。', 'Too short to record.'));
        }
        drawPad();
        return;
      case 'Escape':
        if (ST.kbdDown) { ST.kbdDown = false; ST.current = null; drawPad(); }
        return;
      default: return;
    }
    if (moved) {
      e.preventDefault();
      ST.kbdPos.x = clamp(ST.kbdPos.x, 4, padW - 4);
      ST.kbdPos.y = clamp(ST.kbdPos.y, 4, padH - 4);
      if (ST.kbdDown && ST.current) {
        var last = ST.current[ST.current.length - 1];
        /* 键盘模式的时间由"按键次数"给出：每次移动 26ms，形成可复算的匀速笔迹 */
        ST.current.push({ x: ST.kbdPos.x, y: ST.kbdPos.y, t: last.t + 26, p: 0.62 });
      }
      drawPad();
    }
  }

  /* ---------- 分析最新一笔 ---------- */
  function analyzeLatest() {
    if (!ST.strokes.length) { ST.features = null; renderFeatures(); return; }
    var pts = ST.strokes[ST.strokes.length - 1];
    /* 速度必须折算到 "参考画布 1000 px"：书体档案里的行笔速度均值是在 1000
       px 见方的画布上标定的，写在小画布上时真实屏幕速度会同比偏小，不折算
       就无法与档案同量纲比较。折算系数 = 1000 / 画布短边。
       原始屏幕速度另存 avgSpeedRaw，界面单位与 aria 播报都如实标注"折算"。 */
    var refScale = CFG.refCanvas / Math.max(1, Math.min(padW, padH));
    ST.features = extractFeatures(pts, { speedScale: refScale });
    renderFeatures();
    var f = ST.features;
    var pressWay = f.pressSource === 'pressure'
      ? t('真实压感', 'real pen pressure')
      : t('速度代理', 'speed proxy');
    announce(t(
      '分析完成：速度均值 ' + Math.round(f.avgSpeed) + ' 像素每秒（折算到 1000 像素参考画布），提按比 '
        + f.pressRatio.toFixed(2) + '（' + pressWay + '），转折角 ' + f.turnAngle + ' 度，驻笔 '
        + f.dwellTotal + ' 毫秒。',
      'Analysed: mean speed ' + Math.round(f.avgSpeed) + ' px/s (normalised to a 1000 px reference canvas), press ratio '
        + f.pressRatio.toFixed(2) + ' (' + pressWay + '), turn ' + f.turnAngle + '°, dwell '
        + f.dwellTotal + ' ms.'
    ));
    if (ST.match) { ST.match = matchStyle(f); renderMatch(); }
  }

  /* 数值与单位分离渲染：数值只出数字，单位单独一行，避免"0.0°"下面再挂一个"°" */
  var FEAT_RENDERERS = {
    startAngle: function (v) { return v.toFixed(1); },
    entryShape: function (v) { return (v * 100).toFixed(0); },
    avgSpeed: function (v) { return Math.round(v).toString(); },
    speedVar: function (v) { return v.toFixed(3); },
    pressRatio: function (v) { return v.toFixed(2); },
    turnAngle: function (v) { return v.toFixed(1); },
    dwellTotal: function (v) { return Math.round(v).toString(); },
    rhythmEntropy: function (v) { return v.toFixed(3); },
    midStability: function (v) { return v.toFixed(3); },
    endDirection: function (v) { return v.toFixed(1); }
  };
  var UNIT_DISPLAY = {
    startAngle: '°', entryShape: '%', avgSpeed: 'px/s', speedVar: 'σ²/μ²',
    pressRatio: '×', turnAngle: '°', dwellTotal: 'ms',
    rhythmEntropy: '0–1', midStability: '0–1', endDirection: '°'
  };
  /* 单位行按语言与量纲生成；速度均值必须显式写明"折算到 1000 px 参考画布"，
     否则界面报出的数字（折算后）会与书写者手上的真实速度不符。 */
  function unitDisplay(key) {
    if (key === 'avgSpeed') return t('px/s · 折1000px画布', 'px/s · ref 1000px canvas');
    if (key === 'pressRatio') return t('× · 最宽/最窄', '× · widest/narrowest');
    return UNIT_DISPLAY[key] || metaOf(key).unit || '\u00a0';
  }
  function featTitle(key, f) {
    if (!f) return '';
    if (key === 'avgSpeed') {
      return t('屏幕实测 ' + Math.round(f.avgSpeedRaw) + ' px/s；按参考画布 1000 px 折算为 '
        + Math.round(f.avgSpeed) + ' px/s，与八书体档案同一量纲。',
        'Measured ' + Math.round(f.avgSpeedRaw) + ' px/s on screen; normalised to a 1000 px reference canvas = '
        + Math.round(f.avgSpeed) + ' px/s, the same scale as the style profiles.');
    }
    if (key === 'pressRatio') {
      return f.pressSource === 'pressure'
        ? t('有真实压感：提按比取自实际笔压（压力分位区间 ' + f.pressureBand[0] + '–' + f.pressureBand[1] + '）。',
          'Real pen pressure detected: press ratio comes from actual pressure (p05–p95 = '
          + f.pressureBand[0] + '–' + f.pressureBand[1] + ').')
        : t('无压感设备（鼠标压力恒 0.5）：提按比以行笔速度为代理，速度区间 '
          + f.speedBand[0] + '–' + f.speedBand[1] + ' px/s，慢则按、快则提。',
          'No pressure data (a mouse reports 0.5 throughout): the press ratio uses travel speed as a proxy over '
          + f.speedBand[0] + '–' + f.speedBand[1] + ' px/s — slow means pressed, fast means lifted.');
    }
    return '';
  }

  function renderFeatures() {
    var host = $('#featGrid');
    if (!host) return;
    host.innerHTML = '';
    var f = ST.features;
    var M = steleData().FEATURE_META || [];
    M.forEach(function (m) {
      var cell = el('div', 'feat');
      cell.setAttribute('data-key', m.key);
      cell.appendChild(el('div', 'feat-dt', t(m.zh, m.en)));
      var val = f ? FEAT_RENDERERS[m.key](f[m.key]) : '—';
      var v = el('div', 'feat-v', val);
      cell.appendChild(v);
      var note = featTitle(m.key, f);
      if (note) { cell.title = note; v.title = note; }
      cell.appendChild(el('div', 'feat-u', unitDisplay(m.key)));
      if (f) {
        var norm = (m.key === 'startAngle' || m.key === 'endDirection')
          ? axisFold(f[m.key]) : clamp(f[m.key] / (m.scale || 1), 0, 1);
        var bar = el('div', 'feat-bar');
        var fill = el('i');
        fill.style.width = Math.round(norm * 100) + '%';
        bar.appendChild(fill);
        cell.appendChild(bar);
      }
      host.appendChild(cell);
    });
    drawCharts();
    var hud = $('#padHud');
    if (hud) {
      hud.innerHTML = '';
      var items = [
        [t('笔画数', 'Strokes'), String(ST.strokes.length)],
        [t('采样点', 'Samples'), f ? String(f.sampleCount) : '0'],
        [t('时长', 'Duration'), f ? f.duration + ' ms' : '—'],
        [t('长度', 'Length'), f ? Math.round(f.length) + ' px' : '—']
      ];
      items.forEach(function (it) {
        var d = el('div', 'hud-item');
        d.appendChild(el('span', null, it[0]));
        d.appendChild(el('b', null, it[1]));
        hud.appendChild(d);
      });
    }
  }

  /* ---------- 图表：速度曲线 / 提按剖面 / 时间轴 ---------- */
  function chartGeom(svg) {
    var w = svg.clientWidth || 320, h = svg.clientHeight || 96;
    return { w: w, h: h, pad: 4 };
  }

  function drawCharts() {
    drawSpeedChart();
    drawPressChart();
    drawCurveChart();
    drawTurnNote();
  }

  function drawSpeedChart() {
    var svg = $('#speedChart');
    if (!svg) return;
    svg.innerHTML = '';
    var g = chartGeom(svg);
    var f = ST.features;
    svg.setAttribute('viewBox', '0 0 ' + g.w + ' ' + g.h);
    /* 背景 */
    svgEl('rect', { x: 0, y: 0, width: g.w, height: g.h, fill: 'rgba(20,17,15,0.03)' }, svg);
    if (!f || !f.speedSeries.length) {
      var tx = svgEl('text', { x: g.w / 2, y: g.h / 2 + 4, 'text-anchor': 'middle', fill: 'rgba(20,17,15,0.35)', 'font-size': 11 }, svg);
      tx.textContent = t('书写后显示速度曲线', 'Draw to see the speed curve');
      return;
    }
    var series = f.speedSeries;
    var n = series.length;
    var vMax = 0;
    series.forEach(function (s) { if (s.v > vMax) vMax = s.v; });
    vMax = Math.max(vMax, 1);
    var x0 = g.pad, x1 = g.w - g.pad, y0 = g.h - g.pad, y1 = g.pad + 6;
    var X = function (i) { return x0 + (x1 - x0) * (i / Math.max(1, n - 1)); };
    var Y = function (v) { return y0 - (y0 - y1) * clamp(v / vMax, 0, 1); };
    /* 驻笔区间阴影 */
    var t0 = series[0].t, t1 = series[n - 1].t, span = Math.max(1, t1 - t0);
    f.dwellRanges.forEach(function (r) {
      var a = (r.start - t0) / span, b = (r.end - t0) / span;
      if (b < 0 || a > 1) return;
      svgEl('rect', {
        x: x0 + (x1 - x0) * clamp(a, 0, 1), y: g.pad,
        width: Math.max(1.2, (x1 - x0) * (clamp(b, 0, 1) - clamp(a, 0, 1))),
        height: g.h - g.pad * 2, fill: 'rgba(158,43,37,0.13)'
      }, svg);
    });
    /* 折线 */
    var d = '';
    for (var i = 0; i < n; i++) d += (i ? 'L' : 'M') + round(X(i), 1) + ' ' + round(Y(series[i].v), 1);
    svgEl('path', { d: d, fill: 'none', stroke: '#14110f', 'stroke-width': 1.3, 'stroke-linejoin': 'round' }, svg);
    /* 转折点标注 */
    f.turns.slice(0, 12).forEach(function (tp) {
      var idx = tp.index;
      if (idx >= n) return;
      svgEl('circle', { cx: round(X(idx), 1), cy: round(Y(series[idx].v), 1), r: 2.1, fill: '#9e2b25' }, svg);
    });
    /* 悬停交互层 */
    var hit = svgEl('rect', { x: 0, y: 0, width: g.w, height: g.h, fill: 'transparent', style: 'cursor:crosshair' }, svg);
    var cursor = svgEl('line', { x1: 0, y1: 0, x2: 0, y2: g.h, stroke: 'rgba(158,43,37,0.8)', 'stroke-width': 1, 'stroke-dasharray': '3 3', opacity: 0 }, svg);
    var self = svg;
    hit.addEventListener('pointermove', function (ev) {
      var r = self.getBoundingClientRect();
      var u = clamp((ev.clientX - r.left - x0) / Math.max(1, x1 - x0), 0, 1);
      var idx = Math.round(u * (n - 1));
      cursor.setAttribute('x1', X(idx)); cursor.setAttribute('x2', X(idx));
      cursor.setAttribute('opacity', 1);
      highlightSample(idx);
    });
    hit.addEventListener('pointerleave', function () { cursor.setAttribute('opacity', 0); highlightSample(-1); });
  }

  var lastHighlight = -1;
  function highlightSample(idx) {
    lastHighlight = idx;
    var f = ST.features;
    if (!f || idx < 0 || idx >= f.samples.length) { drawPad(); return; }
    var s = f.samples[idx];
    drawPad({ x: s.x, y: s.y, label: Math.round(s.v) + ' px/s · ' + Math.round(s.t) + ' ms' });
    var out = $('#hoverRead');
    if (out) {
      out.textContent = t(
        '第 ' + (idx + 1) + '/' + f.samples.length + ' 个采样点 · t=' + Math.round(s.t) + 'ms · v=' + Math.round(s.v) + 'px/s · κ=' + round(s.kappa, 4),
        'Sample ' + (idx + 1) + '/' + f.samples.length + ' · t=' + Math.round(s.t) + 'ms · v=' + Math.round(s.v) + 'px/s · κ=' + round(s.kappa, 4));
    }
  }

  function drawPressChart() {
    var svg = $('#pressChart');
    if (!svg) return;
    svg.innerHTML = '';
    var g = chartGeom(svg);
    var f = ST.features;
    svg.setAttribute('viewBox', '0 0 ' + g.w + ' ' + g.h);
    svgEl('rect', { x: 0, y: 0, width: g.w, height: g.h, fill: 'rgba(20,17,15,0.03)' }, svg);
    if (!f || !f.widths.length) {
      var tx = svgEl('text', { x: g.w / 2, y: g.h / 2 + 4, 'text-anchor': 'middle', fill: 'rgba(20,17,15,0.35)', 'font-size': 11 }, svg);
      tx.textContent = t('书写后显示提按剖面', 'Draw to see the press profile');
      return;
    }
    /* 两条包络线同出 inkProfile（与画布上的笔道同一模型）：
         实线 = w        = 骨架层 × 锋形层 → 画布上真实画出的笔宽
         虚线 = wSkeleton = 骨架层（不含起收锋）→ 提按比 pressRatio 的定义域
       两条线都画出来并标出各自的比值，剖面图与真实笔迹因此不会"末端收锋
       在剖面里消失"，也不会再出现两个互不相等的上限。 */
    var wFull = f.widths;
    var wSkel = (f.skeletonWidths && f.skeletonWidths.length === wFull.length) ? f.skeletonWidths : wFull;
    var n = wFull.length, wMax = 0, i;
    for (i = 0; i < n; i++) {
      if (wFull[i] > wMax) wMax = wFull[i];
      if (wSkel[i] > wMax) wMax = wSkel[i];
    }
    wMax = Math.max(wMax, 0.001);
    var x0 = g.pad, x1 = g.w - g.pad, y0 = g.h - g.pad - 2, y1 = g.pad, midY = (y0 + y1) / 2;
    var amp = (y0 - y1) * 0.42;

    /* 先把两条包络在第 j 个横向位置上的宽度取出来。横轴按**弧长**等距
       取样，而不是按采样序号（序号 = 时间）：重采样序列是等时的，"按
       下去"的慢段点密、"提起来"的快段点疏，若直接按序号画，慢段会被
       拉长成整条笔道的一大半，与实际笔迹的长短比例不符。按弧长插值后，
       剖面就是笔迹的横向剪影——评委把剖面图与写出的笔迹上下对看时，
       起笔的厚、行笔的细、收笔的出锋都落在同一个位置。 */
    var smp = f.samples || [];
    var M = Math.max(8, Math.min(360, Math.round((x1 - x0) * 1.5)));
    var uf = new Array(M), us = new Array(M);
    var totalS = (smp.length === n && n > 0 && isNum(smp[n - 1].s)) ? smp[n - 1].s : 0;
    if (totalS > 1e-6) {
      var k2 = 0;
      for (var j = 0; j < M; j++) {
        var target = totalS * (j / (M - 1));
        while (k2 < n - 2 && smp[k2 + 1].s < target) k2++;
        var sA = smp[k2].s, sB = smp[k2 + 1].s, span2 = (sB - sA) || 1e-6;
        var uu = clamp((target - sA) / span2, 0, 1);
        uf[j] = wFull[k2] + (wFull[k2 + 1] - wFull[k2]) * uu;
        us[j] = wSkel[k2] + (wSkel[k2 + 1] - wSkel[k2]) * uu;
      }
    } else {
      /* 退化情况（无弧长信息）：按序号取样 */
      for (var j0 = 0; j0 < M; j0++) {
        var fi = j0 / (M - 1) * (n - 1);
        var a0 = Math.floor(fi), a1 = Math.min(n - 1, a0 + 1), fa = fi - a0;
        uf[j0] = wFull[a0] + (wFull[a1] - wFull[a0]) * fa;
        us[j0] = wSkel[a0] + (wSkel[a1] - wSkel[a0]) * fa;
      }
    }
    var up = '', dn = '', sup = '', sdn = '', dnRev = '';
    for (i = 0; i < M; i++) {
      var x = x0 + (x1 - x0) * (i / Math.max(1, M - 1));
      var halfFull = amp * (uf[i] / wMax);
      var halfSkel = amp * (us[i] / wMax);
      up += (i ? 'L' : 'M') + round(x, 1) + ' ' + round(midY - halfFull, 1);
      dn += (i ? 'L' : 'M') + round(x, 1) + ' ' + round(midY + halfFull, 1);
      sup += (i ? 'L' : 'M') + round(x, 1) + ' ' + round(midY - halfSkel, 1);
      sdn += (i ? 'L' : 'M') + round(x, 1) + ' ' + round(midY + halfSkel, 1);
    }
    /* 下半包络倒序拼回去，填充才是上下对称的"笔道带"，而不是只填上半 */
    for (i = M - 1; i >= 0; i--) {
      var xr = x0 + (x1 - x0) * (i / Math.max(1, M - 1));
      dnRev += 'L' + round(xr, 1) + ' ' + round(midY + amp * (uf[i] / wMax), 1);
    }
    /* ① 起收锋区间（锋形层作用范围）先铺底，视觉上说明"这一段不计入提按比" */
    var inW = Math.max(1, (x1 - x0) * PRESS.TAPER_IN_SPAN);
    var outW = Math.max(1, (x1 - x0) * (1 - PRESS.TAPER_OUT_START));
    svgEl('rect', { x: round(x0, 1), y: g.pad, width: round(inW, 1), height: g.h - g.pad * 2, fill: 'rgba(158,43,37,0.07)' }, svg);
    svgEl('rect', { x: round(x1 - outW, 1), y: g.pad, width: round(outW, 1), height: g.h - g.pad * 2, fill: 'rgba(158,43,37,0.07)' }, svg);
    /* ② 真实笔宽包络（含起收锋）：与画布上的笔道逐点同源 */
    svgEl('path', { d: up + dnRev + 'Z', fill: 'rgba(20,17,15,0.10)', stroke: 'none' }, svg);
    svgEl('path', { d: up, fill: 'none', stroke: '#14110f', 'stroke-width': 1.1 }, svg);
    svgEl('path', { d: dn, fill: 'none', stroke: '#14110f', 'stroke-width': 1.1 }, svg);
    /* ③ 骨架层包络（不含起收锋）：提按比的定义域 */
    svgEl('path', { d: sup, fill: 'none', stroke: '#9e2b25', 'stroke-width': 1, 'stroke-dasharray': '3 2' }, svg);
    svgEl('path', { d: sdn, fill: 'none', stroke: '#9e2b25', 'stroke-width': 1, 'stroke-dasharray': '3 2' }, svg);
    /* ④ 两个比值都写出来，读者无需推算 */
    var src = f.pressSource === 'pressure' ? t('压感', 'pressure') : t('速度代理', 'speed proxy');
    var cap = svgEl('text', { x: round(x0 + 2, 1), y: g.h - 1, 'font-size': 9, fill: 'rgba(20,17,15,0.62)' }, svg);
    cap.textContent = t(
      '提按比 ' + f.pressRatio.toFixed(2) + '（虚线·骨架层·' + src + '） · 总宽比 '
        + (f.pressRatioFull || 1).toFixed(2) + '（实线·含起收锋）',
      'Press ' + f.pressRatio.toFixed(2) + ' (dashed, skeleton, ' + src + ') · total '
        + (f.pressRatioFull || 1).toFixed(2) + ' (solid, incl. entry/exit taper)');
  }

  function drawCurveChart() {
    var svg = $('#curveChart');
    if (!svg) return;
    svg.innerHTML = '';
    var g = chartGeom(svg);
    var f = ST.features;
    svg.setAttribute('viewBox', '0 0 ' + g.w + ' ' + g.h);
    svgEl('rect', { x: 0, y: 0, width: g.w, height: g.h, fill: 'rgba(20,17,15,0.03)' }, svg);
    if (!f || !f.curvature.length) {
      var tx = svgEl('text', { x: g.w / 2, y: g.h / 2 + 4, 'text-anchor': 'middle', fill: 'rgba(20,17,15,0.35)', 'font-size': 11 }, svg);
      tx.textContent = t('书写后显示曲率（转折）走向', 'Draw to see curvature');
      return;
    }
    var k = f.curvature, n = k.length, kMax = 0;
    for (var i = 0; i < n; i++) kMax = Math.max(kMax, Math.abs(k[i]));
    kMax = Math.max(kMax, 1e-6);
    var x0 = g.pad, x1 = g.w - g.pad, y0 = g.h - g.pad, y1 = g.pad, mid = (y0 + y1) / 2;
    var d = '';
    for (i = 0; i < n; i++) {
      var x = x0 + (x1 - x0) * (i / Math.max(1, n - 1));
      var y = mid - (mid - y1) * clamp(k[i] / kMax, -1, 1);
      d += (i ? 'L' : 'M') + round(x, 1) + ' ' + round(y, 1);
    }
    svgEl('line', { x1: x0, y1: mid, x2: x1, y2: mid, stroke: 'rgba(20,17,15,0.25)', 'stroke-width': 0.8 }, svg);
    svgEl('path', { d: d, fill: 'none', stroke: '#9e2b25', 'stroke-width': 1.2 }, svg);
    /* 播放头 */
    var head = svgEl('line', { x1: x0, y1: g.pad, x2: x0, y2: g.h - g.pad, stroke: '#14110f', 'stroke-width': 1, opacity: 0.65 }, svg);
    head.id = 'curveHead';
    var scrub = $('#scrub');
    if (scrub) {
      scrub.max = String(Math.max(1, n - 1));
      if (+scrub.value > n - 1) scrub.value = '0';
    }
    var scr = ST.scrubValue;
    if (isNum(scr)) {
      var xx = x0 + (x1 - x0) * clamp(scr / Math.max(1, n - 1), 0, 1);
      head.setAttribute('x1', xx); head.setAttribute('x2', xx);
    }
  }

  function drawTurnNote() {
    var host = $('#turnNote');
    if (!host) return;
    host.innerHTML = '';
    var f = ST.features;
    if (!f || !f.turns.length) {
      host.appendChild(el('p', 'muted', t('这一笔没有检测到明显的转折（切线角变化均小于阈值 9°）。',
        'No clear turn detected (all tangent changes below the 9° threshold).')));
      return;
    }
    var list = f.turns.slice(0, 8);
    var wrap = el('div', 'turn-list');
    list.forEach(function (tp) {
      var b = el('button', 'turn-tag', Math.round(tp.deg) + '°');
      b.type = 'button';
      b.title = t('点击高亮该转折点', 'Click to highlight this turn');
      b.addEventListener('click', function () {
        if (!ST.features) return;
        var s = ST.features.samples[tp.index];
        if (s) { drawPad({ x: s.x, y: s.y, label: Math.round(tp.deg) + '° · ' + Math.round(s.t) + ' ms' }); }
        announce(t('已高亮第 ' + (tp.index + 1) + ' 个采样点处的转折，角度 ' + Math.round(tp.deg) + ' 度。',
          'Turn highlighted at sample ' + (tp.index + 1) + ', ' + Math.round(tp.deg) + '°.'));
      });
      wrap.appendChild(b);
    });
    host.appendChild(wrap);
    var note = el('p', 'muted', t('共 ' + f.turnCount + ' 处转折，合计角变化 ' + Math.round(f.turnTotal) + '°。',
      f.turnCount + ' turns, ' + Math.round(f.turnTotal) + '° in total.'));
    host.appendChild(note);
  }

  /* ---------- 名家比对 ---------- */
  function renderMatch() {
    var host = $('#rankList');
    var why = $('#matchWhy');
    var fm = $('#matchForm');
    if (!host) return;
    if (!ST.match) {
      host.innerHTML = '';
      if (why) why.textContent = '';
      if (fm) fm.textContent = t('先在书写台写一笔，然后点"开始比对"。', 'Write a stroke in the pad, then press “Compare”.');
      drawRadar(null);
      return;
    }
    host.innerHTML = '';
    ST.match.ranked.forEach(function (r, i) {
      var li = el('li', 'rank-row' + (i === 0 ? ' top' : ''));
      li.appendChild(el('span', 'rank-no', String(i + 1)));
      var nm = el('div', 'rank-name');
      nm.appendChild(el('b', null, t(r.zh, r.en)));
      nm.appendChild(el('span', 'rank-sub', (t(r.calligrapher_zh, r.calligrapher_en) || '') + ' · ' + (t(r.work_zh, r.work_en) || '')));
      li.appendChild(nm);
      var bar = el('div', 'bar');
      var fill = el('i');
      fill.style.width = clamp(r.score, 0, 100) + '%';
      bar.appendChild(fill);
      li.appendChild(bar);
      li.appendChild(el('span', 'rank-score', r.score.toFixed(1) + '%'));
      if (i < 3) li.classList.add('in-top3');
      host.appendChild(li);
    });
    if (why) why.textContent = ST.lang === 'zh' ? ST.match.why_zh : ST.match.why_en;
    if (fm) fm.textContent = t('Top-3：', 'Top-3: ') + ST.match.top3.map(function (r) { return t(r.zh, r.en) + ' ' + r.score.toFixed(1) + '%'; }).join(' · ');
    drawRadar(ST.match);
  }

  /* 雷达轴名（短标签，避免长英文标签被 SVG 视口裁掉） */
  var RADAR_SHORT = {
    zh: {
      startAngle: '起笔角', entryShape: '入锋形态', avgSpeed: '行笔速度', speedVar: '速度方差',
      pressRatio: '提按比', turnAngle: '转折角', dwellTotal: '驻笔', rhythmEntropy: '节奏熵',
      midStability: '稳定性', endDirection: '收笔方向'
    },
    en: {
      startAngle: 'Entry', entryShape: 'Entry form', avgSpeed: 'Speed', speedVar: 'Variance',
      pressRatio: 'Press', turnAngle: 'Turn', dwellTotal: 'Dwell', rhythmEntropy: 'Entropy',
      midStability: 'Stability', endDirection: 'Exit'
    }
  };

  function drawRadar(match) {
    var svg = $('#radar');
    if (!svg) return;
    svg.innerHTML = '';
    var size = Math.min(svg.clientWidth || 360, svg.clientHeight || 360) || 360;
    var cx = size / 2, cy = size / 2, R = size / 2 - 48;
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    var M = steleData().FEATURE_META || [];
    var N = M.length;
    var ang = function (i) { return -Math.PI / 2 + i * 2 * Math.PI / N; };
    /* 网格 */
    for (var ring = 1; ring <= 4; ring++) {
      var d = '';
      for (var i = 0; i <= N; i++) {
        var a = ang(i % N), r = R * ring / 4;
        d += (i ? 'L' : 'M') + round(cx + Math.cos(a) * r, 1) + ' ' + round(cy + Math.sin(a) * r, 1);
      }
      svgEl('path', { d: d + 'Z', fill: 'none', stroke: 'rgba(20,17,15,0.13)', 'stroke-width': 0.8 }, svg);
    }
    for (i = 0; i < N; i++) {
      var a2 = ang(i);
      svgEl('line', {
        x1: cx, y1: cy,
        x2: round(cx + Math.cos(a2) * R, 1), y2: round(cy + Math.sin(a2) * R, 1),
        stroke: 'rgba(20,17,15,0.13)', 'stroke-width': 0.8
      }, svg);
    }
    /* 轴名 */
    for (i = 0; i < N; i++) {
      var a3 = ang(i);
      var lx = cx + Math.cos(a3) * (R + 18), ly = cy + Math.sin(a3) * (R + 18);
      var tx = svgEl('text', {
        x: round(lx, 1), y: round(ly + 3, 1), 'text-anchor': 'middle',
        'font-size': 9.5, fill: 'rgba(20,17,15,0.62)', 'font-family': 'inherit'
      }, svg);
      tx.textContent = (RADAR_SHORT[ST.lang] || RADAR_SHORT.zh)[M[i].key] || M[i].zh;
    }
    if (!match || !match.vector) {
      var t0 = svgEl('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', 'font-size': 11, fill: 'rgba(20,17,15,0.4)' }, svg);
      t0.textContent = t('比对后显示十维雷达', 'Ten-axis radar after comparison');
      return;
    }
    /* 用户形状 */
    var uv = match.vector;
    var pu = '';
    for (i = 0; i <= N; i++) {
      var k = M[i % N].key, val = clamp(uv[k] || 0, 0, 1), a4 = ang(i % N), rr = R * val;
      pu += (i ? 'L' : 'M') + round(cx + Math.cos(a4) * rr, 1) + ' ' + round(cy + Math.sin(a4) * rr, 1);
    }
    svgEl('path', { d: pu + 'Z', fill: 'rgba(158,43,37,0.16)', stroke: '#9e2b25', 'stroke-width': 1.6 }, svg);
    /* 命中的书体形状 */
    if (match.top) {
      var pv = '';
      for (i = 0; i <= N; i++) {
        var kk = M[i % N].key;
        var sv = (kk === 'startAngle' || kk === 'endDirection')
          ? axisFold(match.top.profile[kk]) : clamp(match.top.profile[kk] / (M[i % N].scale || 1), 0, 1);
        var a5 = ang(i % N), r5 = R * clamp(sv, 0, 1);
        pv += (i ? 'L' : 'M') + round(cx + Math.cos(a5) * r5, 1) + ' ' + round(cy + Math.sin(a5) * r5, 1);
      }
      svgEl('path', { d: pv + 'Z', fill: 'rgba(20,17,15,0.06)', stroke: '#14110f', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }, svg);
    }
  }

  /* ---------- 笔法重演 ---------- */
  function initReplay() {
    var selStyle = $('#replayStyle'), selStroke = $('#replayStroke');
    if (!selStyle || !selStroke) return;
    var styles = steleData().STYLES || [];
    var strokes = glyphData().YONG_STROKES || [];
    styles.forEach(function (s) {
      var o = el('option', null, t(s.zh, s.en));
      o.value = s.id; selStyle.appendChild(o);
    });
    strokes.forEach(function (s) {
      var o = el('option', null, s.zh + '（' + s.alias + '） · ' + s.en);
      o.value = s.id; selStroke.appendChild(o);
    });
    selStyle.value = 'ou';
    selStroke.value = 'le';
    selStyle.addEventListener('change', rebuildReplay);
    selStroke.addEventListener('change', rebuildReplay);
    var pb = $('#replayPlay');
    if (pb) pb.addEventListener('click', toggleReplay);
    var sk = $('#replaySkeleton');
    if (sk) sk.addEventListener('change', function () { ST.replayShowSkeleton = sk.checked; drawReplay(); });
    $$('[data-replay-speed]').forEach(function (b) {
      b.addEventListener('click', function () {
        ST.replaySpeed = parseFloat(b.getAttribute('data-replay-speed')) || 1;
        $$('[data-replay-speed]').forEach(function (x) { x.classList.toggle('on', x === b); });
      });
    });
    rebuildReplay();
    var rt = 0;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { rebuildReplay(); }, 220);
    });
  }

  function rebuildReplay() {
    var selStyle = $('#replayStyle'), selStroke = $('#replayStroke');
    var box = $('#replayCanvas');
    if (!selStyle || !selStroke || !box) return;
    var w = Math.max(240, box.parentElement.clientWidth), h = w;
    ST.replay = buildReplay(selStyle.value, selStroke.value, { boxW: w, boxH: h });
    ST.replayT = 0;
    ST.replayPlaying = false;
    renderReplayInfo();
    drawReplay(0);
    var pb = $('#replayPlay');
    if (pb) pb.textContent = t('播放', 'Play');
  }

  function renderReplayInfo() {
    var host = $('#replayInfo');
    var sk = $('#strokeGloss');
    var r = ST.replay;
    if (!r) return;
    if (sk) {
      sk.innerHTML = '';
      sk.appendChild(el('h4', null, r.stroke.zh + ' · ' + r.stroke.en));
      var gz = el('p', null, t(r.stroke.gloss_zh, r.stroke.gloss_en));
      sk.appendChild(gz);
      var kz = el('p', 'muted', t('要点：' + r.stroke.key_zh, 'Key: ' + r.stroke.key_en));
      sk.appendChild(kz);
    }
    if (host) {
      host.innerHTML = '';
      var rows = [
        [t('书体', 'Style'), t(r.style_zh, r.style_en)],
        [t('时长', 'Duration'), r.duration + ' ms'],
        [t('笔道长度', 'Length'), Math.round(r.length) + ' px'],
        [t('采样帧数', 'Frames'), String(r.frames.length)],
        [t('基准速度', 'Tempo'), Math.round(r.struct.tempo) + ' px/s'],
        [t('提按幅度', 'Press range'), (r.struct.lift).toFixed(2) + '×'],
        [t('转折柔度', 'Turn softness'), (r.struct.turnSoft * 100).toFixed(0) + '%']
      ];
      rows.forEach(function (row) {
        var d = el('div', 'fact-row');
        d.appendChild(el('span', null, row[0]));
        d.appendChild(el('b', null, row[1]));
        host.appendChild(d);
      });
    }
  }

  function drawReplay(tNow) {
    var cv = $('#replayCanvas');
    if (!cv || !ST.replay) return;
    var r = ST.replay;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = r.widthPx, h = r.widthPx;
    if (cv.width !== Math.round(w * dpr)) {
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
    }
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    /* 纸底（轻） */
    g.fillStyle = '#f7f4ea';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(20,17,15,0.08)';
    g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, w - 1, h - 1);
    /* 米字格 */
    g.save();
    g.strokeStyle = 'rgba(158,43,37,0.14)';
    g.setLineDash([4, 5]);
    g.beginPath();
    g.moveTo(w / 2, 0); g.lineTo(w / 2, h);
    g.moveTo(0, h / 2); g.lineTo(w, h / 2);
    g.moveTo(0, 0); g.lineTo(w, h);
    g.moveTo(w, 0); g.lineTo(0, h);
    g.stroke();
    g.restore();
    /* 原帖骨架对照 */
    if (ST.replayShowSkeleton) {
      g.save();
      g.strokeStyle = 'rgba(158,43,37,0.42)';
      g.lineWidth = 1;
      g.setLineDash([3, 4]);
      g.beginPath();
      r.skeleton.forEach(function (p, i) { if (i) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); });
      g.stroke();
      g.restore();
    }
    /* 按时间截取轨迹；先铺一层完整笔道的淡影，让画面任何时候都不空 */
    var tUse = isNum(tNow) ? tNow : ST.replayT;
    var allPts = [], allW = [];
    for (var q = 0; q < r.frames.length; q++) {
      allPts.push({ x: r.frames[q].x, y: r.frames[q].y });
      allW.push(r.frames[q].w);
    }
    if (allPts.length > 1) drawRibbon(g, allPts, allW, 'rgba(20,17,15,0.10)');
    var pts = [], widths = [];
    for (var i = 0; i < r.frames.length; i++) {
      var fr = r.frames[i];
      if (fr.t <= tUse) { pts.push({ x: fr.x, y: fr.y }); widths.push(fr.w); }
      else {
        var pv = r.frames[i - 1];
        if (pv) {
          var u = (tUse - pv.t) / Math.max(1, fr.t - pv.t);
          pts.push({ x: pv.x + (fr.x - pv.x) * u, y: pv.y + (fr.y - pv.y) * u });
          widths.push(pv.w + (fr.w - pv.w) * u);
        }
        break;
      }
    }
    if (pts.length > 1) drawRibbon(g, pts, widths, 'rgba(20,17,15,0.88)');
    /* 进度条文字 */
    g.font = '11px -apple-system,"Segoe UI","Noto Sans SC",sans-serif';
    g.fillStyle = 'rgba(20,17,15,0.5)';
    g.fillText(Math.round(Math.min(tUse, r.duration)) + ' / ' + r.duration + ' ms', 8, h - 8);
    var hud = $('#replayHud');
    if (hud) {
      var idx = Math.min(r.frames.length - 1, Math.max(0, Math.round(tUse / Math.max(1, r.duration) * (r.frames.length - 1))));
      var f = r.frames[idx] || r.frames[0];
      hud.textContent = t('v=' + f.v + ' px/s · 笔宽 ' + f.w.toFixed(1) + ' px · 提按 ' + f.press.toFixed(2),
        'v=' + f.v + ' px/s · width ' + f.w.toFixed(1) + 'px · press ' + f.press.toFixed(2));
    }
  }

  function drawRibbon(g, pts, widths, color) {
    var L = [], R2 = [], i;
    for (i = 0; i < pts.length; i++) {
      var i0 = Math.max(0, i - 1), i1 = Math.min(pts.length - 1, i + 1);
      var dx = pts[i1].x - pts[i0].x, dy = pts[i1].y - pts[i0].y;
      var len = hypot(dx, dy) || 1;
      var nx = -dy / len, ny = dx / len, hw = widths[i] / 2;
      L.push([pts[i].x + nx * hw, pts[i].y + ny * hw]);
      R2.push([pts[i].x - nx * hw, pts[i].y - ny * hw]);
    }
    g.save();
    g.beginPath();
    g.moveTo(L[0][0], L[0][1]);
    for (i = 1; i < L.length; i++) g.lineTo(L[i][0], L[i][1]);
    for (i = R2.length - 1; i >= 0; i--) g.lineTo(R2[i][0], R2[i][1]);
    g.closePath();
    g.fillStyle = color;
    g.fill();
    /* 起收圆头 */
    g.beginPath();
    g.arc(pts[0].x, pts[0].y, Math.max(0.6, widths[0] / 2), 0, Math.PI * 2);
    g.fill();
    var lastI = pts.length - 1;
    g.beginPath();
    g.arc(pts[lastI].x, pts[lastI].y, Math.max(0.4, widths[lastI] / 2), 0, Math.PI * 2);
    g.fill();
    g.restore();
  }

  function toggleReplay() {
    var r = ST.replay;
    if (!r) return;
    ST.replayPlaying = !ST.replayPlaying;
    var pb = $('#replayPlay');
    if (pb) pb.textContent = ST.replayPlaying ? t('暂停', 'Pause') : t('播放', 'Play');
    if (ST.replayPlaying) {
      if (ST.replayT >= r.duration) ST.replayT = 0;
      ST.replayStart = performance.now() - ST.replayT / ST.replaySpeed;
      loopReplay();
    }
  }

  function loopReplay() {
    if (!ST.replayPlaying || !ST.replay) return;
    var elapsed = (performance.now() - ST.replayStart) * ST.replaySpeed;
    ST.replayT = Math.min(ST.replay.duration, elapsed);
    drawReplay(ST.replayT);
    if (ST.replayT >= ST.replay.duration) {
      ST.replayPlaying = false;
      var pb = $('#replayPlay');
      if (pb) pb.textContent = t('重播', 'Replay');
      return;
    }
    requestAnimationFrame(loopReplay);
  }

  /* ---------- 碑帖廊 ---------- */
  /* 卡片/详情上的"书体 · 风格"行。
     历史 bug：直接把 script_zh 和 styleLabel_zh 用" · "拼起来，而 styleLabel_zh
     里本来就可能已经含书体名，于是出现"隶书 · 隶书（秀逸）""行书 · 王羲之行书"
     这种重复标签。现在的规则：
       ① 风格标签若已含书体名，先把它剔掉（"隶书（秀逸）"→"（秀逸）"）；
       ② 括号降级为纯限定语（"（秀逸）"→"秀逸"，"王羲之行书"→"王羲之"）；
       ③ 剔除后为空就只显示书体名，绝不留一个孤零零的" · "。
     数据侧（data_steles.js）也已改成只写限定语，这里是双保险。 */
  function steleStyleParts(s) {
    var script = s.script_zh || '';
    var label = s.styleLabel_zh || '';
    var qual = script ? label.split(script).join('') : label;
    qual = qual.replace(/[（(]/g, ' ').replace(/[）)]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^[·、,，\-–—\s]+|[·、,，\-–—\s]+$/g, '')
      .trim();
    return { script: script, qualifier: qual };
  }
  function steleScriptLine(s) {
    var p = steleStyleParts(s);
    return p.qualifier ? (p.script ? p.script + ' · ' + p.qualifier : p.qualifier) : p.script;
  }
  /* 该碑能否参与"名家比对 / 笔法重演"：以 styleId 是否真能索引到书体档案为准，
     不看 data 里手写的 comparable 标记（数据写错也不会骗过界面）。 */
  function steleComparable(s) {
    return !!(s && s.styleId && getStyle(s.styleId));
  }

  function renderGallery() {
    var host = $('#galleryGrid');
    if (!host) return;
    host.innerHTML = '';
    var steles = steleData().STELES || [];
    steles.forEach(function (s) {
      var card = el('article', 'stele-card');
      var box = 200;
      var glyph = buildGlyph(s.struct, box, box);
      var svg = svgEl('svg', { viewBox: '0 0 ' + box + ' ' + box, width: '100%', height: '100%', 'aria-hidden': 'true' });
      svgEl('rect', { x: 6, y: 6, width: box - 12, height: box - 12, fill: 'none', stroke: 'rgba(158,43,37,0.18)', 'stroke-width': 0.8 }, svg);
      glyph.forEach(function (gpart) {
        if (ST.galleryMode === 'bone') {
          svgEl('path', {
            d: centerlinePathD(gpart.pts), fill: 'none', stroke: '#14110f',
            'stroke-width': Math.max(1.1, (s.struct.weight || 40) / 1000 * box * 0.9),
            'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.9
          }, svg);
        } else {
          svgEl('path', { d: outlinePathD(gpart.pts, gpart.widths), fill: '#14110f', opacity: 0.9 }, svg);
        }
      });
      /* 图形本身是一个按钮：点击切换该卡的骨架线 / 字形轮廓 */
      var figBtn = el('button', 'stele-fig');
      figBtn.type = 'button';
      figBtn.setAttribute('aria-pressed', ST.galleryMode === 'outline' ? 'true' : 'false');
      figBtn.setAttribute('aria-label', t('切换' + s.title_zh + '的显示：骨架线 / 字形轮廓', 'Toggle bone lines / outline for ' + s.title_en));
      figBtn.appendChild(svg);
      figBtn.addEventListener('click', toggleGalleryMode);
      card.appendChild(figBtn);

      var meta = el('div', 'stele-meta');
      meta.appendChild(el('h3', null, s.title_zh));
      meta.appendChild(el('p', 'stele-en', s.title_en));
      meta.appendChild(el('p', 'stele-line', s.calligrapher_zh + ' · ' + s.era_zh));
      meta.appendChild(el('p', 'stele-line', steleScriptLine(s)));
      /* 可比对范围标注：8 档书体档案与 8 件碑帖一一对应，所以 8 张卡全部是
     "可比对 · 可重演"（含三件隶书）。is-static 分支保留为兜底：只有当将来
     新增一件尚未配档案的碑时才会出现，当前数据下永不触发。 */
      var cmpk = steleComparable(s);
      var profile = cmpk ? getStyle(s.styleId) : null;
      var scope = el('p', 'stele-scope');
      var badge = el('span', 'stele-badge ' + (cmpk ? 'is-ok' : 'is-static'),
        t(cmpk ? '可比对 · 可重演' : '仅静态展示', cmpk ? 'Comparable · replayable' : 'Static display'));
      badge.title = t(cmpk ? '该碑有对应书体档案（' + ((profile && profile.zh) || s.styleLabel_zh) + '），可参与名家比对与笔法重演'
        : '该碑暂无书体档案，只在碑帖廊静态展示，不参与名家比对与笔法重演（兜底分支，当前 8 碑全部可比对）',
        cmpk ? 'This stele has a style profile and takes part in matching and replay'
          : 'No style profile yet: shown statically, not part of matching or replay');
      scope.appendChild(badge);
      meta.appendChild(scope);
      var tags = el('div', 'tags');
      (ST.lang === 'zh' ? s.tags_zh : s.tags_en).forEach(function (tg) { tags.appendChild(el('span', 'tag', tg)); });
      meta.appendChild(tags);
      card.appendChild(meta);

      var open = el('button', 'stele-open', t('特征档案', 'Profile'));
      open.type = 'button';
      open.addEventListener('click', function () { showSteleDetail(s); });
      card.appendChild(open);
      host.appendChild(card);
    });
    renderStelesNote();
  }

  function toggleGalleryMode() {
    ST.galleryMode = ST.galleryMode === 'bone' ? 'outline' : 'bone';
    renderGallery();
    announce(t('碑帖廊显示模式：' + (ST.galleryMode === 'bone' ? '骨架线' : '字形轮廓'),
      'Gallery view: ' + (ST.galleryMode === 'bone' ? 'bone lines' : 'outlines')));
  }

  function renderStelesNote() {
    var host = $('#galleryDetail');
    if (!host) return;
    /* data-filled 记的是"已经用哪种语言渲染过"，不是布尔锁：旧实现写成 '1'，
       切到 EN 后这段中文说明不会重绘（语言切换时 renderGallery() 会再来一次）。 */
    if (host.getAttribute('data-filled') === ST.lang) return;
    host.innerHTML = '';
    var D = steleData();
    var scopeZh = D.SCOPE_NOTE_zh
      || '碑帖廊展示 8 件公版碑帖，全部有对应书体档案：8 件的结构可直接横向比较，8 档档案也全部可参与名家比对与笔法重演（含隶书三家：曹全碑 · 秀逸 / 张迁碑 · 方整 / 石门颂 · 野逸）。';
    var scopeEn = D.SCOPE_NOTE_en
      || 'The gallery holds eight public-domain steles, every one backed by a style profile: the structure of all eight is directly comparable and all eight profiles take part in style matching and brushwork replay (including the three clerical steles: Cao Quan · refined, Zhang Qian · square, Shimen · untrammelled).';
    host.appendChild(el('p', 'muted stele-scope-note', t(
      '八件碑帖均为公有领域作品。卡片中的字形是团队依各碑笔意自绘的示意骨架（同一"永"字、八种刻石笔意），不使用任何字体文件或拓本扫描件；点击卡片查看特征档案。',
      'All eight steles are in the public domain. The glyphs shown are schematic skeletons drawn by the team in each stele’s manner (the same character 永, eight epigraphic hands), with no font files or rubbings used. Click a card for its feature profile.')));
    /* 可比对范围写在同一处（与 SCOPE_NOTE 共用口径），评委不必交叉比对两段文案 */
    host.appendChild(el('p', 'muted stele-scope-note', t(scopeZh, scopeEn)));
    /* 档案数值来源口径（与 data_steles.js 的 BASIS_NOTE_* 共用同一句话）：
       隶书三档是"依碑刻风格的定性描述设定"，不是实测拓本统计——写在界面上，
       评委不必翻代码。 */
    var basis = t(D.BASIS_NOTE_zh || '', D.BASIS_NOTE_en || '');
    if (basis) host.appendChild(el('p', 'muted small stele-basis-note', basis));
    host.setAttribute('data-filled', ST.lang);
  }

  function showSteleDetail(s) {
    var host = $('#galleryDetail');
    if (!host) return;
    host.removeAttribute('data-filled');
    host.innerHTML = '';
    var h = el('h3', null, s.title_zh + ' · ' + s.calligrapher_zh);
    host.appendChild(h);
    host.appendChild(el('p', 'muted', s.era_zh + ' · ' + steleScriptLine(s)));
    /* 该碑的比对/重演范围：8 碑全部有档案，正面写出所属书体档案；
       is-static 分支只作兜底（将来新增未配档案的碑时才用得上）。 */
    var cmpk = steleComparable(s);
    host.appendChild(el('p', 'stele-scope-note ' + (cmpk ? 'is-ok' : 'is-static'),
      t(cmpk ? '比对范围：本碑有对应书体档案（' + (getStyle(s.styleId) || {}).zh + '），可参与名家比对与笔法重演。'
        : '比对范围：' + (s.compareNote_zh || '本碑暂无书体档案，仅在碑帖廊静态展示，不参与名家比对与笔法重演。'),
      cmpk ? 'Scope: this stele has a style profile and takes part in style matching and brushwork replay.'
        : 'Scope: ' + (s.compareNote_en || 'no style profile yet, so it is displayed statically only and is not part of matching or replay.'))));
    var M = steleData().FEATURE_META || [];
    var grid = el('div', 'feat-grid compact');
    M.forEach(function (m) {
      var c = el('div', 'feat');
      c.appendChild(el('div', 'feat-dt', t(m.zh, m.en)));
      c.appendChild(el('div', 'feat-v', FEAT_RENDERERS[m.key](s.feature[m.key])));
      c.appendChild(el('div', 'feat-u', UNIT_DISPLAY[m.key] || m.unit || '\u00a0'));
      grid.appendChild(c);
    });
    host.appendChild(grid);
    host.appendChild(el('p', 'muted small', s.sourceNote_zh));
    announce(t('已展开 ' + s.title_zh + ' 的特征档案', 'Opened the profile of ' + s.title_en));
  }

  /* ---------- 术语库 ---------- */
  function renderTerms() {
    var host = $('#termList');
    if (!host) return;
    var D = root.MOJI_TERMS || { TERMS: [], CATS: [] };
    var q = ($('#termSearch') && $('#termSearch').value || '').trim().toLowerCase();
    var cat = ST.termCat || 'all';
    host.innerHTML = '';
    var list = D.TERMS.filter(function (x) {
      if (cat !== 'all' && x.cat !== cat) return false;
      if (!q) return true;
      return (x.zh + ' ' + x.en + ' ' + x.py + ' ' + x.def_zh + ' ' + x.def_en).toLowerCase().indexOf(q) >= 0;
    });
    var cats = $('#termCats');
    if (cats && cats.getAttribute('data-filled') !== ST.lang) {  // 按语言重绘：切 EN 后分类 chip 也必须是英文（旧实现写死 '1' 导致不重绘）
      cats.innerHTML = '';
      var all = el('button', 'cat-chip on', t('全部', 'All'));
      all.type = 'button'; all.setAttribute('data-cat', 'all');
      cats.appendChild(all);
      D.CATS.forEach(function (c) {
        var b = el('button', 'cat-chip', t(c.zh, c.en));
        b.type = 'button'; b.setAttribute('data-cat', c.key);
        b.setAttribute('data-zh', c.zh); b.setAttribute('data-en', c.en);
        cats.appendChild(b);
      });
      cats.setAttribute('data-filled', ST.lang);
      $$('.cat-chip', cats).forEach(function (b) {
        b.addEventListener('click', function () {
          ST.termCat = b.getAttribute('data-cat');
          $$('.cat-chip', cats).forEach(function (x) { x.classList.toggle('on', x === b); });
          renderTerms();
        });
      });
    }
    var cnt = $('#termCount');
    if (cnt) cnt.textContent = t('命中 ' + list.length + ' / 共 ' + D.TERMS.length + ' 条 · ' + D.CATS.length + ' 个门类',
      list.length + ' of ' + D.TERMS.length + ' terms · ' + D.CATS.length + ' categories');
    if (!list.length) {
      var p = el('p', 'muted', t('没有匹配的术语，试试"中锋""飞白""捺""cursive"。', 'No match. Try “centred”, “flying white”, “cursive”.'));
      host.appendChild(p);
      return;
    }
    list.forEach(function (x) {
      var d = el('div', 'term');
      var head = el('div', 'term-head');
      head.appendChild(el('b', null, x.zh));
      head.appendChild(el('span', 'term-en', x.en));
      head.appendChild(el('span', 'term-py', x.py));
      var catName = '';
      D.CATS.forEach(function (c) { if (c.key === x.cat) catName = t(c.zh, c.en); });
      head.appendChild(el('span', 'term-cat', catName));
      d.appendChild(head);
      d.appendChild(el('p', 'term-def', t(x.def_zh, x.def_en)));
      if (x.src) d.appendChild(el('p', 'term-src', x.src));
      host.appendChild(d);
    });
  }

  /* ---------- 无障碍与导出 ---------- */
  function buildReport() {
    var f = ST.features;
    var D = root.MOJI_TERMS || { TERMS: [] };
    var lines = [];
    lines.push('# 笔法体检报告 · Brushwork Report');
    lines.push('');
    lines.push('- 生成时间 / Generated: ' + new Date().toLocaleString());
    lines.push('- 作品版本 / Version: 墨迹 Traces of Ink v' + VERSION);
    lines.push('- 笔迹数 / Strokes: ' + ST.strokes.length + (f ? '（分析对象为最新一笔 / latest stroke）' : ''));
    if (!f) {
      lines.push('');
      lines.push('尚未在书写台留下笔迹，请先书写一笔后重新导出。');
      lines.push('No stroke recorded yet — draw one in the pad and export again.');
      return lines.join('\n');
    }
    lines.push('- 采样点数 / Samples: ' + f.sampleCount);
    lines.push('- 书写时长 / Duration: ' + f.duration + ' ms');
    lines.push('- 笔道长度 / Length: ' + Math.round(f.length) + ' px');
    lines.push('');
    lines.push('## 十维笔法特征 / Ten brushwork features');
    lines.push('');
    lines.push('| # | 特征 Feature | 数值 Value | 单位 Unit |');
    lines.push('|---|---|---|---|');
    var M = steleData().FEATURE_META || [];
    M.forEach(function (m, i) {
      var unit = m.unit || '—';
      if (m.key === 'avgSpeed') unit = 'px/s（折算到 1000 px 参考画布）';
      if (m.key === 'pressRatio') unit = '× 最宽/最窄（' + (f.pressSource === 'pressure' ? '真实压感' : '速度代理') + '）';
      lines.push('| ' + (i + 1) + ' | ' + m.zh + ' / ' + m.en + ' | ' + f[m.key] + ' | ' + unit + ' |');
    });
    lines.push('');
    if (ST.match) {
      lines.push('## 书体相似度 Top-3 / Style similarity');
      lines.push('');
      lines.push('| 排名 | 书体 Style | 加权余弦相似度 Similarity |');
      lines.push('|---|---|---|');
      ST.match.top3.forEach(function (r, i) {
        lines.push('| ' + (i + 1) + ' | ' + r.zh + ' / ' + r.en + ' | ' + r.score.toFixed(1) + '% |');
      });
      lines.push('');
      lines.push('解释 / Explanation: ' + ST.match.why_zh);
      lines.push('');
      lines.push('Explanation (EN): ' + ST.match.why_en);
      lines.push('');
      lines.push('> ' + (ST.match.disclaimer_zh || ''));
    } else {
      lines.push('## 书体相似度 / Style similarity');
      lines.push('');
      lines.push('尚未比对；请在"名家比对"模块点击"开始比对"后重新导出。');
    }
    lines.push('');
    lines.push('## 练习建议 / Practice suggestions');
    lines.push('');
    var sug = suggestions(f);
    sug.forEach(function (s) { lines.push('- ' + s.zh + ' / ' + s.en); });
    lines.push('');
    lines.push('## 数据说明 / Method notes');
    lines.push('');
    lines.push('- 特征提取：等时重采样 ' + CFG.dt + ' ms + 半窗 ' + CFG.smoothWin + ' 点滑动平均去抖；速度为中心差分；曲率为 Δθ/Δs。');
    lines.push('- 速度均值：已按参考画布 1000 px 折算（×1000 ÷ 画布短边），与书体档案同一量纲；屏幕实测值 '
      + (f.avgSpeedRaw != null ? Math.round(f.avgSpeedRaw) + ' px/s' : '—') + '。');
    lines.push('- 提按比：有真实压感时用实际笔压（R_p = 1 + 3.0·(p95 − p05)），无压感设备（鼠标压力恒 0.5）'
      + '以行笔速度为代理（x = v90 / max(v10, ' + PRESS.V_FLOOR + ')，R_v = 1 + '
      + PRESS.BETA + '·ln x）；'
      + '两者同为"笔道最宽 / 最窄"的倍数，上界 ' + PRESS.RATIO_MAX + '；'
      + '该比值不含起笔 ' + PRESS.TAPER_IN + '× / 收笔 ' + PRESS.TAPER_OUT + '× 的锋形层'
      + '（含锋形的本笔总宽比为 ' + (f.pressRatioFull != null ? f.pressRatioFull : 1) + '×，见提按剖面图）。');
    lines.push('- 驻笔判定：原始采样中相邻点速度 < ' + CFG.dwellSpeed + ' px/s 且间隔 ≥ ' + CFG.dwellMinSeg + ' ms。');
    lines.push('- 转折判定：切线角单步变化 > ' + CFG.turnDeg + '°。');
    lines.push('- 相似度：十维特征归一化后加权余弦；权重见 data_steles.js 的 FEATURE_META。');
    lines.push('- 本报告为教学示意性分析，不构成书家、年代或真伪鉴定。');
    lines.push('- 术语库规模：' + D.TERMS.length + ' 条；碑帖：' + (steleData().STELES || []).length + ' 件（其中 '
      + (steleData().COMPARABLE_COUNT != null ? steleData().COMPARABLE_COUNT
        : (steleData().STELES || []).filter(function (s) { return !!(s.styleId && getStyle(s.styleId)); }).length)
      + ' 件有书体档案、全部可参与比对与重演，含隶书三家）；书体档案：' + (steleData().STYLES || []).length + ' 种。');
    return lines.join('\n');
  }

  function suggestions(f) {
    var out = [];
    if (f.midStability < 0.72) out.push({
      zh: '中段速度波动较大（稳定性 ' + f.midStability.toFixed(2) + '），建议放慢中段、保持匀速，让线条"沉住"。',
      en: 'Mid-section speed fluctuates (stability ' + f.midStability.toFixed(2) + '); slow the middle and keep evenness.'
    });
    else out.push({
      zh: '中段稳定性 ' + f.midStability.toFixed(2) + '，行笔匀速，这是楷书的基本功。',
      en: 'Mid-section stability ' + f.midStability.toFixed(2) + ': even travel, the foundation of regular script.'
    });
    if (f.pressRatio < 1.6) out.push({
      zh: '提按比仅 ' + f.pressRatio.toFixed(2) + '，线条偏匀细；试着在起笔与转折处加重按压，做出"骨"与"肉"。',
      en: 'Press ratio only ' + f.pressRatio.toFixed(2) + ': the line is even; press harder at entries and turns.'
    });
    else out.push({
      zh: '提按比 ' + f.pressRatio.toFixed(2) + '，粗细对比已建立；注意提按过渡要连续，不要突变。',
      en: 'Press ratio ' + f.pressRatio.toFixed(2) + ': contrast established; keep the transition continuous.'
    });
    if (f.dwellTotal < 80) out.push({
      zh: '驻笔仅 ' + f.dwellTotal + ' ms，起收处几乎没有停顿；建议起笔逆入、收笔回锋，各留 100 ms 左右。',
      en: 'Dwell only ' + f.dwellTotal + ' ms: nearly no pause at entry and exit; reverse at entry and return at exit, about 100 ms each.'
    });
    else out.push({
      zh: '驻笔 ' + f.dwellTotal + ' ms，节奏中的"顿"已经出现；继续让顿挫与行笔形成对比。',
      en: 'Dwell ' + f.dwellTotal + ' ms: accents are present; keep contrasting pause and travel.'
    });
    if (f.turnAngle > 55) out.push({
      zh: '转折角均值 ' + f.turnAngle + '°，偏方硬；若学颜、赵，可放慢转折、以转锋代折锋。',
      en: 'Mean turn ' + f.turnAngle + '°: quite angular; for Yan or Zhao, slow the turn and roll rather than fold.'
    });
    else if (f.turnAngle > 0) out.push({
      zh: '转折角均值 ' + f.turnAngle + '°，偏圆转；若学欧、柳，可在转折处加一顿，使棱角显出。',
      en: 'Mean turn ' + f.turnAngle + '°: rounded; for Ou or Liu, add a pause at the corner to bring out the edge.'
    });
    else out.push({
      zh: '这一笔没有明显转折；换一个带折的笔画（如横折、竖钩）再测，可看出折笔质量。',
      en: 'No clear turn in this stroke; try a stroke with a corner (horizontal-fold, vertical hook).'
    });
    out.push({
      zh: '同一笔写三次并比较速度曲线：速度曲线的形状比字形更能暴露习惯。',
      en: 'Write the same stroke three times and compare the velocity curves: the curve reveals habit better than the shape.'
    });
    return out;
  }

  function exportReport() {
    var md = buildReport();
    var blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.href = url;
    a.download = '笔法体检报告_' + stamp + '.md';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 800);
    var prev = $('#reportPreview');
    if (prev) { prev.textContent = md; }
    announce(t('报告已导出（Markdown）。若浏览器拦截下载，报告内容已显示在下方文本框中。',
      'Report exported as Markdown. If the download was blocked, the text is shown below.'));
  }

  /* ---------- 听笔法：Web Audio 实时合成 ---------- */
  var Audio = {
    ctx: null, master: null, analyser: null, nodes: [],
    ensure: function () {
      if (this.ctx) return this.ctx;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.7;
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.72;
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      return this.ctx;
    },
    stop: function () {
      this.nodes.forEach(function (n) { try { n.stop ? n.stop() : n.disconnect(); } catch (e) { } });
      this.nodes = [];
    },
    play: function (score, volume) {
      var ctx = this.ensure();
      if (!ctx) return false;
      if (ctx.state === 'suspended') ctx.resume();
      this.stop();
      var t0 = ctx.currentTime + 0.06;
      var self = this;
      self.master.gain.setTargetAtTime(volume == null ? 0.7 : volume, ctx.currentTime, 0.02);
      score.events.forEach(function (ev) {
        var when = t0 + ev.t / 1000;
        self.voice(ctx, ev, when, score.timbre);
      });
      return true;
    },
    voice: function (ctx, ev, when, timbre) {
      var dur = Math.max(0.08, ev.dur / 1000);
      var g = ctx.createGain();
      var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (pan) { pan.pan.value = ev.pan || 0; g.connect(pan); pan.connect(this.master); }
      else g.connect(this.master);
      /* 谐波叠加 */
      var oscs = [];
      var nH = ev.harm.length;
      for (var i = 0; i < nH; i++) {
        var amp = ev.harm[i];
        if (amp < 0.004) continue;
        var o = ctx.createOscillator();
        o.type = i === 0 ? (timbre === 'muyu' ? 'triangle' : 'sine') : 'sine';
        o.frequency.value = ev.freq * (i + 1);
        var og = ctx.createGain();
        og.gain.value = amp;
        o.connect(og); og.connect(g);
        oscs.push(o);
        this.nodes.push(o);
      }
      /* 木鱼：加一段确定性的短噪（由 seed 决定的固定噪声表） */
      if (timbre === 'muyu') {
        var noise = ctx.createBufferSource();
        var buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.07), ctx.sampleRate);
        var data = buf.getChannelData(0);
        var rnd = mulberry32(ev.freq > 0 ? Math.round(ev.freq * 100) : 12345);
        for (var k = 0; k < data.length; k++) data[k] = (rnd() * 2 - 1) * (1 - k / data.length);
        noise.buffer = buf;
        var ng = ctx.createGain();
        ng.gain.value = 0.16;
        var bp = ctx.createBiquadFilter();
        bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 1.4;
        noise.connect(bp); bp.connect(ng); ng.connect(g);
        noise.start(when);
        this.nodes.push(noise);
      }
      /* 包络 */
      var atk = timbre === 'strings' ? 0.09 : 0.006;
      var peak = Math.max(0.001, ev.gain);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.linearRampToValueAtTime(peak, when + atk);
      if (timbre === 'strings') {
        g.gain.setValueAtTime(peak, when + dur * 0.72);
        g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
        /* 持续弦乐的揉弦 */
        var lfo = ctx.createOscillator(), lg = ctx.createGain();
        lfo.frequency.value = 5.2; lg.gain.value = ev.freq * 0.006;
        lfo.connect(lg);
        oscs.forEach(function (o) { lg.connect(o.frequency); });
        lfo.start(when); lfo.stop(when + dur + 0.05);
        this.nodes.push(lfo);
      } else {
        g.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.16), when + dur * 0.55);
        g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      }
      oscs.forEach(function (o) { o.start(when); o.stop(when + dur + 0.06); });
    }
  };

  function renderNoteLog() {
    var host = $('#noteLog');
    if (!host) return;
    host.innerHTML = '';
    var sc = ST.lastSonify;
    if (!sc) {
      host.appendChild(el('p', 'muted', t('尚未生成发音序列。写一笔后点"听这一笔"。',
        'No score yet. Draw a stroke and press “Hear this stroke”.')));
      return;
    }
    var head = el('div', 'note-head');
    head.appendChild(el('b', null, t('发音事件表', 'Event table')));
    head.appendChild(el('span', 'muted small', 'seed ' + sc.seed + ' · ' + sc.count + ' events · ' + sc.durationMs + ' ms' + (sc.drivenByStroke ? t(' · 由笔迹速度曲线驱动', ' · driven by your velocity curve') : '')));
    host.appendChild(head);
    var tbl = el('div', 'note-table');
    var cols = ['t (ms)', t('音高 Hz', 'freq Hz'), t('时值 ms', 'dur ms'), t('力度', 'gain'), t('音级', 'degree')];
    var hrow = el('div', 'note-row head');
    cols.forEach(function (c) { hrow.appendChild(el('span', null, c)); });
    tbl.appendChild(hrow);
    sc.events.slice(0, 16).forEach(function (ev) {
      var r = el('div', 'note-row');
      [ev.t, ev.freq, Math.round(ev.dur), ev.gain.toFixed(3), ev.degree].forEach(function (v) {
        r.appendChild(el('span', null, String(v)));
      });
      tbl.appendChild(r);
    });
    if (sc.events.length > 16) {
      tbl.appendChild(el('div', 'note-row more', t('… 其余 ' + (sc.events.length - 16) + ' 个事件按同一映射生成', '… ' + (sc.events.length - 16) + ' more events by the same mapping')));
    }
    host.appendChild(tbl);
  }

  function drawSpectrum() {
    var cv = $('#spectrum');
    if (!cv) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var w = cv.clientWidth || 480, h = cv.clientHeight || 92;
    if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(20,17,15,0.04)';
    g.fillRect(0, 0, w, h);
    if (!Audio.analyser) {
      g.fillStyle = 'rgba(20,17,15,0.35)';
      g.font = '11px -apple-system,"Segoe UI","Noto Sans SC",sans-serif';
      g.fillText(t('打开声音后显示实时频谱', 'Enable sound to see the live spectrum'), 10, h / 2 + 4);
      return;
    }
    var bins = new Uint8Array(Audio.analyser.frequencyBinCount);
    Audio.analyser.getByteFrequencyData(bins);
    var N = 64, bw = w / N;
    for (var i = 0; i < N; i++) {
      var idx = Math.floor(Math.pow(i / N, 1.6) * bins.length);
      var v = bins[Math.min(bins.length - 1, idx)] / 255;
      var bh = Math.max(1, v * (h - 8));
      g.fillStyle = 'rgba(158,43,37,' + (0.30 + v * 0.6).toFixed(2) + ')';
      g.fillRect(i * bw + 0.6, h - bh, Math.max(1, bw - 1.4), bh);
    }
  }
  var spectrumRAF = 0;
  function loopSpectrum() {
    drawSpectrum();
    spectrumRAF = requestAnimationFrame(loopSpectrum);
  }

  /* ---------- 事件绑定 ---------- */
  function bindUI() {
    var b;
    b = $('#langBtn'); if (b) b.addEventListener('click', function () { setLang(ST.lang === 'zh' ? 'en' : 'zh'); });
    b = $('#motionBtn'); if (b) b.addEventListener('click', function () { setReduceMotion(!ST.reduceMotion); });
    b = $('#undoBtn'); if (b) b.addEventListener('click', undo);
    b = $('#clearBtn'); if (b) b.addEventListener('click', clearPad);
    b = $('#gridToggle'); if (b) b.addEventListener('click', function () {
      ST.showGrid = !ST.showGrid;
      b.setAttribute('aria-pressed', ST.showGrid ? 'true' : 'false');
      b.classList.toggle('on', ST.showGrid);
      drawPad();
    });
    b = $('#brushSize'); if (b) b.addEventListener('input', function () {
      ST.brushSize = +b.value;
      var out = $('#brushSizeOut'); if (out) out.textContent = b.value + ' px';
      bakeStrokes(); drawPad();
    });
    b = $('#brushPresets'); if (b) $$('button', b).forEach(function (x) {
      x.addEventListener('click', function () {
        ST.brushSize = +x.getAttribute('data-size');
        var sl = $('#brushSize'); if (sl) sl.value = ST.brushSize;
        var out = $('#brushSizeOut'); if (out) out.textContent = ST.brushSize + ' px';
        bakeStrokes(); drawPad();
      });
    });
    b = $('#matchBtn'); if (b) b.addEventListener('click', runMatch);
    b = $('#kbdToggle'); if (b) b.addEventListener('click', function () {
      ST.kbdMode = !ST.kbdMode;
      b.setAttribute('aria-pressed', ST.kbdMode ? 'true' : 'false');
      b.classList.toggle('on', ST.kbdMode);
      if (ST.kbdMode) {
        ST.kbdPos = { x: padW / 2, y: padH / 2 };
        padCanvas.focus();
        announce(t('键盘书写已开启：方向键移动笔尖，空格落笔/收笔，Esc 取消这一笔。',
          'Keyboard writing on: arrow keys move the tip, space lifts or lowers it, Esc cancels.'));
      } else {
        ST.kbdPos = null; ST.kbdDown = false; ST.current = null;
        announce(t('键盘书写已关闭', 'Keyboard writing off'));
      }
      drawPad();
    });
    b = $('#exportBtn'); if (b) b.addEventListener('click', exportReport);
    b = $('#sonifyBtn'); if (b) b.addEventListener('click', function () { playStrokeSound(); });
    b = $('#stopAudio'); if (b) b.addEventListener('click', function () {
      Audio.stop(); ST.audioOn = false;
      var sb = $('#sonifyBtn'); if (sb) sb.textContent = t('听这一笔', 'Hear this stroke');
      announce(t('声音已停止', 'Sound stopped'));
    });
    $$('[data-timbre]').forEach(function (x) {
      x.addEventListener('click', function () {
        ST.timbre = x.getAttribute('data-timbre');
        $$('[data-timbre]').forEach(function (y) { y.classList.toggle('on', y === x); });
        announce(t('音色：' + x.getAttribute('data-zh'), 'Timbre: ' + x.getAttribute('data-en')));
      });
    });
    b = $('#volume'); if (b) b.addEventListener('input', function () {
      if (Audio.master) Audio.master.gain.setTargetAtTime(+b.value, Audio.ctx.currentTime, 0.02);
      var o = $('#volumeOut'); if (o) o.textContent = Math.round(+b.value * 100) + '%';
    });
    b = $('#scrub'); if (b) b.addEventListener('input', function () {
      ST.scrubValue = +b.value;
      var f = ST.features;
      if (!f || !f.samples[ST.scrubValue]) return;
      var s = f.samples[ST.scrubValue];
      drawPad({ x: s.x, y: s.y, label: Math.round(s.t) + ' ms' });
      drawCurveChart();
      var head = $('#curveHead');
      var svg = $('#curveChart');
      if (head && svg) {
        var g = chartGeom(svg);
        var x0 = g.pad, x1 = g.w - g.pad;
        var xx = x0 + (x1 - x0) * clamp(ST.scrubValue / Math.max(1, f.samples.length - 1), 0, 1);
        head.setAttribute('x1', xx); head.setAttribute('x2', xx);
      }
      var out = $('#hoverRead');
      if (out) out.textContent = t('回放：t=' + Math.round(s.t) + 'ms · v=' + Math.round(s.v) + 'px/s',
        'Replay: t=' + Math.round(s.t) + 'ms · v=' + Math.round(s.v) + 'px/s');
    });
    b = $('#termSearch'); if (b) b.addEventListener('input', renderTerms);
    b = $('#galleryToggle'); if (b) b.addEventListener('click', toggleGalleryMode);
    b = $('#langTermToggle'); if (b) b.addEventListener('click', function () {
      setLang(ST.lang === 'zh' ? 'en' : 'zh');
    });
    /* 键盘快捷键 */
    document.addEventListener('keydown', function (ev) {
      if (ev.target && /INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
      if (ev.key === 'Escape') { Audio.stop(); }
    });
    /* 首屏封面墨迹动画 */
    initCoverInk();
  }

  function undo() {
    if (!ST.strokes.length) { announce(t('没有可撤销的笔迹', 'Nothing to undo')); return; }
    ST.strokes.pop();
    bakeStrokes();
    ST.features = null;
    ST.match = null;
    renderFeatures();
    renderMatch();
    drawPad();
    if (ST.strokes.length) analyzeLatest();
    announce(t('已撤销一笔，剩余 ' + ST.strokes.length + ' 笔', 'Undone; ' + ST.strokes.length + ' strokes remain'));
  }

  function clearPad() {
    ST.strokes = [];
    ST.current = null;
    ST.features = null;
    ST.match = null;
    ST.scrubValue = 0;
    bakeStrokes();
    renderFeatures();
    renderMatch();
    drawPad();
    announce(t('画布已清空', 'Canvas cleared'));
  }

  function runMatch() {
    if (!ST.features) {
      announce(t('请先在书写台写一笔，再进行比对。', 'Write a stroke in the pad first.'));
      var fm = $('#matchForm');
      if (fm) fm.textContent = t('还没有笔迹。请先到"书写台"写一笔。', 'No stroke yet — write one in the pad first.');
      return;
    }
    ST.match = matchStyle(ST.features);
    renderMatch();
    announce(t('比对完成，最接近 ' + ST.match.top.zh + '，相似度 ' + ST.match.top.score.toFixed(1) + '%。这是特征相似度，不是鉴定。',
      'Comparison done: closest to the ' + ST.match.top.en + ', ' + ST.match.top.score.toFixed(1) + '%. Feature similarity, not attribution.'));
    var sec = $('#match');
    if (sec) sec.scrollIntoView({ behavior: ST.reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function playStrokeSound() {
    var f = ST.features;
    if (!f) {
      announce(t('请先写一笔再听。', 'Draw a stroke first.'));
      return;
    }
    var score = sonifyFromStroke(f, ST.timbre, {});
    ST.lastSonify = score;
    renderNoteLog();
    var vol = $('#volume') ? +$('#volume').value : 0.7;
    var ok = Audio.play(score, vol);
    if (!ok) { announce(t('此浏览器不支持 Web Audio。', 'Web Audio is not available in this browser.')); return; }
    ST.audioOn = true;
    if (!spectrumRAF) loopSpectrum();
    var sb = $('#sonifyBtn'); if (sb) sb.textContent = t('再听一次', 'Play again');
    announce(t('正在播放由你的笔法参数合成的 ' + score.count + ' 个音（seed ' + score.seed + '，确定性输出）。',
      'Playing ' + score.count + ' synthesised notes from your brushwork (seed ' + score.seed + ', deterministic).'));
  }

  /* ---------- 八体 A/B 对照试听：界面 ---------- */
  function abStyleOf(sel) {
    var node = $(sel);
    return node ? getStyle(node.value) : null;
  }
  function abTimbreName() {
    for (var i = 0; i < TIMBRES.length; i++) if (TIMBRES[i].id === ST.timbre) return t(TIMBRES[i].zh, TIMBRES[i].en);
    return ST.timbre;
  }
  function abFeatureLine(st) {
    return t(
      '行笔 ' + Math.round(st.feature.avgSpeed) + ' px/s · 提按 ' + st.feature.pressRatio.toFixed(2) + '× · 转折 ' + st.feature.turnAngle + '°',
      'speed ' + Math.round(st.feature.avgSpeed) + ' px/s · press ' + st.feature.pressRatio.toFixed(2) + '× · turn ' + st.feature.turnAngle + '°');
  }
  function syncAB() {
    var stA = abStyleOf('#abSelectA'), stB = abStyleOf('#abSelectB');
    var la = $('#abPlayALabel'), lb = $('#abPlayBLabel');
    if (la) la.textContent = stA ? t(stA.zh, stA.en) : '—';
    if (lb) lb.textContent = stB ? t(stB.zh, stB.en) : '—';
    var ba = $('#abPlayA'), bb = $('#abPlayB');
    if (ba && stA) ba.setAttribute('aria-label',
      t('先听 A：' + stA.zh + '，' + stA.epithet_zh, 'Listen to A first: ' + stA.en + ', ' + stA.epithet_en));
    if (bb && stB) bb.setAttribute('aria-label',
      t('再听 B：' + stB.zh + '，' + stB.epithet_zh, 'Then listen to B: ' + stB.en + ', ' + stB.epithet_en));
    var ma = $('#abMetaA'), mb = $('#abMetaB');
    if (ma && stA) ma.textContent = abFeatureLine(stA);
    if (mb && stB) mb.textContent = abFeatureLine(stB);
    var v = $('#abVerdict');
    if (v) {
      if (!stA || !stB) { v.textContent = ''; return; }
      var dP = Math.abs(stA.feature.pressRatio - stB.feature.pressRatio);
      var dT = Math.abs(stA.feature.turnAngle - stB.feature.turnAngle);
      var dV = Math.abs(stA.feature.avgSpeed - stB.feature.avgSpeed);
      v.textContent = t(
        '同一根线条，两种性格：A ' + stA.zh + '（' + stA.epithet_zh + '） vs B ' + stB.zh + '（' + stB.epithet_zh + '）'
        + '——档案差 提按 ' + dP.toFixed(2) + '× · 转折 ' + dT + '° · 行笔 ' + Math.round(dV) + ' px/s，'
        + '分别映射到 音量包络 / 谐波亮度 / 音高走向。',
        'One line, two temperaments: A ' + stA.en + ' (' + stA.epithet_en + ') vs B ' + stB.en + ' (' + stB.epithet_en + ')'
        + ' — press differs by ' + dP.toFixed(2) + '×, turn by ' + dT + '°, speed by ' + Math.round(dV) + ' px/s,'
        + ' mapped to loudness envelope / harmonic brightness / pitch contour.');
    }
  }
  /* 播放读数（独立一行、aria-live）：把"这串音是哪来的"写成可核对的数字——
     哪个侧、哪档档案、几个音、几秒（档案原生几秒）、seed 多少。 */
  function renderABReadout() {
    var host = $('#abReadout');
    if (!host) return;
    var parts = [];
    [['a', ST.abA, '#abSelectA'], ['b', ST.abB, '#abSelectB']].forEach(function (row) {
      var sc = row[1], st = abStyleOf(row[2]);
      if (!sc || !st) return;
      var side = row[0] === 'a' ? 'A' : 'B';
      parts.push(t(
        side + ' ' + st.zh + ' · ' + sc.count + ' 音 · ' + (sc.durationMs / 1000).toFixed(1) + ' s'
        + '（档案原生 ' + (sc.naturalMs / 1000).toFixed(1) + ' s，等比压到同一时长）· seed ' + sc.seed,
        side + ' ' + st.en + ' · ' + sc.count + ' notes · ' + (sc.durationMs / 1000).toFixed(1) + ' s'
        + ' (natural ' + (sc.naturalMs / 1000).toFixed(1) + ' s, refitted to a common window) · seed ' + sc.seed));
    });
    host.textContent = parts.join('\u3000|\u3000');
  }
  function playAB(which) {
    var st = abStyleOf(which === 'a' ? '#abSelectA' : '#abSelectB');
    if (!st) { announce(t('请先选择两种书体。', 'Pick two styles first.')); return null; }
    var score = abTone(st.id, ST.timbre, AB_TARGET_MS);
    if (!score) return null;
    if (which === 'a') ST.abA = score; else ST.abB = score;
    ST.lastSonify = score;
    renderNoteLog();
    var vol = $('#volume') ? +$('#volume').value : 0.7;
    var ok = Audio.play(score, vol);
    if (!ok) { announce(t('此浏览器不支持 Web Audio。', 'Web Audio is not available in this browser.')); return null; }
    ST.audioOn = true;
    if (!spectrumRAF) loopSpectrum();
    renderABReadout();
    announce(t(
      '正在播放 ' + (which === 'a' ? 'A 侧' : 'B 侧') + '：' + st.zh + '，' + score.count + ' 个音 / '
      + (score.durationMs / 1000).toFixed(1) + ' 秒，seed ' + score.seed + '（由该体十维档案驱动，确定性输出）。',
      'Playing side ' + (which === 'a' ? 'A' : 'B') + ': ' + st.en + ', ' + score.count + ' notes over '
      + (score.durationMs / 1000).toFixed(1) + ' s, seed ' + score.seed + ' (driven by that profile, deterministic).'));
    return score;
  }
  function playABBoth() {
    var a = playAB('a');
    if (!a) return;
    /* A 播完再播 B：用 A 的确定时长做定时，不引入随机 */
    setTimeout(function () { playAB('b'); }, a.durationMs + 260);
    announce(t('先播 A，' + (a.durationMs / 1000).toFixed(1) + ' 秒后接播 B。', 'A first, then B after ' + (a.durationMs / 1000).toFixed(1) + ' s.'));
  }
  /* 两个下拉的 8 档选项按当前语言重建（initAB 与语言切换都走这里，
     否则切到 EN 后选项仍是中文——#replayStyle 的老实现就有这个毛病）。 */
  function refreshABOptions() {
    var styles = steleData().STYLES || [];
    ['#abSelectA', '#abSelectB'].forEach(function (sel) {
      var node = $(sel);
      if (!node) return;
      var cur = node.value;
      node.innerHTML = '';
      styles.forEach(function (s) {
        var o = el('option', null, t(s.zh, s.en));
        o.value = s.id;
        node.appendChild(o);
      });
      if (cur && getStyle(cur)) node.value = cur;
    });
  }

  function initAB() {
    var sa = $('#abSelectA'), sb = $('#abSelectB');
    if (!sa || !sb) return;
    refreshABOptions();
    if (AB_PAIRS.length) { sa.value = AB_PAIRS[0].a; sb.value = AB_PAIRS[0].b; }
    function markPreset(idx) {
      $$('[data-ab-pair]').forEach(function (y, k) {
        y.classList.toggle('on', k === idx);
        y.setAttribute('aria-pressed', k === idx ? 'true' : 'false');
      });
    }
    function onPick() {
      markPreset(-1);
      ST.abA = null; ST.abB = null;
      renderABReadout();
      syncAB();
    }
    sa.addEventListener('change', onPick);
    sb.addEventListener('change', onPick);
    var bA = $('#abPlayA'); if (bA) bA.addEventListener('click', function () { playAB('a'); });
    var bB = $('#abPlayB'); if (bB) bB.addEventListener('click', function () { playAB('b'); });
    var bBoth = $('#abPlayBoth'); if (bBoth) bBoth.addEventListener('click', playABBoth);
    $$('[data-ab-pair]').forEach(function (x, idx) {
      x.addEventListener('click', function () {
        var p = AB_PAIRS[idx];
        if (!p) return;
        sa.value = p.a; sb.value = p.b;
        markPreset(idx);
        ST.abA = null; ST.abB = null;
        renderABReadout();
        syncAB();
        announce(t('对照预置：' + p.zh, 'Preset pair: ' + p.en));
      });
    });
    markPreset(0);
    syncAB();
  }

  /* ---------- 封面墨迹 ---------- */
  function initCoverInk() {
    var cv = $('#coverInk');
    if (!cv) return;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      var w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      return { w: w, h: h };
    }
    var size = resize();
    var g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    /* 一次性生成的墨扩散（程序生成，无外部图）：集中在右半区，让左侧文字保持干净 */
    var rnd = mulberry32(11203353);
    var blobs = [];
    for (var i = 0; i < 22; i++) {
      var bx = size.w * (0.34 + 0.66 * rnd());
      var by = size.h * rnd();
      blobs.push({
        x: bx, y: by,
        r: 26 + rnd() * 120, a: 0.012 + rnd() * 0.045, sq: 0.55 + rnd() * 0.9
      });
    }
    /* 右上角一道带锋的横画：起笔重、中段轻、收笔重（与"勒"的笔意一致） */
    function paintStrokeShape(prog) {
      if (prog <= 0) return;
      var yBase = size.h * 0.20;
      var x0 = size.w * 0.56, x1 = size.w * 0.97;
      var n = 72, pts = [];
      var m = Math.max(2, Math.round(n * prog));
      for (var s = 0; s <= m; s++) {
        var u = (s / m) * prog;                 /* u∈[0, prog]，逐段生长 */
        var x = x0 + (x1 - x0) * u;
        var y = yBase + Math.sin(u * Math.PI * 1.15) * size.h * 0.035 - u * size.h * 0.055;
        var press = 0.35 + 0.65 * Math.pow(Math.abs(Math.cos(u * Math.PI * 1.05)), 0.6);
        pts.push({ x: x, y: y, w: size.h * 0.010 + size.h * 0.030 * press * (0.4 + 0.6 * Math.min(1, u * 6)) });
      }
      if (pts.length < 3) return;
      g.save();
      g.beginPath();
      for (var k = 0; k < pts.length; k++) {
        var i0 = Math.max(0, k - 1), i1 = Math.min(pts.length - 1, k + 1);
        var dx = pts[i1].x - pts[i0].x, dy = pts[i1].y - pts[i0].y;
        var len = hypot(dx, dy) || 1;
        var nx = -dy / len, ny = dx / len, half = pts[k].w / 2;
        if (k === 0) g.moveTo(pts[k].x + nx * half, pts[k].y + ny * half);
        else g.lineTo(pts[k].x + nx * half, pts[k].y + ny * half);
      }
      for (k = pts.length - 1; k >= 0; k--) {
        i0 = Math.max(0, k - 1); i1 = Math.min(pts.length - 1, k + 1);
        dx = pts[i1].x - pts[i0].x; dy = pts[i1].y - pts[i0].y;
        len = hypot(dx, dy) || 1;
        nx = -dy / len; ny = dx / len; half = pts[k].w / 2;
        g.lineTo(pts[k].x - nx * half, pts[k].y - ny * half);
      }
      g.closePath();
      g.fillStyle = 'rgba(20,17,15,0.16)';
      g.fill();
      /* 中锋核心：一条更窄更深的层，让这道横有"骨" */
      g.beginPath();
      for (k = 0; k < pts.length; k++) {
        var j0 = Math.max(0, k - 1), j1 = Math.min(pts.length - 1, k + 1);
        var ex = pts[j1].x - pts[j0].x, ey = pts[j1].y - pts[j0].y;
        var el2 = hypot(ex, ey) || 1;
        var mx = -ey / el2, my = ex / el2, mh = pts[k].w * 0.17;
        if (k === 0) g.moveTo(pts[k].x + mx * mh, pts[k].y + my * mh);
        else g.lineTo(pts[k].x + mx * mh, pts[k].y + my * mh);
      }
      for (k = pts.length - 1; k >= 0; k--) {
        j0 = Math.max(0, k - 1); j1 = Math.min(pts.length - 1, k + 1);
        ex = pts[j1].x - pts[j0].x; ey = pts[j1].y - pts[j0].y;
        el2 = hypot(ex, ey) || 1;
        mx = -ey / el2; my = ex / el2; mh = pts[k].w * 0.17;
        g.lineTo(pts[k].x - mx * mh, pts[k].y - my * mh);
      }
      g.closePath();
      g.fillStyle = 'rgba(20,17,15,0.14)';
      g.fill();
      g.restore();
    }

    function paint(prog) {
      g.clearRect(0, 0, size.w, size.h);
      blobs.forEach(function (b, idx) {
        var grow = ST.reduceMotion ? 1 : clamp(prog * 1.6 - idx * 0.03, 0, 1);
        if (grow <= 0) return;
        var r = b.r * (0.4 + 0.6 * grow);
        var grd = g.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
        grd.addColorStop(0, 'rgba(20,17,15,' + (b.a * grow).toFixed(3) + ')');
        grd.addColorStop(0.5, 'rgba(20,17,15,' + (b.a * grow * 0.34).toFixed(3) + ')');
        grd.addColorStop(1, 'rgba(20,17,15,0)');
        g.fillStyle = grd;
        g.beginPath();
        g.ellipse(b.x, b.y, r, r * b.sq, idx * 0.7, 0, Math.PI * 2);
        g.fill();
      });
      paintStrokeShape(ST.reduceMotion ? 1 : clamp((prog - 0.22) / 0.62, 0, 1));
    }
    if (ST.reduceMotion) { paint(1); return; }
    var t0 = performance.now();
    (function anim() {
      var prog = clamp((performance.now() - t0) / 2200, 0, 1);
      paint(prog);
      if (prog < 1) requestAnimationFrame(anim);
    })();
    window.addEventListener('resize', function () { size = resize(); g.setTransform(dpr, 0, 0, dpr, 0, 0); paint(1); });
  }

  /* ---------- 启动 ---------- */
  /* ==========================================================================
     18 · 现场演示模式 Presentation Mode（P 键 · 一模块一屏）
     --------------------------------------------------------------------------
     要解决的问题是答辩现场的真实限制：1440 宽下单页总高约 1.9 万 px，术语库
     一节就有 9 千 px，评委看不到一个完整模块，主讲人只能飞快地滚或被跳过。
     这一层只做「分屏 + 定位」，不改 DOM 结构、不改任何既有交互：

       · 模块：按现有 section 顺序取 10 个锚点（封面 / 书写台 / 笔法解构 /
         名家比对 / 笔法重演 / 听笔法 / 碑帖廊 / 术语库 / 无障碍 / 团队）。
         相邻模块的顶边把整页无缝切成 10 段——同一个像素不会被算进两个模块。
       · 页：每段按视口高 H 切成 ceil(段高 / H) 页，第 k 页偏移
         min(kH, 段高 − H)，因此最后一页的下沿正好落在模块底边，翻不出空白；
         偏移再统一 clamp 到 maxScroll，末尾因贴底产生的重复页会被去重。
       · 翻页 / 换模块只调用 window.scrollTo，不移动焦点、不改 class 之外的
         DOM、不 touch 任何 aria 属性；退出时把进入前的 scrollY 与焦点原样还原。
       · prefers-reduced-motion（或顶栏「减弱动效」）时不使用平滑滚动。

     键位见 §18.1 的 pmKey()；文本与 aria-live 由 pmRender() 写入。
     ========================================================================== */

  /* 18.0 模块表：顺序 = 页面现有 section 顺序（也 = 顶栏 rail 顺序） */
  var PRESENT_MODULES = [
    { id: 'cover', zh: '封面', en: 'Cover' },
    { id: 'bench', zh: '书写台', en: 'Writing pad' },
    { id: 'deconstruct', zh: '笔法解构', en: 'Brushwork analysis' },
    { id: 'match', zh: '名家比对', en: 'Style matching' },
    { id: 'replay', zh: '笔法重演', en: 'Replay' },
    { id: 'listen', zh: '听笔法', en: 'Listening' },
    { id: 'gallery', zh: '碑帖廊', en: 'Stele gallery' },
    { id: 'terms', zh: '术语库', en: 'Terminology' },
    { id: 'access', zh: '无障碍', en: 'Accessibility' },
    { id: 'team', zh: '团队', en: 'Team' }
  ];

  var PM = {
    on: false,
    idx: 0,          // 当前模块序号（0 基）
    page: 0,         // 当前模块内的页序号（0 基）
    spans: [],       // [{ top, span }] 绝对文档坐标
    savedY: 0,       // 进入前的 scrollY
    savedFocus: null,
    lastAnn: '',     // 上一次 aria-live 文本（避免重复播报）
    scrollTimer: 0,
    resizeTimer: 0
  };

  function pmEls() {
    return {
      bar: $('#presentBar'), mod: $('#presentMod'), midx: $('#presentMIdx'),
      page: $('#presentPage'), live: $('#presentLive'), btn: $('#presentBtn')
    };
  }

  function pmDocEnd() {
    return Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
  }
  function pmMaxScroll() {
    return Math.max(0, pmDocEnd() - window.innerHeight);
  }

  /* 18.1 测量：把 10 个模块在文档坐标里的 top / span 算出来 */
  function pmMeasure() {
    var y = window.pageYOffset, tops = [], i, e;
    for (i = 0; i < PRESENT_MODULES.length; i++) {
      e = document.getElementById(PRESENT_MODULES[i].id);
      tops.push(e ? Math.round(e.getBoundingClientRect().top + y) : null);
    }
    var docEnd = pmDocEnd();
    PM.spans = [];
    for (i = 0; i < tops.length; i++) {
      if (tops[i] == null) { PM.spans.push(null); continue; }
      var end = docEnd;
      for (var j = i + 1; j < tops.length; j++) if (tops[j] != null) { end = tops[j]; break; }
      PM.spans.push({ top: tops[i], span: Math.max(1, end - tops[i]) });
    }
  }

  /* 模块 i 的页数与每页 scrollY（已 clamp 到 maxScroll，去重后严格递增） */
  function pmPages(i) {
    var s = PM.spans[i];
    var maxS = pmMaxScroll();
    if (!s) return { count: 1, offs: [Math.min(Math.round(window.pageYOffset), maxS)] };
    var H = Math.max(1, Math.round(window.innerHeight));
    var count = Math.max(1, Math.ceil(s.span / H));
    var offs = [], k;
    for (k = 0; k < count; k++) {
      var off = Math.min(k * H, Math.max(0, s.span - H));
      offs.push(Math.min(s.top + off, maxS));
    }
    var uniq = [];
    for (k = 0; k < offs.length; k++) {
      if (!uniq.length || offs[k] > uniq[uniq.length - 1]) uniq.push(offs[k]);
    }
    if (!uniq.length) uniq.push(Math.min(s.top, maxS));
    return { count: uniq.length, offs: uniq };
  }

  function pmInstant() {
    if (ST.reduceMotion) return true;
    if (document.body && document.body.classList.contains('reduce-motion')) return true;
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* 平滑滚动只在允许动效时使用；instant 分支显式绕开 html{scroll-behavior:smooth} */
  function pmScroll(y, instant) {
    var top = Math.round(y);
    try {
      window.scrollTo({ top: top, left: 0, behavior: instant ? 'instant' : 'smooth' });
    } catch (err) {
      var de = document.documentElement, prev = de.style.scrollBehavior;
      de.style.scrollBehavior = 'auto';
      window.scrollTo(0, top);
      de.style.scrollBehavior = prev;
    }
  }

  function pmName(i) {
    var m = PRESENT_MODULES[i];
    return m ? t(m.zh, m.en) : '';
  }

  /* 18.2 指示条 + aria-live（只在模块/页真的变化时改写 live 文本） */
  function pmRender() {
    var E = pmEls();
    var P = pmPages(PM.idx);
    if (PM.page > P.count - 1) PM.page = P.count - 1;
    if (E.mod) E.mod.textContent = pmName(PM.idx);
    if (E.midx) E.midx.textContent = (PM.idx + 1) + '/' + PRESENT_MODULES.length;
    if (E.page) E.page.textContent = t('第 ' + (PM.page + 1) + '/' + P.count + ' 页',
      'page ' + (PM.page + 1) + '/' + P.count);
    if (E.bar) {
      E.bar.setAttribute('data-module', PRESENT_MODULES[PM.idx].id);
      E.bar.setAttribute('data-module-index', String(PM.idx + 1));
      E.bar.setAttribute('data-page', String(PM.page + 1));
      E.bar.setAttribute('data-pages', String(P.count));
    }
    var msg = t(pmName(PM.idx) + '，第 ' + (PM.page + 1) + ' 页，共 ' + P.count + ' 页',
      pmName(PM.idx) + ', page ' + (PM.page + 1) + ' of ' + P.count);
    if (E.live && msg !== PM.lastAnn) { PM.lastAnn = msg; E.live.textContent = msg; }
  }

  /* 18.3 进入 / 退出：保存并还原 scrollY 与焦点 */
  function pmEnter() {
    if (PM.on) return;
    PM.on = true;
    PM.savedY = Math.round(window.pageYOffset);
    PM.savedFocus = document.activeElement;
    pmMeasure();
    var E = pmEls();
    /* 从"正在看的位置"开始，避免进入后又跳回页首 */
    var idx = 0, i;
    for (i = 0; i < PM.spans.length; i++) if (PM.spans[i] && PM.spans[i].top <= PM.savedY + 8) idx = i;
    PM.idx = idx;
    var P = pmPages(idx);
    PM.page = 0;
    for (i = 0; i < P.offs.length; i++) if (P.offs[i] <= PM.savedY + 8) PM.page = i;
    document.body.classList.add('presenting');
    if (E.bar) E.bar.hidden = false;
    if (E.btn) E.btn.setAttribute('aria-pressed', 'true');
    PM.lastAnn = '';
    pmRender();
    pmScroll(P.offs[PM.page], true);
    if (E.bar) { try { E.bar.focus({ preventScroll: true }); } catch (e) { E.bar.focus(); } }
  }

  function pmExit() {
    if (!PM.on) return;
    PM.on = false;
    document.body.classList.remove('presenting');
    var E = pmEls();
    if (E.bar) E.bar.hidden = true;
    if (E.btn) E.btn.setAttribute('aria-pressed', 'false');
    pmScroll(PM.savedY, true);
    if (PM.savedFocus && PM.savedFocus.focus) {
      try { PM.savedFocus.focus({ preventScroll: true }); } catch (e2) { /* 元素已移除则忽略 */ }
    }
    PM.savedFocus = null;
    PM.lastAnn = '';
    if (E.live) E.live.textContent = t('已退出演示模式，恢复原滚动位置', 'Presentation mode off; scroll position restored');
  }

  function pmToggle() { if (PM.on) pmExit(); else pmEnter(); }

  /* 模块内翻页；越界时自动衔接到上一模块末页 / 下一模块首页 */
  function pmStep(d) {
    var n = PRESENT_MODULES.length;
    var P = pmPages(PM.idx);
    var np = PM.page + d;
    if (np < 0) {
      PM.idx = (PM.idx - 1 + n) % n;
      PM.page = pmPages(PM.idx).count - 1;
    } else if (np > P.count - 1) {
      PM.idx = (PM.idx + 1) % n;
      PM.page = 0;
    } else {
      PM.page = np;
    }
    var Q = pmPages(PM.idx);
    if (PM.page > Q.count - 1) PM.page = Q.count - 1;
    pmRender();
    pmScroll(Q.offs[PM.page], pmInstant());
  }

  /* 跳模块：一律落在该模块首屏（第 1 页） */
  function pmModule(d, abs) {
    var n = PRESENT_MODULES.length;
    if (abs != null) PM.idx = ((abs % n) + n) % n;
    else PM.idx = ((PM.idx + d) % n + n) % n;
    PM.page = 0;
    var P = pmPages(PM.idx);
    pmRender();
    pmScroll(P.offs[0], pmInstant());
  }

  /* 18.4 键盘：P 开关（任何模式下可用）；其余仅在演示模式下生效。
     输入控件内一律不抢键（术语库检索要能输入 p / Tab 换焦点）。 */
  function pmTyping(tg) {
    if (!tg || !tg.tagName) return false;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)) return true;
    return !!tg.isContentEditable;
  }

  function pmKey(ev) {
    if (!ev || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    var tg = ev.target;
    if (pmTyping(tg)) return;
    var k = ev.key;
    if ((k === 'p' || k === 'P') && !ev.repeat) { ev.preventDefault(); pmToggle(); return; }
    if (!PM.on) return;
    /* 书写台开着"键盘书写"时，方向键归书法笔尖，演示模式不抢 */
    if (ST.kbdMode && tg === padCanvas) return;
    var done = true;
    if (k === 'ArrowDown' || k === 'PageDown' || k === 'j' || k === 'J') pmStep(1);
    else if (k === 'ArrowUp' || k === 'PageUp' || k === 'k' || k === 'K') pmStep(-1);
    else if (k === 'ArrowRight' || (k === 'Tab' && !ev.shiftKey)) pmModule(1);
    else if (k === 'ArrowLeft' || (k === 'Tab' && ev.shiftKey)) pmModule(-1);
    else if (k === 'Home') pmModule(0, 0);
    else if (k === 'End') pmModule(0, PRESENT_MODULES.length - 1);
    else if (k === 'Escape') pmExit();
    else done = false;
    if (done) ev.preventDefault();
  }

  /* 18.5 用鼠标滚轮 / 触控板自己滚了，就把指示条同步回真实位置（只读不改滚动） */
  function pmSyncFromScroll() {
    if (!PM.on) return;
    var y = Math.round(window.pageYOffset), i;
    pmMeasure();
    for (i = 0; i < PM.spans.length; i++) if (PM.spans[i] && PM.spans[i].top <= y + 8) PM.idx = i;
    var P = pmPages(PM.idx);
    PM.page = 0;
    for (i = 0; i < P.offs.length; i++) if (P.offs[i] <= y + 8) PM.page = i;
    pmRender();
  }

  function pmOnScroll() {
    if (!PM.on) return;
    if (PM.scrollTimer) clearTimeout(PM.scrollTimer);
    PM.scrollTimer = setTimeout(function () { PM.scrollTimer = 0; pmSyncFromScroll(); }, 140);
  }

  function pmOnResize() {
    if (!PM.on) return;
    if (PM.resizeTimer) clearTimeout(PM.resizeTimer);
    PM.resizeTimer = setTimeout(function () {
      PM.resizeTimer = 0;
      if (!PM.on) return;
      pmMeasure();
      var P = pmPages(PM.idx);
      if (PM.page > P.count - 1) PM.page = P.count - 1;
      pmRender();
      pmScroll(P.offs[PM.page], true);
    }, 120);
  }

  function initPresent() {
    var b = $('#presentBtn');
    if (b) b.addEventListener('click', function () { pmToggle(); });
    var lb = $('#presentLang');
    if (lb) lb.addEventListener('click', function () { setLang(ST.lang === 'zh' ? 'en' : 'zh'); });
    document.addEventListener('keydown', pmKey);
    window.addEventListener('scroll', pmOnScroll, { passive: true });
    window.addEventListener('resize', pmOnResize);
  }

  function boot() {
    document.body.setAttribute('data-lang', ST.lang);
    bindUI();
    initPad();
    renderFeatures();
    renderMatch();
    renderTerms();
    renderGallery();
    initReplay();
    initAB();
    renderNoteLog();
    initPresent();
    var tb = $('#totalTerms');
    var D = root.MOJI_TERMS || { TERMS: [] };
    if (tb) tb.textContent = String(D.TERMS.length);
    var tb2 = $('#totalTerms2');
    if (tb2) tb2.textContent = String(D.TERMS.length);
    var ts = $('#totalSteles');
    if (ts) ts.textContent = String((steleData().STELES || []).length);
    var ts2 = $('#totalSteles2');
    if (ts2) ts2.textContent = String((steleData().STELES || []).length);
    var stn = $('#totalStyles');
    if (stn) stn.textContent = String((steleData().STYLES || []).length);
    var stn0 = $('#totalStylesCover');
    if (stn0) stn0.textContent = String((steleData().STYLES || []).length);
    var sd = $('#sonSeed');
    if (sd) sd.textContent = '—';
    drawSpectrum();
    /* 视口内的图表在尺寸确定后重绘 */
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { drawCharts(); drawRadar(ST.match); });
      var ch = $('#chartsHost');
      if (ch) ro.observe(ch);
    }
    ST.reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (ST.reduceMotion) setReduceMotion(true);
    announce(t('欢迎。写一笔，让笔法显影。', 'Welcome. Write a stroke and let the brushwork develop.'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  return API;
});
