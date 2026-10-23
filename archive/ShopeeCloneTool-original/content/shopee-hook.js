// Chạy trong trang shopee.vn (world MAIN): bắt dữ liệu chi tiết sản phẩm mà chính trang tải về,
// rồi chuyển cho shopee-relay.js. Không gửi thêm request nào tới Shopee.
(() => {
  if (window.__sclHooked) return;
  window.__sclHooked = true;

  const MATCH = /\/api\/v4\/(pdp\/get_pc|pdp\/get|item\/get)\b/;

  const forward = (url, text) => {
    try {
      const json = typeof text === 'string' ? JSON.parse(text) : text;
      if (json && json.data) window.postMessage({ __scl: 'product', url: String(url), json }, '*');
    } catch (e) { /* không phải JSON */ }
  };

  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const p = origFetch.apply(this, arguments);
    if (MATCH.test(url)) {
      p.then((r) => r.clone().text().then((t) => forward(url, t))).catch(() => {});
    }
    return p;
  };

  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__sclUrl = String(url || '');
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    if (MATCH.test(this.__sclUrl || '')) {
      this.addEventListener('load', () => {
        try {
          const t = this.responseType === '' || this.responseType === 'text' ? this.responseText : this.response;
          forward(this.__sclUrl, t);
        } catch (e) { /* bỏ qua */ }
      });
    }
    return origSend.apply(this, arguments);
  };
})();
