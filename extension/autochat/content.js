// Auto Chat (extension/autochat/): content script trên trang webchat Shopee.
// Việc quét khách và tự nhắn chạy ngầm trong background qua API (autochat/engine.js), không đụng giao diện.
// File này chỉ: hiện panel nổi "🤖 Auto Chat" (danh sách khách chờ, đổi chế độ nhanh) và
// mở đúng hội thoại của khách khi bấm "Mở chat" (ở đây hoặc ở side panel).
/* global AUTOCHAT */
(function () {
  'use strict';

  if (window.__AUTOCHAT_INJECTED__ || window !== window.top) return;
  window.__AUTOCHAT_INJECTED__ = true;

  const SEL = {
    list: '[data-cy="webchat-conversation-list"]',
    listWrapper: '[data-cy="webchat-conversation-list-wrapper"]',
    row: '[data-cy="webchat-conversation-cell-root"]',
    rowName: '[data-cy="webchat-conversation-cell-name"]',
    detail: '[data-cy="webchat-conversation-detail"]',
    message: '[data-cy="webchat-message"]',
    inputBox: '[data-cy="webchat-conversation-detail-input"]'
  };

  let currentTab = 'waiting';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function waitFor(fn, timeout) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      const v = fn();
      if (v) return v;
      await sleep(200);
    }
    return fn();
  }

  // ---------- Mở đúng hội thoại của khách ----------
  function findRowInView(name) {
    return Array.from(document.querySelectorAll(SEL.row)).find((row) => {
      const n = row.querySelector(SEL.rowName);
      return n && ((n.getAttribute('title') || '').trim() === name || n.textContent.trim() === name);
    }) || null;
  }

  // Chế độ "Đang Phục Vụ Hôm Nay" chỉ hiện hội thoại hôm nay → chuyển sang "Tất cả cuộc trò chuyện".
  async function switchToAllConversations() {
    const wrapper = document.querySelector(SEL.listWrapper);
    if (!wrapper) return false;
    const tab = Array.from(wrapper.querySelectorAll('div')).find((el) =>
      el.childElementCount === 0 && el.textContent.trim() === 'Tất cả cuộc trò chuyện'
    );
    if (!tab) return false;
    tab.click();
    await sleep(1200);
    return true;
  }

  // Danh sách là React Virtualized: chỉ có các dòng đang hiển thị trong DOM → cuộn để tìm.
  async function findRow(name, retried) {
    let row = findRowInView(name);
    if (row) return row;
    row = await scrollFindRow(name);
    if (row || retried) return row;
    return (await switchToAllConversations()) ? findRow(name, true) : null;
  }

  async function scrollFindRow(name) {
    let row;
    const grid = document.querySelector(SEL.list + ' .ReactVirtualized__Grid') || document.querySelector('.ReactVirtualized__List');
    if (!grid) return null;
    grid.scrollTop = 0;
    await sleep(300);
    for (let i = 0; i < 20; i++) {
      row = findRowInView(name);
      if (row) return row;
      const before = grid.scrollTop;
      grid.scrollTop += Math.max(200, grid.clientHeight * 0.8);
      await sleep(250);
      if (grid.scrollTop === before) break;
    }
    row = findRowInView(name);
    if (!row) grid.scrollTop = 0;
    return row;
  }

  function detailShowsName(name) {
    const det = document.querySelector(SEL.detail);
    if (!det) return false;
    return Array.from(det.querySelectorAll('div, span')).some((el) =>
      el.childElementCount === 0 && el.textContent.trim() === name && !el.closest(SEL.message)
    );
  }

  function chatTextarea() {
    const box = document.querySelector(SEL.inputBox);
    return box ? box.querySelector('textarea') : null;
  }

  // Webchat không mở hội thoại theo link (đã thử /conversations/{id} và các tham số ?id → 404 / bỏ qua),
  // nên gõ tên khách vào ô "Tìm kiếm" của danh sách rồi click kết quả trong mục "Khách Hàng".
  function setInputValue(input, text) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  async function openBySearch(name) {
    const input = document.querySelector(SEL.list + ' input[placeholder="Tìm kiếm"]');
    const wrapper = document.querySelector(SEL.listWrapper);
    if (!input || !wrapper) return false;
    input.focus();
    setInputValue(input, name);
    // Kết quả tìm kiếm không dùng ô hội thoại thường (cell-root), chỉ có dòng tên khách.
    const hit = await waitFor(() => Array.from(wrapper.querySelectorAll('div, span')).find((el) =>
      el.childElementCount === 0 && el.textContent.trim() === name && !el.closest(SEL.row)
    ), 5000);
    if (hit) hit.click();
    await sleep(300);
    setInputValue(input, ''); // xoá ô tìm kiếm để danh sách trở lại bình thường
    input.blur();
    return !!hit;
  }

  // Mở hội thoại theo tên khách; trả về ô nhập tin nhắn nếu mở đúng người.
  async function openConversation(name) {
    if (detailShowsName(name) && chatTextarea()) return chatTextarea(); // đang mở sẵn
    const row = findRowInView(name);
    if (row) {
      row.scrollIntoView({ block: 'center' });
      row.click();
    } else if (!(await openBySearch(name))) {
      const found = await findRow(name);
      if (!found) throw new Error('Không tìm thấy khách, kể cả bằng ô Tìm kiếm của webchat.');
      found.scrollIntoView({ block: 'center' });
      found.click();
    }
    const ok = await waitFor(() => detailShowsName(name), 5000);
    if (!ok) throw new Error('Không mở được đúng hội thoại.');
    const ta = await waitFor(chatTextarea, 3000);
    if (!ta) throw new Error('Không thấy ô nhập tin nhắn.');
    return ta;
  }

  async function openByConvId(convId) {
    const e = (await AUTOCHAT.getQueue())[convId];
    if (!e) return;
    try {
      (await openConversation(e.name)).focus();
    } catch (err) {
      alert(err.message);
    }
  }

  // ---------- Giao diện ----------
  function buildUI() {
    const trigger = document.createElement('div');
    trigger.id = 'ac-trigger';
    trigger.innerHTML = '<span>🤖 Auto Chat</span><b id="ac-count">0</b>';
    trigger.addEventListener('click', () => document.getElementById('ac-panel').classList.toggle('open'));
    document.body.appendChild(trigger);

    const panel = document.createElement('div');
    panel.id = 'ac-panel';
    panel.innerHTML = `
      <div class="ac-head">
        <b>🤖 Auto Chat · Khách chờ trả lời</b>
        <button class="ac-x" id="ac-close" title="Đóng">&times;</button>
      </div>
      <div class="ac-modes" id="ac-modes">
        ${Object.entries(AUTOCHAT.MODES).map(([k, v]) => `<button data-mode="${k}">${v}</button>`).join('')}
      </div>
      <div class="ac-status" id="ac-status"></div>
      <div class="ac-tabs">
        <div class="ac-tab active" data-tab="waiting">Đang chờ (<span id="ac-n-waiting">0</span>)</div>
        <div class="ac-tab" data-tab="done">Đã xong (<span id="ac-n-done">0</span>)</div>
      </div>
      <div class="ac-body" id="ac-body"></div>
      <div class="ac-foot">Câu chào, giãn cách và nhật ký: tab <b>Auto Chat</b> ở side panel của extension.</div>
    `;
    document.body.appendChild(panel);

    panel.querySelector('#ac-close').addEventListener('click', () => panel.classList.remove('open'));
    panel.querySelectorAll('.ac-tab').forEach((t) =>
      t.addEventListener('click', () => {
        panel.querySelectorAll('.ac-tab').forEach((x) => x.classList.toggle('active', x === t));
        currentTab = t.dataset.tab;
        render();
      })
    );
    panel.querySelector('#ac-modes').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-mode]');
      if (b) AUTOCHAT.saveSettings({ mode: b.dataset.mode });
    });

    panel.addEventListener('click', async (ev) => {
      const btn = ev.target.closest('[data-act]');
      if (!btn) return;
      const q = await AUTOCHAT.getQueue();
      const e = q[btn.dataset.id];
      if (!e) return;
      if (btn.dataset.act === 'open') {
        openByConvId(e.convId);
      } else if (btn.dataset.act === 'done') {
        Object.assign(e, { status: 'done', doneAt: Date.now(), doneReason: 'manual' });
        await AUTOCHAT.saveQueue(q);
      } else if (btn.dataset.act === 'reopen') {
        Object.assign(e, { status: 'waiting', doneAt: 0, doneReason: '' });
        await AUTOCHAT.saveQueue(q);
      }
    });
  }

  function card(e) {
    const msgs = (e.msgs && e.msgs.length ? e.msgs : [{ text: e.lastText }])
      .slice(-4)
      .map((m) => `<div class="ac-msg"><span>${AUTOCHAT.esc(m.text)}</span></div>`)
      .join('');
    const waiting = e.status === 'waiting';
    const since = waiting ? 'chờ ' + AUTOCHAT.timeAgo(e.firstAt) : (e.doneReason === 'manual' ? 'đánh dấu xong' : 'đã trả lời') + ' ' + AUTOCHAT.timeAgo(e.doneAt) + ' trước';
    const id = AUTOCHAT.esc(e.convId);
    return `
      <div class="ac-card ${waiting ? 'u-' + AUTOCHAT.urgency(e.firstAt) : 'is-done'}">
        <div class="ac-card-top">
          <b class="ac-name">${AUTOCHAT.esc(e.name)}</b>
          <span class="ac-since">${AUTOCHAT.esc(since)}</span>
        </div>
        ${msgs}
        <div class="ac-card-foot">
          ${AUTOCHAT.greetTags(e, 'ac-tag')}
          <span class="ac-grow"></span>
          <button class="ac-btn" data-act="open" data-id="${id}">💬 Mở chat</button>
          ${waiting
            ? `<button class="ac-btn ghost" data-act="done" data-id="${id}">✔ Xong</button>`
            : `<button class="ac-btn ghost" data-act="reopen" data-id="${id}">↩ Chờ lại</button>`}
        </div>
      </div>`;
  }

  async function render() {
    const body = document.getElementById('ac-body');
    if (!body) return;
    const [q, meta, s] = await Promise.all([AUTOCHAT.getQueue(), AUTOCHAT.getMeta(), AUTOCHAT.getSettings()]);
    const waiting = s.mode === 'off' ? [] : AUTOCHAT.waitingList(q);
    const done = Object.values(q).filter((e) => e.status === 'done').sort((a, b) => b.doneAt - a.doneAt);

    document.getElementById('ac-count').textContent = s.mode === 'off' ? 'TẮT' : waiting.length;
    document.getElementById('ac-trigger').classList.toggle('has', waiting.length > 0);
    document.getElementById('ac-trigger').classList.toggle('auto', s.mode === 'auto');
    document.getElementById('ac-n-waiting').textContent = waiting.length;
    document.getElementById('ac-n-done').textContent = done.length;
    document.querySelectorAll('#ac-modes [data-mode]').forEach((b) =>
      b.classList.toggle('active', b.dataset.mode === s.mode)
    );

    const when = meta.lastPollAt ? 'quét lúc ' + new Date(meta.lastPollAt).toLocaleTimeString('vi-VN') : 'chưa quét';
    document.getElementById('ac-status').innerHTML = s.mode === 'off'
      ? 'Đang TẮT: không quét, không gửi.'
      : `${s.mode === 'auto' ? '🟢 Đang chạy ngầm, tự nhắn qua API' : '👀 Chỉ theo dõi, không gửi'} · ${AUTOCHAT.esc(when)}
        ${meta.lastError ? `<div class="ac-err">${AUTOCHAT.esc(meta.lastError)}</div>` : ''}`;

    const items = currentTab === 'waiting' ? waiting : done;
    body.innerHTML = items.length
      ? items.map(card).join('')
      : `<div class="ac-empty">${currentTab === 'waiting' ? (s.mode === 'off' ? 'Auto Chat đang tắt.' : '🎉 Không có khách nào đang chờ.') : 'Chưa có hội thoại nào xong.'}</div>`;
  }

  // ---------- Khởi động ----------
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes[AUTOCHAT.K.queue] || changes[AUTOCHAT.K.meta] || changes[AUTOCHAT.K.settings])) render();
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'autochat-open') {
      // Tab vừa được mở: chờ danh sách hội thoại hiện ra rồi mới tìm khách.
      waitFor(() => document.querySelector(SEL.list), 15000).then(() => openByConvId(msg.convId));
    }
    sendResponse({ ok: true });
  });

  buildUI();
  render();
  setInterval(render, 60000); // cập nhật "chờ X phút"
})();
