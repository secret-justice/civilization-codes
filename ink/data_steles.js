/* ============================================================================
   墨迹 · Traces of Ink —— 书体档案与碑帖数据 data_steles.js
   ----------------------------------------------------------------------------
    ① STYLES  八件书体档案 —— 楷 / 行四家（欧 / 颜 / 柳 / 赵）+ 王羲之行书
       + 隶书三家（曹全碑·秀逸 / 张迁碑·方整 / 石门颂·野逸）——
       用于"名家比对"的加权余弦相似度匹配、"笔法重演"的时间参数化生成，
       以及"听笔法"模块里的八体 A/B 对照试听。
    ② STELES  八件公版古代碑帖 —— 用于"碑帖廊"。
       全部为唐代及以前（含元代一件，作者卒于 1322 年）公有领域作品；
       界面中的字形骨架是团队依碑帖笔意自绘的示意骨架，非拓本描摹。
    ③ 8 体与 8 碑的关系（"自述 = 实现"，改数据前务必先读）——
       书体档案是"书家 / 碑刻级"的十维笔法档案，① 的 8 档与 ② 的 8 碑
       一一对应：欧→九成宫、颜→多宝塔、柳→玄秘塔、赵→胆巴、王→兰亭序、
       曹全碑→曹全碑、张迁碑→张迁碑、石门颂→石门颂。
       因此 8 件碑帖全部 comparable: true，全部可进入名家比对、笔法重演与
       A/B 试听；碑帖廊里不再有"仅静态展示"的卡片。
       styleId 一律不得指向 STYLES 里不存在的 id（悬挂引用）。增删任何一档
       档案时，必须同步改 ① 本体、② 里对应碑的 styleId / comparable、风格
       标签、SCOPE_NOTE 与界面提示行、verify.js 与 run_checks.py 里的体数
       断言，并重跑全部测试（两套脚本都必须 exit 0）。
       新加的隶书三档（曹全 / 张迁 / 石门）的十维数值与三碑的 feature 档案
       是同一份数据 —— 依碑刻风格的定性描述设定，非实测拓本统计。
   ----------------------------------------------------------------------------
   特征向量十维（与 app.js 的 extractFeatures 输出同名同序）：
     startAngle     起笔角（度，0–360）
     entryShape     入锋形态（0 露锋尖入 → 1 藏锋缓起）
     avgSpeed       行笔速度均值（px/s，按 1000px 见方画布标定）
     speedVar       速度归一化方差（(σ/μ)²，无量纲）
     pressRatio     提按比（笔道最宽 / 最窄）
     turnAngle      转折角均值（度）
     dwellTotal     驻笔总时长（ms）
     rhythmEntropy  节奏熵（速度分布归一化香农熵，0–1）
     midStability   中段稳定性（1 − 中段速度变异系数，0–1）
     endDirection   收笔方向（度，0–360）

   两条与"量纲"有关的约定（改档案数值前务必先读）：
     ① avgSpeed 一律是"折算到 1000px 参考画布"的速度。画布短边不是 1000px
        时，界面按 ×1000 ÷ 画布短边 折算后与之比较；屏幕实测值另行列示，
        界面单位行与 aria 播报都明确写着"折算到 1000 像素参考画布"。
     ② pressRatio 是"笔道最宽 / 最窄"的倍数，取值 1–4.2（上界即
        FEATURE_META.pressRatio.scale）。它有两个来源，同量纲、可直接比：
          · 有真实压感的设备（数位板 / 支持 force 的触屏）→ 实际笔压；
          · 无压感设备（鼠标在 Pointer Events 规范里 p 恒为 0.5，普通触屏
            亦然）→ 以行笔速度为代理："慢则按得重、快则提得轻"本就是提按
            的可测运动学后果（详见 app.js §2.0 inkProfile）。
        旧模型 w = 0.34 + 0.92·p 把恒定的 0.5 当成"中等按压"，鼠标上限
        只有 2.27，2.60–3.40 的档案值永远匹配不到；改为速度代理后，带顿挫
        的鼠标笔迹可读到 3.0–3.7（实测见 07_技术文档与运行说明）。
   ========================================================================== */
(function (root) {
  'use strict';

  const FEATURE_KEYS = [
    'startAngle', 'entryShape', 'avgSpeed', 'speedVar', 'pressRatio',
    'turnAngle', 'dwellTotal', 'rhythmEntropy', 'midStability', 'endDirection'
  ];

  /* ---------------------------------------------------------------------------
     FEATURE_META —— 十维特征的量纲、归一化尺度与相似度权重
       scale = 该维的"满量程"，归一化 x̂ = clamp(x / scale, 0, 1)。
       pressRatio.scale = 4.2 同时是 app.js 里 PRESS.RATIO_MAX 的值：
       压力通道满量程（p 从 0 到 1）得 1 + 3.0×1 = 4.0×，速度通道的对数压缩
       要到 v90/v10 ≈ 96 倍才触到 4.2——即"提按比的上界"全作品只有一处定义。
       avgSpeed.scale = 900 对应的也是"折算到 1000px 参考画布"的速度。
     权重 w 的排序理由见 07_技术文档与运行说明/系统架构与关键技术.md §4.2。
     --------------------------------------------------------------------------- */
  const FEATURE_META = [
    { key: 'startAngle',    zh: '起笔角',      en: 'Entry angle',      unit: '°',   scale: 360,  w: 0.6 },
    { key: 'entryShape',    zh: '入锋形态',    en: 'Entry form',       unit: '',    scale: 1,    w: 1.0 },
    { key: 'avgSpeed',      zh: '行笔速度均值', en: 'Mean speed',       unit: 'px/s', scale: 900, w: 0.9 },
    { key: 'speedVar',      zh: '速度方差',    en: 'Speed variance',   unit: '',    scale: 0.35, w: 1.1 },
    { key: 'pressRatio',    zh: '提按比',      en: 'Press ratio',      unit: '×',   scale: 4.2,  w: 1.2 },
    { key: 'turnAngle',     zh: '转折角均值',  en: 'Turn angle',       unit: '°',   scale: 90,   w: 1.3 },
    { key: 'dwellTotal',    zh: '驻笔总时长',  en: 'Dwell time',       unit: 'ms',  scale: 700,  w: 0.8 },
    { key: 'rhythmEntropy', zh: '节奏熵',      en: 'Rhythm entropy',   unit: '',    scale: 1,    w: 1.1 },
    { key: 'midStability',  zh: '中段稳定性',  en: 'Mid stability',    unit: '',    scale: 1,    w: 0.9 },
    { key: 'endDirection',  zh: '收笔方向',    en: 'Exit direction',   unit: '°',   scale: 360,  w: 0.6 }
  ];

  /* ---------------------------------------------------------------------------
     八件书体档案
     ★ 全部 8 档都能参与"名家比对""笔法重演"与"听笔法"的八体 A/B 试听；
       碑帖廊里的 8 件碑帖与这 8 档一一对应，故 8 件全部 comparable: true，
       界面上不再有"仅静态展示"的卡片。
     数值来源（重要，勿删）：
       · 欧 / 颜 / 柳 / 赵 / 王 五档为团队依各家碑帖笔意标定的示例档案；
       · 曹全碑 / 张迁碑 / 石门颂 三档隶书档案**依碑刻风格的定性描述设定，
         非实测拓本统计** —— 数值与下方 STELES 里对应碑帖的 feature 档案
         逐字段相同（同一份数据只写一次，避免两处漂移）。
     epithet 是"一句话风格"，用于比对解释与 A/B 试听的引导语。
     struct 字段为笔法重演的生成参数（不是特征向量的一部分）：
       weight   笔道基准粗细（相对画布短边的千分比）
       lift     提按幅度（1 = 几乎不提按，越大粗细变化越剧烈）
       turnSoft 转折柔度（0 = 方折见棱，1 = 完全圆转）
       flare    收笔外扩（燕尾 / 波磔 / 出锋的强度）
       tight    中宫收紧度（越大越内擫）
       slant    欹侧角（度，正值为右上倾）
       wave     横画波势（起伏幅度）
       tempo    行笔基准速度（px/s，与 avgSpeed 对应）
       swing    速度摆动幅度（决定快慢交替的强度）
       dwell    驻笔权重（起收处的停顿长度）
       entry    起笔方式：'square' 方切 | 'round' 藏圆 | 'sharp' 露锋
     ------------------------------------------------------------------------- */
  const STYLES = [
    {
      id: 'ou', zh: '欧体', en: 'Ou style', calligrapher_zh: '欧阳询', calligrapher_en: 'Ouyang Xun',
      work_zh: '九成宫醴泉铭', work_en: 'Inscription on the Sweet Spring at Jiucheng Palace', era_zh: '唐 · 贞观六年（632）', script_zh: '楷书',
      epithet_zh: '险峻峭拔 · 中宫收紧', epithet_en: 'Precipitous and taut, a tight centre',
      feature: {
        startAngle: 92, entryShape: 0.16, avgSpeed: 520, speedVar: 0.05, pressRatio: 2.25,
        turnAngle: 62, dwellTotal: 130, rhythmEntropy: 0.56, midStability: 0.91, endDirection: 22
      },
      struct: { weight: 38, lift: 1.35, turnSoft: 0.18, flare: 0.55, tight: 1.25, slant: -3, wave: 0.34, tempo: 520, swing: 0.35, dwell: 0.55, entry: 'square' },
      note_zh: '起笔多方切，转折见棱，竖画细劲而两端重，故速度方差小、转折角大。',
      note_en: 'Square-cut entries, angular turns, slender verticals weighted at both ends: low speed variance, large turn angles.'
    },
    {
      id: 'yan', zh: '颜体', en: 'Yan style', calligrapher_zh: '颜真卿', calligrapher_en: 'Yan Zhenqing',
      work_zh: '多宝塔碑', work_en: 'Duobao Pagoda Stele', era_zh: '唐 · 天宝十一年（752）', script_zh: '楷书',
      epithet_zh: '宽博厚重 · 蚕头燕尾', epithet_en: 'Broad and weighty, silkworm head and swallow tail',
      feature: {
        startAngle: 112, entryShape: 0.58, avgSpeed: 380, speedVar: 0.10, pressRatio: 3.40,
        turnAngle: 38, dwellTotal: 265, rhythmEntropy: 0.63, midStability: 0.82, endDirection: 106
      },
      struct: { weight: 56, lift: 2.10, turnSoft: 0.46, flare: 1.00, tight: 0.78, slant: 2, wave: 0.22, tempo: 380, swing: 0.30, dwell: 1.00, entry: 'round' },
      note_zh: '藏锋圆起、按笔沉厚，提按幅度大而转折较圆，驻笔明显。',
      note_en: 'Concealed round entries, heavy pressure, large press variation with rounded turns and marked dwell.'
    },
    {
      id: 'liu', zh: '柳体', en: 'Liu style', calligrapher_zh: '柳公权', calligrapher_en: 'Liu Gongquan',
      work_zh: '玄秘塔碑', work_en: 'Xuanmi Pagoda Stele', era_zh: '唐 · 会昌元年（841）', script_zh: '楷书',
      epithet_zh: '骨力峭拔 · 瘦硬通神', epithet_en: 'Bone-force and severity, lean and resilient',
      feature: {
        startAngle: 96, entryShape: 0.26, avgSpeed: 615, speedVar: 0.07, pressRatio: 2.80,
        turnAngle: 70, dwellTotal: 95, rhythmEntropy: 0.50, midStability: 0.93, endDirection: 34
      },
      struct: { weight: 34, lift: 1.55, turnSoft: 0.12, flare: 0.70, tight: 1.10, slant: -1, wave: 0.30, tempo: 615, swing: 0.24, dwell: 0.35, entry: 'sharp' },
      note_zh: '行笔爽利、转折最见骨力，速度均值高而方差小，驻笔极短。',
      note_en: 'Crisp travel and the most skeletal turns: high mean speed, small variance, minimal dwell.'
    },
    {
      id: 'zhao', zh: '赵体', en: 'Zhao style', calligrapher_zh: '赵孟頫', calligrapher_en: 'Zhao Mengfu',
      work_zh: '胆巴碑', work_en: 'Danba Stele', era_zh: '元 · 延祐三年（1316）', script_zh: '楷书（行楷）',
      epithet_zh: '圆润遒媚 · 藏锋流转', epithet_en: 'Round and fluent, concealed and flowing',
      feature: {
        startAngle: 68, entryShape: 0.36, avgSpeed: 432, speedVar: 0.13, pressRatio: 1.90,
        turnAngle: 24, dwellTotal: 182, rhythmEntropy: 0.68, midStability: 0.86, endDirection: 158
      },
      struct: { weight: 42, lift: 1.05, turnSoft: 0.86, flare: 0.62, tight: 0.95, slant: 6, wave: 0.26, tempo: 432, swing: 0.42, dwell: 0.62, entry: 'round' },
      note_zh: '提按幅度最小、转折最圆，速度方差中等而节奏连贯，收笔多回锋。',
      note_en: 'The least press variation and the roundest turns; moderate speed variance, continuous rhythm, returning exits.'
    },
    {
      id: 'wang', zh: '王羲之行书', en: 'Wang Xizhi (running script)', calligrapher_zh: '王羲之', calligrapher_en: 'Wang Xizhi',
      work_zh: '兰亭序', work_en: 'Preface to the Orchid Pavilion Poems', era_zh: '东晋 · 永和九年（353）', script_zh: '行书',
      epithet_zh: '连绵变化 · 侧锋取妍', epithet_en: 'Continuous and various, slanted for beauty',
      feature: {
        startAngle: 58, entryShape: 0.46, avgSpeed: 705, speedVar: 0.28, pressRatio: 2.05,
        turnAngle: 30, dwellTotal: 150, rhythmEntropy: 0.85, midStability: 0.63, endDirection: 214
      },
      struct: { weight: 36, lift: 1.30, turnSoft: 0.62, flare: 0.82, tight: 0.88, slant: 9, wave: 0.48, tempo: 705, swing: 0.78, dwell: 0.48, entry: 'sharp' },
      note_zh: '速度方差与节奏熵最大、中段最不稳定——行书的"连绵"正是以稳定性换连续性的结果。',
      note_en: 'Largest speed variance and rhythm entropy, least stable middle: the price of running script’s continuity.'
    },
    {
      id: 'caoquan', zh: '曹全碑', en: 'Cao Quan Stele', calligrapher_zh: '佚名（汉碑，无书者署款）', calligrapher_en: 'Anonymous (Han stele)',
      work_zh: '曹全碑', work_en: 'Cao Quan Stele', era_zh: '东汉 · 中平二年（185）', script_zh: '隶书',
      epithet_zh: '秀逸圆润 · 蚕头燕尾', epithet_en: 'Refined and rounded, silkworm head and swallow tail',
      feature: {
        startAngle: 118, entryShape: 0.62, avgSpeed: 340, speedVar: 0.12, pressRatio: 3.10,
        turnAngle: 26, dwellTotal: 300, rhythmEntropy: 0.66, midStability: 0.79, endDirection: 128
      },
      struct: { weight: 40, lift: 1.85, turnSoft: 0.66, flare: 1.30, tight: 0.70, slant: 0, wave: 0.88, tempo: 340, swing: 0.36, dwell: 0.85, entry: 'round' },
      note_zh: '依碑刻风格的定性描述设定（非实测拓本统计）：藏锋圆起、波磔分明，横势八体最舒展、燕尾最显，驻笔长达 300 ms。',
      note_en: 'Set from the stele’s qualitative description (not a rubbing survey): concealed round entries, marked waves, the most expansive horizontals, the strongest swallow tails and a long dwell.'
    },
    {
      id: 'zhangqian', zh: '张迁碑', en: 'Zhang Qian Stele', calligrapher_zh: '佚名（汉碑，无书者署款）', calligrapher_en: 'Anonymous (Han stele)',
      work_zh: '张迁碑', work_en: 'Zhang Qian Stele', era_zh: '东汉 · 中平三年（186）', script_zh: '隶书',
      epithet_zh: '方整古拙 · 波磔含蓄', epithet_en: 'Square and archaic, restrained waves',
      feature: {
        startAngle: 100, entryShape: 0.50, avgSpeed: 300, speedVar: 0.08, pressRatio: 2.60,
        turnAngle: 54, dwellTotal: 340, rhythmEntropy: 0.52, midStability: 0.88, endDirection: 74
      },
      struct: { weight: 54, lift: 1.40, turnSoft: 0.20, flare: 0.45, tight: 0.86, slant: -2, wave: 0.30, tempo: 300, swing: 0.26, dwell: 1.05, entry: 'square' },
      note_zh: '依碑刻风格的定性描述设定（非实测拓本统计）：方笔切入、转折最见棱（54°），波磔最含蓄，行笔最沉缓而驻笔最长（340 ms），节奏最均一（熵 0.52）。',
      note_en: 'Set from the stele’s qualitative description (not a rubbing survey): square entries, the most angular turns (54°), the most restrained waves, the slowest travel with the longest dwell (340 ms) and the most even rhythm (entropy 0.52).'
    },
    {
      id: 'shimen', zh: '石门颂', en: 'Shimen Eulogy', calligrapher_zh: '王升（撰文；无书者署款）', calligrapher_en: 'Wang Sheng (text; calligrapher anonymous)',
      work_zh: '石门颂', work_en: 'Eulogy of Shimen', era_zh: '东汉 · 建和二年（148）', script_zh: '隶书',
      epithet_zh: '野逸开张 · 圆劲疏朗', epithet_en: 'Untrammelled and expansive, round-force and spacious',
      feature: {
        startAngle: 76, entryShape: 0.40, avgSpeed: 380, speedVar: 0.16, pressRatio: 2.30,
        turnAngle: 20, dwellTotal: 210, rhythmEntropy: 0.74, midStability: 0.75, endDirection: 176
      },
      struct: { weight: 46, lift: 1.25, turnSoft: 0.74, flare: 0.95, tight: 0.60, slant: 4, wave: 0.62, tempo: 380, swing: 0.52, dwell: 0.60, entry: 'round' },
      note_zh: '依碑刻风格的定性描述设定（非实测拓本统计）：圆起圆转、转折最圆（20°），中宫八体最疏（tight 0.60），速度与节奏起伏最大（方差 0.16 / 熵 0.74）、中段最不稳（0.75）——摩崖"野逸开张"的运动学后果。',
      note_en: 'Set from the stele’s qualitative description (not a rubbing survey): round entries and the roundest turns (20°), the most open centre (tight 0.60), the widest speed and rhythm range (variance 0.16 / entropy 0.74) and the least steady middle (0.75) — the kinematics of a cliff-face hand.'
    }
  ];

  /* ---------------------------------------------------------------------------
     八件公版碑帖（全部超出著作权保护期）
     每件给出：书家 / 年代 / 书体 / 风格标签 / 自绘骨架的结构参数 / 十维特征档案
      comparable：该碑是否参与"名家比对""笔法重演"与"听笔法"的 A/B 试听。
        true  ⇔ styleId 指向 STYLES 里真实存在的一档。当前 8 件碑帖与 8 档
                书体档案一一对应，所以**全部为 true**；界面据此打"可比对 ·
                可重演"徽标（三件隶书碑帖与五件楷 / 行书碑帖同等可比对）。
        false 只作为将来新增碑帖尚未配档案时的安全分支：styleId 为 null 时
                界面降级为"仅静态展示"（骨架 / 轮廓 / 十维档案照常可看），
                并要求该碑带一句 compareNote_zh 说明原因。
        styleId 一律不得指向 STYLES 里不存在的 id（悬挂引用）。
     styleLabel_zh / styleLabel_en：只写"风格限定语"（秀逸 / 方整 / 王羲之…），
       卡片上由 app.js 的 steleScriptLine() 拼成"隶书 · 秀逸"，不要自己再写一遍
       书体名，否则会出现"隶书 · 隶书（秀逸）"这种重复标签。
     pendingAsset：留给 Lead 后续替换 AI 影像的位置标记（当前以程序生成的
     宣纸·墨扩散质感代替；即使该文件缺失，界面完全正常）
     ------------------------------------------------------------------------- */
  const STELES = [
    {
      id: 'duobao', order: 1,
      title_zh: '多宝塔碑', title_en: 'Duobao Pagoda Stele', short_zh: '多宝塔',
      calligrapher_zh: '颜真卿', calligrapher_en: 'Yan Zhenqing',
      era_zh: '唐 · 天宝十一年（752）', year: 752, script_zh: '楷书', script_en: 'Regular script',
      styleId: 'yan', comparable: true, styleLabel_zh: '颜体', styleLabel_en: 'Yan',
      tags_zh: ['宽博', '蚕头燕尾', '藏锋圆起', '横细竖粗'], tags_en: ['broad', 'silkworm head', 'concealed entry', 'thin horizontals'],
      struct: { weight: 56, lift: 2.10, turnSoft: 0.46, flare: 1.00, tight: 0.78, slant: 2, wave: 0.22, tempo: 380, swing: 0.30, dwell: 1.00, entry: 'round' },
      feature: { startAngle: 112, entryShape: 0.58, avgSpeed: 380, speedVar: 0.10, pressRatio: 3.40, turnAngle: 38, dwellTotal: 265, rhythmEntropy: 0.63, midStability: 0.82, endDirection: 106 },
      pendingAsset: 'assets/stele_duobao_ai.jpg',
      assetNote_zh: '待替换：石碑拓片氛围图（AI 生成，团队自用）',
      sourceNote_zh: '公有领域 · 唐代碑刻；骨架为团队自绘示意，非拓本描摹'
    },
    {
      id: 'jiuchenggong', order: 2,
      title_zh: '九成宫醴泉铭', title_en: 'Inscription on the Sweet Spring at Jiucheng Palace', short_zh: '九成宫',
      calligrapher_zh: '欧阳询', calligrapher_en: 'Ouyang Xun',
      era_zh: '唐 · 贞观六年（632）', year: 632, script_zh: '楷书', script_en: 'Regular script',
      styleId: 'ou', comparable: true, styleLabel_zh: '欧体', styleLabel_en: 'Ou',
      tags_zh: ['险峻', '方笔切入', '中宫收紧', '戈戟森严'], tags_en: ['precipitous', 'square entry', 'tight centre', 'halberd-sharp'],
      struct: { weight: 38, lift: 1.35, turnSoft: 0.18, flare: 0.55, tight: 1.25, slant: -3, wave: 0.34, tempo: 520, swing: 0.35, dwell: 0.55, entry: 'square' },
      feature: { startAngle: 92, entryShape: 0.16, avgSpeed: 520, speedVar: 0.05, pressRatio: 2.25, turnAngle: 62, dwellTotal: 130, rhythmEntropy: 0.56, midStability: 0.91, endDirection: 22 },
      pendingAsset: 'assets/stele_jiuchenggong_ai.jpg',
      assetNote_zh: '待替换：碑石侧光质感图（AI 生成，团队自用）',
      sourceNote_zh: '公有领域 · 唐代碑刻；骨架为团队自绘示意，非拓本描摹'
    },
    {
      id: 'xuanmita', order: 3,
      title_zh: '玄秘塔碑', title_en: 'Xuanmi Pagoda Stele', short_zh: '玄秘塔',
      calligrapher_zh: '柳公权', calligrapher_en: 'Liu Gongquan',
      era_zh: '唐 · 会昌元年（841）', year: 841, script_zh: '楷书', script_en: 'Regular script',
      styleId: 'liu', comparable: true, styleLabel_zh: '柳体', styleLabel_en: 'Liu',
      tags_zh: ['骨力', '瘦硬', '转折峭拔', '驻笔极短'], tags_en: ['bone-force', 'lean', 'sharp turns', 'brief dwell'],
      struct: { weight: 34, lift: 1.55, turnSoft: 0.12, flare: 0.70, tight: 1.10, slant: -1, wave: 0.30, tempo: 615, swing: 0.24, dwell: 0.35, entry: 'sharp' },
      feature: { startAngle: 96, entryShape: 0.26, avgSpeed: 615, speedVar: 0.07, pressRatio: 2.80, turnAngle: 70, dwellTotal: 95, rhythmEntropy: 0.50, midStability: 0.93, endDirection: 34 },
      pendingAsset: 'assets/stele_xuanmita_ai.jpg',
      assetNote_zh: '待替换：石纹与刻痕微距图（AI 生成，团队自用）',
      sourceNote_zh: '公有领域 · 唐代碑刻；骨架为团队自绘示意，非拓本描摹'
    },
    {
      id: 'danba', order: 4,
      title_zh: '胆巴碑', title_en: 'Danba Stele', short_zh: '胆巴碑',
      calligrapher_zh: '赵孟頫', calligrapher_en: 'Zhao Mengfu',
      era_zh: '元 · 延祐三年（1316）', year: 1316, script_zh: '楷书（行楷）', script_en: 'Regular / running script',
      styleId: 'zhao', comparable: true, styleLabel_zh: '赵体', styleLabel_en: 'Zhao',
      tags_zh: ['圆润', '遒媚', '藏锋流转', '转折最圆'], tags_en: ['round', 'fluent', 'concealed flow', 'roundest turns'],
      struct: { weight: 42, lift: 1.05, turnSoft: 0.86, flare: 0.62, tight: 0.95, slant: 6, wave: 0.26, tempo: 432, swing: 0.42, dwell: 0.62, entry: 'round' },
      feature: { startAngle: 68, entryShape: 0.36, avgSpeed: 432, speedVar: 0.13, pressRatio: 1.90, turnAngle: 24, dwellTotal: 182, rhythmEntropy: 0.68, midStability: 0.86, endDirection: 158 },
      pendingAsset: 'assets/stele_danba_ai.jpg',
      assetNote_zh: '待替换：纸墨氛围图（AI 生成，团队自用）',
      sourceNote_zh: '公有领域 · 元代碑刻（书家卒于 1322 年）；骨架为团队自绘示意'
    },
    {
      id: 'lanting', order: 5,
      title_zh: '兰亭序', title_en: 'Preface to the Orchid Pavilion Poems', short_zh: '兰亭序',
      calligrapher_zh: '王羲之', calligrapher_en: 'Wang Xizhi',
      era_zh: '东晋 · 永和九年（353）', year: 353, script_zh: '行书', script_en: 'Running script',
      styleId: 'wang', comparable: true, styleLabel_zh: '王羲之', styleLabel_en: 'Wang Xizhi',
      tags_zh: ['连绵', '变化多端', '侧锋取妍', '节奏最自由'], tags_en: ['continuous', 'various', 'slanted', 'freest rhythm'],
      struct: { weight: 36, lift: 1.30, turnSoft: 0.62, flare: 0.82, tight: 0.88, slant: 9, wave: 0.48, tempo: 705, swing: 0.78, dwell: 0.48, entry: 'sharp' },
      feature: { startAngle: 58, entryShape: 0.46, avgSpeed: 705, speedVar: 0.28, pressRatio: 2.05, turnAngle: 30, dwellTotal: 150, rhythmEntropy: 0.85, midStability: 0.63, endDirection: 214 },
      pendingAsset: 'assets/stele_lanting_ai.jpg',
      assetNote_zh: '待替换：兰亭水岸水墨氛围图（AI 生成，团队自用）',
      sourceNote_zh: '公有领域 · 东晋（书家卒于 361 年）；现存皆为摹本，本作仅取笔意'
    },
    {
      id: 'caoquan', order: 6,
      title_zh: '曹全碑', title_en: 'Cao Quan Stele', short_zh: '曹全',
      calligrapher_zh: '佚名（汉碑，无书者署款）', calligrapher_en: 'Anonymous (Han stele)',
      era_zh: '东汉 · 中平二年（185）', year: 185, script_zh: '隶书', script_en: 'Clerical script',
      styleId: 'caoquan', comparable: true, styleLabel_zh: '秀逸', styleLabel_en: 'Refined',
      tags_zh: ['蚕头燕尾', '波磔分明', '横势舒展'], tags_en: ['silkworm head', 'clear waves', 'expansive horizontals'],
      struct: { weight: 40, lift: 1.85, turnSoft: 0.66, flare: 1.30, tight: 0.70, slant: 0, wave: 0.88, tempo: 340, swing: 0.36, dwell: 0.85, entry: 'round' },
      feature: { startAngle: 118, entryShape: 0.62, avgSpeed: 340, speedVar: 0.12, pressRatio: 3.10, turnAngle: 26, dwellTotal: 300, rhythmEntropy: 0.66, midStability: 0.79, endDirection: 128 },
      pendingAsset: 'assets/stele_caoquan_ai.jpg',
      assetNote_zh: '待替换：汉碑拓片质感图（AI 生成，团队自用）',
      sourceNote_zh: '公有领域 · 东汉碑刻；骨架为团队自绘示意，非拓本描摹'
    },
    {
      id: 'zhangqian', order: 7,
      title_zh: '张迁碑', title_en: 'Zhang Qian Stele', short_zh: '张迁',
      calligrapher_zh: '佚名（汉碑，无书者署款）', calligrapher_en: 'Anonymous (Han stele)',
      era_zh: '东汉 · 中平三年（186）', year: 186, script_zh: '隶书', script_en: 'Clerical script',
      styleId: 'zhangqian', comparable: true, styleLabel_zh: '方整', styleLabel_en: 'Square',
      tags_zh: ['拙厚', '波磔含蓄', '结体方峻'], tags_en: ['blunt and thick', 'restrained waves', 'square structure'],
      struct: { weight: 54, lift: 1.40, turnSoft: 0.20, flare: 0.45, tight: 0.86, slant: -2, wave: 0.30, tempo: 300, swing: 0.26, dwell: 1.05, entry: 'square' },
      feature: { startAngle: 100, entryShape: 0.50, avgSpeed: 300, speedVar: 0.08, pressRatio: 2.60, turnAngle: 54, dwellTotal: 340, rhythmEntropy: 0.52, midStability: 0.88, endDirection: 74 },
      pendingAsset: 'assets/stele_zhangqian_ai.jpg',
      assetNote_zh: '待替换：碑石粗粝质感图（AI 生成，团队自用）',
      sourceNote_zh: '公有领域 · 东汉碑刻；骨架为团队自绘示意，非拓本描摹'
    },
    {
      id: 'shimen', order: 8,
      title_zh: '石门颂', title_en: 'Eulogy of Shimen', short_zh: '石门颂',
      calligrapher_zh: '王升（撰文；无书者署款）', calligrapher_en: 'Wang Sheng (text; calligrapher anonymous)',
      era_zh: '东汉 · 建和二年（148）', year: 148, script_zh: '隶书', script_en: 'Clerical script',
      styleId: 'shimen', comparable: true, styleLabel_zh: '野逸', styleLabel_en: 'Untrammelled',
      tags_zh: ['圆劲', '疏朗开阔', '笔势纵放'], tags_en: ['round-force', 'spacious', 'released momentum'],
      struct: { weight: 46, lift: 1.25, turnSoft: 0.74, flare: 0.95, tight: 0.60, slant: 4, wave: 0.62, tempo: 380, swing: 0.52, dwell: 0.60, entry: 'round' },
      feature: { startAngle: 76, entryShape: 0.40, avgSpeed: 380, speedVar: 0.16, pressRatio: 2.30, turnAngle: 20, dwellTotal: 210, rhythmEntropy: 0.74, midStability: 0.75, endDirection: 176 },
      pendingAsset: 'assets/stele_shimen_ai.jpg',
      assetNote_zh: '待替换：摩崖石刻氛围图（AI 生成，团队自用）',
      sourceNote_zh: '公有领域 · 东汉摩崖石刻；骨架为团队自绘示意，非拓本描摹'
    }
  ];

  const DATA = {
    VERSION: '1.1.0',
    FEATURE_KEYS: FEATURE_KEYS,
    FEATURE_META: FEATURE_META,
    STYLE_COUNT: STYLES.length,
    STELE_COUNT: STELES.length,
    /* 可参与"名家比对 / 笔法重演"的碑帖数（= comparable 为 true 的件数） */
    COMPARABLE_COUNT: STELES.filter(function (s) { return s.comparable === true; }).length,
    STYLES: STYLES,
    STELES: STELES,
    /* 匹配措辞约束（作品与文档一致遵守：只作教学性"更接近"，不作鉴定） */
    DISCLAIMER_zh: '本比对是对十维笔法特征的加权余弦相似度排序，属教学示意，不构成书家或年代鉴定。',
    DISCLAIMER_en: 'This comparison ranks weighted cosine similarity over ten brushwork features. It is pedagogical, not an attribution or a dating.',
    /* 碑帖廊范围说明（界面与文档共用同一口径）：8 碑结构可比 + 8 档案可参与比对 */
    SCOPE_NOTE_zh: '碑帖廊展示 8 件公版碑帖，全部有对应书体档案：8 件的结构可以直接横向比较，8 档档案也全部可参与名家比对与笔法重演——三件隶书碑帖（曹全碑 · 秀逸 / 张迁碑 · 方整 / 石门颂 · 野逸）各有独立档案，与五件楷 / 行书碑帖同等可比对。',
    SCOPE_NOTE_en: 'The gallery holds eight public-domain steles, every one of them backed by a style profile: the structure of all eight is directly comparable, and all eight profiles take part in style matching and brushwork replay — the three clerical steles (Cao Quan · refined, Zhang Qian · square, Shimen · untrammelled) now have profiles of their own and are as comparable as the five regular / running-script ones.',
    /* 档案数值来源口径（隶书三档的依据，界面、文档与 A/B 试听共用同一句话） */
    BASIS_NOTE_zh: '八档书体档案中，欧 / 颜 / 柳 / 赵 / 王五档是团队依各家碑帖笔意标定的示例档案；曹全碑 / 张迁碑 / 石门颂三档隶书档案依碑刻风格的定性描述（秀逸 / 方整 / 野逸）设定，非实测拓本统计，数值与对应碑帖的十维特征档案逐字段相同。',
    BASIS_NOTE_en: 'Among the eight profiles, the five for Ou, Yan, Liu, Zhao and Wang are exemplar profiles calibrated by the team from each master’s manner; the three clerical profiles (Cao Quan, Zhang Qian, Shimen) are set from the qualitative description of each stele (refined / square / untrammelled), not from a statistical survey of rubbings, and match the corresponding stele’s ten-feature profile field by field.'
  };

  if (typeof module === 'object' && module.exports) module.exports = DATA;
  root.MOJI_STELES = DATA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
