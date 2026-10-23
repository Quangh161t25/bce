// Service Worker: Tự động chạy nền ngay cả khi đóng Side Panel,
// báo động âm thanh + góc màn hình khi có đơn / khi lỗi,
// gửi thông báo vào Telegram, và tổng kết cuối ngày (17h chiều & 8h sáng).

importScripts("xlsx.js");

// Thiết lập mở Side Panel khi bấm icon extension
const setup = () => chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

const DEFAULT_TELE_TOKEN = "7328548423:AAEaMToHm1IYWJ28_u8WrZ9fu8qO2QkbZ9Y";
const DEFAULT_TELE_CHAT = "-4209766497";

async function applyDefaults() {
  const existing = await chrome.storage.local.get(["tcdd-tele-token", "tcdd-tele-chat", "tcdd-tele-on", "tcdd-every"]);
  const updates = {};
  if (!existing["tcdd-tele-token"]) updates["tcdd-tele-token"] = DEFAULT_TELE_TOKEN;
  if (!existing["tcdd-tele-chat"]) updates["tcdd-tele-chat"] = DEFAULT_TELE_CHAT;
  if (!existing["tcdd-tele-on"]) updates["tcdd-tele-on"] = "1";
  if (!existing["tcdd-every"]) updates["tcdd-every"] = "2"; // 120 giây = 2 phút
  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  setup();
  await applyDefaults();
  initAlarms();
});
chrome.runtime.onStartup.addListener(async () => {
  setup();
  await applyDefaults();
  initAlarms();
});

// Danh sách API Shopee cho phép
const ALLOW = [
  "/api/v3/order/search_order_list_index",
  "/api/v3/order/get_order_list_card_list",
  "/api/v3/order/search_mass_shipment_index",
  "/api/v3/product/get_shop_warehouse/",
  "/api/v3/shipment/mass_ship/get_pickup_address_list",
  "/api/v3/general/get_shop_address",
  "/api/v3/shipment/mass_ship/get_pickup_time_slots",
  "/api/v3/shipment/batch_get_package_shipment_status",
  "/api/v3/shipment/batch_init_orders",
  "/api/v3/logistics/create_sd_jobs",
  "/api/v3/logistics/get_sd_job",
  "/api/v3/order/get_one_order",
  "/api/v3/logistics/download_sd_job_filelink",
];

// ---------- ÂM THANH & THÔNG BÁO GÓC MÀN HÌNH ----------
async function ensureOffscreen() {
  if (await chrome.offscreen?.hasDocument?.()) return;
  try {
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Báo âm thanh khi có đơn mới và khi có lỗi",
    });
  } catch (e) {
    // Nếu document đã tồn tại thì bỏ qua
  }
}

async function playAudio(sound = "ting") {
  try {
    await ensureOffscreen();
    chrome.runtime.sendMessage({ type: "tcdd-play-sound", sound }).catch(() => {});
  } catch (e) {
    console.error("playAudio error:", e);
  }
}

async function notifyAndSound({ title, message, sound = "ting", isError = false, reportType = null }) {
  await playAudio(sound);
  try {
    const notifId = reportType ? `report-${reportType}-${Date.now()}` : `tcdd-${Date.now()}`;
    chrome.notifications.create(notifId, {
      type: "basic",
      iconUrl: "icon.png",
      title: title || (isError ? "TOPCARE ❌ LỖI" : "TOPCARE · Đơn hàng"),
      message: message || "",
      priority: isError ? 2 : 1,
    });
  } catch (e) {
    console.error("Notification error:", e);
  }
}

// Bấm vào thông báo -> mở Side Panel và mở bảng tổng kết nếu là thông báo báo cáo
chrome.notifications.onClicked.addListener(async (notifId) => {
  try {
    const wins = await chrome.windows.getAll({ populate: false, windowTypes: ["normal"] });
    const win = wins.find((w) => w.focused) || wins[0];
    if (win && chrome.sidePanel?.open) {
      await chrome.sidePanel.open({ windowId: win.id });
    }
    if (notifId.startsWith("report-")) {
      const type = notifId.includes("17h") ? "17h" : "8h";
      await chrome.storage.local.set({ tcdd_open_report: { type, time: Date.now() } });
      chrome.runtime.sendMessage({ type: "tcdd-open-report", reportType: type }).catch(() => {});
    }
  } catch (e) {
    console.error("Open sidepanel on notification click error:", e);
  }
});

// ---------- GỬI THÔNG BÁO VÀO TELEGRAM ----------
const teleEsc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function getTelegramConfig() {
  const cfg = await chrome.storage.local.get([
    "tcdd-tele-on",
    "tcdd-tele-token",
    "tcdd-tele-chat",
    "tcdd-tele-order",
    "tcdd-tele-error",
    "tcdd-tele-report",
    "tcdd-tele-wameli",
  ]);
  return {
    enabled: cfg["tcdd-tele-on"] !== "0", // Mặc định BẬT
    token: (cfg["tcdd-tele-token"] || DEFAULT_TELE_TOKEN).trim(),
    chatId: (cfg["tcdd-tele-chat"] || DEFAULT_TELE_CHAT).trim(),
    notifyOrder: cfg["tcdd-tele-order"] !== "0",
    notifyError: cfg["tcdd-tele-error"] !== "0",
    notifyReport: cfg["tcdd-tele-report"] !== "0",
    notifyWameli: cfg["tcdd-tele-wameli"] !== "0",
  };
}

async function sendTelegram(text) {
  try {
    const cfg = await getTelegramConfig();
    if (!cfg.enabled || !cfg.token || !cfg.chatId) return { ok: false, error: "Chưa cấu hình hoặc chưa bật gửi Telegram" };
    const url = `https://api.telegram.org/bot${cfg.token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    const j = await res.json();
    if (!j.ok) throw new Error(j.description || "Lỗi Telegram API");
    return { ok: true };
  } catch (e) {
    console.error("sendTelegram error:", e);
    return { ok: false, error: e.message || String(e) };
  }
}

// ---------- DỮ LIỆU TỔNG KẾT NGÀY (DAILY STATS) ----------
const p2 = (n) => String(n).padStart(2, "0");
function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

async function getStatsMap() {
  const data = await chrome.storage.local.get("tcdd_daily_stats");
  return data.tcdd_daily_stats || {};
}

async function getDayStats(date = todayStr()) {
  const map = await getStatsMap();
  return map[date] || {
    date,
    total_orders: 0,
    confirmed: [],
    printed: [],
    wameli: [],
    errors: [],
  };
}

async function updateDayStats(date, updater) {
  const map = await getStatsMap();
  const day = map[date] || {
    date,
    total_orders: 0,
    confirmed: [],
    printed: [],
    wameli: [],
    errors: [],
  };
  updater(day);
  map[date] = day;

  // Giữ tối đa 30 ngày gần nhất
  const keys = Object.keys(map).sort();
  if (keys.length > 30) {
    for (let i = 0; i < keys.length - 30; i++) delete map[keys[i]];
  }
  await chrome.storage.local.set({ tcdd_daily_stats: map });
  chrome.runtime.sendMessage({ type: "tcdd-stats-updated", date }).catch(() => {});
}

async function recordConfirmed(r) {
  const now = new Date();
  const time = `${p2(now.getHours())}:${p2(now.getMinutes())}`;
  await updateDayStats(todayStr(), (day) => {
    if (!day.confirmed.some((x) => x.order_sn === r.order_sn)) {
      day.confirmed.push({ order_sn: r.order_sn, carrier: r.carrier || "", order_id: r.order_id, time });
    }
  });

  // Bắn thông báo Telegram khi có đơn mới
  const teleCfg = await getTelegramConfig();
  if (teleCfg.enabled && teleCfg.notifyOrder) {
    const items = (r.items || []).slice(0, 3).map((it) => `   • ${teleEsc(it)}`).join("\n");
    const text = `📦 <b>[TOPCARE] ĐƠN HÀNG MỚI</b>\n` +
      `• Mã đơn: <code>${teleEsc(r.order_sn)}</code>\n` +
      (r.buyer ? `• Khách mua: ${teleEsc(r.buyer)}\n` : "") +
      (items ? `• Sản phẩm:\n${items}\n` : "") +
      (r.total ? `• Tổng tiền: <b>${(r.total || 0).toLocaleString("vi-VN")}₫</b>\n` : "") +
      `• ĐVVC: 🚚 <b>${teleEsc(r.carrier || "Shopee")}</b>\n` +
      (r.tracking ? `• Mã vận đơn: <code>${teleEsc(r.tracking)}</code>\n` : "") +
      (r.ship_by ? `• Hạn giao: ${teleEsc(r.ship_by)}\n` : "") +
      `⏰ Giờ xác nhận: ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
    sendTelegram(text);
  }
}

async function recordPrinted(base, sns) {
  const now = new Date();
  const time = `${p2(now.getHours())}:${p2(now.getMinutes())}`;
  await updateDayStats(todayStr(), (day) => {
    day.printed.push({ base, sns: sns || [], time });
  });
}

async function recordWameli(base, slot, warehouse, count, sns) {
  const now = new Date();
  const time = `${p2(now.getHours())}:${p2(now.getMinutes())}`;
  await updateDayStats(todayStr(), (day) => {
    day.wameli.push({ base, slot, warehouse, count: count || sns?.length || 0, sns: sns || [], time });
  });

  // Bắn thông báo Telegram khi nạp Wameli
  const teleCfg = await getTelegramConfig();
  if (teleCfg.enabled && teleCfg.notifyWameli) {
    const text = `☁️ <b>[TOPCARE] ĐÃ NẠP WAMELI THÀNH CÔNG</b>\n` +
      `• Lô / File: <code>${teleEsc(base)}</code>\n` +
      `• Khung giờ: <b>${teleEsc(slot)}</b>\n` +
      `• Kho: <b>${teleEsc(warehouse)}</b>\n` +
      `• Số lượng: <b>${count || sns?.length || 0} đơn</b>\n` +
      `⏰ Lúc: ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
    sendTelegram(text);
  }
}

async function recordError(order_sn, stage, message) {
  const now = new Date();
  const time = `${p2(now.getHours())}:${p2(now.getMinutes())}`;
  await updateDayStats(todayStr(), (day) => {
    day.errors.push({ order_sn: order_sn || "Hệ thống", stage, message: String(message || ""), time });
  });

  // Bắn thông báo Telegram cảnh báo lỗi khẩn cấp
  const teleCfg = await getTelegramConfig();
  if (teleCfg.enabled && teleCfg.notifyError) {
    const text = `🚨 <b>[TOPCARE] CẢNH BÁO LỖI VẬN HÀNH</b>\n` +
      `• Đối tượng: <code>${teleEsc(order_sn || "Hệ thống")}</code>\n` +
      `• Khâu bị lỗi: <b>${teleEsc(stage || "Quy trình")}</b>\n` +
      `• Chi tiết lỗi: <pre>${teleEsc(message || "Không rõ nguyên nhân")}</pre>\n` +
      `⏰ Lúc: ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - Vui lòng kiểm tra lại!`;
    sendTelegram(text);
  }
}

// ---------- GHI LOG HỆ THỐNG ----------
async function bgLog(html) {
  const time = new Date().toLocaleTimeString("vi-VN");
  const line = `<div>${time} ${html}</div>`;
  chrome.runtime.sendMessage({ type: "tcdd-log", html: line }).catch(() => {});
  const data = await chrome.storage.local.get("tcdd_autolog");
  const list = (data.tcdd_autolog || []).slice(0, 49);
  list.unshift(line);
  await chrome.storage.local.set({ tcdd_autolog: list });
}

// ---------- THỰC THI FETCH TRONG TAB SHOPEE ----------
async function callInTab(tabId, path, body, method, query) {
  const [r] = await chrome.scripting.executeScript({
    target: { tabId },
    args: [path, body, method, query || ""],
    func: async (path, body, method, query) => {
      try {
        const cds = (document.cookie.match(/SPC_CDS=([^;]+)/) || [])[1] || "";
        const r = await fetch(`${path}?SPC_CDS=${cds}&SPC_CDS_VER=2${query}`, {
          method,
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: method === "GET" ? undefined : JSON.stringify(body || {}),
        });
        return { json: await r.json() };
      } catch (e) {
        return { error: String(e) };
      }
    },
  });
  return r?.result;
}

async function bgApi(path, body, method = "POST", query = "") {
  if (!ALLOW.includes(path)) throw new Error("API không được phép: " + path);
  const tabs = await chrome.tabs.query({ url: "https://banhang.shopee.vn/*" });
  if (!tabs.length) throw new Error("Chưa mở tab Kênh Người Bán (banhang.shopee.vn)");
  tabs.sort((a, b) => (b.active - a.active) || (b.lastAccessed || 0) - (a.lastAccessed || 0));
  let last = "Tab Kênh Người Bán chưa sẵn sàng";
  for (const t of tabs) {
    try {
      const res = await callInTab(t.id, path, body, method, query);
      if (res?.json) {
        const j = res.json;
        if (j?.code !== 0) throw new Error(j?.message || j?.user_message || "Lỗi API Shopee");
        return j.data;
      }
      last = res?.error || last;
    } catch (e) {
      last = String(e.message || e);
    }
  }
  throw new Error(last);
}

// ---------- NẠP ĐƠN WAMELI ----------
async function wameliUpload(tabId, msg) {
  const [r] = await chrome.scripting.executeScript({
    target: { tabId },
    args: [msg],
    func: async (msg) => {
      try {
        const SLOTS = [["8H", 3, 8 * 60 + 25], ["11H", 6, 9 * 60 + 45], ["13H", 7, 13 * 60 + 30], ["14H", 10, 15 * 60 + 45], ["16H", 12, 17 * 60]];
        const now = new Date(), mins = now.getHours() * 60 + now.getMinutes();
        let k = SLOTS.findIndex((s) => mins < s[2]);
        const html = await (await fetch("/admin/order/upload", { credentials: "include" })).text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        if (!doc.querySelector("table") || /login/i.test(doc.title + (doc.querySelector("form")?.action || ""))) {
          return { error: "Wameli chưa đăng nhập — mở phanmem.wameli.vn và đăng nhập" };
        }
        const p2 = (n) => String(n).padStart(2, "0");
        const today = `${p2(now.getDate())}/${p2(now.getMonth() + 1)}/${now.getFullYear()}`;
        const kho = msg.warehouse_id === 2 ? "HCM" : "HN";
        const printed = new Set();
        for (const tr of doc.querySelectorAll("table tr")) {
          const c = [...tr.children].map((td) => td.textContent.trim());
          if (c.length > 7 && c[1] === "Đã in" && c[2] === kho && c[6].startsWith(today)) printed.add(c[7]);
        }
        while (k >= 0 && k < SLOTS.length && printed.has(SLOTS[k][0])) k++;
        let day = now;
        if (k < 0 || k >= SLOTS.length) { day = new Date(now.getTime() + 86400000); k = 0; }
        const [slot, house_id] = SLOTS[k];
        const bin = (b, type) => new Blob([Uint8Array.from(atob(b), (ch) => ch.charCodeAt(0))], { type });
        const fd = new FormData();
        fd.append("is_seeding", "0");
        fd.append("platform_id", "2");                 // Shopee
        fd.append("warehouse_id", String(msg.warehouse_id));
        fd.append("shop_id", "17");                    // Điện máy Topcare
        fd.append("date", `${p2(day.getDate())}-${p2(day.getMonth() + 1)}-${day.getFullYear()}`);
        fd.append("house_id", String(house_id));
        fd.append("name", "");
        fd.append("file_pdf[]", bin(msg.pdf, "application/pdf"), msg.base + ".pdf");
        fd.append("file_xlsx", bin(msg.xlsx, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), msg.base + ".xlsx");
        fd.append("module", "order");
        fd.append("view", "upload");
        fd.append("task", "save");
        fd.append("boxchecked", "0");
        fd.append("page", "0");
        const res = await fetch("/admin/order/upload", { method: "POST", body: fd, credentials: "include" });
        const out = await res.text();
        if (!res.ok) return { error: "Wameli trả lỗi HTTP " + res.status };
        if (!out.includes(msg.base)) return { error: "Đã gửi nhưng không thấy file trong danh sách Wameli — kiểm tra lại trên Wameli", slot };
        return { ok: true, slot: `${slot} ngày ${p2(day.getDate())}/${p2(day.getMonth() + 1)}` };
      } catch (e) {
        return { error: String(e) };
      }
    },
  });
  return r?.result;
}

function waitComplete(tabId, ms = 25000) {
  return new Promise((ok) => {
    const t = setTimeout(done, ms);
    function done() { clearTimeout(t); chrome.tabs.onUpdated.removeListener(f); setTimeout(ok, 1500); }
    function f(id, info) { if (id === tabId && info.status === "complete") done(); }
    chrome.tabs.onUpdated.addListener(f);
  });
}
async function executeWameliUpload(msg) {
  const WURL = "https://phanmem.wameli.vn/admin/order/upload";
  let [tab] = await chrome.tabs.query({ url: "https://phanmem.wameli.vn/*" });
  if (!tab) {
    tab = await chrome.tabs.create({ url: WURL, active: false });
    await waitComplete(tab.id);
  } else if (tab.discarded || tab.status !== "complete" || !/^https:\/\/phanmem\.wameli\.vn\//.test(tab.url || "")) {
    // tab bị Edge cho "ngủ" hoặc chưa tải xong -> đánh thức
    await chrome.tabs.update(tab.id, { url: WURL });
    await waitComplete(tab.id);
  }
  let res;
  try {
    res = await wameliUpload(tab.id, msg);
  } catch (e) {
    if (!/Cannot access|No tab|Frame|cannot be scripted/i.test(String(e.message || e))) throw e;
    await chrome.tabs.update(tab.id, { url: WURL });
    await waitComplete(tab.id);
    res = await wameliUpload(tab.id, msg);
  }
  if (res?.error && /đăng nhập/.test(res.error)) chrome.tabs.update(tab.id, { active: true });
  return res;
}

// ---------- QUY TRÌNH TỰ ĐỘNG CHẠY NỀN ----------
let isAutoBusy = false;
const isHCM = (name) => /hồ chí minh|hcm/i.test(name || "");

function toRow(c) {
  const p = c.package_card || c.order_card || {};
  const ext = p.order_ext_info || {};
  const head = p.card_header || {};
  const items = (p.item_info_group?.item_info_list || []).flatMap((g) => g.item_list || []);
  const fi = p.fulfilment_info || p.fulfillment_info || {};
  const st = p.status_info || {};
  const pay = p.payment_info || {};
  return {
    order_sn: head.order_sn || ext.order_sn || "",
    order_id: ext.order_id,
    channel_id: p.package_ext_info?.fulfilment_channel_id || p.package_ext_info?.shipping_method || 0,
    package_number: p.package_ext_info?.package_number || "",
    buyer: head.buyer_info?.username || "",
    items: items.map((it) => `${it.name}${it.description ? " [" + it.description + "]" : ""} ×${it.amount}`),
    total: (pay.total_price || 0) / 1e5,
    status: st.status || "",
    ship_by: ext.ship_by_date ? "Hạn " + new Date(ext.ship_by_date * 1000).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "",
    tag: (st.status_tag || []).map((t) => t.tag_value).join(", "),
    warn: /quá hạn|trễ/i.test((st.status_tag || []).map((t) => t.tag_value).join(" ")),
    carrier: fi.fulfilment_channel_name || fi.masked_channel_name || "",
    seller_addr: ext.seller_address ? `${ext.seller_address.address}, ${ext.seller_address.city}, ${ext.seller_address.state}` : "",
    tracking: fi.tracking_number || "",
    location_id: null,
  };
}

async function bgFetchIndex() {
  let out = [], page = 1;
  for (;;) {
    const d = await bgApi("/api/v3/order/search_order_list_index", {
      order_list_tab: 300, entity_type: 1,
      pagination: { from_page_number: 1, page_number: page, page_size: 40 },
      filter: { fulfillment_type: 0, is_drop_off: 0, fulfillment_source: 0, action_filter: 0, order_to_ship_status: 1 },
      sort: { sort_type: 2, ascending: true },
    });
    const list = d.index_list || [];
    out = out.concat(list);
    if (list.length < 40 || out.length >= 400) return { list: out, total: d.pagination?.total ?? out.length };
    page++;
  }
}

async function bgFetchCards(index) {
  const cards = [];
  for (let i = 0; i < index.length; i += 5) {
    const part = index.slice(i, i + 5);
    const body = {
      order_list_tab: 300,
      need_count_down_desc: false,
      package_param_list: part.map((x) => ({ package_number: x.package_number, shop_id: x.shop_id, region_id: x.region_id })),
    };
    const d = await bgApi("/api/v3/order/get_order_list_card_list", body);
    cards.push(...(d.card_list || []));
  }
  return cards;
}

const XLS_HEAD = ["Mã đơn hàng", "Mã Kiện Hàng", "Ngày đặt hàng", "Trạng Thái Đơn Hàng", "Nhận xét từ Người mua", "Mã vận đơn",
  "Đơn Vị Vận Chuyển", "Phương thức giao hàng", "Loại đơn hàng", "Ngày giao hàng dự kiến", "Ngày gửi hàng", "Thời gian giao hàng",
  "Trạng thái Trả hàng/Hoàn tiền", "SKU sản phẩm", "Tên sản phẩm", "Cân nặng sản phẩm", "Tổng cân nặng", "Tên kho hàng",
  "SKU phân loại hàng", "Tên phân loại hàng", "Giá gốc", "Người bán trợ giá", "Được Shopee trợ giá",
  "Tổng số tiền được người bán trợ giá", "Giá gốc (Y)", "Số lượng", "Số lượng sản phẩm được hoàn trả", "Tổng số tiền Người mua thanh toán"];

async function runAutoBackground() {
  const cfg = await chrome.storage.local.get(["tcdd-auto", "tcdd-autopdf", "tcdd-wameli", "tcdd-addr", "tcdd-jobs"]);
  if (cfg["tcdd-auto"] !== "1") return;
  if (isAutoBusy) return;

  isAutoBusy = true;
  try {
    const tabs = await chrome.tabs.query({ url: "https://banhang.shopee.vn/*" });
    if (!tabs.length) {
      isAutoBusy = false;
      return;
    }

    const idx = await bgFetchIndex();
    if (!idx.list.length) {
      isAutoBusy = false;
      return;
    }

    const shop = { shop_id: idx.list[0].shop_id, region_id: idx.list[0].region_id };
    const list = (await bgFetchCards(idx.list)).map(toRow);

    // Lấy danh sách kho & địa chỉ lấy hàng
    const w = await bgApi("/api/v3/product/get_shop_warehouse/", null, "GET");
    const whs = (w.warehouse_list || w.list || w || []).map((x) => ({ id: x.location_id, name: x.warehouse_name || x.name, holiday: !!x.in_holiday_mode }));
    const a = await bgApi("/api/v3/shipment/mass_ship/get_pickup_address_list", {});
    const addrs = a.list || a.address_list || a || [];
    let pickId = +(cfg["tcdd-addr"] || 0);
    if (!addrs.some((x) => x.address_id === pickId && x.can_pickup_code >= 0)) {
      const def = await bgApi("/api/v3/general/get_shop_address", null, "GET");
      pickId = def.pickup_address_id || addrs.find((x) => x.can_pickup_code >= 0)?.address_id || 0;
    }
    const addrOf = (wh) => addrs.find((ad) => ad.address_id === pickId);

    // Gắn kho cho từng đơn
    const byPkg = {};
    for (const wh of whs) {
      const d = await bgApi("/api/v3/order/search_mass_shipment_index", {
        mass_shipment_tab: 201, entity_type: 1,
        filter: { is_single_item: 0, product_location_id: wh.id, pre_order: 0, product_location_ids: [wh.id], process_status: 1, ofg_process_status: 1, return_null_product_location_id_order: false },
        pagination: { from_page_number: 1, page_number: 1, page_size: 50 },
        sort: { sort_type: 2, ascending: true },
      });
      for (const x of d.index_list || []) byPkg[x.package_number || x] = wh.id;
    }
    const hnWh = whs.find((w) => /hà nội/i.test(w.name) && !w.holiday) || whs.find((w) => !w.holiday);
    for (const r of list) {
      r.location_id = byPkg[r.package_number] || null;
      if (!r.location_id && hnWh) {
        r.location_id = hnWh.id;
        await bgLog(`ℹ️ ${r.order_sn}: Shopee chưa gắn kho → xử lý theo ${hnWh.name}`);
      }
    }

    // Cập nhật tổng số đơn phát hiện hôm nay
    await updateDayStats(todayStr(), (day) => {
      day.total_orders = Math.max(day.total_orders, list.length);
    });

    // Gom nhóm theo ĐVVC và địa chỉ lấy hàng
    const groupsMap = {};
    for (const r of list) {
      const wh = whs.find((w) => w.id === r.location_id);
      const ad = addrOf(wh);
      if (!wh || !ad || wh.holiday || ad.can_pickup_code < 0) {
        if (!wh) recordError(r.order_sn, "Xác nhận lấy hàng", "Chưa rõ kho hàng");
        else if (wh.holiday) recordError(r.order_sn, "Xác nhận lấy hàng", "Kho đang bật chế độ nghỉ");
        else recordError(r.order_sn, "Xác nhận lấy hàng", "Kho chưa có địa chỉ lấy hàng hợp lệ");
        continue;
      }
      const k = r.channel_id + "|" + ad.address_id;
      (groupsMap[k] ||= { channel_id: r.channel_id, address_id: ad.address_id, wh, ad, list: [] }).list.push(r);
    }
    const groups = Object.values(groupsMap);
    if (!groups.length) {
      isAutoBusy = false;
      return;
    }

    await bgLog(`🤖 Phát hiện ${list.length} đơn mới chưa xử lý — tiến hành tự động xác nhận + in phiếu...`);

    // Xử lý từng nhóm
    for (const g of groups) {
      try {
        const slotsData = await bgApi("/api/v3/shipment/mass_ship/get_pickup_time_slots", {
          package_numbers: g.list.map((r) => r.package_number),
          channel_id: g.channel_id,
          address_id: g.address_id,
        });
        const slot = (slotsData.time_slots || [])[0];
        if (!slot) {
          const err = `${g.wh.name}: Shopee không trả về ngày lấy hàng`;
          await bgLog(`❌ ${err}`);
          await notifyAndSound({ title: "TOPCARE ❌ LỖI", message: err, sound: "error", isError: true });
          for (const r of g.list) recordError(r.order_sn, "Xác nhận lấy hàng", err);
          continue;
        }

        const group_list = g.list.map((r) => ({
          group_shipment_id: 0,
          primary_package_number: r.package_number,
          package_list: [{ order_id: r.order_id, package_number: r.package_number }],
        }));

        const d = await bgApi("/api/v3/shipment/batch_init_orders", {
          group_list,
          channel_id: g.channel_id,
          pickup_time: slot.value,
          remark: "",
          pickup_address_id: g.address_id,
          shipping_mode: "pickup",
          ...shop,
        });

        const ok = [];
        for (const x of d.data || []) {
          const r = g.list.find((y) => y.package_number === x.primary_package_number);
          if (x.retcode === 0) {
            ok.push(group_list.find((y) => y.primary_package_number === x.primary_package_number));
            await bgLog(`✅ ${r?.order_sn}: đã gửi yêu cầu lấy hàng`);
            await recordConfirmed(r);
            await notifyAndSound({
              title: "TOPCARE · Đơn hàng mới",
              message: `Đã xác nhận lấy hàng đơn: ${r?.order_sn} (${r?.carrier})`,
              sound: "ting",
            });
          } else {
            const msg = x.message || x.rettype || "Lỗi xác nhận Shopee";
            await bgLog(`❌ ${r?.order_sn}: ${msg}`);
            await recordError(r?.order_sn, "Xác nhận lấy hàng", msg);
            await notifyAndSound({
              title: "TOPCARE ❌ LỖI XÁC NHẬN",
              message: `Đơn ${r?.order_sn}: ${msg}`,
              sound: "error",
              isError: true,
            });
          }
        }

        if (!ok.length) continue;

        // Chờ mã vận đơn (tối đa ~30s)
        let ready = false;
        const tn = {};
        for (let i = 0; i < 15 && !ready; i++) {
          await new Promise((res) => setTimeout(res, 2000));
          const st = await bgApi("/api/v3/shipment/batch_get_package_shipment_status", { group_list: ok, channel_id: g.channel_id, ...shop });
          if (st.success_num >= st.total_num) {
            ready = true;
            for (const x of st.group_status_list || []) {
              const r = g.list.find((y) => y.package_number === x.primary_package_number);
              tn[x.primary_package_number] = x.third_party_tn || "";
              await bgLog(`📦 ${r?.order_sn} → mã vận đơn <b>${x.third_party_tn || "đang chờ"}</b>`);
            }
          }
        }

        if (!ready) {
          await bgLog(`⏳ Chưa có mã vận đơn, chưa in được — kiểm tra lại trên Shopee`);
          continue;
        }

        // Tạo phiếu in
        const job = await bgApi("/api/v3/logistics/create_sd_jobs", {
          group_list: ok,
          ...shop,
          channel_id: g.channel_id,
          generate_file_details: [{ file_type: "NORMAL_PDF", file_name: "Phiếu gửi hàng và Phiếu đóng gói", file_contents: [1] }],
          record_generate_schema: true,
        });

        const done = g.list.filter((r) => ok.some((o) => o.primary_package_number === r.package_number));
        const sns = done.map((r) => r.order_sn);
        const orders = done.map((r) => ({ order_id: r.order_id, order_sn: r.order_sn, tn: tn[r.package_number] || "" }));

        for (const jb of job.list || []) {
          const url = `https://banhang.shopee.vn/awbprint?job_id=${encodeURIComponent(jb.job_id)}&shop_id=${shop.shop_id}&lang=vi&first_time=${jb.is_first_time ?? 1}`;
          chrome.tabs.create({ url, active: false });
          await bgLog(`🖨 Đã mở phiếu in: ${jb.job_name || jb.job_id}`);

          // Tạo tên file Wameli: ddmm-gdd-HHMM-n
          const now = new Date();
          const p2 = (n) => String(n).padStart(2, "0");
          const recentJobs = (await chrome.storage.local.get("tcdd-jobs"))["tcdd-jobs"] || [];
          const todayJobs = recentJobs.filter((j) => new Date(j.at).toDateString() === now.toDateString());
          const base = `${p2(now.getDate())}${p2(now.getMonth() + 1)}-gdd-${p2(now.getHours())}${p2(now.getMinutes())}-${todayJobs.length + 1}`;

          const rec = { job_id: jb.job_id, sns, orders, at: Date.now(), base };
          recentJobs.unshift(rec);
          await chrome.storage.local.set({ "tcdd-jobs": recentJobs.slice(0, 30) });
          await recordPrinted(base, sns);

          if (cfg["tcdd-autopdf"] !== "0") {
            // Đợi Shopee tạo file PDF
            let pdfLink = null;
            const q = `&job_id=${encodeURIComponent(jb.job_id)}&is_first_time=0`;
            for (let i = 0; i < 15; i++) {
              const st = await bgApi("/api/v3/logistics/get_sd_job", null, "GET", q);
              if (st.job_status === 5) break;
              if (st.job_status > 5) throw new Error("Shopee tạo phiếu lỗi");
              await new Promise((res) => setTimeout(res, 2000));
            }
            const dLink = await bgApi("/api/v3/logistics/download_sd_job_filelink", null, "GET", q);
            pdfLink = dLink.media_link;
            if (!pdfLink) throw new Error("Shopee chưa trả link PDF");

            // Tải file PDF về máy
            await chrome.downloads.download({
              url: pdfLink,
              filename: `TOPCARE-phieu-in/${base}.pdf`,
              conflictAction: "uniquify",
            });
            await bgLog(`💾 Đã tải PDF: ${base}.pdf`);

            // Đọc nội dung PDF thành base64 để nạp Wameli
            const pdfResp = await fetch(pdfLink);
            const pdfBuf = await pdfResp.arrayBuffer();
            const pdfBytes = new Uint8Array(pdfBuf);
            let pdfBin = "";
            for (let i = 0; i < pdfBytes.length; i += 8192) {
              pdfBin += String.fromCharCode.apply(null, pdfBytes.subarray(i, i + 8192));
            }
            const pdfB64 = btoa(pdfBin);

            // Tạo file Excel 28 cột
            const xlsRows = [XLS_HEAD];
            for (const o of orders) {
              try {
                const od = await bgApi("/api/v3/order/get_one_order", null, "GET", `&order_id=${o.order_id}`);
                const carrier = [od.masking_carrier_name, od.fulfillment_carrier_name].filter(Boolean).join("-");
                for (const it of od.order_items || []) {
                  const r = Array(XLS_HEAD.length).fill("");
                  r[0] = od.order_sn || o.order_sn;
                  r[5] = o.tn || "";
                  r[6] = carrier;
                  r[18] = (it.item_model?.sku || it.product?.sku || "").trim();
                  r[24] = Math.round(+it.order_price || 0);
                  r[25] = it.amount || 1;
                  xlsRows.push(r);
                }
              } catch (e) {
                await bgLog(`⚠️ Lỗi lấy chi tiết đơn ${o.order_sn}: ${e.message}`);
              }
            }

            const xlsxB64 = await globalThis.makeXlsxBase64(xlsRows);
            await chrome.downloads.download({
              url: "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64," + xlsxB64,
              filename: `TOPCARE-phieu-in/${base}.xlsx`,
              conflictAction: "uniquify",
            });
            await bgLog(`💾 Đã tải Excel: ${base}.xlsx (${xlsRows.length - 1} dòng)`);

            // Nạp Wameli
            if (cfg["tcdd-wameli"] !== "0") {
              const warehouse_id = isHCM(g.ad?.warehouse_name) ? 2 : 1; // theo địa chỉ lấy hàng
              const wRes = await executeWameliUpload({
                base,
                warehouse_id,
                pdf: pdfB64,
                xlsx: xlsxB64,
              });
              if (wRes?.ok) {
                await bgLog(`☁️ Đã nạp Wameli: ${base} · khung <b>${wRes.slot}</b> · kho ${warehouse_id === 1 ? "HN" : "HCM"}`);
                await recordWameli(base, wRes.slot, warehouse_id === 1 ? "HN" : "HCM", orders.length, sns);
                await notifyAndSound({
                  title: "TOPCARE · Wameli",
                  message: `Đã nạp ${base} lên Wameli · Khung ${wRes.slot}`,
                  sound: "ting",
                });
              } else {
                const wErr = wRes?.error || "Lỗi không xác định khi nạp Wameli";
                await bgLog(`❌ Nạp Wameli lỗi: ${wErr}`);
                await recordError(base, "Nạp Wameli", wErr);
                await notifyAndSound({
                  title: "TOPCARE ❌ LỖI WAMELI",
                  message: `Nạp Wameli thất bại: ${wErr}`,
                  sound: "error",
                  isError: true,
                });
              }
            }
          }
        }
      } catch (e) {
        await bgLog(`❌ Lỗi nhóm ${g.wh.name}: ${e.message}`);
        await recordError(g.wh.name, "Quy trình in/nạp", e.message);
        await notifyAndSound({
          title: "TOPCARE ❌ LỖI QUY TRÌNH",
          message: `${g.wh.name}: ${e.message}`,
          sound: "error",
          isError: true,
        });
      }
    }
  } catch (e) {
    await bgLog(`❌ Lỗi chạy tự động: ${e.message}`);
  } finally {
    isAutoBusy = false;
  }
}

// ---------- BÁO CÁO TỔNG KẾT (17H & 8H) ----------
function getNextAlarmTime(targetHour, targetMinute = 0) {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

async function triggerDailyReport(type = "17h") {
  const now = new Date();
  const today = todayStr(now);
  const stats = await getDayStats(today);

  const total = stats.total_orders || stats.confirmed.length;
  const printed = stats.printed.reduce((n, p) => n + (p.sns?.length || 1), 0);
  const wameliSlots = stats.wameli.map((w) => w.slot).filter(Boolean);
  const uniqueSlots = [...new Set(wameliSlots)];
  const errorCount = stats.errors.length;

  let msg = `Hôm nay: ${total} đơn, đã in ${printed} đơn, ${stats.wameli.length} lô Wameli (${uniqueSlots.join(", ") || "chưa nạp"}).`;
  if (errorCount > 0) {
    msg += ` ❌ ${errorCount} đơn lỗi cần kiểm tra!`;
  } else {
    msg += ` ✅ Hoàn thành tốt, không có đơn lỗi.`;
  }

  await notifyAndSound({
    title: `TOPCARE 📊 Tổng kết ${type === "17h" ? "17:00 chiều" : "8:00 sáng"}`,
    message: msg + " Bấm để xem bảng chi tiết.",
    sound: "report",
    isError: errorCount > 0,
    reportType: type,
  });

  // Gửi báo cáo tổng kết qua Telegram nếu được cấu hình
  const teleCfg = await getTelegramConfig();
  if (teleCfg.enabled && teleCfg.notifyReport) {
    let reportText = `📊 <b>BÁO CÁO VẬN HÀNH TOPCARE (${type === "17h" ? "17:00 CHIỀU" : "08:00 SÁNG"})</b>\n` +
      `📅 Ngày: ${today}\n` +
      `------------------------------------\n` +
      `📦 Tổng đơn tiếp nhận: <b>${total} đơn</b>\n` +
      `🖨 Đã in phiếu: <b>${printed} đơn</b>\n` +
      `☁️ Lô nạp Wameli: <b>${stats.wameli.length} lượt</b>\n`;
    for (const w of stats.wameli) {
      reportText += `   • Khung ${teleEsc(w.slot)} (${teleEsc(w.warehouse || "HN")}): ${w.count || w.sns?.length || 0} đơn (${teleEsc(w.base)})\n`;
    }
    if (errorCount > 0) {
      reportText += `❌ Đơn lỗi: <b>${errorCount} đơn</b>\n`;
      for (const e of stats.errors) {
        reportText += `   • <code>${teleEsc(e.order_sn)}</code>: [${teleEsc(e.stage)}] ${teleEsc(e.message)}\n`;
      }
    } else {
      reportText += `✅ Đơn lỗi: <b>0 đơn</b> (Vận hành trơn tru)\n`;
    }
    reportText += `------------------------------------\n` +
      `⏰ Tự động gửi từ Extension Topcare lúc ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
    await sendTelegram(reportText);
  }

  // Lưu flag để Side Panel tự động mở modal khi mở
  await chrome.storage.local.set({
    tcdd_open_report: { type, date: today, time: Date.now() },
  });
  chrome.runtime.sendMessage({ type: "tcdd-open-report", reportType: type }).catch(() => {});
}

// ---------- KHỞI TẠO VÀ QUẢN LÝ ALARMS ----------
async function initAlarms() {
  const cfg = await chrome.storage.local.get(["tcdd-auto", "tcdd-every"]);
  const interval = Math.max(1, +(cfg["tcdd-every"] || 2));

  // 1. Alarm tự động đọc đơn theo chu kỳ
  if (cfg["tcdd-auto"] === "1") {
    chrome.alarms.create("tcdd-auto-alarm", { periodInMinutes: interval });
  } else {
    chrome.alarms.clear("tcdd-auto-alarm");
  }

  // 2. Alarm báo cáo 17h chiều
  chrome.alarms.create("tcdd-report-17", {
    when: getNextAlarmTime(17, 0),
    periodInMinutes: 24 * 60,
  });

  // 3. Alarm báo cáo 8h sáng
  chrome.alarms.create("tcdd-report-8", {
    when: getNextAlarmTime(8, 0),
    periodInMinutes: 24 * 60,
  });
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "tcdd-auto-alarm") {
    await runAutoBackground();
  } else if (alarm.name === "tcdd-report-17") {
    await triggerDailyReport("17h");
  } else if (alarm.name === "tcdd-report-8") {
    await triggerDailyReport("8h");
  }
});

// Khi tab Shopee tải xong (F5 hoặc thao tác mới) -> kích hoạt kiểm tra
chrome.tabs.onUpdated.addListener((_id, info, tab) => {
  if (info.status === "complete" && tab.url?.startsWith("https://banhang.shopee.vn/")) {
    runAutoBackground();
  }
});

// ---------- XỬ LÝ MESSAGE TỪ PANEL & CÁC THÀNH PHẦN KHÁC ----------
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (msg.type === "tcdd-api") {
    (async () => {
      try {
        const data = await bgApi(msg.path, msg.body, msg.method, msg.query);
        reply({ json: { code: 0, data } });
      } catch (e) {
        reply({ error: e.message || String(e) });
      }
    })();
    return true;
  }

  if (msg.type === "tcdd-wameli") {
    (async () => {
      try {
        const res = await executeWameliUpload(msg);
        reply(res);
      } catch (e) {
        reply({ error: "Wameli: " + String(e.message || e) });
      }
    })();
    return true;
  }

  if (msg.type === "tcdd-download") {
    if (!/^https:\/\/[a-z0-9.-]+\.susercontent\.com\//.test(msg.url)) {
      reply({ error: "Link tải không phải của Shopee" });
      return;
    }
    chrome.downloads.download({ url: msg.url, filename: msg.filename, conflictAction: "uniquify" })
      .then((id) => reply({ id }), (e) => reply({ error: String(e.message || e) }));
    return true;
  }

  if (msg.type === "tcdd-set-auto") {
    (async () => {
      await chrome.storage.local.set({ "tcdd-auto": msg.enabled ? "1" : "0" });
      await initAlarms();
      if (msg.enabled) runAutoBackground();
      reply({ ok: true });
    })();
    return true;
  }

  if (msg.type === "tcdd-set-every") {
    (async () => {
      await chrome.storage.local.set({ "tcdd-every": String(msg.minutes) });
      await initAlarms();
      reply({ ok: true });
    })();
    return true;
  }

  if (msg.type === "tcdd-test-sound") {
    (async () => {
      await playAudio(msg.sound || "ting");
      reply({ ok: true });
    })();
    return true;
  }

  if (msg.type === "tcdd-trigger-report") {
    (async () => {
      await triggerDailyReport(msg.reportType || "17h");
      reply({ ok: true });
    })();
    return true;
  }

  if (msg.type === "tcdd-run-now") {
    (async () => {
      await runAutoBackground();
      reply({ ok: true });
    })();
    return true;
  }

  if (msg.type === "tcdd-get-stats") {
    (async () => {
      const stats = await getDayStats(msg.date || todayStr());
      reply({ stats });
    })();
    return true;
  }

  if (msg.type === "tcdd-record-error") {
    (async () => {
      await recordError(msg.order_sn, msg.stage, msg.message);
      await notifyAndSound({
        title: "TOPCARE ❌ LỖI",
        message: `${msg.order_sn ? msg.order_sn + ": " : ""}${msg.message}`,
        sound: "error",
        isError: true,
      });
      reply({ ok: true });
    })();
    return true;
  }

  if (msg.type === "tcdd-notify") {
    (async () => {
      await notifyAndSound(msg);
      reply({ ok: true });
    })();
    return true;
  }

  if (msg.type === "tcdd-test-tele") {
    (async () => {
      const text = `🎉 <b>[TOPCARE] KẾT NỐI TELEGRAM THÀNH CÔNG!</b>\n` +
        `• Bot Token & Chat ID hợp lệ.\n` +
        `• Tiện ích đã sẵn sàng tự động bắn đơn hàng, cảnh báo lỗi và gửi báo cáo 17h/8h vào nhóm chat này.\n` +
        `⏰ Thử nghiệm lúc: ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
      const res = await sendTelegram(text);
      reply(res);
    })();
    return true;
  }

  if (msg.type === "tcdd-send-tele-report") {
    (async () => {
      const stats = await getDayStats(msg.date || todayStr());
      const now = new Date();
      const total = stats.total_orders || stats.confirmed.length;
      const printed = stats.printed.reduce((n, p) => n + (p.sns?.length || 1), 0);
      const errorCount = stats.errors.length;

      let reportText = `📊 <b>BÁO CÁO VẬN HÀNH TOPCARE</b>\n` +
        `📅 Ngày: ${msg.date || todayStr()}\n` +
        `------------------------------------\n` +
        `📦 Tổng đơn tiếp nhận: <b>${total} đơn</b>\n` +
        `🖨 Đã in phiếu: <b>${printed} đơn</b>\n` +
        `☁️ Lô nạp Wameli: <b>${stats.wameli.length} lượt</b>\n`;
      for (const w of stats.wameli) {
        reportText += `   • Khung ${teleEsc(w.slot)} (${teleEsc(w.warehouse || "HN")}): ${w.count || w.sns?.length || 0} đơn (${teleEsc(w.base)})\n`;
      }
      if (errorCount > 0) {
        reportText += `❌ Đơn lỗi: <b>${errorCount} đơn</b>\n`;
        for (const e of stats.errors) {
          reportText += `   • <code>${teleEsc(e.order_sn)}</code>: [${teleEsc(e.stage)}] ${teleEsc(e.message)}\n`;
        }
      } else {
        reportText += `✅ Đơn lỗi: <b>0 đơn</b> (Vận hành trơn tru)\n`;
      }
      reportText += `------------------------------------\n` +
        `⏰ Gửi từ tiện ích Topcare lúc ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
      const res = await sendTelegram(reportText);
      reply(res);
    })();
    return true;
  }
});
