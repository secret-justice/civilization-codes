/* ============================================================================
 * data_reference.js — 官方节气时刻对照表（2024–2027，96 条）
 * ----------------------------------------------------------------------------
 * ⚠ 本文件**只作为算法校验基准**，不参与作品运行时的任何计算。
 *   作品显示的节气时刻全部由 astro.js 当场算出。
 *
 * 数据来源：香港天文台《二十四節氣的日期及時間資料》
 *           https://www.hko.gov.hk/tc/gts/astronomy/Solar_Term.htm
 *           数据文件 …/data/files/24SolarTerms_<YEAR>.xml
 * HKO 原注：二十四節氣的天文資料是根據英國皇家航海曆書局（HM Nautical
 *           Almanac Office）及美國海軍天文氣象台（USNO）提供的天文數據計算。
 * 时区：均为香港时间 = UTC+8（与北京时间同一时区，数值一致）。
 * 抓取日期：2026-10-18（由 test/fetch_reference.js 自动生成，可复现）
 * 精度：官方值取整至分钟，因此单条对比存在 ±0.5 min 的取整不确定度。
 * ========================================================================== */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) { module.exports = api; }
  root.RefData = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  var META = {
    source: '香港天文台 Hong Kong Observatory《二十四節氣的日期及時間資料》',
    sourceShort: 'HKO',
    url: 'https://www.hko.gov.hk/tc/gts/astronomy/Solar_Term.htm',
    upstream: 'HM Nautical Almanac Office / USNO 天文數據',
    timezone: 'UTC+8 (香港時間 / 北京时间)',
    rounding: 'minute',
    retrieved: "2026-10-18",
    years: [2024,2025,2026,2027],
    count: 96,
    note: '本表仅用于校验 astro.js 的计算结果；运行时不读取。'
  };
  // year: 公历年 | k: 黄经索引（黄经 = 15°×k，k=0 即春分）| beijing: UTC+8 官方时刻
  var REFERENCE = [
    { year: 2024, k: 19, name: '小寒', nameEn: 'Minor Cold', beijing: '2024-01-06 04:49', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 20, name: '大寒', nameEn: 'Major Cold', beijing: '2024-01-20 22:07', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 21, name: '立春', nameEn: 'Start of Spring', beijing: '2024-02-04 16:27', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 22, name: '雨水', nameEn: 'Rain Water', beijing: '2024-02-19 12:13', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 23, name: '惊蛰', nameEn: 'Awakening of Insects', beijing: '2024-03-05 10:23', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 0, name: '春分', nameEn: 'Vernal Equinox', beijing: '2024-03-20 11:06', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 1, name: '清明', nameEn: 'Pure Brightness', beijing: '2024-04-04 15:02', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 2, name: '谷雨', nameEn: 'Grain Rain', beijing: '2024-04-19 22:00', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 3, name: '立夏', nameEn: 'Start of Summer', beijing: '2024-05-05 08:10', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 4, name: '小满', nameEn: 'Grain Buds', beijing: '2024-05-20 21:00', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 5, name: '芒种', nameEn: 'Grain in Ear', beijing: '2024-06-05 12:10', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 6, name: '夏至', nameEn: 'Summer Solstice', beijing: '2024-06-21 04:51', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 7, name: '小暑', nameEn: 'Minor Heat', beijing: '2024-07-06 22:20', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 8, name: '大暑', nameEn: 'Major Heat', beijing: '2024-07-22 15:44', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 9, name: '立秋', nameEn: 'Start of Autumn', beijing: '2024-08-07 08:09', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 10, name: '处暑', nameEn: 'End of Heat', beijing: '2024-08-22 22:55', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 11, name: '白露', nameEn: 'White Dew', beijing: '2024-09-07 11:11', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 12, name: '秋分', nameEn: 'Autumnal Equinox', beijing: '2024-09-22 20:44', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 13, name: '寒露', nameEn: 'Cold Dew', beijing: '2024-10-08 03:00', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 14, name: '霜降', nameEn: 'Frost Descent', beijing: '2024-10-23 06:15', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 15, name: '立冬', nameEn: 'Start of Winter', beijing: '2024-11-07 06:20', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 16, name: '小雪', nameEn: 'Minor Snow', beijing: '2024-11-22 03:56', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 17, name: '大雪', nameEn: 'Major Snow', beijing: '2024-12-06 23:17', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2024, k: 18, name: '冬至', nameEn: 'Winter Solstice', beijing: '2024-12-21 17:21', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 19, name: '小寒', nameEn: 'Minor Cold', beijing: '2025-01-05 10:33', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 20, name: '大寒', nameEn: 'Major Cold', beijing: '2025-01-20 04:00', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 21, name: '立春', nameEn: 'Start of Spring', beijing: '2025-02-03 22:10', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 22, name: '雨水', nameEn: 'Rain Water', beijing: '2025-02-18 18:07', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 23, name: '惊蛰', nameEn: 'Awakening of Insects', beijing: '2025-03-05 16:07', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 0, name: '春分', nameEn: 'Vernal Equinox', beijing: '2025-03-20 17:01', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 1, name: '清明', nameEn: 'Pure Brightness', beijing: '2025-04-04 20:49', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 2, name: '谷雨', nameEn: 'Grain Rain', beijing: '2025-04-20 03:56', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 3, name: '立夏', nameEn: 'Start of Summer', beijing: '2025-05-05 13:57', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 4, name: '小满', nameEn: 'Grain Buds', beijing: '2025-05-21 02:55', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 5, name: '芒种', nameEn: 'Grain in Ear', beijing: '2025-06-05 17:57', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 6, name: '夏至', nameEn: 'Summer Solstice', beijing: '2025-06-21 10:42', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 7, name: '小暑', nameEn: 'Minor Heat', beijing: '2025-07-07 04:05', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 8, name: '大暑', nameEn: 'Major Heat', beijing: '2025-07-22 21:29', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 9, name: '立秋', nameEn: 'Start of Autumn', beijing: '2025-08-07 13:52', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 10, name: '处暑', nameEn: 'End of Heat', beijing: '2025-08-23 04:34', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 11, name: '白露', nameEn: 'White Dew', beijing: '2025-09-07 16:52', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 12, name: '秋分', nameEn: 'Autumnal Equinox', beijing: '2025-09-23 02:19', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 13, name: '寒露', nameEn: 'Cold Dew', beijing: '2025-10-08 08:41', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 14, name: '霜降', nameEn: 'Frost Descent', beijing: '2025-10-23 11:51', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 15, name: '立冬', nameEn: 'Start of Winter', beijing: '2025-11-07 12:04', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 16, name: '小雪', nameEn: 'Minor Snow', beijing: '2025-11-22 09:36', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 17, name: '大雪', nameEn: 'Major Snow', beijing: '2025-12-07 05:05', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2025, k: 18, name: '冬至', nameEn: 'Winter Solstice', beijing: '2025-12-21 23:03', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 19, name: '小寒', nameEn: 'Minor Cold', beijing: '2026-01-05 16:23', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 20, name: '大寒', nameEn: 'Major Cold', beijing: '2026-01-20 09:45', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 21, name: '立春', nameEn: 'Start of Spring', beijing: '2026-02-04 04:02', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 22, name: '雨水', nameEn: 'Rain Water', beijing: '2026-02-18 23:52', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 23, name: '惊蛰', nameEn: 'Awakening of Insects', beijing: '2026-03-05 21:59', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 0, name: '春分', nameEn: 'Vernal Equinox', beijing: '2026-03-20 22:46', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 1, name: '清明', nameEn: 'Pure Brightness', beijing: '2026-04-05 02:40', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 2, name: '谷雨', nameEn: 'Grain Rain', beijing: '2026-04-20 09:39', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 3, name: '立夏', nameEn: 'Start of Summer', beijing: '2026-05-05 19:49', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 4, name: '小满', nameEn: 'Grain Buds', beijing: '2026-05-21 08:37', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 5, name: '芒种', nameEn: 'Grain in Ear', beijing: '2026-06-05 23:48', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 6, name: '夏至', nameEn: 'Summer Solstice', beijing: '2026-06-21 16:25', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 7, name: '小暑', nameEn: 'Minor Heat', beijing: '2026-07-07 09:57', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 8, name: '大暑', nameEn: 'Major Heat', beijing: '2026-07-23 03:13', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 9, name: '立秋', nameEn: 'Start of Autumn', beijing: '2026-08-07 19:43', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 10, name: '处暑', nameEn: 'End of Heat', beijing: '2026-08-23 10:19', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 11, name: '白露', nameEn: 'White Dew', beijing: '2026-09-07 22:41', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 12, name: '秋分', nameEn: 'Autumnal Equinox', beijing: '2026-09-23 08:05', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 13, name: '寒露', nameEn: 'Cold Dew', beijing: '2026-10-08 14:29', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 14, name: '霜降', nameEn: 'Frost Descent', beijing: '2026-10-23 17:38', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 15, name: '立冬', nameEn: 'Start of Winter', beijing: '2026-11-07 17:52', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 16, name: '小雪', nameEn: 'Minor Snow', beijing: '2026-11-22 15:23', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 17, name: '大雪', nameEn: 'Major Snow', beijing: '2026-12-07 10:53', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2026, k: 18, name: '冬至', nameEn: 'Winter Solstice', beijing: '2026-12-22 04:50', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 19, name: '小寒', nameEn: 'Minor Cold', beijing: '2027-01-05 22:10', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 20, name: '大寒', nameEn: 'Major Cold', beijing: '2027-01-20 15:30', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 21, name: '立春', nameEn: 'Start of Spring', beijing: '2027-02-04 09:46', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 22, name: '雨水', nameEn: 'Rain Water', beijing: '2027-02-19 05:33', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 23, name: '惊蛰', nameEn: 'Awakening of Insects', beijing: '2027-03-06 03:40', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 0, name: '春分', nameEn: 'Vernal Equinox', beijing: '2027-03-21 04:25', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 1, name: '清明', nameEn: 'Pure Brightness', beijing: '2027-04-05 08:17', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 2, name: '谷雨', nameEn: 'Grain Rain', beijing: '2027-04-20 15:18', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 3, name: '立夏', nameEn: 'Start of Summer', beijing: '2027-05-06 01:25', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 4, name: '小满', nameEn: 'Grain Buds', beijing: '2027-05-21 14:18', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 5, name: '芒种', nameEn: 'Grain in Ear', beijing: '2027-06-06 05:26', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 6, name: '夏至', nameEn: 'Summer Solstice', beijing: '2027-06-21 22:11', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 7, name: '小暑', nameEn: 'Minor Heat', beijing: '2027-07-07 15:37', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 8, name: '大暑', nameEn: 'Major Heat', beijing: '2027-07-23 09:05', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 9, name: '立秋', nameEn: 'Start of Autumn', beijing: '2027-08-08 01:27', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 10, name: '处暑', nameEn: 'End of Heat', beijing: '2027-08-23 16:14', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 11, name: '白露', nameEn: 'White Dew', beijing: '2027-09-08 04:28', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 12, name: '秋分', nameEn: 'Autumnal Equinox', beijing: '2027-09-23 14:02', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 13, name: '寒露', nameEn: 'Cold Dew', beijing: '2027-10-08 20:17', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 14, name: '霜降', nameEn: 'Frost Descent', beijing: '2027-10-23 23:33', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 15, name: '立冬', nameEn: 'Start of Winter', beijing: '2027-11-07 23:39', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 16, name: '小雪', nameEn: 'Minor Snow', beijing: '2027-11-22 21:16', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 17, name: '大雪', nameEn: 'Major Snow', beijing: '2027-12-07 16:38', source: 'HKO', verified: true, retrieved: '2026-10-18' },
    { year: 2027, k: 18, name: '冬至', nameEn: 'Winter Solstice', beijing: '2027-12-22 10:42', source: 'HKO', verified: true, retrieved: '2026-10-18' },
  ];
  return { META: META, REFERENCE: REFERENCE };
}));
