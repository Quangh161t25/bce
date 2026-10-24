/* global SCM */
document.addEventListener('DOMContentLoaded', async () => {
  const [q, meta, s] = await Promise.all([SCM.getQueue(), SCM.getMeta(), SCM.getSettings()]);
  const waiting = SCM.waitingList(q);

  document.getElementById('count').textContent = waiting.length;
  const mode = s.greetEnabled ? (s.dryRun ? 'Chào: thử' : 'Chào tự động: BẬT') : 'Chào tự động: TẮT';
  const at = meta.lastPollAt ? 'quét ' + SCM.timeAgo(meta.lastPollAt) + ' trước' : 'chưa quét';
  document.getElementById('status').textContent = meta.lastError || `${mode} · ${at}`;
  if (meta.lastError) document.getElementById('status').classList.add('err');

  const list = document.getElementById('list');
  list.innerHTML = waiting.length
    ? waiting.map((e) => {
        const last = e.msgs && e.msgs.length ? e.msgs[e.msgs.length - 1].text : e.lastText;
        const greeted = e.greet && e.greet.sentAt ? ' · ✅ đã chào' : '';
        return `
          <div class="item u-${SCM.urgency(e.firstAt)}" data-id="${SCM.esc(e.convId)}">
            <div class="row"><b>${SCM.esc(e.name)}</b><span>chờ ${SCM.esc(SCM.timeAgo(e.firstAt))}${greeted}</span></div>
            <div class="msg">${SCM.esc(last)}</div>
          </div>`;
      }).join('')
    : '<div class="empty">🎉 Không có khách nào đang chờ.</div>';

  list.addEventListener('click', (ev) => {
    const item = ev.target.closest('.item');
    if (!item) return;
    chrome.runtime.sendMessage({ type: 'scm-open-from-popup', convId: item.dataset.id });
    window.close();
  });

  document.getElementById('btn-open-webchat').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://banhang.shopee.vn/new-webchat/conversations' });
  });
});
