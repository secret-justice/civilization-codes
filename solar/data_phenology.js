/* ============================================================================
 * data_phenology.js — 二十四节气 · 三候 · 花信风 / 时令草木 · 农事要点
 * ----------------------------------------------------------------------------
 * · 三候（七十二候）取《逸周书·时训解》《月令七十二候集解》传统序列，
 *   英文名称为团队自译并保持"每候一短句"的体例。
 * · 花信风仅通行于小寒→谷雨八个节气（二十四番花信风，每节气三候各一花），
 *   其余节气改列"时令草木"，字段 flowerWind 标明是否属于花信风体系。
 * · art 字段为自绘 SVG 插画的程序化参数（motif + 参数），由 app.js 中的
 *   插画渲染器绘制，不使用任何外部图片。
 * · k = 太阳黄经索引（黄经 = 15° × k，k = 0 为春分）。
 * ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.PhenoData = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var PHENOLOGY = [
    { k: 19, key: 'xiaohan', name: '小寒', nameEn: 'Minor Cold', season: 'winter', month: 1,
      pinyin: 'Xiǎo Hán',
      brief: '冷气积久而寒，未至极点。北半球进入"三九"，日影仍在增长但已临近转折。',
      briefEn: 'Cold has accumulated but not yet peaked; the coldest “sanjiu” days arrive while the noon shadow is still lengthening toward its turn.',
      pentads: [
        { zh: '雁北乡', en: 'Geese turn northward' },
        { zh: '鹊始巢', en: 'Magpies begin to nest' },
        { zh: '雉始雊', en: 'Pheasants begin to call' }
      ],
      plants: [
        { zh: '梅花', en: 'plum blossom' }, { zh: '山茶', en: 'camellia' }, { zh: '水仙', en: 'narcissus' }
      ],
      flowerWind: true,
      farm: '防冻保墒：麦田镇压、果园涂白，检修水利与农具，为春耕储力。',
      farmEn: 'Guard against frost and conserve soil moisture: roll wheat fields, whitewash orchards, repair tools and waterworks for spring.',
      art: { motif: 'ice-crystal', points: 6, petals: 3 } },

    { k: 20, key: 'dahan', name: '大寒', nameEn: 'Major Cold', season: 'winter', month: 1,
      pinyin: 'Dà Hán',
      brief: '一年中最冷的时段，亦是一轮回的终点：再过半月，太阳黄经即回到立春。',
      briefEn: 'The coldest stretch of the year and the end of a cycle: within a fortnight the Sun returns to the Start of Spring longitude.',
      pentads: [
        { zh: '鸡始乳', en: 'Hens begin to hatch' },
        { zh: '征鸟厉疾', en: 'Birds of prey hunt fiercely' },
        { zh: '水泽腹坚', en: 'Marsh ice grows solid to the core' }
      ],
      plants: [
        { zh: '瑞香', en: 'winter daphne' }, { zh: '兰花', en: 'orchid' }, { zh: '山矾', en: 'sweet-leaf' }
      ],
      flowerWind: true,
      farm: '积肥造肥、兴修水利，准备春播种子；南方注意防寒保苗。',
      farmEn: 'Build compost and irrigation works, prepare spring seed; in the south protect seedlings from cold.',
      art: { motif: 'ice-crystal', points: 8, petals: 4 } },

    { k: 21, key: 'lichun', name: '立春', nameEn: 'Start of Spring', season: 'spring', month: 2,
      pinyin: 'Lì Chūn',
      brief: '太阳黄经 315°，四时之始。天文上春季自此开始，日影由长转短的拐点已过。',
      briefEn: 'Solar longitude 315°, the first of the four seasons; the noon shadow has already passed its turning point.',
      pentads: [
        { zh: '东风解冻', en: 'East winds thaw the ice' },
        { zh: '蛰虫始振', en: 'Hibernating insects begin to stir' },
        { zh: '鱼陟负冰', en: 'Fish rise beneath the breaking ice' }
      ],
      plants: [
        { zh: '迎春', en: 'winter jasmine' }, { zh: '樱桃', en: 'cherry' }, { zh: '望春', en: 'Yulan magnolia' }
      ],
      flowerWind: true,
      farm: '春耕备耕开始：整地、选种、检修农机；冬小麦返青需追肥。',
      farmEn: 'Spring ploughing begins: prepare land and seed, service machinery; top-dress overwintering wheat as it greens.',
      art: { motif: 'sun-horizon', arc: 'low', rays: 9 } },

    { k: 22, key: 'yushui', name: '雨水', nameEn: 'Rain Water', season: 'spring', month: 2,
      pinyin: 'Yǔ Shuǐ',
      brief: '气温回升、降水由雪转雨；太阳直射点北移，北半球昼长已明显超过 12 小时。',
      briefEn: 'Warming turns snow into rain; the subsolar point moves north and the day is now clearly longer than twelve hours.',
      pentads: [
        { zh: '獭祭鱼', en: 'Otters lay out fish like offerings' },
        { zh: '候雁北', en: 'Migratory geese head north' },
        { zh: '草木萌动', en: 'Grass and trees begin to sprout' }
      ],
      plants: [
        { zh: '菜花', en: 'rapeseed flower' }, { zh: '杏花', en: 'apricot blossom' }, { zh: '李花', en: 'plum blossom' }
      ],
      flowerWind: true,
      farm: '抓紧春灌与保墒，防治小麦纹枯病；果树开始修剪与追肥。',
      farmEn: 'Irrigate and conserve moisture, control wheat sheath blight; prune and fertilise fruit trees.',
      art: { motif: 'rain', drops: 9, sprout: true } },

    { k: 23, key: 'jingzhe', name: '惊蛰', nameEn: 'Awakening of Insects', season: 'spring', month: 3,
      pinyin: 'Jīng Zhé',
      brief: '春雷始鸣，蛰伏的虫类被惊醒，是二十四节气中唯一以动物行为命名的节点之一。',
      briefEn: 'The first spring thunder wakes dormant insects; one of the few terms named after animal behaviour.',
      pentads: [
        { zh: '桃始华', en: 'Peach trees begin to bloom' },
        { zh: '仓庚鸣', en: 'Orioles begin to sing' },
        { zh: '鹰化为鸠', en: 'Hawks turn into doves (a seasonal misreading)' }
      ],
      plants: [
        { zh: '桃花', en: 'peach blossom' }, { zh: '棠梨', en: 'wild pear' }, { zh: '蔷薇', en: 'rose' }
      ],
      flowerWind: true,
      farm: '越冬害虫开始活动，重点防治；春播作物适时下种，清沟排水。',
      farmEn: 'Overwintering pests become active — begin control; sow spring crops on time and clear drainage ditches.',
      art: { motif: 'bud', insect: true, leaves: 2 } },

    { k: 0, key: 'chunfen', name: '春分', nameEn: 'Vernal Equinox', season: 'spring', month: 3,
      pinyin: 'Chūn Fēn',
      brief: '太阳视黄经 0°、赤纬 0°，全球昼夜几乎等长；此后北半球昼长夜短。',
      briefEn: 'Apparent longitude 0°, declination 0°: day and night are nearly equal everywhere; northern days then exceed the nights.',
      pentads: [
        { zh: '玄鸟至', en: 'Swallows return' },
        { zh: '雷乃发声', en: 'Thunder begins to sound' },
        { zh: '始电', en: 'Lightning first appears' }
      ],
      plants: [
        { zh: '海棠', en: 'crab apple' }, { zh: '梨花', en: 'pear blossom' }, { zh: '木兰', en: 'magnolia' }
      ],
      flowerWind: true,
      farm: '春分麦起身，一刻值千金：加强肥水管理，防治病虫，准备春播。',
      farmEn: '“At the equinox wheat rises, every moment is precious”: push fertiliser and water, control pests, prepare spring sowing.',
      art: { motif: 'sun-horizon', arc: 'level', rays: 12, balance: true } },

    { k: 1, key: 'qingming', name: '清明', nameEn: 'Pure Brightness', season: 'spring', month: 4,
      pinyin: 'Qīng Míng',
      brief: '气清景明，万物皆显；既是节气也是唯一兼具节日身份的节点（祭扫、踏青）。',
      briefEn: 'Air clear and light bright: the one term that is also a major festival of tomb sweeping and spring outings.',
      pentads: [
        { zh: '桐始华', en: 'Paulownia begins to bloom' },
        { zh: '田鼠化为鴽', en: 'Voles give way to quail (a seasonal misreading)' },
        { zh: '虹始见', en: 'Rainbows first appear' }
      ],
      plants: [
        { zh: '桐花', en: 'paulownia flower' }, { zh: '麦花', en: 'wheat flower' }, { zh: '柳花', en: 'willow catkin' }
      ],
      flowerWind: true,
      farm: '春播高潮：稻区育秧、棉区播种；注意倒春寒与病虫害初发。',
      farmEn: 'Peak spring sowing: raise rice seedlings, sow cotton; watch for late frost and early pests.',
      art: { motif: 'bloom', petals: 5, stem: 2 } },

    { k: 2, key: 'guyu', name: '谷雨', nameEn: 'Grain Rain', season: 'spring', month: 4,
      pinyin: 'Gǔ Yǔ',
      brief: '雨生百谷，春季最后一个节气；此后太阳黄经进入夏季区间。',
      briefEn: 'Rain gives birth to grain — the last term of spring before the Sun enters the summer quadrant.',
      pentads: [
        { zh: '萍始生', en: 'Duckweed first appears' },
        { zh: '鸣鸠拂其羽', en: 'Cuckoos preen and call' },
        { zh: '戴胜降于桑', en: 'Hoopoes descend on the mulberry' }
      ],
      plants: [
        { zh: '牡丹', en: 'tree peony' }, { zh: '荼蘼', en: 'bramble rose' }, { zh: '楝花', en: 'chinaberry flower' }
      ],
      flowerWind: true,
      farm: '水稻插秧、棉花播种的关键窗口；雨水增多，注意防涝与病害。',
      farmEn: 'The key window for rice transplanting and cotton sowing; with more rain, guard against waterlogging and disease.',
      art: { motif: 'rain', drops: 12, sprout: true, grain: true } },

    { k: 3, key: 'lixia', name: '立夏', nameEn: 'Start of Summer', season: 'summer', month: 5,
      pinyin: 'Lì Xià',
      brief: '太阳黄经 45°，夏季开始；正午太阳高度角持续升高，日影继续缩短。',
      briefEn: 'Solar longitude 45°: summer begins, noon altitude keeps rising and the noon shadow keeps shortening.',
      pentads: [
        { zh: '蝼蝈鸣', en: 'Mole crickets begin to sing' },
        { zh: '蚯蚓出', en: 'Earthworms come to the surface' },
        { zh: '王瓜生', en: 'Snake gourd begins to grow' }
      ],
      plants: [
        { zh: '石榴', en: 'pomegranate flower' }, { zh: '鸢尾', en: 'iris' }, { zh: '月季', en: 'Chinese rose' }
      ],
      flowerWind: false,
      farm: '夏收作物进入生长后期，需水肥并重；开始防治稻飞虱、螟虫。',
      farmEn: 'Summer crops enter late growth: balance water and fertiliser; begin control of planthoppers and borers.',
      art: { motif: 'sun-zenith', rays: 14, warmth: 0.6 } },

    { k: 4, key: 'xiaoman', name: '小满', nameEn: 'Grain Buds', season: 'summer', month: 5,
      pinyin: 'Xiǎo Mǎn',
      brief: '夏熟作物籽粒开始饱满但未成熟；"小满"之名即由此而来。',
      briefEn: 'Grains of summer crops swell but are not yet ripe — the literal meaning of the name.',
      pentads: [
        { zh: '苦菜秀', en: 'Sow thistle comes into flower' },
        { zh: '靡草死', en: 'Shade-loving weeds wither' },
        { zh: '麦秋至', en: 'The wheat harvest arrives' }
      ],
      plants: [
        { zh: '苦菜', en: 'sow thistle' }, { zh: '蒲公英', en: 'dandelion' }, { zh: '麦穗', en: 'wheat ear' }
      ],
      flowerWind: false,
      farm: '江南"小满动三车"（水车、油车、丝车）；北方麦田防干热风。',
      farmEn: 'In Jiangnan the water wheel, oil press and silk reel all start; in the north guard wheat against dry hot winds.',
      art: { motif: 'grain-ear', fill: 0.55 } },

    { k: 5, key: 'mangzhong', name: '芒种', nameEn: 'Grain in Ear', season: 'summer', month: 6,
      pinyin: 'Máng Zhòng',
      brief: '有芒之麦可收、有芒之稻可种，一年中最忙的"双抢"时段。',
      briefEn: 'Awned wheat is reaped and awned rice is sown at once — the busiest double-harvest window of the year.',
      pentads: [
        { zh: '螳螂生', en: 'Mantises hatch' },
        { zh: '鵙始鸣', en: 'Shrikes begin to call' },
        { zh: '反舌无声', en: 'Mockingbirds fall silent' }
      ],
      plants: [
        { zh: '栀子', en: 'gardenia' }, { zh: '石竹', en: 'dianthus' }, { zh: '萱草', en: 'daylily' }
      ],
      flowerWind: false,
      farm: '抢收小麦、抢种夏稻；梅雨将临，注意蓄水与防洪。',
      farmEn: 'Reap wheat and sow summer rice in haste; the plum rains approach, so store water and prepare for floods.',
      art: { motif: 'grain-ear', fill: 1 } },

    { k: 6, key: 'xiazhi', name: '夏至', nameEn: 'Summer Solstice', season: 'summer', month: 6,
      pinyin: 'Xià Zhì',
      brief: '太阳视黄经 90°、赤纬 +23.44°，北半球正午日影最短、昼最长。',
      briefEn: 'Apparent longitude 90°, declination +23.44°: the shortest noon shadow and the longest day in the north.',
      pentads: [
        { zh: '鹿角解', en: 'Stags shed their antlers' },
        { zh: '蜩始鸣', en: 'Cicadas begin to sing' },
        { zh: '半夏生', en: 'Pinellia begins to grow' }
      ],
      plants: [
        { zh: '荷花', en: 'lotus' }, { zh: '木槿', en: 'rose of Sharon' }, { zh: '夹竹桃', en: 'oleander' }
      ],
      flowerWind: false,
      farm: '夏至不过不热：进入伏前管理，稻田晒田、棉花整枝，防旱防涝并重。',
      farmEn: 'Heat follows the solstice: pre-fu management, drain rice fields, prune cotton, balance drought and flood risk.',
      art: { motif: 'shadow', length: 0.16, zenith: true } },

    { k: 7, key: 'xiaoshu', name: '小暑', nameEn: 'Minor Heat', season: 'summer', month: 7,
      pinyin: 'Xiǎo Shǔ',
      brief: '暑气渐盛，出梅入伏；太阳直射点开始南移，但地面热量仍在累积。',
      briefEn: 'Heat builds as the plum rains end and the fu period begins; the subsolar point turns south while ground heat still accumulates.',
      pentads: [
        { zh: '温风至', en: 'Warm winds arrive' },
        { zh: '蟋蟀居壁', en: 'Crickets take to the walls' },
        { zh: '鹰始鸷', en: 'Hawks begin to hunt' }
      ],
      plants: [
        { zh: '凌霄', en: 'trumpet creeper' }, { zh: '茉莉', en: 'jasmine' }, { zh: '荷花', en: 'lotus' }
      ],
      flowerWind: false,
      farm: '防高温热害：水稻灌深水降温，蔬菜遮阴，果园覆盖保墒。',
      farmEn: 'Guard against heat damage: deepen paddy water, shade vegetables, mulch orchards.',
      art: { motif: 'heat', waves: 3, sun: true } },

    { k: 8, key: 'dashu', name: '大暑', nameEn: 'Major Heat', season: 'summer', month: 7,
      pinyin: 'Dà Shǔ',
      brief: '一年中最热的节气，正值"中伏"前后，雷暴与台风最活跃。',
      briefEn: 'The hottest term, around the middle fu period, when thunderstorms and typhoons are most active.',
      pentads: [
        { zh: '腐草为萤', en: 'Fireflies seem born of rotting grass' },
        { zh: '土润溽暑', en: 'Soil steams with humid heat' },
        { zh: '大雨时行', en: 'Great rains fall from time to time' }
      ],
      plants: [
        { zh: '紫薇', en: 'crape myrtle' }, { zh: '睡莲', en: 'water lily' }, { zh: '玉簪', en: 'hosta' }
      ],
      flowerWind: false,
      farm: '抗旱防洪并举；水稻抽穗扬花期对高温最敏感，需灌水调温。',
      farmEn: 'Fight both drought and flood; rice is most heat-sensitive at heading — adjust temperature with irrigation.',
      art: { motif: 'heat', waves: 5, sun: true, storm: true } },

    { k: 9, key: 'liqiu', name: '立秋', nameEn: 'Start of Autumn', season: 'autumn', month: 8,
      pinyin: 'Lì Qiū',
      brief: '太阳黄经 135°，秋季起点；天文入秋而气候未凉，"秋老虎"仍在。',
      briefEn: 'Solar longitude 135°, the start of autumn: astronomically autumn, climatically still hot.',
      pentads: [
        { zh: '凉风至', en: 'Cool winds arrive' },
        { zh: '白露降', en: 'White dew descends' },
        { zh: '寒蝉鸣', en: 'Cicadas sing coldly' }
      ],
      plants: [
        { zh: '木樨', en: 'osmanthus' }, { zh: '秋葵', en: 'okra' }, { zh: '凤仙', en: 'impatiens' }
      ],
      flowerWind: false,
      farm: '秋收准备：稻田后期管理、玉米灌浆，防范伏旱与台风。',
      farmEn: 'Prepare the autumn harvest: late rice management, maize grain filling, guard against drought and typhoons.',
      art: { motif: 'leaf', falling: 2, cool: true } },

    { k: 10, key: 'chushu', name: '处暑', nameEn: 'End of Heat', season: 'autumn', month: 8,
      pinyin: 'Chǔ Shǔ',
      brief: '"处"为终止：暑气至此而止，昼夜温差加大，秋高气爽开始。',
      briefEn: '“Chu” means to end: the heat stops here, day–night difference widens, and clear autumn weather begins.',
      pentads: [
        { zh: '鹰乃祭鸟', en: 'Hawks lay out their prey' },
        { zh: '天地始肃', en: 'Heaven and earth turn austere' },
        { zh: '禾乃登', en: 'Grain ripens for harvest' }
      ],
      plants: [
        { zh: '玉簪', en: 'hosta' }, { zh: '石蒜', en: 'red spider lily' }, { zh: '稻花', en: 'rice flower' }
      ],
      flowerWind: false,
      farm: '秋收秋种衔接：抢收早稻、栽插晚稻，注意连阴雨。',
      farmEn: 'Harvest and sowing overlap: reap early rice, transplant late rice, watch for prolonged rain.',
      art: { motif: 'leaf', falling: 4 } },

    { k: 11, key: 'bailu', name: '白露', nameEn: 'White Dew', season: 'autumn', month: 9,
      pinyin: 'Bái Lù',
      brief: '夜间水汽凝结成露，色白而名；太阳直射点已回到赤道以北不远处。',
      briefEn: 'Night moisture condenses into white dew; the subsolar point is back near the equator.',
      pentads: [
        { zh: '鸿雁来', en: 'Wild geese arrive' },
        { zh: '玄鸟归', en: 'Swallows depart' },
        { zh: '群鸟养羞', en: 'Birds store up winter food' }
      ],
      plants: [
        { zh: '桂花', en: 'osmanthus' }, { zh: '木芙蓉', en: 'cotton rose' }, { zh: '芦苇', en: 'reed' }
      ],
      flowerWind: false,
      farm: '北方开始秋收，南方晚稻抽穗；注意低温冷害与露水引发的病害。',
      farmEn: 'The north begins harvesting while southern late rice heads; watch for cold damage and dew-borne disease.',
      art: { motif: 'dew', drops: 6, geese: true } },

    { k: 12, key: 'qiufen', name: '秋分', nameEn: 'Autumnal Equinox', season: 'autumn', month: 9,
      pinyin: 'Qiū Fēn',
      brief: '太阳视黄经 180°、赤纬 0°，全球昼夜再次等长；此后北半球昼短夜长。',
      briefEn: 'Apparent longitude 180°, declination 0°: day and night equal again; northern nights then grow longer.',
      pentads: [
        { zh: '雷始收声', en: 'Thunder ceases' },
        { zh: '蛰虫坯户', en: 'Insects seal their burrows' },
        { zh: '水始涸', en: 'Waters begin to dry' }
      ],
      plants: [
        { zh: '菊花', en: 'chrysanthemum' }, { zh: '木芙蓉', en: 'cotton rose' }, { zh: '稻穗', en: 'rice ear' }
      ],
      flowerWind: false,
      farm: '秋分不生田：北方冬麦播种、南方晚稻灌浆，全国进入收获高峰。',
      farmEn: '“At the equinox the fields close”: winter wheat is sown in the north, late rice fills in the south, and harvest peaks nationwide.',
      art: { motif: 'moon', phase: 'half', reeds: true } },

    { k: 13, key: 'hanlu', name: '寒露', nameEn: 'Cold Dew', season: 'autumn', month: 10,
      pinyin: 'Hán Lù',
      brief: '露气寒冷将凝：气温比白露更低，露水将结未结，是秋季最舒适也最短的一段。',
      briefEn: 'Dew turns cold and nearly freezes; cooler than White Dew and the shortest, most pleasant stretch of autumn.',
      pentads: [
        { zh: '鸿雁来宾', en: 'Last geese arrive as guests' },
        { zh: '雀入大水为蛤', en: 'Sparrows turn into clams (a seasonal misreading)' },
        { zh: '菊有黄华', en: 'Chrysanthemums bloom yellow' }
      ],
      plants: [
        { zh: '菊花', en: 'chrysanthemum' }, { zh: '桂花', en: 'osmanthus' }, { zh: '木樨', en: 'sweet olive' }
      ],
      flowerWind: false,
      farm: '秋播扫尾、冬前管理；果树采收后施基肥，注意初霜冻。',
      farmEn: 'Finish autumn sowing and pre-winter management; apply base fertiliser after fruit harvest, watch for first frost.',
      art: { motif: 'dew', drops: 9, cold: true } },

    { k: 14, key: 'shuangjiang', name: '霜降', nameEn: 'Frost Descent', season: 'autumn', month: 10,
      pinyin: 'Shuāng Jiàng',
      brief: '秋季最后一个节气，初霜出现；太阳直射点南移至南半球 10° 上下。',
      briefEn: 'The last term of autumn, when first frost appears; the subsolar point is about 10° into the southern hemisphere.',
      pentads: [
        { zh: '豺乃祭兽', en: 'Jackals lay out their prey' },
        { zh: '草木黄落', en: 'Grass and trees yellow and fall' },
        { zh: '蛰虫咸俯', en: 'All insects withdraw' }
      ],
      plants: [
        { zh: '枫叶', en: 'maple leaf' }, { zh: '柿子', en: 'persimmon' }, { zh: '芦花', en: 'reed flower' }
      ],
      flowerWind: false,
      farm: '抢收怕冻作物（红薯、棉花）；果园冬灌、树干涂白防冻。',
      farmEn: 'Harvest frost-tender crops (sweet potato, cotton); winter-irrigate orchards and whitewash trunks.',
      art: { motif: 'frost', rays: 8 } },

    { k: 15, key: 'lidong', name: '立冬', nameEn: 'Start of Winter', season: 'winter', month: 11,
      pinyin: 'Lì Dōng',
      brief: '太阳黄经 225°，冬季开始；"冬，终也，万物收藏"，农事转入储藏与休整。',
      briefEn: 'Solar longitude 225°: winter begins; “dong” means closure, when all things are stored away.',
      pentads: [
        { zh: '水始冰', en: 'Water begins to freeze' },
        { zh: '地始冻', en: 'Ground begins to freeze' },
        { zh: '雉入大水为蜃', en: 'Pheasants turn into clams (a seasonal misreading)' }
      ],
      plants: [
        { zh: '山茶', en: 'camellia' }, { zh: '枇杷花', en: 'loquat flower' }, { zh: '蜡梅', en: 'wintersweet' }
      ],
      flowerWind: false,
      farm: '冬藏与水利建设：清淤修渠、积肥造肥，牲畜入圈保暖。',
      farmEn: 'Storage and waterworks: dredge channels, build compost, shelter livestock.',
      art: { motif: 'ice-crystal', points: 4, ground: true } },

    { k: 16, key: 'xiaoxue', name: '小雪', nameEn: 'Minor Snow', season: 'winter', month: 11,
      pinyin: 'Xiǎo Xuě',
      brief: '初雪始降，量小未积；太阳直射点南移至约 20°S，北半球昼短至 10 小时以下。',
      briefEn: 'First snow falls without settling; the subsolar point reaches about 20°S and northern days fall below ten hours.',
      pentads: [
        { zh: '虹藏不见', en: 'Rainbows hide away' },
        { zh: '天气上升地气下降', en: 'Heaven’s breath rises, earth’s breath sinks' },
        { zh: '闭塞而成冬', en: 'Closure completes the winter' }
      ],
      plants: [
        { zh: '蜡梅', en: 'wintersweet' }, { zh: '茶花', en: 'camellia' }, { zh: '南天竹', en: 'nandina' }
      ],
      flowerWind: false,
      farm: '腌菜腌肉、储藏越冬物资；麦田浇冬水，果树防寒。',
      farmEn: 'Pickle vegetables and cure meat, store winter supplies; winter-water wheat fields and protect orchards.',
      art: { motif: 'snow', flakes: 5, small: true } },

    { k: 17, key: 'daxue', name: '大雪', nameEn: 'Major Snow', season: 'winter', month: 12,
      pinyin: 'Dà Xuě',
      brief: '降雪范围扩大、积雪加深；太阳黄经 255°，距冬至仅 15°。',
      briefEn: 'Snowfall spreads and settles; longitude 255°, only 15° short of the winter solstice.',
      pentads: [
        { zh: '鹖鴠不鸣', en: 'Nightingales fall silent' },
        { zh: '虎始交', en: 'Tigers begin to mate' },
        { zh: '荔挺出', en: 'Litchi orchids sprout' }
      ],
      plants: [
        { zh: '蜡梅', en: 'wintersweet' }, { zh: '山茶', en: 'camellia' }, { zh: '梅花', en: 'plum blossom' }
      ],
      flowerWind: false,
      farm: '积雪保墒、防冻防病；兴修农田水利，准备来年春耕。',
      farmEn: 'Snow cover conserves moisture and suppresses pests; build waterworks and prepare for spring ploughing.',
      art: { motif: 'snow', flakes: 10 } },

    { k: 18, key: 'dongzhi', name: '冬至', nameEn: 'Winter Solstice', season: 'winter', month: 12,
      pinyin: 'Dōng Zhì',
      brief: '太阳视黄经 270°、赤纬 −23.44°：北半球正午日影最长、昼最短；此后日影开始回缩。',
      briefEn: 'Apparent longitude 270°, declination −23.44°: the longest noon shadow and shortest day, after which the shadow retreats.',
      pentads: [
        { zh: '蚯蚓结', en: 'Earthworms curl into knots' },
        { zh: '麋角解', en: 'Elk shed their antlers' },
        { zh: '水泉动', en: 'Springs begin to stir' }
      ],
      plants: [
        { zh: '梅花', en: 'plum blossom' }, { zh: '水仙', en: 'narcissus' }, { zh: '茶梅', en: 'sasanqua' }
      ],
      flowerWind: false,
      farm: '农闲积肥、检修农具；北方越冬作物进入休眠，注意防冻保苗。',
      farmEn: 'A slack season for compost and tool repair; northern crops dormancy — protect seedlings from frost.',
      art: { motif: 'shadow', length: 1.0, gnomon: true } }
  ];

  /** 按季节分组 */
  function bySeason(season) {
    return PHENOLOGY.filter(function (t) { return t.season === season; });
  }
  /** 按黄经索引 k 取 */
  function byK(k) {
    for (var i = 0; i < PHENOLOGY.length; i++) { if (PHENOLOGY[i].k === k) return PHENOLOGY[i]; }
    return null;
  }
  var SEASONS = [
    { id: 'spring', zh: '春', en: 'Spring', terms: ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨'] },
    { id: 'summer', zh: '夏', en: 'Summer', terms: ['立夏', '小满', '芒种', '夏至', '小暑', '大暑'] },
    { id: 'autumn', zh: '秋', en: 'Autumn', terms: ['立秋', '处暑', '白露', '秋分', '寒露', '霜降'] },
    { id: 'winter', zh: '冬', en: 'Winter', terms: ['立冬', '小雪', '大雪', '冬至', '小寒', '大寒'] }
  ];

  return { PHENOLOGY: PHENOLOGY, SEASONS: SEASONS, bySeason: bySeason, byK: byK };
}));
