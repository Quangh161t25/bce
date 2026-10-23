// Tự động đăng ký Flash Sale theo "mẫu" (rule) cho các khung giờ còn trống.
import { flashSale, sleep } from './shopee-api.js';
import { registerFlashSale, toSequence, describeFailed } from './flashsale.js';
import { getRules, patchRule, addLog } from './storage.js';

let running = false;

function hourInRange(hour, from, to) {
  return from <= to ? hour >= from && hour <= to : hour >= from || hour <= to;
}

export async function runRule(rule) {
  const now = Math.floor(Date.now() / 1000);
  const daysAhead = Math.max(1, Number(rule.daysAhead) || 3);
  const minLead = Math.max(0, Number(rule.minLeadHours) || 0);
  const maxPerRun = Math.max(1, Number(rule.maxPerRun) || 3);
  const registered = rule.registered || [];

  const [slots, upcoming] = await Promise.all([
    flashSale.timeSlots(daysAhead + 1),
    flashSale.listAll('next')
  ]);
  const usedSlotIds = new Set(upcoming.map((f) => Number(f.timeslot_id)));

  const candidates = slots
    .filter((s) => {
      const hour = new Date(s.start * 1000).getHours();
      return hourInRange(hour, Number(rule.hourFrom) || 0, Number(rule.hourTo ?? 23))
        && s.start - now >= minLead * 3600
        && s.start - now <= daysAhead * 86400
        && !usedSlotIds.has(s.id)
        && !registered.includes(s.id);
    })
    .slice(0, maxPerRun);

  if (!candidates.length) {
    await patchRule(rule.id, { lastRun: Date.now(), lastResult: 'Không có khung giờ mới phù hợp' });
    return { created: 0 };
  }

  const items = rule.items || [];
  const sequence = rule.sequence && rule.sequence.length ? rule.sequence : toSequence(items);
  const newlyRegistered = [];
  let created = 0;

  for (const slot of candidates) {
    const when = new Date(slot.start * 1000).toLocaleString('vi-VN');
    try {
      const res = await registerFlashSale({
        slotId: slot.id,
        items,
        sequence,
        onLog: (level, msg) => addLog(level, `[${rule.name}] ${msg}`)
      });
      created++;
      newlyRegistered.push(slot.id);
      await addLog(res.failed.length ? 'warn' : 'success',
        `[${rule.name}] Đã tạo FS #${res.flashSaleId} lúc ${when}: ${res.okCount}/${items.length} phân loại thành công`
        + (res.failed.length ? `. Lỗi: ${res.failed.slice(0, 5).map(describeFailed).join('; ')}` : ''));
    } catch (e) {
      await addLog('error', `[${rule.name}] Lỗi khung giờ ${when}: ${e.message}`);
    }
    await sleep(2000);
  }

  const latest = (await getRules()).find((r) => r.id === rule.id) || rule;
  await patchRule(rule.id, {
    registered: [...(latest.registered || []), ...newlyRegistered].slice(-500),
    lastRun: Date.now(),
    lastResult: `Đã tạo ${created}/${candidates.length} Flash Sale`
  });
  return { created };
}

export async function runAllRules({ onlyId = null } = {}) {
  if (running) return { skipped: true };
  running = true;
  let total = 0;
  try {
    const rules = (await getRules()).filter((r) => (onlyId ? r.id === onlyId : r.enabled));
    for (const rule of rules) {
      try {
        const { created } = await runRule(rule);
        total += created;
      } catch (e) {
        await addLog('error', `[${rule.name}] ${e.message}`);
        await patchRule(rule.id, { lastRun: Date.now(), lastResult: 'Lỗi: ' + e.message });
      }
    }
  } finally {
    running = false;
  }
  return { created: total };
}
