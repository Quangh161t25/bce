// Auto Chat: bộ máy chạy ngầm trong background (importScripts sau autochat/shared.js).
// Mỗi lượt (alarm 30 giây): gọi API webchat bằng token phiên chat → cập nhật danh sách khách chờ →
// ở chế độ "Tự nhắn" thì gửi tin qua API (POST /webchat/api/v1.2/messages) cho khách đang là người nhắn cuối.
// Không cần mở tab webchat, không click giao diện. API chỉ cần token, không cần cookie.
/* global AUTOCHAT */
/* exported AUTOCHAT_ENGINE */
var AUTOCHAT_ENGINE = (function () {
  'use strict';

  const API = 'https://banhang.shopee.vn/webchat/api/v1.2';
  const BACKLOG_DAYS = 3; // lần đầu chạy: chỉ đưa vào danh sách khách nhắn trong 3 ngày gần nhất
  const MAX_DETAIL_PER_TICK = 10;
  const MAX_SEND_PER_TICK = 5;

  let running = false;

  // ---------- API ----------
  class SessionError extends Error {}

  async function api(session, path, params, body) {
    const u = new URL(API + path);
    Object.entries(params || {}).forEach(([k, v]) => u.searchParams.set(k, v));
    const init = {
      method: body ? 'POST' : 'GET',
      credentials: 'omit',
      headers: { Authorization: 'Bearer ' + session.token, Accept: 'application/json, text/plain, */*' }
    };
    if (body) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    const r = await fetch(u.toString(), init);
    if (r.status === 401 || r.status === 403) throw new SessionError('UNAUTHORIZED');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

  const listConversations = (s) =>
    api(s, '/conversations', { direction: 'older', limit: 50, type: 'all', biz_id: 0, on_message_received: true });

  const listMessages = (s, convId) =>
    api(s, '/conversations/' + convId + '/messages', {
      shop_id: s.shopId, offset: 0, limit: 20, direction: 'older', biz_id: 0, on_message_received: true
    });

  function genUuid() {
    // 1. Thử dùng self.crypto.randomUUID nếu có (tránh dùng bare crypto vì bị thư viện jsrsasign tạo biến var trùng)
    try {
      const c = (typeof self !== 'undefined' && self.crypto) || (typeof window !== 'undefined' && window.crypto);
      if (c && typeof c.randomUUID === 'function') {
        return c.randomUUID();
      }
    } catch (_) {}

    // 2. Thử dùng self.crypto.getRandomValues nếu có
    try {
      const c = (typeof self !== 'undefined' && self.crypto) || (typeof window !== 'undefined' && window.crypto);
      if (c && typeof c.getRandomValues === 'function') {
        const buf = new Uint8Array(16);
        c.getRandomValues(buf);
        buf[6] = (buf[6] & 0x0f) | 0x40; // Version 4
        buf[8] = (buf[8] & 0x3f) | 0x80; // Variant 10xx
        const hex = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }
    } catch (_) {}

    // 3. Fallback Math.random chuẩn RFC4122 v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
      const r = (Math.random() * 16) | 0;
      const v = ch === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Cùng định dạng với tin webchat tự gửi (bắt từ request thật).
  const sendText = (s, e, text) =>
    api(s, '/messages', { uuid: genUuid() }, {
      request_id: genUuid(),
      to_id: e.buyerId,
      type: 'text',
      content: { text, uid: genUuid() },
      shop_id: s.shopId,
      chat_send_option: { force_send_cancel_order_warning: false, comply_cancel_order_warning: false },
      source_content: {},
      entry_point: '',
      biz_id: 0,
      conversation_id: e.convId
    });

  // ---------- Phân loại tin ----------
  function msgText(type, content) {
    if (content && content.text) return content.text;
    const labels = {
      item: 'Sản phẩm', product: 'Sản phẩm', variation_card: 'Phân loại sản phẩm', bundle_message: 'Combo sản phẩm',
      order: 'Đơn hàng', image: 'Hình ảnh', sticker: 'Sticker', video: 'Video', voucher: 'Voucher',
      faq_liveagent: 'Khách muốn gặp nhân viên'
    };
    return '[' + (labels[type] || type || 'tin nhắn') + ']';
  }

  // Tin tự động của Shopee: "auto_reply" (tin tự động) và "offwork_autoreply" (tin ngoài giờ làm việc).
  // Có ở cả last_message_state của hội thoại lẫn status của từng tin nhắn.
  const isAuto = (state) => /auto_?reply/i.test(state || '');

  // Tin thật của khách: bỏ tin tự động và các thẻ hệ thống Shopee gửi dưới tên khách
  // (vd "out_of_stock_reminder_card", "notification").
  function isCustomerMsg(type, status) {
    if (isAuto(status)) return false;
    return !/notification|reminder/i.test(type || '');
  }

  const toMs = (t) => (t > 1e14 ? Math.floor(t / 1e6) : t > 1e11 ? t : t * 1000);

  // Tin do chính Auto Chat gửi (câu chào / câu nhắn tiếp): không tính là shop đã trả lời thật.
  const isOurText = (text, st) => [st.greetText, st.followText].some((t) => t && text.trim() === t.trim());

  // ---------- Cập nhật danh sách ----------
  // Trả về các entry cần đọc chi tiết tin nhắn.
  function applyConversations(convs, sellerId, st, q) {
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
        // tin tự động của shop khác / thẻ hệ thống: không phải khách hỏi
        if (!isCustomerMsg(c.latest_message_type, c.last_message_state)) continue;
        if (!e) {
          if (lastAt < backlogFrom) continue;
          e = q[c.id] = { convId: c.id, buyerId: c.to_id, status: 'waiting', firstAt: lastAt, msgs: [], greet: {} };
        }
        if (e.lastMsgId !== c.latest_message_id) {
          if (e.status !== 'waiting') {
            // khách nhắn tiếp sau khi đã xong → mở lại
            Object.assign(e, { status: 'waiting', firstAt: lastAt, msgs: [], greet: {}, acknowledged: false, doneAt: 0, doneReason: '' });
          }
          e.lastMsgId = c.latest_message_id;
          e.lastBuyerAt = lastAt;
          e.lastText = text;
          needDetail.push(e);
        }
        e.lastIsBuyer = true; // khách đang là người nhắn cuối → cần nhắn lại
        e.name = c.to_name;
        e.unread = c.unread_count;
      } else if (fromSeller) {
        const notReal = isOurText(text, st) || isAuto(c.last_message_state);
        if (!e && notReal && lastAt >= backlogFrom) {
          // Khách mới chỉ nhận tin tự động của Shopee (vd "Ngoài giờ làm việc"): vẫn đang chờ người trả lời.
          e = q[c.id] = { convId: c.id, buyerId: c.to_id, name: c.to_name, status: 'waiting', firstAt: lastAt, msgs: [], greet: {} };
          e.lastMsgId = c.latest_message_id;
          e.lastBuyerAt = lastAt;
          needDetail.push(e);
        }
        if (!e || e.status !== 'waiting') continue;
        e.lastIsBuyer = false;
        if (notReal) continue; // câu chào / câu nhắn tiếp / tin tự động không tính là đã trả lời
        e.status = 'done';
        e.doneAt = Date.now();
        e.doneReason = 'replied';
      }
    }
    return needDetail;
  }

  // Lấy các tin khách gửi kể từ lần cuối shop trả lời thật (bỏ qua tin của Auto Chat và tin tự động của Shopee).
  // Trả về:
  //   waiting      số tin khách đang chờ
  //   lastIsBuyer  tin mới nhất (bỏ thẻ hệ thống) là của khách → cần nhắn lại để shop là người nhắn cuối
  //   acknowledged trong đợt chờ này shop đã có tin tự động / tin Auto Chat (vd tin "Ngoài giờ làm việc")
  //                → lần sau gửi "câu nhắn tiếp" thay vì câu chào
  function applyMessages(e, msgs, sellerId, st) {
    const res = { waiting: 0, lastIsBuyer: false, acknowledged: false };
    if (!Array.isArray(msgs) || !msgs.length) return res;
    const sorted = msgs.slice().sort((a, b) => toMs(a.created_timestamp) - toMs(b.created_timestamp));
    const trailing = [];
    let newestSeen = false;
    for (let i = sorted.length - 1; i >= 0; i--) {
      const m = sorted[i];
      const text = msgText(m.type, m.content);
      if (m.from_id === sellerId) {
        newestSeen = true;
        if (isOurText(text, st) || isAuto(m.status)) {
          res.acknowledged = true;
          continue;
        }
        break; // shop đã trả lời thật: các tin cũ hơn không còn chờ
      }
      if (!isCustomerMsg(m.type, m.status)) continue;
      if (!newestSeen) res.lastIsBuyer = true;
      newestSeen = true;
      trailing.unshift({ at: toMs(m.created_timestamp), text });
    }
    res.waiting = trailing.length;
    e.lastIsBuyer = res.lastIsBuyer;
    if (!trailing.length) return res;
    e.msgs = trailing.slice(-6);
    e.firstAt = trailing[0].at;
    e.lastBuyerAt = trailing[trailing.length - 1].at;
    e.acknowledged = res.acknowledged;
    return res;
  }

  function cleanup(q, st) {
    const keepMs = st.keepDoneHours * 3600000;
    for (const [id, e] of Object.entries(q)) {
      if (e.status === 'done' && Date.now() - (e.doneAt || 0) > keepMs) delete q[id];
    }
  }

  // ---------- Chọn khách cần nhắn ----------
  // Lần đầu trong đợt chờ: câu chào. Khách nhắn tiếp (hoặc Shopee đã tự trả lời trước): câu nhắn tiếp,
  // chỉ gửi khi khách đã chờ followDelaySec giây chưa ai trả lời và cách tin Auto Chat trước ≥ followGapMin phút.
  const greetedThisRound = (e) => !!(e.greet.sentAt && e.greet.sentAt >= e.firstAt) || !!e.acknowledged;

  function pickTargets(q, st, now) {
    return AUTOCHAT.waitingList(q).filter((e) => {
      const g = e.greet || (e.greet = {});
      if (!e.lastIsBuyer) return false; // shop đang là người nhắn cuối
      if (e.lastBuyerAt < st.autoSince || now - e.lastBuyerAt > st.greetMaxAgeMin * 60000) return false;
      if (g.failMsgId === e.lastMsgId && (g.tries || 0) >= 3) return false;
      if (!greetedThisRound(e)) return true;
      return now - e.lastBuyerAt >= st.followDelaySec * 1000 &&
        !(g.sentAt && now - g.sentAt < st.followGapMin * 60000);
    });
  }

  async function sendTo(s, e, st) {
    // Đọc lại tin nhắn ngay trước khi gửi: nếu Shopee vừa tự trả lời (vd tin ngoài giờ)
    // hoặc nhân viên vừa trả lời thì shop đã là người nhắn cuối → không gửi.
    const fresh = applyMessages(e, await listMessages(s, e.convId), s.userId, st);
    if (!fresh.lastIsBuyer) return false;
    const isFollow = greetedThisRound(e);
    const text = (isFollow ? st.followText : st.greetText).trim();
    const kind = isFollow ? 'follow' : 'greet';
    try {
      const res = await sendText(s, e, text);
      if (!res || !res.id) throw new Error('Shopee không trả về id tin nhắn');
      e.greet = { sentAt: Date.now(), count: (e.greet.count || 0) + 1, lastKind: kind };
      e.lastIsBuyer = false;
      await AUTOCHAT.addLog({ at: Date.now(), name: e.name, kind, text, ok: true });
      return true;
    } catch (err) {
      if (err instanceof SessionError) throw err;
      const g = e.greet;
      g.tries = g.failMsgId === e.lastMsgId ? (g.tries || 0) + 1 : 1;
      g.failMsgId = e.lastMsgId;
      g.error = 'Gửi lỗi: ' + err.message;
      await AUTOCHAT.addLog({ at: Date.now(), name: e.name, kind, text, ok: false, error: err.message });
      return false;
    }
  }

  // ---------- Một lượt chạy ----------
  async function tick() {
    if (running) return;
    running = true;
    try {
      const st = await AUTOCHAT.getSettings();
      if (st.mode === 'off') return;
      const s = await AUTOCHAT.getSession();
      if (!s || !s.token) {
        await AUTOCHAT.saveMeta({ lastPollAt: Date.now(), lastError: 'Chưa có phiên Shopee: mở Kênh Người Bán (banhang.shopee.vn) 1 lần.' });
        return;
      }

      const q = await AUTOCHAT.getQueue();
      // Tự động xóa lỗi cũ do bug randomUUID gây ra để khách được gửi lại ngay
      for (const e of Object.values(q)) {
        if (e.greet && e.greet.error && e.greet.error.includes('randomUUID')) {
          delete e.greet.error;
          delete e.greet.failMsgId;
          e.greet.tries = 0;
        }
      }
      const needDetail = applyConversations(await listConversations(s), s.userId, st, q);
      for (const e of needDetail.slice(0, MAX_DETAIL_PER_TICK)) {
        try {
          const res = applyMessages(e, await listMessages(s, e.convId), s.userId, st);
          // Không còn tin nào của khách đang chờ (shop đã trả lời thật trước đó) → không phải khách chờ.
          if (!res.waiting && !e.msgs.length) delete q[e.convId];
        } catch (err) {
          if (err instanceof SessionError) throw err;
          console.warn('[AutoChat] Lỗi đọc tin nhắn', e.name, err);
        }
      }
      cleanup(q, st);

      let sent = 0;
      if (st.mode === 'auto') {
        const log = await AUTOCHAT.getLog();
        const hourAgo = Date.now() - 3600000;
        let budget = st.maxPerHour - log.filter((l) => l.ok && l.at > hourAgo).length;
        for (const e of pickTargets(q, st, Date.now()).slice(0, MAX_SEND_PER_TICK)) {
          if (budget <= 0) break;
          if (await sendTo(s, e, st)) {
            sent++;
            budget--;
          }
        }
      }

      await AUTOCHAT.saveQueue(q);
      await AUTOCHAT.saveMeta({ lastPollAt: Date.now(), lastError: '', lastSent: sent });
    } catch (err) {
      const msg = err instanceof SessionError
        ? 'Phiên Shopee hết hạn: mở Kênh Người Bán (banhang.shopee.vn) để cập nhật lại.'
        : 'Lỗi quét: ' + err.message;
      await AUTOCHAT.saveMeta({ lastPollAt: Date.now(), lastError: msg });
    } finally {
      running = false;
    }
  }

  return { tick, applyMessages, pickTargets };
})();
