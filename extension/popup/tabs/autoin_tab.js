// =========================================================================
// MODULE: AUTOIN — nhúng extension/autoin/panel.html (TOPCARE – Đọc đơn hàng)
// Chỉ nạp giao diện khi mở tab lần đầu để side panel không chậm.
// Chế độ tự động chạy trong background (extension/autoin/background.js), không cần mở tab này.
// =========================================================================

(function() {
  const APP_URL = "../autoin/panel.html";
  const iframeEl = document.getElementById("autoin-iframe");
  const btnReload = document.getElementById("btn-autoin-reload");
  const tabBtn = document.querySelector('.tab-btn[data-tab="tab-autoin"]');
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

  // Bấm thông báo tổng kết 17h / 8h -> chuyển sang tab AutoIn để bảng tổng kết tự mở
  const openAutoIn = () => {
    if (tabBtn && tabBtn.style.display !== "none") tabBtn.click();
  };
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "tcdd-open-report") openAutoIn();
  });
  chrome.storage.local.get("tcdd_open_report", (res) => {
    const r = res && res.tcdd_open_report;
    if (r && Date.now() - (r.time || 0) < 5 * 60 * 1000) openAutoIn();
  });

  const tab = document.getElementById("tab-autoin");
  if (tab && !tab.hidden) ensureLoaded();
})();
