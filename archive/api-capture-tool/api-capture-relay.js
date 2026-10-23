// TẠM THỜI – nhận mẫu API từ api-capture.js (MAIN world) và tải về 1 file JSON
// ngay khi trang Shopee gửi lệnh sửa tồn kho (POST có chữ stock / update_product / mpsku).
// File: Downloads/shopee-api-mau/shopee-api-capture-<giờ>.json. Gỡ khi đã sửa xong tồn kho.
(function () {
  const entries = [];
  let downloadTimer = null;

  // Lệnh lưu thật (bỏ qua check_mpsku_for_edit: chỉ là kiểm tra khi mở trang sửa)
  const isWrite = (e) => e.method !== 'GET' && !/check_/i.test(e.url) && /stock|update_product|mpsku/i.test(e.url);

  function saveFile() {
    const data = {
      note: 'Mẫu API tồn kho Kênh Người Bán (tạm thời, để sửa tab Flash Sale)',
      page: location.href,
      capturedAt: new Date().toISOString(),
      entries
    };
    const json = JSON.stringify(data, null, 1);
    const b64 = btoa(unescape(encodeURIComponent(json)));
    const d = new Date();
    const p2 = (n) => String(n).padStart(2, '0');
    const name = `shopee-api-mau/shopee-api-capture-${p2(d.getHours())}${p2(d.getMinutes())}${p2(d.getSeconds())}.json`;
    try {
      chrome.runtime.sendMessage({ type: 'FORCE_DOWNLOAD', url: 'data:application/json;base64,' + b64, filename: name });
    } catch (e) { /* extension vừa được tải lại: F5 trang */ }
  }

  window.addEventListener('message', (ev) => {
    if (ev.source !== window || !ev.data || ev.data.channel !== 'SPLQ_API_CAPTURE') return;
    const e = ev.data.entry;
    if (!e) return;
    // Mỗi đường dẫn chỉ giữ 2 bản mới nhất cho gọn, lệnh ghi thì giữ hết
    const path = String(e.url).split('?')[0];
    if (!isWrite(e)) {
      const same = entries.filter((x) => String(x.url).split('?')[0] === path && !isWrite(x));
      if (same.length >= 2) entries.splice(entries.indexOf(same[0]), 1);
    }
    entries.push(e);
    if (isWrite(e)) {
      // Tải ngay: lưu xong Shopee chuyển trang, chờ lâu sẽ mất dữ liệu
      clearTimeout(downloadTimer);
      downloadTimer = setTimeout(saveFile, 200);
    }
  });
})();
