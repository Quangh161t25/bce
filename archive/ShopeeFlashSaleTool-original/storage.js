// Lưu cấu hình, mẫu tự động và nhật ký vào chrome.storage.local.

const MAX_LOGS = 300;

export const DEFAULT_SETTINGS = {
  autoEnabled: true,
  intervalMinutes: 60
};

export async function getSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  return { ...DEFAULT_SETTINGS, ...(settings || {}) };
}

export async function saveSettings(patch) {
  const current = await getSettings();
  await chrome.storage.local.set({ settings: { ...current, ...patch } });
}

export async function getRules() {
  const { rules } = await chrome.storage.local.get('rules');
  return rules || [];
}

export async function saveRules(rules) {
  await chrome.storage.local.set({ rules });
}

// Đọc lại danh sách mới nhất rồi mới ghi, tránh ghi đè chỉnh sửa khác.
export async function patchRule(id, patch) {
  const rules = await getRules();
  const idx = rules.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  rules[idx] = { ...rules[idx], ...patch };
  await saveRules(rules);
  return rules[idx];
}

export async function getLogs() {
  const { logs } = await chrome.storage.local.get('logs');
  return logs || [];
}

export async function addLog(level, message) {
  const logs = await getLogs();
  logs.push({ time: Date.now(), level, message });
  await chrome.storage.local.set({ logs: logs.slice(-MAX_LOGS) });
}

export async function clearLogs() {
  await chrome.storage.local.set({ logs: [] });
}
