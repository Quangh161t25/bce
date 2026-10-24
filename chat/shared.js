// Dùng chung cho content script, popup và background (importScripts).
// Toàn bộ dữ liệu lưu trong chrome.storage.local:
//   scm_settings : cài đặt
//   scm_queue    : { [convId]: entry } danh sách khách chờ / đã xong
//   scm_meta     : trạng thái lần quét gần nhất, tab đang giữ quyền quét
/* exported SCM */
var SCM = (function () {
  'use strict';

  const DEFAULT_SETTINGS = {
    greetEnabled: false,
    greetEnabledAt: 0, // chỉ chào khách nhắn SAU thời điểm bật, tránh chào lại tồn đọng cũ
    greetText: 'Dạ shop chào anh/chị ạ! Shop đã nhận được tin nhắn, nhân viên sẽ trả lời mình ngay trong ít phút nữa ạ!',
    greetMaxAgeMin: 120, // tin của khách cũ hơn mức này thì không chào nữa
    greetCooldownHours: 12, // mỗi hội thoại chỉ chào 1 lần trong khoảng này
    idleSeconds: 20, // chỉ gửi chào khi bạn không thao tác trong webchat X giây
    dryRun: false, // chỉ điền câu chào vào ô chat, không bấm gửi
    pollSeconds: 20,
    autoOpenTab: false, // background tự mở lại tab webchat (ghim) nếu bị đóng
    keepDoneHours: 48
  };

  const K = { settings: 'scm_settings', queue: 'scm_queue', meta: 'scm_meta' };

  async function getSettings() {
    const r = await chrome.storage.local.get(K.settings);
    return Object.assign({}, DEFAULT_SETTINGS, r[K.settings] || {});
  }

  async function saveSettings(patch) {
    const cur = await getSettings();
    const next = Object.assign(cur, patch);
    await chrome.storage.local.set({ [K.settings]: next });
    return next;
  }

  async function getQueue() {
    const r = await chrome.storage.local.get(K.queue);
    return r[K.queue] || {};
  }

  async function saveQueue(q) {
    await chrome.storage.local.set({ [K.queue]: q });
  }

  async function getMeta() {
    const r = await chrome.storage.local.get(K.meta);
    return r[K.meta] || {};
  }

  async function saveMeta(patch) {
    const cur = await getMeta();
    await chrome.storage.local.set({ [K.meta]: Object.assign(cur, patch) });
  }

  function waitingList(q) {
    return Object.values(q)
      .filter((e) => e.status === 'waiting')
      .sort((a, b) => a.lastBuyerAt - b.lastBuyerAt); // khách chờ lâu nhất lên đầu
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);
  }

  function timeAgo(ts) {
    if (!ts) return '';
    const m = Math.floor((Date.now() - ts) / 60000);
    if (m < 1) return 'vừa xong';
    if (m < 60) return m + ' phút';
    const h = Math.floor(m / 60);
    if (h < 24) return h + ' giờ ' + (m % 60) + ' phút';
    return Math.floor(h / 24) + ' ngày';
  }

  // Shopee tính tỷ lệ phản hồi trong 12 giờ: tô màu theo thời gian chờ.
  function urgency(ts) {
    const h = (Date.now() - ts) / 3600000;
    if (h >= 8) return 'red';
    if (h >= 2) return 'orange';
    return 'green';
  }

  return { DEFAULT_SETTINGS, K, getSettings, saveSettings, getQueue, saveQueue, getMeta, saveMeta, waitingList, esc, timeAgo, urgency };
})();
