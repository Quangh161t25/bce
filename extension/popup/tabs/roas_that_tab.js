// =========================================================================
// MODULE: ROAS THẬT — Tính ROAS thật Dịch vụ Hiển thị Shopee
// =========================================================================

(function() {
  const btnOpen = document.getElementById("btn-open-roas-that");
  const statusEl = document.getElementById("roas-that-status");

  function showStatus(text, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = isError ? "#dc2626" : "#16a34a";
  }

  btnOpen?.addEventListener("click", async () => {
    showStatus("Đang kiểm tra tab Kênh Người Bán...");
    try {
      const tabs = await chrome.tabs.query({ url: "*://banhang.shopee.vn/*" });
      if (tabs.length > 0) {
        const targetTab = tabs[0];
        await chrome.tabs.update(targetTab.id, { active: true });
        if (targetTab.windowId) {
          await chrome.windows.update(targetTab.windowId, { focused: true });
        }
        // Gửi lệnh mở panel ROAS thật
        chrome.tabs.sendMessage(targetTab.id, { type: "ROAS_THAT_OPEN" }, (res) => {
          if (chrome.runtime.lastError) {
            // Có thể tab chưa nạp xong hoặc mở từ trước khi cài tiện ích -> inject lại
            chrome.scripting.executeScript({
              target: { tabId: targetTab.id },
              files: ["extension/roas-that/roas-that.js"]
            }).then(() => {
              setTimeout(() => {
                chrome.tabs.sendMessage(targetTab.id, { type: "ROAS_THAT_OPEN" });
              }, 400);
            }).catch(() => {});
          }
          showStatus("✅ Đã mở bảng tính ROAS thật trên Kênh Người Bán!");
        });
      } else {
        showStatus("Đang mở trang Kênh Người Bán...");
        const newTab = await chrome.tabs.create({ url: "https://banhang.shopee.vn/", active: true });
        const onUpdated = (tabId, info) => {
          if (tabId === newTab.id && info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            setTimeout(() => {
              chrome.tabs.sendMessage(newTab.id, { type: "ROAS_THAT_OPEN" });
            }, 1000);
          }
        };
        chrome.tabs.onUpdated.addListener(onUpdated);
        showStatus("✅ Đã mở tab mới, bảng ROAS thật sẽ tự bật khi trang tải xong!");
      }
    } catch (err) {
      showStatus("Lỗi: " + err.message, true);
    }
  });
})();
