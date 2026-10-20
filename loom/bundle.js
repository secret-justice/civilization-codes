/* ==== data_terms.js ==== */
// ============================================================
// 《织机与芯片》双语术语库 —— 团队原创整理
// 依据：人类非物质文化遗产代表作名录（南京云锦木机妆花手工织造技艺，2009）、
//      《天工开物·乃服》《雪宦绣谱》等公开文献、《中国丝绸科技艺术七千年》等纺织史著作，
//      以及中国丝绸博物馆、南京云锦研究所公开展陈释文，自行撰写释义与英译。
// 字段：id 唯一编号｜zh 中文定名｜en 英文定名｜cat 分类键｜note 中文释文｜noteEn 英文释文
// 6 个分类：org 织造组织 / motif 纹样母题 / mat 材料工艺 / loom 织机结构 / hist 技术史 / dict 术语对照
// ============================================================

const TERM_CATS = [
  { key: 'org',   zh: '织造组织', en: 'Weave structures' },
  { key: 'motif', zh: '纹样母题', en: 'Pattern motifs' },
  { key: 'mat',   zh: '材料工艺', en: 'Materials & craft' },
  { key: 'loom',  zh: '织机结构', en: 'Loom structure' },
  { key: 'hist',  zh: '技术史',   en: 'Technology history' },
  { key: 'dict',  zh: '术语对照', en: 'Term concordance' }
];

const TERMS = [
  // ---------- 织造组织 org ----------
  { id: 'org01', zh: '平纹', en: 'plain weave', cat: 'org',
    note: '一经一纬交替交织，交织点最密、浮长最短，是织物组织中最基础的一种。', noteEn: 'The simplest interlacing, one warp over one weft throughout; densest binding points, shortest floats.' },
  { id: 'org02', zh: '斜纹', en: 'twill', cat: 'org',
    note: '交织点按一定规律逐纬移动一格，表面呈连续斜向纹路；常见二上一下、三上一下等。', noteEn: 'Binding points shift one place per pick, producing a continuous diagonal rib on the face.' },
  { id: 'org03', zh: '缎纹', en: 'satin weave', cat: 'org',
    note: '交织点单独均匀分散，浮长最长，表面光洁如镜；云锦地部多用缎纹。', noteEn: 'Binding points are isolated and evenly dispersed, giving the longest floats and a glossy face.' },
  { id: 'org04', zh: '五枚缎纹', en: 'five-end satin', cat: 'org',
    note: '组织循环为五根经（或纬）的缎纹，飞数为 2 或 3；是云锦库缎、妆花缎最常用的地组织。', noteEn: 'A satin on a five-end repeat with a step of 2 or 3, the standard ground for brocade satins.' },
  { id: 'org05', zh: '经面缎', en: 'warp-faced satin', cat: 'org',
    note: '以经线浮于织物表面为主的缎组织，光泽沿经向连续。', noteEn: 'A satin in which the warp predominates on the face, giving sheen along the warp.' },
  { id: 'org06', zh: '纬面缎', en: 'weft-faced satin', cat: 'org',
    note: '以纬线浮于织物表面为主的缎组织。', noteEn: 'A satin in which the weft predominates on the face.' },
  { id: 'org07', zh: '组织循环', en: 'weave repeat', cat: 'org',
    note: '能够重复再现同一交织规律的最小经纬根数；平纹为 2、三枚斜纹为 3、五枚缎纹为 5。', noteEn: 'The smallest number of ends and picks that reproduces the interlacing; 2 for plain, 3 for a three-end twill, 5 for a five-end satin.' },
  { id: 'org08', zh: '完全组织', en: 'weave unit', cat: 'org',
    note: '一个组织循环所占据的经纬根数与交织序列的总称。', noteEn: 'The full block of ends and picks occupied by one repeat of a weave.' },
  { id: 'org09', zh: '交织点', en: 'interlacing point', cat: 'org',
    note: '经线与纬线交叠、彼此压住的位置；交织点的分布决定了织物的外观与手感。', noteEn: 'A point where warp and weft cross and one passes over the other.' },
  { id: 'org10', zh: '浮长', en: 'float', cat: 'org',
    note: '一根丝线跨过若干根另一方向丝线而不与之交织的长度；浮长越长，光泽越亮、耐磨越差。', noteEn: 'The length a thread passes over several threads of the other direction without binding; longer floats mean more sheen and less abrasion resistance.' },
  { id: 'org11', zh: '经浮长', en: 'warp float', cat: 'org',
    note: '经线浮在织物表面的连续长度。', noteEn: 'A continuous run of warp thread lying on the face.' },
  { id: 'org12', zh: '纬浮长', en: 'weft float', cat: 'org',
    note: '纬线浮在织物表面的连续长度；妆花的彩纬即以此显花。', noteEn: 'A continuous run of weft on the face; polychrome brocade figures are shown by such weft floats.' },
  { id: 'org13', zh: '经浮', en: 'warp on face', cat: 'org',
    note: '某一交织点上经线压在纬线之上、表面看到的是经线光泽的状态。在本作的渲染规则里，地部的经浮由所选组织（平纹／斜纹／五枚缎）决定，花部位不出现经浮——花本编码中的"提"指的是该位投彩纬，不是"经线在上"。', noteEn: 'The state in which the warp passes above the weft at a crossing, so the face shows warp sheen. In this work warp-faced points occur only in the ground, as decided by the chosen weave; the "lift" bit of a pattern draft marks an inlaid colour weft, not a warp on top.' },
  { id: 'org14', zh: '纬浮', en: 'weft on face', cat: 'org',
    note: '某一交织点上纬线压在经线之上的状态。本作统一按此渲染：花本编码为"提"（lift = 1）的位点，成品一律呈彩色纬浮（彩纬显花）；"沉"（0）的位点交回地组织决定经浮或纬浮。', noteEn: 'The state in which the weft passes above the warp. This is the rendering rule used throughout: every bit marked as a lift (1) in the pattern draft comes out as a colour-weft float, while sunk bits (0) are left to the ground weave.' },
  { id: 'org15', zh: '提沉', en: 'lift and sink', cat: 'org',
    note: '花本编码的两种取值：提（1）＝该位投入彩纬、成品呈纬浮；沉（0）＝该位不投彩纬，由地组织决定交织。它与综框的提落是两个层次——综框只负责地部开口，花本管的是"哪一位要不要彩纬"。', noteEn: 'The two values of the pattern code: lift (1) inlays a colour weft at that point and shows as a weft float; sink (0) leaves the point to the ground weave. Distinct from heddle motion: the frames open the ground shed, the pattern book decides where colour goes.' },
  { id: 'org16', zh: '通经断纬', en: 'warp-continuous, weft-discontinuous', cat: 'org',
    note: '地经贯通全幅，彩纬只在需要显花的一段内往返盘织，不通全幅；云锦妆花的核心工艺。', noteEn: 'Ground warps run the full width while colour wefts turn back within the figure area; the core technique of zhuanghua brocade.' },
  { id: 'org17', zh: '通梭', en: 'weft-through (single shuttle)', cat: 'org',
    note: '一梭通投全幅，地部常规织法；与"断纬"相对。', noteEn: 'One shuttle passing the full width, the normal ground method, opposed to discontinuous weft.' },
  { id: 'org18', zh: '断纬', en: 'discontinuous weft', cat: 'org',
    note: '纬线不贯通全幅，按花界回梭另起，故花纹边缘可自由换色。', noteEn: 'Weft that does not run the full width but turns back at the figure boundary, so colours change freely at the edge.' },
  { id: 'org19', zh: '地部', en: 'ground area', cat: 'org',
    note: '织物上不显花的背景区域，由地组织决定其外观。', noteEn: 'The non-figure background of a fabric, whose appearance is set by the ground weave.' },
  { id: 'org20', zh: '花部', en: 'figure area', cat: 'org',
    note: '织物上显花的区域；在花本中对应提沉编码为"提"的位点。', noteEn: 'The figured region of a fabric, corresponding to the "lift" bits of the pattern draft.' },
  { id: 'org21', zh: '地组织', en: 'ground weave', cat: 'org',
    note: '构成地部的组织，如平纹、斜纹、五枚缎纹；云锦多用五枚缎纹作地。', noteEn: 'The weave forming the ground — plain, twill or five-end satin in brocade practice.' },
  { id: 'org22', zh: '显花', en: 'figuring', cat: 'org',
    note: '使纹样在织物表面显现的统称，分经线显花与纬线显花两类。', noteEn: 'The general term for making a pattern visible on the face, by warp or by weft.' },
  { id: 'org23', zh: '纬线显花', en: 'weft-faced figuring', cat: 'org',
    note: '以彩色纬线浮于表面构成纹样，妆花、纬锦均属此类。', noteEn: 'Figures built of coloured weft floating on the face, as in zhuanghua and weft-faced brocade.' },
  { id: 'org24', zh: '经线显花', en: 'warp-faced figuring', cat: 'org',
    note: '以彩色经线浮于表面构成纹样，汉唐经锦属此类。', noteEn: 'Figures built of coloured warp on the face, as in Han and Tang warp-faced brocade.' },
  { id: 'org25', zh: '妆花', en: 'zhuanghua (polychrome weft figuring)', cat: 'org',
    note: '云锦最具代表性的工艺：通经断纬、彩绒盘织，一件袍料可配色数十种而地部不变。', noteEn: 'The signature Nanjing technique: warp-continuous, weft-discontinuous polychrome figuring, dozens of colours on a single robe panel.' },
  { id: 'org26', zh: '织金', en: 'gold-shot', cat: 'org',
    note: '以扁金线作纬织入，使织物呈金色地或金色纹样。', noteEn: 'Flat gold thread used as weft, giving a gold ground or gold figures.' },
  { id: 'org27', zh: '金宝地', en: 'gold-ground brocade', cat: 'org',
    note: '以金线满织地部、彩绒显花的云锦名品，富丽冠于诸锦。', noteEn: 'A brocade whose entire ground is gold, with polychrome figures — the most sumptuous of the Nanjing types.' },
  { id: 'org28', zh: '库缎', en: 'kuduan (brocade satin)', cat: 'org',
    note: '清代官库所藏缎类织物，以五枚缎为地、经纬异色，故有闪色效果。', noteEn: 'A satin classed in the Qing government stores, woven on a five-end satin ground with contrasting warp and weft.' },
  { id: 'org29', zh: '库锦', en: 'kujin (brocade)', cat: 'org',
    note: '与库缎并列的云锦品种，多用于缘边、袖襕等小面积装饰。', noteEn: 'A brocade companion to kuduan, commonly used for borders and cuffs.' },
  { id: 'org30', zh: '彩绒', en: 'coloured silk floss', cat: 'org',
    note: '妆花所用染色绒丝，按纹样分色装在小梭内，一色一梭。', noteEn: 'Dyed floss used in zhuanghua, one shuttle per colour.' },
  { id: 'org31', zh: '小梭', en: 'small shuttle (colour)', cat: 'org',
    note: '装彩绒的小型梭子，只在花部范围内往返。', noteEn: 'A small shuttle carrying colour floss, travelling only inside the figure.' },
  { id: 'org32', zh: '大梭', en: 'main shuttle (ground)', cat: 'org',
    note: '装地纬的主梭，通投全幅。', noteEn: 'The main shuttle carrying the ground weft across the full width.' },

  // ---------- 纹样母题 motif ----------
  { id: 'mot01', zh: '团花', en: 'roundel', cat: 'motif',
    note: '以一点为中心环状展开的对称朵花，常置于袍服胸前或背部。', noteEn: 'A centre-symmetric bloom radiating from one point, set at the chest or back of a robe.' },
  { id: 'mot02', zh: '缠枝莲', en: 'lotus scroll', cat: 'motif',
    note: '以波状枝蔓串联莲花，缠转不断，寓意生生不息。', noteEn: 'Lotus blooms linked by an undulating vine, signifying unbroken continuity.' },
  { id: 'mot03', zh: '折枝', en: 'cut branch', cat: 'motif',
    note: '单枝入画的写生式构图，与缠枝的连绵式相对。', noteEn: 'A single branch shown as in painting, opposed to the continuous scroll.' },
  { id: 'mot04', zh: '云纹', en: 'cloud motif', cat: 'motif',
    note: '云锦命名之由来，有如意云、四合云、连云等多种层叠样式。', noteEn: 'The motif that gives Nanjing brocade its name, in ruyi, four-way and stacked variants.' },
  { id: 'mot05', zh: '四合如意云', en: 'four-way ruyi cloud', cat: 'motif',
    note: '四朵如意云头自四角向心聚拢，是云纹体系的基础单元。', noteEn: 'Four ruyi cloud heads converging from the diagonals; the basic unit of the cloud repertory.' },
  { id: 'mot06', zh: '如意', en: 'ruyi (as-you-wish)', cat: 'motif',
    note: '源自搔杖的云头形状，取"万事如意"之意，是云纹、器形、首饰共通的母题。', noteEn: 'A cloud-head form derived from a back-scratcher, meaning "may all be as you wish".' },
  { id: 'mot07', zh: '宝相花', en: 'baoxiang (treasure) flower', cat: 'motif',
    note: '集合莲、牡丹、菊等特征而成的理想化复合花，唐代以降盛行。', noteEn: 'An idealised composite bloom gathering features of lotus, peony and chrysanthemum, current since the Tang.' },
  { id: 'mot08', zh: '龙纹', en: 'dragon motif', cat: 'motif',
    note: '帝王专用纹样，蟒袍五爪为龙、四爪为蟒，等级森严。', noteEn: 'An imperial motif: five-clawed dragons for the emperor, four-clawed pythons for princes.' },
  { id: 'mot09', zh: '蟒纹', en: 'python motif', cat: 'motif',
    note: '四爪之龙，明代赐服与清代官员袍服常用。', noteEn: 'A four-clawed dragon used on bestowal robes and official dress.' },
  { id: 'mot10', zh: '凤纹', en: 'phoenix motif', cat: 'motif',
    note: '与龙纹并用为"龙凤呈祥"，多用于后妃服饰。', noteEn: 'Paired with the dragon as "dragon and phoenix bringing auspice", mainly for imperial women.' },
  { id: 'mot11', zh: '麒麟', en: 'qilin', cat: 'motif',
    note: '仁兽，明代公侯伯及一品官员补服所用。', noteEn: 'A benevolent beast, the badge of the highest Ming noble and first-rank ranks.' },
  { id: 'mot12', zh: '八宝', en: 'Eight Treasures', cat: 'motif',
    note: '轮、螺、伞、盖、花、罐、鱼、肠八件吉祥法器。', noteEn: 'Eight auspicious emblems: wheel, conch, parasol, canopy, lotus, vase, fish, endless knot.' },
  { id: 'mot13', zh: '暗八仙', en: "Eight Immortals' emblems", cat: 'motif',
    note: '以扇、剑、葫芦、玉板等器物代指八仙，寓长寿。', noteEn: 'Objects standing for the Eight Immortals — fan, sword, gourd, clappers — a wish for longevity.' },
  { id: 'mot14', zh: '万字纹', en: 'wan (swastika) fret', cat: 'motif',
    note: '取梵文"吉祥之所集"，连绵不断，常作地纹或缘边。', noteEn: 'The Sanskrit sign of auspiciousness, used endlessly as a ground or border fret.' },
  { id: 'mot15', zh: '曲水纹', en: 'meander (water fret)', cat: 'motif',
    note: '连续回旋的几何水纹，常与万字、龟背叠用为地。', noteEn: 'A continuous angular water fret, often layered with wan or tortoise-shell grounds.' },
  { id: 'mot16', zh: '回纹', en: 'key fret', cat: 'motif',
    note: '方形回旋纹，象征绵延不绝，多作缘边。', noteEn: 'A square spiral fret signifying endless continuity, mostly on borders.' },
  { id: 'mot17', zh: '龟背纹', en: 'tortoise-shell pattern', cat: 'motif',
    note: '六边形连缀的骨架纹，取龟寿之意。', noteEn: 'A hexagonal armature, invoking the tortoise as a sign of long life.' },
  { id: 'mot18', zh: '落花流水', en: 'flowers on flowing water', cat: 'motif',
    note: '水波与落花相间，宋锦传统母题，取其流动的节奏。', noteEn: 'Blossoms scattered among stepped waves, a Song brocade motif valued for its rhythm.' },
  { id: 'mot19', zh: '牡丹', en: 'peony', cat: 'motif',
    note: '花中之王，寓富贵，是织物朵花最常用的花种。', noteEn: 'King of flowers, a sign of wealth and the commonest bloom in textile design.' },
  { id: 'mot20', zh: '莲花', en: 'lotus', cat: 'motif',
    note: '佛教象征，清净无染，缠枝莲的构成核心。', noteEn: 'A Buddhist emblem of purity, the kernel of the lotus scroll.' },
  { id: 'mot21', zh: '梅花', en: 'plum blossom', cat: 'motif',
    note: '五瓣，象征五福，与松竹并称岁寒三友。', noteEn: 'Five petals for the five blessings; with pine and bamboo one of the Three Friends of Winter.' },
  { id: 'mot22', zh: '菊花', en: 'chrysanthemum', cat: 'motif',
    note: '秋花，寓长寿与隐逸。', noteEn: 'An autumn flower standing for longevity and the recluse.' },
  { id: 'mot23', zh: '海水江崖', en: 'waves and cliffs', cat: 'motif',
    note: '袍服下摆的斜向水脚与立水，象征江山永固。', noteEn: 'The diagonal wave bands and standing water at a robe hem, a wish for a lasting realm.' },
  { id: 'mot24', zh: '灯笼锦', en: 'lantern brocade', cat: 'motif',
    note: '以灯笼形骨架重复排列的几何纹样，宋锦、云锦均见。', noteEn: 'A repeat of lantern-shaped frames, found in both Song and Nanjing brocades.' },
  { id: 'mot25', zh: '八达晕', en: 'badayun (eight-way halo)', cat: 'motif',
    note: '八向放射的几何骨架纹，宋锦名品，云锦亦取其格律。', noteEn: 'An eight-way radiating geometric medallion, a Song brocade classic.' },
  { id: 'mot26', zh: '方胜', en: 'fangsheng (double lozenge)', cat: 'motif',
    note: '两个菱形交叠，寓"同心相合"。', noteEn: 'Two overlapping lozenges, a sign of hearts joined.' },
  { id: 'mot27', zh: '二则', en: 'two-repeat layout', cat: 'motif',
    note: '一幅之内纹样横向重复两次的排布法；四则、八则类推。', noteEn: 'A layout repeating the motif twice across the width; four- and eight-repeat layouts follow.' },
  { id: 'mot28', zh: '散花', en: 'scattered flowers', cat: 'motif',
    note: '小花均匀散布于地，不作完整骨架的构图。', noteEn: 'Small blooms evenly scattered without a full armature.' },

  // ---------- 材料工艺 mat ----------
  { id: 'mat01', zh: '桑蚕丝', en: 'mulberry silk', cat: 'mat',
    note: '家蚕吐出的丝，是云锦唯一的纤维原料。', noteEn: 'The filament of the domesticated silkworm, the sole fibre of Nanjing brocade.' },
  { id: 'mat02', zh: '生丝', en: 'raw silk', cat: 'mat',
    note: '未经精练脱胶的丝，较硬挺，多作经线。', noteEn: 'Undegummed silk, stiffer and used mostly as warp.' },
  { id: 'mat03', zh: '熟丝', en: 'degummed silk', cat: 'mat',
    note: '经精练去除丝胶，柔软有光泽，多作纬线与彩绒。', noteEn: 'Silk boiled free of sericin, softer and lustrous, used for weft and floss.' },
  { id: 'mat04', zh: '捻度', en: 'twist', cat: 'mat',
    note: '单位长度内的加捻回数，决定丝线的强度、手感与光泽。', noteEn: 'The number of turns per unit length, deciding strength, handle and lustre.' },
  { id: 'mat05', zh: '并丝', en: 'doubling', cat: 'mat',
    note: '将多根单丝合并成一股，以得到所需粗细。', noteEn: 'Combining several filaments into one strand of the required count.' },
  { id: 'mat06', zh: '扁金线', en: 'flat gold thread', cat: 'mat',
    note: '将金箔裱于纸或皮上切成细条，宽扁如带，反光面大。', noteEn: 'Gold foil laminated to paper or membrane and slit into flat strips, giving a broad reflective surface.' },
  { id: 'mat07', zh: '圆金线', en: 'round gold thread', cat: 'mat',
    note: '金箔绕于芯线而成的圆截面金线。', noteEn: 'Gold foil wound around a core yarn, round in section.' },
  { id: 'mat08', zh: '捻金线', en: 'twisted gold thread', cat: 'mat',
    note: '金银丝与丝线并捻而成，强度较高。', noteEn: 'Metal strip twisted together with silk for extra strength.' },
  { id: 'mat09', zh: '片金', en: 'flat gold strip', cat: 'mat',
    note: '未经捻合的扁平金片条，织入后成片状反光。', noteEn: 'An untwisted flat gold strip that reads as a sheet of light once woven.' },
  { id: 'mat10', zh: '孔雀羽线', en: 'peacock feather thread', cat: 'mat',
    note: '以孔雀羽捻线织入，随角度变幻翠色，云锦中的奢华用料。', noteEn: 'Peacock barbs twisted into thread, shifting colour with the angle — a luxury of Nanjing brocade.' },
  { id: 'mat11', zh: '绒', en: 'silk floss', cat: 'mat',
    note: '无捻或弱捻的松散丝束，妆花彩绒即用此类。', noteEn: 'Loosely or untwisted silk, the material of zhuanghua colour wefts.' },
  { id: 'mat12', zh: '经线', en: 'warp', cat: 'mat',
    note: '织物纵向的丝线，上机前需整经、穿综、穿筘。', noteEn: 'The lengthwise threads, warped, heddled and reedded before weaving.' },
  { id: 'mat13', zh: '纬线', en: 'weft', cat: 'mat',
    note: '织物横向的丝线，由梭携带穿行于经线之间。', noteEn: 'The crosswise threads carried through the warp by the shuttle.' },
  { id: 'mat14', zh: '地纬', en: 'ground weft', cat: 'mat',
    note: '织地部所用的纬线，通常通梭全幅。', noteEn: 'The weft that forms the ground, normally run full width.' },
  { id: 'mat15', zh: '彩纬', en: 'colour weft', cat: 'mat',
    note: '显花所用的彩色纬线，按花界断纬回梭。', noteEn: 'The coloured wefts of the figure, turned back at the figure boundary.' },
  { id: 'mat16', zh: '染色', en: 'dyeing', cat: 'mat',
    note: '丝线在织前先染，云锦向有"先染后织"之制。', noteEn: 'Threads are dyed before weaving; Nanjing brocade is always dyed in the yarn.' },
  { id: 'mat17', zh: '媒染', en: 'mordanting', cat: 'mat',
    note: '以金属盐类助染，使植物染料固着并改变色相。', noteEn: 'Metal salts that fix vegetable dyes and shift their hue.' },
  { id: 'mat18', zh: '茜草', en: 'madder', cat: 'mat',
    note: '古代最主要的红色植物染料。', noteEn: 'The principal red vegetable dye of pre-modern China.' },
  { id: 'mat19', zh: '蓝草', en: 'indigo', cat: 'mat',
    note: '制靛的原料，染得石青、月白等深浅蓝色。', noteEn: 'The source of indigo, giving the range from stone blue to moon white.' },
  { id: 'mat20', zh: '红花', en: 'safflower', cat: 'mat',
    note: '染鲜红与胭脂色，需以碱性水萃取。', noteEn: 'Yields scarlet and carmine, extracted in alkaline water.' },
  { id: 'mat21', zh: '栀子', en: 'gardenia', cat: 'mat',
    note: '染明黄，为帝王服色所重。', noteEn: 'Dyes the bright yellow reserved for imperial dress.' },
  { id: 'mat22', zh: '苏木', en: 'sappanwood', cat: 'mat',
    note: '与媒染剂配合可得紫、褐、黑等色。', noteEn: 'With mordants gives purples, browns and blacks.' },
  { id: 'mat23', zh: '套染', en: 'overdyeing', cat: 'mat',
    note: '两次以上染色叠加以获得中间色，云锦百色多由此得。', noteEn: 'Successive dye baths to obtain intermediate shades — the source of the brocade palette.' },
  { id: 'mat24', zh: '整经', en: 'warping', cat: 'mat',
    note: '把规定根数与长度的经线按序卷上经轴。', noteEn: 'Winding the required number and length of ends onto the warp beam in order.' },
  { id: 'mat25', zh: '穿综', en: 'heddling', cat: 'mat',
    note: '把经线逐根穿入综框的综丝，决定提沉分组。', noteEn: 'Drawing each end through a heddle, fixing the lift grouping.' },
  { id: 'mat26', zh: '穿筘', en: 'reeding', cat: 'mat',
    note: '把经线按密度穿入筘齿，决定经密与幅宽。', noteEn: 'Drawing ends through the reed to set the end density and width.' },
  { id: 'mat27', zh: '络丝', en: 'silk winding', cat: 'mat',
    note: '把绞丝络到篗子上，便于并捻与整经。', noteEn: 'Winding hanks onto bobbins for doubling and warping.' },
  { id: 'mat28', zh: '浆丝', en: 'sizing', cat: 'mat',
    note: '给经线上浆以提高耐磨性，减少织造断头。', noteEn: 'Sizing the warp to resist abrasion and reduce breakage.' },
  { id: 'mat29', zh: '打纬', en: 'beating the weft', cat: 'mat',
    note: '以筘把刚投入的纬线推向织口，使织物紧密。', noteEn: 'Driving the newly inserted pick up to the fell with the reed.' },
  { id: 'mat30', zh: '落机', en: 'cutting off', cat: 'mat',
    note: '织物织毕从机上剪下，云锦一件袍料常需数月。', noteEn: 'Cutting the finished cloth from the loom; a single robe panel could take months.' },

  // ---------- 织机结构 loom ----------
  { id: 'loom01', zh: '大花楼织机', en: 'grand drawloom', cat: 'loom',
    note: '云锦妆花专用的大型提花木机，长逾五米、高逾四米，需上下两人配合操作。', noteEn: 'The great wooden drawloom of zhuanghua brocade, over five metres long and four high, worked by two people.' },
  { id: 'loom02', zh: '小花楼织机', en: 'small drawloom', cat: 'loom',
    note: '大花楼的缩小形制，花本容量较小，用于幅窄或花纹简单的织物。', noteEn: 'A reduced drawloom with smaller pattern capacity for narrow or simpler cloth.' },
  { id: 'loom03', zh: '花楼', en: 'pattern tower', cat: 'loom',
    note: '织机上层提花工操作的空间与构架，因形似楼而得名。', noteEn: 'The upper frame where the drawboy works, named for its tower-like form.' },
  { id: 'loom04', zh: '花本', en: 'pattern draft (cord programme)', cat: 'loom',
    note: '以丝线编结而成的提花程序，一卷花本即一件纹样；本作品"编码"叙事的核心物证。', noteEn: 'A figuring programme knotted in silk cord: one pattern book equals one design — the material evidence at the heart of this work.' },
  { id: 'loom05', zh: '挑花结本', en: 'pattern drafting (tying the pattern book)', cat: 'loom',
    note: '把纹样稿换算成经纬提沉编码并用丝线编结成花本的工艺，是云锦的"编程"环节。', noteEn: 'Converting a design into a lift code and knotting it into cords — the programming step of Nanjing brocade.' },
  { id: 'loom06', zh: '脚子线', en: 'pattern cords (foot lines)', cat: 'loom',
    note: '花本上垂向织手一侧的丝线，逐根对应经线。', noteEn: 'The cords hanging toward the weaver, one per end.' },
  { id: 'loom07', zh: '耳子线', en: 'knot cords (ear lines)', cat: 'loom',
    note: '横向编结的丝线，每一个结扣对应一次提沉动作。', noteEn: 'The transverse cords whose knots record each lift event.' },
  { id: 'loom08', zh: '提花工', en: 'drawboy', cat: 'loom',
    note: '坐于花楼上按花本拽提脚子线的工人，一人可管千余根经线。', noteEn: 'The worker aloft who pulls the pattern cords — one person can govern over a thousand ends.' },
  { id: 'loom09', zh: '织手', en: 'weaver', cat: 'loom',
    note: '坐在机前投梭打纬、盘织彩绒的工人，与提花工以口令配合。', noteEn: 'The weaver below, throwing the shuttle, beating and inlaying colour, answering the drawboy by call.' },
  { id: 'loom10', zh: '拽花', en: 'drawing the cords', cat: 'loom',
    note: '提花工按花本逐根拽起脚子线的动作，一拽即一纬的提沉。', noteEn: 'The drawboy\'s pull, one pull per pick fixing the lift for that weft.' },
  { id: 'loom11', zh: '衢盘', en: 'tackle board (qupan)', cat: 'loom',
    note: '花楼中把花本线按序分孔穿过的分线装置，使千根线不相紊乱。', noteEn: 'The perforated board that keeps a thousand cords in order.' },
  { id: 'loom12', zh: '老鸦翅', en: 'harness bars (crow-wing)', cat: 'loom',
    note: '控制地综起落的杠杆构件，形似鸦翅而得名。', noteEn: 'The lever arms controlling the ground heddles, named for their crow-wing shape.' },
  { id: 'loom13', zh: '综框', en: 'heddle frame', cat: 'loom',
    note: '携带综丝、整体升降的一组框架，一框对应组织中的一个提沉组。', noteEn: 'A frame carrying heddles that rises and falls as one, one frame per lift group.' },
  { id: 'loom14', zh: '地综', en: 'ground heddle', cat: 'loom',
    note: '织地部组织的综框；平纹二片、三枚斜纹三片、五枚缎纹五片。', noteEn: 'The heddle frames of the ground weave: two for plain, three for a three-end twill, five for a five-end satin.' },
  { id: 'loom15', zh: '范子', en: 'pattern frame', cat: 'loom',
    note: '悬挂花本、使之保持张力并可回转的框架。', noteEn: 'The frame that suspends the pattern book under tension and lets it index forward.' },
  { id: 'loom16', zh: '经轴', en: 'warp beam', cat: 'loom',
    note: '卷绕全部经线的木轴，织造中逐步放送。', noteEn: 'The beam holding all the ends, paid out gradually as weaving proceeds.' },
  { id: 'loom17', zh: '筘', en: 'reed', cat: 'loom',
    note: '梳齿状构件，既控制经密又用于打纬。', noteEn: 'The comb-like part that sets end spacing and beats the weft.' },
  { id: 'loom18', zh: '梭', en: 'shuttle', cat: 'loom',
    note: '装载纬线、往返穿行于梭口的舟形工具。', noteEn: 'The boat-shaped carrier that flies the weft through the shed.' },
  { id: 'loom19', zh: '梭口', en: 'shed', cat: 'loom',
    note: '经线提起与落下形成的三角形开口，梭子由此穿过。', noteEn: 'The triangular opening between lifted and lowered ends through which the shuttle passes.' },
  { id: 'loom20', zh: '马头', en: 'beater arms (horse-head)', cat: 'loom',
    note: '悬挂筘座、控制打纬力度的木构件。', noteEn: 'The wooden arms carrying the reed sley, governing beating force.' },
  { id: 'loom21', zh: '叠助', en: 'spring beam (helper)', cat: 'loom',
    note: '打纬时的弹性助力构件，使厚重织物也能打紧。', noteEn: 'An elastic aid that lets even heavy cloth be beaten tight.' },
  { id: 'loom22', zh: '鸦儿木', en: 'treadle lever', cat: 'loom',
    note: '连接踏板与地综的传动木条。', noteEn: 'The lever linking treadles to the ground heddles.' },
  { id: 'loom23', zh: '踏板', en: 'treadle', cat: 'loom',
    note: '织手以脚踏动的杠杆，控制地综升降，脚踏数量与综框数对应。', noteEn: 'The lever worked by foot to raise and lower ground heddles; their number matches the frames.' },
  { id: 'loom24', zh: '花本架', en: 'pattern-book stand', cat: 'loom',
    note: '放置并转动花本的支架，位于花楼前部。', noteEn: 'The stand that holds and indexes the pattern book at the front of the tower.' },
  { id: 'loom25', zh: '竹筘刀', en: 'reed hook', cat: 'loom',
    note: '穿筘时牵引经线的小工具。', noteEn: 'A small hook used to draw ends through the reed.' },

  // ---------- 技术史 hist ----------
  { id: 'hist01', zh: '多综多蹑提花机', en: 'multi-heddle, multi-treadle loom', cat: 'hist',
    note: '汉代的提花织机，以多片综框与多根踏板组合控制提沉，可织出循环复杂的纹样。', noteEn: 'The Han loom whose many heddle frames and treadles together select the lift, allowing complex repeats.' },
  { id: 'hist02', zh: '束综提花', en: 'harness (drawloom) figuring', cat: 'hist',
    note: '以束综单独控制每一根经线的提花方式，突破了综框数量的限制。学界一般表述为：这一形态成熟较晚，与唐宋以后的花楼织机相关，汉代提花的主流仍是多综多蹑。', noteEn: 'Figuring by a harness that addresses individual ends, breaking the limit of heddle-frame count. Conventionally dated late — associated with the tower drawloom of the Tang and after; the Han mainstream remained the multi-heddle, multi-treadle loom.' },
  { id: 'hist03', zh: '汉代提花机', en: 'Han dynasty drawloom', cat: 'hist',
    note: '公元前后中国已使用可控制上千根经线的提花机，是花楼织机的直接前身。', noteEn: 'By the turn of the era Chinese looms already addressed over a thousand ends, the direct ancestor of the tower loom.' },
  { id: 'hist04', zh: '经锦', en: 'warp-faced brocade', cat: 'hist',
    note: '汉唐主要显花方式，彩色经线在表面浮长显花，经线数量受限制。', noteEn: 'The dominant Han–Tang figuring method, with colour in the warp and a limit on the number of colours.' },
  { id: 'hist05', zh: '唐代纬锦', en: 'Tang weft-faced brocade', cat: 'hist',
    note: '唐代吸收西域织法，改以纬线显花，可自由换色，纹样因此转向写生与联珠。', noteEn: 'Tang weavers adopted western methods, putting colour in the weft and freeing the palette.' },
  { id: 'hist06', zh: '提花技术西传', en: 'westward transmission of figure weaving', cat: 'hist',
    note: '提花机与花本原理经波斯、意大利丝织业传入欧洲，雅卡尔机常被认为承其脉络。这条传播链是本作品的核心论证。', noteEn: 'Figuring looms and the pattern-book principle reached Europe through Persian and Italian silk weaving; the Jacquard loom is often read as its descendant. This chain is the argument of the present work.' },
  { id: 'hist07', zh: '纳石失', en: 'nasij (gold brocade)', cat: 'hist',
    note: '元代由西域织工带来的织金锦，蒙古贵族以之制袍，推动了织金技术的普及。', noteEn: 'The gold brocade brought by Central Asian weavers under the Yuan, whose robes spread gold-shot weaving.' },
  { id: 'hist08', zh: '元代织金锦', en: 'Yuan gold brocade', cat: 'hist',
    note: '以片金、捻金通织，形成"金锦"传统，是云锦织金品种的直接源头。', noteEn: 'Flat and twisted gold woven throughout, the tradition from which Nanjing gold-shot brocade descends.' },
  { id: 'hist09', zh: '明代云锦', en: 'Ming Nanjing brocade', cat: 'hist',
    note: '明定都南京后设官营织造，云锦工艺在妆花、织金两方面定型。', noteEn: 'With the Ming capital at Nanjing, official workshops fixed the zhuanghua and gold-shot techniques.' },
  { id: 'hist10', zh: '江宁织造', en: 'Jiangning Imperial Silk Manufactory', cat: 'hist',
    note: '清代江南三织造之一，专为宫廷织造云锦缎匹，曹雪芹家族曾主其事。', noteEn: 'One of the three Qing imperial silk works, weaving brocade for the court; the Cao family directed it for decades.' },
  { id: 'hist11', zh: '江南三织造', en: 'Three Imperial Silk Manufactories', cat: 'hist',
    note: '江宁、苏州、杭州三处官营织造机构，构成清代宫廷丝织品供应体系。', noteEn: 'The Nanjing, Suzhou and Hangzhou works that supplied the Qing court with silk.' },
  { id: 'hist12', zh: '云锦', en: 'Yunjin (Nanjing brocade)', cat: 'hist',
    note: '"云"取纹样如云之意；2009 年南京云锦木机妆花手工织造技艺列入人类非物质文化遗产名录。', noteEn: 'Named for its cloud-like patterns; inscribed on the UNESCO list of intangible cultural heritage in 2009.' },
  { id: 'hist13', zh: '雅卡尔织机', en: 'Jacquard loom', cat: 'hist',
    note: '1804 年法国人雅卡尔发明的穿孔卡片提花机，用卡片上的孔位取代花本线，第一次把"程序"与"机器"分离。', noteEn: 'Jacquard\'s 1804 loom replaced knotted cords with punched cards, separating the programme from the machine for the first time.' },
  { id: 'hist14', zh: '穿孔卡片', en: 'punched card', cat: 'hist',
    note: '在硬纸卡上打孔以记录提沉状态，一孔对应一根经线，一卡对应一纬。', noteEn: 'Holes in stiff card recording the lift, one hole per end, one card per pick.' },
  { id: 'hist15', zh: '打孔纸带', en: 'punched paper tape', cat: 'hist',
    note: '把穿孔卡片连成连续纸带，用通道记录二进制信息，后被早期计算机采用。', noteEn: 'Cards joined into a continuous tape whose channels record binary data, later adopted by early computers.' },
  { id: 'hist16', zh: '霍列瑞斯制表机', en: 'Hollerith tabulating machine', cat: 'hist',
    note: '1890 年美国人口普查使用的打孔卡制表机，把织机的编码介质转用于数据统计。', noteEn: 'The punched-card tabulator of the 1890 US census, turning the loom\'s medium to data processing.' },
  { id: 'hist17', zh: 'IBM（国际商业机器公司）', en: 'IBM (International Business Machines)', cat: 'hist',
    note: '由霍列瑞斯制表机公司等合并而成，其早期产品线直接承自打孔卡技术。', noteEn: 'Formed from Hollerith\'s tabulating company and others, its early product line descended from punched cards.' },
  { id: 'hist18', zh: '存储程序', en: 'stored program', cat: 'hist',
    note: '把指令与数据一同存入可读写存储器的思想，1940 年代确立，与花本把"花样"存为可更换介质同理。', noteEn: 'The idea, settled in the 1940s, of keeping instructions and data in the same rewritable store — as a pattern book stores a design as replaceable medium.' },
  { id: 'hist19', zh: '冯·诺依曼结构', en: 'von Neumann architecture', cat: 'hist',
    note: '以存储程序为核心的计算机体系结构，其"程序即数据"的要点可与花本互证。', noteEn: 'A computer architecture built around the stored programme, whose "code as data" premise answers to the pattern book.' },
  { id: 'hist20', zh: '二进制', en: 'binary', cat: 'hist',
    note: '以 0 与 1 两个状态表示信息；提沉二态即天然的一比特。', noteEn: 'Information in two states, 0 and 1; lift and sink are a natural bit.' },
  { id: 'hist21', zh: '像素', en: 'pixel', cat: 'hist',
    note: '图像的最小可寻址单元；一幅纹样矩阵与一幅像素矩阵在结构上完全同构。', noteEn: 'The smallest addressable unit of an image; a motif matrix and a pixel matrix are structurally identical.' },
  { id: 'hist22', zh: '比特', en: 'bit', cat: 'hist',
    note: '信息的最小单位；一片综框的提、沉各记一比特。', noteEn: 'The smallest unit of information; one heddle\'s raise or fall records one bit.' },
  { id: 'hist23', zh: '信息编码', en: 'information encoding', cat: 'hist',
    note: '把意义映射为可传输、可复制的符号序列；花本是一次成功的纺织编码。', noteEn: 'Mapping meaning onto a transferable, copyable sequence of symbols; a pattern book is a successful textile encoding.' },
  { id: 'hist24', zh: '丝绸之路', en: 'Silk Road', cat: 'hist',
    note: '连接东亚与地中海的贸易与技艺传播网络，提花技术即沿此西传。', noteEn: 'The trade and craft-transfer network linking East Asia and the Mediterranean, along which figuring technology travelled west.' },

  // ---------- 术语对照 dict ----------
  { id: 'dict01', zh: '意匠图', en: 'point-paper draft', cat: 'dict',
    note: '把纹样放大到与经线根数相同的格纸上、逐格标出提沉的设计图，是挑花结本的直接依据。', noteEn: 'The enlarged squared draft in which each cell stands for one end and the lift is marked: the immediate source of a pattern book.' },
  { id: 'dict02', zh: '粉本', en: 'design cartoon', cat: 'dict',
    note: '画师绘制的纹样原稿，以白粉扑印上料，故称粉本。', noteEn: 'The painter\'s master design, transferred by pouncing white powder through pricked holes.' },
  { id: 'dict03', zh: '纹样', en: 'pattern / design', cat: 'dict',
    note: '织物上装饰图像的总称，在数字层面即一个二维矩阵。', noteEn: 'Any decorative image on cloth — at the digital level, a two-dimensional matrix.' },
  { id: 'dict04', zh: '暗花', en: 'self-patterned (tone-on-tone)', cat: 'dict',
    note: '经纬同色，仅靠组织反光差异显花，素雅含蓄。', noteEn: 'Figures shown only by the differing sheen of the weave, warp and weft in the same colour.' },
  { id: 'dict05', zh: '亮花', en: 'contrasting figure', cat: 'dict',
    note: '以异色经纬显花，与暗花相对。', noteEn: 'Figures in contrasting colour, the opposite of self-patterning.' },
  { id: 'dict06', zh: '织锦', en: 'brocade', cat: 'dict',
    note: '以彩色经纬织出花纹的丝织物总称。', noteEn: 'Any silk with a woven pattern in coloured threads.' },
  { id: 'dict07', zh: '素织', en: 'plain cloth (without figure)', cat: 'dict',
    note: '不显花的平素织物，是提花织造的对立面。', noteEn: 'Cloth with no figure, the counterpart of figure weaving.' },
  { id: 'dict08', zh: '门幅', en: 'fabric width', cat: 'dict',
    note: '织物横向宽度，由筘幅与经线根数决定。', noteEn: 'The width of the cloth, set by the reed width and the number of ends.' },
  { id: 'dict09', zh: '匹', en: 'bolt (pi)', cat: 'dict',
    note: '织物长度的传统计量单位，一匹通常长约四丈。', noteEn: 'The traditional unit of cloth length, a bolt of roughly forty chi.' },
  { id: 'dict10', zh: '提花', en: 'figure weaving / jacquard', cat: 'dict',
    note: '以编码控制部分经线提起从而显花的通称。', noteEn: 'Figuring by raising selected ends under programme control.' },
  { id: 'dict11', zh: '缂丝', en: 'kesi / silk tapestry', cat: 'dict',
    note: '通经断纬的丝织画，与妆花共享技术原理而取向不同。', noteEn: 'Warp-continuous, weft-discontinuous silk tapestry sharing the technique of zhuanghua but aimed at pictures.' },
  { id: 'dict12', zh: '织成', en: 'zhicheng / woven-to-shape', cat: 'dict',
    note: '按成品形状直接织出、无需裁剪的古代做法。', noteEn: 'Woven directly to the finished shape, needing no cutting.' },
  { id: 'dict13', zh: '宋锦', en: 'Song brocade', cat: 'dict',
    note: '苏州一带以几何骨架与落花流水纹见长的锦类。', noteEn: 'The Suzhou brocade known for geometric armatures and falling-blossom motifs.' },
  { id: 'dict14', zh: '蜀锦', en: 'Shu brocade', cat: 'dict',
    note: '成都所产，经锦与纬锦并重，汉唐即已著名。', noteEn: 'The Chengdu brocade, famed since Han and Tang for both warp- and weft-faced work.' },
  { id: 'dict15', zh: '壮锦', en: 'Zhuang brocade', cat: 'dict',
    note: '广西壮族棉织锦，几何纹与浓烈配色为其特征。', noteEn: 'The Guangxi Zhuang cotton brocade, marked by geometry and strong colour.' },
  { id: 'dict16', zh: '提花机', en: 'drawloom / jacquard loom', cat: 'dict',
    note: '以编码控制经线提升的织机总称；中国汉代已有，欧洲 1804 年以卡片实现。', noteEn: 'Any loom figuring by programme control: in China from the Han, in Europe by cards from 1804.' },
  { id: 'dict17', zh: '纬锦', en: 'weft-faced brocade', cat: 'dict',
    note: '以纬线显花的锦类，唐代以后成为主流。', noteEn: 'Brocade figured by weft, dominant after the Tang.' },
  { id: 'dict18', zh: '经纬', en: 'warp and weft', cat: 'dict',
    note: '织物的两个方向；中文里亦引申为条理与秩序。', noteEn: 'The two directions of a fabric; in Chinese also a metaphor for order.' },
  { id: 'dict19', zh: '编结', en: 'knotting', cat: 'dict',
    note: '花本的物理形成方式——以结扣记录信息，与打孔、磁化同为记写手段。', noteEn: 'How a pattern book physically forms: information recorded as knots, like perforation or magnetisation.' },
  { id: 'dict20', zh: '程序', en: 'programme', cat: 'dict',
    note: '一组可被机器重复执行的指令；花本即一份可执行千次的纺织程序。', noteEn: 'A set of instructions a machine can repeat; a pattern book is a textile programme executable a thousand times.' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TERMS: TERMS, TERM_CATS: TERM_CATS };
}

;
/* ==== data_patterns.js ==== */
// ============================================================
// 《织机与芯片》云锦预设纹样数据 —— 团队原创，程序化参数绘制后固化为 16×16 像素矩阵
// 字符合集：'.' 空（地部）｜'B' 石青｜'W' 月白｜'G' 赤金｜'K' 墨
// 每件纹样 16 行 × 16 列；纹样工坊取前 4 件作快捷载入，织物库展示全部 6 件。
// 本文件不含任何外部图片引用，全部视觉由字符矩阵 + Canvas/SVG 程序渲染。
// ============================================================

const PATTERN_LEGEND = {
  '.': { zh: '空（地部）', en: 'empty (ground)' },
  'B': { zh: '石青', en: 'stone blue' },
  'W': { zh: '月白', en: 'moon white' },
  'G': { zh: '赤金', en: 'vermilion gold' },
  'K': { zh: '墨', en: 'ink' },
};

const PATTERN_COLORS = {
  B: '#1c3f52',
  W: '#dfe8ec',
  G: '#b8860b',
  K: '#1a1a1a'
};

const PATTERNS = [
  {
    id: 'tuanhua',
    zh: '团花',
    en: 'Roundel',
    py: 'tuánhuā',
    band: '库缎',
    bandEn: 'silk damask',
    size: 16,
    zhDesc: '极坐标生成的八出花瓣（石青）环抱一颗 2×2 赤金花心，外圈以月白点出一整圈蕊点——云锦最典型的中心对称构图，多用于袍料的团窠（roundel）位置。挑花结本时，花心与花瓣的边界决定提沉翻转的疏密。',
    enDesc: 'Eight blue petals, generated in polar coordinates, ring a 2×2 gold heart, with a full circle of white stamen dots outside: the classic centre-symmetric roundel of Nanjing brocade, usually set at the chest of a robe. In pattern-drafting the petal boundary is what decides how dense the lift reversal is.',
    map: [
      '................',
      '......WWWW......',
      '....WW....WW....',
      '...W........W...',
      '..W....BB....W..',
      '..W..BBBBBB..W..',
      '.W...BBBBBB...W.',
      '.W..BBBGGBBB..W.',
      '.W..BBBGGBBB..W.',
      '.W...BBBBBB...W.',
      '..W..BBBBBB..W..',
      '..W....BB....W..',
      '...W........W...',
      '....WW....WW....',
      '......WWWW......',
      '................',
    ]
  },
  {
    id: 'chanzhilian',
    zh: '缠枝莲',
    en: 'Lotus scroll',
    py: 'chánzhīlián',
    band: '妆花',
    bandEn: 'zhuanghua polychrome',
    size: 16,
    zhDesc: '一条波浪枝蔓自左下贯到右上、出入画外而不断，四朵月白莲花（赤金花心）等距骑在枝上，另生三道卷须。这一母题自唐传入，至明清成为最通行的织物骨架，云锦妆花袍料常以它为地。',
    enDesc: 'A single undulating vine runs from lower left to upper right, leaving the frame and never breaking; four white lotus blooms with gold hearts ride on it at even intervals, with three curled tendrils. The motif arrived from Tang workshops and became the most widespread fabric armature of the Ming and Qing.',
    map: [
      '...............B',
      '............BB.B',
      '............B.WB',
      '.............WGW',
      '..............WB',
      '..............BB',
      '.BB.......W..BB.',
      '..B..W..BWGWBB..',
      '...BWGWBB.W.....',
      '..BB.W..........',
      '.BB.............',
      '.WB.............',
      'WGW.............',
      'BW.B............',
      'BBBB............',
      'BB..............',
    ]
  },
  {
    id: 'siheyun',
    zh: '四合如意云',
    en: 'Four-way ruyi cloud',
    py: 'sìhé rúyì yún',
    band: '妆花',
    bandEn: 'zhuanghua polychrome',
    size: 16,
    zhDesc: '四朵如意云头分踞四个斜角，云头向内四合于中心、云尾各向两侧舒卷成勾，正中一枚 2×2 赤金云心。云纹是云锦命名之由来，四合云又是其中最基础的单元，可叠成"连云""四合四合"等层叠云式。',
    enDesc: 'Four ruyi cloud heads sit on the diagonals, their tips converging on the centre and their tails curling outward in hooks on either side, around a 2×2 gold cloud heart. Clouds give Nanjing brocade its name; the four-way arrangement is its basic unit, stacked into denser cloud fields on ceremonial robes.',
    map: [
      '................',
      '................',
      '......B..B......',
      '.....BB..BB.....',
      '....WB....BW....',
      '...BBBB..BBBB...',
      '..BB.BB..BB.BB..',
      '.......GG.......',
      '.......GG.......',
      '..BB.BB..BB.BB..',
      '...BBBB..BBBB...',
      '....WB....BW....',
      '.....BB..BB.....',
      '......B..B......',
      '................',
      '................',
    ]
  },
  {
    id: 'zhijin',
    zh: '织金几何',
    en: 'Gold-shot lattice',
    py: 'zhījīn jǐhé',
    band: '织金',
    bandEn: 'gold-shot',
    size: 16,
    zhDesc: '菱形骨架以扁金线通梭织入，格心嵌宝相花心。"织金""金宝地"一类以金显贵的品种，其底纹多是这种几何骨架；金线在提沉中始终处于经浮位，才能连续反光。',
    enDesc: 'A lozenge armature woven with flat gold thread, each cell holding a rosette heart. Gold-ground brocades are built on such geometry: the gold must stay on a warp float to keep its continuous sheen.',
    map: [
      'G.......G.......',
      '.G.....G.G.....G',
      '..G.G.G...G.G.G.',
      '...GBG.....GBG..',
      '..GBWBG...GBWBG.',
      '...GBG.....GBG..',
      '..G.G.G.G.G.G.G.',
      '.G.....GBG.....G',
      'G.....GBWBG.....',
      '.G.....GBG.....G',
      '..G.G.G.G.G.G.G.',
      '...GBG.....GBG..',
      '..GBWBG...GBWBG.',
      '...GBG.....GBG..',
      '..G.G.G...G.G.G.',
      '.G.....G.G.....G',
    ]
  },
  {
    id: 'zhezhimudan',
    zh: '折枝牡丹',
    en: 'Plucked peony branch',
    py: 'zhézhī mǔdān',
    band: '妆花',
    bandEn: 'zhuanghua polychrome',
    size: 16,
    zhDesc: '一枝斜出、六出花瓣层层抱心的写生式朵花。折枝（单枝入画）与缠枝（连绵不断）是织物构图的两种基本思路，前者更接近绘画。',
    enDesc: 'A single branch rising at an angle, its six-petalled bloom layered around a gold heart. The cut branch and the continuous scroll are the two basic logics of textile composition, the former closer to painting.',
    map: [
      '................',
      '................',
      '..........BB....',
      '........B.BBBB..',
      '........BBWWBB..',
      '.........WGGW...',
      '........BBWWBB..',
      '........B.BBBB..',
      '........WWBB....',
      '........W.......',
      '........W.......',
      '....BB.WW.......',
      '...BBBBBB.......',
      '...BWWWBBB......',
      '...WWGG.........',
      '................',
    ]
  },
  {
    id: 'luohualiushui',
    zh: '落花流水',
    en: 'Flowers on flowing water',
    py: 'luòhuā liúshuǐ',
    band: '库锦',
    bandEn: 'brocade',
    size: 16,
    zhDesc: '阶梯状水波三道，落花五瓣相间。宋锦"落花流水锦"传统的延续，云锦取其节奏感作缘边与袖襕，水波的方向性使织物在动时产生流动感。',
    enDesc: 'Three stepped water bands with five-petalled blossoms scattered between them, descended from the Song "falling blossoms on flowing water" brocade. Its directional rhythm makes the fabric seem to move.',
    map: [
      '..WWWW....WWWW..',
      '..WGGWBB..WGGWBB',
      'BBBWWBBBBBBWWBBB',
      'BBBB....BBBB....',
      '................',
      '...WW......WW...',
      '..WWWWBB..WWWWBB',
      'BBBWWBBBBBBWWBBB',
      'BBBWW...BBBWW...',
      '................',
      '...WW......WW...',
      '..WWWWBB..WWWWBB',
      'BBBWWBBBBBBWWBBB',
      'BBBWW...BBBWW...',
      '................',
      '................',
    ]
  },
];

// 待替换的 AI 影像氛围图位置清单（占位：当前由 Canvas 噪声 + 渐变程序生成，
// 无图亦可正常显示；Lead 可用同名 AI 影像替换，代码无需改动）。
const PENDING_ASSETS = [
  { id: 'atmo_cover', zh: '封面织物质感', en: 'cover silk texture', zhPrompt: '深色织锦微距：金线穿梭、丝光流动、浅景深', enPrompt: 'macro silk brocade, gold weft, shallow depth of field', seg: 'A1', pendingAsset: true, fallback: 'canvas-noise' },
  { id: 'atmo_loom', zh: '投梭织造底纹', en: 'weaving backdrop', zhPrompt: '大花楼织机经线如瀑的暗调局部', enPrompt: 'dark detail of a grand drawloom warp sheet', seg: 'A2', pendingAsset: true, fallback: 'canvas-noise' },
  { id: 'atmo_huaben', zh: '挑花结本底纹', en: 'pattern-book backdrop', zhPrompt: '手工编结丝线花本的特写，暖光', enPrompt: 'hands tying silk cords into a pattern program, warm light', seg: 'A3', pendingAsset: true, fallback: 'canvas-noise' },
  { id: 'atmo_timeline', zh: '时间线背景', en: 'timeline backdrop', zhPrompt: '1804 雅卡尔穿孔卡片提花机', enPrompt: '19th-century Jacquard loom with punched cards', seg: 'A4', pendingAsset: true, fallback: 'canvas-noise' },
  { id: 'atmo_five', zh: '五态同构背景', en: 'five-states backdrop', zhPrompt: '打孔卡片→二进制→晶圆的意象转场', enPrompt: 'punched card morphing into glowing binary and a wafer', seg: 'A5', pendingAsset: true, fallback: 'canvas-noise' },
  { id: 'atmo_team', zh: '团队页收束图', en: 'closing image', zhPrompt: '成品云锦披在肩上，博物馆灯光', enPrompt: 'brocade robe on a shoulder, museum light', seg: 'A6', pendingAsset: true, fallback: 'canvas-noise' },
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PATTERNS: PATTERNS, PATTERN_LEGEND: PATTERN_LEGEND, PATTERN_COLORS: PATTERN_COLORS, PENDING_ASSETS: PENDING_ASSETS };
}

;
/* ==== data_timeline.js ==== */
// ============================================================
// 《织机与芯片》织造技术编年史 —— 中西双轨 8 节点
// 每条史实均附 source 字段（来源类别），正文以"教学示意"为定位，不做文物级复原。
// 字段：id｜era / eraEn 年代｜zh / en 节点名（中性，用于详情页标题与无障碍标签）｜
//      cnCard 左列"中国轨"卡片标题（缺省时用 zh）｜
//      cn 中国轨（同一时期的中国）｜west 西方轨（同一时期的世界）｜
//      code 该节点的"编码介质形态"｜link 传播/类比连结点｜order 排序
// 双轨约定：左列一律讲中国，右列一律讲西方/世界；1804 之后的机器（雅卡尔、
// 霍列瑞斯、存储程序）属西方轨，中国轨讲同一时期的中国织造。
// ============================================================

const TIMELINE = [
  {
    id: 'han', order: 1, era: '公元前 1 世纪', eraEn: '1st century BCE',
    zh: '汉·多综多蹑提花机', en: 'Han dynasty: the multi-heddle drawloom',
    code: { zh: '综框 / 踏板组合', en: 'heddle frames + treadles' },
    cn: {
      title: '多综多蹑：汉代提花的主流',
      titleEn: 'Multi-heddle, multi-treadle: the Han mainstream',
      body: '汉代提花机的主流形制是"多综多蹑"——多片综框配多根踏板，织工按顺序踏蹑，综框整组升降，一纬之内能控制的经线数由综框片数与踏蹑顺序决定。'
          + '至迟在西汉，中国织工已能用数十片综框、上千根经线织出循环复杂的锦：湖南长沙马王堆、湖北江陵马山出土的织锦，'
          + '其纹样循环与经线密度都需要以千计的提沉组合才织得出来。'
          + '"束综"（花楼式，一根经线一根束线、可单独提落）是后来的事：学界一般表述为与唐宋以后的花楼织机相关，汉代尚未成熟。',
      en: 'The mainstream Han figure loom was the multi-heddle, multi-treadle type: many heddle frames and many treadles,'
          + ' worked in sequence, so the number of controllable ends per pick followed the number of frames and the treadling'
          + ' order. By the Western Han Chinese weavers could already produce elaborate repeats on dozens of frames and over'
          + ' a thousand ends: the brocades excavated at Mawangdui and Mashan require lift combinations in the thousands.'
          + ' The individual-end harness belongs to a later stage — conventionally associated with the tower drawloom of the'
          + ' Tang and after, and not yet mature in the Han.',
      source: '考古报告（马王堆一号汉墓、江陵马山一号楚墓）｜纺织史专著'
    },
    west: {
      title: '地中海的竖机与纬起花',
      titleEn: 'Upright looms and weft figuring in the Mediterranean',
      body: '同一时期的地中海世界以竖机（vertical loom）为主，织工靠手工挑经起花，幅宽与纹样循环都受体力限制。'
          + '埃及、叙利亚的科普特织物留下了大量纬起花羊毛织物，其"逐段挑织"的思路与通经断纬相通，但尚未形成可复用的编码介质。',
      en: 'The Mediterranean world worked mainly on the upright loom, picking the figure by hand; width and repeat were'
          + ' limited by the weaver\'s reach. Coptic textiles from Egypt and Syria show extensive weft-faced wool patterning'
          + ' with a pick-by-pick logic close to discontinuous weft, but with no reusable coding medium yet.',
      source: '博物馆藏品图录（科普特织物）｜技术史通论'
    },
    link: { zh: '共同需求：让"某一根经线是否提起"可被记忆与复用', en: 'Shared problem: making "is this end raised?" memorable and reusable' }
  },
  {
    id: 'tang', order: 2, era: '8 世纪', eraEn: '8th century',
    zh: '唐·纬锦与联珠纹', en: 'Tang: weft-faced brocade and pearl roundels',
    code: { zh: '纬线显花序列', en: 'weft figuring sequence' },
    cn: {
      title: '把颜色搬到纬线上：一次技术转向',
      titleEn: 'Moving colour onto the weft: a technical turn',
      body: '唐代织工大量吸收西域织法，改"经线显花"为"纬线显花"。这不只是换方向：经线在整幅上固定，'
          + '换色必须换经；纬线却可以逐段投入，于是颜色数量第一次不再受经轴限制。'
          + '联珠团窠、对鸟对兽等萨珊式纹样随之进入中国织锦，纬锦成为新的主流。',
      en: 'Tang weavers absorbed Central Asian methods and moved the figure from warp to weft. This was not a mere change of'
          + ' direction: warps run the full length, so changing colour means changing the beam, whereas wefts can be inserted'
          + ' section by section. For the first time the palette was no longer limited by the warp. Sasanian-style pearl'
          + ' roundels and confronted animals entered Chinese brocade, and weft-faced weaving became the mainstream.',
      source: '《唐六典》贡赋记载｜吐鲁番阿斯塔那墓葬出土织物｜纺织史专著'
    },
    west: {
      title: '波斯与拜占庭的纬起花传统',
      titleEn: 'Sasanian and Byzantine weft figuring',
      body: '萨珊波斯与拜占庭的丝织业以纬起花见长，联珠纹、对兽纹经由中亚绿洲传入唐。'
          + '技术与纹样同路而行——这正是"文明互鉴"在织物上的直接证据。',
      en: 'Sasanian and Byzantine silk industries excelled at weft-faced patterning; pearl roundels and confronted beasts'
          + ' travelled through the Central Asian oases into Tang China. Technique and motif moved along the same road —'
          + ' direct evidence of mutual learning written in cloth.',
      source: '博物馆藏品图录（萨珊、拜占庭丝织）｜丝绸之路考古综述'
    },
    link: { zh: '断纬 → 彩纬可分色盘织，为妆花埋伏笔', en: 'Discontinuous weft → colour wefts inlaid by section, the road to zhuanghua' }
  },
  {
    id: 'yuan', order: 3, era: '13—14 世纪', eraEn: '13th–14th century',
    zh: '元·织金锦（纳石失）', en: 'Yuan: gold brocade (nasij)',
    code: { zh: '片金通织', en: 'flat gold throughout' },
    cn: {
      title: '织工大流动与"金锦"传统',
      titleEn: 'Weavers on the move and the gold-brocade tradition',
      body: '蒙古西征把中亚织工成批带到东方，元代官方作坊中出现了"纳石失"——以片金、捻金通织的织金锦。'
          + '金线不耐反复弯折，因此提沉次数越少越好；这逼迫织工把纹样做得更整块、更几何，也间接塑造了后来云锦织金的视觉语言。',
      en: 'The Mongol conquests brought Central Asian weavers east in numbers, and Yuan workshops produced nasij — brocade'
          + ' shot through with flat and twisted gold. Gold thread tolerates little bending, so fewer lift reversals are'
          + ' better: patterns became blockier and more geometric, shaping the visual language of later gold-shot brocade.',
      source: '《元史·舆服志》｜《大元毡罽工物记》｜中亚纺织史研究'
    },
    west: {
      title: '欧洲织金与意大利丝织的崛起',
      titleEn: 'Gold brocade in Europe and the rise of Italian silk',
      body: '同一世纪，金线经由伊斯兰世界进入西西里与卢卡、威尼斯的丝织作坊。欧洲织金锦（samite、diasper）'
          + '大量用于教堂法衣，其纹样骨架与中国织金高度可比——技术随人走，人随政权走。',
      en: 'In the same century gold thread reached Sicilian, Lucchese and Venetian workshops through the Islamic world.'
          + ' European gold brocades (samite, diasper) served mainly for church vestments, on armatures strikingly'
          + ' comparable to Chinese gold-shot silks: technique travels with people, and people with power.',
      source: 'V&A / 卢浮宫藏品图录｜欧洲丝织技术史'
    },
    link: { zh: '金线 ⇒ 更少提沉 ⇒ 更几何的编码', en: 'Gold ⇒ fewer reversals ⇒ more geometric coding' }
  },
  {
    id: 'ming', order: 4, era: '15—17 世纪', eraEn: '15th–17th century',
    zh: '明·云锦大花楼与挑花结本', en: 'Ming: the grand drawloom and pattern drafting',
    code: { zh: '花本线（编结）', en: 'knotted cord pattern book' },
    cn: {
      title: '把程序从机器里拿出来：花本',
      titleEn: 'Taking the programme out of the machine: the pattern book',
      body: '明代定都南京后设官营织造，云锦在妆花与织金两方面定型。大花楼织机高逾四米，上下两人配合：'
          + '楼上"提花工"按花本拽线，楼下"织手"投梭打纬、盘织彩绒。'
          + '关键的一步是"挑花结本"——把纹样换算成每一纬的经线提沉序列，再用丝线编结成一本可以卷起来、可以换下来、可以复制的"花本"。'
          + '这是目前可考的技术史中，较早把“程序”做成独立于机器的、可更换物理介质的实例。',
      en: 'With the Ming capital at Nanjing, official workshops fixed the zhuanghua and gold-shot techniques. The grand'
          + ' drawloom stands over four metres tall and needs two people: above, a drawboy pulls cords according to the'
          + ' pattern book; below, the weaver throws the shuttle, beats, and inlays colour. The decisive step is pattern'
          + ' drafting: the design is converted into a lift sequence for every pick and knotted into cords — a programme'
          + ' that can be rolled up, taken off and copied. For the first time a programme became a physical medium'
          + ' independent of the machine.',
      source: '《天工开物·乃服》｜江宁织造档案｜南京云锦研究所公开释文'
    },
    west: {
      title: '意大利丝织工坊的组织化',
      titleEn: 'The guild workshops of Italian silk',
      body: '卢卡、佛罗伦萨、威尼斯的丝织行会在此期形成规模化生产，提花机需要两名工人协作、'
          + '纹样以"点纸"（point paper）预先规划——与挑花结本的"意匠图"是同一思路的两种写法。',
      en: 'Lucchese, Florentine and Venetian silk guilds scaled up production; their drawlooms needed two workers, and'
          + ' designs were planned in advance on point paper — the same idea as the Chinese point-paper draft, written'
          + ' differently.',
      source: '佛罗伦萨丝绸行会档案研究｜技术史通论'
    },
    link: { zh: '花本 = 可更换的程序介质 —— 全作品的核心论点', en: 'Pattern book = replaceable programme medium: the thesis of this work' }
  },
  {
    id: 'jacquard', order: 5, era: '1804', eraEn: '1804',
    zh: '法·雅卡尔穿孔卡片提花机', en: 'France: Jacquard\'s punched-card loom',
    cnCard: { zh: '清·江宁织造：云锦贡品的最后高峰', en: 'Qing Jiangning: last peak of court brocade' },
    code: { zh: '穿孔卡片', en: 'punched cards' },
    cn: {
      title: '同一时期的中国：手工花楼与宫廷贡品',
      titleEn: 'China at the same time: the hand drawloom and court commissions',
      body: '1804 年的中国，云锦仍由江宁织造局的官营作坊以手工织造：大花楼织机高逾四米，楼上拽花、楼下投梭盘彩，'
          + '一匹妆花往往要数月，一年所出不过数十匹，专供宫廷与赏赐。'
          + '花本依旧用丝线编结，纹样每改一次就要重挑一次花；这套"人记、线存"的体系把手工提花推到了极致，却没有走向机读卡片。'
          + '同年两条技术路线分岔：一条把程序交给机器，一条守着人力与手感——分岔不发生在技术上，而发生在需求上。',
      en: 'In 1804 Chinese brocade was still woven by hand in the official Jiangning workshops: the tower drawloom stands over'
          + ' four metres tall, a drawboy works the cords above while the weaver throws the shuttle below, and a single'
          + ' zhuanghua panel can take months. The pattern book was still knotted from silk: every change of design meant'
          + ' re-tying the cords. The system took hand figuring as far as it could go, but never moved to machine-read cards.'
          + ' In the same year two technical paths diverged — not for lack of skill, but for lack of demand for a programme'
          + ' the machine could read by itself.',
      source: '清代江宁织造档案｜《天工开物·乃服》｜南京云锦研究所公开释文'
    },
    west: {
      title: '雅卡尔：卡片链，第一台可编程机器',
      titleEn: 'Jacquard: the card chain, the first programmable machine',
      body: '1804 年，法国里昂的织工雅卡尔（Joseph-Marie Jacquard）用一串打了孔的硬纸卡取代了拽花工：'
          + '每张卡对应一纬，孔位对应经线，卡片首尾相连、自动循环。'
          + '这正是花本的逻辑——只是把"丝线打结"换成了"纸片打孔"，把"人记"改成了"机读"。'
          + '雅卡尔机被普遍认为是第一台"可编程"的机器：换一套卡片就换一种织物，机器本身不变。'
          + '此后两百年，"程序与机器分离"反复出现——只是介质从纸卡换成了磁带、磁盘、闪存。',
      en: 'In 1804 the Lyon weaver Joseph-Marie Jacquard replaced the drawboy with a chain of punched cards: one card per'
          + ' pick, a hole for each end, the chain laced end to end and cycling automatically. This is precisely the logic'
          + ' of the pattern book — silk knots exchanged for paper holes, and human memory for machine reading. The loom is'
          + ' widely regarded as the first programmable machine: swap the cards and the cloth changes while the machine'
          + ' stays the same. For two centuries afterwards the separation of programme from machine recurs, with the medium'
          + ' changing from card to tape to disk to flash.',
      source: '雅卡尔机专利与里昂纺织档案｜Science Museum London 藏品说明｜计算机史通论'
    },
    link: { zh: '打结 → 打孔：编码介质换了，编码结构没变', en: 'Knots → holes: the medium changed, the structure did not' }
  },
  {
    id: 'hollerith', order: 6, era: '1890', eraEn: '1890',
    zh: '美·霍列瑞斯打孔卡制表机', en: 'USA: Hollerith\'s punched-card tabulator',
    cnCard: { zh: '1890 洋务：机器织布进来了，提花仍是手工', en: '1890: machine spinning arrives, figuring stays by hand' },
    code: { zh: '打孔卡（数据）', en: 'punched cards as data' },
    cn: {
      title: '同一时期的中国：机器织布，手工提花',
      titleEn: 'China at the same time: machine cloth, hand figuring',
      body: '1890 年前后，洋务派在上海办起的机器织布局开工，中国第一次用蒸汽动力织布；但机器织的是平布，提花依旧靠木机与花本。'
          + '同一时期，清廷的官营织造随着国势衰落而收缩，云锦织工散入民间作坊，宫廷订货一年少于一年。'
          + '一门以"记忆与复用"为核心的手工编码技术，在它的发源地缓慢退场；而同一张打孔卡片，在西方正要变成数据。',
      en: 'Around 1890 the machine-run weaving mill set up at Shanghai by the self-strengthening movement went into'
          + ' operation: for the first time China wove cloth with steam power. But the machines wove plain cloth; figuring'
          + ' still depended on wooden looms and knotted pattern books. Meanwhile the Qing official workshops contracted'
          + ' with the dynasty\'s fortunes, weavers scattered into private ateliers, and court orders dwindled year by year.'
          + ' A hand-worked coding technique built on memory and reuse was slowly leaving its birthplace — while the same'
          + ' punched card was about to become data in the West.',
      source: '中国近代纺织史｜上海机器织布局史料｜南京云锦研究所所史'
    },
    west: {
      title: '霍列瑞斯：同一张卡，从"织什么"变成"记什么"',
      titleEn: 'Hollerith: the same card, from "what to weave" to "what to record"',
      body: '1890 年美国人口普查，霍列瑞斯（Herman Hollerith）把打孔卡从织机搬到统计：'
          + '每个人一张卡，孔位记录性别、年龄、籍贯；机器以探针读孔、自动计数。'
          + '编码介质没有变，变的是它承载的对象——从"这一纬哪几根经线提起"，变成"这个人属于哪一类"。'
          + '1896 年他创办制表机器公司，1924 年并入 IBM。计算机产业的第一块基石，与提花机的卡片是同一项技术；'
          + '同一套卡片、同一台读卡机，可以处理任何被编码的对象。',
      en: 'For the 1890 US census Herman Hollerith moved the punched card from the loom to statistics: one card per person,'
          + ' holes recording sex, age and origin, read by pins and counted automatically. The medium was unchanged; what'
          + ' changed was the object encoded — not "which ends rise on this pick" but "which class this person belongs to".'
          + ' His Tabulating Machine Company (1896) merged into IBM in 1924. The first foundation stone of the computer'
          + ' industry is the same technology as the Jacquard card: the same cards and the same reader could process any'
          + ' object that had been encoded.',
      source: '1890 年美国人口普查报告｜IBM 公司史档案｜计算机史通论'
    },
    link: { zh: '编码对象从"纹样"扩展到"万物"', en: 'The encoded object expands from pattern to anything' }
  },
  {
    id: 'stored', order: 7, era: '1940s', eraEn: '1940s',
    zh: '存储程序：把卡片搬进存储器', en: 'The stored program: cards move into memory',
    cnCard: { zh: '1940s 战乱：云锦濒于失传', en: '1940s: brocade close to being lost' },
    code: { zh: '存储器中的二进制', en: 'binary in memory' },
    cn: {
      title: '同一时期的中国：工艺濒于失传',
      titleEn: 'China at the same time: the craft nearly lost',
      body: '1940 年代的中国战乱频仍，云锦的主要买主——宫廷、官服与富商订货——几乎消失，大花楼织机数量锐减，'
          + '会拽花的老艺人相继离世。'
          + '花本一旦无人能读，就只剩一堆打不开的结：这套"可更换的程序介质"在它的故乡第一次面临整体失传。'
          + '直到 1950 年代南京成立研究机构，才重新整理花本、恢复妆花工艺；今天能跑通的两千年前的结构，是这之后一点点接回来的。',
      en: 'China in the 1940s was at war. The main buyers of brocade — the court, official robes, wealthy patrons — had'
          + ' almost vanished, the number of tower drawlooms fell sharply, and the drawboys who could read a pattern book'
          + ' died one by one. A pattern book that no one can read is only a bundle of knots: the replaceable programme'
          + ' medium came close to being lost altogether in its own homeland. Only in the 1950s, when a research institute'
          + ' was set up in Nanjing, were the cords sorted out again and zhuanghua weaving revived.',
      source: '南京云锦研究所所史｜非物质文化遗产申报材料｜技术史通论'
    },
    west: {
      title: '冯·诺依曼 / EDSAC：可改写程序的机器',
      titleEn: 'Von Neumann / EDSAC: the rewritable programme',
      body: '1940 年代，冯·诺依曼等人在 EDVAC 报告中提出"存储程序"：指令和数据一样放进可读写的存储器，不再靠外部卡片链驱动。'
          + '这一步取消了物理介质，却没有取消编码结构——地址、操作码、数据，仍然是一组有序的 0 与 1。'
          + '程序进入存储器后，"换程序"不再需要重新穿卡片，只需改写内容。'
          + '如果说花本是"可更换的介质"，存储程序就是"可更换 + 可改写"的介质：两种性质合并。',
      en: 'In the 1940s von Neumann and others set out the stored-program idea in the EDVAC report: instructions kept in'
          + ' rewritable memory alongside data, no longer driven by an external card chain. This step removed the physical'
          + ' medium but not the coding structure — addresses, opcodes and data remain ordered zeros and ones. Once the'
          + ' programme lived in memory, changing it no longer meant re-lacing cards but rewriting content. If a pattern'
          + ' book is a replaceable medium, the stored programme is a replaceable and rewritable one: the two properties'
          + ' merged.',
      source: 'EDVAC 报告草案（1945）｜EDSAC 复原档案｜计算机史通论'
    },
    link: { zh: '介质消失，结构留下', en: 'The medium disappears; the structure remains' }
  },
  {
    id: 'pixel', order: 8, era: '2009 — 今日', eraEn: '2009 – today',
    zh: '云锦入名录 · 像素与算力', en: 'Inscription, pixels and compute',
    code: { zh: '像素矩阵', en: 'pixel matrix' },
    cn: {
      title: '回到网格：编码与像素同构',
      titleEn: 'Back to the grid: code and pixel are isomorphic',
      body: '2009 年，南京云锦木机妆花手工织造技艺列入联合国教科文组织人类非物质文化遗产代表作名录。'
          + '今天你在这件作品里做的那件事——在一张 16×16 的格子上点出一朵团花，然后看它变成花本、变成卡片、'
          + '变成纸带、变成二进制、变成像素——正是这条两千年链条的当前一环。'
          + '一块手机屏幕上的 16×16 像素与一片花本、一张卡片，是同一个数据结构的不同介质实现。',
      en: 'In 2009 the Nanjing Yunjin hand-weaving technique was inscribed on UNESCO\'s Representative List of the'
          + ' Intangible Cultural Heritage of Humanity. What you do in this work — tapping a roundel onto a 16×16 grid and'
          + ' watching it become a cord pattern book, a card, a paper tape, a bit string, a pixel matrix — is the present'
          + ' link of a two-thousand-year chain. Sixteen by sixteen pixels on a phone screen, a sheet of pattern cords and'
          + ' a punched card are the same data structure in different media.',
      source: 'UNESCO 人类非物质文化遗产代表作名录（2009）｜本作品自身算法与数据'
    },
    west: {
      title: 'GPU、矩阵与生成模型',
      titleEn: 'GPUs, matrices and generative models',
      body: '当代图形处理器以矩阵运算为核心，屏幕上的每一个像素都是一次编码的产物；'
          + '生成式模型进一步把"纹样设计"本身也纳入同一套矩阵运算。'
          + '两千年前的花本、两百年前的卡片、今天的张量，处理的都是"二维网格上的离散取值"。',
      en: 'Contemporary GPUs are matrix engines, and every pixel on a screen is the output of an encoding; generative'
          + ' models bring the design of a pattern itself into the same matrix arithmetic. The pattern book of two thousand'
          + ' years ago, the card of two hundred years ago and today\'s tensor all handle discrete values on a two-'
          + ' dimensional grid.',
      source: '计算机图形学教材｜UNESCO 名录｜技术史通论'
    },
    link: { zh: '花本 → 卡片 → 纸带 → 二进制 → 像素：五态同构', en: 'cords → cards → tape → bits → pixels: five isomorphic states' }
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TIMELINE: TIMELINE };
}

;
/* ==== app.js ==== */
/* ============================================================
   织机与芯片 · Loom & Chip  —— 主逻辑
   第 0 节为四段可复算算法（纯函数，Node 可直接 require 做自检）；
   第 1 节起为九大模块的渲染与交互。
   零依赖：不引用任何外部库、字体或图片。
   ============================================================ */
'use strict';

/* ============================================================
   0 · 算法层
   ============================================================ */

/** 云锦四色的编码字与色值。索引顺序即花本"配色位"的取值顺序。 */
const COLOR_KEYS = ['B', 'W', 'G', 'K'];
const COLOR_META = {
  B: { zh: '石青', en: 'stone blue', hex: '#1c3f52' },
  W: { zh: '月白', en: 'moon white', hex: '#dfe8ec' },
  G: { zh: '赤金', en: 'vermilion gold', hex: '#b8860b' },
  K: { zh: '墨', en: 'ink', hex: '#1a1a1a' }
};

/**
 * 三种地组织：period 即组织循环（也是地综片数）；
 * float 为该组织下地部的最大经浮长（实测应与 groundLift 的连续 1 串长度一致）。
 */
const STRUCTURES = {
  plain: { id: 'plain', zh: '平纹', en: 'Plain weave', period: 2, float: 1,
    desc: { zh: '一经一纬交替交织，浮长最短，地部最挺括。', en: 'One over one; shortest floats, firmest ground.' } },
  twill: { id: 'twill', zh: '三枚斜纹', en: '3-end twill', period: 3, float: 2,
    desc: { zh: '交织点逐纬移一格，地部呈连续斜向纹路，经浮长为 2。', en: 'Binding points shift one place per pick: a continuous diagonal with a warp float of 2.' } },
  satin5: { id: 'satin5', zh: '五枚缎纹', en: '5-end satin', period: 5, float: 4,
    desc: { zh: '每纬只有一片地综落下，经浮长为 4，表面光洁——云锦库缎、妆花缎的标准地组织。', en: 'One frame down per pick, a warp float of 4 and a glossy face: the standard ground of brocade satin.' } }
};
const STRUCTURE_ORDER = ['plain', 'twill', 'satin5'];

/** 织物渲染用材质色（非 UI 色） */
const SILK = {
  warp: '#b3c2c9',      // 经面（月白缎地受光）
  warpDim: '#a1b1b8',
  weft: '#93a5ad',      // 纬面（地纬受光较弱）
  weftDim: '#83959d',
  edge: 'rgba(8,11,13,0.20)'
};

/* ---------- 0.1 纹样（design）基础操作 ---------- */

function blankDesign(n) {
  const cells = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) row.push(null);
    cells.push(row);
  }
  return { w: n, h: n, cells: cells };
}

/** 由字符行数组构造纹样：'.' 为空，'B'/'W'/'G'/'K' 为色。 */
function designFromRows(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const cells = rows.map(r => r.split('').map(ch => (COLOR_KEYS.indexOf(ch) >= 0 ? ch : null)));
  return { w: w, h: h, cells: cells };
}

function designToRows(design) {
  return design.cells.map(row => row.map(c => (COLOR_KEYS.indexOf(c) >= 0 ? c : '.')).join(''));
}

/** 归一化：把 '.'、'' 等非法值一律视为空，保证往返一致比较可靠。 */
function normalizeDesign(design) {
  const w = design.w, h = design.h;
  const cells = [];
  for (let i = 0; i < h; i++) {
    const row = [];
    for (let j = 0; j < w; j++) {
      const c = design.cells[i] ? design.cells[i][j] : null;
      row.push(COLOR_KEYS.indexOf(c) >= 0 ? c : null);
    }
    cells.push(row);
  }
  return { w: w, h: h, cells: cells };
}

/** 重新采样到 n×n（用于 8×8 ⇄ 16×16 切换，按块取众数） */
function resizeDesign(design, n) {
  const src = normalizeDesign(design);
  if (src.w === n && src.h === n) return src;
  const cells = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      const x0 = Math.floor(j * src.w / n), x1 = Math.max(x0 + 1, Math.floor((j + 1) * src.w / n));
      const y0 = Math.floor(i * src.h / n), y1 = Math.max(y0 + 1, Math.floor((i + 1) * src.h / n));
      const tally = {};
      let best = null, bestN = 0;
      for (let y = y0; y < y1 && y < src.h; y++) {
        for (let x = x0; x < x1 && x < src.w; x++) {
          const c = src.cells[y][x];
          if (!c) continue;
          tally[c] = (tally[c] || 0) + 1;
          if (tally[c] > bestN) { bestN = tally[c]; best = c; }
        }
      }
      row.push(best);
    }
    cells.push(row);
  }
  return { w: n, h: n, cells: cells };
}

/* ---------- 0.2 组织（weave structure） ---------- */

/**
 * 地综提升判定：第 weft 纬、第 frame 片综框是否提起。
 * frame 与经线序号的关系为 frame = warp % period，
 * 因此 groundLift(weft, warp, s) 在经向以 period 为周期、在纬向也以 period 为周期。
 */
function frameLift(structure, weft, frame) {
  if (structure === 'twill') return ((((frame - weft) % 3) + 3) % 3) < 2 ? 1 : 0;
  // 五枚经面缎纹：每纬只有一片地综落下（交织点），其余四片提起 → 经浮长为 4
  if (structure === 'satin5') return (((((frame - 2 * weft) % 5) + 5) % 5) === 0) ? 0 : 1;
  return ((weft + frame) % 2 === 0) ? 1 : 0; // plain
}

/** 地组织在某一点的经线提升状态（1=经浮，0=纬浮） */
function groundLift(structure, weft, warp) {
  const P = (STRUCTURES[structure] || STRUCTURES.plain).period;
  return frameLift(STRUCTURES[structure] ? structure : 'plain', weft, ((warp % P) + P) % P);
}

/* ---------- 0.3 算法一：compileToPattern 挑花结本编译器 ---------- */

/**
 * 纹样矩阵 → 花本。
 * 返回 { w, h, lift:['0110…'], color:[[0..4]], stats }
 *   lift[i][j]  === '1'  表示第 i 纬、第 j 经提起（显花）
 *   color[i][j] === k    表示该位使用 COLOR_KEYS[k-1] 的彩纬；0 为地部
 * 关键性质：decodePattern(compileToPattern(d)) 与 d 逐位一致。
 */
function compileToPattern(design) {
  const d = normalizeDesign(design);
  const w = d.w, h = d.h;
  const lift = [], color = [];
  let flowers = 0, distinctColours = {};
  for (let i = 0; i < h; i++) {
    let bits = '';
    const crow = [];
    for (let j = 0; j < w; j++) {
      const c = d.cells[i][j];
      const k = COLOR_KEYS.indexOf(c);
      if (k >= 0) {
        bits += '1'; crow.push(k + 1); flowers++; distinctColours[c] = 1;
      } else {
        bits += '0'; crow.push(0);
      }
    }
    lift.push(bits);
    color.push(crow);
  }
  const total = w * h;
  return {
    w: w, h: h, lift: lift, color: color,
    stats: {
      total: total,
      flowers: flowers,
      ground: total - flowers,
      liftRatio: total ? flowers / total : 0,
      coloursUsed: Object.keys(distinctColours).length,
      bitsPerWeft: w
    }
  };
}

/** 花本 → 纹样（compileToPattern 的逆） */
function decodePattern(pattern) {
  const w = pattern.w, h = pattern.h;
  const cells = [];
  for (let i = 0; i < h; i++) {
    const row = [];
    for (let j = 0; j < w; j++) {
      const bit = pattern.lift[i] ? pattern.lift[i][j] : '0';
      const ci = (pattern.color[i] && pattern.color[i][j]) || 0;
      row.push(bit === '1' && ci > 0 ? COLOR_KEYS[ci - 1] : null);
    }
    cells.push(row);
  }
  return { w: w, h: h, cells: cells };
}

/** 纹样 → 纯二值位矩阵（五态互转的共同载体） */
function designToBits(design) {
  const p = compileToPattern(design);
  return { w: p.w, h: p.h, rows: p.lift.slice() };
}

function bitsToDesign(bits) {
  return { w: bits.w, h: bits.h, cells: bits.rows.map(r => r.split('').map(ch => (ch === '1' ? 'G' : null))) };
}

/** 确定性校验和（FNV-1a 32bit），用于比较两份花本是否同构 */
function checksum(pattern) {
  let h = 0x811c9dc5;
  const s = pattern.lift.map((r, i) => r + ':' + pattern.color[i].join('')).join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return ('00000000' + (h >>> 0).toString(16)).slice(-8);
}

/* ---------- 0.4 算法二：weaveSimulate 织造模拟器 ---------- */

/**
 * 花本 + 地组织 → 织物像素矩阵。
 * 规则（教学示意，非文物级复原）：
 *   · 花部位（lift=1）→ 彩色纬浮于表面（face='weft'，颜色取配色位）
 *   · 地部位（lift=0）→ 按地组织交织：地综提起则经浮，否则纬浮
 * 同时统计经浮/纬浮点数与最大浮长（浮长按纬向连续同面计数）。
 */
function weaveSimulate(pattern, structure) {
  const st = STRUCTURES[structure] ? structure : 'plain';
  const P = STRUCTURES[st].period;
  const w = pattern.w, h = pattern.h;
  const cells = [];
  let warpFace = 0, weftFace = 0, flowerCells = 0;
  for (let i = 0; i < h; i++) {
    const row = [];
    for (let j = 0; j < w; j++) {
      const isFlower = pattern.lift[i][j] === '1';
      let face, color, gl = 0;
      if (isFlower) {
        face = 'weft';
        const ci = pattern.color[i][j] || 1;
        color = COLOR_KEYS[ci - 1];
        flowerCells++;
      } else {
        gl = groundLift(st, i, j);
        face = gl ? 'warp' : 'weft';
        color = gl ? 'W' : 'B';   // 语义色：W=经面（月白经），B=纬面（石青地纬）
      }
      if (face === 'warp') warpFace++; else weftFace++;
      row.push({ face: face, color: color, flower: isFlower, lift: face === 'warp' ? 1 : 0 });
    }
    cells.push(row);
  }

  // 浮长：逐纬（行）统计连续同面的长度
  const floatLen = [];
  let maxWarpFloat = 0, maxWeftFloat = 0, floatSum = 0;
  for (let i = 0; i < h; i++) {
    const run = new Array(w).fill(1);
    let start = 0;
    for (let j = 1; j <= w; j++) {
      if (j === w || cells[i][j].face !== cells[i][start].face) {
        const len = j - start;
        for (let k = start; k < j; k++) run[k] = len;
        if (cells[i][start].face === 'warp') { if (len > maxWarpFloat) maxWarpFloat = len; }
        else { if (len > maxWeftFloat) maxWeftFloat = len; }
        floatSum += len * len;
        start = j;
      }
    }
    floatLen.push(run);
  }

  const total = w * h;
  return {
    w: w, h: h, structure: st, period: P,
    cells: cells, floatLen: floatLen,
    stats: {
      total: total,
      warpFace: warpFace,
      weftFace: weftFace,
      flowerCells: flowerCells,
      warpFaceRatio: total ? warpFace / total : 0,
      maxWarpFloat: maxWarpFloat,
      maxWeftFloat: maxWeftFloat,
      meanFloat: total ? floatSum / total : 0,
      frames: P
    }
  };
}

/* ---------- 0.5 算法三：MODALITIES 五态互转 ---------- */

function identityBits(bits) {
  return { w: bits.w, h: bits.h, rows: bits.rows.slice() };
}

function bitsFromRows(rows, w, h) {
  return { w: w, h: h, rows: rows };
}

/* 穿孔卡片：一卡一纬，孔位对应经线 */
function toCard(bits) {
  return {
    kind: 'card', w: bits.w, h: bits.h,
    cards: bits.rows.map(r => r.split('').map(ch => (ch === '1' ? 1 : 0)))
  };
}
function fromCard(card) {
  return bitsFromRows(card.cards.map(c => c.map(v => (v ? '1' : '0')).join('')), card.w, card.h);
}

/* 打孔纸带：逐行折返成连续条带，默认 8 通道 */
function toTape(bits, lanes) {
  const L = lanes || 8;
  return { kind: 'tape', w: bits.w, h: bits.h, lanes: L, strip: bits.rows.join('') };
}
function fromTape(tape) {
  const w = tape.w, h = tape.h, s = tape.strip;
  const rows = [];
  for (let i = 0; i < h; i++) rows.push(s.slice(i * w, (i + 1) * w));
  return bitsFromRows(rows, w, h);
}
/** 纸带可视化排布：第 k 位（k = i*w + j）落在 lane = k % lanes、col = ⌊k/lanes⌋ */
function tapeLayout(bits, lanes) {
  const L = lanes || 8;
  const total = bits.w * bits.h;
  const cols = Math.ceil(total / L);
  const out = [];
  for (let i = 0; i < bits.h; i++) {
    for (let j = 0; j < bits.w; j++) {
      const k = i * bits.w + j;
      out.push({ i: i, j: j, k: k, lane: k % L, col: Math.floor(k / L), bit: bits.rows[i][j] });
    }
  }
  return { lanes: L, cols: cols, cells: out };
}

/* 二进制串 */
function toBinary(bits, group) {
  const g = group || 0;
  const raw = bits.rows.join('');
  const pretty = g > 0 ? bits.rows.map(r => r.replace(new RegExp('(.{' + g + '})', 'g'), '$1 ').trim()).join(' ') : raw;
  return { kind: 'binary', w: bits.w, h: bits.h, str: raw, pretty: pretty };
}
function fromBinary(bin) {
  const s = String(bin.str).replace(/[^01]/g, '');
  const w = bin.w, h = bin.h;
  const rows = [];
  for (let i = 0; i < h; i++) rows.push(s.slice(i * w, (i + 1) * w));
  return bitsFromRows(rows, w, h);
}

/* 像素矩阵 */
function toPixels(bits) {
  return {
    kind: 'pixels', w: bits.w, h: bits.h,
    px: bits.rows.map(r => r.split('').map(ch => (ch === '1' ? 1 : 0)))
  };
}
function fromPixels(px) {
  return bitsFromRows(px.px.map(r => r.map(v => (v ? '1' : '0')).join('')), px.w, px.h);
}

/** 五种介质：to 为正转，from 为逆转（二者必须互逆） */
const MODALITIES = [
  { id: 'flower', zh: '花本线', en: 'knotted cords', to: identityBits, from: identityBits },
  { id: 'card', zh: '穿孔卡片', en: 'punched cards', to: toCard, from: fromCard },
  { id: 'tape', zh: '打孔纸带', en: 'punched tape', to: toTape, from: fromTape },
  { id: 'binary', zh: '二进制串', en: 'bit string', to: toBinary, from: fromBinary },
  { id: 'pixels', zh: '像素矩阵', en: 'pixel matrix', to: toPixels, from: fromPixels }
];

function modalityById(id) {
  for (let i = 0; i < MODALITIES.length; i++) if (MODALITIES[i].id === id) return MODALITIES[i];
  return null;
}

/* ---------- 0.6 算法四：loomTiming 织造时序 ---------- */

/**
 * 每纬的综框提升序列与投梭顺序。
 * 大花楼的实际分工：地综由踏板控制整组升降；花部由花本经束综单独控制，
 * 因此一纬之内可能先投一把地纬、再按花色投入若干把小梭（通经断纬）。
 */
function loomTiming(pattern, structure) {
  const st = STRUCTURES[structure] ? structure : 'plain';
  const P = STRUCTURES[st].period;
  const w = pattern.w, h = pattern.h;
  const picks = [];
  let shuttlePasses = 0, colourPasses = 0;
  for (let i = 0; i < h; i++) {
    const groundFrames = [];
    for (let f = 0; f < P; f++) if (frameLift(st, i, f) === 1) groundFrames.push(f + 1);
    const colours = [];
    for (let j = 0; j < w; j++) {
      const ci = pattern.color[i][j];
      if (pattern.lift[i][j] === '1' && ci > 0 && colours.indexOf(ci) < 0) colours.push(ci);
    }
    colours.sort(function (a, b) { return a - b; });
    const shuttles = [{ order: 1, role: 'ground', color: null, key: 'B' }];
    for (let c = 0; c < colours.length; c++) {
      shuttles.push({ order: shuttles.length + 1, role: 'color', color: colours[c], key: COLOR_KEYS[colours[c] - 1] });
    }
    let finalLift = '';
    for (let j = 0; j < w; j++) finalLift += (pattern.lift[i][j] === '1') ? '0' : String(groundLift(st, i, j));
    picks.push({
      weft: i + 1,
      groundFrames: groundFrames,
      colours: colours,
      shuttles: shuttles,
      shuttleCount: shuttles.length,
      finalLift: finalLift,
      figureCount: pattern.lift[i].split('1').length - 1
    });
    shuttlePasses += shuttles.length;
    colourPasses += colours.length;
  }
  return {
    w: w, h: h, structure: st, period: P, frameCount: P,
    totalPicks: picks.length,
    totalShuttlePasses: shuttlePasses,
    totalColourPasses: colourPasses,
    picks: picks
  };
}

/* ---------- 0.7 教学包文本生成（纯函数，可测） ---------- */

function csvEscape(v) {
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function huabenRows(pattern) {
  const rows = [];
  const head = ['纬号'];
  for (let j = 1; j <= pattern.w; j++) head.push('经' + j);
  head.push('提花数');
  rows.push(head);
  for (let i = 0; i < pattern.h; i++) {
    const row = [i + 1];
    for (let j = 0; j < pattern.w; j++) row.push(pattern.lift[i][j]);
    row.push(pattern.lift[i].split('1').length - 1);
    rows.push(row);
  }
  return rows;
}

function timingRows(pattern, structure) {
  const t = loomTiming(pattern, structure);
  const rows = [['纬号', '地综提升（片）', '花部提沉', '彩纬（配色位）', '投梭顺序', '投梭数', '最终经线提升']];
  for (let i = 0; i < t.picks.length; i++) {
    const p = t.picks[i];
    const order = p.shuttles.map(function (s) {
      return s.role === 'ground' ? '地纬(大梭)' : '彩纬-' + COLOR_META[s.key][LANG_KEY];
    }).join(' → ');
    rows.push([
      p.weft,
      p.groundFrames.join('/'),
      pattern.lift[i],
      p.colours.length ? p.colours.join('/') : '—',
      order,
      p.shuttleCount,
      p.finalLift
    ]);
  }
  return rows;
}

function toCSV(rows) {
  return rows.map(function (r) { return r.map(csvEscape).join(','); }).join('\r\n') + '\r\n';
}

function toMarkdown(rows, caption) {
  const head = rows[0];
  let out = '| ' + head.join(' | ') + ' |\n';
  out += '| ' + head.map(function () { return '---'; }).join(' | ') + ' |\n';
  for (let i = 1; i < rows.length; i++) out += '| ' + rows[i].join(' | ') + ' |\n';
  return (caption ? '**' + caption + '**\n\n' : '') + out;
}

/* ============================================================
   1 · 国际化与文案
   ============================================================ */

/** 当前语言键（算法层导出时序表时需要一个默认值） */
let LANG_KEY = 'zh';

/** 术语 / 纹样 / 节点条数：界面文案里的数字直接从数据读出，避免与代码漂移。
    用 try/catch 取值，使本文件在 Node 里被 require（数据脚本未加载）时安全降级为 0。 */
const N_TERMS = (function () { try { return TERMS.length; } catch (e) { return 0; } })();
const N_PATTERNS = (function () { try { return PATTERNS.length; } catch (e) { return 0; } })();
const N_TIMELINE = (function () { try { return TIMELINE.length; } catch (e) { return 0; } })();

const TXT = {
  zh: {
    skip: '跳到主要操作区',
    nav_1: '纹样工坊', nav_2: '挑花结本', nav_3: '投梭织造', nav_4: '五态同构',
    nav_5: '织物库', nav_6: '时间线', nav_7: '术语库', nav_8: '教学包', nav_9: '团队',
    motion_off: '减弱动效',
    cover_kicker: '全国大学生数字媒体科技作品及创意竞赛 · 国际专项赛',
    cover_sub: '从挑花结本到二进制的技术文明谱系',
    cover_lead: '一千多年前，南京云锦的织工用一根根丝线编成「花本」，控制大花楼织机上哪几根经线提起、哪几根沉下。那是一份可以卷起来、换下来、复制的程序。今天，我们把它交回你手里：在格子上画一朵团花，看它变成花本、变成穿孔卡片、变成打孔纸带、变成二进制串、变成像素——同一份编码，五种介质。',
    cover_lead_en: 'A thousand years ago, weavers in Nanjing knotted silk cords into a «flower book» — a programme telling a great drawloom which warp threads to raise. This work hands that programme back to you: draw a roundel on a grid and watch it become cords, a punched card, a paper tape, a bit string, a pixel matrix. One encoding, five media.',
    cover_cta: '开始织造 · Start weaving',
    cover_cta2: '先看五态同构',
    cover_art_cap: '缠枝莲 · 五枚缎纹织造示意 · Canvas 程序生成',
    cover_spec: '四段可复算算法 · ' + N_TERMS + ' 条双语术语 · ' + N_PATTERNS + ' 件云锦纹样 · ' + N_TIMELINE + ' 个技术史节点 · 零依赖离线运行',
    ws_title: '纹样工坊', ws_sub: 'Pattern workshop — 在网格上点出一朵花，它将成为一份程序',
    ws_desc: '选择网格尺寸与云锦四色之一，然后点击或拖拽上色。撤销栈会记住每一次落笔；载入预设可以看传统的团花、缠枝莲、四合云与织金几何是怎么排布的。',
    ws_undo: '撤销', ws_clear: '清空', ws_random: '随机',
    ws_hint: '方向键移动光标，空格或回车落色；也可直接点击或按住拖拽。',
    ws_readout: '编码摘要',
    ws_tips: '三步上手',
    ws_s1: '选一色，在格子上点出花纹；或直接载入一件传统纹样。',
    ws_s2: '切到 02 看它被编译成花本：每一纬一串 0 与 1。',
    ws_s3: '在 03 按播放，一梭一梭织出来；再去 04 点任意一位看五态联动。',
    dr_title: '挑花结本', dr_sub: 'Pattern drafting — 把纹样编译成每一纬的提沉序列',
    dr_desc: '挑花结本是把纹样换算成经纬编码、再用丝线编结成「花本」的工序。下图竖线为经（脚子线），横线为纬（耳子线），每一个结扣代表该纬该经「提」——这正是本作品的 compileToPattern 所做的事。',
    dr_huaben: '花本线结构', dr_hint: '点击任意一纬，或使用上方单步按钮，查看该纬的提沉序列。',
    dr_code: '提沉编码', dr_stats: '花本统计',
    wv_title: '投梭织造', wv_sub: 'Weaving — 逐纬交织，看组织如何决定浮长',
    wv_desc: '花部以彩纬浮于表面，地部按所选组织交织。组织循环决定地部的律动：平纹 2、三枚斜纹 3、五枚缎纹 5。放大镜可以看到单个织点的经纬压覆关系。',
    wv_play: '播放', wv_pause: '暂停', wv_step: '单步', wv_reset: '复位', wv_speed: '速度',
    wv_hl_weft: '高亮当前纬', wv_hl_warp: '高亮当前经', wv_face: '显示经浮 / 纬浮',
    wv_metrics: '织造数值',
    fv_title: '五态同构', fv_sub: 'Five isomorphic states — 同一份编码的五种介质',
    fv_desc: '把同一份纹样编码并排铺开：花本线上有没有那一个结、卡片上有没有那一个孔、纸带上有没有那一个眼、二进制位是 0 还是 1、像素是亮还是暗——点击任意一态中的某一位，另外四态会同时亮起同一位。',
    fv_schematic: '数据视图', fv_material: '实物视图', fv_random: '随机一位',
    fv_m1: '花本线', fv_m1s: 'knotted cords', fv_m1n: '结扣 = 提；无结 = 沉。一纬一串结。',
    fv_m2: '穿孔卡片', fv_m2s: 'punched cards', fv_m2n: '一卡一纬，孔位对应经线。',
    fv_m3: '打孔纸带', fv_m3s: 'punched tape', fv_m3n: '八通道 · 孔距 2.54 mm · 折返读取',
    fv_m4: '二进制串', fv_m4s: 'bit string', fv_m4n: '逐纬一行，一位一比特。',
    fv_m5: '像素矩阵', fv_m5s: 'pixel matrix', fv_m5n: '亮像素 = 提，暗像素 = 沉。',
    fv_hint: '提示：五态互转在算法层可逆——toCard / toTape / toBinary / toPixels 与对应的 from* 逐位还原。',
    fv_idle: '— 请点击任一位 —',
    lb_title: '织物库', lb_sub: 'Fabric library — 六件云锦纹样的「纹样 → 花本 → 织物」三态',
    lb_desc: '每一件都完整走完编译与织造：左为纹样矩阵，中为编译所得的花本提沉，右为按五枚缎纹织出的织物。点击「载入工坊」可把它送进 01 继续修改。',
    tl_title: '织造时间线', tl_sub: 'Timeline — 中西双轨，八个节点',
    tl_desc: '左列是中国轨，只讲同一时期的中国；右列是西方轨，只讲同一时期的世界。1804 年之后的雅卡尔机、霍列瑞斯制表机与存储程序都归在西方轨，中国轨讲那一时期的中国织造处境。点击节点查看详情；在本模块内按 ← → 可逐步切换。每条史实都标注了来源类别。',
    tl_prev: '← 上一节点', tl_next: '下一节点 →',
    tm_title: '术语库', tm_sub: 'Terminology — ' + N_TERMS + ' 条中英双语术语',
    tm_desc: '六个分类：织造组织、纹样母题、材料工艺、织机结构、技术史、术语对照。支持中文、英文与释义全文检索。',
    tm_ph: '检索：团花 / roundel / 花本 / 通经断纬…', tm_empty: '没有匹配的术语，试试其他关键词。',
    tc_title: '教学包', tc_sub: 'Teaching pack — 一键导出花本表与织造时序表',
    tc_desc: '把当前纹样的花本编码与逐纬综框提升序列导出为 CSV 或 Markdown，可直接用于课堂演示与作业。全部在本地生成，不联网。',
    tc_b1: '导出花本表 CSV', tc_b2: '导出织造时序表 CSV', tc_b3: '导出花本表 Markdown',
    tc_b4: '导出时序表 Markdown', tc_b5: '复制时序表', tc_export: '导出内容说明',
    te_title: '团队 · 制作 · AI 披露', te_sub: 'Team, making, and disclosure',
    te_desc: '本页列明原创资产边界、分工方式与 AI 使用情况。所有结论均可与随包交付的测试脚本互相核对。',
    te_orig: '原创资产界定', te_ai: 'AI 使用披露', te_pending: '待替换影像位置清单',
    te_pending_note: '下列位置当前由 Canvas 噪声与渐变程序生成，无图亦可正常显示；Lead 替换 AI 影像后代码无需改动。',
    te_verify: '可验证性',
    foot_1: '从挑花结本到二进制的技术文明谱系 ｜ 全国大学生数字媒体科技作品及创意竞赛 · 国际专项赛 ｜ 2026',
    foot_2: '数字赋能 · 文明互鉴 —— 全部视觉由自绘 SVG / Canvas / CSS 程序生成，零外部依赖，双击即开。'
  },
  en: {
    skip: 'Skip to the main workbench',
    nav_1: 'Workshop', nav_2: 'Drafting', nav_3: 'Weaving', nav_4: 'Five states',
    nav_5: 'Fabric library', nav_6: 'Timeline', nav_7: 'Terminology', nav_8: 'Teaching pack', nav_9: 'Team',
    motion_off: 'Reduce motion',
    cover_kicker: 'National Student Competition in Digital Media Technology · International Session',
    cover_sub: 'The Silk Road of Code: from pattern drafting to binary',
    cover_lead: 'A thousand years ago, weavers in Nanjing knotted silk cords into a «flower book» that told a great drawloom which warp threads to raise and which to sink. It was a programme that could be rolled up, swapped out and copied. This work hands it back to you: draw a roundel on a grid and watch it become a cord pattern book, a punched card, a paper tape, a bit string, a pixel matrix — one encoding, five media.',
    cover_lead_en: 'A thousand years ago, weavers in Nanjing knotted silk cords into a «flower book» — a programme telling a great drawloom which warp threads to raise. This work hands that programme back to you: draw a roundel on a grid and watch it become cords, a punched card, a paper tape, a bit string, a pixel matrix. One encoding, five media.',
    cover_cta: 'Start weaving',
    cover_cta2: 'See the five states',
    cover_art_cap: 'Lotus scroll woven on a five-end satin · generated in Canvas',
    cover_spec: '4 recomputable algorithms · ' + N_TERMS + ' bilingual terms · ' + N_PATTERNS + ' brocade patterns · ' + N_TIMELINE + ' historical nodes · zero dependencies, runs offline',
    ws_title: 'Pattern workshop', ws_sub: 'Tap out a flower on a grid; it becomes a programme',
    ws_desc: 'Pick a grid size and one of the four brocade colours, then click or drag to paint. The undo stack remembers every stroke; presets show how roundels, lotus scrolls, four-way clouds and gold lattices are actually laid out.',
    ws_undo: 'Undo', ws_clear: 'Clear', ws_random: 'Random',
    ws_hint: 'Arrow keys move the cursor; Space or Enter paints. You can also click, or press and drag.',
    ws_readout: 'Encoding summary',
    ws_tips: 'Three steps',
    ws_s1: 'Choose a colour and tap out a motif, or load a traditional pattern.',
    ws_s2: 'Go to 02 and see it compiled into cords: one string of 0s and 1s per pick.',
    ws_s3: 'Press play in 03 to weave it pick by pick, then click any bit in 04 to see the five states move together.',
    dr_title: 'Pattern drafting', dr_sub: 'Compiling the design into a lift sequence for every pick',
    dr_desc: 'Pattern drafting converts a design into a warp/weft code and knots it into a «pattern book». Below, vertical lines are warp cords and horizontal lines are weft cords; every knot marks a raised end — exactly what compileToPattern does in this work.',
    dr_huaben: 'Cord structure', dr_hint: 'Click any pick, or use the arrows above, to inspect its lift sequence.',
    dr_code: 'Lift code', dr_stats: 'Pattern-book statistics',
    wv_title: 'Weaving', wv_sub: 'Pick by pick, and how the weave sets the float',
    wv_desc: 'The figure appears as colour weft floating on the face; the ground interlaces according to the chosen weave. The weave repeat sets the rhythm: 2 for plain, 3 for a three-end twill, 5 for a five-end satin. The lens shows how warp and weft cross at a single binding point.',
    wv_play: 'Play', wv_pause: 'Pause', wv_step: 'Step', wv_reset: 'Reset', wv_speed: 'Speed',
    wv_hl_weft: 'Highlight current pick', wv_hl_warp: 'Highlight current end', wv_face: 'Show warp / weft face',
    wv_metrics: 'Weaving metrics',
    fv_title: 'Five isomorphic states', fv_sub: 'One encoding carried by five media',
    fv_desc: 'The same encoding laid out side by side: a knot on the cord, a hole in the card, a perforation in the tape, a 0 or a 1 in the bit string, a lit or dark pixel. Click any single bit in any state and the other four light up at the same position.',
    fv_schematic: 'Data view', fv_material: 'Material view', fv_random: 'Random bit',
    fv_m1: 'Knotted cords', fv_m1s: 'hua ben', fv_m1n: 'Knot = raised; no knot = sunk. One cord of knots per pick.',
    fv_m2: 'Punched cards', fv_m2s: 'Jacquard', fv_m2n: 'One card per pick; hole positions are warp ends.',
    fv_m3: 'Punched tape', fv_m3s: '8 channels', fv_m3n: '8 channels · 2.54 mm pitch · folded runs',
    fv_m4: 'Bit string', fv_m4s: 'binary', fv_m4n: 'One row per pick, one bit per end.',
    fv_m5: 'Pixel matrix', fv_m5s: 'digital', fv_m5n: 'Lit pixel = raised, dark pixel = sunk.',
    fv_hint: 'Note: the five conversions are reversible in code — toCard / toTape / toBinary / toPixels each pair with a from* that restores every bit.',
    fv_idle: '— click any bit —',
    lb_title: 'Fabric library', fv_unused: '', lb_sub: 'Six brocade patterns, each shown as design → pattern book → fabric',
    lb_desc: 'Every entry runs the full pipeline: the design matrix on the left, the compiled lift code in the middle, the fabric woven on a five-end satin on the right. Press «Load into workshop» to keep editing it in 01.',
    tl_title: 'Timeline', tl_sub: 'Eight nodes on two tracks, Chinese and Western',
    tl_desc: 'The left track is China only; the right track is the rest of the world only. After 1804 the Jacquard loom, the Hollerith tabulator and the stored program all sit on the Western track, while the Chinese track tells what Chinese weaving was doing at the same time. Click a node for detail; press ← → inside this section to step through. Every entry carries its source category.',
    tl_prev: '← Previous', tl_next: 'Next →',
    tm_title: 'Terminology', tm_sub: N_TERMS + ' bilingual terms',
    tm_desc: 'Six categories: weave structures, pattern motifs, materials and craft, loom structure, technology history, and term concordance. Search in Chinese, English or the full gloss.',
    tm_ph: 'Search: roundel / 花本 / weft float / 妆花…', tm_empty: 'No matching term. Try another keyword.',
    tc_title: 'Teaching pack', tc_sub: 'Export the pattern-book table and the weaving schedule',
    tc_desc: 'Export the current pattern-book code and the per-pick heddle sequence as CSV or Markdown for classroom use. Everything is generated locally; nothing is uploaded.',
    tc_b1: 'Export pattern book (CSV)', tc_b2: 'Export weaving schedule (CSV)', tc_b3: 'Export pattern book (Markdown)',
    tc_b4: 'Export weaving schedule (Markdown)', tc_b5: 'Copy schedule', tc_export: 'What is exported',
    te_title: 'Team, making, and disclosure', te_sub: 'Original assets, division of labour, and AI use',
    te_desc: 'This page states the boundary of original assets, how the work was divided, and exactly where AI was used. Every claim here can be checked against the test scripts shipped with the work.',
    te_orig: 'Original assets', te_ai: 'AI disclosure', te_pending: 'Image slots awaiting AI footage',
    te_pending_note: 'These slots are currently filled by procedurally generated Canvas noise and gradients. The work displays correctly without any image; replacing them with AI footage needs no code change.',
    te_verify: 'Verifiability',
    foot_1: 'From pattern drafting to binary: a genealogy of technical civilisation ｜ National Student Competition in Digital Media Technology · International Session ｜ 2026',
    foot_2: 'Digital empowerment · mutual learning among civilizations — every visual is generated by hand-written SVG / Canvas / CSS. Zero dependencies; open by double-click.'
  }
};

function t(key) {
  const pack = TXT[LANG_KEY] || TXT.zh;
  return pack[key] !== undefined ? pack[key] : (TXT.zh[key] !== undefined ? TXT.zh[key] : key);
}

/** 双语文案取值 */
function pick(obj) {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string') return obj;
  return obj[LANG_KEY] !== undefined ? obj[LANG_KEY] : (obj.zh !== undefined ? obj.zh : '');
}

/* ============================================================
   2 · 应用状态
   ============================================================ */

const S = {
  size: 16,
  color: 'B',
  design: null,
  undo: [],
  pattern: null,
  structure: 'satin5',
  draftIndex: 0,
  weave: { progress: 0, playing: false, speed: 3, timer: null, focus: null, hlWarp: false, hlWeft: true, showFace: false },
  sync: null,
  syncSource: null,
  fiveView: 'schematic',
  tlIndex: 0,
  termCat: 'all',
  termQuery: '',
  reduceMotion: false
};

function $(id) { return document.getElementById(id); }
function el(tag, cls, txt) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (txt !== undefined && txt !== null) n.textContent = txt;
  return n;
}

/* ============================================================
   3 · Canvas 织物质感（封面 / 织物库，程序生成，无外部图片）
   ============================================================ */

/** 抽象织物质感：经纬细线 + 噪声 + 光斑；cover 上还有一道缓慢移动的梭光 */
function paintSilkTexture(ctx, w, h, opts) {
  const o = opts || {};
  const seed = o.seed || 7;
  let s = seed;
  const rnd = function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = o.base || '#0d1114';
  ctx.fillRect(0, 0, w, h);

  // 经线：竖细线，密度随宽度
  const step = o.step || 7;
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += step) {
    const a = 0.08 + rnd() * 0.15;
    ctx.strokeStyle = 'rgba(196,214,222,' + a.toFixed(3) + ')';
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  // 纬线：横细线
  for (let y = 0; y < h; y += step) {
    const a = 0.05 + rnd() * 0.11;
    ctx.strokeStyle = 'rgba(184,134,11,' + a.toFixed(3) + ')';
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
  // 噪声点
  const dots = Math.round((w * h) / 900);
  for (let i = 0; i < dots; i++) {
    ctx.fillStyle = 'rgba(223,232,236,' + (0.02 + rnd() * 0.06).toFixed(3) + ')';
    ctx.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * h), 1, 1);
  }
  // 大光斑
  const g = ctx.createRadialGradient(w * 0.66, h * 0.28, 0, w * 0.66, h * 0.28, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(47,107,138,0.22)');
  g.addColorStop(0.55, 'rgba(28,63,82,0.10)');
  g.addColorStop(1, 'rgba(8,11,13,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const g2 = ctx.createRadialGradient(w * 0.14, h * 0.86, 0, w * 0.14, h * 0.86, Math.max(w, h) * 0.55);
  g2.addColorStop(0, 'rgba(184,134,11,0.10)');
  g2.addColorStop(1, 'rgba(8,11,13,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, w, h);

  if (o.shuttle) {
    const sx = o.shuttle;
    const gg = ctx.createLinearGradient(sx - 90, 0, sx + 90, 0);
    gg.addColorStop(0, 'rgba(184,134,11,0)');
    gg.addColorStop(0.5, 'rgba(230,194,90,0.16)');
    gg.addColorStop(1, 'rgba(184,134,11,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(sx - 90, 0, 180, h);
  }
}

/* ============================================================
   4 · 模块 1：纹样工坊
   ============================================================ */

function renderSwatches() {
  const host = $('swatches');
  host.innerHTML = '';
  const labels = { B: 1, W: 1, G: 1, K: 1 };
  // 橡皮在最前
  const eraser = el('button', 'swatch' + (S.color === null ? ' on' : ''));
  eraser.type = 'button';
  eraser.dataset.color = '';
  eraser.dataset.label = LANG_KEY === 'zh' ? '橡皮' : 'erase';
  eraser.setAttribute('aria-label', LANG_KEY === 'zh' ? '橡皮：擦除该格' : 'Eraser');
  eraser.setAttribute('aria-pressed', S.color === null ? 'true' : 'false');
  eraser.addEventListener('click', function () { setColour(null); });
  host.appendChild(eraser);
  COLOR_KEYS.forEach(function (k) {
    const b = el('button', 'swatch' + (S.color === k ? ' on' : ''));
    b.type = 'button';
    b.dataset.color = k;
    b.dataset.label = COLOR_META[k][LANG_KEY];
    b.setAttribute('aria-label', COLOR_META[k].zh + ' / ' + COLOR_META[k].en);
    b.setAttribute('aria-pressed', S.color === k ? 'true' : 'false');
    b.addEventListener('click', function () { setColour(k); });
    host.appendChild(b);
  });
}

function setColour(k) {
  S.color = k;
  renderSwatches();
  const live = $('wsLive');
  if (live) live.textContent = k ? (LANG_KEY === 'zh' ? '当前颜色：' + COLOR_META[k].zh : 'Current colour: ' + COLOR_META[k].en)
    : (LANG_KEY === 'zh' ? '当前：橡皮' : 'Current: eraser');
}

function renderPresets() {
  const host = $('wsPresets');
  host.innerHTML = '';
  PATTERNS.slice(0, 4).forEach(function (p) {
    const b = el('button', 'preset-btn');
    b.type = 'button';
    const cv = document.createElement('canvas');
    cv.width = 44; cv.height = 44;
    b.appendChild(cv);
    b.appendChild(document.createTextNode(p[LANG_KEY] || p.zh));
    b.setAttribute('aria-label', (LANG_KEY === 'zh' ? '载入预设：' : 'Load preset: ') + (p[LANG_KEY] || p.zh));
    b.addEventListener('click', function () {
      loadDesignIntoWorkshop(designFromRows(p.map));
    });
    host.appendChild(b);
    paintDesignThumb(cv, designFromRows(p.map));
  });
}

function paintDesignThumb(canvas, design) {
  const ctx = canvas.getContext('2d');
  const d = normalizeDesign(design);
  const n = Math.max(d.w, d.h);
  const cell = canvas.width / n;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0b0f12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < d.h; i++) {
    for (let j = 0; j < d.w; j++) {
      const c = d.cells[i][j];
      ctx.fillStyle = c ? COLOR_META[c].hex : '#1b2228';
      ctx.fillRect(j * cell, i * cell, Math.ceil(cell), Math.ceil(cell));
    }
  }
}

function buildGrid() {
  const grid = $('wsGrid');
  const n = S.size;
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = 'repeat(' + n + ', minmax(0, 1fr))';
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const b = el('button', 'cell');
      b.type = 'button';
      b.dataset.i = String(i);
      b.dataset.j = String(j);
      b.tabIndex = (i === 0 && j === 0) ? 0 : -1;
      const c = S.design.cells[i][j];
      b.dataset.color = c || '';
      b.setAttribute('aria-label', cellLabel(i, j, c));
      grid.appendChild(b);
    }
  }
}

function cellLabel(i, j, c) {
  const pos = LANG_KEY === 'zh'
    ? '第 ' + (i + 1) + ' 纬 第 ' + (j + 1) + ' 经'
    : 'pick ' + (i + 1) + ', end ' + (j + 1);
  const col = c ? COLOR_META[c][LANG_KEY] : (LANG_KEY === 'zh' ? '空' : 'empty');
  return pos + ' · ' + col;
}

function setCell(i, j, color) {
  if (!S.design.cells[i]) return;
  S.design.cells[i][j] = color;
  const grid = $('wsGrid');
  const idx = i * S.size + j;
  const btn = grid.children[idx];
  if (btn) {
    btn.dataset.color = color || '';
    btn.setAttribute('aria-label', cellLabel(i, j, color));
  }
}

function pushUndo() {
  S.undo.push(designToRows(S.design));
  if (S.undo.length > 80) S.undo.shift();
  const b = $('wsUndo');
  if (b) b.disabled = S.undo.length === 0;
}

function undo() {
  if (!S.undo.length) return;
  const rows = S.undo.pop();
  const d = designFromRows(rows);
  if (d.w !== S.size) { S.size = d.w; }
  S.design = d;
  buildGrid();
  commitDesign(false);
}

function loadDesignIntoWorkshop(design) {
  pushUndo();
  const d = resizeDesign(design, S.size);
  S.design = d;
  buildGrid();
  commitDesign(false);
  const live = $('wsLive');
  if (live) live.textContent = LANG_KEY === 'zh' ? '已载入预设纹样' : 'Preset loaded';
}

function randomDesign() {
  const n = S.size;
  const cells = [];
  const pal = COLOR_KEYS;
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      const mirror = n - 1 - i;
      // 轴对称为传统纹样的常见做法：只算一半
      if (j > mirror) { row.push(null); continue; }
      const r = Math.random();
      row.push(r < 0.44 ? pal[Math.floor(Math.random() * 3)] : (r < 0.5 ? 'G' : null));
    }
    cells.push(row);
  }
  // 镜像补齐（沿副对角线对称）
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (j > n - 1 - i) cells[i][j] = cells[n - 1 - j][n - 1 - i];
    }
  }
  return { w: n, h: n, cells: cells };
}

function commitDesign(resetDraft) {
  S.pattern = compileToPattern(S.design);
  if (resetDraft !== false) S.draftIndex = 0;
  renderWorkshopReadout();
  renderDrafting();
  renderFive();
  S.weave.progress = 0;
  S.weave.playing = false;
  syncPlayButton();
  renderWeave();
  renderTeach();
}

function renderWorkshopReadout() {
  const p = S.pattern;
  const kv = $('wsKv');
  kv.innerHTML = '';
  const rows = [
    [LANG_KEY === 'zh' ? '网格' : 'Grid', S.size + ' × ' + S.size],
    [LANG_KEY === 'zh' ? '花位（提 = 1）' : 'Raised (1)', p.stats.flowers],
    [LANG_KEY === 'zh' ? '地位（沉 = 0）' : 'Sunk (0)', p.stats.ground],
    [LANG_KEY === 'zh' ? '提沉比' : 'Lift ratio', (p.stats.liftRatio * 100).toFixed(1) + '%'],
    [LANG_KEY === 'zh' ? '用色数' : 'Colours used', p.stats.coloursUsed],
    [LANG_KEY === 'zh' ? '编码总位' : 'Total bits', p.stats.total],
    [LANG_KEY === 'zh' ? '花本行数' : 'Pattern rows', p.h],
    [LANG_KEY === 'zh' ? '校验和' : 'Checksum', checksum(p)]
  ];
  rows.forEach(function (r) {
    kv.appendChild(el('dt', null, r[0]));
    kv.appendChild(el('dd', null, String(r[1])));
  });
}

function renderSteps() {
  const host = $('wsSteps');
  if (!host) return;
  host.innerHTML = '';
  ['ws_s1', 'ws_s2', 'ws_s3'].forEach(function (k) {
    host.appendChild(el('li', null, t(k)));
  });
}

function bindWorkshop() {
  document.querySelectorAll('.ws-toolbar .seg-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      const n = Number(b.dataset.size);
      if (n === S.size) return;
      document.querySelectorAll('.ws-toolbar .seg-btn').forEach(function (x) {
        x.classList.toggle('on', x === b);
      });
      pushUndo();
      S.size = n;
      S.design = resizeDesign(S.design, n);
      buildGrid();
      commitDesign(false);
    });
  });

  const grid = $('wsGrid');
  let painting = false;

  grid.addEventListener('pointerdown', function (e) {
    const c = e.target.closest('.cell');
    if (!c) return;
    e.preventDefault();
    pushUndo();
    painting = true;
    paintCell(c);
  });
  grid.addEventListener('pointermove', function (e) {
    if (!painting) return;
    const node = document.elementFromPoint(e.clientX, e.clientY);
    const c = node && node.closest ? node.closest('.cell') : null;
    if (c && grid.contains(c)) paintCell(c);
  });
  window.addEventListener('pointerup', function () { painting = false; });
  window.addEventListener('pointercancel', function () { painting = false; });

  function paintCell(c) {
    const i = Number(c.dataset.i), j = Number(c.dataset.j);
    if (S.design.cells[i][j] === S.color) return;
    setCell(i, j, S.color);
    commitDesign(false);
  }

  // 键盘：方向键移动，空格 / 回车落色
  grid.addEventListener('keydown', function (e) {
    const c = e.target.closest('.cell');
    if (!c) return;
    const i = Number(c.dataset.i), j = Number(c.dataset.j);
    let ni = i, nj = j, handled = true;
    if (e.key === 'ArrowUp') ni = Math.max(0, i - 1);
    else if (e.key === 'ArrowDown') ni = Math.min(S.size - 1, i + 1);
    else if (e.key === 'ArrowLeft') nj = Math.max(0, j - 1);
    else if (e.key === 'ArrowRight') nj = Math.min(S.size - 1, j + 1);
    else if (e.key === ' ' || e.key === 'Enter') {
      pushUndo();
      setCell(i, j, S.color);
      commitDesign(false);
    } else handled = false;
    if (!handled) return;
    e.preventDefault();
    if (ni !== i || nj !== j) {
      const next = grid.children[ni * S.size + nj];
      if (next) { c.tabIndex = -1; next.tabIndex = 0; next.focus(); }
    }
  });

  $('wsUndo').addEventListener('click', undo);
  $('wsUndo').disabled = true;
  $('wsClear').addEventListener('click', function () {
    pushUndo();
    S.design = blankDesign(S.size);
    buildGrid();
    commitDesign(false);
  });
  $('wsRandom').addEventListener('click', function () {
    pushUndo();
    S.design = randomDesign();
    buildGrid();
    commitDesign(false);
    const live = $('wsLive');
    if (live) live.textContent = LANG_KEY === 'zh' ? '已生成随机对称纹样' : 'Random symmetric design generated';
  });
}

/* ============================================================
   5 · 模块 2：挑花结本
   ============================================================ */

function renderDrafting() {
  const p = S.pattern;
  const n = p.w;
  $('drSize').textContent = n + ' × ' + p.h;
  const svg = $('huabenSvg');
  const NS = 'http://www.w3.org/2000/svg';
  const pad = 22, span = 360 - pad * 2;
  const step = span / n;
  svg.innerHTML = '';
  svg.setAttribute('viewBox', '0 0 360 360');

  const gRules = document.createElementNS(NS, 'g');
  // 经线（脚子线）
  for (let j = 0; j < n; j++) {
    const x = pad + (j + 0.5) * step;
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', x); line.setAttribute('x2', x);
    line.setAttribute('y1', pad - 8); line.setAttribute('y2', 360 - pad + 8);
    line.setAttribute('class', 'hb-warp');
    gRules.appendChild(line);
  }
  svg.appendChild(gRules);

  for (let i = 0; i < p.h; i++) {
    const y = pad + (i + 0.5) * step;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'hb-row' + (i === S.draftIndex ? ' cur' : ''));
    g.dataset.row = String(i);
    const wl = document.createElementNS(NS, 'line');
    wl.setAttribute('x1', pad - 8); wl.setAttribute('x2', 360 - pad + 8);
    wl.setAttribute('y1', y); wl.setAttribute('y2', y);
    wl.setAttribute('class', 'hb-weftline');
    g.appendChild(wl);
    for (let j = 0; j < n; j++) {
      const x = pad + (j + 0.5) * step;
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y);
      c.setAttribute('r', Math.max(1.8, step * 0.26));
      c.setAttribute('class', 'hb-knot' + (p.lift[i][j] === '1' ? '' : ' off'));
      g.appendChild(c);
    }
    svg.appendChild(g);
  }
  // 纬号
  for (let i = 0; i < p.h; i++) {
    if (n > 8 && i % 2 !== 0) continue;
    const y = pad + (i + 0.5) * step;
    const tx = document.createElementNS(NS, 'text');
    tx.setAttribute('x', 6);
    tx.setAttribute('y', y + 2.6);
    tx.setAttribute('class', 'hb-idx');
    tx.textContent = String(i + 1).padStart(2, '0');
    svg.appendChild(tx);
  }

  svg.onclick = function (e) {
    const g = e.target.closest ? e.target.closest('.hb-row') : null;
    if (!g) return;
    setDraftIndex(Number(g.dataset.row));
  };

  // 提沉编码列表
  const list = $('drCode');
  list.innerHTML = '';
  for (let i = 0; i < p.h; i++) {
    const li = el('li', i === S.draftIndex ? 'cur' : '');
    li.dataset.row = String(i);
    li.appendChild(el('span', 'ci', String(i + 1).padStart(2, '0')));
    const cb = el('span', 'cb');
    p.lift[i].split('').forEach(function (ch) {
      if (ch === '1') { const b = el('b', null, '1'); cb.appendChild(b); }
      else cb.appendChild(document.createTextNode('0'));
    });
    li.appendChild(cb);
    li.addEventListener('click', function () { setDraftIndex(i); });
    list.appendChild(li);
  }
  renderDraftReadout();
  updateDraftFocus();
}

function setDraftIndex(i) {
  const h = S.pattern.h;
  S.draftIndex = ((i % h) + h) % h;
  updateDraftFocus();
  renderDraftReadout();
}

function updateDraftFocus() {
  const rows = $('huabenSvg').querySelectorAll('.hb-row');
  rows.forEach(function (g) { g.classList.toggle('cur', Number(g.dataset.row) === S.draftIndex); });
  const items = $('drCode').children;
  for (let i = 0; i < items.length; i++) items[i].classList.toggle('cur', i === S.draftIndex);
  const cur = items[S.draftIndex];
  if (cur && cur.scrollIntoView) {
    const box = $('drCode');
    const top = cur.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 24) box.scrollTop = top - 8;
  }
  $('drIdx').textContent = String(S.draftIndex + 1).padStart(2, '0') + ' / ' + S.pattern.h;
}

function renderDraftReadout() {
  const p = S.pattern;
  const i = S.draftIndex;
  const row = p.lift[i];
  const cnt = row.split('1').length - 1;
  const cols = [];
  for (let j = 0; j < p.w; j++) if (p.color[i][j] > 0) cols.push(COLOR_META[COLOR_KEYS[p.color[i][j] - 1]][LANG_KEY]);
  const uniq = cols.filter(function (v, k) { return cols.indexOf(v) === k; });
  $('drCurrent').textContent = (LANG_KEY === 'zh'
    ? '第 ' + (i + 1) + ' 纬 · 提 ' + cnt + ' / ' + p.w + ' 位 · 彩纬：' + (uniq.length ? uniq.join('、') : '无')
    : 'Pick ' + (i + 1) + ' · raised ' + cnt + '/' + p.w + ' · colour wefts: ' + (uniq.length ? uniq.join(', ') : 'none'))
    + '  ·  ' + row;

  const kv = $('drKv');
  kv.innerHTML = '';
  const t0 = loomTiming(p, S.structure);
  const rows = [
    [LANG_KEY === 'zh' ? '花本总纬数' : 'Total picks', p.h],
    [LANG_KEY === 'zh' ? '每纬位数（经数）' : 'Ends per pick', p.w],
    [LANG_KEY === 'zh' ? '编码总位' : 'Total bits', p.h * p.w],
    [LANG_KEY === 'zh' ? '花位比例' : 'Raised share', (p.stats.liftRatio * 100).toFixed(1) + '%'],
    [LANG_KEY === 'zh' ? '本纬提花数' : 'Raised on this pick', cnt],
    [LANG_KEY === 'zh' ? '总投梭次数' : 'Shuttle passes', t0.totalShuttlePasses],
    [LANG_KEY === 'zh' ? '校验和' : 'Checksum', checksum(p)]
  ];
  rows.forEach(function (r) {
    kv.appendChild(el('dt', null, r[0]));
    kv.appendChild(el('dd', null, String(r[1])));
  });
}

function bindDrafting() {
  $('drPrev').addEventListener('click', function () { setDraftIndex(S.draftIndex - 1); });
  $('drNext').addEventListener('click', function () { setDraftIndex(S.draftIndex + 1); });
}

/* ============================================================
   6 · 模块 3：投梭织造
   ============================================================ */

/* ---------- 织物渲染 ----------
   纹样矩阵的 1 格 = 1 个织点（花本中的一位）；但真实织物上每一格仍由多根
   经纬交织而成，因此渲染时按 OVERSAMPLE 倍过采样，让地部呈现真实的细密织纹，
   而花部因彩纬浮长而成为整块色面——这正是妆花缎的观感。            */
const OVERSAMPLE = 2;

function drawThread(ctx, x, y, s, face, hex) {
  ctx.fillStyle = hex;
  ctx.fillRect(x, y, s, s);
  const a = Math.min(0.20, Math.max(0.07, s / 150));
  const g = face === 'warp'
    ? ctx.createLinearGradient(x, 0, x + s, 0)
    : ctx.createLinearGradient(0, y, 0, y + s);
  g.addColorStop(0, 'rgba(8,11,13,' + (a * 1.15).toFixed(3) + ')');
  g.addColorStop(0.44, 'rgba(255,255,255,' + a.toFixed(3) + ')');
  g.addColorStop(0.70, 'rgba(255,255,255,' + (a * 0.22).toFixed(3) + ')');
  g.addColorStop(1, 'rgba(8,11,13,' + (a * 1.25).toFixed(3) + ')');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, s, s);
  if (s >= 12) {
    ctx.strokeStyle = 'rgba(8,11,13,0.10)';
    ctx.lineWidth = Math.max(0.6, s * 0.03);
    const ts = [0.32, 0.68];
    for (let k = 0; k < 2; k++) {
      ctx.beginPath();
      if (face === 'warp') { ctx.moveTo(x + s * ts[k], y); ctx.lineTo(x + s * ts[k], y + s); }
      else { ctx.moveTo(x, y + s * ts[k]); ctx.lineTo(x + s, y + s * ts[k]); }
      ctx.stroke();
    }
  }
}

/**
 * 按过采样绘制织物。
 * opts: { x, y, size, k, threadRows }
 *   size = 目标区域边长（px）；k = 每织点的线程数；threadRows = 只画到第几根纬线
 */
function drawFabricArea(ctx, wv, opts) {
  const k = opts.k || 1;
  const W = wv.w * k, H = wv.h * k;
  const ts = opts.size / W;
  const rows = opts.threadRows === undefined ? H : Math.max(0, Math.min(H, opts.threadRows));
  const st = wv.structure;
  for (let ti = 0; ti < rows; ti++) {
    const i = Math.floor(ti / k);
    const y = opts.y + ti * ts;
    for (let tj = 0; tj < W; tj++) {
      const j = Math.floor(tj / k);
      const c = wv.cells[i][j];
      let face, hex;
      if (c.flower) {
        face = 'weft'; hex = COLOR_META[c.color].hex;
      } else {
        face = groundLift(st, ti, tj) ? 'warp' : 'weft';
        hex = face === 'warp' ? SILK.warp : SILK.weft;
      }
      drawThread(ctx, opts.x + tj * ts, y, ts + 0.6, face, hex);
      if (opts.highlightFace && !c.flower && face === 'weft') {
        ctx.fillStyle = 'rgba(28,63,82,0.34)';
        ctx.fillRect(opts.x + tj * ts, y, ts + 0.6, ts + 0.6);
      }
    }
  }
  return { thread: ts, W: W, H: H };
}

function renderWeave() {
  const cv = $('weaveCanvas');
  if (!cv || !S.pattern) return;
  const ctx = cv.getContext('2d');
  const wv = weaveSimulate(S.pattern, S.structure);
  const k = OVERSAMPLE;
  const n = S.pattern.w;
  const H = wv.h * k;
  const ts = cv.width / (wv.w * k);
  const shownDesign = Math.max(1, Math.min(wv.h, S.weave.progress));
  const shownThreads = shownDesign * k;

  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = '#0b0f12';
  ctx.fillRect(0, 0, cv.width, cv.height);

  // 织机上的裸经面：未织区域先露出经线，织物向下生长把经线盖住
  const threadW = cv.width / (wv.w * k);
  for (let tj = 0; tj < wv.w * k; tj += 1) {
    const a = 0.030 + (tj % k === 0 ? 0.022 : 0);
    ctx.fillStyle = 'rgba(196,214,222,' + a.toFixed(3) + ')';
    ctx.fillRect(tj * threadW, 0, Math.max(1, threadW * 0.46), cv.height);
  }

  drawFabricArea(ctx, wv, { x: 0, y: 0, size: cv.width, k: k, threadRows: shownThreads, highlightFace: S.weave.showFace });

  // 未织区域
  if (shownThreads < H) {
    ctx.fillStyle = 'rgba(8,11,13,0.34)';
    ctx.fillRect(0, shownThreads * ts, cv.width, (H - shownThreads) * ts);
    ctx.strokeStyle = 'rgba(230,194,90,0.62)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(0, shownThreads * ts + 0.5);
    ctx.lineTo(cv.width, shownThreads * ts + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
    // 织口处的综框阴影
    const gg = ctx.createLinearGradient(0, shownThreads * ts, 0, shownThreads * ts + 26);
    gg.addColorStop(0, 'rgba(230,194,90,0.16)');
    gg.addColorStop(1, 'rgba(8,11,13,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(0, shownThreads * ts, cv.width, 26);
  }
  // 高亮当前纬（一条纬 = k 根线程）
  if (S.weave.hlWeft) {
    const top = (shownThreads - k) * ts;
    ctx.strokeStyle = 'rgba(230,194,90,0.95)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, top + 1, cv.width - 2, k * ts - 2);
  }
  // 高亮当前经
  if (S.weave.hlWarp && S.weave.focus) {
    const j = S.weave.focus.j;
    ctx.strokeStyle = 'rgba(69,137,169,0.95)';
    ctx.lineWidth = 2;
    ctx.strokeRect(j * k * ts + 1, 1, k * ts - 2, cv.height - 2);
  }
  // 织点网格（仅在格子足够大时显示，帮助把织物与网格对应起来）
  if (ts * k >= 18) {
    ctx.strokeStyle = 'rgba(8,11,13,0.22)';
    ctx.lineWidth = 1;
    for (let j = 1; j < n; j++) {
      ctx.beginPath();
      ctx.moveTo(j * k * ts + 0.5, 0);
      ctx.lineTo(j * k * ts + 0.5, cv.height);
      ctx.stroke();
    }
  }
  renderLens(wv);
  renderWeaveMetrics(wv, shownDesign);
}

function renderLens(wv) {
  const lens = $('lensCanvas');
  if (!lens) return;
  const ctx = lens.getContext('2d');
  const k = 2;
  const R = 2;                       // 以织点为单位取 5×5 窗口
  const f = S.weave.focus || {
    i: Math.max(0, Math.min(wv.h - 1, S.weave.progress - 1)),
    j: Math.floor(wv.w / 2)
  };
  const cells = R * 2 + 1;
  const win = cells * k;             // 线程窗口边长
  const ts = lens.width / win;
  ctx.clearRect(0, 0, lens.width, lens.height);
  ctx.fillStyle = '#0b0f12';
  ctx.fillRect(0, 0, lens.width, lens.height);

  for (let ti = 0; ti < win; ti++) {
    for (let tj = 0; tj < win; tj++) {
      const di = Math.floor(ti / k) - R;
      const dj = Math.floor(tj / k) - R;
      const i = f.i + di, j = f.j + dj;
      const x = tj * ts, y = ti * ts;
      if (i < 0 || i >= wv.h || j < 0 || j >= wv.w || i >= Math.max(1, S.weave.progress)) {
        ctx.fillStyle = '#12181d';
        ctx.fillRect(x, y, ts, ts);
        continue;
      }
      const c = wv.cells[i][j];
      let face, hex;
      if (c.flower) { face = 'weft'; hex = COLOR_META[c.color].hex; }
      else {
        face = groundLift(wv.structure, f.i * k + ti, f.j * k + tj) ? 'warp' : 'weft';
        hex = face === 'warp' ? SILK.warp : SILK.weft;
      }
      drawThread(ctx, x, y, ts + 0.4, face, hex);
    }
  }
  // 织点边界 + 中心框
  ctx.strokeStyle = 'rgba(8,11,13,0.45)';
  ctx.lineWidth = 1;
  for (let t = 0; t <= cells; t++) {
    ctx.beginPath(); ctx.moveTo(t * k * ts + 0.5, 0); ctx.lineTo(t * k * ts + 0.5, lens.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, t * k * ts + 0.5); ctx.lineTo(lens.width, t * k * ts + 0.5); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(230,194,90,0.9)';
  ctx.lineWidth = 2;
  ctx.strokeRect(R * k * ts + 1, R * k * ts + 1, k * ts - 2, k * ts - 2);
}

function renderWeaveMetrics(wv, shown) {
  const kv = $('wvKv');
  kv.innerHTML = '';
  const rows = [
    [LANG_KEY === 'zh' ? '组织' : 'Weave', STRUCTURES[wv.structure][LANG_KEY]],
    [LANG_KEY === 'zh' ? '组织循环' : 'Repeat', wv.period],
    [LANG_KEY === 'zh' ? '地综片数' : 'Ground frames', wv.stats.frames],
    [LANG_KEY === 'zh' ? '已织纬数' : 'Picks shown', shown + ' / ' + wv.h],
    [LANG_KEY === 'zh' ? '经浮点' : 'Warp-face cells', wv.stats.warpFace],
    [LANG_KEY === 'zh' ? '纬浮点' : 'Weft-face cells', wv.stats.weftFace],
    [LANG_KEY === 'zh' ? '花部彩纬点' : 'Figure cells', wv.stats.flowerCells],
    [LANG_KEY === 'zh' ? '经浮比' : 'Warp-face share', (wv.stats.warpFaceRatio * 100).toFixed(1) + '%'],
    [LANG_KEY === 'zh' ? '最大经浮长' : 'Max warp float', wv.stats.maxWarpFloat],
    [LANG_KEY === 'zh' ? '最大纬浮长' : 'Max weft float', wv.stats.maxWeftFloat],
    [LANG_KEY === 'zh' ? '平均浮长' : 'Mean float', wv.stats.meanFloat.toFixed(2)]
  ];
  rows.forEach(function (r) {
    kv.appendChild(el('dt', null, r[0]));
    kv.appendChild(el('dd', null, String(r[1])));
  });

  const lg = $('wvLegend');
  lg.innerHTML = '';
  const items = [
    [SILK.warp, LANG_KEY === 'zh' ? '经浮' : 'warp face'],
    [SILK.weft, LANG_KEY === 'zh' ? '纬浮（地）' : 'weft face (ground)'],
    ['#b8860b', LANG_KEY === 'zh' ? '花部彩纬' : 'colour weft'],
    ['#2f6b8a', LANG_KEY === 'zh' ? '高亮' : 'highlight']
  ];
  items.forEach(function (it) {
    const s = el('span');
    const i2 = document.createElement('i');
    i2.style.background = it[0];
    s.appendChild(i2);
    s.appendChild(document.createTextNode(it[1]));
    lg.appendChild(s);
  });
  const live = $('wvLive');
  if (live) {
    live.textContent = LANG_KEY === 'zh'
      ? '已织 ' + shown + ' 纬，共 ' + wv.h + ' 纬；最大纬浮长 ' + wv.stats.maxWeftFloat + '。'
      : 'Woven ' + shown + ' of ' + wv.h + ' picks; maximum weft float ' + wv.stats.maxWeftFloat + '.';
  }
}

function renderStructures() {
  const host = $('wvStructures');
  host.innerHTML = '';
  STRUCTURE_ORDER.forEach(function (id) {
    const b = el('button', 'seg-btn' + (S.structure === id ? ' on' : ''), STRUCTURES[id][LANG_KEY]);
    b.type = 'button';
    b.dataset.structure = id;
    b.setAttribute('aria-pressed', S.structure === id ? 'true' : 'false');
    b.title = pick(STRUCTURES[id].desc);
    b.addEventListener('click', function () {
      S.structure = id;
      renderStructures();
      S.weave.progress = 0;
      S.weave.playing = false;
      syncPlayButton();
      renderWeave();
      renderDraftReadout();
      renderTeach();
    });
    host.appendChild(b);
  });
}

function syncPlayButton() {
  const b = $('wvPlay');
  if (!b) return;
  b.textContent = S.weave.playing ? t('wv_pause') : t('wv_play');
  b.setAttribute('aria-pressed', S.weave.playing ? 'true' : 'false');
}

function weaveTick() {
  const h = S.pattern.h;
  if (S.weave.progress >= h) {
    S.weave.playing = false;
    stopTimer();
    syncPlayButton();
    return;
  }
  S.weave.progress++;
  renderWeave();
  if (S.weave.progress >= h) {
    S.weave.playing = false;
    stopTimer();
    syncPlayButton();
  }
}

function stopTimer() {
  if (S.weave.timer) { clearInterval(S.weave.timer); S.weave.timer = null; }
}

function startTimer() {
  stopTimer();
  const delay = Math.round(1100 / Math.max(1, S.weave.speed));
  S.weave.timer = setInterval(weaveTick, delay);
}

function bindWeaving() {
  renderStructures();
  $('wvPlay').addEventListener('click', function () {
    if (S.weave.playing) {
      S.weave.playing = false;
      stopTimer();
    } else {
      if (S.weave.progress >= S.pattern.h) S.weave.progress = 0;
      S.weave.playing = true;
      startTimer();
    }
    syncPlayButton();
    renderWeave();
  });
  $('wvStep').addEventListener('click', function () {
    S.weave.playing = false;
    stopTimer();
    syncPlayButton();
    if (S.weave.progress >= S.pattern.h) S.weave.progress = 0;
    weaveTick();
  });
  $('wvReset').addEventListener('click', function () {
    S.weave.playing = false;
    stopTimer();
    S.weave.progress = 0;
    syncPlayButton();
    renderWeave();
  });
  $('wvSpeed').addEventListener('input', function (e) {
    S.weave.speed = Number(e.target.value);
    if (S.weave.playing) startTimer();
  });
  $('wvHlWeft').addEventListener('change', function (e) {
    S.weave.hlWeft = e.target.checked;
    renderWeave();
  });
  $('wvHlWarp').addEventListener('change', function (e) {
    S.weave.hlWarp = e.target.checked;
    renderWeave();
  });
  $('wvWarpFace').addEventListener('change', function (e) {
    S.weave.showFace = e.target.checked;
    renderWeave();
  });
  $('weaveCanvas').addEventListener('click', function (e) {
    const cv = e.currentTarget;
    const r = cv.getBoundingClientRect();
    const n = S.pattern.w;
    const j = Math.max(0, Math.min(n - 1, Math.floor((e.clientX - r.left) / r.width * n)));
    const i = Math.max(0, Math.min(S.pattern.h - 1, Math.floor((e.clientY - r.top) / r.height * n)));
    S.weave.focus = { i: i, j: j };
    S.weave.hlWarp = true;
    $('wvHlWarp').checked = true;
    renderWeave();
  });
}

/* ============================================================
   7 · 模块 4：五态同构
   ============================================================ */

function renderFive() {
  const bits = designToBits(S.design);
  renderFiveFlower(bits);
  renderFiveCard(bits);
  renderFiveTape(bits);
  renderFiveBinary(bits);
  renderFivePixels(bits);
  applyFiveView();
  if (S.sync) highlightBit(S.sync, true);
}

function bitsEqual(bits) { return bits; }

function renderFiveFlower(bits) {
  const host = $('fvFlower');
  const NS = 'http://www.w3.org/2000/svg';
  const n = bits.w;
  const side = 240;
  const pad = 12, span = side - pad * 2, step = span / n;
  host.innerHTML = '';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + side + ' ' + side);
  svg.setAttribute('class', 'fv-flower-svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  for (let j = 0; j < n; j++) {
    const l = document.createElementNS(NS, 'line');
    const x = pad + (j + 0.5) * step;
    l.setAttribute('x1', x); l.setAttribute('x2', x);
    l.setAttribute('y1', pad * 0.4); l.setAttribute('y2', side - pad * 0.4);
    l.setAttribute('class', 'fl-warp');
    svg.appendChild(l);
  }
  for (let i = 0; i < n; i++) {
    const y = pad + (i + 0.5) * step;
    const l = document.createElementNS(NS, 'line');
    l.setAttribute('x1', pad * 0.4); l.setAttribute('x2', side - pad * 0.4);
    l.setAttribute('y1', y); l.setAttribute('y2', y);
    l.setAttribute('class', 'fl-weft');
    svg.appendChild(l);
    for (let j = 0; j < n; j++) {
      const x = pad + (j + 0.5) * step;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'bit');
      g.setAttribute('data-bit', i + '-' + j);
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '-1');
      g.setAttribute('aria-label', bitLabel(i, j, bits.rows[i][j]));
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', x); dot.setAttribute('cy', y);
      dot.setAttribute('r', Math.max(1.1, step * 0.22));
      dot.setAttribute('class', 'fl-knot' + (bits.rows[i][j] === '1' ? '' : ' sink'));
      g.appendChild(dot);
      const hit = document.createElementNS(NS, 'circle');
      hit.setAttribute('cx', x); hit.setAttribute('cy', y);
      hit.setAttribute('r', Math.max(3, step * 0.46));
      hit.setAttribute('fill', 'transparent');
      g.appendChild(hit);
      svg.appendChild(g);
    }
  }
  host.appendChild(svg);
  void bitsEqual;
}

function renderFiveCard(bits) {
  const host = $('fvCard');
  host.innerHTML = '';
  const wrap = el('div', 'card-grid');
  wrap.style.setProperty('--n', String(bits.w));
  wrap.style.gridTemplateColumns = '1fr';
  for (let i = 0; i < bits.h; i++) {
    const row = el('div', 'cd');
    row.style.gridTemplateColumns = 'repeat(' + bits.w + ', minmax(0, 1fr))';
    for (let j = 0; j < bits.w; j++) {
      const d = el('div', 'hole bit' + (bits.rows[i][j] === '1' ? ' punched' : ''));
      d.dataset.bit = i + '-' + j;
      d.setAttribute('role', 'img');
      d.setAttribute('aria-label', bitLabel(i, j, bits.rows[i][j]));
      row.appendChild(d);
    }
    wrap.appendChild(row);
  }
  host.appendChild(wrap);
}

/* 纸带按"真实长带折作数段"铺开：每段 8 通道 × perRun 位，
   段数 R 由 ⌈√(总列数/通道数)⌉ 定，使整条带子在面板里接近方形，
   与其余四态（16×16 方阵 / 16 行位串）的视觉密度相当。 */
function tapeRuns(bits, lanes) {
  const L = lanes || 8;
  const cols = Math.ceil(bits.w * bits.h / L);
  const R = Math.max(1, Math.round(Math.sqrt(cols / L)));
  return { lanes: L, cols: cols, runs: R, perRun: Math.ceil(cols / R) };
}

function renderFiveTape(bits) {
  const host = $('fvTape');
  host.innerHTML = '';
  const layout = tapeLayout(bits, 8);
  const L = layout.lanes;
  const info = tapeRuns(bits, L);
  const map = {};
  layout.cells.forEach(function (c) { map[c.lane + ':' + c.col] = c; });

  const strip = el('div', 'tape-strip');
  for (let run = 0; run < info.runs; run++) {
    const wrap = el('div', 'tape-run');
    // 通道号（1…8）：真纸带的通道标尺，对齐每一行孔位
    const gutter = el('div', 'tape-lanes');
    gutter.setAttribute('aria-hidden', 'true');
    for (let lane = 0; lane < L; lane++) gutter.appendChild(el('span', null, String(lane + 1)));
    wrap.appendChild(gutter);

    const cells = el('div', 'tape-cells');
    cells.style.gridTemplateColumns = 'repeat(' + info.perRun + ', minmax(0, 1fr))';
    for (let lane = 0; lane < L; lane++) {
      for (let k = 0; k < info.perRun; k++) {
        const c = map[lane + ':' + (run * info.perRun + k)];
        const d = el('div', 'tp' + (c && c.bit === '1' ? ' punched' : '') + (c ? '' : ' tp-empty'));
        if (c) {
          d.classList.add('bit');
          d.dataset.bit = c.i + '-' + c.j;
          d.setAttribute('role', 'img');
          d.setAttribute('aria-label', bitLabel(c.i, c.j, c.bit));
        } else {
          d.setAttribute('aria-hidden', 'true');
        }
        cells.appendChild(d);
      }
    }
    wrap.appendChild(cells);
    strip.appendChild(wrap);
    if (run < info.runs - 1) {
      const fold = el('div', 'tape-fold');
      fold.setAttribute('aria-hidden', 'true');
      fold.appendChild(el('span', null, LANG_KEY === 'zh' ? '折返' : 'fold'));
      strip.appendChild(fold);
    }
  }
  host.appendChild(strip);
  // 说明文字按实际分段数如实生成（8×8 单段 / 16×16 折返两段）
  const note = document.querySelector('.fv-cell[data-modality="tape"] .fv-note');
  if (note) {
    note.textContent = LANG_KEY === 'zh'
      ? '八通道 · 孔距 2.54 mm' + (info.runs > 1 ? ' · 折返成 ' + info.runs + ' 段' : ' · 单段读取')
      : '8 channels · 2.54 mm pitch' + (info.runs > 1 ? ' · folded into ' + info.runs + ' runs' : ' · single run');
  }
}

function renderFiveBinary(bits) {
  const host = $('fvBinary');
  host.innerHTML = '';
  const list = el('div', 'bin-list');
  for (let i = 0; i < bits.h; i++) {
    const row = el('div', 'row');
    for (let j = 0; j < bits.w; j++) {
      const ch = bits.rows[i][j];
      const b = el('span', 'b bit' + (ch === '1' ? ' one' : ''), ch);
      b.dataset.bit = i + '-' + j;
      b.setAttribute('role', 'img');
      b.setAttribute('aria-label', bitLabel(i, j, ch));
      row.appendChild(b);
    }
    list.appendChild(row);
  }
  host.appendChild(list);
}

function renderFivePixels(bits) {
  const host = $('fvPixels');
  host.innerHTML = '';
  const grid = el('div', 'px-grid');
  grid.style.gridTemplateColumns = 'repeat(' + bits.w + ', minmax(0, 1fr))';
  for (let i = 0; i < bits.h; i++) {
    for (let j = 0; j < bits.w; j++) {
      const d = el('div', 'px bit' + (bits.rows[i][j] === '1' ? ' lit' : ''));
      d.dataset.bit = i + '-' + j;
      d.setAttribute('role', 'img');
      d.setAttribute('aria-label', bitLabel(i, j, bits.rows[i][j]));
      grid.appendChild(d);
    }
  }
  host.appendChild(grid);
}

function bitLabel(i, j, bit) {
  const c = S.pattern && S.pattern.color[i] && S.pattern.color[i][j];
  const col = c > 0 ? COLOR_META[COLOR_KEYS[c - 1]][LANG_KEY] : (LANG_KEY === 'zh' ? '地部' : 'ground');
  return (LANG_KEY === 'zh'
    ? '第 ' + (i + 1) + ' 纬 第 ' + (j + 1) + ' 经，' + (bit === '1' ? '提' : '沉') + '，' + col
    : 'pick ' + (i + 1) + ', end ' + (j + 1) + ': ' + (bit === '1' ? 'raised' : 'sunk') + ', ' + col);
}

function highlightBit(key, silent) {
  const grid = $('fvGrid');
  if (!grid || typeof key !== 'string') return;
  const parts = key.split('-');
  const i = Number(parts[0]), j = Number(parts[1]);
  if (!Number.isInteger(i) || !Number.isInteger(j)) return;
  if (i < 0 || j < 0 || i >= S.pattern.h || j >= S.pattern.w) return;
  const nodes = grid.querySelectorAll('[data-bit]');
  for (let k = 0; k < nodes.length; k++) {
    const n = nodes[k];
    n.classList.toggle('on', n.dataset.bit === key);
    n.setAttribute('aria-current', n.dataset.bit === key ? 'true' : 'false');
  }
  const bit = S.pattern.lift[i][j];
  const ci = S.pattern.color[i][j];
  const colName = ci > 0 ? COLOR_META[COLOR_KEYS[ci - 1]][LANG_KEY] : (LANG_KEY === 'zh' ? '地部（无彩纬）' : 'ground');
  $('fvCoord').textContent = LANG_KEY === 'zh'
    ? '第 ' + (i + 1) + ' 纬 · 第 ' + (j + 1) + ' 经 · ' + (bit === '1' ? '提 (1)' : '沉 (0)') + ' · ' + colName
    : 'pick ' + (i + 1) + ' · end ' + (j + 1) + ' · ' + (bit === '1' ? 'raised (1)' : 'sunk (0)') + ' · ' + colName;

  // 只有被点击的那一态获得"来源"描边，其余四态同步高亮同一位
  const cells = grid.querySelectorAll('.fv-cell');
  for (let k = 0; k < cells.length; k++) {
    cells[k].classList.toggle('active', !!S.syncSource && cells[k].dataset.modality === S.syncSource);
  }
  grid.setAttribute('data-sync', key);
  if (!silent) $('fvReadout').setAttribute('data-sync', key);
}

/** 预选第一个花位，让五态联动一进场就有可看的内容 */
function firstFlowerBit() {
  const p = S.pattern;
  for (let i = 0; i < p.h; i++) {
    const k = p.lift[i].indexOf('1');
    if (k >= 0) return i + '-' + k;
  }
  return '0-0';
}

function applyFiveView() {
  const grid = $('fvGrid');
  if (grid) grid.dataset.view = S.fiveView;
}

function bindFive() {
  const grid = $('fvGrid');
  grid.addEventListener('click', function (e) {
    const node = e.target.closest('[data-bit]');
    if (!node) return;
    const cell = node.closest('.fv-cell');
    S.syncSource = cell ? cell.dataset.modality : null;
    S.sync = node.dataset.bit;
    highlightBit(S.sync, false);
  });
  document.querySelectorAll('.fv-toolbar .seg-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      S.fiveView = b.dataset.view;
      document.querySelectorAll('.fv-toolbar .seg-btn').forEach(function (x) { x.classList.toggle('on', x === b); });
      applyFiveView();
    });
  });
  $('fvRandom').addEventListener('click', function () {
    const i = Math.floor(Math.random() * S.pattern.h);
    const j = Math.floor(Math.random() * S.pattern.w);
    S.syncSource = ['flower', 'card', 'tape', 'binary', 'pixels'][Math.floor(Math.random() * 5)];
    S.sync = i + '-' + j;
    highlightBit(S.sync, false);
  });
}

/* ============================================================
   8 · 模块 5：织物库
   ============================================================ */

/* 织物库缩略图的内部分辨率：按卡片宽度自适应放大后仍是 1.5–2 倍过采样，不糊 */
const LB_THUMB_SIZE = 360;

function renderLibrary() {
  const host = $('lbList');
  host.innerHTML = '';
  PATTERNS.forEach(function (p, idx) {
    const design = designFromRows(p.map);
    const pattern = compileToPattern(design);
    const wv = weaveSimulate(pattern, 'satin5');

    const row = el('div', 'lb-row');
    const thumbs = el('div', 'lb-thumbs');

    const c1 = document.createElement('canvas');
    c1.width = LB_THUMB_SIZE; c1.height = LB_THUMB_SIZE;
    const t1 = el('div', 'lb-thumb');
    t1.appendChild(c1);
    t1.appendChild(el('span', null, LANG_KEY === 'zh' ? '纹样' : 'design'));

    const c2 = document.createElement('canvas');
    c2.width = LB_THUMB_SIZE; c2.height = LB_THUMB_SIZE;
    const t2 = el('div', 'lb-thumb');
    t2.appendChild(c2);
    t2.appendChild(el('span', null, LANG_KEY === 'zh' ? '花本' : 'pattern book'));

    const c3 = document.createElement('canvas');
    c3.width = LB_THUMB_SIZE; c3.height = LB_THUMB_SIZE;
    const t3 = el('div', 'lb-thumb');
    t3.appendChild(c3);
    t3.appendChild(el('span', null, LANG_KEY === 'zh' ? '织物' : 'fabric'));

    thumbs.appendChild(t1); thumbs.appendChild(t2); thumbs.appendChild(t3);

    paintDesignThumb(c1, design);
    paintHuabenThumb(c2, pattern);
    paintFabricThumb(c3, wv);

    const body = el('div', 'lb-body');
    const h3 = el('h3');
    h3.appendChild(document.createTextNode('0' + (idx + 1) + ' · ' + (p[LANG_KEY] || p.zh)));
    h3.appendChild(el('em', null, p.en));
    body.appendChild(h3);

    const meta = el('div', 'lb-meta');
    meta.appendChild(el('span', null, (LANG_KEY === 'zh' ? '品类 ' : 'class ') + (LANG_KEY === 'zh' ? p.band : p.bandEn)));
    meta.appendChild(el('span', null, (LANG_KEY === 'zh' ? '花位 ' : 'raised ') + pattern.stats.flowers + '/' + pattern.stats.total));
    meta.appendChild(el('span', null, (LANG_KEY === 'zh' ? '校验和 ' : 'checksum ') + checksum(pattern)));
    body.appendChild(meta);

    body.appendChild(el('p', null, pick({ zh: p.zhDesc, en: p.enDesc })));

    const btn = el('button', 'btn btn-sm', LANG_KEY === 'zh' ? '载入工坊 →' : 'Load into workshop →');
    btn.type = 'button';
    btn.addEventListener('click', function () {
      loadDesignIntoWorkshop(design);
      document.getElementById('workshop').scrollIntoView({ behavior: S.reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
    body.appendChild(btn);

    row.appendChild(thumbs);
    row.appendChild(body);
    host.appendChild(row);
  });
}

function paintHuabenThumb(canvas, pattern) {
  const ctx = canvas.getContext('2d');
  const n = pattern.w;
  const cell = canvas.width / n;
  ctx.fillStyle = '#0b0f12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(47,107,138,0.55)';
  ctx.lineWidth = 1;
  for (let j = 0; j < n; j++) {
    const x = (j + 0.5) * cell;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let i = 0; i < n; i++) {
    const y = (i + 0.5) * cell;
    ctx.strokeStyle = 'rgba(38,48,56,0.9)';
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    for (let j = 0; j < n; j++) {
      if (pattern.lift[i][j] !== '1') continue;
      ctx.fillStyle = '#d4a017';
      ctx.beginPath();
      ctx.arc((j + 0.5) * cell, y, Math.max(1, cell * 0.26), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function paintFabricThumb(canvas, wv) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0b0f12';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawFabricArea(ctx, wv, { x: 0, y: 0, size: canvas.width, k: 2 });
}

/* ============================================================
   9 · 模块 6：织造时间线
   ============================================================ */

function renderTimeline() {
  const host = $('tlTrack');
  host.innerHTML = '';
  TIMELINE.forEach(function (node, idx) {
    const row = el('div', 'tl-node' + (idx === S.tlIndex ? ' cur' : ''));
    row.dataset.idx = String(idx);

    // 左列 = 中国轨：卡片标题用"同一时期的中国"，缺省回落到节点名
    const cnCard = node.cnCard ? pick(node.cnCard) : node.zh;
    const left = el('button', 'tl-side');
    left.type = 'button';
    left.appendChild(el('span', 'era', node.era));
    left.appendChild(el('span', 'nm', cnCard));
    left.setAttribute('aria-label', (LANG_KEY === 'zh' ? '中国轨 ' : 'China track ') + node.era + ' ' + cnCard);

    const axis = el('div', 'tl-axis');
    const dot = el('button', 'tl-dot');
    dot.type = 'button';
    dot.setAttribute('aria-label', (LANG_KEY === 'zh' ? '选择节点 ' : 'Select node ') + (idx + 1) + '：' + node.zh);
    axis.appendChild(dot);

    const right = el('button', 'tl-side west');
    right.type = 'button';
    const westTitle = LANG_KEY === 'zh' ? node.west.title : (node.west.titleEn || node.west.title);
    right.appendChild(el('span', 'era', LANG_KEY === 'zh' ? node.eraEn : node.eraEn));
    right.appendChild(el('span', 'nm', westTitle));
    right.setAttribute('aria-label', (LANG_KEY === 'zh' ? '西方轨 ' : 'World track ') + node.era + ' ' + westTitle);

    [left, dot, right].forEach(function (b) {
      b.addEventListener('click', function () { selectTimeline(idx, true); });
    });

    row.appendChild(left);
    row.appendChild(axis);
    row.appendChild(right);
    host.appendChild(row);
  });
  renderTimelineDetail();
}

function selectTimeline(idx, scroll) {
  const n = TIMELINE.length;
  S.tlIndex = ((idx % n) + n) % n;
  const rows = $('tlTrack').children;
  for (let i = 0; i < rows.length; i++) rows[i].classList.toggle('cur', i === S.tlIndex);
  $('tlIdx').textContent = String(S.tlIndex + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
  renderTimelineDetail();
  if (scroll) {
    const box = $('tlDetail');
    if (box && box.scrollIntoView) box.scrollIntoView({ behavior: S.reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  }
}

function renderTimelineDetail() {
  const node = TIMELINE[S.tlIndex];
  const host = $('tlDetail');
  host.innerHTML = '';

  const head = el('div');
  head.appendChild(el('span', 'tl-era', node.era + '  ·  ' + node.eraEn));
  const h3 = el('h3');
  h3.textContent = LANG_KEY === 'zh' ? node.zh : (node.en || node.zh);
  if (LANG_KEY === 'zh') h3.appendChild(el('em', 'mono', '  ' + node.en));
  head.appendChild(h3);
  head.appendChild(el('div', 'tl-link', pick(node.link)));
  host.appendChild(head);

  const cols = el('div', 'tl-cols');
  const cnTitle = LANG_KEY === 'zh' ? node.cn.title : (node.cn.titleEn || node.cn.title);
  const cnBody = LANG_KEY === 'zh' ? node.cn.body : (node.cn.en || node.cn.body);
  const westTitle = LANG_KEY === 'zh' ? node.west.title : (node.west.titleEn || node.west.title);
  const westBody = LANG_KEY === 'zh' ? node.west.body : (node.west.en || node.west.body);

  const c1 = el('div', 'tl-col');
  c1.appendChild(el('h4', null, LANG_KEY === 'zh' ? '中国轨 · CHINA' : 'CHINA'));
  c1.appendChild(el('p', null, cnTitle));
  c1.appendChild(el('p', null, cnBody));
  c1.appendChild(el('p', 'tl-src', (LANG_KEY === 'zh' ? '来源类别：' : 'Source category: ') + node.cn.source));
  cols.appendChild(c1);

  const c2 = el('div', 'tl-col');
  c2.appendChild(el('h4', null, LANG_KEY === 'zh' ? '西方轨 · WEST' : 'WEST'));
  c2.appendChild(el('p', null, westTitle));
  c2.appendChild(el('p', null, westBody));
  c2.appendChild(el('p', 'tl-src', (LANG_KEY === 'zh' ? '来源类别：' : 'Source category: ') + node.west.source));
  cols.appendChild(c2);

  host.appendChild(cols);
  host.appendChild(el('p', 'tl-src', (LANG_KEY === 'zh' ? '编码介质形态：' : 'Coding medium: ') + pick(node.code)));
  $('tlIdx').textContent = String(S.tlIndex + 1).padStart(2, '0') + ' / ' + String(TIMELINE.length).padStart(2, '0');
}

function bindTimeline() {
  $('tlPrev').addEventListener('click', function () { selectTimeline(S.tlIndex - 1, true); });
  $('tlNext').addEventListener('click', function () { selectTimeline(S.tlIndex + 1, true); });
  document.addEventListener('keydown', function (e) {
    const sec = document.getElementById('timeline');
    if (!sec) return;
    const r = sec.getBoundingClientRect();
    const inView = r.top < window.innerHeight * 0.75 && r.bottom > window.innerHeight * 0.25;
    if (!inView) return;
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === 'ArrowLeft') { selectTimeline(S.tlIndex - 1, false); e.preventDefault(); }
    if (e.key === 'ArrowRight') { selectTimeline(S.tlIndex + 1, false); e.preventDefault(); }
  });
}

/* ============================================================
   10 · 模块 7：术语库
   ============================================================ */

function renderTermChips() {
  const host = $('tmChips');
  host.innerHTML = '';
  const all = el('button', 'chip' + (S.termCat === 'all' ? ' on' : ''), LANG_KEY === 'zh' ? '全部' : 'All');
  all.type = 'button';
  all.dataset.cat = 'all';
  all.addEventListener('click', function () { S.termCat = 'all'; renderTermChips(); renderTerms(); });
  host.appendChild(all);
  TERM_CATS.forEach(function (c) {
    const n = TERMS.filter(function (x) { return x.cat === c.key; }).length;
    const b = el('button', 'chip' + (S.termCat === c.key ? ' on' : ''), c[LANG_KEY] + ' ' + n);
    b.type = 'button';
    b.dataset.cat = c.key;
    b.addEventListener('click', function () { S.termCat = c.key; renderTermChips(); renderTerms(); });
    host.appendChild(b);
  });
}

function renderTerms() {
  const host = $('tmList');
  const q = S.termQuery.trim().toLowerCase();
  const list = TERMS.filter(function (x) {
    if (S.termCat !== 'all' && x.cat !== S.termCat) return false;
    if (!q) return true;
    return (x.zh + ' ' + x.en + ' ' + (x.note || '') + ' ' + (x.noteEn || '')).toLowerCase().indexOf(q) >= 0;
  });
  host.innerHTML = '';
  list.forEach(function (x) {
    const item = el('div', 'tm-item');
    const head = el('div', 'tm-head');
    const primary = LANG_KEY === 'zh' ? x.zh : x.en;
    const second = LANG_KEY === 'zh' ? x.en : x.zh;
    head.appendChild(el('span', 'tm-zh', primary));
    head.appendChild(el('span', 'tm-en', second));
    const cat = TERM_CATS.filter(function (c) { return c.key === x.cat; })[0];
    head.appendChild(el('span', 'tm-cat', cat ? cat[LANG_KEY] : x.cat));
    item.appendChild(head);
    item.appendChild(el('p', 'tm-note', LANG_KEY === 'zh' ? (x.note || x.noteEn || '') : (x.noteEn || x.note || '')));
    host.appendChild(item);
  });
  $('tmCount').textContent = (LANG_KEY === 'zh'
    ? '显示 ' + list.length + ' / 共 ' + TERMS.length + ' 条'
    : list.length + ' of ' + TERMS.length + ' terms');
  $('tmEmpty').hidden = list.length > 0;
}

function bindTerms() {
  $('tmSearch').addEventListener('input', function (e) {
    S.termQuery = e.target.value;
    renderTerms();
  });
}

/* ============================================================
   11 · 模块 8：教学包
   ============================================================ */

function teachHuabenRows() { return huabenRows(S.pattern); }
function teachTimingRows() { return timingRows(S.pattern, S.structure); }

function download(filename, text, mime) {
  const blob = new Blob(['\ufeff' + text], { type: (mime || 'text/plain') + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
}

function stamp() {
  const d = new Date();
  const p = function (n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes());
}

/**
 * 教学包预览：把可视内容区锁成整数行。
 * CSS 里 --cp-lines 给出行数，这里再按滚动条的实际占用（覆盖式 0px / 经典式约 10–17px）
 * 微调，使末行永远是完整的一行，不会被容器切成半行；同时给出明确的可滚动提示。
 */
function fitTeachPreview() {
  const pre = $('tcPreview');
  if (!pre) return;
  const cs = getComputedStyle(pre);
  const lh = parseFloat(cs.lineHeight);
  if (!(lh > 0)) return;
  const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  const borY = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
  const lines = parseFloat(cs.getPropertyValue('--cp-lines')) || 16;
  const barH = function () {
    return Math.max(0, pre.offsetHeight - pre.clientHeight - borY);
  };

  // 1) 先放开高度，量出横向滚动条真实占位
  pre.style.maxHeight = 'none';
  let bar = barH();
  // 2) 内容区高度 = 整数行
  pre.style.maxHeight = (lines * lh + padY + borY + bar) + 'px';
  // 3) 竖向滚动条出现后可能新增横向滚动条，复核一次
  const bar2 = barH();
  if (bar2 !== bar) {
    pre.style.maxHeight = (lines * lh + padY + borY + bar2) + 'px';
  }

  // 4) 「可滚动」的文字提示（覆盖式滚动条在静止时看不见，文字提示必须有）
  const note = $('tcPreviewNote');
  if (!note) return;
  const total = pre.textContent.split('\n').length;
  const visible = Math.max(1, Math.round((pre.clientHeight - padY) / lh));
  const rest = total - visible;
  const hOver = pre.scrollWidth - pre.clientWidth > 24;   // 宽表需要横向滚动
  if (rest > 0) {
    note.innerHTML = '';
    note.appendChild(document.createTextNode('↕ '));
    note.appendChild(el('b', null, LANG_KEY === 'zh' ? '可滚动' : 'scrollable'));
    note.appendChild(document.createTextNode(LANG_KEY === 'zh'
      ? ' — 共 ' + total + ' 行，当前显示 ' + visible + ' 行，向下滚动查看余下 ' + rest + ' 行'
        + (hOver ? '（宽表也可左右滚动）' : '') + '；导出按钮可取完整文件。'
      : ' — ' + total + ' lines, ' + visible + ' shown; scroll for the other ' + rest
        + (hOver ? ' (or scroll sideways for the wide table)' : '') + '. The export buttons give the whole file.'));
  } else {
    note.textContent = LANG_KEY === 'zh'
      ? '✓ 共 ' + total + ' 行，已全部显示。'
      : '✓ All ' + total + ' lines are shown.';
  }
}

function renderTeach() {
  const rows = teachTimingRows();
  let md = toMarkdown(rows, LANG_KEY === 'zh'
    ? '织造时序表（' + STRUCTURES[S.structure].zh + '，' + S.pattern.w + '×' + S.pattern.h + '）'
    : 'Weaving schedule (' + STRUCTURES[S.structure].en + ', ' + S.pattern.w + '×' + S.pattern.h + ')');
  const hb = toMarkdown(teachHuabenRows(), LANG_KEY === 'zh' ? '花本表' : 'Pattern-book table');
  $('tcPreview').textContent = hb + '\n' + md;
  fitTeachPreview();

  const notes = $('tcNotes');
  notes.innerHTML = '';
  const items = LANG_KEY === 'zh' ? [
    '<b>花本表</b>：每纬一行，0/1 为经线提沉；末列为该纬提花数。',
    '<b>织造时序表</b>：地综提升（片号）、花部提沉串、彩纬配色位、投梭顺序与最终经线提升。',
    '<b>CSV</b> 带 UTF-8 BOM，Excel 直接双击不乱码。',
    '<b>Markdown</b> 表格可直接粘进教案或题注。',
    '所有导出均在浏览器本地生成，不上传任何数据。'
  ] : [
    '<b>Pattern-book table</b>: one row per pick, 0/1 for warp lift, last column counts raised ends.',
    '<b>Weaving schedule</b>: ground heddle frames, figure lift string, colour wefts, shuttle order and final lift.',
    '<b>CSV</b> is written with a UTF-8 BOM so Excel opens it without mojibake.',
    '<b>Markdown</b> tables paste straight into a lesson plan or a caption.',
    'Every export is generated in the browser; nothing is uploaded.'
  ];
  items.forEach(function (h) {
    const li = document.createElement('li');
    li.innerHTML = h;
    notes.appendChild(li);
  });
}

function bindTeach() {
  $('tcCsvHuaben').addEventListener('click', function () {
    download('huaben-' + S.pattern.w + 'x' + S.pattern.h + '-1-' + stamp() + '.csv', toCSV(teachHuabenRows()), 'text/csv');
    $('tcStatus').textContent = LANG_KEY === 'zh' ? '已导出花本表 CSV（UTF-8 BOM）' : 'Pattern book CSV exported (UTF-8 BOM)';
  });
  $('tcCsvTiming').addEventListener('click', function () {
    download('loomtiming-' + STRUCTURES[S.structure].id + '-1-' + stamp() + '.csv', toCSV(teachTimingRows()), 'text/csv');
    $('tcStatus').textContent = LANG_KEY === 'zh' ? '已导出织造时序表 CSV' : 'Weaving schedule CSV exported';
  });
  $('tcMdHuaben').addEventListener('click', function () {
    download('huaben-' + S.pattern.w + 'x' + S.pattern.h + '-1-' + stamp() + '.md',
      toMarkdown(teachHuabenRows(), LANG_KEY === 'zh' ? '花本表' : 'Pattern-book table'), 'text/markdown');
    $('tcStatus').textContent = LANG_KEY === 'zh' ? '已导出花本表 Markdown' : 'Pattern book Markdown exported';
  });
  $('tcMdTiming').addEventListener('click', function () {
    download('loomtiming-' + STRUCTURES[S.structure].id + '-1-' + stamp() + '.md',
      toMarkdown(teachTimingRows(), LANG_KEY === 'zh' ? '织造时序表' : 'Weaving schedule'), 'text/markdown');
    $('tcStatus').textContent = LANG_KEY === 'zh' ? '已导出时序表 Markdown' : 'Weaving schedule Markdown exported';
  });
  $('tcCopy').addEventListener('click', function () {
    const text = $('tcPreview').textContent;
    const done = function (ok) {
      $('tcStatus').textContent = ok
        ? (LANG_KEY === 'zh' ? '已复制到剪贴板' : 'Copied to clipboard')
        : (LANG_KEY === 'zh' ? '浏览器拒绝了剪贴板权限，请手动选择预览区文字复制。' : 'Clipboard blocked; please select the preview text and copy manually.');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      done(false);
    }
  });

  // 视口变化时行高/滚动条占位会变，重新锁定整数行
  var fitTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitTeachPreview, 160);
  });
}

/* ============================================================
   12 · 模块 9：团队 · 披露
   ============================================================ */

function renderTeam() {
  const orig = $('teOriginal');
  const ai = $('teAi');
  const pending = $('tePending');
  const verify = $('teVerify');
  [orig, ai, pending, verify].forEach(function (n) { if (n) n.innerHTML = ''; });

  const A = LANG_KEY === 'zh' ? {
    orig: [
      '<b>四段算法</b>（compileToPattern / weaveSimulate / MODALITIES / loomTiming）与全部前端代码为团队原创，零第三方库。',
      '<b>6 件云锦纹样</b>由团队以参数化几何程序绘制后固化为 16×16 字符矩阵，不使用任何馆藏照片或商业纹样库。',
      '<b>159 条双语术语</b>为团队依据公开非遗名录、纺织史文献与博物馆公开释文自行整理撰写，释文与英译均为原创。',
      '<b>8 个时间线节点</b>的中国轨与西方轨正文为团队撰写，每条标注来源类别；定位为教学示意，非文物级复原。',
      '<b>视觉系统</b>（配色、排版、花本线 SVG、织物 Canvas 渲染、封面织物质感）全部自绘，无外部图片、字体与 CDN。'
    ],
    ai: [
      '<b>作品内视觉</b>：无任何 AI 生成图像。花本线为手写 SVG，织物与织物质感为 Canvas 逐像素绘制，封面底纹为程序化噪声与渐变。',
      '<b>评审视频</b>：AI 影像（MiniMax-H3 等视频模型）仅用于评审视频的氛围镜头，逐段在视频说明与《作品说明文档》中披露。',
      '<b>文字与代码</b>：算法设计、代码编写与文档撰写由 AI 辅助生成后经团队逐行审校、实测与修正；全部断言均以 node / playwright 复跑通过。',
      '<b>未使用</b>：未使用任何他人图片、馆藏扫描件、传承人影像、商业纹样库素材或第三方前端框架。'
    ],
    verify: [
      '<b>算法自检</b>：<span class="mono-sm">node test/verify.js</span> —— 往返一致性、组织循环周期、五态互转逐位一致、时间线节点数、术语条数与去重。',
      '<b>界面自检</b>：<span class="mono-sm">py -X utf8 07_技术文档与运行说明/测试脚本/run_checks.py</span> —— playwright 驱动九大模块主要控件，断言控制台零报错。',
      '<b>数据自洽</b>：说明文档中的所有数字（术语条数、纹样件数、节点数、组织类型数）均由脚本从代码中读出后写入。',
      '<b>离线可运行</b>：无网络请求，双击 index.html 即可。'
    ]
  } : {
    orig: [
      '<b>Four algorithms</b> (compileToPattern / weaveSimulate / MODALITIES / loomTiming) and all front-end code are original, with no third-party library.',
      '<b>Six brocade patterns</b> were drawn by the team with parametric geometry and fixed into 16×16 character matrices; no museum photograph or commercial pattern library is used.',
      '<b>159 bilingual terms</b> were compiled and written by the team from public intangible-heritage listings, textile-history literature and museum labels; glosses and English renderings are original.',
      '<b>Eight timeline nodes</b> on both tracks were written by the team, each with a source category; the positioning is pedagogical, not a conservation-grade reconstruction.',
      '<b>The visual system</b> (palette, typography, cord-structure SVG, Canvas fabric renderer, cover silk texture) is entirely hand-drawn or procedurally drawn: no external image, font or CDN.'
    ],
    ai: [
      '<b>Visuals inside the work</b>: no AI-generated image. Cord structures are hand-written SVG, fabric and silk textures are drawn per pixel in Canvas, and the cover ground is procedural noise and gradients.',
      '<b>Review video</b>: AI footage (MiniMax-H3 and similar video models) is used only for atmospheric shots in the review video, disclosed shot by shot in the video notes and in the work description.',
      '<b>Text and code</b>: algorithm design, code and documentation were drafted with AI assistance, then reviewed line by line, tested and corrected by the team; every assertion is re-run with node and playwright.',
      '<b>Not used</b>: no third-party image, museum scan, bearer footage, commercial pattern library or front-end framework.'
    ],
    verify: [
      '<b>Algorithm self-test</b>: <span class="mono-sm">node test/verify.js</span> — round-trip identity, weave repeat periods, bit-exact five-state conversion, node count, term count and deduplication.',
      '<b>Interface check</b>: <span class="mono-sm">py -X utf8 07_技术文档与运行说明/测试脚本/run_checks.py</span> — playwright drives every main control in the nine modules and asserts a clean console.',
      '<b>Data consistency</b>: every number in the description documents (term count, pattern count, node count, weave types) is read out of the code by a script before it is written.',
      '<b>Runs offline</b>: no network request; open index.html by double-click.'
    ]
  };

  A.orig.forEach(function (h) { const li = document.createElement('li'); li.innerHTML = h; orig.appendChild(li); });
  A.ai.forEach(function (h) { const li = document.createElement('li'); li.innerHTML = h; ai.appendChild(li); });
  A.verify.forEach(function (h) { const li = document.createElement('li'); li.innerHTML = h; verify.appendChild(li); });
  (typeof PENDING_ASSETS !== 'undefined' ? PENDING_ASSETS : []).forEach(function (a) {
    const li = document.createElement('li');
    li.textContent = a.id + ' · ' + (LANG_KEY === 'zh' ? a.zh : a.en) + ' [' + a.seg + ']';
    pending.appendChild(li);
  });
}

/* ============================================================
   13 · 封面 / 导航 / 语言 / 动效
   ============================================================ */

let coverRAF = null;

/* ---------- 封面右侧：程序生成的妆花缎实物（用同一套 weaveSimulate） ---------- */
let coverArtOff = null;
let coverArtRAF = null;

function buildCoverArt() {
  const cv = $('coverArt');
  if (!cv) return;
  const off = document.createElement('canvas');
  off.width = cv.width;
  off.height = cv.height;
  const octx = off.getContext('2d');
  let wv;
  try {
    wv = weaveSimulate(compileToPattern(designFromRows(PATTERNS[1].map)), 'satin5');
  } catch (err) { return; }
  const cell = off.width / wv.w;
  octx.fillStyle = '#0b0f12';
  octx.fillRect(0, 0, off.width, off.height);
  drawFabricArea(octx, wv, { x: 0, y: 0, size: off.width, k: OVERSAMPLE });
  void cell;
  coverArtOff = off;
  paintCoverArt(0);
}

function paintCoverArt(phase) {
  const cv = $('coverArt');
  if (!cv || !coverArtOff) return;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.drawImage(coverArtOff, 0, 0);
  // 轻微暗角，让织物嵌进页面而不是浮在上面
  const vg = ctx.createRadialGradient(cv.width / 2, cv.height / 2, cv.width * 0.30,
    cv.width / 2, cv.height / 2, cv.width * 0.78);
  vg.addColorStop(0, 'rgba(8,11,13,0)');
  vg.addColorStop(1, 'rgba(8,11,13,0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, cv.width, cv.height);
  if (!S.reduceMotion) {
    const y = (Math.sin(phase) * 0.5 + 0.5) * (cv.height + 160) - 80;
    const g = ctx.createLinearGradient(0, y - 70, 0, y + 70);
    g.addColorStop(0, 'rgba(184,134,11,0)');
    g.addColorStop(0.5, 'rgba(230,194,90,0.20)');
    g.addColorStop(1, 'rgba(184,134,11,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 70, cv.width, 140);
  }
}

function loopCoverArt() {
  if (coverArtRAF) { cancelAnimationFrame(coverArtRAF); coverArtRAF = null; }
  if (S.reduceMotion) { paintCoverArt(0); return; }
  const t0 = performance.now();
  const step = function (now) {
    paintCoverArt((now - t0) / 3000);
    coverArtRAF = requestAnimationFrame(step);
  };
  coverArtRAF = requestAnimationFrame(step);
}

function initCover() {
  const cv = $('coverCanvas');
  if (!cv) return;
  let w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);
  const resize = function () {
    const r = cv.parentElement.getBoundingClientRect();
    w = Math.max(320, Math.round(r.width));
    h = Math.max(320, Math.round(r.height));
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    cv.style.width = w + 'px';
    cv.style.height = h + 'px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', function () {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    resize();
    draw(0);
  });

  function draw(phase) {
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintSilkTexture(ctx, w, h, {
      step: 6,
      seed: 11,
      shuttle: S.reduceMotion ? null : (Math.sin(phase) * 0.5 + 0.5) * (w + 200) - 100
    });
  }

  let t0 = performance.now();
  function loop(now) {
    if (S.reduceMotion) { draw(0); coverRAF = null; return; }
    draw((now - t0) / 2600);
    coverRAF = requestAnimationFrame(loop);
  }
  draw(0);
  if (!S.reduceMotion) coverRAF = requestAnimationFrame(loop);
  if (S.reduceMotion && coverRAF) { cancelAnimationFrame(coverRAF); coverRAF = null; }
}

function initNavSpy() {
  const ids = ['workshop', 'drafting', 'weaving', 'five', 'library', 'timeline', 'terms', 'teach', 'team'];
  const links = {};
  document.querySelectorAll('#navLinks a').forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });
  if (typeof IntersectionObserver === 'undefined') return;
  const spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
      const a = links[en.target.id];
      if (a) a.classList.add('active');
    });
  }, { rootMargin: '-42% 0px -50% 0px' });
  ids.forEach(function (id) {
    const n = document.getElementById(id);
    if (n) spy.observe(n);
  });
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(function (n) {
    const k = n.getAttribute('data-i18n');
    const v = t(k);
    if (v !== undefined && v !== null) n.textContent = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function (n) {
    n.setAttribute('placeholder', t(n.getAttribute('data-i18n-ph')));
  });
}

function setLang(lang) {
  LANG_KEY = lang === 'en' ? 'en' : 'zh';
  document.documentElement.lang = LANG_KEY === 'zh' ? 'zh-CN' : 'en';
  $('langZh').classList.toggle('on', LANG_KEY === 'zh');
  $('langEn').classList.toggle('on', LANG_KEY === 'en');
  $('langZh').setAttribute('aria-pressed', LANG_KEY === 'zh' ? 'true' : 'false');
  $('langEn').setAttribute('aria-pressed', LANG_KEY === 'en' ? 'true' : 'false');
  applyI18n();
  renderSwatches();
  renderPresets();
  buildGrid();
  renderWorkshopReadout();
  renderStructures();
  syncPlayButton();
  renderDrafting();
  renderWeave();
  renderFive();
  renderLibrary();
  renderTimeline();
  renderTermChips();
  renderTerms();
  renderTeach();
  renderTeam();
  renderSteps();
  const live = $('wsLive');
  if (live) live.textContent = LANG_KEY === 'zh' ? '界面语言：中文' : 'Interface language: English';
}

function initMotion() {
  const btn = $('motionBtn');
  const prefers = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  S.reduceMotion = !!prefers;
  if (S.reduceMotion) document.documentElement.classList.add('reduce-motion');
  btn.setAttribute('aria-pressed', S.reduceMotion ? 'true' : 'false');
  btn.addEventListener('click', function () {
    S.reduceMotion = !S.reduceMotion;
    document.documentElement.classList.toggle('reduce-motion', S.reduceMotion);
    btn.setAttribute('aria-pressed', S.reduceMotion ? 'true' : 'false');
    if (S.reduceMotion) {
      if (coverRAF) { cancelAnimationFrame(coverRAF); coverRAF = null; }
      if (coverArtRAF) { cancelAnimationFrame(coverArtRAF); coverArtRAF = null; }
      const cv = $('coverCanvas');
      if (cv) {
        const ctx = cv.getContext('2d');
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintSilkTexture(ctx, cv.width / dpr, cv.height / dpr, { step: 6, seed: 11, shuttle: null });
      }
      paintCoverArt(0);
    } else {
      initCover();
      loopCoverArt();
    }
  });
}

/* ============================================================
   14 · 启动
   ============================================================ */

function boot() {
  S.design = blankDesign(S.size);
  S.pattern = compileToPattern(S.design);

  // 网格尺寸按钮与初始尺寸对齐（默认 16×16）
  document.querySelectorAll('.ws-toolbar .seg-btn').forEach(function (b) {
    b.classList.toggle('on', Number(b.dataset.size) === S.size);
  });

  renderSwatches();
  buildGrid();
  bindWorkshop();
  renderPresets();
  renderDrafting();
  bindDrafting();
  bindWeaving();
  renderFive();
  bindFive();
  renderLibrary();
  renderTimeline();
  bindTimeline();
  renderTermChips();
  renderTerms();
  bindTerms();
  renderTeach();
  bindTeach();
  renderTeam();
  renderSteps();
  $('langZh').addEventListener('click', function () { setLang('zh'); });
  $('langEn').addEventListener('click', function () { setLang('en'); });
  initMotion();
  initCover();
  buildCoverArt();
  loopCoverArt();
  initNavSpy();
  applyI18n();
  commitDesign(false);

  // 默认织出预设纹样，让首屏就有内容
  S.design = resizeDesign(designFromRows(PATTERNS[0].map), S.size);
  buildGrid();
  commitDesign(false);
  S.weave.progress = S.pattern.h;
  renderWeave();
  S.syncSource = 'pixels';
  S.sync = firstFlowerBit();
  highlightBit(S.sync, true);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}

/* ---------- Node 自检导出 ---------- */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    COLOR_KEYS: COLOR_KEYS,
    COLOR_META: COLOR_META,
    STRUCTURES: STRUCTURES,
    STRUCTURE_ORDER: STRUCTURE_ORDER,
    blankDesign: blankDesign,
    designFromRows: designFromRows,
    designToRows: designToRows,
    normalizeDesign: normalizeDesign,
    resizeDesign: resizeDesign,
    frameLift: frameLift,
    groundLift: groundLift,
    compileToPattern: compileToPattern,
    decodePattern: decodePattern,
    designToBits: designToBits,
    bitsToDesign: bitsToDesign,
    checksum: checksum,
    weaveSimulate: weaveSimulate,
    loomTiming: loomTiming,
    MODALITIES: MODALITIES,
    modalityById: modalityById,
    identityBits: identityBits,
    toCard: toCard, fromCard: fromCard,
    toTape: toTape, fromTape: fromTape,
    tapeLayout: tapeLayout,
    tapeRuns: tapeRuns,
    toBinary: toBinary, fromBinary: fromBinary,
    toPixels: toPixels, fromPixels: fromPixels,
    huabenRows: huabenRows,
    timingRows: timingRows,
    toCSV: toCSV,
    toMarkdown: toMarkdown
  };
}
