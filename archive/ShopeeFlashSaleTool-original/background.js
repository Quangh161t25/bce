import { runAllRules } from './scheduler.js';
import { getSettings, getRules } from './storage.js';

const ALARM = 'fsAutoRegister';

// Bấm icon extension -> mở (hoặc chuyển tới) trang quản lý.
chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('app.html');
  const [tab] = await chrome.tabs.query({ url: url + '*' });
  if (tab) {
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url });
  }
});

async function syncAlarm() {
  const settings = await getSettings();
  const rules = await getRules();
  await chrome.alarms.clear(ALARM);
  if (settings.autoEnabled && rules.some((r) => r.enabled)) {
    const minutes = Math.max(15, Number(settings.intervalMinutes) || 60);
    await chrome.alarms.create(ALARM, { delayInMinutes: 1, periodInMinutes: minutes });
  }
}

chrome.runtime.onInstalled.addListener(syncAlarm);
chrome.runtime.onStartup.addListener(syncAlarm);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.settings || changes.rules)) syncAlarm();
});

async function runAndNotify(onlyId) {
  const res = await runAllRules({ onlyId });
  if (res.created > 0) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Shopee Seller Tool',
      message: `Đã tự động tạo ${res.created} Flash Sale mới`
    });
  }
  return res;
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) runAndNotify(null);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'runRules') {
    runAndNotify(msg.ruleId || null)
      .then((res) => sendResponse({ ok: true, ...res }))
      .catch((e) => sendResponse({ ok: false, error: e.message }));
    return true;
  }
  return false;
});
