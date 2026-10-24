// =========================================================================
// MODULE: AUTO CHAT — nhúng extension/autochat/panel.html
// Chỉ nạp giao diện khi mở tab lần đầu để side panel không chậm.
// Việc quét khách + gửi câu chào chạy trên tab Shopee Webchat (extension/autochat/content.js).
// =========================================================================

(function() {
  const APP_URL = "../autochat/panel.html";
  const iframeEl = document.getElementById("autochat-iframe");
  const btnReload = document.getElementById("btn-autochat-reload");
  const tabBtn = document.querySelector('.tab-btn[data-tab="tab-autochat"]');
  if (!iframeEl) return;

  const ensureLoaded = () => {
    if (!iframeEl.getAttribute("src")) iframeEl.setAttribute("src", APP_URL);
  };

  tabBtn?.addEventListener("click", ensureLoaded);

  btnReload?.addEventListener("click", () => {
    if (!iframeEl.getAttribute("src")) return ensureLoaded();
    try {
      iframeEl.contentWindow.location.reload();
    } catch (e) {
      iframeEl.setAttribute("src", APP_URL);
    }
  });

  const tab = document.getElementById("tab-autochat");
  if (tab && !tab.hidden) ensureLoaded();
})();
