// =========================================================================
// MODULE: SAO CHÉP SẢN PHẨM — nhúng extension/clone-tool/app.html (Shopee Clone Tool)
// Chỉ nạp giao diện khi mở tab lần đầu để side panel không chậm.
// =========================================================================

(function() {
  const APP_URL = "../clone-tool/app.html";
  const iframeEl = document.getElementById("in-nang-cao-iframe");
  const btnReload = document.getElementById("btn-in-nang-cao-reload");
  if (!iframeEl) return;

  const ensureLoaded = () => {
    if (!iframeEl.getAttribute("src")) iframeEl.setAttribute("src", APP_URL);
  };

  document.querySelectorAll('.tab-btn[data-tab="tab-in-nang-cao"]').forEach((btn) => {
    btn.addEventListener("click", ensureLoaded);
  });

  btnReload?.addEventListener("click", () => {
    if (!iframeEl.getAttribute("src")) return ensureLoaded();
    try {
      iframeEl.contentWindow.location.reload();
    } catch (e) {
      iframeEl.setAttribute("src", APP_URL);
    }
  });

  // Side panel mở lại đúng tab Sao chép sản phẩm (tab đang active khi khởi động)
  const tab = document.getElementById("tab-in-nang-cao");
  if (tab && !tab.hidden) ensureLoaded();
})();
