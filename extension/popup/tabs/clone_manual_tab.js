// =========================================================================
// MODULE: SAO CHÉP TAY — nhúng extension/clone-tool/manual.html
// Chỉ nạp giao diện khi mở tab lần đầu để side panel không chậm.
// =========================================================================

(function() {
  const getAppUrl = () => {
    try {
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL("extension/clone-tool/manual.html");
      }
    } catch (_) {}
    return "../clone-tool/manual.html";
  };

  const iframeEl = document.getElementById("clone-manual-iframe");
  const btnReload = document.getElementById("btn-clone-manual-reload");
  if (!iframeEl) return;

  const ensureLoaded = (force = false) => {
    const appUrl = getAppUrl();
    const currentSrc = iframeEl.getAttribute("src") || iframeEl.src || "";
    if (force || !currentSrc || currentSrc === "about:blank" || !currentSrc.includes("clone-tool/manual.html")) {
      const urlToSet = force ? `${appUrl}?_t=${Date.now()}` : appUrl;
      iframeEl.src = urlToSet;
      iframeEl.setAttribute("src", urlToSet);
    }
  };

  // Lắng nghe click chuyển sang tab Sao chép tay
  document.querySelectorAll('.tab-btn[data-tab="tab-clone-manual"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      setTimeout(() => ensureLoaded(false), 30);
    });
  });

  // Nút Tải lại giao diện
  btnReload?.addEventListener("click", () => {
    ensureLoaded(true);
  });

  // Side panel mở lại đúng tab Sao chép tay (nếu đang active khi khởi động)
  const tab = document.getElementById("tab-clone-manual");
  if (tab && !tab.hidden) {
    ensureLoaded(false);
  }
})();
