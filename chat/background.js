// Background: cập nhật số trên icon, nhắc tab webchat quét định kỳ
// (tab ẩn bị Chrome giảm tần suất setInterval) và tuỳ chọn tự mở lại tab webchat.
/* global SCM */
importScripts('shared.js');

const WEBCHAT_URL = 'https://banhang.shopee.vn/new-webchat/conversations';

async function updateBadge() {
  const q = await SCM.getQueue();
  const n = SCM.waitingList(q).length;
  await chrome.action.setBadgeText({ text: n ? String(n) : '' });
  await chrome.action.setBadgeBackgroundColor({ color: '#ee4d2d' });
}

async function webchatTabs() {
  return chrome.tabs.query({ url: ['https://banhang.shopee.vn/new-webchat/*', 'https://banhang.shopee.vn/webchat/*'] });
}

async function tick() {
  const tabs = await webchatTabs();
  if (!tabs.length) {
    const s = await SCM.getSettings();
    if (s.autoOpenTab) await chrome.tabs.create({ url: WEBCHAT_URL, pinned: true, active: false });
    return;
  }
  for (const t of tabs) {
    chrome.tabs.sendMessage(t.id, { type: 'scm-poll' }).catch(() => {});
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('scm-tick', { periodInMinutes: 1 });
  updateBadge();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('scm-tick', { periodInMinutes: 1 });
  updateBadge();
});

chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === 'scm-tick') tick();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[SCM.K.queue]) updateBadge();
});

// Popup nhờ mở hội thoại: đưa tab webchat lên rồi bảo content script click mở khách.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'scm-open-from-popup') {
    (async () => {
      let [tab] = await webchatTabs();
      if (!tab) {
        tab = await chrome.tabs.create({ url: WEBCHAT_URL });
        sendResponse({ ok: false, reason: 'opened' });
        return;
      }
      await chrome.tabs.update(tab.id, { active: true });
      await chrome.windows.update(tab.windowId, { focused: true });
      chrome.tabs.sendMessage(tab.id, { type: 'scm-open', convId: msg.convId }).catch(() => {});
      sendResponse({ ok: true });
    })();
    return true;
  }
  return false;
});
