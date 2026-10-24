// Shopee Chat - Khách Chờ Trả Lời (v2.0.0)
// 1. Gọi API webchat (cùng token trang đang dùng) để biết khách nào nhắn mà shop chưa trả lời.
// 2. Gửi 1 câu chào qua giao diện (click mở hội thoại → điền ô chat → bấm gửi), có nhiều chốt an toàn.
// 3. Lưu danh sách khách chờ vào chrome.storage để bạn trả lời sau (panel nổi + popup).
/* global SCM */
(function () {
  'use strict';

  if (window.__SCM2_INJECTED__) return;
  window.__SCM2_INJECTED__ = true;

  const API = 'https://banhang.shopee.vn/webchat/api/v1.2';
  const TAB_ID = Math.random().toString(36).slice(2);
  const BACKLOG_DAYS = 3; // lần đầu chạy: chỉ đưa vào danh sách khách nhắn trong 3 ngày gần nhất
  const MAX_DETAIL_PER_POLL = 5;

  const SEL = {
    list: '[data-cy="webchat-conversation-list"]',
    row: '[data-cy="webchat-conversation-cell-root"]',
    rowName: '[data-cy="webchat-conversation-cell-name"]',
    detail: '[data-cy="webchat-conversation-detail"]',
    message: '[data-cy="webchat-message"]',
    inputBox: '[data-cy="webchat-conversation-detail-input"]'
  };

  let polling = false;
  let greeting = false;
  let pollTimer = null;
  let lastUserAction = Date.now();
  let currentTab = 'waiting';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- Theo dõi thao tác thật của người dùng (isTrusted) ----------
  ['keydown', 'mousedown', 'input'].forEach((type) =>
    document.addEventListener(type, (e) => { if (e.isTrusted) lastUserAction = Date.now(); }, true)
  );

  // ---------- API ----------
  function session() {
    try {
      const s = JSON.parse(localStorage.getItem('chat-session') || 'null');
      return s && s.token && s.user ? s : null;
    } catch (e) {
      return null;
    }
  }

  async function api(path, params) {
    const s = session();
    if (!s) throw new Error('NO_SESSION');
    const u = new URL(API + path);
    Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, v));
    const r = await fetch(u.toString(), { credentials: 'include', headers: { Authorization: 'Bearer ' + s.token } });
    if (r.status === 401 || r.status === 403) throw new Error('UNAUTHORIZED');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  const listConversations = () =>
    api('/conversations', { direction: 'older', limit: 50, type: 'all', biz_id: 0, on_message_received: true });

  const listMessages = (convId, shopId) =>
    api('/conversations/' + convId + '/messages', {
      shop_id: shopId, offset: 0, limit: 20, direction: 'older', biz_id: 0, on_message_received: true
    });

  function msgText(type, content) {
    if (content && content.text) return content.text;
    const labels = { item: 'Sản phẩm', product: 'Sản phẩm', order: 'Đơn hàng', image: 'Hình ảnh', sticker: 'Sticker', video: 'Video', voucher: 'Voucher' };
    return '[' + (labels[type] || type || 'tin nhắn') + ']';
  }

  // Shopee tự gửi các thẻ hệ thống dưới tên khách (vd "out_of_stock_reminder_card"): không phải khách hỏi.
  const CUSTOMER_TYPES = ['text', 'image', 'video', 'sticker', 'item', 'product', 'order', 'voucher', 'product_list', 'order_list'];
  function isCustomerMsg(type, content) {
    if (content && content.text) return true;
    return CUSTOMER_TYPES.includes(type);
  }

  const toMs = (t) => (t > 1e14 ? Math.floor(t / 1e6) : t > 1e11 ? t : t * 1000);

  // ---------- Quét ----------
  async function isLeader() {
    const m = await SCM.getMeta();
    const l = m.leader;
    if (l && l.id !== TAB_ID && Date.now() - l.at < 90000) return false;
    await SCM.saveMeta({ leader: { id: TAB_ID, at: Date.now() } });
    return true;
  }

  async function poll() {
    if (polling) return;
    polling = true;
    try {
      if (!(await isLeader())) return; // tab webchat khác đang quét, tab này chỉ hiển thị
      const s = session();
      if (!s) throw new Error('NO_SESSION');
      const settings = await SCM.getSettings();
      const q = await SCM.getQueue();
      const convs = await listConversations();
      const needDetail = applyConversations(convs, s, settings, q);

      for (const e of needDetail.slice(0, MAX_DETAIL_PER_POLL)) {
        try {
          const msgs = await listMessages(e.convId, s.shop.id);
          applyMessages(e, msgs, s.user.id, settings);
        } catch (err) {
          console.warn('[SCM] Lỗi đọc tin nhắn', e.name, err);
        }
      }

      cleanup(q, settings);
      await SCM.saveQueue(q);
      await SCM.saveMeta({ lastPollAt: Date.now(), lastError: '' });

      const target = pickGreetTarget(q, settings);
      if (target) await greet(target, settings);
    } catch (err) {
      const msg = err.message === 'NO_SESSION' || err.message === 'UNAUTHORIZED'
        ? 'Chưa đăng nhập hoặc phiên chat hết hạn: tải lại trang (F5).'
        : 'Lỗi quét: ' + err.message;
      await SCM.saveMeta({ lastPollAt: Date.now(), lastError: msg });
    } finally {
      polling = false;
    }
  }

  // Trả về các entry cần đọc chi tiết tin nhắn.
  function applyConversations(convs, s, settings, q) {
    const sellerId = s.user.id;
    const greetText = settings.greetText.trim();
    const backlogFrom = Date.now() - BACKLOG_DAYS * 86400000;
    const needDetail = [];

    for (const c of Array.isArray(convs) ? convs : []) {
      if (!c || !c.id || !c.to_id || c.is_blocked) continue;
      if (c.official_chat && c.official_chat.official_conv_type) continue; // chat hệ thống Shopee

      const lastAt = Date.parse(c.last_message_time) || Date.now();
      const text = msgText(c.latest_message_type, c.latest_message_content);
      const fromBuyer = c.latest_message_from_id === c.to_id;
      const fromSeller = c.latest_message_from_id === sellerId;
      let e = q[c.id];

      if (fromBuyer) {
        if (c.last_message_state === 'auto_reply') continue; // tin tự động của shop khác
        if (!isCustomerMsg(c.latest_message_type, c.latest_message_content)) continue; // thẻ hệ thống
        if (!e) {
          if (lastAt < backlogFrom) continue;
          e = q[c.id] = { convId: c.id, buyerId: c.to_id, status: 'waiting', firstAt: lastAt, msgs: [], greet: {} };
        }
        if (e.lastMsgId !== c.latest_message_id) {
          if (e.status !== 'waiting') {
            // khách nhắn tiếp sau khi đã xong → mở lại
            Object.assign(e, { status: 'waiting', firstAt: lastAt, msgs: [], greet: {}, doneAt: 0, doneReason: '' });
          }
          e.lastMsgId = c.latest_message_id;
          e.lastBuyerAt = lastAt;
          e.lastText = text;
          needDetail.push(e);
        }
        e.name = c.to_name;
        e.avatar = c.to_avatar;
        e.unread = c.unread_count;
      } else if (fromSeller && e && e.status === 'waiting') {
        const isOurGreet = text.trim() === greetText;
        if (isOurGreet || c.last_message_state === 'auto_reply') {
          if (isOurGreet && !e.greet.sentAt) e.greet = { sentAt: lastAt, by: 'api' };
          continue; // câu chào / tin tự động không tính là đã trả lời
        }
        e.status = 'done';
        e.doneAt = Date.now();
        e.doneReason = 'replied';
      }
    }
    return needDetail;
  }

  // Lấy các tin khách gửi liên tiếp kể từ lần cuối shop trả lời thật.
  function applyMessages(e, msgs, sellerId, settings) {
    if (!Array.isArray(msgs) || !msgs.length) return;
    const greetText = settings.greetText.trim();
    const sorted = msgs.slice().sort((a, b) => toMs(a.created_timestamp) - toMs(b.created_timestamp));
    const trailing = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
      const m = sorted[i];
      const text = msgText(m.type, m.content);
      if (m.from_id === sellerId) {
        if (text.trim() === greetText) continue; // bỏ qua câu chào của mình
        break;
      }
      if (!isCustomerMsg(m.type, m.content)) continue;
      trailing.unshift({ at: toMs(m.created_timestamp), text });
    }
    if (!trailing.length) return;
    e.msgs = trailing.slice(-6);
    e.firstAt = trailing[0].at;
  }

  function cleanup(q, settings) {
    const keepMs = settings.keepDoneHours * 3600000;
    for (const [id, e] of Object.entries(q)) {
      if (e.status === 'done' && Date.now() - (e.doneAt || 0) > keepMs) delete q[id];
    }
  }

  // ---------- Gửi câu chào ----------
  function pickGreetTarget(q, s) {
    if (!s.greetEnabled || greeting) return null;
    if (Date.now() - lastUserAction < s.idleSeconds * 1000) return null;
    const now = Date.now();
    return SCM.waitingList(q).find((e) =>
      !e.greet.sentAt && !e.greet.dryAt &&
      (e.greet.tries || 0) < 3 &&
      e.lastBuyerAt >= s.greetEnabledAt &&
      now - e.lastBuyerAt <= s.greetMaxAgeMin * 60000 &&
      !(e.greetLastAt && now - e.greetLastAt < s.greetCooldownHours * 3600000)
    ) || null;
  }

  function findRowInView(name) {
    return Array.from(document.querySelectorAll(SEL.row)).find((row) => {
      const n = row.querySelector(SEL.rowName);
      return n && ((n.getAttribute('title') || '').trim() === name || n.textContent.trim() === name);
    }) || null;
  }

  // Chế độ "Đang Phục Vụ Hôm Nay" chỉ hiện hội thoại hôm nay → chuyển sang "Tất cả cuộc trò chuyện".
  async function switchToAllConversations() {
    const wrapper = document.querySelector('[data-cy="webchat-conversation-list-wrapper"]');
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

  function setTextareaValue(ta, text) {
    // Dùng setter gốc để React nhận được giá trị mới.
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, text);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function sendIcon() {
    const box = document.querySelector(SEL.inputBox);
    if (!box) return null;
    // Nút gửi nằm cạnh dòng gợi ý "Nhấn tổ hợp phím Shift + Enter để cắt dòng".
    const hint = Array.from(box.querySelectorAll('span')).find((s) => /Shift\s*\+\s*Enter/i.test(s.textContent));
    if (hint && hint.parentElement) {
      const icon = hint.parentElement.querySelector('i');
      if (icon) return icon;
    }
    return null;
  }

  async function waitFor(fn, timeout) {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
      const v = fn();
      if (v) return v;
      await sleep(200);
    }
    return fn();
  }

  // Mở hội thoại theo tên khách; trả về textarea nếu mở đúng người.
  async function openConversation(name) {
    const row = await findRow(name);
    if (!row) throw new Error('Không thấy khách trong danh sách bên trái (để bộ lọc "Tất cả cuộc trò chuyện").');
    row.scrollIntoView({ block: 'center' });
    row.click();
    const ok = await waitFor(() => detailShowsName(name), 5000);
    if (!ok) throw new Error('Không mở được đúng hội thoại.');
    const ta = await waitFor(chatTextarea, 3000);
    if (!ta) throw new Error('Không thấy ô nhập tin nhắn.');
    return ta;
  }

  async function greet(e, settings) {
    greeting = true;
    const q = await SCM.getQueue();
    const entry = q[e.convId] || e;
    entry.greet = entry.greet || {};
    try {
      // Không chen ngang khi bạn đang soạn dở ở hội thoại đang mở.
      const current = chatTextarea();
      if (current && current.value.trim()) throw new Error('Ô chat đang có chữ bạn soạn dở, bỏ qua lần này.');

      const ta = await openConversation(entry.name);
      if (ta.value.trim()) throw new Error('Ô chat của khách này đang có bản nháp, không gửi.');
      if (Date.now() - lastUserAction < 3000) throw new Error('Bạn vừa thao tác, hoãn gửi.');

      const text = settings.greetText.trim();
      setTextareaValue(ta, text);
      await sleep(400);

      if (settings.dryRun) {
        entry.greet = { dryAt: Date.now() };
        return;
      }

      if (ta.value !== text) throw new Error('Không điền được câu chào.');
      const icon = sendIcon();
      if (icon) icon.click();
      let sent = await waitFor(() => !ta.isConnected || ta.value.trim() === '', 2000);
      if (!sent && ta.value === text) {
        ta.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true, cancelable: true }));
        sent = await waitFor(() => ta.value.trim() === '', 2000);
      }
      if (!sent) throw new Error('Đã điền câu chào nhưng chưa gửi được, kiểm tra ô chat.');

      entry.greet = { sentAt: Date.now(), by: 'ui' };
      entry.greetLastAt = Date.now();
    } catch (err) {
      entry.greet.tries = (entry.greet.tries || 0) + 1;
      entry.greet.error = err.message;
      console.warn('[SCM] Chào thất bại:', entry.name, err.message);
    } finally {
      q[entry.convId] = entry;
      await SCM.saveQueue(q);
      greeting = false;
    }
  }

  // ---------- Giao diện ----------
  function buildUI() {
    const trigger = document.createElement('div');
    trigger.id = 'scm-trigger';
    trigger.innerHTML = '<span>🕒 Chờ trả lời</span><b id="scm-count">0</b>';
    trigger.addEventListener('click', () => document.getElementById('scm-panel').classList.toggle('open'));
    document.body.appendChild(trigger);

    const panel = document.createElement('div');
    panel.id = 'scm-panel';
    panel.innerHTML = `
      <div class="scm-head">
        <b>Khách chờ trả lời</b>
        <button class="scm-x" id="scm-close" title="Đóng">&times;</button>
      </div>
      <div class="scm-status" id="scm-status"></div>
      <div class="scm-tabs">
        <div class="scm-tab active" data-tab="waiting">Đang chờ (<span id="scm-n-waiting">0</span>)</div>
        <div class="scm-tab" data-tab="done">Đã xong (<span id="scm-n-done">0</span>)</div>
        <div class="scm-tab" data-tab="settings">Cài đặt</div>
      </div>
      <div class="scm-body" id="scm-body"></div>
    `;
    document.body.appendChild(panel);

    panel.querySelector('#scm-close').addEventListener('click', () => panel.classList.remove('open'));
    panel.querySelectorAll('.scm-tab').forEach((t) =>
      t.addEventListener('click', () => {
        panel.querySelectorAll('.scm-tab').forEach((x) => x.classList.toggle('active', x === t));
        currentTab = t.dataset.tab;
        render();
      })
    );

    panel.addEventListener('click', async (ev) => {
      const btn = ev.target.closest('[data-act]');
      if (!btn) return;
      const id = btn.dataset.id;
      const q = await SCM.getQueue();
      const e = q[id];
      if (btn.dataset.act === 'open' && e) {
        try {
          const ta = await openConversation(e.name);
          ta.focus();
        } catch (err) {
          alert(err.message);
        }
      } else if (btn.dataset.act === 'done' && e) {
        Object.assign(e, { status: 'done', doneAt: Date.now(), doneReason: 'manual' });
        await SCM.saveQueue(q);
      } else if (btn.dataset.act === 'reopen' && e) {
        Object.assign(e, { status: 'waiting', doneAt: 0, doneReason: '' });
        await SCM.saveQueue(q);
      } else if (btn.dataset.act === 'save-settings') {
        await saveSettingsFromForm();
        btn.textContent = '✅ Đã lưu';
        setTimeout(() => (btn.textContent = '💾 Lưu cài đặt'), 1500);
      } else if (btn.dataset.act === 'poll') {
        poll();
      }
    });
  }

  function greetBadge(e) {
    const g = e.greet || {};
    if (g.sentAt) return `<span class="scm-tag ok">✅ Đã chào ${new Date(g.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>`;
    if (g.dryAt) return '<span class="scm-tag">🧪 Đã điền thử (chưa gửi)</span>';
    if (g.error) return `<span class="scm-tag warn" title="${SCM.esc(g.error)}">⚠️ ${SCM.esc(g.error)}</span>`;
    return '';
  }

  function card(e) {
    const msgs = (e.msgs && e.msgs.length ? e.msgs : [{ at: e.lastBuyerAt, text: e.lastText }])
      .slice(-4)
      .map((m) => `<div class="scm-msg"><span>${SCM.esc(m.text)}</span></div>`)
      .join('');
    const waiting = e.status === 'waiting';
    const since = waiting ? 'chờ ' + SCM.timeAgo(e.firstAt) : (e.doneReason === 'manual' ? 'đánh dấu xong' : 'đã trả lời') + ' ' + SCM.timeAgo(e.doneAt) + ' trước';
    return `
      <div class="scm-card ${waiting ? 'u-' + SCM.urgency(e.firstAt) : 'is-done'}">
        <div class="scm-card-top">
          <b class="scm-name">${SCM.esc(e.name)}</b>
          <span class="scm-since">${SCM.esc(since)}</span>
        </div>
        ${msgs}
        <div class="scm-card-foot">
          ${greetBadge(e)}
          <span class="scm-grow"></span>
          <button class="scm-btn" data-act="open" data-id="${SCM.esc(e.convId)}">💬 Mở chat</button>
          ${waiting
            ? `<button class="scm-btn ghost" data-act="done" data-id="${SCM.esc(e.convId)}">✔ Xong</button>`
            : `<button class="scm-btn ghost" data-act="reopen" data-id="${SCM.esc(e.convId)}">↩ Chờ lại</button>`}
        </div>
      </div>`;
  }

  async function renderSettings(body) {
    const s = await SCM.getSettings();
    body.innerHTML = `
      <label class="scm-row"><input type="checkbox" id="scm-s-greet" ${s.greetEnabled ? 'checked' : ''}> <b>Tự gửi câu chào cho khách mới</b></label>
      <textarea id="scm-s-text" rows="3">${SCM.esc(s.greetText)}</textarea>
      <label class="scm-row"><input type="checkbox" id="scm-s-dry" ${s.dryRun ? 'checked' : ''}> Chế độ thử: chỉ điền vào ô chat, KHÔNG bấm gửi</label>
      <label class="scm-row">Chỉ gửi khi tôi không thao tác <input type="number" id="scm-s-idle" min="5" max="600" value="${s.idleSeconds}"> giây</label>
      <label class="scm-row">Không chào tin cũ hơn <input type="number" id="scm-s-age" min="5" max="1440" value="${s.greetMaxAgeMin}"> phút</label>
      <label class="scm-row">Quét API mỗi <input type="number" id="scm-s-poll" min="10" max="300" value="${s.pollSeconds}"> giây</label>
      <label class="scm-row"><input type="checkbox" id="scm-s-open" ${s.autoOpenTab ? 'checked' : ''}> Tự mở lại tab webchat (ghim) nếu lỡ đóng</label>
      <button class="scm-btn" data-act="save-settings">💾 Lưu cài đặt</button>
      <p class="scm-note">
        Câu chào chỉ gửi cho khách nhắn <b>sau khi bật</b>, mỗi hội thoại 1 lần / ${s.greetCooldownHours} giờ.
        Không gửi nếu ô chat đang có chữ hoặc bạn vừa thao tác. Câu chào <b>không</b> làm khách rời khỏi danh sách chờ:
        khách chỉ được tính "xong" khi shop gửi tin khác câu chào.
      </p>
      <p class="scm-note">
        Shopee cũng có sẵn "Tin nhắn tự động" trong Cài đặt Chat; đừng bật cả hai kẻo khách nhận 2 lời chào.
      </p>`;
  }

  async function saveSettingsFromForm() {
    const cur = await SCM.getSettings();
    const greetEnabled = document.getElementById('scm-s-greet').checked;
    const num = (id, def) => {
      const v = parseInt(document.getElementById(id).value, 10);
      return Number.isFinite(v) && v > 0 ? v : def;
    };
    const text = document.getElementById('scm-s-text').value.trim();
    await SCM.saveSettings({
      greetEnabled,
      greetEnabledAt: greetEnabled && !cur.greetEnabled ? Date.now() : cur.greetEnabledAt,
      greetText: text || cur.greetText,
      dryRun: document.getElementById('scm-s-dry').checked,
      idleSeconds: num('scm-s-idle', cur.idleSeconds),
      greetMaxAgeMin: num('scm-s-age', cur.greetMaxAgeMin),
      pollSeconds: Math.max(10, num('scm-s-poll', cur.pollSeconds)),
      autoOpenTab: document.getElementById('scm-s-open').checked
    });
    schedulePoll();
  }

  async function render() {
    const body = document.getElementById('scm-body');
    if (!body) return;
    const [q, meta, s] = await Promise.all([SCM.getQueue(), SCM.getMeta(), SCM.getSettings()]);
    const waiting = SCM.waitingList(q);
    const done = Object.values(q).filter((e) => e.status === 'done').sort((a, b) => b.doneAt - a.doneAt);

    document.getElementById('scm-count').textContent = waiting.length;
    document.getElementById('scm-trigger').classList.toggle('has', waiting.length > 0);
    document.getElementById('scm-n-waiting').textContent = waiting.length;
    document.getElementById('scm-n-done').textContent = done.length;

    const statusEl = document.getElementById('scm-status');
    const mode = s.greetEnabled ? (s.dryRun ? '🧪 Chào: chế độ thử' : '🤖 Chào tự động: BẬT') : '⚪ Chào tự động: TẮT';
    statusEl.innerHTML = `${mode} · Quét lúc ${meta.lastPollAt ? new Date(meta.lastPollAt).toLocaleTimeString('vi-VN') : '—'}
      <button class="scm-link" data-act="poll">Quét ngay</button>
      ${meta.lastError ? `<div class="scm-err">${SCM.esc(meta.lastError)}</div>` : ''}`;

    if (currentTab === 'settings') {
      if (!body.querySelector('#scm-s-text')) await renderSettings(body);
      return;
    }
    const items = currentTab === 'waiting' ? waiting : done;
    body.innerHTML = items.length
      ? items.map(card).join('')
      : `<div class="scm-empty">${currentTab === 'waiting' ? '🎉 Không có khách nào đang chờ.' : 'Chưa có hội thoại nào xong.'}</div>`;
  }

  // ---------- Khởi động ----------
  async function schedulePoll() {
    const s = await SCM.getSettings();
    clearInterval(pollTimer);
    pollTimer = setInterval(poll, s.pollSeconds * 1000);
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes[SCM.K.queue] || changes[SCM.K.meta] || changes[SCM.K.settings])) render();
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'scm-poll') {
      poll();
    } else if (msg && msg.type === 'scm-open') {
      SCM.getQueue().then((q) => {
        const e = q[msg.convId];
        if (e) openConversation(e.name).then((ta) => ta.focus()).catch((err) => alert(err.message));
      });
    }
    sendResponse({ ok: true });
  });

  window.addEventListener('beforeunload', async () => {
    const m = await SCM.getMeta();
    if (m.leader && m.leader.id === TAB_ID) SCM.saveMeta({ leader: null });
  });

  buildUI();
  render();
  setInterval(render, 60000); // cập nhật "chờ X phút"
  schedulePoll();
  setTimeout(poll, 2500);
})();
