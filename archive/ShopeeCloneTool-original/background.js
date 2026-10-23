// Bấm icon extension -> mở Side Panel.
const enablePanel = () => chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
enablePanel();
chrome.runtime.onInstalled.addListener(enablePanel);
chrome.runtime.onStartup.addListener(enablePanel);

// Tải ảnh Gemini đã tạo (cần cookie Google nên phải tải từ extension) và lưu làm ảnh bìa mới
// cho sản phẩm vừa gửi sang AI.
async function fetchImageAsDataUrl(url) {
  const candidates = [url.replace(/=s\d+(-[\w-]+)?$/, '=s0'), url].filter((u, i, a) => a.indexOf(u) === i);
  let lastErr = '';
  for (const u of candidates) {
    try {
      const r = await fetch(u, { credentials: 'include' });
      const type = (r.headers.get('content-type') || '').split(';')[0];
      if (r.ok && type.startsWith('image/')) {
        const buf = new Uint8Array(await r.arrayBuffer());
        let bin = '';
        for (let i = 0; i < buf.length; i += 32768) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 32768));
        return { dataUrl: `data:${type};base64,${btoa(bin)}`, size: buf.length };
      }
      lastErr = `HTTP ${r.status} ${type}`;
    } catch (e) {
      lastErr = String((e && e.message) || e);
    }
  }
  throw new Error(lastErr || 'fetch failed');
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // Trang AI hỏi tab id của chính nó (để chỉ nhận lệnh dành cho mình)
  if (msg && msg.type === 'sclWhoAmI') {
    sendResponse({ tabId: sender.tab ? sender.tab.id : null });
    return false;
  }
  if (!msg || msg.type !== 'sclFetchImage' || !msg.url) return false;
  (async () => {
    try {
      const { dataUrl, size } = await fetchImageAsDataUrl(msg.url);
      const { aiLastProductId } = await chrome.storage.local.get('aiLastProductId');
      await chrome.storage.local.set({
        aiCoverImage: { dataUrl, timestamp: Date.now(), source: 'gemini', productId: aiLastProductId || '' }
      });
      sendResponse({ ok: true, size });
    } catch (e) {
      sendResponse({ ok: false, error: String((e && e.message) || e) });
    }
  })();
  return true;
});
