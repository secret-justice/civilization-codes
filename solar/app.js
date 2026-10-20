/* ============================================================================
 * app.js —《天时》交互层
 * ----------------------------------------------------------------------------
 * 九大模块全部由 data_*.js 的真实数据 + astro.js 的实时计算驱动；
 * 页面不内置任何节气时刻表：每处显示的节气时刻都是当场反解出来的。
 * 结构：0 工具与双语 → 1 封面 → 2 日影台 → 3 节气历 → 4 公转
 *       → 5 物候 → 6 世界对话 → 7 节气色 → 8 术语库 → 9 教学包 → 10 团队
 * ========================================================================== */
(function () {
  'use strict';

  /* ==================================================================
   * 0 · 工具、状态与双语
   * ================================================================== */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const A = window.Astro;
  // 注：官方节气时刻对照表（data_reference.js）**不进页面**，仅由 test/verify.js 在 Node 侧读取。
  const TERMS = window.TermData;
  const PHENO = window.PhenoData;
  const WORLD = window.WorldData;

  const YEARS = [2024, 2025, 2026, 2027];
  const DEFAULT_YEAR = 2026;
  const now = new Date();
  const NOW_JD = A.jdFromUTC(now.getUTCFullYear(), now.getUTCMonth() + 1, now.getUTCDate(),
    now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let LANG = (/^en/i.test(navigator.language || '') && !/^zh/i.test(navigator.language || '')) ? 'en' : 'zh';
  let REDUCED = prefersReduced;

  /* 城市表（教学包与日影台共用） */
  const CITIES = [
    { id: 'beijing', zh: '北京', en: 'Beijing', lat: 39.9, lon: 116.4, tz: 8 },
    { id: 'london', zh: '伦敦', en: 'London', lat: 51.5, lon: -0.13, tz: 0 },
    { id: 'equator', zh: '赤道（基多）', en: 'Equator (Quito)', lat: 0, lon: -78.5, tz: -5 },
    { id: 'sydney', zh: '悉尼', en: 'Sydney', lat: -33.9, lon: 151.2, tz: 10 },
    { id: 'cairo', zh: '开罗', en: 'Cairo', lat: 30.0, lon: 31.2, tz: 2 },
    { id: 'tokyo', zh: '东京', en: 'Tokyo', lat: 35.7, lon: 139.7, tz: 9 },
    { id: 'seoul', zh: '首尔', en: 'Seoul', lat: 37.6, lon: 127.0, tz: 9 },
    { id: 'singapore', zh: '新加坡', en: 'Singapore', lat: 1.35, lon: 103.8, tz: 8 },
    { id: 'newdelhi', zh: '新德里', en: 'New Delhi', lat: 28.6, lon: 77.2, tz: 5.5 },
    { id: 'tehran', zh: '德黑兰', en: 'Tehran', lat: 35.7, lon: 51.4, tz: 3.5 },
    { id: 'rome', zh: '罗马', en: 'Rome', lat: 41.9, lon: 12.5, tz: 1 },
    { id: 'paris', zh: '巴黎', en: 'Paris', lat: 48.9, lon: 2.35, tz: 1 },
    { id: 'moscow', zh: '莫斯科', en: 'Moscow', lat: 55.8, lon: 37.6, tz: 3 },
    { id: 'newyork', zh: '纽约', en: 'New York', lat: 40.7, lon: -74.0, tz: -5 },
    { id: 'losangeles', zh: '洛杉矶', en: 'Los Angeles', lat: 34.1, lon: -118.2, tz: -8 },
    { id: 'mexico', zh: '墨西哥城', en: 'Mexico City', lat: 19.4, lon: -99.1, tz: -6 },
    { id: 'rio', zh: '里约热内卢', en: 'Rio de Janeiro', lat: -22.9, lon: -43.2, tz: -3 },
    { id: 'capetown', zh: '开普敦', en: 'Cape Town', lat: -33.9, lon: 18.4, tz: 2 },
    { id: 'nairobi', zh: '内罗毕', en: 'Nairobi', lat: -1.3, lon: 36.8, tz: 3 },
    { id: 'reykjavik', zh: '雷克雅未克', en: 'Reykjavík', lat: 64.1, lon: -21.9, tz: 0 }
  ];

  const LAT_PRESETS = [
    { id: 'beijing', zh: '北京 39.9°N', en: 'Beijing 39.9°N', lat: 39.9 },
    { id: 'equator', zh: '赤道 0°', en: 'Equator 0°', lat: 0 },
    { id: 'london', zh: '伦敦 51.5°N', en: 'London 51.5°N', lat: 51.5 },
    { id: 'sydney', zh: '悉尼 33.9°S', en: 'Sydney 33.9°S', lat: -33.9 },
    { id: 'cairo', zh: '开罗 30.0°N', en: 'Cairo 30.0°N', lat: 30.0 }
  ];

  /* 日期预设（提到模块作用域，便于语言切换后重绘） */
  const DATE_PRESETS = [
    { zh: '春分', en: 'Equinox', k: 0 }, { zh: '夏至', en: 'Solstice', k: 6 },
    { zh: '秋分', en: 'Equinox', k: 12 }, { zh: '冬至', en: 'Solstice', k: 18 }
  ];

  /* 语言切换后需要重绘的「预设按钮组」（innerHTML 一次性渲染，不随 applyI18n 更新） */
  function renderObsPresets() {
    const lb = document.getElementById('latPresets');
    if (lb) {
      lb.innerHTML = LAT_PRESETS.map((p) =>
        `<button class="chip" data-lat="${p.lat}" type="button">${(LANG === 'zh' ? p.zh : p.en)}</button>`).join('');
    }
    const db = document.getElementById('datePresets');
    if (db) {
      db.innerHTML = DATE_PRESETS.map((d) =>
        `<button class="chip" data-k="${d.k}" type="button" aria-pressed="false">${(LANG === 'zh' ? d.zh : d.en)}</button>`).join('');
    }
    syncObsPresets();
  }

  /** 让预设按钮反映当前状态：默认态落在春分正午，春分按钮即为"选中" */
  function syncObsPresets() {
    $$('#latPresets .chip').forEach((b) => {
      const on = Math.abs(parseFloat(b.dataset.lat) - obs.lat) < 0.05;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    let bestK = null, bestDist = 2.5;
    DATE_PRESETS.forEach((d) => {
      const term = termsOfYear(obs.year).find((x) => x.k === d.k);
      if (!term) return;
      const c = A.jdToCalendar(term.jdUT, 8);
      const dd = Math.abs(doyOfJD(A.jdFromUTC(c.year, c.month, c.day, 0, 0, 0)) - obs.doy);
      if (dd < bestDist) { bestDist = dd; bestK = d.k; }
    });
    $$('#datePresets .chip').forEach((b) => {
      const on = parseInt(b.dataset.k, 10) === bestK;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  /* --------------------------------------------------------- 双语字典 */
  const I18N = {
    zh: {
      skip: '跳到主要内容', brand: '天时',
      nav1: '日影台', nav2: '节气历', nav3: '公转', nav4: '物候', nav5: '世界对话',
      nav6: '节气色', nav7: '术语库', nav8: '教学包', nav9: '团队',
      motionOn: '动效', motionOff: '静帧',
      coverKicker: '交互式数字天文台 · 科学计算 + 数据可视化',
      coverSub: '二十四节气不是老黄历，而是中国人用一根圭表、一道日影，把太阳一年切成 24 段的精确算法。本作品用真实天文计算当场算出任意年份 24 个节气的精确时刻——你可以拨动圭表看影长，拖动地球看太阳直射点，再把这一刻放进世界的坐标系。',
      coverMeta: '全国大学生数字媒体科技作品及创意竞赛 · 国际专项赛参赛作品 ｜ 2026',
      enter: '进入天文台 · Enter', seeTerms: '直接看今年的节气时刻',
      coverFoot: '零依赖 · 离线可双击打开 · 页面内每个节气时刻都是当场算出来的',
      k1: '圭表测影', t1: '日影台：影子的长度就是太阳的高度',
      d1: '选定纬度与日期，拖动时刻，看竖表投下的影子如何随太阳移动。影长 = 表高 ÷ tan(太阳高度角)；正午影长在冬至最长、夏至最短——这正是古人定节气的原始观测量。',
      lat: '观测纬度', date: '日期', time: '真太阳时', gnomon: '表高',
      timeHint: '真太阳时 12:00 = 太阳上中天（当地正午），与钟表时间差即"均时差"。',
      gnomonHint: '影长与表高成正比；古制八尺之表约合今 1.9 m。',
      dialCap: '地平盘俯视：空心圆为太阳方位，实线为影长方向（与太阳方位相差 180°），长度按影长比例缩放；同心圆刻度为影长比 1.0 / 2.0 / 3.0。',
      obsFigures: '实时读数',
      k2: '节气时刻', t2: '节气历：24 个时刻，全部当场算出',
      d2: '每个时刻都是解方程"太阳视黄经 = 15°×k"得到的，精确到分钟；与官方公布值逐条比对的误差表在技术文档中公开。环状视图把黄道 360° 等分为 24 格——这正是节气的几何定义。',
      viewList: '列表', viewRing: '环状',
      k3: '黄道与直射点', t3: '地球公转：同一个太阳，两条曲线',
      d3: '轨道视图里地球以真实日地距运动（偏心率已放大标注），24 个节气标记按黄经等分而角速度不均；直射点视图给出太阳直射纬度与三条纬线的昼长曲线——它们全部由同一套算法逐日算出。',
      viewOrbit: '轨道视图', viewSubsolar: '直射点视图', play: '播放', pause: '暂停',
      orbitCap: '轨道视图：日地距变化已放大 12 倍以便观察；标记为 24 个节气位置。',
      orbitFigures: '当前状态',
      k4: '三候与花信', t4: '物候图谱：24 节气 × 三候 × 花信风',
      d4: '每个节气再分三候，每候一句物候；小寒至谷雨八节气另有"二十四番花信风"，每候一花。插画全部为自绘几何 SVG，不使用任何外部图片。',
      k5: '同一太阳，多种编码', t5: '世界时间对话：一个日期游标，五种坐标系',
      d5: '拖动游标：中国节气、太阳黄经度数、西方黄道十二宫、太阳直射点与晨昏线、各文明的太阳节点节日同步跳动。文明互鉴不是谁抄谁，而是人类面对同一片天空各自造出的精密答案。',
      worldCap: '低精度自绘大陆轮廓（约 {N} 点，示意级精度，非测绘投影）+ 等经纬网格：直射点与晨昏线由当日太阳赤经、赤纬实时算出；实心金点＝该地此刻为白昼，空心环＝夜间，鼠标悬停看当地真太阳时与高度角。',
      worldFigures: '此刻的太阳', worldTableTitle: '各文明的太阳节点对照',
      thRegion: '文明 / 地点', thFest: '节点与节日', thRule: '日期规则', thThisYear: '本年日期', thState: '与游标关系',
      k6: '节气色', t6: '节气色：24 个节气的专属配色', d6: '全部以 OKLCH 定义（L 明度 / C 彩度 / H 色相），页面现场转换为 sRGB 显示；每个色附一句取色依据。点击色卡复制色值。',
      k7: '术语库', t7: '双语术语库：把节气还原为可定义的科学',
      d7: '从太阳黄经、赤纬、时角到圭表、晷影、三候、数九、入梅出梅，逐条给出中文与英文释义，支持中英文检索与门类筛选。',
      searchPh: '检索：中文 / 英文 / 释义，如 黄经、declination、圭表、solstice…',
      k8: '教学包', t8: '教学包导出：把计算变成课堂材料',
      d8: '一键导出《节气时刻表》与《指定城市日影表》（CSV / Markdown）。全部在本地生成并下载，不联网、不上传任何数据。',
      expTerms: '《节气时刻表》', year: '年份', expTermsHint: '24 行：序号 / 节气 / 太阳黄经 / 北京时间 / UTC / 三候首候。',
      expCity: '《指定城市日影表》', city: '城市', expCityHint: '24 行：节气 / 日期 / 正午太阳高度角 / 正午影长 / 昼长 / 日出 / 日落。',
      expPreview: '导出预览',
      k9: '团队与披露', t9: '团队分工、原创界定与 AI 披露',
      crTeam: '团队分工',
      cr1: '<b>天文算法与数值验证</b> — VSOP87D 截断级数接入、节气反解迭代、96 条官方时刻逐条校验',
      cr2: '<b>数据整理与双语</b> — 七十二候、花信风、141 条术语、12 个文明节点的中英对照撰写',
      cr3: '<b>交互与可视化</b> — 圭表地平盘、节气环、公转动画、直射点/晨昏线、节气色系统',
      cr4: '<b>工程与测试</b> — 零依赖打包、Node 自检脚本、Playwright 端到端检查',
      cr5: '<b>影像与评审材料</b> — 评审视频脚本、AI 影像生成与筛选、说明文档',
      crOrigin: '原创资产界定',
      cr6: '<b>算法实现</b>：依据 Bretagnon &amp; Francou (1988, VSOP87) 与 Meeus《Astronomical Algorithms》(1998) 的公开理论<b>自行实现</b>，未复制任何第三方天文库代码。',
      cr7: '<b>视觉资产</b>：24 幅物候插画、日晷、黄道环、星场、晨昏线、色卡全部为程序生成或自绘 SVG，无任何外部图片与字体文件。',
      cr8: '<b>文本</b>：术语释义、物候释文、文明对照简介由团队撰写；官方节气时刻表仅作校验基准，不进入运行逻辑。',
      crSource: '算法与数据来源',
      cr9: '<b>算法</b>：VSOP87D 地球级数（IMCCE 公开数据文件）、Meeus §22 章动 / §25 太阳位置 / §28 均时差 / §13 地平坐标、Espenak–Meeus ΔT 多项式。',
      cr10: '<b>基准</b>：香港天文台《二十四節氣的日期及時間資料》2024–2027 共 96 条（上游为英国皇家航海历书局 / 美国海军天文气象台数据），抓取日期 2026-10-18。',
      cr11: '<b>文献</b>：《逸周书·时训解》《月令七十二候集解》《周礼》等公开古籍；UNESCO 2016 年二十四节气列入人类非遗名录。',
      crAI: 'AI 使用披露',
      cr12: '<b>AI 辅助范围</b>：代码框架与文案初稿在 AI 辅助下完成，算法实现、数值验证与全部结论由团队成员逐行复核并跑通测试；页面显示的每个节气时刻均由程序实时计算，不存在预置数据。',
      cr13: '<b>AI 影像</b>：评审视频与氛围图使用远程 GPU 上的视频/图像生成模型制作，逐条在下方清单中披露；网页运行时<b>不依赖</b>这些影像。',
      cr14: '<b>未经 AI 生成的部分</b>：天文算法、测试脚本、物候插画的几何绘制规则、配色体系与官方数据比对结论。',
      crPending: 'AI 影像待补位清单（当前以程序生成的星空与光影替代）',
      footNote: '二十四节气的太阳历法算法与世界时间对话 ｜ 全国大学生数字媒体科技作品及创意竞赛 · 国际专项赛参赛作品 ｜ 2026',
      backTop: '回到顶部',
      /* —— 动态文案 —— */
      lng: '北纬', lgs: '南纬', alt: '太阳高度角', az: '方位角', dec: '太阳赤纬', ha: '时角',
      shadowLen: '表影长度', shadowRatio: '影长比', noonShadow: '正午影长', dayLen: '昼长',
      sunrise: '日出', sunset: '日落', eot: '均时差', noShadow: '无影（太阳在地平线下）',
      noShadowShort: '无影', sunBelow: '太阳在地平线下',
      sunBelowNote: '此刻太阳在地平线下（高度角为负值），竖表不投影，所以没有影长可测；把「真太阳时」拖到日出与日落之间，影子就会出现。',
      obsSample: '当前示例',
      yearMax: '当年最长（冬至）', yearMin: '当年最短（夏至）', atNoon: '正午',
      termLongitude: '太阳黄经', bjTime: '北京时间 (UTC+8)', utcTime: 'UTC',
      directLat: '太阳直射纬度', beijingNoonShadow: '北京正午影长（表高 2 m）',
      pentadsTitle: '三候', plantsFW: '花信风', plantsSeasonal: '时令草木',
      farmTitle: '农事要点', selTerm: '点选任一节气', ringHint: '黄道 360° 等分 24 格；点击扇区查看该节气详情。',
      years: '年份', curTerm: '当前节气', nextTerm: '下一节气', inDays: '距下一节气',
      solarSpeed: '太阳黄经变率', sunDist: '日地距', cardTerm: '节气',
      zodiac: '黄道十二宫', inSign: '宫内度数', subsolar: '太阳直射点',
      termNowTitle: '此刻的节气位置', nearNone: '无', day: '天', hours: '小时', min: '分钟',
      before: '前', after: '后', sameDay: '同日', notThisYear: '—',
      ruleTerm: '由节气算法求解（黄经 15°×k）', ruleFixed: '固定历日（传统历法）', ruleApprox: '约定/近似公历日期',
      copyOk: '已复制色值', copied: '已复制',
      expDone: '已生成并下载', expTermsTitle: '天时 · 二十四节气时刻表',
      expCityTitle: '天时 · 城市日影与昼长表', expNote: '数据由 astro.js 当场计算（VSOP87D 视黄经 + ΔT 修正）；生成时间',
      expTermsCount: '共 24 条节气时刻',
      tableSeq: '序号', tableTerm: '节气', tableLon: '太阳黄经', tableBj: '北京时间', tableUtc: 'UTC', tableHou: '三候首候',
      tableDate: '日期', tableAlt: '正午太阳高度角', tableShadow: '正午影长', tableRatio: '影长比',
      tableDayLen: '昼长', tableRise: '日出', tableSet: '日落',
      layerTerms: '中国二十四节气', layerZodiac: '西方黄道十二宫', layerFest: '各文明太阳节点节日', layerSub: '太阳直射点与晨昏线',
      lanternOn: '图层', allSeasons: '全部', fwBadge: '花信风',
      ariaNotice: '计算结果已更新'
    },
    en: {
      skip: 'Skip to main content', brand: 'Tianshi',
      nav1: 'Shadow Terrace', nav2: 'Almanac', nav3: 'Orbit', nav4: 'Phenology', nav5: 'World Dialogue',
      nav6: 'Colours', nav7: 'Glossary', nav8: 'Teaching Pack', nav9: 'Credits',
      motionOn: 'Motion', motionOff: 'Still',
      coverKicker: 'An interactive digital observatory · scientific computing + data visualisation',
      coverSub: 'The 24 solar terms are not an almanac of folklore: they are a precise algorithm by which the Chinese divided the solar year into 24 segments with a gnomon and its shadow. This work computes the exact instant of every term, for any year, live in your browser — you can turn the gnomon to read the shadow, drag the Earth to watch the subsolar point, and place that instant within the world’s calendars.',
      coverMeta: 'National Student Digital Media Competition · International Special Track entry ｜ 2026',
      enter: 'Enter the observatory', seeTerms: 'See this year’s term instants',
      coverFoot: 'Zero dependencies · opens offline by double-click · every instant on this page is computed on the spot',
      k1: 'Shadow survey', t1: 'The Shadow Terrace: shadow length is solar altitude made visible',
      d1: 'Choose a latitude and a date, then drag the hour to watch the shadow of an upright post travel. Shadow length = post height ÷ tan(solar altitude). The noon shadow is longest at the winter solstice and shortest at the summer solstice — exactly the original observation from which the terms were defined.',
      lat: 'Latitude', date: 'Date', time: 'True solar time', gnomon: 'Post height',
      timeHint: 'True solar time 12:00 is upper meridian transit (local noon); its difference from clock time is the equation of time.',
      gnomonHint: 'Shadow length scales with post height; the classical eight-chi post is about 1.9 m.',
      dialCap: 'Horizon disc seen from above: the hollow circle marks the solar azimuth, the solid line the shadow direction (180° from the Sun); concentric rings are shadow ratios 1.0 / 2.0 / 3.0.',
      obsFigures: 'Live readings',
      k2: 'Term instants', t2: 'The Almanac: 24 instants, all computed here',
      d2: 'Every instant solves “apparent solar longitude = 15°×k” to the minute. The comparison table against published official values is given in the technical documentation. The ring view divides the 360° ecliptic into 24 sectors — the geometric definition of the terms.',
      viewList: 'List', viewRing: 'Ring',
      k3: 'Ecliptic & subsolar point', t3: 'Earth’s Orbit: one Sun, two curves',
      d3: 'In the orbital view the Earth moves at its true distance (eccentricity magnified and labelled), with the 24 term markers equally spaced in longitude but not in speed. The subsolar view plots solar declination and the day-length curves of three latitudes — all computed day by day from one algorithm.',
      viewOrbit: 'Orbital view', viewSubsolar: 'Subsolar view', play: 'Play', pause: 'Pause',
      orbitCap: 'Orbital view: the variation of the Earth–Sun distance is magnified 12× for visibility; markers are the 24 term positions.',
      orbitFigures: 'Current state',
      k4: 'Pentads & flower winds', t4: 'The Phenology Atlas: 24 terms × 3 pentads × flower-wind letters',
      d4: 'Each term divides into three pentads, each with one phenological phrase; the eight terms from Minor Cold to Grain Rain carry the “twenty-four flower-wind letters”, one flower per pentad. All illustrations are drawn geometric SVG — no external images.',
      k5: 'One Sun, many encodings', t5: 'A World Dialogue on Time: one cursor, five frames of reference',
      d5: 'Drag the cursor: the Chinese solar term, the solar longitude, the Western zodiac, the subsolar point and terminator, and the solar-node festivals of several civilizations all move together. Mutual learning among civilizations is not copying: it is humanity’s several precise answers to the same sky.',
      worldCap: 'Low-precision continental outlines drawn in-house (about {N} vertices; schematic accuracy, not a surveyed projection) over an equirectangular graticule: the subsolar point and terminator are computed from the solar right ascension and declination; a filled gold dot marks daylight at that place, a hollow ring marks night — hover for the local true solar time and altitude.',
      worldFigures: 'The Sun at this instant', worldTableTitle: 'Solar-node festivals across civilizations',
      thRegion: 'Civilisation / place', thFest: 'Node & festival', thRule: 'Date rule', thThisYear: 'This year', thState: 'Relative to cursor',
      k6: 'Colours', t6: 'Colours of the Terms: 24 original OKLCH colours', d6: 'Every colour is defined in OKLCH (L lightness / C chroma / H hue) and converted to sRGB on the fly; each carries a one-line rationale. Click a swatch to copy its value.',
      k7: 'Glossary', t7: 'A Bilingual Glossary: turning the terms back into science',
      d7: 'From apparent solar longitude, declination and hour angle to gnomon, shadow, pentads, the “counting the nines” and the plum-rain seasons — each entry has a Chinese and an English definition, searchable in both languages and filterable by category.',
      searchPh: 'Search: Chinese / English / definition, e.g. 黄经, declination, 圭表, solstice…',
      k8: 'Teaching pack', t8: 'Teaching Pack Export: from computation to classroom material',
      d8: 'Export the Term Instant Table and the City Shadow Table as CSV or Markdown. Everything is generated and downloaded locally; no network, no upload.',
      expTerms: 'Term Instant Table', year: 'Year', expTermsHint: '24 rows: index / term / solar longitude / Beijing time / UTC / first pentad.',
      expCity: 'City Shadow Table', city: 'City', expCityHint: '24 rows: term / date / noon solar altitude / noon shadow / day length / sunrise / sunset.',
      expPreview: 'Export preview',
      k9: 'Team & disclosure', t9: 'Team, original contributions and AI disclosure',
      crTeam: 'Division of labour',
      cr1: '<b>Astronomical algorithm & numerical validation</b> — VSOP87D truncation, term-solving iteration, entry-by-entry check against 96 official instants',
      cr2: '<b>Data & bilingual writing</b> — 72 pentads, flower-wind letters, 141 glossary entries, 12 civilisational nodes in both languages',
      cr3: '<b>Interaction & visualisation</b> — shadow disc, term ring, orbital animation, subsolar point/terminator, colour system',
      cr4: '<b>Engineering & testing</b> — dependency-free packaging, Node self-check, Playwright end-to-end checks',
      cr5: '<b>Film & submission</b> — review-video script, AI imagery generation and selection, documentation',
      crOrigin: 'Original assets',
      cr6: '<b>Algorithm</b>: implemented from the published theories of Bretagnon &amp; Francou (1988, VSOP87) and Meeus, <i>Astronomical Algorithms</i> (1998); no third-party astronomy library code was copied.',
      cr7: '<b>Visual assets</b>: the 24 phenology illustrations, sundial, ecliptic ring, star field, terminator and swatches are all program-generated or hand-drawn SVG — no external images or font files.',
      cr8: '<b>Text</b>: glossary definitions, phenology notes and civilisational comparisons are written by the team; the official term table is a validation baseline only and never enters the runtime.',
      crSource: 'Algorithms & data sources',
      cr9: '<b>Algorithms</b>: VSOP87D Earth series (IMCCE public data), Meeus §22 nutation / §25 solar position / §28 equation of time / §13 horizontal coordinates, Espenak–Meeus ΔT polynomials.',
      cr10: '<b>Baseline</b>: Hong Kong Observatory, <i>Times of the 24 Solar Terms</i>, 96 entries for 2024–2027 (upstream data from HM Nautical Almanac Office / USNO), retrieved 2026-10-18.',
      cr11: '<b>Literature</b>: Yizhoushu, Yueling qishier hou jijie, Rites of Zhou and other public classical texts; the 24 solar terms were inscribed by UNESCO in 2016.',
      crAI: 'AI disclosure',
      cr12: '<b>Where AI was used</b>: code scaffolding and first-draft copy were produced with AI assistance; the algorithm, numerical validation and every conclusion were reviewed line by line and verified by team members. Every instant shown is computed live — no table is embedded.',
      cr13: '<b>AI imagery</b>: the review video and atmosphere images were produced with video/image models on a remote GPU and are disclosed in the list below; the web page does <b>not</b> depend on them.',
      cr14: '<b>Not AI-generated</b>: the astronomical algorithm, test scripts, geometric rules of the phenology illustrations, the colour system and all comparison results against official data.',
      crPending: 'AI imagery slots still to fill (currently replaced by procedurally generated star fields and light)',
      footNote: 'The 24 solar terms as a computable solar calendar, in dialogue with the world’s time systems ｜ National Student Digital Media Competition · International Special Track ｜ 2026',
      backTop: 'Back to top',
      lng: 'N', lgs: 'S', alt: 'Solar altitude', az: 'Azimuth', dec: 'Declination', ha: 'Hour angle',
      shadowLen: 'Shadow length', shadowRatio: 'Shadow ratio', noonShadow: 'Noon shadow', dayLen: 'Day length',
      sunrise: 'Sunrise', sunset: 'Sunset', eot: 'Equation of time', noShadow: 'No shadow (Sun below horizon)',
      noShadowShort: 'No shadow', sunBelow: 'The Sun is below the horizon',
      sunBelowNote: 'At this instant the Sun is below the horizon (negative altitude), so the gnomon casts no shadow and there is no measurable length. Drag “true solar time” between sunrise and sunset and the shadow reappears.',
      obsSample: 'Current sample',
      yearMax: 'Year maximum (winter solstice)', yearMin: 'Year minimum (summer solstice)', atNoon: 'noon',
      termLongitude: 'Solar longitude', bjTime: 'Beijing time (UTC+8)', utcTime: 'UTC',
      directLat: 'Subsolar latitude', beijingNoonShadow: 'Noon shadow in Beijing (post 2 m)',
      pentadsTitle: 'Three pentads', plantsFW: 'Flower-wind letters', plantsSeasonal: 'Plants of the season',
      farmTitle: 'Farm work', selTerm: 'Select a term', ringHint: 'The 360° ecliptic divided into 24 sectors; click a sector for details.',
      years: 'Years', curTerm: 'Current term', nextTerm: 'Next term', inDays: 'To next term',
      solarSpeed: 'Longitude rate', sunDist: 'Earth–Sun distance', cardTerm: 'Term',
      zodiac: 'Zodiac', inSign: 'Degree in sign', subsolar: 'Subsolar point',
      termNowTitle: 'Term position now', nearNone: 'none', day: 'd', hours: 'h', min: 'min',
      before: '', after: '', sameDay: 'same day', notThisYear: '—',
      ruleTerm: 'Solved by term algorithm (longitude 15°×k)', ruleFixed: 'Fixed calendar date (traditional)', ruleApprox: 'Conventional/approximate Gregorian date',
      copyOk: 'Colour copied', copied: 'Copied',
      expDone: 'generated and downloaded', expTermsTitle: 'Tianshi · Instants of the 24 Solar Terms',
      expCityTitle: 'Tianshi · City shadow and day-length table', expNote: 'Computed live by astro.js (VSOP87D apparent longitude + ΔT); generated at',
      expTermsCount: '24 term instants',
      tableSeq: 'No.', tableTerm: 'Term', tableLon: 'Solar longitude', tableBj: 'Beijing time', tableUtc: 'UTC', tableHou: 'First pentad',
      tableDate: 'Date', tableAlt: 'Noon altitude', tableShadow: 'Noon shadow', tableRatio: 'Shadow ratio',
      tableDayLen: 'Day length', tableRise: 'Sunrise', tableSet: 'Sunset',
      layerTerms: 'Chinese 24 solar terms', layerZodiac: 'Western zodiac', layerFest: 'Solar-node festivals', layerSub: 'Subsolar point & terminator',
      lanternOn: 'Layers', allSeasons: 'All', fwBadge: 'Flower wind',
      ariaNotice: 'Results updated'
    }
  };

  function t(key) {
    const d = I18N[LANG] || I18N.zh;
    return (d[key] !== undefined) ? d[key] : (I18N.zh[key] !== undefined ? I18N.zh[key] : key);
  }
  /** 中英双名：LANG=zh 返回中文，否则返回英文 */
  const pick = (zh, en) => (LANG === 'zh' ? zh : en);

  function applyI18n() {
    document.documentElement.lang = LANG === 'zh' ? 'zh-CN' : 'en';
    $$('[data-i18n]').forEach((el) => {
      const v = t(el.getAttribute('data-i18n'));
      if (v.indexOf('<') >= 0) { el.innerHTML = v; } else { el.textContent = v; }
    });
    $$('[data-i18n-ph]').forEach((el) => { el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph'))); });
    // 图注里的顶点数由 LAND 数据当场统计（不写死），改数据不必改文案
    const wcap = $('[data-i18n="worldCap"]');
    if (wcap) wcap.textContent = wcap.textContent.replace('{N}', String(wmLandStats().points));
    const mt = $('#motionToggle');
    if (mt) {
      mt.setAttribute('aria-pressed', REDUCED ? 'false' : 'true');
      mt.lastElementChild.textContent = REDUCED ? t('motionOff') : t('motionOn');
    }
    $('#langZh').classList.toggle('on', LANG === 'zh');
    $('#langEn').classList.toggle('on', LANG === 'en');
    $('#langZh').setAttribute('aria-pressed', LANG === 'zh');
    $('#langEn').setAttribute('aria-pressed', LANG === 'en');
  }

  function setLang(l) {
    if (LANG === l) return;
    LANG = l;
    applyI18n();
    renderAll();
  }

  /* --------------------------------------------------------- 通用格式化 */
  const pad2 = (n) => (n < 10 ? '0' : '') + n;
  function fmtDeg(x, digits) { return (x >= 0 ? '' : '−') + Math.abs(x).toFixed(digits === undefined ? 2 : digits) + '°'; }
  function fmtHM(hours) {
    if (!isFinite(hours)) return '—';
    let h = Math.floor(hours), m = Math.round((hours - h) * 60);
    if (m === 60) { m = 0; h += 1; }
    h = ((h % 24) + 24) % 24;
    return pad2(h) + ':' + pad2(m);
  }
  function fmtHours(h) {
    if (!isFinite(h)) return '—';
    const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return hh + ' h ' + pad2(mm) + ' m';
  }
  function latLabel(lat) { return Math.abs(lat).toFixed(1) + '°' + (lat >= 0 ? 'N' : 'S'); }
  function jdOfDay(year, doy) { return A.jdFromUTC(year, 1, 1, 0, 0, 0) + (doy - 1); }
  function dateOfDay(year, doy) { const c = A.calendarFromJD(jdOfDay(year, doy)); return { y: c.year, m: c.month, d: c.day }; }
  function isoDate(year, doy) { const d = dateOfDay(year, doy); return d.y + '-' + pad2(d.m) + '-' + pad2(d.d); }
  function isoDateOfJD(jd, tz) {
    const c = A.jdToCalendar(jd, tz || 0);
    return c.year + '-' + pad2(c.month) + '-' + pad2(c.day);
  }
  function doyOfJD(jd) {
    const c = A.calendarFromJD(jd);
    return Math.round(jd - A.jdFromUTC(c.year, 1, 1, 0, 0, 0)) + 1;
  }
  function doyOfDate(month, day) {
    const jd = A.jdFromUTC(2025, month, day, 0, 0, 0);
    return Math.round(jd - A.jdFromUTC(2025, 1, 1, 0, 0, 0)) + 1;
  }

  /* 节气缓存（按年） */
  const termCache = {};
  function termsOfYear(year) {
    if (!termCache[year]) termCache[year] = A.solarTermsOfYear(year);
    return termCache[year];
  }
  function phenoOfK(k) { return PHENO.byK(k); }
  function termColor(k) {
    const c = WORLD.TERM_COLORS.find((x) => x.k === k);
    return c ? oklchToHex(c.l, c.c, c.h) : '#8fb8c9';
  }

  /* ------------------------------------------------- OKLCH → sRGB（section 7） */
  function oklchToRgb(L, C, H) {
    const hr = H * Math.PI / 180;
    const a = C * Math.cos(hr), b = C * Math.sin(hr);
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    const l3 = l_ * l_ * l_, m3 = m_ * m_ * m_, s3 = s_ * s_ * s_;
    let r = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
    const gam = (x) => {
      x = Math.max(0, Math.min(1, x));
      return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    };
    r = gam(r); g = gam(g); bl = gam(bl);
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(bl * 255) };
  }
  function oklchToHex(L, C, H) {
    const c = oklchToRgb(L, C, H);
    const h2 = (n) => pad2(n.toString(16)).slice(-2);
    return '#' + h2(c.r) + h2(c.g) + h2(c.b);
  }
  function oklchStr(L, C, H) { return 'oklch(' + L.toFixed(2) + ' ' + C.toFixed(3) + ' ' + H.toFixed(0) + ')'; }

  /* 简单安全写 HTML */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* 把数字"播报"给读屏器（不做自动清空，保留最后一次计算结果） */
  function announce(el, msg) {
    if (!el) return;
    el.textContent = msg;
  }

  /* ==================================================================
   * 1 · 封面：程序生成星场 + 实时日晷
   * ================================================================== */
  function initCover() {
    const cv = $('#coverCanvas');
    const ctx = cv.getContext('2d');
    let stars = [], w = 0, h = 0, raf = null, phase = 0;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // 用固定种子的伪随机数生成星点，保证每次刷新图案一致
      let seed = 20260321;
      const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
      stars = [];
      const n = Math.round(Math.min(340, (w * h) / 5200));
      for (let i = 0; i < n; i++) {
        stars.push({
          x: rnd() * w, y: rnd() * h,
          r: 0.35 + rnd() * 1.15,
          a: 0.18 + rnd() * 0.62,
          ph: rnd() * Math.PI * 2,
          sp: 0.4 + rnd() * 1.1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      // 星点
      for (const s of stars) {
        const tw = REDUCED ? 1 : (0.72 + 0.28 * Math.sin(phase * s.sp + s.ph));
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = s.r > 1.05 ? '#ecdcb8' : '#cfe3ec';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      // 一条淡淡的黄道弧线（示意，非数据）
      ctx.globalAlpha = 0.14;
      ctx.strokeStyle = '#c8a35a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-40, h * 0.86);
      ctx.quadraticCurveTo(w * 0.5, h * 0.30, w + 40, h * 0.78);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function loop() {
      phase += 0.008;
      draw();
      raf = requestAnimationFrame(loop);
    }

    resize();
    draw();
    window.addEventListener('resize', () => { resize(); draw(); });
    if (!REDUCED) loop();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } }
      else if (!REDUCED && !raf) loop();
    });

    renderCoverDial();
  }

  /** 封面日晷：晷面刻度 + 由"此刻太阳时角"决定的指针与影 */
  function renderCoverDial() {
    const g = $('#coverDialG');
    if (!g) return;
    const cx = 160, cy = 160, R = 138;
    const lat = 39.9, lon = 116.4;
    const pos = A.sunAltitudeAzimuth(NOW_JD, lat, lon);
    const lst = A.localSiderealTime(NOW_JD, lon);
    const ra = A.sunRightAscension(NOW_JD);
    const H = A.norm180(lst - ra);         // 时角（度）
    const sunLon = A.sunApparentLongitude(NOW_JD);
    const near = A.surroundTerms(NOW_JD);
    const isDay = pos.altitude > 0;

    let s = '';
    // 盘面
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(7,14,20,.5)" stroke="rgba(200,163,90,.5)" stroke-width="1.2"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R - 14}" fill="none" stroke="rgba(143,184,201,.22)" stroke-width="1"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R * 0.55}" fill="none" stroke="rgba(143,184,201,.16)" stroke-width="1"/>`;
    // 12 时辰刻度（每 15° 一条，整点长刻度）
    for (let i = 0; i < 24; i++) {
      const ang = (i * 15 - 90) * Math.PI / 180;
      const long = i % 2 === 0;
      const r1 = R - (long ? 14 : 8), r2 = R;
      s += `<line x1="${(cx + Math.cos(ang) * r1).toFixed(1)}" y1="${(cy + Math.sin(ang) * r1).toFixed(1)}"
             x2="${(cx + Math.cos(ang) * r2).toFixed(1)}" y2="${(cy + Math.sin(ang) * r2).toFixed(1)}"
             stroke="rgba(200,163,90,${long ? 0.55 : 0.25})" stroke-width="${long ? 1.2 : 0.8}"/>`;
    }
    // 晷针（指向时角方向）与影
    const hAng = (H - 90) * Math.PI / 180;
    const tipX = cx + Math.cos(hAng) * (R - 26), tipY = cy + Math.sin(hAng) * (R - 26);
    // 时辰方位字
    [['子', 0], ['卯', 90], ['午', 180], ['酉', 270]].forEach((q, i) => {
      const a = (i * 90 + 180 - 90) * Math.PI / 180;
      const tx = cx + Math.cos((i * 90 + 180 - 90) * Math.PI / 180) * (R - 6);
      const ty = cy + Math.sin((i * 90 + 180 - 90) * Math.PI / 180) * (R - 6);
      s += `<text x="${tx.toFixed(1)}" y="${(ty + 4).toFixed(1)}" text-anchor="middle" font-size="10"
             fill="rgba(200,163,90,.55)" font-family="Georgia,serif">${q[0]}</text>`;
    });
    if (isDay) {
      const sx = cx - Math.cos(hAng) * (R - 26), sy = cy - Math.sin(hAng) * (R - 26);
      s += `<line x1="${cx}" y1="${cy}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}"
             stroke="rgba(200,163,90,.85)" stroke-width="2.4" stroke-linecap="round"/>`;
      s += `<line x1="${cx}" y1="${cy}" x2="${tipX.toFixed(1)}" y2="${tipY.toFixed(1)}"
             stroke="rgba(236,230,218,.55)" stroke-width="1" stroke-dasharray="3 4"/>`;
      s += `<circle cx="${tipX.toFixed(1)}" cy="${tipY.toFixed(1)}" r="4.5" fill="#ecdcb8"/>`;
      s += `<circle cx="${tipX.toFixed(1)}" cy="${tipY.toFixed(1)}" r="11" fill="rgba(236,220,184,.18)"/>`;
    } else {
      // 夜间：晷针仍按当前时角虚绘，另加星点，避免盘面空落
      s += `<line x1="${cx}" y1="${cy}" x2="${tipX.toFixed(1)}" y2="${tipY.toFixed(1)}"
             stroke="rgba(143,184,201,.5)" stroke-width="1.4" stroke-dasharray="2 5"/>`;
      s += `<circle cx="${tipX.toFixed(1)}" cy="${tipY.toFixed(1)}" r="3" fill="#8fb8c9"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="4" fill="#8fb8c9"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="16" fill="rgba(143,184,201,.12)"/>`;
      s += `<text x="${cx}" y="${cy + 34}" text-anchor="middle" font-size="10"
             fill="rgba(143,184,201,.8)" font-family="ui-monospace,monospace">NIGHT 夜</text>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="3" fill="rgba(200,163,90,.9)"/>`;
    s += `<text x="${cx}" y="${cy + R - 28}" text-anchor="middle" font-size="9"
            fill="rgba(236,230,218,.4)" font-family="ui-monospace,monospace">GNOMON · 赤道式日晷</text>`;
    g.innerHTML = s;

    const capEl = $('#coverDialCap');
    if (capEl) {
      const line1 = pick('太阳黄经 ', 'longitude ') + sunLon.toFixed(2) + '°　' +
        pick('赤纬 ', 'declination ') + fmtDeg(pos.declination) + '　' +
        pick('时角 ', 'hour angle ') + fmtDeg(H, 1);
      const line2 = pick('此刻行至「' + (near.prev ? near.prev.name : '—') + '」之后',
        'currently after “' + (near.prev ? near.prev.nameEn : '—') + '”') +
        ' · ' + pick(isDay ? '北京日间' : '北京夜间', isDay ? 'daytime in Beijing' : 'night in Beijing');
      capEl.innerHTML = esc(line1) + '<br>' + esc(line2);
    }
  }

  /* ==================================================================
   * 2 · 日影台（圭表模拟）
   * ================================================================== */
  const obs = { lat: 39.9, year: DEFAULT_YEAR, doy: 265, tst: 12, gh: 2 };

  /**
   * 日影台默认示例态：**春分正午**。
   * 春分赤纬≈0，任何可选纬度（|lat| ≤ 66°）的正午高度角都≥24°，必有可测影长，
   * 因此首屏/未操作时就能看到真实数值，而不是一排破折号。
   */
  function obsDefaultDoy() {
    const t0 = termsOfYear(DEFAULT_YEAR).find((x) => x.k === 0);
    if (!t0) return 80;
    const c = A.jdToCalendar(t0.jdUT, 8);
    return doyOfJD(A.jdFromUTC(c.year, c.month, c.day, 0, 0, 0));
  }

  function initObservatory() {
    obs.doy = obsDefaultDoy();
    obs.tst = 12;
    // 滑块位置与状态对齐（避免"滑块停在一处、读数说的是另一处"）
    $('#latSlider').value = obs.lat;
    $('#dateSlider').value = obs.doy;
    $('#timeSlider').value = obs.tst;
    $('#gnomonSlider').value = obs.gh;

    const presetBox = $('#latPresets');
    renderObsPresets();
    presetBox.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lat]');
      if (!b) return;
      obs.lat = parseFloat(b.dataset.lat);
      $('#latSlider').value = obs.lat;
      updateObs();
    });

    $('#datePresets').addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]');
      if (!b) return;
      const term = termsOfYear(obs.year).find((x) => x.k === parseInt(b.dataset.k, 10));
      if (!term) return;
      const c = A.jdToCalendar(term.jdUT, 8);
      obs.doy = doyOfJD(A.jdFromUTC(c.year, c.month, c.day, 0, 0, 0));
      $('#dateSlider').value = obs.doy;
      updateObs();
    });

    $('#latSlider').addEventListener('input', (e) => { obs.lat = parseFloat(e.target.value); updateObs(); });
    $('#dateSlider').addEventListener('input', (e) => { obs.doy = parseInt(e.target.value, 10); updateObs(); });
    $('#timeSlider').addEventListener('input', (e) => { obs.tst = parseFloat(e.target.value); updateObs(); });
    $('#gnomonSlider').addEventListener('input', (e) => { obs.gh = parseFloat(e.target.value); updateObs(); });
    updateObs();
  }

  function updateObs() {
    const year = obs.year;
    const d = dateOfDay(year, obs.doy);
    const jd0 = A.jdFromUTC(d.y, d.m, d.d, 0, 0, 0);
    const jd = jd0 + obs.tst / 24;
    const dec = A.solarDeclination(jd);
    const H = (obs.tst - 12) * 15;
    const latR = obs.lat * Math.PI / 180, decR = dec * Math.PI / 180, HR = H * Math.PI / 180;
    let alt = Math.asin(Math.sin(latR) * Math.sin(decR) + Math.cos(latR) * Math.cos(decR) * Math.cos(HR)) * 180 / Math.PI;
    let az = Math.atan2(-Math.sin(HR) * Math.cos(decR),
      Math.sin(decR) * Math.cos(latR) - Math.cos(decR) * Math.sin(latR) * Math.cos(HR)) * 180 / Math.PI;
    az = (az + 360) % 360;

    const sh = A.shadowLength(alt, obs.gh);
    // 正午影长（今日）
    const altNoon = Math.asin(Math.sin(latR) * Math.sin(decR) + Math.cos(latR) * Math.cos(decR)) * 180 / Math.PI;
    const shNoon = A.shadowLength(altNoon, obs.gh);
    // 当年最长 / 最短影长
    const tSummer = termsOfYear(year).find((x) => x.k === 6);
    const tWinter = termsOfYear(year).find((x) => x.k === 18);
    const decS = A.solarDeclination(tSummer.jdUT), decW = A.solarDeclination(tWinter.jdUT);
    const altS = 90 - Math.abs(obs.lat - decS), altW = 90 - Math.abs(obs.lat - decW);
    const shS = A.shadowLength(altS, obs.gh), shW = A.shadowLength(altW, obs.gh);

    // 日出日落（真太阳时）
    const H0 = A.hourAngleForAltitude(obs.lat, dec, -0.8333);
    const dayLen = 2 * H0 / 15;
    const rise = 12 - H0 / 15, set = 12 + H0 / 15;
    const eot = A.equationOfTime(jd);

    // 界面数值
    $('#latValue').textContent = latLabel(obs.lat);
    $('#dateValue').textContent = d.y + '-' + pad2(d.m) + '-' + pad2(d.d);
    $('#timeValue').textContent = fmtHM(obs.tst);
    $('#gnomonValue').textContent = obs.gh.toFixed(1) + ' m';

    // 太阳是否在地平线上：这决定"有没有影"，而不是"有没有读数"
    const below = !(alt > 0.05);
    const rows = [
      [t('alt'), fmtDeg(alt)],                                   // 地平线下给出负值，仍是真实数值
      [t('az'), fmtDeg(az)],                                     // 方位角任何时刻都有定义
      [t('dec'), fmtDeg(dec)],
      [t('ha'), fmtDeg(H, 1)],
      [t('shadowLen'), below ? t('noShadow') : sh.length.toFixed(3) + ' m'],
      [t('shadowRatio'), below ? t('noShadowShort') : sh.ratio.toFixed(3)],
      [t('noonShadow'), shNoon.length === Infinity ? t('noShadow') : shNoon.length.toFixed(3) + ' m'],
      [t('dayLen'), fmtHours(dayLen)]
    ];
    $('#obsGrid').innerHTML = rows.map((r) =>
      `<div class="readout"><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('');

    // 状态说明：在地平线下 → 明确写出"太阳在地平线下"；否则给出这一刻的示例读数
    const stateHtml = below
      ? `<div class="obs-state below"><b>${esc(t('sunBelow'))}</b><span>${esc(t('sunBelowNote'))}</span></div>`
      : `<div class="obs-state"><b>${esc(t('obsSample'))}</b><span>${esc(
        d.y + '-' + pad2(d.m) + '-' + pad2(d.d) + ' · ' + latLabel(obs.lat) + ' · ' +
        t('time') + ' ' + fmtHM(obs.tst) + ' · ' + t('alt') + ' ' + fmtDeg(alt) +
        ' → ' + t('shadowLen') + ' ' + sh.length.toFixed(2) + ' m')}</span></div>`;

    // 对照块
    const curTerm = nearestTerm(jd0 + 0.5);
    $('#obsExtra').innerHTML = stateHtml + `
      <div class="cmp-row"><span>${esc(t('sunrise'))} / ${esc(t('sunset'))}（${LANG === 'zh' ? '真太阳时' : 'true solar time'}）</span>
        <em>${dayLen >= 23.99 ? '—' : fmtHM(rise) + ' / ' + fmtHM(set)}</em></div>
      <div class="cmp-row"><span>${esc(t('eot'))}</span><em>${(eot >= 0 ? '+' : '−') + Math.abs(eot).toFixed(2)} min</em></div>
      <div class="cmp-row"><span>${esc(t('yearMax'))}</span><em>${shW.length === Infinity ? '—' : shW.length.toFixed(3) + ' m'}</em></div>
      <div class="cmp-row"><span>${esc(t('yearMin'))}</span><em>${shS.length === Infinity ? '—' : shS.length.toFixed(3) + ' m'}</em></div>
      <div class="cmp-row"><span>${esc(pick('当前所处节气', 'Current term'))}</span><em>${esc(curTerm ? pick(curTerm.name, curTerm.nameEn) : '—')}</em></div>`;

    drawDial(alt, az, sh.ratio, latLabel(obs.lat));
    syncObsPresets();
    announce($('#obsLive'), pick('日影台已更新：', 'Shadow terrace updated: ') +
      (below
        ? pick('当前真太阳时太阳在地平线下（高度角 ', 'The Sun is below the horizon (altitude ') +
          fmtDeg(alt) + pick('），竖表不投影。', '); the gnomon casts no shadow.')
        : pick('太阳高度角 ', 'altitude ') + alt.toFixed(2) + '°，' + pick('影长 ', 'shadow ') + sh.length.toFixed(2) + ' m'));
  }

  /** 地平盘绘制：方位圆 + 影长线 + 太阳位置 */
  function drawDial(alt, az, ratio, latTxt) {
    const cx = 210, cy = 210, R = 172;
    const scaleRatio = 3.0;                     // 外圈 = 影长比 3.0
    let s = '';
    // 方位刻度
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="rgba(7,14,20,.45)" stroke="rgba(143,184,201,.42)" stroke-width="1.4"/>`;
    [1, 2].forEach((v) => {
      const r = R * v / scaleRatio;
      s += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="rgba(143,184,201,.16)" stroke-width="1" stroke-dasharray="2 5"/>`;
      s += `<text x="${(cx - r * 0.707 - 3).toFixed(1)}" y="${(cy - r * 0.707 + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="rgba(236,230,218,.4)"
             font-family="ui-monospace,monospace">${v.toFixed(1)}</text>`;
    });
    for (let a = 0; a < 360; a += 15) {
      const ang = (a - 90) * Math.PI / 180;
      const long = a % 90 === 0;
      const r1 = R - (long ? 12 : 6);
      s += `<line x1="${(cx + Math.cos(ang) * r1).toFixed(1)}" y1="${(cy + Math.sin(ang) * r1).toFixed(1)}"
             x2="${(cx + Math.cos(ang) * R).toFixed(1)}" y2="${(cy + Math.sin(ang) * R).toFixed(1)}"
             stroke="rgba(143,184,201,${long ? .55 : .22})" stroke-width="${long ? 1.2 : .8}"/>`;
    }
    ['N', 'E', 'S', 'W'].forEach((lab, i) => {
      const ang = (i * 90 - 90) * Math.PI / 180;
      s += `<text x="${(cx + Math.cos(ang) * (R - 26)).toFixed(1)}" y="${(cy + Math.sin(ang) * (R - 26) + 4).toFixed(1)}"
             text-anchor="middle" font-size="12" fill="rgba(236,220,184,.8)" font-family="Georgia,serif">${lab}</text>`;
    });
    // 影长线（与太阳方位相反）
    if (alt > 0 && isFinite(ratio)) {
      const shAng = ((az + 180) - 90) * Math.PI / 180;
      const len = Math.min(R, R * ratio / scaleRatio);
      const ex = cx + Math.cos(shAng) * len, ey = cy + Math.sin(shAng) * len;
      s += `<line x1="${cx}" y1="${cy}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"
             stroke="rgba(200,163,90,.9)" stroke-width="3" stroke-linecap="round"/>`;
      s += `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="4" fill="#ecdcb8"/>`;
      // 太阳方位
      const sunAng = (az - 90) * Math.PI / 180;
      const sr = R * (1 - Math.min(0.72, Math.max(0, alt) / 90 * 0.72));
      const sx = cx + Math.cos(sunAng) * sr, sy = cy + Math.sin(sunAng) * sr;
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="7" fill="rgba(236,220,184,.92)"/>`;
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="16" fill="rgba(236,220,184,.14)"/>`;
      s += `<line x1="${cx}" y1="${cy}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}"
             stroke="rgba(236,230,218,.28)" stroke-width="1" stroke-dasharray="3 5"/>`;
    } else {
      // 太阳在地平线下：给出方位（虚线，示意"太阳在那一侧的地平线下"）+ 一句明确说明
      const sunAng = (az - 90) * Math.PI / 180;
      const sr = R - 34;
      const sx = cx + Math.cos(sunAng) * sr, sy = cy + Math.sin(sunAng) * sr;
      s += `<line x1="${cx}" y1="${cy}" x2="${sx.toFixed(1)}" y2="${sy.toFixed(1)}"
             stroke="rgba(143,184,201,.34)" stroke-width="1" stroke-dasharray="4 5"/>`;
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="7" fill="none"
             stroke="rgba(143,184,201,.7)" stroke-width="1.4" stroke-dasharray="3 3"/>`;
      s += `<text x="${cx}" y="${cy + 24}" text-anchor="middle" font-size="12.5" fill="rgba(226,196,150,.95)"
             font-family="-apple-system,'Noto Sans SC',sans-serif">${esc(t('sunBelow'))}</text>`;
      s += `<text x="${cx}" y="${cy + 43}" text-anchor="middle" font-size="11" fill="rgba(143,184,201,.8)"
             font-family="ui-monospace,monospace">${esc(t('alt') + ' ' + fmtDeg(alt, 1))}</text>`;
    }
    // 中心竖表
    s += `<rect x="${cx - 7}" y="${cy - 7}" width="14" height="14" fill="rgba(14,26,36,1)"
           stroke="rgba(200,163,90,.95)" stroke-width="1.6"/>`;

    s += `<text x="14" y="24" font-size="10.5" fill="rgba(143,184,201,.7)" font-family="ui-monospace,monospace">${esc(latTxt)}</text>`;
    $('#dialG').innerHTML = s;
  }

  /** 距给定时刻最近的"上一交节"（用当年缓存，避免反复求解） */
  function nearestTerm(jd) {
    const y = A.calendarFromJD(jd).year;
    const list = termsOfYear(y);
    let prev = null;
    for (const x of list) { if (x.jdUT <= jd) prev = x; }
    if (!prev) {
      const prevYear = termsOfYear(y - 1);
      return prevYear[prevYear.length - 1];
    }
    return prev;
  }

  /* ==================================================================
   * 3 · 节气历
   * ================================================================== */
  const calState = { year: DEFAULT_YEAR, view: 'list', k: 6 };

  function initCalendar() {
    $('#calYears').innerHTML = YEARS.map((y) =>
      `<button class="chip${y === calState.year ? ' on' : ''}" data-year="${y}" type="button">${y}</button>`).join('');
    $('#calYears').addEventListener('click', (e) => {
      const b = e.target.closest('[data-year]');
      if (!b) return;
      calState.year = parseInt(b.dataset.year, 10);
      $$('#calYears .chip').forEach((c) => c.classList.toggle('on', parseInt(c.dataset.year, 10) === calState.year));
      renderCalendar();
    });
    $('#calView').addEventListener('click', (e) => {
      const b = e.target.closest('[data-view]');
      if (!b) return;
      calState.view = b.dataset.view;
      $$('#calView button').forEach((x) => x.classList.toggle('on', x.dataset.view === calState.view));
      renderCalendar();
    });
    renderCalendar();
  }

  function renderCalendar() {
    const list = termsOfYear(calState.year);
    const isList = calState.view === 'list';
    $('#calList').hidden = !isList;
    $('#calRing').hidden = isList;
    if (isList) { renderCalList(list); } else { renderCalRing(list); }
    renderCalDetail(list);
  }

  function renderCalList(list) {
    const head = `<div class="cal-head"><span>#</span><span>${esc(t('cardTerm'))}</span><span>${esc(t('tableLon'))}</span>
      <span>${esc(t('bjTime'))}</span><span>${esc(t('utcTime'))}</span></div>`;
    const rows = list.map((x) => {
      const ph = phenoOfK(x.k);
      return `<button class="cal-row${x.k === calState.k ? ' on' : ''}" data-k="${x.k}" type="button">
        <span class="idx">${pad2(x.seq)}</span>
        <span class="nm">${esc(pick(x.name, x.nameEn || x.name))}</span>
        <span class="deg">${x.longitude.toFixed(0)}°</span>
        <span class="tm">${esc(x.beijingStr)}</span>
        <span class="utc">${esc(x.utcStr)}</span>
      </button>`;
    }).join('');
    $('#calList').innerHTML = head + rows;
    $('#calList').onclick = (e) => {
      const b = e.target.closest('[data-k]');
      if (!b) return;
      calState.k = parseInt(b.dataset.k, 10);
      renderCalendar();
    };
  }

  function polar(cx, cy, r, angDeg) {
    const a = angDeg * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  function ringPath(cx, cy, r1, r2, a1, a2) {
    const [x1, y1] = polar(cx, cy, r2, a1), [x2, y2] = polar(cx, cy, r2, a2);
    const [x3, y3] = polar(cx, cy, r1, a2), [x4, y4] = polar(cx, cy, r1, a1);
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r2},${r2} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}
            L${x3.toFixed(2)},${y3.toFixed(2)} A${r1},${r1} 0 ${large} 0 ${x4.toFixed(2)},${y4.toFixed(2)} Z`;
  }

  function renderCalRing(list) {
    const S = 700, cx = S / 2, cy = S / 2, R = 302, r2 = R * 0.66;
    const ang = (lon) => lon - 90;              // 黄经 0°（春分）在正上方，顺时针递增
    let s = `<svg viewBox="0 0 ${S} ${S}" role="img" aria-label="二十四节气环：黄道 360 度等分 24 格，按太阳黄经排列">`;
    // 外圈与刻度
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="rgba(143,184,201,.35)" stroke-width="1.2"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="rgba(143,184,201,.28)" stroke-width="1"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R * 0.30}" fill="none" stroke="rgba(200,163,90,.18)" stroke-width="1"/>`;
    for (let lon = 0; lon < 360; lon += 15) {
      const [x1, y1] = polar(cx, cy, R, ang(lon));
      const [x2, y2] = polar(cx, cy, R + 8, ang(lon));
      s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
             stroke="rgba(200,163,90,${lon % 90 === 0 ? .8 : .35})" stroke-width="${lon % 90 === 0 ? 1.6 : 1}"/>`;
    }
    // 季节弧（按节气传统划分：春 315°–45°、夏 45°–135°、秋 135°–225°、冬 225°–315°）
    [[LANG === 'zh' ? '春' : 'SPR', 315, 405, 20], [LANG === 'zh' ? '夏' : 'SUM', 45, 135, 92],
     [LANG === 'zh' ? '秋' : 'AUT', 135, 225, 182], [LANG === 'zh' ? '冬' : 'WIN', 225, 315, 272]].forEach((q) => {
      const [lab, a1, a2, mid] = q;
      s += `<path d="${ringPath(cx, cy, R * 0.40, R * 0.45, ang(a1) + 0.8, ang(a2) - 0.8)}"
             fill="rgba(143,184,201,.10)"/>`;
      const [tx, ty] = polar(cx, cy, R * 0.425, ang(mid));
      s += `<text class="ring-season" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" text-anchor="middle">${lab}</text>`;
    });
    // 24 扇区
    list.forEach((x) => {
      const lon = x.longitude;
      const a1 = ang(lon - 7.5) + 0.7, a2 = ang(lon + 7.5) - 0.7;
      const on = x.k === calState.k;
      const col = termColor(x.k);
      s += `<g class="ring-sector${on ? ' on' : ''}" data-k="${x.k}" tabindex="0" role="button"
             aria-label="${esc(x.name)} ${esc(x.beijingStr)}">
        <path class="ring-hit" d="${ringPath(cx, cy, r2, R, a1, a2)}"
              fill="${on ? 'rgba(200,163,90,.22)' : 'rgba(255,255,255,.02)'}"
              stroke="${on ? col : 'rgba(143,184,201,.28)'}" stroke-width="${on ? 2 : 1}"/>`;
      const [lx, ly] = polar(cx, cy, (R + r2) / 2, ang(lon));
      s += `<text class="ring-label" x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle">${esc(x.name)}</text>`;
      const [dx, dy] = polar(cx, cy, r2 - 16, ang(lon));
      s += `<text class="ring-deg" x="${dx.toFixed(1)}" y="${(dy + 3).toFixed(1)}" text-anchor="middle">${lon}°</text>`;
      s += `</g>`;
    });
    // 中心：年份 + 当前直射纬度
    const sel = list.find((x) => x.k === calState.k) || list[0];
    const dec = A.solarDeclination(sel.jdUT);
    s += `<text x="${cx}" y="${cy - 14}" text-anchor="middle" font-size="15" fill="rgba(236,230,218,.6)"
           font-family="ui-monospace,monospace">${calState.year}</text>`;
    s += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="24" fill="#ecdcb8"
           font-family="Georgia,serif">${esc(sel.name)}</text>`;
    s += `<text x="${cx}" y="${cy + 34}" text-anchor="middle" font-size="12" fill="rgba(143,184,201,.85)"
           font-family="ui-monospace,monospace">δ ${fmtDeg(dec)}</text>`;
    // "此刻"标记
    const nowLon = A.sunApparentLongitude(NOW_JD);
    const [nx, ny] = polar(cx, cy, R + 4, ang(nowLon));
    s += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="4" fill="#8fb8c9"/>
           <circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="9" fill="rgba(143,184,201,.22)"/>`;
    s += `</svg>`;
    s += `<p class="fig-cap">${esc(t('ringHint'))}</p>`;
    const box = $('#calRing');
    box.innerHTML = s;
    box.querySelectorAll('.ring-sector').forEach((g) => {
      const act = () => { calState.k = parseInt(g.dataset.k, 10); renderCalendar(); };
      g.addEventListener('click', act);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
  }

  function renderCalDetail(list) {
    const x = list.find((y) => y.k === calState.k) || list[0];
    const ph = phenoOfK(x.k);
    const dec = A.solarDeclination(x.jdUT);
    const bjNoonShadow = A.shadowLength(90 - Math.abs(39.9 - dec), 2);
    const sunInfo = A.sunApparentPosition(x.jdUT);
    const el = $('#calDetail');
    el.innerHTML = `
      <p class="sec-kicker">${esc(t('termLongitude'))} ${x.longitude}°</p>
      <div class="detail-term">${esc(x.name)}</div>
      <div class="detail-en">${esc(LANG === 'zh' ? x.nameEn : x.name)} · ${esc(ph.pinyin || '')}</div>
      <div class="detail-time">${esc(x.beijingStr)} <small class="unit">UTC+8</small></div>
      <div class="detail-time" style="font-size:12.5px;color:var(--text-3)">${esc(x.utcStr)} <small class="unit">UTC</small></div>
      <dl>
        <div class="kv"><span>${esc(t('termLongitude'))}</span><b>${x.longitude.toFixed(0)}°</b></div>
        <div class="kv"><span>${esc(t('directLat'))}</span><b>${fmtDeg(dec)}</b></div>
        <div class="kv"><span>${esc(t('sunDist'))}</span><b>${sunInfo.distanceAU.toFixed(6)} AU</b></div>
        <div class="kv"><span>${esc(t('beijingNoonShadow'))}</span><b>${bjNoonShadow.length === Infinity ? '—' : bjNoonShadow.length.toFixed(3) + ' m'}</b></div>
        <div class="kv"><span>${esc(t('dayLen'))}（${pick('北京', 'Beijing')}）</span><b>${fmtHours(A.dayLength(x.jdUT, 39.9))}</b></div>
        <div class="kv"><span>${esc(pick('距上一节气', 'From previous'))}</span><b>${(() => {
          const prev = list.find((y) => y.seq === x.seq - 1);
          return prev ? (x.jdUT - prev.jdUT).toFixed(2) + ' ' + t('day') : '—';
        })()}</b></div>
      </dl>
      <div class="pentads">
        <p class="sec-kicker" style="font-size:10.5px">${esc(t('pentadsTitle'))}</p>
        ${ph.pentads.map((p, i) => `<div class="pentad"><i>${['初候', '二候', '三候'][i]}</i>
          <span>${esc(LANG === 'zh' ? p.zh : p.en)}${LANG === 'zh' ? ' <em style="font-style:normal;color:var(--text-4);font-size:11.5px">' + esc(p.en) + '</em>' : ''}</span></div>`).join('')}
      </div>
      <div class="pentads">
        <p class="sec-kicker" style="font-size:10.5px">${esc(ph.flowerWind ? t('plantsFW') : t('plantsSeasonal'))}</p>
        <div class="pheno-plants" style="font-size:12.5px">${ph.plants.map((p) => esc(LANG === 'zh' ? p.zh : p.en)).join(' · ')}</div>
      </div>`;
    announce($('#calLive'), pick('已选中 ', 'Selected ') + x.name + '，' + x.beijingStr +
      pick('，太阳直射纬度 ', ', subsolar latitude ') + fmtDeg(dec));
  }

  /* ==================================================================
   * 4 · 地球公转
   * ================================================================== */
  const orbitState = { view: 'orbit', doy: 265, playing: false, raf: null, year: DEFAULT_YEAR };
  const ORBIT_FA = 12;   // 日地距放大倍数（图上标注）

  function initOrbit() {
    $('#orbitView').addEventListener('click', (e) => {
      const b = e.target.closest('[data-view]');
      if (!b) return;
      orbitState.view = b.dataset.view;
      $$('#orbitView button').forEach((x) => x.classList.toggle('on', x.dataset.view === orbitState.view));
      $('#orbitCap').textContent = orbitState.view === 'orbit' ? t('orbitCap')
        : (LANG === 'zh' ? '直射点视图：上图为太阳直射纬度逐日曲线，下图为三条纬线的昼长曲线（含蒙气差修正）。'
          : 'Subsolar view: above, daily solar declination; below, day-length curves for three latitudes (with refraction).');
      renderOrbit();
    });
    const slider = $('#orbitSlider');
    slider.addEventListener('input', () => {
      orbitState.doy = parseFloat(slider.value);
      stopPlay();
      renderOrbit();
    });
    $('#orbitPlay').addEventListener('click', () => { orbitState.playing ? stopPlay() : startPlay(); });
    window.addEventListener('resize', () => renderOrbit());
    renderOrbit();
  }

  function startPlay() {
    if (REDUCED) { orbitState.doy = 265; renderOrbit(); return; }
    orbitState.playing = true;
    $('#orbitPlay').setAttribute('aria-pressed', 'true');
    $('#orbitPlay').firstElementChild.textContent = t('pause');
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(80, now - last); last = now;
      orbitState.doy += dt * 0.018;      // ≈ 18 日 / 秒
      if (orbitState.doy > 365) orbitState.doy -= 365;
      $('#orbitSlider').value = Math.round(orbitState.doy);
      renderOrbit();
      if (orbitState.playing) orbitState.raf = requestAnimationFrame(step);
    };
    orbitState.raf = requestAnimationFrame(step);
  }
  function stopPlay() {
    orbitState.playing = false;
    if (orbitState.raf) { cancelAnimationFrame(orbitState.raf); orbitState.raf = null; }
    const b = $('#orbitPlay');
    if (b) { b.setAttribute('aria-pressed', 'false'); b.firstElementChild.textContent = t('play'); }
  }

  /** 公转相关曲线缓存 */
  const curveCache = {};
  function yearCurves(year) {
    if (curveCache[year]) return curveCache[year];
    const arr = [];
    for (let doy = 1; doy <= 365; doy += 1) {
      const jd = jdOfDay(year, doy) + 0.5;
      const p = A.sunApparentPosition(jd);
      arr.push({
        doy: doy, jd: jd,
        lon: p.longitude, dec: A.solarDeclination(jd), R: p.distanceAU,
        dl39: A.dayLength(jd, 39.9), dl0: A.dayLength(jd, 0), dlS: A.dayLength(jd, -33.9)
      });
    }
    curveCache[year] = arr;
    return arr;
  }

  function renderOrbit() {
    const year = orbitState.year;
    const doy = Math.round(orbitState.doy);
    const d = dateOfDay(year, doy);
    $('#orbitDate').textContent = d.y + '-' + pad2(d.m) + '-' + pad2(d.d);

    const cur = yearCurves(year)[Math.min(364, doy - 1)];
    const jd = cur.jd;
    const lon = cur.lon;
    const rz = A.sunApparentLongitude(jd + 0.5) - A.sunApparentLongitude(jd - 0.5);
    const list = termsOfYear(year);
    let prev = null, next = null;
    list.forEach((x) => { if (x.jdUT <= jd) prev = x; else if (!next) next = x; });
    if (!next) next = termsOfYear(year + 1)[0];

    const rows = [
      [t('termLongitude'), lon.toFixed(3) + '°'],
      [t('directLat'), fmtDeg(cur.dec)],
      [t('sunDist'), cur.R.toFixed(6) + ' AU'],
      [t('solarSpeed'), rz.toFixed(4) + '°/d'],
      [t('dayLen') + '（' + pick('北京', 'Beijing') + '）', fmtHours(cur.dl39)],
      [t('dayLen') + '（' + pick('赤道', 'Equator') + '）', fmtHours(cur.dl0)],
      [t('dayLen') + '（' + pick('悉尼', 'Sydney') + '）', fmtHours(cur.dlS)],
      [t('curTerm'), prev ? pick(prev.name, prev.nameEn) : '—']
    ];
    $('#orbitGrid').innerHTML = rows.map((r) =>
      `<div class="readout"><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('');
    $('#orbitTerms').innerHTML = next
      ? `<b>${esc(t('nextTerm'))}</b> ${esc(pick(next.name, next.nameEn))} ·
         <b>${esc(t('inDays'))}</b> ${(next.jdUT - jd).toFixed(2)} ${esc(t('day'))}<br>
         <span style="color:var(--text-4)">${esc(A.formatJD(next.jdUT, 8))} (UTC+8)</span>`
      : '';

    drawOrbitCanvas(doy);
    announce($('#orbitLive'), pick('公转视图已更新：年积日 ', 'Orbit updated: day ') + doy +
      '，' + pick('直射纬度 ', 'declination ') + fmtDeg(cur.dec));
  }

  function drawOrbitCanvas(doy) {
    const cv = $('#orbitCanvas');
    if (!cv) return;
    const cssW = cv.clientWidth || 960;
    const cssH = Math.round(cssW * 560 / 960);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    cv.style.height = cssH + 'px';
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, cssW, cssH);
    if (orbitState.view === 'orbit') { drawOrbitView(g, cssW, cssH, doy); }
    else { drawSubsolarView(g, cssW, cssH, doy); }
  }

  function drawOrbitView(g, W, H, doy) {
    const year = orbitState.year;
    const cx = W / 2, cy = H / 2;
    const curves = yearCurves(year);
    const rMax = 1 + (1.017 - 1) * ORBIT_FA;
    const scale = Math.min(W * 0.44, H * 0.44) / rMax;

    // 背景星点（固定种子）
    let seed = 424242;
    const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    for (let i = 0; i < 90; i++) {
      const x = rnd() * W, y = rnd() * H;
      g.globalAlpha = 0.1 + rnd() * 0.4;
      g.fillStyle = '#cfe3ec';
      g.beginPath(); g.arc(x, y, rnd() * 1.1, 0, 6.2832); g.fill();
    }
    g.globalAlpha = 1;

    // 参考圆
    [0.5, 1.0].forEach((rr) => {
      g.beginPath();
      for (let i = 0; i <= 360; i += 3) {
        const a = i * Math.PI / 180;
        const x = cx + Math.cos(a) * (1 + (rr - 1) * ORBIT_FA) * scale;
        const y = cy + Math.sin(a) * (1 + (rr - 1) * ORBIT_FA) * scale;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.strokeStyle = 'rgba(143,184,201,.14)';
      g.lineWidth = 1; g.setLineDash([3, 6]); g.stroke(); g.setLineDash([]);
    });

    // 轨道（真实日地距，放大口径）
    const proj = (lonDeg, rAU) => {
      const rr = 1 + (rAU - 1) * ORBIT_FA;
      const a = (lonDeg + 180) * Math.PI / 180;   // 赤经方位：以春分方向为 +x
      return [cx + Math.cos(a) * rr * scale, cy + Math.sin(a) * rr * scale];
    };
    g.beginPath();
    curves.forEach((p, i) => {
      const [x, y] = proj(p.lon, p.R);
      i ? g.lineTo(x, y) : g.moveTo(x, y);
    });
    g.closePath();
    g.strokeStyle = 'rgba(200,163,90,.55)'; g.lineWidth = 1.4; g.stroke();
    g.fillStyle = 'rgba(200,163,90,.035)'; g.fill();

    // 24 节气标记
    const list = termsOfYear(year);
    const KEY = { 0: '春分', 6: '夏至', 12: '秋分', 18: '冬至' };
    list.forEach((x) => {
      const pos = A.sunApparentPosition(x.jdUT);
      const [x1, y1] = proj(pos.longitude, pos.distanceAU);
      const isKey = KEY[x.k] !== undefined;
      g.beginPath(); g.arc(x1, y1, isKey ? 4 : 2, 0, 6.2832);
      g.fillStyle = isKey ? '#ecdcb8' : 'rgba(236,220,184,.5)';
      g.fill();
      if (isKey) {
        g.font = '12px -apple-system, "Segoe UI", "Noto Sans SC", sans-serif';
        g.fillStyle = 'rgba(236,220,184,.9)';
        g.textAlign = 'center';
        const dx = x1 - cx, dy = y1 - cy;
        const L = Math.hypot(dx, dy) || 1;
        g.fillText(KEY[x.k], x1 + dx / L * 18, y1 + dy / L * 18 + 4);
      }
    });

    // 太阳
    const grd = g.createRadialGradient(cx, cy, 0, cx, cy, 46);
    grd.addColorStop(0, 'rgba(255,244,214,.98)');
    grd.addColorStop(0.28, 'rgba(236,200,120,.55)');
    grd.addColorStop(1, 'rgba(200,163,90,0)');
    g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, 46, 0, 6.2832); g.fill();
    g.fillStyle = '#fff6dc'; g.beginPath(); g.arc(cx, cy, 7, 0, 6.2832); g.fill();

    // 当前地球
    const cur = curves[Math.min(364, Math.round(doy) - 1)];
    const [ex, ey] = proj(cur.lon, cur.R);
    // 日地连线
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(ex, ey);
    g.strokeStyle = 'rgba(143,184,201,.34)'; g.lineWidth = 1; g.setLineDash([4, 5]); g.stroke(); g.setLineDash([]);
    // 地球（朝向太阳的一半为白昼）
    const ang = Math.atan2(cy - ey, cx - ex);
    g.save();
    g.translate(ex, ey);
    g.beginPath(); g.arc(0, 0, 10, 0, 6.2832); g.fillStyle = 'rgba(20,36,50,1)'; g.fill();
    g.beginPath(); g.arc(0, 0, 10, ang - Math.PI / 2, ang + Math.PI / 2); g.closePath();
    g.fillStyle = '#bcd9e6'; g.fill();
    g.beginPath(); g.arc(0, 0, 10, 0, 6.2832); g.strokeStyle = 'rgba(236,230,218,.75)'; g.lineWidth = 1; g.stroke();
    // 黄赤交角示意：地轴倾斜
    g.beginPath();
    g.moveTo(-Math.sin(ang) * 16, Math.cos(ang) * 16);
    g.lineTo(Math.sin(ang) * 16, -Math.cos(ang) * 16);
    g.strokeStyle = 'rgba(236,220,184,.6)'; g.lineWidth = 1.2; g.stroke();
    g.restore();

    // 文字标注
    g.font = '11px ui-monospace, monospace';
    g.fillStyle = 'rgba(143,184,201,.7)';
    g.textAlign = 'left';
    g.fillText('SUN', cx + 12, cy - 12);
    g.fillText((cur.R).toFixed(5) + ' AU ×' + ORBIT_FA, (cx + ex) / 2 + 6, (cy + ey) / 2 - 6);
    g.textAlign = 'right';
    g.fillText('ECLIPTIC ORBIT · ' + year, W - 14, H - 14);
    if (LANG !== 'zh') {
      g.textAlign = 'left';
      g.fillStyle = 'rgba(236,230,218,.55)';
      g.fillText('Earth’s motion is shown at true distance, magnified ' + ORBIT_FA + '×.', 14, H - 14);
    } else {
      g.textAlign = 'left';
      g.fillStyle = 'rgba(236,230,218,.55)';
      g.fillText('日地距真实值，图上放大 ' + ORBIT_FA + ' 倍；节气标记按黄经 15° 等分。', 14, H - 14);
    }
  }

  function drawSubsolarView(g, W, H, doy) {
    const year = orbitState.year;
    const curves = yearCurves(year);
    const padL = 52, padR = 18, padT = 34;
    const topH = (H - padT - 46) * 0.56;
    const botY = padT + topH + 36;
    const botH = H - botY - 30;
    const xOf = (day) => padL + (day - 1) / 364 * (W - padL - padR);

    // ---- 上图：太阳直射纬度 ----
    const yTop = (lat) => padT + (25 - lat) / 50 * topH;
    g.strokeStyle = 'rgba(143,184,201,.14)'; g.lineWidth = 1;
    [-23.44, 0, 23.44].forEach((lat) => {
      g.beginPath(); g.moveTo(padL, yTop(lat)); g.lineTo(W - padR, yTop(lat)); g.stroke();
      g.font = '10px ui-monospace, monospace';
      g.fillStyle = 'rgba(143,184,201,.66)'; g.textAlign = 'right';
      g.fillText((lat > 0 ? '+' : '') + lat.toFixed(1) + '°', padL - 6, yTop(lat) + 3);
    });
    g.fillStyle = 'rgba(236,230,218,.7)'; g.textAlign = 'left'; g.font = '11px ui-monospace, monospace';
    g.fillText(LANG === 'zh' ? '太阳直射纬度 δ' : 'Subsolar latitude δ', padL, padT - 12);
    // 曲线
    g.beginPath();
    curves.forEach((p, i) => { const x = xOf(p.doy), y = yTop(Math.max(-25, Math.min(25, p.dec))); i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.strokeStyle = '#c8a35a'; g.lineWidth = 1.8; g.stroke();
    // 填充（正/负）
    g.lineTo(xOf(365), yTop(0)); g.lineTo(xOf(1), yTop(0)); g.closePath();
    g.fillStyle = 'rgba(200,163,90,.10)'; g.fill();

    // 节气竖线与标签
    const list = termsOfYear(year);
    const KEY = { 0: 1, 6: 1, 12: 1, 18: 1, 21: 1, 15: 1, 3: 1, 9: 1 };
    list.forEach((x) => {
      const day = doyOfJD(x.jdUT);
      const x1 = xOf(day);
      g.beginPath(); g.moveTo(x1, padT); g.lineTo(x1, padT + topH); g.strokeStyle = 'rgba(143,184,201,.16)'; g.lineWidth = 1; g.stroke();
      if (KEY[x.k]) {
        g.font = '10px -apple-system, "Segoe UI", "Noto Sans SC", sans-serif';
        g.fillStyle = 'rgba(143,184,201,.86)'; g.textAlign = 'center';
        const dy = x.k === 6 || x.k === 9 ? 0 : 0;
        g.fillText(pick(x.name, x.nameEn).slice(0, 6), x1, padT - 2 + dy);
      }
    });

    // ---- 下图：昼长曲线 ----
    const yBot = (h) => botY + (18 - h) / 12 * botH;
    g.fillStyle = 'rgba(236,230,218,.7)'; g.textAlign = 'left'; g.font = '11px ui-monospace, monospace';
    g.fillText(LANG === 'zh' ? '昼长（含蒙气差）' : 'Day length (with refraction)', padL, botY - 10);
    [6, 9, 12, 15, 18].forEach((hh) => {
      g.beginPath(); g.moveTo(padL, yBot(hh)); g.lineTo(W - padR, yBot(hh));
      g.strokeStyle = hh === 12 ? 'rgba(200,163,90,.4)' : 'rgba(143,184,201,.12)'; g.stroke();
      g.fillStyle = 'rgba(143,184,201,.7)'; g.textAlign = 'right'; g.font = '10px ui-monospace, monospace';
      g.fillText(hh + 'h', padL - 6, yBot(hh) + 3);
    });
    const lines = [
      { key: 'dl39', col: '#c8a35a', label: LANG === 'zh' ? '北京 39.9°N' : 'Beijing 39.9°N' },
      { key: 'dl0', col: '#8fb8c9', label: LANG === 'zh' ? '赤道 0°' : 'Equator 0°' },
      { key: 'dlS', col: '#b8d3de', label: LANG === 'zh' ? '悉尼 33.9°S' : 'Sydney 33.9°S' }
    ];
    lines.forEach((L) => {
      g.beginPath();
      curves.forEach((p, i) => {
        const x = xOf(p.doy), y = yBot(Math.max(6, Math.min(18, p[L.key])));
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      });
      g.strokeStyle = L.col; g.lineWidth = 1.5; g.stroke();
    });
    g.font = '10px -apple-system, "Segoe UI", "Noto Sans SC", sans-serif';
    lines.forEach((L, i) => {
      g.fillStyle = L.col;
      g.textAlign = 'left';
      g.fillRect(padL + i * 118, botY + botH + 12, 12, 2);
      g.fillText(L.label, padL + i * 118 + 17, botY + botH + 17);
    });

    // 月份刻度
    g.fillStyle = 'rgba(143,184,201,.6)'; g.font = '10px ui-monospace, monospace'; g.textAlign = 'center';
    for (let mo = 1; mo <= 12; mo++) {
      const day = doyOfDate(mo, 15);
      g.fillText(mo + (LANG === 'zh' ? '月' : ''), xOf(day), H - 10);
    }

    // 当前日期竖线
    const xc = xOf(doy);
    g.beginPath(); g.moveTo(xc, padT - 6); g.lineTo(xc, H - 24);
    g.strokeStyle = 'rgba(236,230,218,.7)'; g.lineWidth = 1.4; g.setLineDash([4, 4]); g.stroke(); g.setLineDash([]);
    const cur = curves[Math.min(364, Math.round(doy) - 1)];
    g.beginPath(); g.arc(xc, yTop(Math.max(-25, Math.min(25, cur.dec))), 4, 0, 6.2832);
    g.fillStyle = '#ecdcb8'; g.fill();
    g.font = '11px ui-monospace, monospace'; g.fillStyle = '#ecdcb8'; g.textAlign = 'left';
    g.fillText('δ ' + cur.dec.toFixed(2) + '°', xc + 8, yTop(Math.max(-25, Math.min(25, cur.dec))) - 6);
  }

  /* ==================================================================
   * 5 · 物候图谱（自绘 SVG 插画 + 卡片 + 放大对话框）
   * ================================================================== */
  const phenoState = { season: 'all' };

  function renderPhenoArt(art, color, accent) {
    const V = 'viewBox="0 0 240 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"';
    const c1 = color || '#8fb8c9', c2 = accent || '#c8a35a';
    const P = (n) => Math.max(0, Math.round(n)).toString();
    switch (art.motif) {
      case 'sun-horizon': {
        const yBase = 74, cx = 120;
        const sunY = art.arc === 'low' ? 58 : art.arc === 'level' ? 44 : 34;
        let s = `<svg ${V}><rect width="240" height="96" fill="none"/>
          <line x1="16" y1="${yBase}" x2="224" y2="${yBase}" stroke="${c1}" stroke-width="1" opacity=".5"/>`;
        for (let i = 0; i < (art.rays || 9); i++) {
          const a = -160 + i * (140 / ((art.rays || 9) - 1));
          const ax = cx + Math.sin(a * Math.PI / 180) * 30, ay = sunY - Math.cos(a * Math.PI / 180) * 30;
          const bx = cx + Math.sin(a * Math.PI / 180) * 40, by = sunY - Math.cos(a * Math.PI / 180) * 40;
          s += `<line x1="${P(ax)}" y1="${P(ay)}" x2="${P(bx)}" y2="${P(by)}" stroke="${c2}" stroke-width="1.1" opacity=".55"/>`;
        }
        s += `<circle cx="${cx}" cy="${sunY}" r="17" fill="${c2}" opacity=".28"/>
              <circle cx="${cx}" cy="${sunY}" r="11" fill="${c2}" opacity=".85"/>`;
        if (art.balance) {
          s += `<line x1="20" y1="${sunY}" x2="220" y2="${sunY}" stroke="${c1}" stroke-width="1" stroke-dasharray="4 4" opacity=".7"/>
                <line x1="16" y1="${sunY - 14}" x2="16" y2="${sunY + 14}" stroke="${c1}" stroke-width="1.4"/>
                <line x1="224" y1="${sunY - 14}" x2="224" y2="${sunY + 14}" stroke="${c1}" stroke-width="1.4"/>`;
        }
        s += `<line x1="120" y1="${yBase}" x2="${120 + (art.arc === 'low' ? 54 : 30)}" y2="${yBase}" stroke="${c2}" stroke-width="2.4" opacity=".8"/>`;
        return s + '</svg>';
      }
      case 'rain': {
        let s = `<svg ${V}>`;
        const n = art.drops || 9;
        s += `<path d="M40 40 q20 -22 46 0 q26 -14 44 4 q22 -6 34 8" fill="none" stroke="${c1}" stroke-width="1.4" opacity=".6"/>`;
        for (let i = 0; i < n; i++) {
          const x = 42 + (i * 172 / Math.max(1, n - 1)), y = 48 + (i % 3) * 7;
          s += `<line x1="${P(x)}" y1="${P(y)}" x2="${P(x - 4)}" y2="${P(y + 13)}" stroke="${c1}" stroke-width="1.4" opacity=".72"/>`;
        }
        if (art.sprout) {
          s += `<path d="M120 92 v-18" stroke="${c2}" stroke-width="1.6"/>
                <path d="M120 80 q-11 -3 -13 -12 q11 1 13 12z" fill="${c2}" opacity=".7"/>
                <path d="M120 84 q11 -3 13 -12 q-11 1 -13 12z" fill="${c2}" opacity=".5"/>`;
        }
        if (art.grain) {
          for (let i = 0; i < 4; i++) {
            s += `<ellipse cx="${176 + i * 7}" cy="${72 - i * 8}" rx="3.4" ry="6" fill="${c2}" opacity=".55" transform="rotate(${-24} ${176 + i * 7} ${72 - i * 8})"/>`;
          }
        }
        return s + '</svg>';
      }
      case 'bud': {
        let s = `<svg ${V}>
          <path d="M120 92 C118 70 122 56 120 38" stroke="${c1}" stroke-width="1.8" fill="none"/>
          <path d="M120 62 q-20 -6 -24 -22 q20 2 24 22z" fill="${c1}" opacity=".45"/>
          <path d="M120 72 q20 -6 24 -22 q-20 2 -24 22z" fill="${c1}" opacity=".3"/>
          <circle cx="120" cy="34" r="7" fill="${c2}" opacity=".8"/>
          <circle cx="120" cy="34" r="12" fill="${c2}" opacity=".18"/>`;
        if (art.insect) {
          s += `<g opacity=".85"><ellipse cx="168" cy="58" rx="7" ry="4.6" fill="${c2}" opacity=".5"/>
            <line x1="162" y1="58" x2="174" y2="58" stroke="${c2}" stroke-width=".8"/>
            <path d="M170 52 l6 -5 M166 52 l-5 -5" stroke="${c2}" stroke-width=".8"/></g>`;
        }
        return s + '</svg>';
      }
      case 'bloom': {
        const n = art.petals || 5, cx = 120, cy = 48;
        let s = `<svg ${V}><line x1="${cx}" y1="${cy}" x2="${cx}" y2="92" stroke="${c1}" stroke-width="1.6" opacity=".7"/>
          <path d="M${cx} 74 q-16 -4 -20 -16 q16 2 20 16z" fill="${c1}" opacity=".32"/>`;
        for (let i = 0; i < n; i++) {
          const a = i * 360 / n;
          s += `<ellipse cx="${cx}" cy="${cy - 15}" rx="6.5" ry="14" fill="${c2}" opacity="${0.28 + (i % 2) * 0.14}"
                 transform="rotate(${a} ${cx} ${cy})"/>`;
        }
        s += `<circle cx="${cx}" cy="${cy}" r="4.6" fill="${c1}"/>`;
        return s + '</svg>';
      }
      case 'grain-ear': {
        const f = art.fill === undefined ? 1 : art.fill;
        let s = `<svg ${V}><path d="M116 92 C120 68 128 46 142 30" stroke="${c1}" stroke-width="1.8" fill="none"/>`;
        const cnt = Math.round(9 * f) + 1;
        for (let i = 0; i < cnt; i++) {
          const tt = i / Math.max(1, cnt - 1);
          const x = 120 + tt * 20, y = 82 - tt * 50;
          s += `<ellipse cx="${P(x - 6)}" cy="${P(y)}" rx="3.6" ry="6.4" fill="${c2}" opacity=".66" transform="rotate(-28 ${P(x - 6)} ${P(y)})"/>
                <ellipse cx="${P(x + 6)}" cy="${P(y - 3)}" rx="3.6" ry="6.4" fill="${c2}" opacity=".44" transform="rotate(-28 ${P(x + 6)} ${P(y - 3)})"/>`;
        }
        s += `<line x1="76" y1="92" x2="76" y2="62" stroke="${c1}" stroke-width="1" opacity=".4"/>
              <line x1="66" y1="92" x2="66" y2="70" stroke="${c1}" stroke-width="1" opacity=".3"/>`;
        return s + '</svg>';
      }
      case 'sun-zenith': {
        const n = art.rays || 14;
        let s = `<svg ${V}><line x1="14" y1="84" x2="226" y2="84" stroke="${c1}" stroke-width="1" opacity=".45"/>`;
        s += `<circle cx="120" cy="42" r="26" fill="${c2}" opacity="${0.18 + (art.warmth || 0.4) * 0.2}"/>`;
        for (let i = 0; i < n; i++) {
          const a = i * 360 / n;
          s += `<line x1="${P(120 + Math.cos(a * Math.PI / 180) * 15)}" y1="${P(42 + Math.sin(a * Math.PI / 180) * 15)}"
                 x2="${P(120 + Math.cos(a * Math.PI / 180) * 26)}" y2="${P(42 + Math.sin(a * Math.PI / 180) * 26)}"
                 stroke="${c2}" stroke-width="1.2" opacity=".6"/>`;
        }
        s += `<circle cx="120" cy="42" r="11" fill="${c2}" opacity=".9"/>
          <line x1="120" y1="84" x2="120" y2="78" stroke="${c1}" stroke-width="2.2" opacity=".8"/>`;
        return s + '</svg>';
      }
      case 'leaf': {
        const n = art.falling || 3;
        let s = `<svg ${V}>`;
        for (let i = 0; i < n; i++) {
          const x = 54 + i * 44, y = 30 + (i % 2) * 26, r = -32 + i * 14;
          s += `<g transform="rotate(${r} ${x} ${y})">
            <path d="M${x} ${y} q14 -12 26 0 q-14 12 -26 0z" fill="${c2}" opacity="${0.32 + i * 0.12}"/>
            <line x1="${x}" y1="${y}" x2="${x + 26}" y2="${y}" stroke="${c1}" stroke-width=".9" opacity=".7"/></g>`;
        }
        s += `<line x1="20" y1="88" x2="220" y2="88" stroke="${c1}" stroke-width="1" opacity=".35"/>`;
        return s + '</svg>';
      }
      case 'dew': {
        let s = `<svg ${V}>`;
        for (let i = 0; i < 3; i++) {
          const x = 62 + i * 58;
          s += `<path d="M${x} 92 q-8 -26 4 -44 q10 18 2 44" fill="none" stroke="${c1}" stroke-width="1.3" opacity=".55"/>`;
        }
        const n = art.drops || 6;
        for (let i = 0; i < n; i++) {
          const x = 46 + (i * 148 / Math.max(1, n - 1)), y = 46 + (i % 3) * 13;
          s += `<circle cx="${P(x)}" cy="${P(y)}" r="${2.6 + (i % 2)}" fill="${c1}" opacity=".72"/>`;
        }
        if (art.geese) {
          s += `<path d="M150 26 q6 -6 12 0 M162 26 q6 -6 12 0" fill="none" stroke="${c2}" stroke-width="1.2" opacity=".8"/>`;
        }
        return s + '</svg>';
      }
      case 'frost': {
        const n = art.rays || 8;
        let s = `<svg ${V}>`;
        for (let k = 0; k < 2; k++) {
          const cx = 84 + k * 72, cy = 44 + k * 12, R = 26 - k * 6;
          for (let i = 0; i < n; i++) {
            const a = i * 360 / n + k * 12;
            const x2 = cx + Math.cos(a * Math.PI / 180) * R, y2 = cy + Math.sin(a * Math.PI / 180) * R;
            s += `<line x1="${P(cx)}" y1="${P(cy)}" x2="${P(x2)}" y2="${P(y2)}" stroke="${c1}" stroke-width="1" opacity=".62"/>`;
            if (i % 2 === 0) {
              const mx = cx + Math.cos(a * Math.PI / 180) * R * 0.6, my = cy + Math.sin(a * Math.PI / 180) * R * 0.6;
              [30, -30].forEach((d) => {
                const aa = (a + d) * Math.PI / 180, bb = (a - d) * Math.PI / 180;
                s += `<line x1="${P(mx)}" y1="${P(my)}" x2="${P(mx + Math.cos(aa) * R * 0.34)}" y2="${P(my + Math.sin(aa) * R * 0.34)}" stroke="${c1}" stroke-width=".8" opacity=".45"/>
                      <line x1="${P(mx)}" y1="${P(my)}" x2="${P(mx + Math.cos(bb) * R * 0.34)}" y2="${P(my + Math.sin(bb) * R * 0.34)}" stroke="${c1}" stroke-width=".8" opacity=".45"/>`;
              });
            }
          }
        }
        return s + '</svg>';
      }
      case 'snow': {
        const n = art.flakes || 6, small = !!art.small;
        let s = `<svg ${V}>`;
        for (let k = 0; k < n; k++) {
          const cx = 40 + (k * 172 / Math.max(1, n - 1)), cy = 30 + (k % 3) * 20;
          const R = small ? 8 : 12 - (k % 2) * 2;
          for (let i = 0; i < 6; i++) {
            const a = i * 60;
            s += `<line x1="${P(cx)}" y1="${P(cy)}" x2="${P(cx + Math.cos(a * Math.PI / 180) * R)}" y2="${P(cy + Math.sin(a * Math.PI / 180) * R)}"
                   stroke="${c1}" stroke-width="1.1" opacity=".62"/>`;
            const mx = cx + Math.cos(a * Math.PI / 180) * R * 0.62, my = cy + Math.sin(a * Math.PI / 180) * R * 0.62;
            s += `<line x1="${P(mx)}" y1="${P(my)}" x2="${P(mx + Math.cos((a + 40) * Math.PI / 180) * R * 0.36)}" y2="${P(my + Math.sin((a + 40) * Math.PI / 180) * R * 0.36)}" stroke="${c1}" stroke-width=".9" opacity=".45"/>`;
          }
        }
        s += `<line x1="16" y1="90" x2="224" y2="90" stroke="${c1}" stroke-width="1" opacity=".3"/>`;
        return s + '</svg>';
      }
      case 'ice-crystal': {
        const n = art.points || 6;
        let s = `<svg ${V}>`;
        const cx = 120, cy = 44, R = 28;
        const pts = [];
        for (let i = 0; i < n; i++) {
          const a = i * 360 / n - 90, rr = i % 2 === 0 ? R : R * 0.62;
          pts.push([cx + Math.cos(a * Math.PI / 180) * rr, cy + Math.sin(a * Math.PI / 180) * rr]);
        }
        s += `<polygon points="${pts.map((p) => P(p[0]) + ',' + P(p[1])).join(' ')}" fill="${c1}" opacity=".16" stroke="${c1}" stroke-width="1.1"/>`;
        for (let i = 0; i < n; i++) {
          const a = i * 360 / n - 90;
          s += `<line x1="${cx}" y1="${cy}" x2="${P(cx + Math.cos(a * Math.PI / 180) * R)}" y2="${P(cy + Math.sin(a * Math.PI / 180) * R)}" stroke="${c1}" stroke-width=".8" opacity=".5"/>`;
        }
        s += `<circle cx="${cx}" cy="${cy}" r="3" fill="${c2}" opacity=".85"/>`;
        if (art.ground) s += `<line x1="18" y1="86" x2="222" y2="86" stroke="${c1}" stroke-width="1.2" opacity=".45"/>`;
        return s + '</svg>';
      }
      case 'moon': {
        let s = `<svg ${V}>`;
        for (let i = 0; i < 5; i++) {
          const x = 26 + i * 46;
          s += `<line x1="${x}" y1="92" x2="${x + 4}" y2="${58 + (i % 2) * 8}" stroke="${c1}" stroke-width="1.1" opacity=".42"/>`;
          s += `<ellipse cx="${x + 5}" cy="${56 + (i % 2) * 8}" rx="3" ry="7" fill="${c2}" opacity=".34" transform="rotate(${18 + i * 6} ${x + 5} ${56 + (i % 2) * 8})"/>`;
        }
        if (art.phase === 'half') {
          s += `<circle cx="168" cy="40" r="20" fill="${c2}" opacity=".22"/>
                <path d="M168 20 a20 20 0 0 1 0 40 a10 20 0 0 0 0 -40" fill="${c2}" opacity=".72"/>`;
        } else {
          s += `<circle cx="168" cy="40" r="20" fill="none" stroke="${c2}" stroke-width="1.2" opacity=".55"/>`;
        }
        return s + '</svg>';
      }
      case 'shadow': {
        const L = art.length === undefined ? 0.6 : art.length;
        const px = 96, top = 26, ground = 84;
        const shadow = Math.min(126, 30 + L * 96);
        let s = `<svg ${V}><line x1="20" y1="${ground}" x2="220" y2="${ground}" stroke="${c1}" stroke-width="1.2" opacity=".55"/>`;
        s += `<line x1="${px}" y1="${ground}" x2="${px}" y2="${top}" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>`;
        s += `<line x1="${px}" y1="${ground}" x2="${px + shadow}" y2="${ground}" stroke="${c2}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
        s += `<line x1="${px}" y1="${top}" x2="${px + shadow}" y2="${ground}" stroke="${c1}" stroke-width=".9" stroke-dasharray="3 4" opacity=".55"/>`;
        s += `<text x="${px + shadow + 6}" y="${ground - 6}" font-size="10" fill="${c1}" font-family="ui-monospace,monospace">${L.toFixed(2)}H</text>`;
        if (art.zenith) s += `<circle cx="${px + shadow}" cy="${top - 4}" r="7" fill="${c2}" opacity=".8"/>`;
        return s + '</svg>';
      }
      case 'heat': {
        let s = `<svg ${V}>`;
        const n = art.waves || 3;
        for (let i = 0; i < n; i++) {
          const y = 62 + i * 10;
          s += `<path d="M22 ${y} q22 -12 44 0 q22 12 44 0 q22 -12 44 0 q22 12 44 0" fill="none" stroke="${c1}" stroke-width="1.2" opacity="${0.5 - i * 0.08}"/>`;
        }
        if (art.sun) {
          s += `<circle cx="196" cy="26" r="15" fill="${c2}" opacity=".28"/>
                <circle cx="196" cy="26" r="8" fill="${c2}" opacity=".85"/>`;
        }
        if (art.storm) {
          s += `<path d="M40 22 l14 0 l-8 14 l12 0 l-20 22 l6 -16 l-12 0z" fill="${c2}" opacity=".7"/>`;
        }
        return s + '</svg>';
      }
      default:
        return `<svg ${V}><circle cx="120" cy="48" r="24" fill="${c1}" opacity=".3"/></svg>`;
    }
  }

  function renderPhenoFilters() {
    const seasons = [{ id: 'all', zh: '全部', en: 'All' }].concat(PHENO.SEASONS);
    const box = document.getElementById('phenoFilters');
    if (!box) return;
    box.innerHTML = seasons.map((s) =>
      `<button class="chip${s.id === phenoState.season ? ' on' : ''}" data-season="${s.id}" type="button">${(LANG === 'zh' ? s.zh : s.en)}</button>`).join('');
  }

  function initPhenology() {
    renderPhenoFilters();
    $('#phenoFilters').addEventListener('click', (e) => {
      const b = e.target.closest('[data-season]');
      if (!b) return;
      phenoState.season = b.dataset.season;
      $$('#phenoFilters .chip').forEach((c) => c.classList.toggle('on', c.dataset.season === phenoState.season));
      renderPhenology();
    });
    renderPhenology();
  }

  /** 插画用色：保持节气色的色相与彩度，把明度抬到可读区间（深色节气也能看清） */
  function artColor(k) {
    const c = WORLD.TERM_COLORS.find((x) => x.k === k);
    if (!c) return '#8fb8c9';
    const l = 0.55 + c.l * 0.34;
    return oklchToHex(l, Math.min(0.14, c.c * 1.05), c.h);
  }

  function renderPhenology() {
    const list = PHENO.PHENOLOGY.filter((p) => phenoState.season === 'all' || p.season === phenoState.season);
    $('#phenoGrid').innerHTML = list.map((p) => {
      const col = artColor(p.k);
      const primary = LANG === 'zh' ? p.brief : p.briefEn;
      const secondary = LANG === 'zh' ? p.briefEn : p.brief;
      return `<button class="pheno-card" data-k="${p.k}" type="button" aria-label="${esc(p.name)} ${esc(p.nameEn)}">
        <div class="pheno-art">${renderPhenoArt(p.art, col, '#c8a35a')}</div>
        <div class="pheno-name"><b>${esc(p.name)}</b><em>${esc(p.nameEn)}</em></div>
        <div class="pheno-brief">${esc(primary)}</div>
        <div class="pheno-brief-en">${esc(secondary)}</div>
        <div class="pheno-hou">${p.pentads.map((h) => `<span>·</span>${esc(LANG === 'zh' ? h.zh : h.en)}`).join('<br>')}</div>
        <div class="pheno-plants">${esc((p.flowerWind ? t('plantsFW') : t('plantsSeasonal')) + ' · ' +
          p.plants.map((q) => (LANG === 'zh' ? q.zh : q.en)).join(' '))}</div>
        <div class="pheno-farm"><b>${esc(t('farmTitle'))}</b>${esc(LANG === 'zh' ? p.farm : p.farmEn)}</div>
        ${p.flowerWind ? `<span class="pheno-fw">${esc(t('fwBadge'))}</span>` : ''}
      </button>`;
    }).join('');
    $('#phenoGrid').onclick = (e) => {
      const b = e.target.closest('[data-k]');
      if (b) openPhenoDialog(parseInt(b.dataset.k, 10));
    };
  }

  function openPhenoDialog(k) {
    const p = phenoOfK(k);
    const dlg = $('#phenoDialog');
    if (!p || !dlg) return;
    const col = artColor(k);
    dlg.innerHTML = `<div class="dlg-inner">
      <div class="dlg-head">
        <div>
          <div class="dlg-title">${esc(p.name)}</div>
          <div class="dlg-title-en">${esc(LANG === 'zh' ? p.nameEn : p.name)} · ${esc(p.pinyin || '')}</div>
        </div>
        <button class="dlg-close" type="button" aria-label="关闭">✕</button>
      </div>
      <div class="dlg-art">${renderPhenoArt(p.art, col, '#c8a35a')}</div>
      <div class="dlg-sec"><h4>${esc(pick('节气释文', 'Note'))}</h4>
        <p>${esc(LANG === 'zh' ? p.brief : p.briefEn)}</p>
        <p style="margin-top:6px;font-size:12.5px;color:var(--text-3)">${esc(LANG === 'zh' ? p.briefEn : p.brief)}</p></div>
      <div class="dlg-sec"><h4>${esc(t('pentadsTitle'))}</h4>
        <ul>${p.pentads.map((h, i) => `<li><i>${['初候', '二候', '三候'][i]}</i>${esc(LANG === 'zh' ? h.zh : h.en)}
          <span style="color:var(--text-4);font-size:12px"> — ${esc(LANG === 'zh' ? h.en : h.zh)}</span></li>`).join('')}</ul></div>
      <div class="dlg-sec"><h4>${esc(p.flowerWind ? t('plantsFW') : t('plantsSeasonal'))}</h4>
        <p>${p.plants.map((q) => esc(LANG === 'zh' ? q.zh + ' / ' + q.en : q.en + ' / ' + q.zh)).join('　·　')}</p></div>
      <div class="dlg-sec"><h4>${esc(t('farmTitle'))}</h4>
        <p>${esc(LANG === 'zh' ? p.farm : p.farmEn)}</p>
        <p style="margin-top:6px;font-size:12.5px;color:var(--text-3)">${esc(LANG === 'zh' ? p.farmEn : p.farm)}</p></div>
    </div>`;
    dlg.querySelector('.dlg-close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (ev) => { if (ev.target === dlg) dlg.close(); });
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }

  /* ==================================================================
   * 6 · 世界时间对话（直射点 + 晨昏线 + 各文明太阳节点）
   * ================================================================== */
  const worldState = {
    year: DEFAULT_YEAR, doy: 265,
    layers: { terms: true, zodiac: true, festivals: true, subsolar: true }
  };

  function initWorld() {
    $('#worldYears').innerHTML = YEARS.map((y) =>
      `<button class="chip${y === worldState.year ? ' on' : ''}" data-year="${y}" type="button">${y}</button>`).join('');
    $('#worldYears').addEventListener('click', (e) => {
      const b = e.target.closest('[data-year]');
      if (!b) return;
      worldState.year = parseInt(b.dataset.year, 10);
      $$('#worldYears .chip').forEach((c) => c.classList.toggle('on', parseInt(c.dataset.year, 10) === worldState.year));
      renderWorld();
    });
    $('#worldLayers').innerHTML = WorldLayerChips();
    $('#worldLayers').addEventListener('click', (e) => {
      const b = e.target.closest('[data-layer]');
      if (!b) return;
      worldState.layers[b.dataset.layer] = !worldState.layers[b.dataset.layer];
      $('#worldLayers').innerHTML = WorldLayerChips();
      renderWorld();
    });
    $('#worldSlider').addEventListener('input', (e) => {
      worldState.doy = parseInt(e.target.value, 10);
      renderWorld();
    });
    // 视口变化后重绘：标签避让与字号是按当前像素宽度算的
    let wmTimer = null;
    window.addEventListener('resize', () => {
      if (wmTimer) clearTimeout(wmTimer);
      wmTimer = setTimeout(renderWorld, 160);
    });
    renderWorld();
  }

  function WorldLayerChips() {
    const names = { terms: t('layerTerms'), zodiac: t('layerZodiac'), festivals: t('layerFest'), subsolar: t('layerSub') };
    return Object.keys(names).map((id) =>
      `<button class="chip${worldState.layers[id] ? ' on' : ''}" data-layer="${id}" type="button" aria-pressed="${worldState.layers[id]}">${esc(names[id])}</button>`).join('');
  }

  /** 时区近似：按经度 /15 取整（仅用于展示"当地日期"，已在页面上标注） */
  function tzOfLon(lon) { return Math.round(lon / 15); }

  function termByK(year, k) { return termsOfYear(year).find((x) => x.k === k); }

  /** 某文明节日在本年的日期（返回 {date:'YYYY-MM-DD', jd, rule}） */
  function festivalDate(civ, year) {
    if (civ.rule.type === 'term') {
      const tm = termByK(year, civ.rule.k);
      if (!tm) return null;
      return { date: isoDateOfJD(tm.jdUT, tzOfLon(civ.lon)), jd: tm.jdUT, term: tm };
    }
    const jd = A.jdFromUTC(year, civ.rule.month, civ.rule.day, 0, 0, 0);
    return { date: isoDateOfJD(jd, tzOfLon(civ.lon)), jd: jd, term: null };
  }

  function renderWorld() {
    const year = worldState.year, doy = worldState.doy;
    const d = dateOfDay(year, doy);
    const cursorJD = jdOfDay(year, doy) + 0.5;            // 当日 12:00 UT
    const cur = A.sunApparentPosition(cursorJD);
    const dec = A.solarDeclination(cursorJD);
    const subsolarLon = A.norm180(A.sunRightAscension(cursorJD) - A.gmst(cursorJD));
    const zod = A.zodiacOfLongitude(cur.longitude);
    const zn = WORLD.ZODIAC_SIGNS[Math.floor(A.norm360(cur.longitude) / 30)];
    const list = termsOfYear(year);
    let prev = null, next = null;
    list.forEach((x) => { if (x.jdUT <= cursorJD) prev = x; else if (!next) next = x; });
    if (!prev) { const py = termsOfYear(year - 1); prev = py[py.length - 1]; }
    if (!next) next = termsOfYear(year + 1)[0];

    $('#worldDate').textContent = d.y + '-' + pad2(d.m) + '-' + pad2(d.d);

    const rows = [
      [t('termLongitude'), cur.longitude.toFixed(2) + '°'],
      [t('directLat'), fmtDeg(dec)],
      [t('subsolar') + ' ' + (LANG === 'zh' ? '经度' : 'longitude'), fmtDeg(subsolarLon, 1)],
      [t('zodiac'), pick(zn.zh, zn.en) + ' ' + (cur.longitude % 30).toFixed(1) + '°'],
      [t('curTerm'), prev ? pick(prev.name, prev.nameEn) : '—'],
      [t('nextTerm') + ' · ' + t('inDays'), next ? (next.jdUT - cursorJD).toFixed(1) + ' ' + t('day') : '—']
    ];
    $('#worldGrid').innerHTML = rows.map((r) =>
      `<div class="readout"><dt>${esc(r[0])}</dt><dd>${esc(r[1])}</dd></div>`).join('');

    $('#worldNear').innerHTML = prev ? `
      <p class="sec-kicker" style="font-size:10.5px">${esc(t('termNowTitle'))}</p>
      <div class="term-now">${esc(pick(prev.name, prev.nameEn))}</div>
      <div class="since">${esc(A.formatJD(prev.jdUT, 8))} (UTC+8) · ${esc(prev.longitude + '°')}</div>
      <p class="since" style="margin-top:8px">${esc(t('nextTerm'))}：${esc(next ? pick(next.name, next.nameEn) : '—')}
        ${esc(next ? (next.jdUT - cursorJD).toFixed(2) + ' ' + t('day') : '')}</p>` : '';

    drawWorldMap(cursorJD, dec, subsolarLon, cur.longitude);
    renderWorldStrips(prev ? prev.k : null, zn);
    renderWorldTable(year, d);
    announce($('#worldLive'), pick('世界时间对话已更新：太阳黄经 ', 'World dialogue updated: longitude ') +
      cur.longitude.toFixed(2) + '°，' + pick('直射纬度 ', 'declination ') + fmtDeg(dec));
  }

  /* ---------------------------------------------------------- 世界图工具 */
  const WM_W = 1000, WM_H = 520;
  const wmX = (lon) => (lon + 180) / 360 * WM_W;
  const wmY = (lat) => (90 - lat) / 180 * WM_H;

  /** 估算文字显示宽度（SVG 用户单位）：CJK 全宽 / 拉丁窄宽 */
  function wmTextWidth(str, fs) {
    let w = 0;
    for (const ch of String(str)) {
      const c = ch.codePointAt(0);
      if (c >= 0x2e80) w += fs * 1.06;
      else if (ch === ' ') w += fs * 0.32;
      else w += fs * 0.58;
    }
    return w;
  }

  /** 大陆轮廓 → path（等经纬投影） */
  function wmLandPath(poly) {
    let d = '';
    poly.forEach((p, i) => {
      d += (i ? 'L' : 'M') + wmX(p[0]).toFixed(1) + ',' + wmY(p[1]).toFixed(1);
    });
    return d + 'Z';
  }

  /** drawWorldMap 的耗时（ms）——最近一次，供 console 与 Playwright 读取 */
  const wmTiming = { lastMs: 0, lastPathMs: 0, buildMs: 0, builds: 0, landChars: 0, draws: 0 };

  /**
   * 全部轮廓环（主陆 + 岛屿 + 内海/大湖）——顺序固定，供建 path 与统计共用。
   * 内海环在 evenodd 下自动成为陆地中的"洞"，因此不必单独用海水色补画。
   */
  function wmLandRings() {
    const L = WORLD.LAND;
    return [L.northAmerica, L.southAmerica, L.africa, L.eurasia, L.greenland,
      L.antarctica, L.australia].concat(L.islands || [], L.seas || []);
  }

  /**
   * 轮廓 path 字符串**只构建一次**并缓存。
   * 世界图是 SVG（不是 Canvas，用不上 Path2D）：等价的可缓存物就是这条 path 的 `d`，
   * 它同时供「昼半球填充」与「夜半球内重绘描边」两处复用。
   * 投影是等经纬、与视口无关，所以缓存可以跨 1440/1024/768 三档直接复用。
   */
  let wmLandD = null;
  function wmLandPathData() {
    if (wmLandD === null) {
      const t = (typeof performance !== 'undefined' && performance.now)
        ? performance.now() : Date.now();
      const rings = wmLandRings();
      let d = '';
      for (let i = 0; i < rings.length; i++) d += wmLandPath(rings[i]);
      wmLandD = d;
      wmTiming.buildMs = ((typeof performance !== 'undefined' && performance.now)
        ? performance.now() : Date.now()) - t;
      wmTiming.builds = (wmTiming.builds || 0) + 1;
    }
    return wmLandD;
  }

  /** 轮廓规模统计（图注与自动化测试都读它，避免文案里写死点数） */
  function wmLandStats() {
    if (!wmLandStats.cache) {
      const rings = wmLandRings();
      let pts = 0;
      for (let i = 0; i < rings.length; i++) pts += rings[i].length;
      wmLandStats.cache = {
        rings: rings.length,
        islands: (WORLD.LAND.islands || []).length,
        seas: (WORLD.LAND.seas || []).length,
        points: pts,
        chars: wmLandPathData().length
      };
    }
    return wmLandStats.cache;
  }

  /** 经纬网（strength 用于在夜半球内重绘时整体提亮） */
  function wmGraticule(strength) {
    let g = '';
    for (let lon = -180; lon <= 180; lon += 30) {
      const strong = lon === 0;
      g += `<line x1="${wmX(lon).toFixed(1)}" y1="0" x2="${wmX(lon).toFixed(1)}" y2="${WM_H}"
        stroke="rgba(143,184,201,${((strong ? .34 : .15) * strength).toFixed(3)})"
        stroke-width="${strong ? 1.1 : .8}"${strong ? '' : ' stroke-dasharray="2 6"'}/>`;
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const strong = lat === 0;
      g += `<line x1="0" y1="${wmY(lat).toFixed(1)}" x2="${WM_W}" y2="${wmY(lat).toFixed(1)}"
        stroke="rgba(143,184,201,${((strong ? .38 : .15) * strength).toFixed(3)})"
        stroke-width="${strong ? 1.1 : .8}"${strong ? '' : ' stroke-dasharray="2 6"'}/>`;
    }
    return g;
  }

  /**
   * 夜半球区域路径。两种情形：
   *  · |赤纬| < 0.3°（分日附近）—— 晨昏线近乎两条经线，夜半球是以反日点经度为中心的 180° 经度带；
   *  · 一般情形 —— 逐经度解 sin(h)=0：tan(φ) = −cos(H)/tan(δ)，夜间取曲线靠极地的一侧。
   */
  function wmNightRegion(dec, subsolarLon) {
    if (Math.abs(dec) < 0.3) {
      const center = A.norm180(subsolarLon + 180);
      let lo = center - 90, hi = center + 90;
      const bands = [];
      if (lo < -180) { bands.push([lo + 360, 180]); bands.push([-180, hi]); }
      else if (hi > 180) { bands.push([lo, 180]); bands.push([-180, hi - 360]); }
      else { bands.push([lo, hi]); }
      let d = '';
      bands.forEach((b) => {
        const x0 = wmX(Math.max(-180, b[0])), x1 = wmX(Math.min(180, b[1]));
        d += `M${x0.toFixed(1)},0H${x1.toFixed(1)}V${WM_H}H${x0.toFixed(1)}Z`;
      });
      return { d: d, bands: bands, center: center, smallDec: true };
    }
    const pts = [];
    for (let lon = -180; lon <= 180; lon += 2) {
      const Hh = (lon - subsolarLon) * Math.PI / 180;
      const lat = Math.atan(-Math.cos(Hh) / Math.tan(dec * Math.PI / 180)) * 180 / Math.PI;
      pts.push([lon, Math.max(-89, Math.min(89, lat))]);
    }
    let d = '';
    pts.forEach((p, i) => {
      d += (i ? 'L' : 'M') + wmX(p[0]).toFixed(1) + ',' + wmY(p[1]).toFixed(1);
    });
    const yEdge = wmY(dec > 0 ? -89 : 89);
    d += `L${WM_W},${yEdge.toFixed(1)}L0,${yEdge.toFixed(1)}Z`;
    return { d: d, curve: pts, smallDec: false };
  }

  /**
   * 标签自动避让：为每个文明节点在锚点周围找位，贪心 + 引线，
   * 保证 12 个标签两两不重叠、不压住任何节点圆点、不出图幅。
   * 盒模型按真实字体墨迹取：ascent ≈ 1.06em、descent ≈ 0.34em（CJK 回退字体的实际度量）。
   */
  const WM_ASC = 1.06, WM_DESC = 0.34, WM_LINE = 1.30, WM_STEP = 1.58, WM_GAP = 0.45;
  function wmInkH(lines, FS) { return (lines - 1) * WM_LINE * FS + (WM_ASC + WM_DESC) * FS; }

  function wmLayoutLabels(items, FS, reserved) {
    const PADX = FS * 0.18, PADY = FS * 0.10;
    const reserve = reserved || [];

    const buildBox = (m, dx, dy) => {
      const w = m.w, h = wmInkH(m.lines, FS);
      const cx = m.x + dx * (w / 2 + FS * 0.85);
      let y0, y1;
      if (dy < 0) { y1 = m.y - WM_GAP * FS - (-dy - 1) * WM_STEP * FS; y0 = y1 - h; }
      else { y0 = m.y + WM_GAP * FS + (dy - 1) * WM_STEP * FS; y1 = y0 + h; }
      let x0 = cx - w / 2, x1 = cx + w / 2;
      // 收进图幅（按墨迹边界）
      if (x0 < 3) { x1 += 3 - x0; x0 = 3; }
      if (x1 > WM_W - 3) { x0 -= x1 - (WM_W - 3); x1 = WM_W - 3; }
      if (y0 < 3) { y1 += 3 - y0; y0 = 3; }
      if (y1 > WM_H - 4) { y0 -= y1 - (WM_H - 4); y1 = WM_H - 4; }
      if (y0 < 3) { y0 = 3; y1 = y0 + h; }
      return { x0: x0, x1: x1, y0: y0, y1: y1 };
    };

    const hits = (box, m, placed, dots) => {
      const p = { x0: box.x0 - PADX, x1: box.x1 + PADX, y0: box.y0 - PADY, y1: box.y1 + PADY };
      for (let k = 0; k < reserve.length; k++) {
        const q = reserve[k];
        if (p.x0 < q.x1 && p.x1 > q.x0 && p.y0 < q.y1 && p.y1 > q.y0) return true;
      }
      for (let k = 0; k < placed.length; k++) {
        const q = placed[k];
        if (p.x0 < q.x1 && p.x1 > q.x0 && p.y0 < q.y1 && p.y1 > q.y0) return true;
      }
      for (let k = 0; k < dots.length; k++) {
        if (k === m.idx) continue;                     // 自己的圆点由引线负责
        const d = dots[k];
        if (d.x > p.x0 - 4 && d.x < p.x1 + 4 && d.y > p.y0 - 4 && d.y < p.y1 + 4) return true;
      }
      return false;
    };

    // 候选位按"离锚点近"排序：先试正上方/正下方，再逐级向两侧与更远处扩散
    const cand = [];
    for (let dy = -9; dy <= 9; dy++) {
      if (dy === 0) continue;
      for (let dx = -7; dx <= 7; dx++) {
        cand.push({ dy: dy, dx: dx, cost: Math.abs(dy) + Math.abs(dx) * 1.45 + (dy > 0 ? 0.2 : 0) });
      }
    }
    cand.sort((a, b) => a.cost - b.cost || Math.abs(a.dx) - Math.abs(b.dx) || a.dy - b.dy);

    const dots = items.map((m) => ({ x: m.x, y: m.y }));
    const placed = [];
    const order = items.slice().sort((a, b) => a.x - b.x || a.y - b.y);
    order.forEach((m) => {
      let box = null;
      for (let i = 0; i < cand.length; i++) {
        const b = buildBox(m, cand[i].dx, cand[i].dy);
        if (!hits(b, m, placed, dots)) { box = b; break; }
      }
      if (!box) {
        // 兜底：以锚点为中心做逐环扫描（理论上极少走到这里）
        for (let ring = 1; ring <= 26 && !box; ring++) {
          for (let dy = -ring; dy <= ring && !box; dy++) {
            for (let dx = -ring; dx <= ring && !box; dx++) {
              if (Math.max(Math.abs(dy), Math.abs(dx)) !== ring) continue;
              const b = buildBox(m, dx, dy || -1);
              if (!hits(b, m, placed, dots)) box = b;
            }
          }
        }
      }
      if (!box) {
        const h = wmInkH(m.lines, FS);
        const y0 = Math.max(3, Math.min(WM_H - 4 - h, m.y - WM_GAP * FS - 9 * WM_STEP * FS - h));
        const x0 = Math.max(3, Math.min(WM_W - 3 - m.w, m.x - m.w / 2));
        box = { x0: x0, x1: x0 + m.w, y0: y0, y1: y0 + h };
      }
      m.box = box;
      placed.push({ x0: box.x0 - PADX, x1: box.x1 + PADX, y0: box.y0 - PADY, y1: box.y1 + PADY });
    });
    return order;
  }

  function drawWorldMap(cursorJD, dec, subsolarLon, sunLon) {
    const T0 = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    const W = WM_W, H = WM_H, X = wmX, Y = wmY;
    const host = $('#worldMap');
    const cssW = (host && host.getBoundingClientRect) ? host.getBoundingClientRect().width : 1000;
    const FS = cssW > 0 && cssW < 760 ? 16.5 : (cssW > 0 && cssW < 940 ? 14.5 : 13.5);
    const MONO = 'ui-monospace,SFMono-Regular,Menlo,monospace';
    const SANS = "-apple-system,'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif";
    const halo = `stroke="rgba(5,12,19,.9)" stroke-width="${(FS * 0.28).toFixed(1)}" stroke-linejoin="round" paint-order="stroke"`;
    const LG = { x: 10, y: 10, w: FS * 7.2, h: FS * 3.75 };
    // 已被图例/晨昏线文字占用的区域，标签避让时一并绕开
    const reserved = [{ x0: LG.x - 2, y0: LG.y - 2, x1: LG.x + LG.w + 2, y1: LG.y + LG.h + 2 }];

    const night = wmNightRegion(dec, subsolarLon);
    /* 取缓存 path：首帧构建一次（约 1500 顶点），其后只做一次 null 判断 */
    const T1 = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    const landD = wmLandPathData();
    const T2 = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    wmTiming.lastPathMs = T2 - T1;
    wmTiming.landChars = landD.length;

    let s = '';
    s += `<defs>
      <linearGradient id="wmOcean" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#091a27"/><stop offset=".5" stop-color="#112b3d"/><stop offset="1" stop-color="#091a27"/>
      </linearGradient>
      <clipPath id="wmNightClip"><path d="${night.d}"/></clipPath>
    </defs>`;

    /* 1 海洋底 + 低精度大陆轮廓 —— 昼半球的地表参照。
     *    fill-rule="evenodd"：镶嵌在陆地里的内海/大湖环因此成为"洞"（水面），
     *    岛屿环若落在内海里又会重新填上 —— 无需额外图层。 */
    s += `<rect width="${W}" height="${H}" fill="url(#wmOcean)"/>`;
    s += `<path d="${landD}" fill-rule="evenodd" fill="rgba(120,160,178,.10)" stroke="rgba(158,198,215,.52)" stroke-width=".9" stroke-linejoin="round"/>`;

    /* 2 经纬网（底色）+ 回归线 */
    s += wmGraticule(1);
    [-23.44, 23.44].forEach((lat) => {
      s += `<line x1="0" y1="${Y(lat).toFixed(1)}" x2="${W}" y2="${Y(lat).toFixed(1)}"
             stroke="rgba(200,163,90,.30)" stroke-width="1" stroke-dasharray="6 5"/>`;
    });
    s += `<text x="7" y="${(Y(23.44) - 5).toFixed(1)}" font-size="${(FS * 0.72).toFixed(1)}" fill="rgba(200,163,90,.62)" font-family="${MONO}">23.44°N</text>`;
    s += `<text x="7" y="${(Y(-23.44) + 13).toFixed(1)}" font-size="${(FS * 0.72).toFixed(1)}" fill="rgba(200,163,90,.62)" font-family="${MONO}">23.44°S</text>`;
    s += `<text x="7" y="${(Y(0) - 5).toFixed(1)}" font-size="${(FS * 0.72).toFixed(1)}" fill="rgba(143,184,201,.7)" font-family="${MONO}">EQ</text>`;

    /* 3 夜半球：半透明压暗后**在夜里重绘经纬网与大陆轮廓**，避免一块空黑面板 */
    let nightCenterLon = A.norm180(subsolarLon + 180);
    if (worldState.layers.subsolar) {
      s += `<path d="${night.d}" fill="rgba(3,9,16,.68)"/>`;
      s += `<g clip-path="url(#wmNightClip)">`;
      /* 夜里只补**笔画**不补底色：地表轮廓读得出来，但整块仍是暗的 */
      s += `<path d="${landD}" fill="none" stroke="rgba(166,203,219,.46)" stroke-width=".95" stroke-linejoin="round"/>`;
      s += wmGraticule(2.1);
      [-23.44, 23.44].forEach((lat) => {
        s += `<line x1="0" y1="${Y(lat).toFixed(1)}" x2="${W}" y2="${Y(lat).toFixed(1)}"
               stroke="rgba(200,163,90,.30)" stroke-width="1" stroke-dasharray="6 5"/>`;
      });
      s += `</g>`;

      /* 4 晨昏线 */
      const TERM = 'rgba(198,224,234,.95)';
      let termX = [];
      if (night.smallDec) {
        night.bands.forEach((b) => { termX.push(wmX(Math.max(-180, Math.min(180, b[0])))); });
        termX.forEach((xe) => {
          s += `<line x1="${xe.toFixed(1)}" y1="0" x2="${xe.toFixed(1)}" y2="${H}" stroke="rgba(198,224,234,.20)" stroke-width="7"/>`;
          s += `<line x1="${xe.toFixed(1)}" y1="0" x2="${xe.toFixed(1)}" y2="${H}" stroke="${TERM}" stroke-width="1.8" stroke-dasharray="7 4"/>`;
        });
      } else {
        let dp = '';
        let steep = night.curve[0];
        night.curve.forEach((p, i) => {
          dp += (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1);
          if (Math.abs(p[1]) > Math.abs(steep[1])) steep = p;
        });
        s += `<path d="${dp}" fill="none" stroke="rgba(198,224,234,.20)" stroke-width="7"/>`;
        s += `<path d="${dp}" fill="none" stroke="${TERM}" stroke-width="1.8"/>`;
        termX.push(X(steep[0]));
        nightCenterLon = A.norm180(subsolarLon + 180);
      }

      /* 5 晨昏线文字 —— 晨昏线恒过赤道上「直射点经度 ± 90°」两点，此处定位必然落在线上 */
      let termAnchorLon = A.norm180(subsolarLon + 90);
      if (night.smallDec) termAnchorLon = night.bands.length ? night.bands[0][0] : termAnchorLon;
      const tlx = Math.max(night.smallDec ? LG.x + LG.w + FS * 2.4 : FS * 3.6,
        Math.min(W - 50, X(termAnchorLon)));
      const tly = night.smallDec ? FS * 1.85 : Y(0) - FS * 0.85;
      const termHalfW = wmTextWidth(pick('晨昏线', 'terminator'), FS * 0.78) / 2;
      reserved.push({ x0: tlx - termHalfW, y0: tly - FS * 1.15, x1: tlx + termHalfW, y1: tly + FS * 0.35 });
      s += `<text x="${tlx.toFixed(1)}" y="${tly.toFixed(1)}" text-anchor="middle"
             font-size="${(FS * 0.78).toFixed(1)}" fill="rgba(202,226,236,.92)" font-family="${SANS}" ${halo}>${esc(pick('晨昏线', 'terminator'))}</text>`;

      /* 6 太阳直射点 */
      const sx = X(A.norm180(subsolarLon)), sy = Y(dec);
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(FS * 1.15).toFixed(1)}" fill="rgba(236,220,184,.12)"/>`;
      s += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(FS * 0.42).toFixed(1)}" fill="#ecdcb8"/>`;
      s += `<text x="${(sx + FS * 0.9).toFixed(1)}" y="${(sy - FS * 0.75).toFixed(1)}" font-size="${(FS * 0.76).toFixed(1)}"
             fill="#ecdcb8" font-family="${MONO}" ${halo}>${esc(pick('直射点', 'subsolar'))} ${fmtDeg(dec, 1)} / ${fmtDeg(A.norm180(subsolarLon), 1)}</text>`;
    }

    /* 7 各文明节点：昼夜着色 + 标签自动避让 */
    if (worldState.layers.festivals) {
      const cursorJDown = jdOfDay(worldState.year, worldState.doy);
      const marks = WORLD.CIVILIZATIONS.map((civ, i) => {
        const f = festivalDate(civ, worldState.year);
        const hm = (civ.lon - subsolarLon) * Math.PI / 180;
        const latR = civ.lat * Math.PI / 180, decR = dec * Math.PI / 180;
        const sinAlt = Math.sin(latR) * Math.sin(decR) + Math.cos(latR) * Math.cos(decR) * Math.cos(hm);
        const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180 / Math.PI;
        let tst = 12 + A.norm180(civ.lon - subsolarLon) / 15;
        tst = ((tst % 24) + 24) % 24;
        const label = pick(civ.marker, (WORLD.MARKER_EN && WORLD.MARKER_EN[civ.id]) || civ.nameEn);
        return {
          idx: i, civ: civ, x: X(civ.lon), y: Y(civ.lat), f: f, sunAlt: alt, tst: tst,
          near: !!(f && Math.abs(f.jd - cursorJDown) < 2.5),
          label: label, lines: (f && Math.abs(f.jd - cursorJDown) < 2.5) ? 2 : 1
        };
      });
      marks.forEach((m) => {
        m.w = Math.max(wmTextWidth(m.label, FS),
          m.near && m.f ? wmTextWidth(m.f.date, FS * 0.78) : 0);
      });
      // 同名标记（冬至/夏至各有两处）补一行地名，避免"读不出谁是谁"
      const dup = {};
      marks.forEach((m) => { dup[m.label] = (dup[m.label] || 0) + 1; });
      marks.forEach((m) => {
        m.sub = dup[m.label] > 1
          ? String(pick(m.civ.regionZh, m.civ.regionEn)).split(' · ').pop() : null;
        m.lines = 1 + (m.sub ? 1 : 0) + (m.near && m.f ? 1 : 0);
        if (m.sub) m.w = Math.max(m.w, wmTextWidth(m.sub, FS * 0.78));
      });
      const laid = wmLayoutLabels(marks, FS, reserved);

      /* 引线先画，文字后压 —— 保证引线不穿过别的标签 */
      laid.forEach((m) => {
        const b = m.box;
        // 引线端点取墨迹盒内侧一点，避免压到字形
        const inset = FS * 0.1;
        const ax = Math.max(b.x0 + inset, Math.min(m.x, b.x1 - inset));
        const ay = Math.max(b.y0 + inset, Math.min(m.y, b.y1 - inset));
        const dist = Math.hypot(ax - m.x, ay - m.y);
        if (dist > FS * 0.75) {
          s += `<line x1="${m.x.toFixed(1)}" y1="${m.y.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}"
                 stroke="rgba(206,170,98,.6)" stroke-width="1"/>`;
        }
      });
      laid.forEach((m) => {
        const nightHere = !(m.sunAlt > 0);
        const tip = [
          pick(m.civ.regionZh, m.civ.regionEn),
          pick(m.civ.nameZh, m.civ.nameEn),
          m.f ? m.f.date : '',
          pick('当地真太阳时 ', 'local true solar time ') + fmtHM(m.tst),
          pick('太阳高度角 ', 'altitude ') + fmtDeg(m.sunAlt, 1) + pick(nightHere ? '（夜）' : '（昼）', nightHere ? ' (night)' : ' (day)')
        ].filter(Boolean).join(' · ');
        // 标记：白天实心金、夜里空心环 —— 昼夜判断可被逐点核验
        const r = (m.near ? FS * 0.46 : FS * 0.29).toFixed(1);
        s += `<g><title>${esc(tip)}</title>`;
        if (nightHere) {
          s += `<circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="${r}"
                 fill="rgba(8,17,26,.92)" stroke="rgba(176,208,222,.85)" stroke-width="1.5"/>`;
        } else {
          s += `<circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="${r}"
                 fill="${m.near ? '#f0d79a' : 'rgba(216,180,112,.92)'}" stroke="rgba(16,28,38,.9)" stroke-width="1"/>`;
        }
        if (m.near) {
          s += `<circle cx="${m.x.toFixed(1)}" cy="${m.y.toFixed(1)}" r="${(FS * 0.86).toFixed(1)}"
                 fill="none" stroke="rgba(240,215,154,.5)" stroke-width="1"/>`;
        }
        // 标签（首行基线 = 墨迹顶 + ascent；其余行按行距下移）
        let baseY = m.box.y0 + WM_ASC * FS;
        s += `<text x="${m.box.x0.toFixed(1)}" y="${baseY.toFixed(1)}" font-size="${FS.toFixed(1)}"
               fill="${m.near ? '#f4e6c4' : 'rgba(238,232,220,.94)'}" font-family="${SANS}" ${halo}>${esc(m.label)}</text>`;
        if (m.sub) {
          baseY += WM_LINE * FS;
          s += `<text x="${m.box.x0.toFixed(1)}" y="${baseY.toFixed(1)}" font-size="${(FS * 0.78).toFixed(1)}"
                 fill="rgba(168,203,216,.9)" font-family="${SANS}" ${halo}>${esc(m.sub)}</text>`;
        }
        if (m.near && m.f) {
          baseY += WM_LINE * FS;
          s += `<text x="${m.box.x0.toFixed(1)}" y="${baseY.toFixed(1)}" font-size="${(FS * 0.78).toFixed(1)}"
                 fill="rgba(216,180,112,.95)" font-family="${MONO}" ${halo}>${esc(m.f.date)}</text>`;
        }
        s += `</g>`;
      });
    }

    /* 8 经度标注 */
    [-180, -120, -60, 0, 60, 120, 180].forEach((lon) => {
      const tx = Math.min(W - 26, X(lon) + 3);
      s += `<text x="${tx.toFixed(1)}" y="${(H - 6).toFixed(1)}" font-size="${(FS * 0.7).toFixed(1)}"
             fill="rgba(143,184,201,.5)" font-family="${MONO}" ${halo}>${lon}°</text>`;
    });

    /* 9 图例：昼 / 夜半球与节点昼夜标记的读法 */
    const lfs = FS * 0.78, ltx = LG.x + FS * 2.05;
    const rowY = (i) => LG.y + FS * (1.18 + i * 1.14);
    s += `<g><rect x="${LG.x}" y="${LG.y}" width="${LG.w.toFixed(1)}" height="${LG.h.toFixed(1)}" rx="5"
           fill="rgba(4,11,18,.74)" stroke="rgba(143,184,201,.3)" stroke-width="1"/>`;
    s += `<rect x="${(LG.x + FS * 0.72).toFixed(1)}" y="${(rowY(0) - FS * 0.66).toFixed(1)}"
           width="${(FS * 1.1).toFixed(1)}" height="${(FS * 0.72).toFixed(1)}"
           fill="rgba(126,170,194,.55)" stroke="rgba(200,163,90,.55)" stroke-width=".8"/>`;
    s += `<text x="${ltx.toFixed(1)}" y="${rowY(0).toFixed(1)}" font-size="${lfs.toFixed(1)}"
           fill="rgba(228,238,244,.92)" font-family="${SANS}">${esc(pick('昼半球', 'day side'))}</text>`;
    s += `<rect x="${(LG.x + FS * 0.72).toFixed(1)}" y="${(rowY(1) - FS * 0.66).toFixed(1)}"
           width="${(FS * 1.1).toFixed(1)}" height="${(FS * 0.72).toFixed(1)}"
           fill="rgba(3,9,16,.9)" stroke="rgba(176,208,222,.5)" stroke-width=".8"/>`;
    s += `<text x="${ltx.toFixed(1)}" y="${rowY(1).toFixed(1)}" font-size="${lfs.toFixed(1)}"
           fill="rgba(196,216,226,.92)" font-family="${SANS}">${esc(pick('夜半球', 'night side'))}</text>`;
    s += `<circle cx="${(LG.x + FS * 1.28).toFixed(1)}" cy="${(rowY(2) - FS * 0.26).toFixed(1)}" r="${(FS * 0.3).toFixed(1)}"
           fill="rgba(216,180,112,.92)"/>`;
    s += `<text x="${(LG.x + FS * 1.85).toFixed(1)}" y="${rowY(2).toFixed(1)}" font-size="${lfs.toFixed(1)}"
           fill="rgba(232,226,214,.9)" font-family="${SANS}">${esc(pick('标记', 'nodes'))}</text>`;
    s += `<circle cx="${(LG.x + FS * 3.72).toFixed(1)}" cy="${(rowY(2) - FS * 0.26).toFixed(1)}" r="${(FS * 0.3).toFixed(1)}"
           fill="rgba(216,180,112,.92)"/>`;
    s += `<text x="${(LG.x + FS * 4.26).toFixed(1)}" y="${rowY(2).toFixed(1)}" font-size="${lfs.toFixed(1)}"
           fill="rgba(232,226,214,.9)" font-family="${SANS}">${esc(pick('昼', 'day'))}</text>`;
    s += `<circle cx="${(LG.x + FS * 5.5).toFixed(1)}" cy="${(rowY(2) - FS * 0.26).toFixed(1)}" r="${(FS * 0.34).toFixed(1)}"
           fill="none" stroke="rgba(196,222,234,.95)" stroke-width="1.7"/>`;
    s += `<text x="${(LG.x + FS * 6.04).toFixed(1)}" y="${rowY(2).toFixed(1)}" font-size="${lfs.toFixed(1)}"
           fill="rgba(232,226,214,.9)" font-family="${SANS}">${esc(pick('夜', 'night'))}</text>`;
    s += `</g>`;

    if (host) host.innerHTML = s;

    /* 重绘耗时（含 path 取用与整段 SVG 字符串拼装、innerHTML 赋值） */
    wmTiming.lastMs = ((typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now()) - T0;
    wmTiming.draws++;
    if (typeof location !== 'undefined' && location.search.indexOf('wmdebug') >= 0) {
      console.info('[drawWorldMap] ' + wmTiming.lastMs.toFixed(2) + ' ms · 轮廓 '
        + wmLandStats().points + ' 点 / path ' + landD.length + ' 字符 · 首建 '
        + wmTiming.buildMs.toFixed(2) + ' ms（共 ' + wmTiming.builds + ' 次）');
    }
  }

  /** 节气标尺 + 黄道十二宫色带（HTML） */
  function renderWorldStrips(activeK, zn) {
    let host = $('#worldStrips');
    if (!host) {
      host = document.createElement('div');
      host.id = 'worldStrips';
      host.className = 'world-strips';
      $('#worldMap').insertAdjacentElement('afterend', host);
    }
    const list = termsOfYear(worldState.year);
    const ruler = worldState.layers.terms ? `
      <div class="strip">
        <span class="strip-label">${esc(pick('二十四节气', '24 terms'))}</span>
        <div class="strip-ticks">
          ${list.map((x) => {
            const active = x.k === activeK;
            const isMajor = [21, 0, 3, 6, 9, 12, 15, 18].indexOf(x.k) >= 0;
            return `<span class="tick${active ? ' on' : ''}" title="${esc(x.name)} ${esc(x.beijingStr)}">
              ${(isMajor || active) ? `<i style="background:${termColor(x.k)}"></i><b>${esc(pick(x.name, x.nameEn).slice(0, 4))}</b>` : `<i style="background:${termColor(x.k)};opacity:.55"></i>`}
            </span>`;
          }).join('')}
        </div>
      </div>` : '';
    const zodiacStrip = worldState.layers.zodiac ? `
      <div class="strip">
        <span class="strip-label">${esc(pick('黄道十二宫', 'Zodiac'))}</span>
        <div class="strip-signs">
          ${WORLD.ZODIAC_SIGNS.map((z) => {
            const active = z.deg === zn.deg;
            return `<span class="sign${active ? ' on' : ''}" title="${esc(z.zh)} ${esc(z.en)} · ${esc(z.noteZh)}">
              <i>${active ? '◆' : '·'}</i>${esc(pick(z.zh.replace('座', ''), z.en.slice(0, 3)))}</span>`;
          }).join('')}
        </div>
      </div>` : '';
    host.innerHTML = ruler + zodiacStrip;
  }

  function renderWorldTable(year, cursorDate) {
    const cj = jdOfDay(year, worldState.doy);
    const rows = WORLD.CIVILIZATIONS.map((civ) => {
      const f = festivalDate(civ, year);
      if (!f) return '';
      const diff = Math.round(f.jd - cj);
      let stateTxt, nearCls = '';
      if (diff === 0) { stateTxt = t('sameDay'); nearCls = ' near'; }
      else if (diff > 0) { stateTxt = t('after') + diff + ' ' + t('day'); }
      else { stateTxt = t('before') + Math.abs(diff) + ' ' + t('day'); }
      if (Math.abs(diff) <= 2.5) nearCls = ' near';
      const ruleTxt = civ.rule.type === 'term'
        ? t('ruleTerm').replace('15°×k', civ.rule.k * 15 + '°')
        : (civ.rule.type === 'fixed' ? t('ruleFixed') : t('ruleApprox'));
      return `<tr class="${nearCls.trim()}">
        <td>${esc(pick(civ.regionZh, civ.regionEn))}</td>
        <td><span class="fest">${esc(pick(civ.festivalZh || civ.nameZh, civ.festivalEn || civ.nameEn))}</span><br>
            <span style="font-size:11.5px;color:var(--text-4)">${esc(pick(civ.titleEn, civ.titleZh))}</span></td>
        <td class="rule">${esc(ruleTxt)}</td>
        <td class="mono">${esc(f.date)}</td>
        <td class="state">${esc(stateTxt)}</td>
      </tr>`;
    }).join('');
    $('#worldTable').querySelector('tbody').innerHTML = rows;
  }

  /* ==================================================================
   * 7 · 节气色
   * ================================================================== */
  function seasonOfLon(lon) {
    const l = A.norm360(lon);
    if (l >= 315 || l < 45) return 'spring';
    if (l < 135) return 'summer';
    if (l < 225) return 'autumn';
    return 'winter';
  }

  function renderPalette() {
    const bands = WORLD.SEASON_BANDS.map((b) => {
      const cols = WORLD.TERM_COLORS.filter((c) => seasonOfLon(c.k * 15) === b.id)
        .sort((x, y) => A.norm360(x.k * 15 - 315) - A.norm360(y.k * 15 - 315));
      return `<div class="band">
        <span class="band-name">${esc(pick(b.zh, b.en))}</span>
        <div class="band-strip">${cols.map((c) => `<div style="background:${oklchToHex(c.l, c.c, c.h)}"
          title="${esc(c.name)} ${oklchStr(c.l, c.c, c.h)}"></div>`).join('')}</div>
      </div>`;
    }).join('');
    $('#seasonBands').innerHTML = bands;

    const order = [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    const byK = {};
    WORLD.TERM_COLORS.forEach((c) => { byK[c.k] = c; });
    $('#paletteGrid').innerHTML = order.map((k) => {
      const c = byK[k];
      if (!c) return '';
      const hex = oklchToHex(c.l, c.c, c.h);
      return `<button class="swatch" data-hex="${hex}" data-oklch="${esc(oklchStr(c.l, c.c, c.h))}"
        aria-label="${esc(c.name)} ${hex}">
        <div class="swatch-chip" style="background:${hex}"><span>${hex}</span></div>
        <div class="swatch-body">
          <b>${esc(pick(c.name, c.nameEn))}</b>
          <em>${esc(oklchStr(c.l, c.c, c.h))}</em>
          <div class="swatch-why">${esc(pick(c.whyZh, c.whyEn))}</div>
        </div>
      </button>`;
    }).join('');
    $('#paletteGrid').onclick = (e) => {
      const b = e.target.closest('[data-hex]');
      if (!b) return;
      const txt = b.dataset.hex + ' · ' + b.dataset.oklch;
      copyText(txt).then((ok) => showToast(ok ? t('copyOk') + ' ' + txt : txt));
    };
  }

  function copyText(txt) {
    return new Promise((res) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(() => res(true)).catch(() => res(fallbackCopy(txt)));
      } else { res(fallbackCopy(txt)); }
    });
  }
  function fallbackCopy(txt) {
    try {
      const ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand && document.execCommand('copy');
      document.body.removeChild(ta);
      return !!ok;
    } catch (e) { return false; }
  }
  let toastTimer = null;
  function showToast(msg) {
    const el = $('#paletteToast');
    if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ==================================================================
   * 8 · 术语库
   * ================================================================== */
  const termState = { q: '', cat: 'all' };

  function renderTermCats() {
    const cats = [{ id: 'all', zh: '全部', en: 'All' }].concat(TERMS.CATEGORIES);
    const box = document.getElementById('termCats');
    if (!box) return;
    box.innerHTML = cats.map((c) =>
      `<button class="chip${c.id === termState.cat ? ' on' : ''}" data-cat="${c.id}" type="button">${(LANG === 'zh' ? c.zh : c.en)}</button>`).join('');
  }

  function initGlossary() {
    renderTermCats();
    $('#termCats').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      termState.cat = b.dataset.cat;
      $$('#termCats .chip').forEach((c) => c.classList.toggle('on', c.dataset.cat === termState.cat));
      renderGlossary();
    });
    let deb = null;
    $('#termSearch').addEventListener('input', (e) => {
      clearTimeout(deb);
      const v = e.target.value;
      deb = setTimeout(() => { termState.q = v.trim(); renderGlossary(); }, 120);
    });
    renderGlossary();
  }

  function hl(text, q) {
    if (!q) return esc(text);
    const low = String(text).toLowerCase(), ql = q.toLowerCase();
    let out = '', i = 0;
    while (true) {
      const idx = low.indexOf(ql, i);
      if (idx < 0) { out += esc(String(text).slice(i)); break; }
      out += esc(String(text).slice(i, idx)) + '<mark>' + esc(String(text).slice(idx, idx + q.length)) + '</mark>';
      i = idx + q.length;
    }
    return out;
  }

  function renderGlossary() {
    const q = termState.q, cat = termState.cat;
    const cats = {}; TERMS.CATEGORIES.forEach((c) => { cats[c.id] = c; });
    const src = TERMS.TERMS.filter((x) => {
      if (cat !== 'all' && x.cat !== cat) return false;
      if (!q) return true;
      const hay = [x.zh, x.en, x.defZh, x.defEn].join(' ').toLowerCase();
      return hay.indexOf(q.toLowerCase()) >= 0;
    });
    $('#termCount').textContent = src.length + ' / ' + TERMS.TERMS.length;
    $('#termGrid').innerHTML = src.map((x) => {
      const c = cats[x.cat] || { zh: x.cat, en: x.cat };
      const primary = LANG === 'zh' ? x.defZh : x.defEn;
      const secondary = LANG === 'zh' ? x.defEn : x.defZh;
      return `<article class="term">
        <div class="term-head">
          <span class="term-zh">${hl(x.zh, q)}</span>
          <span class="term-en">${hl(x.en, q)}</span>
        </div>
        <p class="term-def">${hl(primary, q)}</p>
        <p class="term-def">${hl(secondary, q)}</p>
        <p class="term-cat">${esc(pick(c.zh, c.en))}</p>
      </article>`;
    }).join('') || `<p class="hint">${esc(pick('没有匹配的术语，试试"黄经""圭表""solstice"。', 'No match — try “longitude”, “gnomon”, “solstice”.'))}</p>`;
  }

  /* ==================================================================
   * 9 · 教学包导出
   * ================================================================== */
  const expState = { year: DEFAULT_YEAR, city: 'beijing', gh: 2 };

  function initExport() {
    $('#expYear').innerHTML = YEARS.map((y) => `<option value="${y}"${y === expState.year ? ' selected' : ''}>${y}</option>`).join('');
    $('#expCity').innerHTML = CITIES.map((c) =>
      `<option value="${c.id}"${c.id === expState.city ? ' selected' : ''}>${esc(pick(c.zh, c.en))} (${latLabel(c.lat)})</option>`).join('');
    $('#expYear').addEventListener('change', (e) => { expState.year = parseInt(e.target.value, 10); renderExport(); });
    $('#expCity').addEventListener('change', (e) => { expState.city = e.target.value; renderExport(); });
    $('#expGnomon').addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      expState.gh = (v > 0 && v <= 20) ? v : 2;
      renderExport();
    });
    $('#expTermsCsv').addEventListener('click', () => download(termsCsv(expState.year), `天时-节气时刻表-${expState.year}.csv`));
    $('#expTermsMd').addEventListener('click', () => download(termsMd(expState.year), `天时-节气时刻表-${expState.year}.md`));
    $('#expCityCsv').addEventListener('click', () => {
      const c = CITIES.find((x) => x.id === expState.city);
      download(cityCsv(expState.year, c, expState.gh), `天时-${c.zh}-日影表-${expState.year}.csv`);
    });
    $('#expCityMd').addEventListener('click', () => {
      const c = CITIES.find((x) => x.id === expState.city);
      download(cityMd(expState.year, c, expState.gh), `天时-${c.zh}-日影表-${expState.year}.md`);
    });
    renderExport();
  }

  function renderExport() {
    const lines = cityCsv(expState.year, CITIES.find((x) => x.id === expState.city), expState.gh)
      .replace(/^\uFEFF/, '').split('\n');
    $('#expPreview').textContent = lines.slice(0, 8).join('\n') + '\n…';
  }

  function termsCsv(year) {
    const list = termsOfYear(year);
    const head = [t('tableSeq'), t('tableTerm'), 'English', t('tableLon') + ' (°)',
      t('tableBj'), t('tableUtc'), t('tableHou')].join(',');
    const rows = list.map((x) => {
      const ph = phenoOfK(x.k);
      return [x.seq, x.name, x.nameEn, x.longitude, x.beijingStr, x.utcStr,
        '"' + (LANG === 'zh' ? ph.pentads[0].zh : ph.pentads[0].en) + '"'].join(',');
    });
    return '\ufeff' + head + '\n' + rows.join('\n') + '\n';
  }

  function cityCsv(year, city, gh) {
    const list = termsOfYear(year);
    const head = [t('tableTerm'), t('tableDate'), t('tableAlt') + ' (°)', t('tableShadow') + ' (m)',
      t('tableRatio'), t('tableDayLen') + ' (h)', t('tableRise'), t('tableSet')].join(',');
    const rows = list.map((x) => {
      const c = A.jdToCalendar(x.jdUT, 8);
      const jdDay = A.jdFromUTC(c.year, c.month, c.day, 0, 0, 0);
      const noonUT = A.solarNoonHourUT(jdDay, city.lon);
      const jdNoon = jdDay + noonUT / 24;
      const pos = A.sunAltitudeAzimuth(jdNoon, city.lat, city.lon);
      const sh = A.shadowLength(pos.altitude, gh);
      const rs = A.sunRiseSet(jdDay, city.lat, city.lon);
      const fmtLocal = (hUT) => fmtHM((hUT + city.tz + 24) % 24);
      return [x.name, isoDateOfJD(x.jdUT, 8), pos.altitude.toFixed(3),
        isFinite(sh.length) ? sh.length.toFixed(4) : '',
        isFinite(sh.ratio) ? sh.ratio.toFixed(4) : '',
        A.dayLength(jdDay, city.lat).toFixed(4),
        fmtLocal(rs.riseUT), fmtLocal(rs.setUT)].join(',');
    });
    return '\ufeff' + head + '\n' + rows.join('\n') + '\n';
  }

  function termsMd(year) {
    const list = termsOfYear(year);
    const out = [];
    out.push('# ' + t('expTermsTitle') + ' · ' + year);
    out.push('');
    out.push('> ' + t('expNote') + ' ' + new Date().toISOString().slice(0, 16).replace('T', ' '));
    out.push('> ' + pick('算法：VSOP87D 太阳视黄经反解（牛顿迭代），时区 UTC+8 / UTC。',
      'Algorithm: root-solving on the VSOP87D apparent solar longitude (Newton), time zones UTC+8 / UTC.'));
    out.push('> ' + t('expTermsCount') + '。');
    out.push('');
    out.push(`| ${t('tableSeq')} | ${t('tableTerm')} | English | ${t('tableLon')} | ${t('tableBj')} | ${t('tableUtc')} | ${t('tableHou')} |`);
    out.push('|---:|---|---|---:|---|---|---|');
    list.forEach((x) => {
      const ph = phenoOfK(x.k);
      out.push(`| ${x.seq} | ${x.name} | ${x.nameEn} | ${x.longitude}° | ${x.beijingStr} | ${x.utcStr} | ${pick(ph.pentads[0].zh, ph.pentads[0].en)} |`);
    });
    out.push('');
    return out.join('\n');
  }

  function cityMd(year, city, gh) {
    const list = termsOfYear(year);
    const out = [];
    out.push('# ' + t('expCityTitle') + ' · ' + pick(city.zh, city.en) + ' · ' + year);
    out.push('');
    out.push(`> ${latLabel(city.lat)} · ${city.lon.toFixed(1)}°E · ${pick('表高', 'post height')} ${gh} m · ${pick('时区', 'time zone')} UTC${city.tz >= 0 ? '+' : ''}${city.tz}`);
    out.push('> ' + t('expNote') + ' ' + new Date().toISOString().slice(0, 16).replace('T', ' '));
    out.push('');
    out.push(`| ${t('tableTerm')} | ${t('tableDate')} | ${t('tableAlt')} | ${t('tableShadow')} | ${t('tableRatio')} | ${t('tableDayLen')} | ${t('tableRise')} | ${t('tableSet')} |`);
    out.push('|---|---|---:|---:|---:|---:|---|---|');
    list.forEach((x) => {
      const c = A.jdToCalendar(x.jdUT, 8);
      const jdDay = A.jdFromUTC(c.year, c.month, c.day, 0, 0, 0);
      const noonUT = A.solarNoonHourUT(jdDay, city.lon);
      const jdNoon = jdDay + noonUT / 24;
      const pos = A.sunAltitudeAzimuth(jdNoon, city.lat, city.lon);
      const sh = A.shadowLength(pos.altitude, gh);
      const rs = A.sunRiseSet(jdDay, city.lat, city.lon);
      const fmtLocal = (hUT) => fmtHM((hUT + city.tz + 24) % 24);
      out.push(`| ${x.name} | ${isoDateOfJD(x.jdUT, 8)} | ${pos.altitude.toFixed(2)}° | ${isFinite(sh.length) ? sh.length.toFixed(3) + ' m' : '—'} | ${isFinite(sh.ratio) ? sh.ratio.toFixed(3) : '—'} | ${A.dayLength(jdDay, city.lat).toFixed(2)} h | ${fmtLocal(rs.riseUT)} | ${fmtLocal(rs.setUT)} |`);
    });
    out.push('');
    return out.join('\n');
  }

  function download(text, filename) {
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      announce($('#expStatus'), filename + ' ' + t('expDone'));
    } catch (err) {
      announce($('#expStatus'), 'Download failed: ' + err.message);
    }
  }

  /* ==================================================================
   * 10 · 团队 · 待补位影像
   * ================================================================== */
  function renderCredits() {
    const host = $('#assetList');
    if (!host) return;
    host.innerHTML = WORLD.PENDING_ASSETS.map((a) => `
      <li>
        <b>${esc(pick(a.titleZh, a.titleEn))}</b>
        <code>${esc(a.target)}</code><br>
        ${esc(pick(a.fallbackZh, a.fallbackEn))}<br>
        <span style="color:var(--text-4);font-size:11.5px">prompt: ${esc(a.prompt)}</span>
      </li>`).join('');
  }

  /* ==================================================================
   * 11 · 导航高亮、动效开关、启动
   * ================================================================== */
  function initNavSpy() {
    const links = $$('.nav-links a');
    const secs = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    if (!('IntersectionObserver' in window) || !secs.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    secs.forEach((s) => io.observe(s));
  }

  function initMotionToggle() {
    const btn = $('#motionToggle');
    btn.addEventListener('click', () => {
      REDUCED = !REDUCED;
      document.body.classList.toggle('reduced-motion', REDUCED);
      btn.setAttribute('aria-pressed', REDUCED ? 'false' : 'true');
      btn.lastElementChild.textContent = REDUCED ? t('motionOff') : t('motionOn');
      if (REDUCED) { stopPlay(); }
      else if (orbitState.playing === false) { /* 保持静止，由用户决定播放 */ }
    });
    if (REDUCED) document.body.classList.add('reduced-motion');
  }

  /** 语言切换后需要重绘的全部模块 */
  function renderAll() {
    renderObsPresets();
    renderPhenoFilters();
    renderTermCats();
    renderCoverDial();
    updateObs();
    renderCalendar();
    renderPhenology();
    renderOrbit();
    $('#worldLayers').innerHTML = WorldLayerChips();
    renderWorld();
    renderPalette();
    renderGlossary();
    renderExport();
    renderCredits();
    const cap = $('#orbitCap');
    if (cap) {
      cap.textContent = orbitState.view === 'orbit' ? t('orbitCap')
        : (LANG === 'zh' ? '直射点视图：上图为太阳直射纬度逐日曲线，下图为三条纬线的昼长曲线（含蒙气差修正）。'
          : 'Subsolar view: above, daily solar declination; below, day-length curves for three latitudes (with refraction).');
    }
  }

  function boot() {
    applyI18n();
    initCover();
    initObservatory();
    initCalendar();
    initOrbit();
    initPhenology();
    initWorld();
    renderPalette();
    initGlossary();
    initExport();
    renderCredits();
    initNavSpy();
    initMotionToggle();

    $('#langZh').addEventListener('click', () => setLang('zh'));
    $('#langEn').addEventListener('click', () => setLang('en'));

    // 时钟：封面日晷每分钟更新一次（节气时刻不依赖，仅指针）
    setInterval(renderCoverDial, 60000);
    // 暴露少量只读接口，便于自动化测试断言
    window.TIANSHI = {
      version: '1.0.0',
      astro: A,
      termsOfYear,
      get lang() { return LANG; },
      setLang,
      /* 世界图轮廓规模与最近一次重绘耗时（节点侧测试 / Playwright 读取） */
      get landStats() { return wmLandStats(); },
      get worldMapMs() { return wmTiming.lastMs; },
      worldMapTiming: wmTiming,
      counts: {
        terms: TERMS.TERMS.length,
        // 以下两项是**校验基准的声明值**（不是页面加载的数据表）：
        // 96 条官方节气时刻仅存在于 test/data_reference.js，由 test/verify.js 在 Node 侧读取比对，
        // 运行时不加载、不参与任何计算或显示。见 index.html 注释。
        reference: 96,
        referenceVerified: 96,
        phenology: PHENO.PHENOLOGY.length,
        civilizations: WORLD.CIVILIZATIONS.length,
        zodiac: WORLD.ZODIAC_SIGNS.length,
        colors: WORLD.TERM_COLORS.length,
        cities: CITIES.length,
        years: YEARS.length,
        pendingAssets: WORLD.PENDING_ASSETS.length
      }
    };
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }
})();
