// Mở trang chung Seller Hub (extension/hub/index.html) tại mục `m`.
// Đã mở sẵn thì chuyển sang tab đó và đổi mục, không tải lại trang.
window.openSellerHub = async function (m) {
  const base = chrome.runtime.getURL("extension/hub/index.html");
  const [tab] = await chrome.tabs.query({ url: base + "*" });
  if (tab?.id) {
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
    chrome.runtime.sendMessage({ type: "HUB_OPEN", m }).catch(() => {});
  } else {
    await chrome.tabs.create({ url: `${base}?m=${encodeURIComponent(m)}`, active: true });
  }
};
