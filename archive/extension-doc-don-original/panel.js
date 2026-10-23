// Side Panel: đọc đơn, hiện kho + địa chỉ lấy hàng, chọn đơn.
// Nút "Xác nhận lấy hàng": hiện tóm tắt, bấm "Gửi yêu cầu lấy hàng" mới gọi batch_init_orders (giống nút trên Shopee).
const BATCH = 5;
const VIEWS = {
  "cho-xu-ly": { tab: 300, st: 1, label: "Chưa xử lý" },
  "da-xu-ly": { tab: 300, st: 2, label: "Đã xử lý" },
  "cho-lay": { tab: 300, st: 0, label: "Chờ lấy hàng" },
  "dang-giao": { tab: 400, st: 0, label: "Đang giao" },
};

const ls = {
  get: (k, d) => {
    try {
      const v = localStorage.getItem(k);
      return v !== null ? v : d;
    } catch {
      return d;
    }
  },
  set: (k, v) => {
    try { localStorage.setItem(k, v); } catch {}
    try { chrome.storage?.local?.set({ [k]: v }).catch(() => {}); } catch {}
  },
};

// Đồng bộ cài đặt từ chrome.storage.local
chrome.storage?.local?.get(null, (all) => {
  if (all) {
    for (const [k, v] of Object.entries(all)) {
      if (typeof v === "string" && !localStorage.getItem(k)) {
        try { localStorage.setItem(k, v); } catch {}
      }
    }
  }
});

let cur = ls.get("tcdd-view", "cho-xu-ly");
let rows = [], counts = {}, timer = null, nextAt = 0, picked = new Set();
let whs = [], addrs = [], shop = { shop_id: 0, region_id: "VN" }, slots = [];
const seen = new Set(JSON.parse(ls.get("tcdd-seen", "[]")));

const p2 = (n) => String(n).padStart(2, "0");
function todayStr(d = new Date()) {
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
}

// ---------- gọi API (qua tab Kênh Người Bán) ----------
async function api(path, body, method = "POST", query = "") {
  let res;
  if (globalThis.chrome?.runtime?.id) {
    res = await chrome.runtime.sendMessage({ type: "tcdd-api", path, body, method, query });
  } else {
    const cds = (document.cookie.match(/SPC_CDS=([^;]+)/) || [])[1] || "";
    const r = await fetch(`${path}?SPC_CDS=${cds}&SPC_CDS_VER=2`, {
      method, headers: { "content-type": "application/json" }, credentials: "include",
      body: method === "GET" ? undefined : JSON.stringify(body || {}),
    });
    res = { json: await r.json() };
  }
  if (res?.error) throw new Error(res.error);
  const j = res.json;
  if (j?.code !== 0) throw new Error(j?.message || j?.user_message || "Lỗi API");
  return j.data;
}

async function fetchIndex(v) {
  let out = [], page = 1;
  for (;;) {
    const d = await api("/api/v3/order/search_order_list_index", {
      order_list_tab: v.tab, entity_type: 1,
      pagination: { from_page_number: 1, page_number: page, page_size: 40 },
      filter: { fulfillment_type: 0, is_drop_off: 0, fulfillment_source: 0, action_filter: 0, order_to_ship_status: v.st },
      sort: { sort_type: 2, ascending: true },
    });
    const list = d.index_list || [];
    out = out.concat(list);
    if (list.length < 40 || out.length >= 400) return { list: out, total: d.pagination?.total ?? out.length };
    page++;
  }
}

async function fetchCards(v, index) {
  const cards = [];
  for (let i = 0; i < index.length; i += BATCH) {
    const part = index.slice(i, i + BATCH);
    const body = { order_list_tab: v.tab, need_count_down_desc: false };
    if (v.tab === 300) body.package_param_list = part.map((x) => ({ package_number: x.package_number, shop_id: x.shop_id, region_id: x.region_id }));
    else body.order_param_list = part.map((x) => ({ order_id: x.order_id, shop_id: x.shop_id, region_id: x.region_id }));
    const d = await api("/api/v3/order/get_order_list_card_list", body);
    cards.push(...(d.card_list || []));
  }
  return cards;
}

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

// ---------- kho & địa chỉ lấy hàng (chỉ đọc) ----------
async function loadWarehouses() {
  if (whs.length) return;
  const w = await api("/api/v3/product/get_shop_warehouse/", null, "GET");
  whs = (w.warehouse_list || w.list || w || []).map((x) => ({ id: x.location_id, name: x.warehouse_name || x.name, holiday: !!x.in_holiday_mode }));
  const a = await api("/api/v3/shipment/mass_ship/get_pickup_address_list", {});
  addrs = a.list || a.address_list || a || [];
  if (!addrs.some((x) => x.address_id === pickId && x.can_pickup_code >= 0)) {
    const def = await api("/api/v3/general/get_shop_address", null, "GET");
    pickId = def.pickup_address_id || addrs.find((x) => x.can_pickup_code >= 0)?.address_id || 0;
  }
}
const isHCM = (name) => /hồ chí minh|hcm/i.test(name || "");
let pickId = +ls.get("tcdd-addr", "0");
const addrOf = () => addrs.find((a) => a.address_id === pickId);

// Gắn kho cho từng đơn chưa xử lý
async function tagLocations() {
  const byPkg = {};
  for (const wh of whs) {
    const d = await api("/api/v3/order/search_mass_shipment_index", {
      mass_shipment_tab: 201, entity_type: 1,
      filter: { is_single_item: 0, product_location_id: wh.id, pre_order: 0, product_location_ids: [wh.id], process_status: 1, ofg_process_status: 1, return_null_product_location_id_order: false },
      pagination: { from_page_number: 1, page_number: 1, page_size: 50 },
      sort: { sort_type: 2, ascending: true },
    });
    for (const x of d.index_list || []) byPkg[x.package_number || x] = wh.id;
  }
  const hnWh = whs.find((w) => /hà nội/i.test(w.name) && !w.holiday) || whs.find((w) => !w.holiday);
  for (const r of rows) r.location_id = byPkg[r.package_number] || hnWh?.id || null; // Shopee chưa gắn kho -> theo Kho Hà Nội
}

// ---------- giao diện ----------
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const money = (n) => n.toLocaleString("vi-VN") + "₫";

function mount() {
  $("#app").innerHTML = `
    <div class="tc-bar">
      <span>TOPCARE · Đọc đơn</span>
      <span style="font-size:11px;font-weight:400;color:#9ec5fe">⚡ Tự động chạy nền & Báo động</span>
    </div>
    <div class="tc-tabs">${Object.entries(VIEWS).map(([k, v]) => `<button class="tc-pill" data-k="${k}">${v.label}<span class="n">–</span></button>`).join("")}</div>
    <div class="tc-tools">
      <button class="tc-btn" id="tc-read">↻ Đọc ngay</button>
      <button class="tc-btn gray" id="tc-auto">🤖 Tự động: TẮT</button>
      <button class="tc-btn purple" id="tc-report">📊 Tổng kết</button>
      <button class="tc-btn blue" id="tc-tele">✈️ Telegram</button>
      <button class="tc-btn blue" id="tc-pdf">⬇ PDF vừa in</button>
      <button class="tc-btn gray" id="tc-flow">📋 Quy trình</button>
      <span class="tc-muted" id="tc-next"></span>
      <label>Tự đọc <select id="tc-every">${[1, 2, 3, 5].map((m) => `<option value="${m}">${m} phút</option>`).join("")}</select></label>
    </div>
    <div class="tc-sum" id="tc-sum"></div>
    <div class="tc-note" id="tc-autolog" hidden style="margin:0 12px 6px;max-height:140px;overflow:auto"></div>
    <div class="tc-body" id="tc-body"></div>
    <div class="tc-ship" id="tc-ship" hidden></div>`;

  document.querySelectorAll(".tc-pill").forEach((b) => (b.onclick = () => { cur = b.dataset.k; ls.set("tcdd-view", cur); picked.clear(); load(); }));
  $("#tc-read").onclick = () => load();
  $("#tc-pdf").onclick = () => pdfMenu();
  $("#tc-flow").onclick = () => flowMenu();
  $("#tc-report").onclick = () => reportMenu();
  $("#tc-tele").onclick = () => teleMenu();
  paintPdf();

  const paintAuto = () => {
    const b = $("#tc-auto");
    const on = autoOn();
    b.textContent = `🤖 Tự động: ${on ? "BẬT" : "TẮT"}`;
    b.className = "tc-btn " + (on ? "green" : "gray");
  };
  paintAuto();

  $("#tc-auto").onclick = () => {
    const willOn = !autoOn();
    if (willOn && !confirm("BẬT CHẾ ĐỘ TỰ ĐỘNG CHẠY NỀN?\n\nMỗi lần đọc (theo chu kỳ Tự đọc), mọi đơn Chưa xử lý sẽ được:\n• Xác nhận lấy hàng ngày sớm nhất tại kho\n• Tạo phiếu in và tải PDF + Excel\n• Nạp lên Wameli\n\n⚡ ĐẶC BIỆT: Tự động chạy nền kể cả khi bạn ĐÓNG BẢNG này (miễn trình duyệt còn mở và tab Shopee/Wameli còn đăng nhập).\n🔔 Có tiếng chuông 'ting' khi có đơn mới và chuông cảnh báo khi có lỗi ❌.\n✈️ Tự động bắn thông báo vào Telegram (nếu đã cấu hình).")) return;
    ls.set("tcdd-auto", willOn ? "1" : "0");
    paintAuto();
    chrome.runtime.sendMessage({ type: "tcdd-set-auto", enabled: willOn }).catch(() => {});
    autoLog(willOn ? "🤖 Đã BẬT tự động (chạy nền kể cả khi đóng bảng)" : "Đã TẮT tự động");
  };

  $("#tc-every").value = ls.get("tcdd-every", "2");
  $("#tc-every").onchange = (e) => {
    ls.set("tcdd-every", e.target.value);
    chrome.runtime.sendMessage({ type: "tcdd-set-every", minutes: +e.target.value }).catch(() => {});
    schedule();
  };

  // Khôi phục log tự động từ bộ nhớ
  chrome.storage?.local?.get("tcdd_autolog", (d) => {
    if (d?.tcdd_autolog?.length) {
      const box = $("#tc-autolog");
      box.hidden = false;
      box.innerHTML = d.tcdd_autolog.join("");
    }
  });

  // Tự động mở bảng báo cáo nếu có flag từ thông báo 17h/8h
  chrome.storage?.local?.get("tcdd_open_report", (d) => {
    if (d?.tcdd_open_report && Date.now() - d.tcdd_open_report.time < 300000) {
      chrome.storage.local.remove("tcdd_open_report");
      reportMenu(d.tcdd_open_report.date);
    }
  });
}

// Lắng nghe message cập nhật từ background
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "tcdd-log") {
    const box = $("#tc-autolog");
    if (box) {
      box.hidden = false;
      box.innerHTML = msg.html + box.innerHTML.split("</div>").slice(0, 40).join("</div>");
    }
  }
  if (msg.type === "tcdd-open-report") {
    reportMenu(msg.date);
  }
  if (msg.type === "tcdd-stats-updated") {
    const currentModal = document.querySelector(".tc-modal[data-report-date]");
    if (currentModal && currentModal.dataset.reportDate === (msg.date || todayStr())) {
      currentModal.remove();
      reportMenu(msg.date);
    }
  }
});

function card(r) {
  const wh = whs.find((w) => w.id === r.location_id);
  const isNew = !seen.has(r.order_sn);
  const sel = cur === "cho-xu-ly" || cur === "da-xu-ly";
  return `<div class="tc-card ${r.warn ? "warn" : ""} ${isNew ? "new" : ""} ${picked.has(r.package_number) ? "sel" : ""}">
    <div class="tc-top"><span>${sel ? `<input type="checkbox" data-p="${esc(r.package_number)}" ${picked.has(r.package_number) ? "checked" : ""}>` : ""}
      <a href="https://banhang.shopee.vn/portal/sale/order/${r.order_id}" target="_blank">${esc(r.order_sn)}</a></span>
      <span>${money(r.total)}</span></div>
    <div class="tc-row"><span>👤 ${esc(r.buyer)}</span>${wh ? `<span class="tc-kho ${isHCM(wh.name) ? "hcm" : ""}">${esc(wh.name)}</span>` : ""}</div>
    <div class="tc-items">${r.items.map(esc).join("<br>")}</div>
    <div class="tc-row"><span>🚚 ${esc(r.carrier)} ${esc(r.tracking)}</span><span>${esc(r.ship_by)}</span></div>
    ${r.tag ? `<div class="tc-muted">⏱ ${esc(r.tag)}</div>` : ""}
    ${wh && sel ? `<div class="tc-muted">📍 Lấy tại: ${esc(addrOf(wh) ? `${addrOf(wh).address}, ${addrOf(wh).city}` : "chưa có địa chỉ lấy hàng cho kho này")}</div>` : ""}
    ${isNew ? `<span class="tc-tag blue">Đơn mới</span>` : ""}${r.warn ? `<span class="tc-tag">Sắp/quá hạn</span>` : ""}
  </div>`;
}

function render() {
  const body = $("#tc-body");
  if (!rows.length) { body.innerHTML = `<p class="tc-muted">Không có đơn.</p>`; $("#tc-ship").hidden = true; return; }
  if (cur === "da-xu-ly") { renderPrinted(body); return; }
  if (cur !== "cho-xu-ly") { body.innerHTML = rows.map(card).join(""); $("#tc-ship").hidden = true; return; }
  const groups = {};
  for (const r of rows) (groups[r.location_id || "?"] ||= []).push(r);
  body.innerHTML = Object.entries(groups).map(([loc, list]) => {
    const wh = whs.find((w) => w.id === loc);
    return `<div class="tc-group">${esc(wh?.name || "Chưa rõ kho")} <small><label><input type="checkbox" data-all="${esc(loc)}"> chọn tất cả (${list.length})</label></small></div>${list.map(card).join("")}`;
  }).join("");
  body.querySelectorAll("input[data-p]").forEach((c) => (c.onchange = () => { c.checked ? picked.add(c.dataset.p) : picked.delete(c.dataset.p); render(); }));
  body.querySelectorAll("input[data-all]").forEach((c) => {
    const list = groups[c.dataset.all];
    c.checked = list.every((r) => picked.has(r.package_number));
    c.onchange = () => { list.forEach((r) => (c.checked ? picked.add(r.package_number) : picked.delete(r.package_number))); render(); };
  });
  renderShip();
}

// ---------- Tab ĐÃ XỬ LÝ ----------
function renderPrinted(body) {
  body.innerHTML = `<div class="tc-group">Đơn đã xử lý <small><label><input type="checkbox" id="tc-allp"> chọn tất cả (${rows.length})</label></small></div>` + rows.map(card).join("");
  body.querySelectorAll("input[data-p]").forEach((c) => (c.onchange = () => { c.checked ? picked.add(c.dataset.p) : picked.delete(c.dataset.p); render(); }));
  const all = $("#tc-allp");
  all.checked = rows.length > 0 && rows.every((r) => picked.has(r.package_number));
  all.onchange = () => { rows.forEach((r) => (all.checked ? picked.add(r.package_number) : picked.delete(r.package_number))); render(); };
  const sel = rows.filter((r) => picked.has(r.package_number));
  const box = $("#tc-ship");
  box.hidden = false;
  box.innerHTML = `<div class="line"><b>Đã chọn ${sel.length} đơn</b>
      <span class="tc-muted">Phiếu gửi hàng và Phiếu đóng gói · ${ls.get("tcdd-autopdf", "1") === "1" ? "tải PDF + Excel" : "không tải file"}${ls.get("tcdd-wameli", "1") === "1" ? " · nạp Wameli" : ""}</span></div>
    <div id="tc-plog" class="tc-muted"></div>
    <button class="tc-btn green" id="tc-print" ${sel.length && !printing ? "" : "disabled"}>🖨 In đơn (${sel.length})</button>`;
  $("#tc-print").onclick = () => printSelected(sel);
}

let printing = false;
async function printSelected(sel) {
  if (printing) return;
  const wm = ls.get("tcdd-wameli", "1") === "1" && ls.get("tcdd-autopdf", "1") === "1";
  if (!confirm(`In ${sel.length} đơn:\n${sel.map((r) => r.order_sn).join("\n")}\n\nTạo phiếu, mở trang in${wm ? ", tải PDF + Excel và NẠP LÊN WAMELI" : ""}.\nTiếp tục?`)) return;
  printing = true;
  $("#tc-print").disabled = true;
  const log = autoLog;
  log(`🖨 Bắt đầu in ${sel.length} đơn: ${esc(sel.map((r) => r.order_sn).join(", "))}`);
  const byCh = {};
  for (const r of sel) (byCh[r.channel_id] ||= []).push(r);
  for (const [ch, list] of Object.entries(byCh)) {
    try {
      const ok = list.map((r) => ({ primary_package_number: r.package_number, group_shipment_id: 0, package_list: [{ order_id: r.order_id, package_number: r.package_number }] }));
      const st = await api("/api/v3/shipment/batch_get_package_shipment_status", { group_list: ok, channel_id: +ch, ...shop });
      const tn = {};
      for (const x of st.group_status_list || []) tn[x.primary_package_number] = x.third_party_tn || "";
      await printPackages(list, +ch, ok, tn, log);
    } catch (e) {
      log(`❌ ${esc(e.message)}`);
      chrome.runtime.sendMessage({ type: "tcdd-record-error", order_sn: sel.map((x) => x.order_sn).join(", "), stage: "In đơn", message: e.message });
    }
  }
  picked.clear();
  printing = false;
}

function renderShip() {
  const box = $("#tc-ship");
  const sel = rows.filter((r) => picked.has(r.package_number));
  box.hidden = false;
  const fmt = (t) => new Date(t * 1000).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
  box.innerHTML = `
    <div class="line"><b>Đã chọn ${sel.length} đơn</b></div>
    <div class="line">Địa chỉ lấy hàng: <select id="tc-addr">${addrs.map((a) => `<option value="${a.address_id}" ${a.can_pickup_code < 0 ? "disabled" : ""}>${esc(a.warehouse_name)} – ${esc(a.address)}, ${esc(a.city)}${a.can_pickup_code < 0 ? " (không dùng được)" : ""}</option>`).join("")}</select></div>
    <div class="line"><label><input type="radio" name="mode" value="pickup" checked> Lấy hàng (Pickup)</label>
      <label class="tc-muted"><input type="radio" name="mode" value="dropoff" disabled> Drop off (chưa hỗ trợ)</label></div>
    <div class="line">Ngày lấy: <select id="tc-day">${slots.length ? slots.map((t, i) => `<option value="${i}">${fmt(t.value)}</option>`).join("") : `<option value="0">Ngày sớm nhất Shopee cho phép</option>`}</select></div>
    <button class="tc-btn green" id="tc-confirm" ${sel.length ? "" : "disabled"}>Xác nhận lấy hàng (${sel.length} đơn)</button>`;
  if (slots.length) $("#tc-day").value = Math.min(+ls.get("tcdd-day", "0"), slots.length - 1);
  $("#tc-day").onchange = (e) => ls.set("tcdd-day", e.target.value);
  $("#tc-addr").value = pickId;
  $("#tc-addr").onchange = (e) => { pickId = +e.target.value; ls.set("tcdd-addr", pickId); slots = []; render(); };
  $("#tc-confirm").onclick = () => preview(sel);
  if (sel.length && !slots.length) loadSlots(sel);
}

async function loadSlots(sel) {
  const g = groupsOf(sel)[0];
  if (!g) return;
  try { slots = await getSlots(g); if (slots.length) renderShip(); } catch {}
}
async function getSlots(g) {
  const d = await api("/api/v3/shipment/mass_ship/get_pickup_time_slots", { package_numbers: g.list.map((r) => r.package_number), channel_id: g.channel_id, address_id: g.address_id });
  return d.time_slots || [];
}

function groupsOf(sel) {
  const m = {};
  for (const r of sel) {
    const wh = whs.find((w) => w.id === r.location_id);
    const ad = addrOf(wh);
    if (!wh || !ad || wh.holiday || ad.can_pickup_code < 0) continue;
    const k = r.channel_id + "|" + ad.address_id;
    (m[k] ||= { channel_id: r.channel_id, address_id: ad.address_id, wh, ad, list: [] }).list.push(r);
  }
  return Object.values(m);
}

async function shipAndPrint(g, dayIdx, log) {
  const ts = await getSlots(g);
  const slot = ts[Math.min(dayIdx, ts.length - 1)];
  if (!slot) {
    const err = `${g.wh.name}: Shopee không trả về ngày lấy hàng`;
    log(`❌ ${esc(err)}`);
    for (const r of g.list) {
      chrome.runtime.sendMessage({ type: "tcdd-record-error", order_sn: r.order_sn, stage: "Xác nhận lấy hàng", message: err });
    }
    return;
  }
  const group_list = g.list.map((r) => ({ group_shipment_id: 0, primary_package_number: r.package_number, package_list: [{ order_id: r.order_id, package_number: r.package_number }] }));
  const d = await api("/api/v3/shipment/batch_init_orders", { group_list, channel_id: g.channel_id, pickup_time: slot.value, remark: "", pickup_address_id: g.address_id, shipping_mode: "pickup", ...shop });
  const ok = [];
  for (const x of d.data || []) {
    const r = g.list.find((y) => y.package_number === x.primary_package_number);
    if (x.retcode === 0) {
      ok.push(group_list.find((y) => y.primary_package_number === x.primary_package_number));
      log(`✅ ${esc(r?.order_sn)}: đã gửi yêu cầu lấy hàng`);
      chrome.runtime.sendMessage({
        type: "tcdd-notify",
        title: "TOPCARE · Đơn hàng mới",
        message: `Đã xác nhận lấy hàng đơn: ${r?.order_sn} (${r?.carrier})`,
        sound: "ting",
      });
    } else {
      const msg = x.message || x.rettype || "Lỗi xác nhận Shopee";
      log(`❌ ${esc(r?.order_sn)}: ${esc(msg)}`);
      chrome.runtime.sendMessage({
        type: "tcdd-record-error",
        order_sn: r?.order_sn,
        stage: "Xác nhận lấy hàng",
        message: msg,
      });
    }
  }
  if (!ok.length) return;
  let ready = false;
  const tn = {};
  for (let i = 0; i < 15 && !ready; i++) {
    await new Promise((res) => setTimeout(res, 2000));
    const st = await api("/api/v3/shipment/batch_get_package_shipment_status", { group_list: ok, channel_id: g.channel_id, ...shop });
    if (st.success_num >= st.total_num) {
      ready = true;
      for (const x of st.group_status_list || []) {
        const r = g.list.find((y) => y.package_number === x.primary_package_number);
        tn[x.primary_package_number] = x.third_party_tn || "";
        log(`📦 ${esc(r?.order_sn)} → mã vận đơn <b>${esc(x.third_party_tn || "đang chờ")}</b>`);
      }
    }
  }
  if (!ready) { log(`⏳ Chưa có mã vận đơn, chưa in được — bấm in lại sau trên Shopee`); return; }
  await printPackages(g.list, g.channel_id, ok, tn, log);
}

async function printPackages(list, channel_id, ok, tn, log) {
  const job = await api("/api/v3/logistics/create_sd_jobs", {
    group_list: ok, ...shop, channel_id,
    generate_file_details: [{ file_type: "NORMAL_PDF", file_name: "Phiếu gửi hàng và Phiếu đóng gói", file_contents: [1] }],
    record_generate_schema: true,
  });
  const done = list.filter((r) => ok.some((o) => o.primary_package_number === r.package_number));
  const sns = done.map((r) => r.order_sn);
  const orders = done.map((r) => ({ order_id: r.order_id, order_sn: r.order_sn, tn: tn[r.package_number] || "" }));
  for (const jb of job.list || []) {
    const url = `https://banhang.shopee.vn/awbprint?job_id=${encodeURIComponent(jb.job_id)}&shop_id=${shop.shop_id}&lang=vi&first_time=${jb.is_first_time ?? 1}`;
    chrome.tabs.create({ url, active: true });
    log(`🖨 Đã mở phiếu in: ${esc(jb.job_name || jb.job_id)}`);
    const rec = { job_id: jb.job_id, sns, orders, at: Date.now() };
    rememberJob(rec);
    if (ls.get("tcdd-autopdf", "1") === "1") await downloadJob(rec, log, true);
  }
}

// ---------- TẢI PDF & EXCEL PHIẾU IN ----------
const jobs = () => { try { return JSON.parse(ls.get("tcdd-jobs", "[]")); } catch { return []; } };
function rememberJob(j) {
  ls.set("tcdd-jobs", JSON.stringify([j, ...jobs()].slice(0, 30)));
  paintPdf();
}
function paintPdf() {
  const b = $("#tc-pdf");
  if (b) { const n = jobs().length; b.disabled = !n; b.textContent = `⬇ PDF vừa in${n ? "" : " (chưa có)"}`; }
}
function baseName(job) {
  const d = new Date(job.at || Date.now());
  const today = jobs().filter((j) => new Date(j.at).toDateString() === d.toDateString() && j.at <= (job.at || Date.now())).length || 1;
  return `${p2(d.getDate())}${p2(d.getMonth() + 1)}-gdd-${p2(d.getHours())}${p2(d.getMinutes())}-${today}`;
}
async function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  await chrome.downloads.download({ url, filename: "TOPCARE-phieu-in/" + filename, conflictAction: "uniquify" });
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
async function downloadJob(job, log, upload = false, force = false) {
  const base = baseName(job);
  let pdf = null, xlsx = null;
  try {
    const q = `&job_id=${encodeURIComponent(job.job_id)}&is_first_time=0`;
    for (let i = 0; i < 15; i++) {
      const st = await api("/api/v3/logistics/get_sd_job", null, "GET", q);
      if (st.job_status === 5) break;
      if (st.job_status > 5) throw new Error("Shopee tạo phiếu lỗi");
      await new Promise((res) => setTimeout(res, 2000));
    }
    const d = await api("/api/v3/logistics/download_sd_job_filelink", null, "GET", q);
    if (!d.media_link) throw new Error("Shopee chưa trả link PDF");
    pdf = await (await fetch(d.media_link)).blob();
    await saveBlob(pdf, base + ".pdf");
    log(`💾 Đã tải PDF: ${esc(base)}.pdf`);
  } catch (e) {
    log(`❌ Tải PDF lỗi: ${esc(e.message)}`);
    chrome.runtime.sendMessage({ type: "tcdd-record-error", order_sn: base, stage: "Tải PDF", message: e.message });
  }
  if (job.orders?.length) xlsx = await downloadExcel(job.orders, base + ".xlsx", log);
  if (upload && pdf && xlsx && (force || ls.get("tcdd-wameli", "1") === "1")) await uploadWameli(pdf, xlsx, base, log);
}

// ---------- NẠP WAMELI ----------
const b64 = (blob) => new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.readAsDataURL(blob); });
async function uploadWameli(pdf, xlsx, base, log) {
  try {
    const warehouse_id = isHCM(addrOf()?.warehouse_name) ? 2 : 1;
    const r = await chrome.runtime.sendMessage({
      type: "tcdd-wameli", base, warehouse_id,
      pdf: await b64(pdf), xlsx: await b64(xlsx),
    });
    if (r?.error) throw new Error(r.error);
    log(`☁️ Đã nạp Wameli: ${esc(base)} · khung <b>${esc(r.slot)}</b> · kho ${warehouse_id === 1 ? "HN" : "HCM"}`);
    chrome.runtime.sendMessage({
      type: "tcdd-notify",
      title: "TOPCARE · Wameli",
      message: `Đã nạp ${base} lên Wameli · Khung ${r.slot}`,
      sound: "ting",
    });
  } catch (e) {
    log(`❌ Nạp Wameli lỗi: ${esc(e.message)}`);
    chrome.runtime.sendMessage({
      type: "tcdd-record-error",
      order_sn: base,
      stage: "Nạp Wameli",
      message: e.message,
    });
  }
}

// ---------- EXCEL 28 CỘT ----------
const XLS_HEAD = ["Mã đơn hàng", "Mã Kiện Hàng", "Ngày đặt hàng", "Trạng Thái Đơn Hàng", "Nhận xét từ Người mua", "Mã vận đơn",
  "Đơn Vị Vận Chuyển", "Phương thức giao hàng", "Loại đơn hàng", "Ngày giao hàng dự kiến", "Ngày gửi hàng", "Thời gian giao hàng",
  "Trạng thái Trả hàng/Hoàn tiền", "SKU sản phẩm", "Tên sản phẩm", "Cân nặng sản phẩm", "Tổng cân nặng", "Tên kho hàng",
  "SKU phân loại hàng", "Tên phân loại hàng", "Giá gốc", "Người bán trợ giá", "Được Shopee trợ giá",
  "Tổng số tiền được người bán trợ giá", "Giá gốc (Y)", "Số lượng", "Số lượng sản phẩm được hoàn trả", "Tổng số tiền Người mua thanh toán"];
async function downloadExcel(orders, filename, log) {
  try {
    const rows = [XLS_HEAD];
    for (const o of orders) {
      const d = await api("/api/v3/order/get_one_order", null, "GET", `&order_id=${o.order_id}`);
      const carrier = [d.masking_carrier_name, d.fulfillment_carrier_name].filter(Boolean).join("-");
      for (const it of d.order_items || []) {
        const r = Array(XLS_HEAD.length).fill("");
        r[0] = d.order_sn || o.order_sn;
        r[5] = o.tn || "";
        r[6] = carrier;
        r[18] = (it.item_model?.sku || it.product?.sku || "").trim();
        r[24] = Math.round(+it.order_price || 0);
        r[25] = it.amount || 1;
        rows.push(r);
      }
    }
    const blob = makeXlsx(rows);
    await saveBlob(blob, filename);
    log(`💾 Đã tải Excel: ${esc(filename)} (${rows.length - 1} dòng)`);
    return blob;
  } catch (e) {
    log(`❌ Tạo Excel lỗi: ${esc(e.message)}`);
    return null;
  }
}

// ---------- BẢNG TỔNG KẾT NGÀY (17H & 8H HOẶC XEM BẤT CỨ LÚC NÀO) ----------
async function reportMenu(dateStr) {
  const today = todayStr();
  const targetDate = dateStr || today;

  const res = await chrome.runtime.sendMessage({ type: "tcdd-get-stats", date: targetDate });
  const stats = res?.stats || {
    date: targetDate,
    total_orders: 0,
    confirmed: [],
    printed: [],
    wameli: [],
    errors: [],
  };

  const total = stats.total_orders || stats.confirmed.length;
  const printedCount = stats.printed.reduce((n, p) => n + (p.sns?.length || 1), 0);
  const wameliBatches = stats.wameli.length;
  const errorCount = stats.errors.length;

  const dObj = new Date(targetDate);
  const prevDateObj = new Date(dObj.getTime() - 86400000);
  const prevDateStr = todayStr(prevDateObj);

  const [y, m, d] = targetDate.split("-");
  const displayDate = `${d}/${m}/${y}`;
  const isToday = targetDate === today;

  const mEl = document.createElement("div");
  mEl.className = "tc-modal";
  mEl.dataset.reportDate = targetDate;
  mEl.innerHTML = `<div>
    <h3>
      <span>📊 Báo cáo tổng kết ngày ${displayDate} ${isToday ? `<small style="color:#0f9d58;font-size:12px;font-weight:600">(Hôm nay)</small>` : ""}</span>
      <span style="font-size:12px;font-weight:400">
        <button class="tc-btn gray" id="tc-rep-prev" style="padding:4px 8px;font-size:11px">◀ Hôm qua (${prevDateObj.getDate()}/${prevDateObj.getMonth() + 1})</button>
        ${!isToday ? `<button class="tc-btn gray" id="tc-rep-today" style="padding:4px 8px;font-size:11px">Hôm nay ▶</button>` : ""}
      </span>
    </h3>

    <div class="tc-grid">
      <div class="tc-stat-card blue">
        <div class="val">${total}</div>
        <div class="lbl">📦 Tổng đơn tiếp nhận</div>
      </div>
      <div class="tc-stat-card green">
        <div class="val">${printedCount}</div>
        <div class="lbl">🖨 Đã in phiếu</div>
      </div>
      <div class="tc-stat-card orange">
        <div class="val">${wameliBatches}</div>
        <div class="lbl">☁️ Lô nạp Wameli</div>
      </div>
      <div class="tc-stat-card ${errorCount > 0 ? "red" : "gray"}">
        <div class="val">${errorCount}</div>
        <div class="lbl">❌ Đơn lỗi</div>
      </div>
    </div>

    <div style="margin:10px 0">
      <b>☁️ Lịch sử nạp Wameli</b>
      ${!stats.wameli.length ? `<p class="tc-muted" style="margin:4px 0">Chưa có lượt nạp Wameli nào trong ngày này.</p>` : `
        <table>
          <thead><tr><th>Giờ</th><th>File / Lô</th><th>Khung giờ</th><th>Kho</th><th>Số đơn</th></tr></thead>
          <tbody>
            ${stats.wameli.map((w) => `<tr>
              <td>${esc(w.time || "—")}</td>
              <td><b>${esc(w.base || "—")}</b></td>
              <td><span class="tc-tag blue">${esc(w.slot || "—")}</span></td>
              <td><span class="tc-kho ${w.warehouse === "HCM" ? "hcm" : ""}">${esc(w.warehouse || "HN")}</span></td>
              <td>${w.count || w.sns?.length || 0} đơn</td>
            </tr>`).join("")}
          </tbody>
        </table>
      `}
    </div>

    <div style="margin:10px 0">
      <b>❌ Đơn lỗi cần kiểm tra (${errorCount})</b>
      ${!errorCount ? `<div class="tc-note" style="background:#e8f5e9;border-color:#a5d6a7;color:#2e7d32">✅ Không có đơn nào bị lỗi trong ngày.</div>` : `
        <table>
          <thead><tr><th>Giờ</th><th>Mã đơn hàng</th><th>Khâu lỗi</th><th>Lý do</th></tr></thead>
          <tbody>
            ${stats.errors.map((e) => `<tr>
              <td>${esc(e.time || "—")}</td>
              <td>${e.order_sn ? `<a href="https://banhang.shopee.vn/portal/sale/order?keyword=${encodeURIComponent(e.order_sn)}" target="_blank" style="color:#ee4d2d;font-weight:700">${esc(e.order_sn)}</a>` : "Hệ thống"}</td>
              <td><span class="tc-tag err">${esc(e.stage || "Lỗi")}</span></td>
              <td style="color:#d32f2f">${esc(e.message || "—")}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      `}
    </div>

    ${stats.printed.length ? `
      <details style="margin:8px 0;font-size:12px">
        <summary style="cursor:pointer;color:#555"><b>Xem chi tiết các đợt đã in (${stats.printed.length} đợt)</b></summary>
        <table>
          <thead><tr><th>Giờ</th><th>Lô in</th><th>Danh sách đơn</th></tr></thead>
          <tbody>
            ${stats.printed.map((p) => `<tr>
              <td>${esc(p.time || "—")}</td>
              <td><b>${esc(p.base || "—")}</b></td>
              <td>${esc((p.sns || []).join(", "))}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </details>
    ` : ""}

    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;align-items:center">
      <button class="tc-btn green" id="tc-rep-copy">📋 Sao chép báo cáo (Zalo/Telegram)</button>
      <button class="tc-btn blue" id="tc-rep-send-tele">✈️ Bắn vào Telegram</button>
      <button class="tc-btn gray" id="tc-rep-test-ting" title="Thử chuông 'Ting'">🔊 Thử tiếng "Ting"</button>
      <button class="tc-btn gray" id="tc-rep-test-err" title="Thử chuông cảnh báo lỗi">🔊 Thử tiếng lỗi</button>
      <button class="tc-btn gray" id="tc-rep-close" style="margin-left:auto">Đóng</button>
    </div>
  </div>`;

  document.body.appendChild(mEl);

  mEl.querySelector("#tc-rep-prev").onclick = () => { mEl.remove(); reportMenu(prevDateStr); };
  if (!isToday) {
    mEl.querySelector("#tc-rep-today").onclick = () => { mEl.remove(); reportMenu(today); };
  }

  mEl.querySelector("#tc-rep-copy").onclick = () => {
    let text = `📊 BÁO CÁO VẬN HÀNH TOPCARE\n📅 Ngày: ${displayDate}\n------------------------------------\n`;
    text += `📦 Tổng đơn tiếp nhận: ${total} đơn\n`;
    text += `🖨 Đã in phiếu: ${printedCount} đơn\n`;
    text += `☁️ Lô nạp Wameli: ${wameliBatches} lượt\n`;
    for (const w of stats.wameli) {
      text += `   • ${w.time || ""}: Khung ${w.slot || ""} (${w.warehouse || "HN"}) - ${w.count || w.sns?.length || 0} đơn (${w.base || ""})\n`;
    }
    if (errorCount > 0) {
      text += `❌ Đơn lỗi: ${errorCount} đơn\n`;
      for (const e of stats.errors) {
        text += `   • ${e.order_sn}: [${e.stage}] ${e.message}\n`;
      }
    } else {
      text += `✅ Đơn lỗi: 0 đơn\n`;
    }
    text += `------------------------------------\n(Báo cáo lúc ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })})`;

    navigator.clipboard.writeText(text).then(() => {
      showToast("Đã sao chép báo cáo vào bộ nhớ tạm!");
    });
  };

  mEl.querySelector("#tc-rep-send-tele").onclick = async () => {
    const cfg = await chrome.storage.local.get(["tcdd-tele-on", "tcdd-tele-token", "tcdd-tele-chat"]);
    if (cfg["tcdd-tele-on"] !== "1" || !cfg["tcdd-tele-token"] || !cfg["tcdd-tele-chat"]) {
      alert("Chưa bật hoặc chưa cấu hình Telegram!\nVui lòng bấm nút '✈️ Telegram' trên thanh công cụ để nhập Token và Chat ID.");
      return;
    }
    showToast("Đang gửi báo cáo vào Telegram...");
    const res = await chrome.runtime.sendMessage({ type: "tcdd-send-tele-report", date: targetDate });
    if (res?.ok) {
      showToast("Đã gửi báo cáo vào nhóm Telegram thành công!");
    } else {
      alert("Gửi báo cáo thất bại: " + (res?.error || "Lỗi không xác định"));
    }
  };

  mEl.querySelector("#tc-rep-test-ting").onclick = () => {
    chrome.runtime.sendMessage({ type: "tcdd-test-sound", sound: "ting" });
  };
  mEl.querySelector("#tc-rep-test-err").onclick = () => {
    chrome.runtime.sendMessage({ type: "tcdd-test-sound", sound: "error" });
  };

  mEl.querySelector("#tc-rep-close").onclick = () => mEl.remove();
}

// ---------- CẤU HÌNH GỬI THÔNG BÁO TELEGRAM ----------
async function teleMenu() {
  const cfg = await chrome.storage.local.get([
    "tcdd-tele-on",
    "tcdd-tele-token",
    "tcdd-tele-chat",
    "tcdd-tele-order",
    "tcdd-tele-error",
    "tcdd-tele-report",
    "tcdd-tele-wameli",
  ]);

  const mEl = document.createElement("div");
  mEl.className = "tc-modal";
  mEl.innerHTML = `<div>
    <h3>
      <span>✈️ Cấu hình gửi thông báo vào Telegram</span>
    </h3>
    <div class="tc-note">
      <b>Cách thiết lập trong 1 phút:</b><br>
      1. Mở Telegram, tìm <b>@BotFather</b> gõ <code>/newbot</code> để tạo Bot và nhận <b>Bot Token</b>.<br>
      2. Thêm Bot vừa tạo vào Nhóm chat (hoặc chat trực tiếp 1-1 với Bot), gõ 1 tin bất kỳ.<br>
      3. Lấy <b>Chat ID</b>: Thêm bot <b>@userinfobot</b> hoặc <b>@getmyid_bot</b> vào nhóm để lấy ID (Nhóm có dạng <code>-100...</code>, cá nhân có dạng số dương).
    </div>

    <div style="margin:10px 0;display:flex;flex-direction:column;gap:8px">
      <label style="font-weight:700;display:flex;align-items:center;gap:6px">
        <input type="checkbox" id="tc-tel-on" ${cfg["tcdd-tele-on"] !== "0" ? "checked" : ""}> BẬT gửi thông báo vào Telegram
      </label>

      <div>
        <label style="font-size:12px;font-weight:600">Telegram Bot Token:</label>
        <input type="text" id="tc-tel-token" value="${esc(cfg["tcdd-tele-token"] || "7328548423:AAEaMToHm1IYWJ28_u8WrZ9fu8qO2QkbZ9Y")}" placeholder="Ví dụ: 789123456:ABCdefGhI_klmNOP..." style="width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;font-size:12px;margin-top:2px">
      </div>

      <div>
        <label style="font-size:12px;font-weight:600">Telegram Chat ID (ID Nhóm hoặc ID Cá nhân):</label>
        <input type="text" id="tc-tel-chat" value="${esc(cfg["tcdd-tele-chat"] || "-4209766497")}" placeholder="Ví dụ nhóm: -1001234567890 hoặc cá nhân: 123456789" style="width:100%;padding:6px;border:1px solid #ccc;border-radius:4px;font-size:12px;margin-top:2px">
      </div>

      <div style="background:#f9f9f9;border:1px solid #eee;border-radius:6px;padding:8px">
        <b style="font-size:12px">Chọn các thông báo muốn nhận:</b>
        <div style="display:flex;flex-direction:column;gap:5px;margin-top:6px;font-size:12px">
          <label><input type="checkbox" id="tc-tel-order" ${cfg["tcdd-tele-order"] !== "0" ? "checked" : ""}> 📦 Gửi khi có <b>Đơn hàng mới</b> (Mã đơn, người mua, sản phẩm, tổng tiền, ĐVVC)</label>
          <label><input type="checkbox" id="tc-tel-error" ${cfg["tcdd-tele-error"] !== "0" ? "checked" : ""}> 🚨 Gửi khi có <b>Đơn lỗi ❌</b> (Cảnh báo khẩn cấp để xử lý ngay trên điện thoại)</label>
          <label><input type="checkbox" id="tc-tel-report" ${cfg["tcdd-tele-report"] !== "0" ? "checked" : ""}> 📊 Tự động gửi <b>Báo cáo tổng kết lúc 17h & 8h sáng</b> vào nhóm</label>
          <label><input type="checkbox" id="tc-tel-wameli" ${cfg["tcdd-tele-wameli"] !== "0" ? "checked" : ""}> ☁️ Gửi khi <b>Nạp Wameli thành công</b> (Tên lô, khung giờ, số lượng)</label>
        </div>
      </div>
    </div>

    <div id="tc-tel-status" style="font-size:12px;margin:6px 0"></div>

    <div style="display:flex;gap:6px;align-items:center;margin-top:10px">
      <button class="tc-btn green" id="tc-tel-save">💾 Lưu cài đặt</button>
      <button class="tc-btn blue" id="tc-tel-test">📨 Gửi tin nhắn thử (Test)</button>
      <button class="tc-btn gray" id="tc-tel-close" style="margin-left:auto">Đóng</button>
    </div>
  </div>`;

  document.body.appendChild(mEl);

  const getVals = () => ({
    "tcdd-tele-on": mEl.querySelector("#tc-tel-on").checked ? "1" : "0",
    "tcdd-tele-token": mEl.querySelector("#tc-tel-token").value.trim(),
    "tcdd-tele-chat": mEl.querySelector("#tc-tel-chat").value.trim(),
    "tcdd-tele-order": mEl.querySelector("#tc-tel-order").checked ? "1" : "0",
    "tcdd-tele-error": mEl.querySelector("#tc-tel-error").checked ? "1" : "0",
    "tcdd-tele-report": mEl.querySelector("#tc-tel-report").checked ? "1" : "0",
    "tcdd-tele-wameli": mEl.querySelector("#tc-tel-wameli").checked ? "1" : "0",
  });

  mEl.querySelector("#tc-tel-save").onclick = async () => {
    const vals = getVals();
    await chrome.storage.local.set(vals);
    showToast("Đã lưu cấu hình Telegram!");
    mEl.querySelector("#tc-tel-status").innerHTML = `<span style="color:#0f9d58">✅ Đã lưu cấu hình thành công.</span>`;
  };

  mEl.querySelector("#tc-tel-test").onclick = async () => {
    const vals = getVals();
    await chrome.storage.local.set(vals);
    if (!vals["tcdd-tele-token"] || !vals["tcdd-tele-chat"]) {
      alert("Vui lòng nhập Bot Token và Chat ID trước khi bấm Gửi thử!");
      return;
    }
    const stat = mEl.querySelector("#tc-tel-status");
    stat.innerHTML = `<span style="color:#1a73e8">⏳ Đang gửi tin nhắn thử tới Telegram...</span>`;
    const res = await chrome.runtime.sendMessage({ type: "tcdd-test-tele" });
    if (res?.ok) {
      stat.innerHTML = `<span style="color:#0f9d58">✅ Gửi thử THÀNH CÔNG! Hãy kiểm tra tin nhắn trong Telegram của bạn.</span>`;
      showToast("Gửi tin nhắn Telegram thành công!");
    } else {
      stat.innerHTML = `<span style="color:#d32f2f">❌ Gửi thử thất bại: ${esc(res?.error || "Không thể kết nối Telegram")}</span>`;
    }
  };

  mEl.querySelector("#tc-tel-close").onclick = () => mEl.remove();
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "tc-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ---------- QUY TRÌNH ----------
function flowMenu() {
  const on = (k, d = "1") => ls.get(k, d) === "1";
  const ad = addrOf();
  const tag = (b) => `<b style="color:${b ? "#0f9d58" : "#999"}">${b ? "BẬT" : "TẮT"}</b>`;
  const step = (n, t, d) => `<tr><td style="font-weight:700;color:#ee4d2d;width:22px">${n}</td><td><b>${t}</b><br><span class="tc-muted">${d}</span></td></tr>`;
  const m = document.createElement("div");
  m.className = "tc-modal";
  m.innerHTML = `<div><h3>📋 Quy trình xử lý đơn hàng</h3>
    <div class="tc-note">🤖 Tự động chạy nền: ${tag(autoOn())} · Tự tải PDF + Excel: ${tag(on("tcdd-autopdf"))} · Tự nạp Wameli: ${tag(on("tcdd-wameli"))}<br>
    Đọc lại mỗi <b>${esc(ls.get("tcdd-every", "2"))} phút</b> · Địa chỉ lấy hàng: <b>${esc(ad ? `${ad.warehouse_name} – ${ad.address}` : "mặc định của shop")}</b></div>
    <table>
      ${step(1, "Đọc đơn Chưa xử lý", "Mỗi chu kỳ Tự đọc hoặc khi mở bảng/tải lại trang Shopee. Gắn kho cho từng đơn.")}
      ${step(2, "Xác nhận lấy hàng (Pickup)", "Ngày lấy sớm nhất Shopee cho phép, tại địa chỉ đang chọn (mặc định Kho Hà Nội – Phú Lương, áp cho cả đơn Kho HCM).")}
      ${step(3, "Chờ mã vận đơn", "Đợi tối đa ~30 giây tới khi Shopee cấp mã vận đơn.")}
      ${step(4, "Tạo phiếu & mở trang in", "Loại phiếu: <b>Phiếu gửi hàng và Phiếu đóng gói</b> (1 file PDF). Trang in mở ở tab mới.")}
      ${step(5, "Tải PDF + Excel", "Vào Tải xuống/TOPCARE-phieu-in/, tên <b>ddmm-gdd-HHMM-n</b>. Excel 28 cột chuẩn.")}
      ${step(6, "Nạp lên Wameli & Lưu", "Sàn Shopee · Shop Điện máy Topcare (GDD) · kèm PDF + Excel.")}
      ${step("⏰", "Chọn khung giờ Wameli", "Trước 8h25 → 8H · 8h25–9h45 → 11H · 9h45–13h30 → 13H · 13h30–15h45 → 14H · 15h45–17h00 → 16H.<br>Khung đó hôm nay đã <b>Đã in</b> → khung kế tiếp. 16H đã in hoặc sau 17h00 → <b>8H ngày hôm sau</b>.")}
      ${step("🔔", "Báo động & Thông báo góc màn hình", "Tiếng 'ting' khi đơn mới được xác nhận hoặc nạp Wameli xong. Tiếng chuông cảnh báo + thông báo đỏ khi có đơn hoặc thao tác bị lỗi ❌.")}
      ${step("✈️", "Bắn thông báo vào Telegram", "Tự động gửi thông tin đơn mới, cảnh báo lỗi khẩn cấp và bảng báo cáo 17h/8h trực tiếp vào nhóm chat hoặc cá nhân trên Telegram.")}
      ${step("📊", "Tổng kết cuối ngày (17h & 8h)", "Tự động hiện bảng tổng kết lúc 17h00 chiều và 8h00 sáng: tổng đơn, số đơn đã in, các khung nạp Wameli, danh sách đơn lỗi.")}
    </table>
    <div class="tc-note">⚡ <b>Chạy nền:</b> Chế độ Tự động chạy nền ngay cả khi bạn <b>ĐÓNG BẢNG</b> extension này (chỉ cần trình duyệt còn mở và Shopee, Wameli còn đăng nhập).</div>
    <div style="display:flex;gap:6px;align-items:center">
      <button class="tc-btn blue" id="tc-fl-tele">✈️ Cài đặt Telegram</button>
      <button class="tc-btn gray" id="tc-fl-ting">🔊 Thử tiếng "Ting"</button>
      <button class="tc-btn gray" id="tc-fl-err">🔊 Thử tiếng lỗi</button>
      <button class="tc-btn gray" id="tc-close" style="margin-left:auto">Đóng</button>
    </div></div>`;
  document.body.appendChild(m);
  m.querySelector("#tc-fl-tele").onclick = () => { m.remove(); teleMenu(); };
  m.querySelector("#tc-fl-ting").onclick = () => chrome.runtime.sendMessage({ type: "tcdd-test-sound", sound: "ting" });
  m.querySelector("#tc-fl-err").onclick = () => chrome.runtime.sendMessage({ type: "tcdd-test-sound", sound: "error" });
  m.querySelector("#tc-close").onclick = () => m.remove();
}

function pdfMenu() {
  const list = jobs();
  const m = document.createElement("div");
  m.className = "tc-modal";
  m.innerHTML = `<div><h3>Tải PDF phiếu đã in</h3>
    <label style="font-size:12px"><input type="checkbox" id="tc-autopdf" ${ls.get("tcdd-autopdf", "1") === "1" ? "checked" : ""}> Tự tải PDF + Excel ngay sau khi in</label><br>
    <label style="font-size:12px"><input type="checkbox" id="tc-wameli" ${ls.get("tcdd-wameli", "1") === "1" ? "checked" : ""}> Tự nạp PDF + Excel lên Wameli (shop Điện máy Topcare) và bấm Lưu</label>
    <table>${list.map((j, i) => `<tr><td>${new Date(j.at).toLocaleString("vi-VN")}</td><td>${esc((j.sns || []).join(", "))}</td><td style="white-space:nowrap"><button class="tc-btn blue" data-i="${i}">⬇ Tải</button> <button class="tc-btn green" data-w="${i}">☁️ Nạp Wameli</button></td></tr>`).join("")}</table>
    <div id="tc-pdflog" class="tc-muted" style="margin:6px 0"></div>
    <button class="tc-btn gray" id="tc-close">Đóng</button></div>`;
  document.body.appendChild(m);
  const log = (h) => (m.querySelector("#tc-pdflog").innerHTML += h + "<br>");
  m.querySelector("#tc-autopdf").onchange = (e) => ls.set("tcdd-autopdf", e.target.checked ? "1" : "0");
  m.querySelector("#tc-wameli").onchange = (e) => ls.set("tcdd-wameli", e.target.checked ? "1" : "0");
  m.querySelectorAll("button[data-i]").forEach((b) => (b.onclick = () => { const j = list[+b.dataset.i]; downloadJob(j, log); }));
  m.querySelectorAll("button[data-w]").forEach((b) => (b.onclick = () => {
    const j = list[+b.dataset.w];
    if (!confirm(`Nạp lên Wameli lần ${(j.sns || []).join(", ")}?\n(Tải lại PDF + Excel rồi nạp, kể cả khi đã nạp trước đó)`)) return;
    b.disabled = true;
    downloadJob(j, (h) => { log(h); autoLog(h); }, true, true);
  }));
  m.querySelector("#tc-close").onclick = () => m.remove();
}

async function arrange(sel, dayIdx, modal) {
  const out = modal.querySelector("#tc-result");
  modal.querySelectorAll("button").forEach((b) => (b.disabled = true));
  const log = (h) => { out.innerHTML += h + "<br>"; autoLog(h); };
  for (const g of groupsOf(sel)) {
    try { await shipAndPrint(g, dayIdx, log); } catch (e) {
      log(`❌ ${esc(g.wh.name)}: ${esc(e.message)}`);
      chrome.runtime.sendMessage({ type: "tcdd-record-error", order_sn: g.list.map((x) => x.order_sn).join(", "), stage: "Xác nhận lấy hàng", message: e.message });
    }
  }
  picked.clear();
  modal.querySelector("#tc-close").disabled = false;
  load();
}

// ---------- TỰ ĐỘNG ----------
let autoBusy = false;
const autoOn = () => ls.get("tcdd-auto", "0") === "1";
function autoLog(h) {
  const box = $("#tc-autolog");
  if (!box) return;
  box.hidden = false;
  box.innerHTML = `<div>${new Date().toLocaleTimeString("vi-VN")} ${h}</div>` + box.innerHTML.split("</div>").slice(0, 40).join("</div>");
}

async function autoRun() {
  if (!autoOn() || autoBusy) return;
  chrome.runtime.sendMessage({ type: "tcdd-run-now" }).catch(() => {});
}

function preview(sel) {
  const mode = document.querySelector("input[name=mode]:checked").value;
  const dayIdx = +$("#tc-day").value;
  const day = $("#tc-day").selectedOptions[0].textContent;
  const lines = sel.map((r) => {
    const wh = whs.find((w) => w.id === r.location_id);
    const ad = addrOf(wh);
    const bad = !wh ? "Chưa rõ kho – bỏ qua" : !ad ? "Kho chưa có địa chỉ – bỏ qua" : wh.holiday || ad.can_pickup_code < 0 ? "Kho đang nghỉ – bỏ qua" : "";
    return `<tr><td>${esc(r.order_sn)}<br><span class="tc-muted">${esc(r.carrier)}</span></td><td>${esc(wh?.name || "?")}</td><td>${esc(ad?.address || "—")}</td><td>${bad ? `<b style="color:#ee4d2d">${bad}</b>` : "OK"}</td></tr>`;
  }).join("");
  const m = document.createElement("div");
  m.className = "tc-modal";
  m.innerHTML = `<div><h3>Tóm tắt xác nhận lấy hàng</h3>
    <div>Hình thức: <b>${mode === "pickup" ? "Đơn vị vận chuyển tới lấy" : "Tự mang ra bưu cục"}</b>${mode === "pickup" ? ` · Ngày: <b>${esc(day)}</b>` : ""}</div>
    <table><tr><th>Đơn</th><th>Kho</th><th>Địa chỉ lấy hàng</th><th>Kiểm tra</th></tr>${lines}</table>
    <div class="tc-note">⚠ Bấm "Gửi yêu cầu lấy hàng" là Shopee xác nhận đơn và gọi ĐVVC tới lấy. Không hoàn tác được.</div>
    <div id="tc-result" style="margin:6px 0"></div>
    <button class="tc-btn green" id="tc-go" ${groupsOf(sel).length ? "" : "disabled"}>Gửi yêu cầu lấy hàng</button>
    <button class="tc-btn gray" id="tc-close">Đóng</button></div>`;
  document.body.appendChild(m);
  m.querySelector("#tc-close").onclick = () => m.remove();
  m.querySelector("#tc-go").onclick = () => arrange(sel, dayIdx, m);
}

async function countAll() {
  for (const [k, v] of Object.entries(VIEWS)) {
    try { counts[k] = (await fetchIndex(v)).total; } catch { counts[k] = "?"; }
  }
  pills();
}
function pills() {
  document.querySelectorAll(".tc-pill").forEach((b) => { b.classList.toggle("on", b.dataset.k === cur); b.querySelector(".n").textContent = counts[b.dataset.k] ?? "–"; });
}

let seq = 0, fails = 0;
async function load() {
  const my = ++seq;
  const v = VIEWS[cur];
  pills();
  $("#tc-sum").textContent = "Đang đọc…";
  try {
    const idx = await fetchIndex(v);
    if (idx.list[0]) shop = { shop_id: idx.list[0].shop_id, region_id: idx.list[0].region_id };
    const fresh = (await fetchCards(v, idx.list)).map(toRow);
    if (my !== seq) return;
    rows = fresh;
    counts[cur] = idx.total;
    if (cur === "cho-xu-ly") { await loadWarehouses(); await tagLocations(); slots = []; }
    if (my !== seq) return;
    for (const pk of [...picked]) if (!rows.some((r) => r.package_number === pk)) picked.delete(pk);
    render();
    rows.forEach((r) => seen.add(r.order_sn));
    ls.set("tcdd-seen", JSON.stringify([...seen].slice(-2000)));
    $("#tc-sum").textContent = `${v.label}: ${rows.length} đơn · đọc lúc ${new Date().toLocaleTimeString("vi-VN")}`;
    fails = 0;
    countAll();
    schedule();
  } catch (e) {
    if (my !== seq) return;
    fails++;
    rows = []; picked.clear();
    $("#tc-body").innerHTML = "";
    $("#tc-ship").hidden = true;
    $("#tc-sum").textContent = `Lỗi: ${e.message} · tự thử lại…`;
    schedule(Math.min(fails, 6) * 10000);
  }
}

function schedule(ms) {
  clearInterval(timer);
  nextAt = Date.now() + (ms || +ls.get("tcdd-every", "2") * 60000);
  timer = setInterval(() => {
    const left = Math.max(0, Math.round((nextAt - Date.now()) / 1000));
    $("#tc-next").textContent = `đọc lại sau ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
    if (left === 0) { clearInterval(timer); load(); }
  }, 1000);
}

document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
chrome.tabs?.onUpdated?.addListener((_id, info, tab) => {
  if (info.status === "complete" && tab.url?.startsWith("https://banhang.shopee.vn/")) setTimeout(load, 2000);
});

mount();
load();
