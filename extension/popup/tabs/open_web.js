// Nút "🌐 Web" trên side panel: mở giao diện web quản lý (dist/index.html) trong tab mới.
// Web là trang của extension nên đọc được đơn Shopee trực tiếp (tab CHỜ LẤY HÀNG).
(function () {
  "use strict";
  const btn = document.getElementById("btn-open-web");
  if (!btn) return;
  btn.addEventListener("click", () => {
    // Mở thẳng tab CHỜ LẤY HÀNG (App đọc ?tab=...)
    chrome.tabs.create({ url: chrome.runtime.getURL("dist/index.html") + "?tab=CHO_LAY_HANG" });
  });
})();
