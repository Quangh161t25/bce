// Nhận dữ liệu sản phẩm từ shopee-hook.js và lưu vào storage để Side Panel dùng.
(() => {
  const MAX_KEEP = 15;

  const extractIdFromUrl = (url) => {
    if (!url) return { itemId: '', shopId: '' };
    const mItem = url.match(/[?&](?:item_?id|itemId|itemid)=(\d+)/i) ||
                  url.match(/-i\.\d+\.(\d+)/i) ||
                  url.match(/\/product\/\d+\/(\d+)/i) ||
                  url.match(/\/(\d+)\/(\d+)/);
    const mShop = url.match(/[?&](?:shop_?id|shopId|shopid)=(\d+)/i) ||
                  url.match(/-i\.(\d+)\.\d+/i) ||
                  url.match(/\/product\/(\d+)\/\d+/i);
    return {
      itemId: mItem ? (mItem[1] || mItem[2]) : '',
      shopId: mShop ? mShop[1] : ''
    };
  };

  window.addEventListener('message', (ev) => {
    if (ev.source !== window || !ev.data || ev.data.__scl !== 'product') return;
    const data = ev.data.json && (ev.data.json.data || ev.data.json.item || ev.data.json);
    if (!data) return;
    const item = data.item || data;

    // Trích xuất itemId & shopId từ mọi vị trí khả dĩ
    let itemId = data.item_id || data.itemid || item.item_id || item.itemid || data.product_info?.item_id || '';
    let shopId = data.shop_id || data.shopid || item.shop_id || item.shopid || data.product_info?.shop_id || '';

    // Nếu chưa có trong body JSON, lấy trực tiếp từ URL API hoặc URL trang
    if (!itemId || !shopId) {
      const fromApiUrl = extractIdFromUrl(ev.data.url);
      const fromPageUrl = extractIdFromUrl(location.href);
      if (!itemId) itemId = fromApiUrl.itemId || fromPageUrl.itemId || '';
      if (!shopId) shopId = fromApiUrl.shopId || fromPageUrl.shopId || '';
    }

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
