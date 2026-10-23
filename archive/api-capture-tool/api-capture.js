// TẠM THỜI – Ghi mẫu API tồn kho của Kênh Người Bán (chạy trong MAIN world của banhang.shopee.vn).
// Mục đích: biết chính xác Shopee trả tồn kho theo kho thế nào và gửi lệnh sửa tồn kho ra sao,
// để sửa tab Flash Sale (đọc / sửa tồn kho). Chỉ ghi URL, nội dung request và response JSON;
// không ghi header hay cookie. Gỡ file này (và api-capture-relay.js trong manifest) khi đã sửa xong.
(function () {
  if (window.__SPLQ_API_CAPTURE__) return;
  window.__SPLQ_API_CAPTURE__ = true;

  const WATCH = /search_product_list|get_product_info|get_shop_warehouse|stock|mpsku|update_product/i;
  const MAX_BODY = 300000;

  const clip = (v) => {
    if (v == null) return v;
    const s = typeof v === 'string' ? v : (() => { try { return JSON.stringify(v); } catch (e) { return String(v); } })();
    return s.length > MAX_BODY ? s.slice(0, MAX_BODY) + '…[cắt bớt]' : s;
  };
  const send = (entry) => {
    try { window.postMessage({ channel: 'SPLQ_API_CAPTURE', entry }, '*'); } catch (e) { /* bỏ qua */ }
  };

  // fetch
  const origFetch = window.fetch;
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const res = await origFetch.apply(this, arguments);
    if (WATCH.test(url)) {
      const method = (init && init.method) || (input && input.method) || 'GET';
      const reqBody = init && typeof init.body === 'string' ? init.body : '';
      res.clone().text().then((text) => {
        send({ via: 'fetch', method: String(method).toUpperCase(), url, reqBody: clip(reqBody), status: res.status, resBody: clip(text), at: Date.now() });
      }).catch(() => {});
    }
    return res;
  };

  // XMLHttpRequest (Kênh Người Bán chủ yếu dùng axios -> XHR)
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__splq = { method: String(method || 'GET').toUpperCase(), url: String(url || '') };
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function (body) {
    const info = this.__splq;
    if (info && WATCH.test(info.url)) {
      this.addEventListener('loadend', () => {
        let text = '';
        try { text = this.responseType === '' || this.responseType === 'text' ? this.responseText : JSON.stringify(this.response); } catch (e) { /* bỏ qua */ }
        send({ via: 'xhr', method: info.method, url: info.url, reqBody: clip(typeof body === 'string' ? body : ''), status: this.status, resBody: clip(text), at: Date.now() });
      });
    }
    return origSend.apply(this, arguments);
  };
})();
