// =========================================================================
// TỰ ĐỘNG TRẢ LỜI CÁC CUỘC CHAT CHƯA ĐỌC TRÊN SHOPEE WEBCHAT (Gemini)
// Chế độ: draft = soạn sẵn chờ duyệt · auto = tự gửi · hybrid = câu dễ tự gửi, câu khó chờ duyệt
// Chỉ gửi khi: khung chat đang mở đúng tên khách VÀ tin cuối cùng là của khách.
// Dùng lại hàm của chat_ai_tab.js qua window.__chatAi.
// =========================================================================

(function () {
  const $ = (id) => document.getElementById(id);
  const section = $("car-section");
  if (!section || !window.__chatAi) return;
  const { extractShopeeChatDataInPage, fillShopeeChatInPageDirect, callXkiroDeepseekChat } = window.__chatAi;

  const PREFS_KEY = "chatAutoReplyPrefs"; // { mode, enabled, interval, max, delay, note }
  const QUEUE_KEY = "chatAutoReplyQueue"; // [{ id, name, question, reply, hard, at }]
  const MODE_HINTS = {
    draft: "Soạn sẵn câu trả lời và xếp vào hàng chờ. Bạn xem, sửa rồi bấm Gửi.",
    auto: "⚠️ Tự gửi luôn cho khách, không cần duyệt. Xem lại trong nhật ký.",
    hybrid: "Câu dễ (chào hỏi, còn hàng, giao hàng...) tự gửi. Câu về giá, đổi trả, hủy, khiếu nại chờ bạn duyệt."
  };

  let prefs = { mode: "draft", enabled: false, interval: 60, max: 10, delay: 8, note: "" };
  let queue = [];
  let running = false;
  let stopFlag = false;
  let timer = null;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[đĐ]/g, "d").toLowerCase();

  function log(msg, color = "#334155") {
    const box = $("car-log");
    if (!box) return;
    const line = document.createElement("div");
    line.style.color = color;
    line.textContent = `${new Date().toLocaleTimeString("vi-VN")} ${msg}`;
    box.appendChild(line);
    while (box.children.length > 200) box.firstChild.remove();
    box.scrollTop = box.scrollHeight;
  }

  // ---------------------------------------------------------------------
  // Hàm chạy TRONG trang Shopee Webchat (tự chứa, không dùng biến bên ngoài)
  // ---------------------------------------------------------------------

  // Tìm các cuộc chat chưa đọc ở danh sách bên trái (dựa vào huy hiệu số màu đỏ)
  function listUnreadInPage() {
    const vw = window.innerWidth;
    const isRed = (el) => {
      if (!el) return false;
      const m = getComputedStyle(el).backgroundColor.match(/\d+(\.\d+)?/g);
      if (!m) return false;
      const [r, g, b, a] = m.map(Number);
      return (a === undefined || a > 0.3) && r > 180 && g < 150 && b < 150;
    };
    const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

    const badges = Array.from(document.querySelectorAll("body *")).filter((el) => {
      if (el.children.length) return false;
      const t = (el.textContent || "").trim();
      if (!/^\d{1,2}\+?$/.test(t)) return false;
      const r = el.getBoundingClientRect();
      if (!r.width || r.width > 34 || r.height > 26 || r.left > vw * 0.55) return false;
      return isRed(el) || isRed(el.parentElement);
    });

    const rows = [];
    for (const badge of badges) {
      let row = null;
      for (let cur = badge.parentElement, depth = 0; cur && cur !== document.body && depth < 12; cur = cur.parentElement, depth++) {
        const r = cur.getBoundingClientRect();
        if (badges.filter((b) => cur.contains(b)).length > 1) break; // tới khung danh sách: dừng
        if (r.height >= 44 && r.height <= 140 && r.width >= 160 && visible(cur)) row = cur;
      }
      if (row && !rows.includes(row)) rows.push(row);
    }

    return rows.map((row, i) => {
      const key = "c" + Date.now() + "_" + i;
      row.setAttribute("data-splq-conv", key);
      const nameEl = row.querySelector('span.nFvbiqyLrq, [class*="nFvbiqyLrq"], div.RWr1KSlda2, div.uvqQaOy6aO, [class*="username"], [class*="name"], [title]');
      const explicitName = nameEl ? (nameEl.getAttribute('title') || nameEl.textContent).trim() : "";
      const lines = (row.innerText || "").split("\n").map((s) => s.trim()).filter(Boolean)
        .filter((s) => !/^\d{1,2}\+?$/.test(s) && !/^\d{1,2}:\d{2}$/.test(s) && !/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(s));
      const name = explicitName || lines[0] || "";
      return { key, name, preview: lines.slice(1).join(" ").slice(0, 120) };
    }).filter((x) => x.name);
  }

  // Mở 1 cuộc chat: theo dấu đã gắn, không có thì tìm theo tên ở cột bên trái
  function openConversationInPage(key, name) {
    const cleanName = String(name || "").toLowerCase().trim();
    const vw = window.innerWidth;
    let targetItem = null;
    let targetInner = null;

    // 1. Thử tìm theo key đã đánh dấu
    if (key) {
      targetItem = document.querySelector(`[data-splq-conv="${key}"]`);
    }

    // 2. Tìm theo tên khách trong cấu trúc Shopee Webchat
    if (!targetItem && cleanName) {
      const candidates = Array.from(document.querySelectorAll(
        'span.nFvbiqyLrq, [class*="nFvbiqyLrq"], div.RWr1KSlda2, [class*="RWr1KSlda2"], div.uvqQaOy6aO, [data-cy*="conversation-list-item"] [title], [class*="conversation-item"] [title], [class*="username"], [class*="user-name"]'
      ));
      for (const el of candidates) {
        const txt = (el.getAttribute('title') || el.textContent || '').toLowerCase().trim();
        if (txt === cleanName || txt.includes(cleanName) || cleanName.includes(txt)) {
          targetInner = el;
          targetItem = el.closest('div.SW7LUhQFDH, div.AV0w9P7wpj, div.flWmPLsUAa, [class*="SW7LUhQFDH"], [class*="AV0w9P7wpj"], [class*="flWmPLsUAa"], [data-cy*="conversation-list-item"], div[role="listitem"]') || el;
          break;
        }
      }
    }

    // 3. Fallback: tìm phần tử text bất kỳ ở nửa bên trái
    if (!targetItem && cleanName) {
      const leaf = Array.from(document.querySelectorAll("body *")).find((el) => {
        if (el.children.length > 2) return false;
        const txt = (el.getAttribute('title') || el.textContent || '').toLowerCase().trim();
        if (!txt || (!txt.includes(cleanName) && !cleanName.includes(txt))) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.left < vw * 0.55;
      });
      if (leaf) {
        targetInner = leaf;
        for (let cur = leaf; cur && cur !== document.body; cur = cur.parentElement) {
          const r = cur.getBoundingClientRect();
          if (r.height >= 40 && r.height <= 150 && r.width >= 150) { targetItem = cur; break; }
        }
        if (!targetItem) targetItem = leaf;
      }
    }

    if (!targetItem) return { ok: false, error: "không tìm thấy mục hội thoại" };

    try { targetItem.scrollIntoView({ block: "center", inline: "nearest" }); } catch (_) {}

    // Thông báo cho interceptor MAIN world (nếu có)
    try { window.postMessage({ channel: 'SPLQ_CLICK_CONVERSATION_ITEM', buyerName: cleanName }, '*'); } catch (_) {}

    if (!targetInner) {
      targetInner = targetItem.querySelector('span.nFvbiqyLrq, [class*="nFvbiqyLrq"], div.RWr1KSlda2, div.uR4DA9zSmz, [title], span') || targetItem.firstElementChild || targetItem;
    }

    // Chuỗi sự kiện mô phỏng đầy đủ hành vi người dùng
    const triggerClickSeq = (el) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      ['mouseenter', 'mouseover', 'pointerdown', 'mousedown', 'focus', 'pointerup', 'mouseup', 'click'].forEach(evtName => {
        try {
          if (evtName.startsWith('pointer')) {
            el.dispatchEvent(new PointerEvent(evtName, { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy }));
          } else if (evtName === 'focus') {
            el.focus();
          } else {
            el.dispatchEvent(new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window, clientX: cx, clientY: cy }));
          }
        } catch (_) {}
      });
      try { el.click(); } catch (_) {}
    };

    triggerClickSeq(targetItem);
    if (targetInner && targetInner !== targetItem) triggerClickSeq(targetInner);

    // Kích hoạt trực tiếp React onClick handler nếu có
    [targetItem, targetInner].forEach(el => {
      if (!el) return;
      const propKey = Object.keys(el).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
      if (propKey && el[propKey] && typeof el[propKey].onClick === 'function') {
        try {
          el[propKey].onClick({ target: el, currentTarget: el, bubbles: true, defaultPrevented: false, persist: () => {}, preventDefault: () => {}, stopPropagation: () => {} });
        } catch (_) {}
      }
    });

    return { ok: true };
  }

  // Khung chat bên phải đang mở đúng khách có tên `name`?
  function isActiveConversationInPage(name) {
    if (!name) return false;
    const cleanName = String(name).toLowerCase().trim();
    const vw = window.innerWidth;

    // 1. Kiểm tra trong container chi tiết hội thoại
    const detailChat = document.querySelector('._3h5To4QZew, [data-cy="webchat-conversation-detail-chat"], ._2WZcuAW5Qo, [data-cy="webchat-conversation-detail"], [class*="conversation-detail"]') || document.body;

    const headerCandidates = Array.from(detailChat.querySelectorAll(
      '[data-cy*="header"], [class*="header"], [class*="title"], [class*="user-name"], [class*="username"], [class*="buyer"], span.nFvbiqyLrq, div.RWr1KSlda2, div.uvqQaOy6aO, [title]'
    ));
    for (const el of headerCandidates) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.left < 180 && r.left < vw * 0.2) continue;
      const txt = (el.getAttribute('title') || el.textContent || '').toLowerCase().trim();
      if (txt === cleanName || txt.includes(cleanName) || cleanName.includes(txt)) {
        return true;
      }
    }

    // 2. Quét các phần tử text ở vùng chat bên phải
    const rightElements = Array.from(document.querySelectorAll('span, div, a, p, [title]')).filter(el => {
      if (el.children.length > 2) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.left > 200 && (r.left > vw * 0.22) && r.top < 380;
    });
    for (const el of rightElements) {
      const txt = (el.getAttribute('title') || el.textContent || '').toLowerCase().trim();
      if (txt === cleanName || (cleanName.length >= 4 && txt.includes(cleanName)) || (txt.length >= 4 && cleanName.includes(txt))) {
        return true;
      }
    }

    // 3. Kiểm tra item đang active trong danh sách hội thoại bên trái
    const activeItem = document.querySelector(
      'div.SW7LUhQFDH[class*="active"], div.AV0w9P7wpj[class*="active"], div.flWmPLsUAa[class*="active"], [data-cy*="conversation-list-item"][class*="active"], [aria-selected="true"], [data-active="true"], [class*="conversation-item"][class*="selected"], [class*="conversation-item"][class*="active"]'
    );
    if (activeItem) {
      const activeTxt = (activeItem.innerText || activeItem.textContent || '').toLowerCase();
      if (activeTxt.includes(cleanName)) {
        return true;
      }
    }

    return false;
  }

  // ---------------------------------------------------------------------
  // Phía panel
  // ---------------------------------------------------------------------
  async function findWebchatTab() {
    const tabs = await chrome.tabs.query({ url: "*://banhang.shopee.vn/*" });
    return tabs.find((t) => t.url && t.url.includes("webchat")) || null;
  }

  async function runInTab(tabId, func, args = []) {
    const [res] = await chrome.scripting.executeScript({ target: { tabId }, func, args });
    return res ? res.result : null;
  }

  const fingerprint = (d) => (d && d.messages ? d.messages.map((m) => m.sender + ":" + m.text).join("|") : "");

  // Mở cuộc chat và đợi khung chat hiện đúng khách (tối đa ~8 giây)
  async function openAndRead(tabId, conv, prevFp) {
    // 1. Nếu cuộc chat này đã đang mở sẵn và có tin nhắn, dùng luôn
    const alreadyActive = await runInTab(tabId, isActiveConversationInPage, [conv.name]);
    if (alreadyActive) {
      const data = await runInTab(tabId, extractShopeeChatDataInPage);
      if (data && data.ok && data.messages && data.messages.length) {
        return data;
      }
    }

    // 2. Click mở cuộc chat
    const opened = await runInTab(tabId, openConversationInPage, [conv.key || "", conv.name]);
    if (!opened || !opened.ok) {
      // Thử lại bằng tên khách nếu key không khớp
      const retryOpen = await runInTab(tabId, openConversationInPage, ["", conv.name]);
      if (!retryOpen || !retryOpen.ok) return null;
    }

    // 3. Chờ khung chat chuyển sang đúng khách và tải tin nhắn
    for (let i = 0; i < 20; i++) {
      await sleep(400);
      const active = await runInTab(tabId, isActiveConversationInPage, [conv.name]);
      const data = await runInTab(tabId, extractShopeeChatDataInPage);

      if (active && data && data.ok && data.messages && data.messages.length) {
        const curFp = fingerprint(data);
        // Nếu trước đó đang mở khách khác và mới nhấp ở 1-2 nhịp đầu, đợi tin nhắn cập nhật
        if (prevFp && !alreadyActive && i < 3 && curFp === prevFp) {
          continue;
        }
        return data;
      }

      // Re-click sau 1.6s nếu chưa active
      if (i === 4 && !active) {
        await runInTab(tabId, openConversationInPage, [conv.key || "", conv.name]);
      }
    }

    // 4. Fallback: nếu active = true và lấy được data
    const finalActive = await runInTab(tabId, isActiveConversationInPage, [conv.name]);
    if (finalActive) {
      const data = await runInTab(tabId, extractShopeeChatDataInPage);
      if (data && data.ok && data.messages && data.messages.length) return data;
    }

    return null;
  }

  // Câu khó: cần shop quyết định -> chờ duyệt ở chế độ hybrid
  const HARD_RE = /\b(gia|giam|bot|re hon|voucher|ma giam|khuyen mai|doi|tra hang|tra lai|hoan|huy|khieu nai|loi|hong|be|vo|thieu|sai|boi thuong|cham|chua nhan|bao hanh|kem|te|lua dao|bao cao|refund)\b/;

  async function callGemini(prompt) {
    const store = await chrome.storage.local.get(["geminiApiKey", "geminiModel"]);
    const apiKey = (store.geminiApiKey || "").trim();
    let lastError = null;
    if (apiKey) {
      const models = [...new Set([store.geminiModel || "gemini-2.5-flash", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite"])];
      for (const m of models) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
          const data = await res.json();
          if (!res.ok) { lastError = new Error(data.error?.message || `HTTP ${res.status}`); await sleep(400); continue; }
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (text) return text;
        } catch (e) { lastError = e; await sleep(400); }
      }
    }
    // Gemini chưa có key / lỗi: dùng API dự phòng như tab Chat AI
    try { return await callXkiroDeepseekChat(prompt); } catch (e) { throw lastError || e; }
  }

  function buildPrompt(data) {
    const p = data.product || {};
    const history = (data.messages || []).slice(-15).map((m) => `${m.sender === "customer" ? "Khách" : "Shop"}: ${m.text}`).join("\n");
    return `Bạn là nhân viên chăm sóc khách hàng của shop trên Shopee. Trả lời tin nhắn MỚI NHẤT của khách dựa trên lịch sử chat.

${p.name ? `SẢN PHẨM KHÁCH ĐANG HỎI: ${p.name}${p.price ? ` – Giá: ${p.price}` : ""}${p.stock ? ` – ${p.stock}` : ""}\n` : ""}${prefs.note ? `CHÍNH SÁCH / GHI CHÚ CỦA SHOP: ${prefs.note}\n` : ""}
LỊCH SỬ CHAT:
${history}

QUY TẮC:
1. Ngắn gọn 1-3 câu, lịch sự, xưng "shop", gọi khách "anh/chị", mở đầu "Dạ".
2. Chỉ nói điều có trong thông tin trên. KHÔNG tự bịa giá, khuyến mãi, thời gian giao cụ thể, KHÔNG hứa hoàn tiền / đổi trả / giảm giá.
3. Nếu khách hỏi về giá/mặc cả, đổi trả, hoàn tiền, hủy đơn, khiếu nại, hàng lỗi hoặc điều shop cần quyết định: bắt đầu câu trả lời bằng đúng chuỗi [CAN_DUYET] rồi viết câu trả lời nháp.
4. Không dùng markdown (**, *, #), không bọc trong ngoặc kép. Chỉ trả về nội dung tin nhắn.`;
  }

  function cleanReply(text) {
    return String(text || "").replace(/\*\*/g, "").replace(/\*/g, "").replace(/^["']|["']$/g, "").trim();
  }

  // ---------------- Hàng chờ ----------------
  async function saveQueue() {
    await chrome.storage.local.set({ [QUEUE_KEY]: queue });
    renderQueue();
  }

  function addToQueue(item) {
    queue = queue.filter((q) => q.name !== item.name); // tin mới thay bản nháp cũ cùng khách
    queue.push(item);
    return saveQueue();
  }

  function renderQueue() {
    $("car-queue-count").textContent = queue.length;
    $("car-send-all").disabled = !queue.length || running;
    $("car-queue").innerHTML = queue.length ? queue.map((q) => `
      <div data-qid="${esc(q.id)}" style="background: #fff; border: 1px solid ${q.hard ? "#fca5a5" : "#c7d2fe"}; border-radius: 6px; padding: 6px;">
        <div style="font-size: 11px; font-weight: 700; color: #1e293b;">${esc(q.name)} ${q.hard ? '<span style="color:#dc2626;">· cần duyệt kỹ</span>' : ""}
          <span style="color:#94a3b8; font-weight: 400;">${new Date(q.at).toLocaleTimeString("vi-VN")}</span></div>
        <div style="font-size: 11px; color: #475569; margin: 2px 0 4px;">Khách: ${esc(q.question)}</div>
        <textarea data-qreply rows="3" style="width: 100%; box-sizing: border-box; font-size: 11.5px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px;">${esc(q.reply)}</textarea>
        <div style="display: flex; gap: 4px; justify-content: flex-end; margin-top: 4px;">
          <button type="button" data-qact="skip" style="padding: 2px 8px; font-size: 11px; border: 1px solid #cbd5e1; background: #fff; border-radius: 4px; cursor: pointer;">Bỏ</button>
          <button type="button" data-qact="send" style="padding: 2px 10px; font-size: 11px; font-weight: 700; border: none; background: #16a34a; color: #fff; border-radius: 4px; cursor: pointer;">Gửi</button>
        </div>
      </div>`).join("") : '<div style="font-size: 11px; color: #64748b; font-style: italic;">Chưa có câu trả lời nào chờ duyệt.</div>';
  }

  // Gửi 1 câu trả lời: mở đúng cuộc chat, kiểm tra tin cuối là của khách rồi mới gửi
  async function sendReply(tabId, conv, text, data = null) {
    if (!data) {
      const before = await runInTab(tabId, extractShopeeChatDataInPage);
      data = await openAndRead(tabId, conv, fingerprint(before));
      if (!data && await runInTab(tabId, isActiveConversationInPage, [conv.name])) data = await runInTab(tabId, extractShopeeChatDataInPage);
    }
    if (!data || !data.ok) return { ok: false, reason: "không mở được cuộc chat" };
    const nonAuto = (data.messages || []).filter((m) => !m.isAutoReply && !String(m.text || "").includes("Tin nhắn tự động"));
    const last = nonAuto.length ? nonAuto[nonAuto.length - 1] : data.messages[data.messages.length - 1];
    if (!last || last.sender !== "customer") return { ok: false, reason: "tin cuối không phải của khách (có thể shop đã trả lời)" };
    if (!(await runInTab(tabId, isActiveConversationInPage, [conv.name]))) return { ok: false, reason: "khung chat không đúng khách" };
    const res = await runInTab(tabId, fillShopeeChatInPageDirect, [text, true]);
    if (!res || !res.ok) return { ok: false, reason: (res && res.error) || "không điền được tin" };
    await sleep(1200);
    return { ok: true };
  }

  async function sendQueued(id) {
    const item = queue.find((q) => q.id === id);
    if (!item || running) return;
    const card = document.querySelector(`[data-qid="${CSS.escape(id)}"]`);
    const text = (card && card.querySelector("[data-qreply]").value.trim()) || item.reply;
    if (!text) return;
    const tab = await findWebchatTab();
    if (!tab) return log("⚠️ Chưa mở trang Shopee Webchat.", "#dc2626");
    setRunning(true);
    try {
      const r = await sendReply(tab.id, { name: item.name }, text);
      if (r.ok) {
        log(`✔ Đã gửi cho ${item.name}: ${text.slice(0, 60)}`, "#16a34a");
        queue = queue.filter((q) => q.id !== id);
        await saveQueue();
      } else {
        log(`✖ Chưa gửi cho ${item.name}: ${r.reason}`, "#dc2626");
      }
    } finally {
      setRunning(false);
    }
  }

  // ---------------- Một lượt quét ----------------
  async function runOnce() {
    if (running) return;
    const tab = await findWebchatTab();
    if (!tab) {
      log("⚠️ Chưa mở trang Shopee Webchat (banhang.shopee.vn/new-webchat).", "#dc2626");
      return;
    }
    setRunning(true);
    stopFlag = false;
    let handled = 0;
    try {
      const unread = (await runInTab(tab.id, listUnreadInPage)) || [];
      if (!unread.length) { log("Không có cuộc chat chưa đọc."); return; }
      log(`Tìm thấy ${unread.length} cuộc chat chưa đọc.`);
      let prevFp = fingerprint(await runInTab(tab.id, extractShopeeChatDataInPage));

      for (const conv of unread.slice(0, Math.max(1, prefs.max))) {
        if (stopFlag) break;
        let data = await openAndRead(tab.id, conv, prevFp);
        if (!data) {
          if (await runInTab(tab.id, isActiveConversationInPage, [conv.name])) {
            data = await runInTab(tab.id, extractShopeeChatDataInPage);
          }
        }
        if (!data || !data.messages || !data.messages.length) {
          log(`✖ Không mở được cuộc chat của ${conv.name}, bỏ qua.`, "#dc2626");
          continue;
        }
        prevFp = fingerprint(data);
        const nonAuto = (data.messages || []).filter((m) => !m.isAutoReply && !String(m.text || "").includes("Tin nhắn tự động"));
        const last = nonAuto.length ? nonAuto[nonAuto.length - 1] : data.messages[data.messages.length - 1];
        if (!last || last.sender !== "customer") { log(`· ${conv.name}: tin cuối không phải của khách, bỏ qua.`); continue; }

        const question = data.messages.slice().reverse().filter((m) => m.sender === "customer").slice(0, 3).reverse().map((m) => m.text).join(" / ");
        let reply = "";
        try {
          reply = cleanReply(await callGemini(buildPrompt(data)));
        } catch (e) {
          log(`✖ AI lỗi với ${conv.name}: ${e.message}`, "#dc2626");
          continue;
        }
        const aiFlag = reply.includes("[CAN_DUYET]");
        reply = reply.replace(/\[CAN_DUYET\]\s*/g, "").trim();
        const hard = aiFlag || HARD_RE.test(norm(question));
        if (!reply) { log(`✖ AI không trả lời cho ${conv.name}.`, "#dc2626"); continue; }

        const autoSend = prefs.mode === "auto" || (prefs.mode === "hybrid" && !hard);
        if (autoSend) {
          const r = await sendReply(tab.id, conv, reply, data);
          if (r.ok) log(`✔ Đã tự gửi cho ${conv.name}: ${reply.slice(0, 60)}`, "#16a34a");
          else {
            log(`✖ Chưa gửi được cho ${conv.name} (${r.reason}), chuyển vào hàng chờ.`, "#dc2626");
            await addToQueue({ id: conv.key, name: conv.name, question, reply, hard, at: Date.now() });
          }
        } else {
          await addToQueue({ id: conv.key, name: conv.name, question, reply, hard, at: Date.now() });
          log(`📝 Đã soạn cho ${conv.name}${hard ? " (cần duyệt kỹ)" : ""}.`, "#4338ca");
        }
        handled++;
        if (!stopFlag) await sleep(Math.max(3, prefs.delay) * 1000);
      }
    } catch (e) {
      log("✖ Lỗi: " + e.message, "#dc2626");
    } finally {
      setRunning(false);
      if (handled) log(`Xong lượt: xử lý ${handled} cuộc chat.`);
    }
  }

  // ---------------- Giao diện & cài đặt ----------------
  function setRunning(v) {
    running = v;
    $("car-run").disabled = v;
    $("car-run").textContent = v ? "⏳ Đang xử lý..." : "▶ Quét chat chưa đọc ngay";
    $("car-stop").style.display = v ? "" : "none";
    renderQueue();
  }

  function renderPrefs() {
    document.querySelectorAll(".car-mode").forEach((b) => {
      const on = b.dataset.mode === prefs.mode;
      b.style.cssText = `padding: 4px 8px; font-size: 11px; border-radius: 14px; cursor: pointer; border: 1px solid ${on ? "#4f46e5" : "#c7d2fe"}; background: ${on ? "#4f46e5" : "#fff"}; color: ${on ? "#fff" : "#3730a3"}; font-weight: ${on ? 700 : 500};`;
    });
    $("car-mode-hint").textContent = MODE_HINTS[prefs.mode];
    $("car-enabled").checked = prefs.enabled;
    $("car-interval").value = prefs.interval;
    $("car-max").value = prefs.max;
    $("car-delay").value = prefs.delay;
    $("car-note").value = prefs.note;
  }

  async function savePrefs() {
    await chrome.storage.local.set({ [PREFS_KEY]: prefs });
    schedule();
  }

  function schedule() {
    clearInterval(timer);
    timer = null;
    if (prefs.enabled) timer = setInterval(runOnce, Math.max(30, prefs.interval) * 1000);
  }

  $("car-modes").addEventListener("click", (e) => {
    const b = e.target.closest(".car-mode");
    if (!b) return;
    if (b.dataset.mode === "auto" && prefs.mode !== "auto" &&
      !confirm("Chế độ Tự gửi luôn: AI sẽ tự trả lời khách mà không cần bạn duyệt.\nAI có thể trả lời sai giá/chính sách. Bật chế độ này?")) return;
    prefs.mode = b.dataset.mode;
    renderPrefs();
    savePrefs();
  });
  $("car-enabled").addEventListener("change", (e) => {
    prefs.enabled = e.target.checked;
    savePrefs();
    if (prefs.enabled) runOnce();
  });
  for (const [id, key, min] of [["car-interval", "interval", 30], ["car-max", "max", 1], ["car-delay", "delay", 3]]) {
    $(id).addEventListener("change", (e) => { prefs[key] = Math.max(min, Number(e.target.value) || min); renderPrefs(); savePrefs(); });
  }
  $("car-note").addEventListener("change", (e) => { prefs.note = e.target.value.trim(); savePrefs(); });
  $("car-run").addEventListener("click", runOnce);
  $("car-stop").addEventListener("click", () => { stopFlag = true; log("Sẽ dừng sau cuộc chat đang xử lý..."); });
  $("car-queue").addEventListener("click", async (e) => {
    const b = e.target.closest("[data-qact]");
    if (!b) return;
    const id = b.closest("[data-qid]").dataset.qid;
    if (b.dataset.qact === "skip") {
      queue = queue.filter((q) => q.id !== id);
      await saveQueue();
    } else {
      await sendQueued(id);
    }
  });
  $("car-queue").addEventListener("input", (e) => {
    const ta = e.target.closest("[data-qreply]");
    if (!ta) return;
    const item = queue.find((q) => q.id === ta.closest("[data-qid]").dataset.qid);
    if (item) { item.reply = ta.value; chrome.storage.local.set({ [QUEUE_KEY]: queue }); }
  });
  $("car-send-all").addEventListener("click", async () => {
    if (!queue.length || !confirm(`Gửi ${queue.length} câu trả lời trong hàng chờ?`)) return;
    for (const id of queue.map((q) => q.id)) {
      if (stopFlag) break;
      await sendQueued(id);
      await sleep(Math.max(3, prefs.delay) * 1000);
    }
  });

  chrome.storage.local.get([PREFS_KEY, QUEUE_KEY], (res) => {
    prefs = { ...prefs, ...(res[PREFS_KEY] || {}) };
    queue = Array.isArray(res[QUEUE_KEY]) ? res[QUEUE_KEY] : [];
    renderPrefs();
    renderQueue();
    schedule();
  });
})();
