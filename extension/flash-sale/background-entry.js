// Phần chạy ngầm của Flash Sale Tool (tự động đăng ký theo mẫu).
// File này là ES module, được rollup đóng gói thành fs-background.bundle.js
// (script thường) để background chính nạp bằng importScripts:
//   npm run build:fs
import { runAllRules } from './scheduler.js';
import { getSettings, getRules } from './storage.js';

const ALARM = 'fsAutoRegister';

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
  if (area === 'local' && (changes.fs_settings || changes.fs_rules)) syncAlarm();
});

async function runAndNotify(onlyId) {
  const res = await runAllRules({ onlyId });
  if (res.created > 0) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('extension/flash-sale/icon.png'),
      title: 'Flash Sale Tool',
      message: `Đã tự động tạo ${res.created} Flash Sale mới`
    });
  }
  return res;
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) runAndNotify(null);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'FS_RUN_RULES') {
    runAndNotify(msg.ruleId || null)
      .then((res) => sendResponse({ ok: true, ...res }))
      .catch((e) => sendResponse({ ok: false, error: e.message }));
    return true;
  }
});
