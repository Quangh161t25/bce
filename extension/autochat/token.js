// Auto Chat: chạy trên mọi trang banhang.shopee.vn, lấy token phiên chat (localStorage "chat-session",
// do trang webchat tạo khi đăng nhập) cất vào chrome.storage để background gọi API chat khi không mở tab webchat.
(function () {
  'use strict';
  if (window !== window.top || window.__AUTOCHAT_TOKEN__) return;
  window.__AUTOCHAT_TOKEN__ = true;

  const KEY = 'autochat_session';

  async function sync() {
    let s = null;
    try {
      s = JSON.parse(localStorage.getItem('chat-session') || 'null');
    } catch (e) {
      return;
    }
    if (!s || !s.token || !s.user || !s.shop) return;
    try {
      const cur = (await chrome.storage.local.get(KEY))[KEY];
      if (cur && cur.token === s.token) return; // không đổi thì không ghi lại
      await chrome.storage.local.set({
        [KEY]: { token: s.token, userId: s.user.id, shopId: s.shop.id, shopName: s.shop.name, at: Date.now() }
      });
    } catch (e) {
      // extension vừa được tải lại: content script cũ mất kết nối, bỏ qua
    }
  }

  sync();
  setInterval(sync, 60000);
})();
