// Auto Chat: phần chạy ngầm, nạp bằng importScripts từ extension/background.js
// (sau autochat/shared.js và autochat/engine.js).
// Báo thức 30 giây/lần gọi AUTOCHAT_ENGINE.tick(): quét + tự nhắn qua API, không cần mở tab webchat.
// Cập nhật số khách chờ trên icon và mở hội thoại khi bấm "Mở chat" ở side panel.
/* global AUTOCHAT, AUTOCHAT_ENGINE */
(() => {
  const WEBCHAT_URL = 'https://banhang.shopee.vn/new-webchat/conversations';
  const ALARM = 'autochat-tick';

  async function updateBadge() {
    const st = await AUTOCHAT.getSettings();
    const n = st.mode === 'off' ? 0 : AUTOCHAT.waitingList(await AUTOCHAT.getQueue()).length;
    await chrome.action.setBadgeText({ text: n ? String(n) : '' });
    await chrome.action.setBadgeBackgroundColor({ color: '#ee4d2d' });
  }

  function init() {
    chrome.alarms.create(ALARM, { periodInMinutes: 0.5 });
    updateBadge();
  }

  chrome.runtime.onInstalled.addListener(init);
  chrome.runtime.onStartup.addListener(init);

  chrome.alarms.onAlarm.addListener((a) => {
    if (a.name === ALARM) AUTOCHAT_ENGINE.tick();
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[AUTOCHAT.K.queue] || changes[AUTOCHAT.K.settings]) updateBadge();
    // Vừa bật / đổi chế độ, hoặc vừa có token mới: chạy ngay, không đợi báo thức.
    const st = changes[AUTOCHAT.K.settings];
    if ((st && st.newValue && (!st.oldValue || st.newValue.mode !== st.oldValue.mode)) || changes[AUTOCHAT.K.session]) {
      AUTOCHAT_ENGINE.tick();
    }
  });

  function webchatTabs() {
    return chrome.tabs.query({ url: ['https://banhang.shopee.vn/new-webchat/*', 'https://banhang.shopee.vn/webchat/*'] });
  }

  function waitTabLoaded(tabId) {
    return new Promise((resolve) => {
      const done = () => { chrome.tabs.onUpdated.removeListener(onUpd); clearTimeout(timer); resolve(); };
      const onUpd = (id, info) => { if (id === tabId && info.status === 'complete') done(); };
      const timer = setTimeout(done, 30000);
      chrome.tabs.onUpdated.addListener(onUpd);
    });
  }

  // Content script có thể chưa kịp nạp ngay sau khi tab tải xong: thử lại vài lần.
  async function sendToTab(tabId, msg) {
    for (let i = 0; i < 10; i++) {
      try {
        await chrome.tabs.sendMessage(tabId, msg);
        return true;
      } catch (e) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    return false;
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg) return false;
    if (msg.type === 'autochat-tick-now') {
      AUTOCHAT_ENGINE.tick().then(() => sendResponse({ ok: true }));
      return true;
    }
    if (msg.type !== 'autochat-open-conv') return false;
    // "Mở chat": đưa tab webchat lên (mở mới nếu chưa có) rồi bảo content script tìm và mở khách.
    (async () => {
      let [tab] = await webchatTabs();
      if (!tab) {
        tab = await chrome.tabs.create({ url: WEBCHAT_URL });
        await waitTabLoaded(tab.id);
      } else {
        await chrome.tabs.update(tab.id, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
      }
      await sendToTab(tab.id, { type: 'autochat-open', convId: msg.convId });
      sendResponse({ ok: true });
    })();
    return true;
  });
})();
