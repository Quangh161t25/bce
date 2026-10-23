// Nhận dữ liệu sản phẩm từ shopee-hook.js và lưu vào storage để Side Panel dùng.
(() => {
  const MAX_KEEP = 15;

  window.addEventListener('message', (ev) => {
    if (ev.source !== window || !ev.data || ev.data.__scl !== 'product') return;
    const data = ev.data.json && ev.data.json.data;
    if (!data) return;
    const item = data.item || data;
    const itemId = item.item_id || item.itemid;
    const shopId = item.shop_id || item.shopid;
    if (!itemId) return;

    try {
      chrome.storage.local.get('sclProducts', (r) => {
        const all = (r && r.sclProducts) || {};
        const prev = all[String(itemId)];
        all[String(itemId)] = {
          itemId: String(itemId),
          shopId: String(shopId || ''),
          url: location.href,
          data,
          ts: Date.now(),
          scannedStock: prev && prev.scannedStock
        };
        Object.keys(all)
          .sort((a, b) => all[b].ts - all[a].ts)
          .slice(MAX_KEEP)
          .forEach((k) => delete all[k]);
        chrome.storage.local.set({ sclProducts: all, sclLastItemId: String(itemId) });
      });
    } catch (e) { /* extension vừa được tải lại: F5 trang là xong */ }
  });
})();
