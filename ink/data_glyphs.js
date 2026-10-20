/* ============================================================================
   墨迹 · Traces of Ink —— 笔法骨架数据 data_glyphs.js
   ----------------------------------------------------------------------------
   内容：永字八法（侧/勒/努/趯/策/掠/啄/磔）的归一化骨架点列 + 相对提按序列。
   坐标系：归一化单位方格，x∈[0,1] 向右，y∈[0,1] 向下（屏幕坐标）。
   来源：团队依照历代书论对"永字八法"的形态描述自绘的示意骨架，
         不使用任何字体文件、碑帖扫描件或第三方矢量素材。
   结体：八笔的位置与比例按"永"字真实结体对位——点短促居字头正中；勒在上部略上斜，
         努自勒的交叉处直下；趯在努下端顿笔向左上挑出；策自左下向右上挑起；
         掠承策的锋尖向左下长撇而出，为八笔中最长的斜笔；啄在右上自勒的右端之下短促
         撇下，锋尖落到磔的蚕头上；磔自努的中段向右下捺出，末端按笔成捺脚。
         不摹写任何单字帖，只保证结构关系正确。
   用途：① 笔法重演模块的时间参数化重建 ② 碑帖廊"同一永字、八碑笔意"的
         矢量骨架生成。骨架本身不含时间信息，时间由 app.js 依书体特征向量生成。
   ========================================================================== */
(function (root) {
  'use strict';

  /* 每条笔画：
     id       内部标识
     ord      永字八法的传统次序
     drawOrder 拼合"永"字时的书写次序
     zh / alias / pinyin / en   名称
     axis     主运笔方向类别（h 横 / v 竖 / curve 斜曲）
     skeleton 归一化骨架点列 [[x,y], …]
     press    与 skeleton 等长的相对提按权重（0–1），决定笔道粗细包络
     head / tail  起笔/收笔的锋型系数（0 尖锋 → 1 藏锋圆厚）
     gloss_zh / gloss_en  书论释义（据《永字八法》及历代注疏改写）
     key_zh / key_en      动作要点
  */
  const YONG_STROKES = [
    {
      id: 'ce', ord: 1, drawOrder: 1, zh: '侧', alias: '点', pinyin: 'cè', en: 'Dot (Side)',
      axis: 'curve',
      /* 字头正中偏上的一点：全长仅约 0.088，是"一点"而非一撇 */
      skeleton: [[0.450, 0.100], [0.461, 0.122], [0.472, 0.144], [0.481, 0.163], [0.488, 0.180]],
      press: [0.66, 0.94, 1.00, 0.86, 0.52],
      head: 0.85, tail: 0.90,
      gloss_zh: '侧锋峻落，如鸟翻然侧下。一点之内已含起、行、收三段，故为八法之首。',
      gloss_en: 'A slanted landing, like a bird turning to descend. Even a single dot contains entry, travel and retrieval.',
      key_zh: '逆锋入纸 → 折锋顿挫 → 回锋收束',
      key_en: 'Concealed entry → compressed pause → returning retrieval'
    },
    {
      id: 'le', ord: 2, drawOrder: 2, zh: '勒', alias: '横', pinyin: 'lè', en: 'Horizontal (Rein)',
      axis: 'h',
      /* 上半部的横：逆锋重起，中段稍提，右端顿笔（末点略下沉）；努在其右端穿过 */
      skeleton: [[0.295, 0.348], [0.350, 0.336], [0.408, 0.324], [0.464, 0.313], [0.516, 0.305], [0.537, 0.310]],
      press: [0.88, 0.64, 0.52, 0.62, 0.88, 1.00],
      head: 0.80, tail: 0.75,
      gloss_zh: '勒者，如勒马之用缰。逆入平出，中段稍提，两端着力，故横不宜平直如尺。',
      gloss_en: 'Like reining a horse: a concealed entry, a level exit, slightly lifted in the middle, weighted at both ends.',
      key_zh: '逆锋起笔 → 中锋缓行 → 顿笔回收',
      key_en: 'Reverse entry → centred slow travel → paused return'
    },
    {
      id: 'nu', ord: 3, drawOrder: 3, zh: '努', alias: '竖', pinyin: 'nǔ', en: 'Vertical (Straight)',
      axis: 'v',
      /* 中竖：起于勒的交叉处并略高出勒背，直下至下端蓄势待趯 */
      skeleton: [[0.463, 0.278], [0.466, 0.367], [0.470, 0.477], [0.473, 0.586], [0.472, 0.687], [0.467, 0.773]],
      press: [0.90, 0.64, 0.56, 0.58, 0.70, 0.92],
      head: 0.86, tail: 0.95,
      gloss_zh: '努者，用力也。竖不可过直，直则无力，须"背"势，中段略含筋力。',
      gloss_en: 'Strength exerted downward. A vertical must not be dead straight — a slight "back" curve gives it tendon.',
      key_zh: '藏锋顿起 → 中锋直下 → 垂露或悬针',
      key_en: 'Concealed compressed entry → centred descent → dew-drop or needle finish'
    },
    {
      id: 'ti', ord: 4, drawOrder: 4, zh: '趯', alias: '钩', pinyin: 'tì', en: 'Hook (Leap)',
      axis: 'curve',
      /* 努下端顿笔后向左上挑出：横向跨度约 0.12、纵向约 0.16，与勒同一量级 */
      skeleton: [[0.470, 0.690], [0.466, 0.762], [0.460, 0.818], [0.444, 0.852], [0.416, 0.852], [0.386, 0.830], [0.350, 0.796]],
      press: [0.88, 0.94, 1.00, 0.76, 0.52, 0.30, 0.10],
      head: 0.95, tail: 0.05,
      gloss_zh: '趯者，如人之趯脚，其势轻疾。钩为竖之余势，须先蓄而后发。',
      gloss_en: 'Like a foot kicking off: light and quick. The hook is the stored momentum of the vertical, released.',
      key_zh: '顿笔蓄势 → 折锋转腕 → 出锋轻疾',
      key_en: 'Compressed pause → wrist turn → light quick exit'
    },
    {
      id: 'ce2', ord: 5, drawOrder: 5, zh: '策', alias: '提', pinyin: 'cè', en: 'Rising (Whip)',
      axis: 'curve',
      /* 左下向右上的一挑：重顿起于左下，锋尖送到掠的起笔处，相接成"横撇" */
      skeleton: [[0.190, 0.530], [0.240, 0.516], [0.292, 0.501], [0.344, 0.483], [0.393, 0.462]],
      press: [0.94, 0.78, 0.60, 0.38, 0.12],
      head: 0.92, tail: 0.06,
      gloss_zh: '策者，如策马之用鞭。仰笔趯锋，用力在发笔，得力在收笔。',
      gloss_en: 'Like a whip on horseback: an upward stroke, force applied at the start, effect felt at the finish.',
      key_zh: '重顿起笔 → 提锋上挑 → 出锋爽利',
      key_en: 'Heavy entry → lifted rising brush → crisp exit'
    },
    {
      id: 'lve', ord: 6, drawOrder: 6, zh: '掠', alias: '长撇', pinyin: 'lüè', en: 'Long Sweep',
      axis: 'curve',
      /* 承策的锋尖起笔，向左下长送，直抵左下角——八笔中最长的斜笔（弧长 0.44） */
      skeleton: [[0.359, 0.451], [0.356, 0.502], [0.344, 0.549], [0.322, 0.594], [0.294, 0.638], [0.262, 0.674], [0.222, 0.712], [0.180, 0.750], [0.144, 0.782], [0.122, 0.808]],
      press: [0.98, 0.86, 0.72, 0.58, 0.46, 0.36, 0.28, 0.20, 0.13, 0.06],
      head: 0.94, tail: 0.04,
      gloss_zh: '掠者，如以手拂物，疾而势长。撇贵在送，不可半途甩出。',
      gloss_en: 'Like brushing something aside — fast, with a long momentum. A sweep must be "seen off", never flung.',
      key_zh: '藏锋起笔 → 中锋斜送 → 渐提出锋',
      key_en: 'Concealed entry → centred diagonal send → gradual lift-off'
    },
    {
      id: 'zhuo', ord: 7, drawOrder: 7, zh: '啄', alias: '短撇', pinyin: 'zhuó', en: 'Short Peck',
      axis: 'curve',
      /* 右上短撇：起于勒的右端之下（y 大于勒右端的 y），短促撇下，锋尖落到磔的蚕头上 */
      skeleton: [[0.652, 0.321], [0.660, 0.358], [0.639, 0.400], [0.608, 0.441], [0.571, 0.472], [0.531, 0.494]],
      press: [1.00, 0.86, 0.66, 0.44, 0.24, 0.08],
      head: 0.96, tail: 0.03,
      gloss_zh: '啄者，如鸟之啄物，锐而且速。短撇之势在准，不在长。',
      gloss_en: 'Like a bird pecking — sharp and swift. A short peck values precision, not length.',
      key_zh: '峻落疾行 → 短促有力 → 尖锋离纸',
      key_en: 'Steep landing → short swift travel → needle exit'
    },
    {
      id: 'zhe', ord: 8, drawOrder: 8, zh: '磔', alias: '捺', pinyin: 'zhé', en: 'Press (Flay)',
      axis: 'curve',
      /* 自努的中段轻锋入纸，渐行渐重，末端三点近水平地按出捺脚（一波三折） */
      skeleton: [[0.533, 0.494], [0.567, 0.531], [0.602, 0.569], [0.638, 0.607], [0.674, 0.643], [0.710, 0.674], [0.745, 0.697], [0.778, 0.708], [0.808, 0.715], [0.838, 0.717]],
      press: [0.16, 0.34, 0.52, 0.68, 0.82, 0.94, 1.00, 0.98, 0.74, 0.32],
      head: 0.10, tail: 0.45,
      gloss_zh: '磔者，裂也。一波三折，起处轻、行处渐重、末处重按而复收，所谓"蚕头燕尾"。',
      gloss_en: '"To split open": one wave, three folds — light start, growing weight, a final press-and-release (silkworm head, swallow tail).',
      key_zh: '轻锋入纸 → 渐行渐重 → 顿按出锋',
      key_en: 'Light entry → steadily increasing weight → pressed release'
    }
  ];

  /* 拼合"永"字时各笔画的层级（后写者覆盖先写者），仅用于渲染顺序兜底 */
  const YONG_COMPOSE = ['ce', 'le', 'nu', 'ti', 'ce2', 'lve', 'zhuo', 'zhe'];

  /* 术语交叉引用：八法与通用术语库的对应 id（供 UI 内部锚点） */
  const YONG_TO_TERM = {
    ce: 'yong-ce', le: 'yong-le', nu: 'yong-nu', ti: 'yong-ti',
    ce2: 'yong-ce2', lve: 'yong-lve', zhuo: 'yong-zhuo', zhe: 'yong-zhe'
  };

  const DATA = {
    VERSION: '1.0.0',
    STROKE_COUNT: YONG_STROKES.length,
    YONG_STROKES: YONG_STROKES,
    YONG_COMPOSE: YONG_COMPOSE,
    YONG_TO_TERM: YONG_TO_TERM,
    /* 骨架数据性质声明（用于界面与文档一致性） */
    PROVENANCE: {
      origin: 'team-drawn',
      method: '依照《永字八法》及历代注疏的形态描述手工给出点列，逐点标注相对提按权重',
      noFont: true,
      noScan: true
    }
  };

  if (typeof module === 'object' && module.exports) module.exports = DATA;
  root.MOJI_GLYPHS = DATA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
