// "Chuẩn bị hàng" – yêu cầu đơn vị vận chuyển tới lấy hàng (lấy hàng tận nơi) cho các đơn đã chọn.
import { shipment, orders as orderApi, getShopInfo, sleep } from './shopee-api.js';

const ADDR_KEY = 'arrangePickupAddress'; // { [shopId]: { list: [{ name, id }], last } }
const CAPTURED_KEY = 'capturedPickupAddresses'; // { [id]: { id, name, at } } – extension chính ghi lại từ trang Shopee

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDay = (sec) => new Date(sec * 1000).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
const fmtTime = (sec) => new Date(sec * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

let ctx = { orders: [], shopId: null, busy: false, onDone: null };

function ensureModal() {
  let m = $('#arrModal');
  if (m) return m;
  m = document.createElement('div');
  m.id = 'arrModal';
  m.className = 'modal hidden';
  m.innerHTML = `<div class="modal-box">
    <div class="card-head"><h3>🚚 Chuẩn bị hàng – Lấy hàng tận nơi</h3><button class="btn small" data-close>✕ Đóng</button></div>
    <div id="arrSummary" class="hint"></div>
    <div class="toolbar" style="margin-top:10px">
      <label>Địa chỉ lấy hàng <select id="arrAddrSel" style="min-width:200px"></select></label>
      <button id="arrAddrDel" class="btn small danger" title="Xoá địa chỉ đang chọn">Xoá</button>
      <button id="arrLoadSlots" class="btn">Lấy ngày lấy hàng</button>
      <button id="arrAutoFind" class="btn small" title="Tự tìm mã địa chỉ lấy hàng từ dữ liệu đơn và từ trang Shopee">🔍 Tự tìm địa chỉ</button>
    </div>
    <div class="hint">Cách dùng: <b>1.</b> chọn địa chỉ lấy hàng (tool tự tìm) → <b>2.</b> chọn ngày lấy hàng → <b>3.</b> bấm <b>Xác nhận chuẩn bị hàng</b>.
      Nếu không tự tìm được địa chỉ: mở <b>Kênh Người Bán</b>, bấm <b>Chuẩn bị hàng</b> cho 1 đơn bất kỳ tới bước chọn ngày lấy hàng (hoặc chạy bước 1 của <b>In Tự Động</b>),
      extension sẽ ghi nhớ địa chỉ — quay lại đây bấm <b>🔍 Tự tìm địa chỉ</b>.</div>
    <details style="margin-top:6px">
      <summary class="muted small" style="cursor:pointer">Thêm địa chỉ thủ công (nâng cao)</summary>
      <div class="toolbar" style="margin-top:6px">
        <label>Tên <input id="arrAddrName" placeholder="vd: Kho HN" style="width:120px"></label>
        <label>mã (address_id) <input id="arrAddrId" type="number" placeholder="vd: 200051580" style="width:130px"></label>
        <button id="arrAddrAdd" class="btn small">+ Thêm</button>
      </div>
      <div class="hint">Mã address_id nằm trong request <b>get_pickup_time_slots</b> (F12 → Network) khi chọn địa chỉ trên Kênh Người Bán.</div>
    </details>
    <div id="arrSlots" class="toolbar"></div>
    <div class="toolbar">
      <button id="arrConfirm" class="btn primary" disabled>✔ Xác nhận chuẩn bị hàng</button>
    </div>
    <div id="arrLog" class="log-box"></div>
  </div>`;
  document.body.appendChild(m);
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('[data-close]')) m.classList.add('hidden');
  });
  return m;
}

async function readAddresses() {
  const { [ADDR_KEY]: all } = await chrome.storage.local.get(ADDR_KEY);
  let entry = all && all[ctx.shopId];
  // Dữ liệu cũ chỉ lưu 1 mã địa chỉ
  if (entry && typeof entry !== 'object') entry = { list: [{ name: 'Địa chỉ ' + entry, id: String(entry) }], last: String(entry) };
  return { all: all || {}, entry: entry || { list: [], last: '' } };
}

async function writeAddresses(entry) {
  const { all } = await readAddresses();
  await chrome.storage.local.set({ [ADDR_KEY]: { ...all, [ctx.shopId]: entry } });
}

async function renderAddresses(selectId) {
  const { entry } = await readAddresses();
  const sel = $('#arrAddrSel');
  sel.innerHTML = entry.list.length
    ? entry.list.map((a) => `<option value="${esc(a.id)}">${esc(a.name)} (${esc(a.id)})</option>`).join('')
    : '<option value="">-- Chưa có địa chỉ, thêm ở dưới --</option>';
  const want = selectId || entry.last;
  if (want && entry.list.some((a) => a.id === want)) sel.value = want;
  return entry;
}

async function addAddress() {
  const name = $('#arrAddrName').value.trim();
  const id = $('#arrAddrId').value.trim();
  if (!name || !/^\d+$/.test(id)) return log('error', 'Nhập tên và mã địa chỉ (số) để thêm');
  const { entry } = await readAddresses();
  const list = entry.list.filter((a) => a.id !== id).concat({ name, id });
  await writeAddresses({ list, last: id });
  $('#arrAddrName').value = '';
  $('#arrAddrId').value = '';
  await renderAddresses(id);
  $('#arrSlots').innerHTML = '';
  $('#arrConfirm').disabled = true;
  log('success', `Đã lưu địa chỉ "${name}"`);
}

async function deleteAddress() {
  const id = $('#arrAddrSel').value;
  if (!id || !confirm('Xoá địa chỉ này khỏi danh sách đã lưu?')) return;
  const { entry } = await readAddresses();
  await writeAddresses({ list: entry.list.filter((a) => a.id !== id), last: entry.last === id ? '' : entry.last });
  await renderAddresses();
  $('#arrSlots').innerHTML = '';
  $('#arrConfirm').disabled = true;
}

// Tìm mã địa chỉ lấy hàng (address_id) của shop trong dữ liệu đơn: bỏ qua địa chỉ người mua
function scanAddressIds(data, out) {
  (function walk(o, path, depth) {
    if (!o || typeof o !== 'object' || depth > 10) return;
    if (Array.isArray(o)) { o.forEach((x, i) => walk(x, path, depth + 1)); return; }
    for (const [k, v] of Object.entries(o)) {
      const full = path + '.' + k;
      if (/address_id$/i.test(k) && Number(v) > 0 && !/buyer|recipient|receiver|shipping_address|delivery|consignee/i.test(full)) {
        const label = [o.name, o.address_name, o.full_address, o.address, o.district, o.city]
          .filter((x) => typeof x === 'string' && x.trim()).join(', ');
        const id = String(Number(v));
        if (!out.has(id) || (label && !out.get(id))) out.set(id, label.slice(0, 120));
      }
      if (v && typeof v === 'object') walk(v, full, depth + 1);
    }
  })(data, '', 0);
}

// Gom ứng viên (ghi nhớ từ trang Shopee + dò trong đơn), thử từng mã với Shopee,
// mã nào trả được ngày lấy hàng thì lưu vào danh sách địa chỉ của shop.
async function autoFindAddresses({ quiet = false } = {}) {
  const btn = $('#arrAutoFind');
  if (btn) btn.disabled = true;
  try {
    const { entry } = await readAddresses();
    const known = new Set(entry.list.map((a) => a.id));
    const candidates = new Map(); // id -> label

    const { [CAPTURED_KEY]: captured } = await chrome.storage.local.get(CAPTURED_KEY);
    for (const a of Object.values(captured || {})) candidates.set(String(a.id), a.name || '');

    // Đơn chưa có chi tiết: tải chi tiết vài đơn đầu để dò địa chỉ lấy hàng
    // (để riêng, không gán vào đơn để bảng đơn vẫn tự đọc lại chi tiết đầy đủ khi cần)
    const fetched = new Map();
    for (const o of ctx.orders.slice(0, 3)) {
      if (!o.detail && o.orderId) {
        try { fetched.set(o, await orderApi.getOne(o.orderId)); } catch (e) { /* bỏ qua */ }
      }
    }
    for (const o of ctx.orders) {
      scanAddressIds(o.raw, candidates);
      const detail = o.detail || fetched.get(o);
      if (detail) scanAddressIds(detail, candidates);
    }

    // Địa chỉ đã lưu với tên tạm "Địa chỉ <mã>": cập nhật tên thật nếu đã bắt được
    const renamed = entry.list.map((a) => (a.name === `Địa chỉ ${a.id}` && candidates.get(a.id) ? { ...a, name: candidates.get(a.id) } : a));
    if (renamed.some((a, i) => a !== entry.list[i])) {
      entry.list = renamed;
      await writeAddresses(entry);
      await renderAddresses($('#arrAddrSel').value);
    }

    const toTry = [...candidates.keys()].filter((id) => !known.has(id)).slice(0, 8);
    if (!toTry.length) {
      if (!quiet || !entry.list.length) {
        log(entry.list.length ? 'info' : 'error', entry.list.length
          ? 'Không tìm thấy địa chỉ mới.'
          : 'Chưa tìm thấy mã địa chỉ lấy hàng. Hãy bấm "Chuẩn bị hàng" cho 1 đơn trên Kênh Người Bán tới bước chọn ngày (hoặc chạy bước 1 In Tự Động), rồi bấm 🔍 Tự tìm địa chỉ.');
      }
      return entry;
    }

    const pkgs = [...packagesByChannel(ctx.orders).values()].flat().map((x) => x.packageNumber);
    log('info', `Đang thử ${toTry.length} mã địa chỉ tìm được...`);
    const found = [];
    for (const id of toTry) {
      try {
        const res = await shipment.pickupTimeSlots(id, pkgs);
        if (res.slots.length) {
          found.push({ name: candidates.get(id) || `Địa chỉ ${id}`, id });
          log('success', `✔ Mã ${id}${candidates.get(id) ? ' – ' + candidates.get(id) : ''}: dùng được`);
        }
      } catch (e) { /* mã không hợp lệ cho shop này */ }
      await sleep(300);
    }
    if (!found.length) {
      log('error', 'Các mã tìm được đều không lấy được ngày lấy hàng cho đơn đã chọn.');
      return entry;
    }
    const list = entry.list.concat(found.filter((a) => !known.has(a.id)));
    const next = { list, last: entry.last || found[0].id };
    await writeAddresses(next);
    await renderAddresses(next.last);
    return next;
  } finally {
    if (btn) btn.disabled = false;
  }
}

function log(level, msg) {
  const box = $('#arrLog');
  const line = document.createElement('div');
  line.className = 'log-line ' + level;
  line.innerHTML = `<span class="t">${new Date().toLocaleTimeString('vi-VN')}</span>${esc(msg)}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

// Các kiện của đơn đã chọn, nhóm theo kênh vận chuyển
function packagesByChannel(orders) {
  const groups = new Map();
  for (const o of orders) {
    for (const p of o.packages || []) {
      if (!p.channelId) continue;
      if (!groups.has(p.channelId)) groups.set(p.channelId, []);
      groups.get(p.channelId).push({ packageNumber: p.packageNumber, orderId: o.orderId, orderSn: o.orderSn });
    }
  }
  return groups;
}

function renderSlots(res) {
  const box = $('#arrSlots');
  if (!res.slots.length) {
    box.innerHTML = '<span class="err">Shopee không trả ngày lấy hàng cho các đơn này.</span>';
    $('#arrConfirm').disabled = true;
    return;
  }
  // Mỗi ngày có thể có thêm khung giờ (slots); nếu không có thì chọn theo ngày
  const options = [];
  res.slots.forEach((d, di) => {
    if (Array.isArray(d.slots) && d.slots.length) {
      d.slots.forEach((s, si) => options.push({ value: s.value ?? s.pickup_time ?? d.value, label: `${fmtDay(d.value)} – ${s.date || s.time_text || fmtTime(s.value ?? d.value)}`, pre: di === res.preDate && si === res.preSlot }));
    } else {
      options.push({ value: d.value, label: fmtDay(d.value), pre: di === res.preDate });
    }
  });
  box.innerHTML = 'Ngày lấy hàng: ' + options.map((o) => `<label><input type="radio" name="arrTime" value="${esc(o.value)}" ${o.pre ? 'checked' : ''}> ${esc(o.label)}</label>`).join(' ');
  if (!box.querySelector('input:checked')) box.querySelector('input').checked = true;
  $('#arrConfirm').disabled = false;
}

async function loadSlots() {
  const addr = $('#arrAddrSel').value;
  if (!addr) return log('error', 'Chọn (hoặc thêm) địa chỉ lấy hàng');
  const btn = $('#arrLoadSlots');
  btn.disabled = true;
  try {
    const pkgs = [...packagesByChannel(ctx.orders).values()].flat().map((p) => p.packageNumber);
    const res = await shipment.pickupTimeSlots(addr, pkgs);
    renderSlots(res);
    const { entry } = await readAddresses();
    await writeAddresses({ ...entry, last: addr });
  } catch (e) {
    log('error', 'Không lấy được ngày lấy hàng: ' + e.message);
  } finally {
    btn.disabled = false;
  }
}

// Chờ Shopee xử lý xong các kiện (theo polling_mode Shopee trả về, tối đa ~30 giây)
async function waitDone(channelId, packages) {
  let interval = 500;
  let step = 500;
  const deadline = Date.now() + 30000;
  let last = null;
  while (Date.now() < deadline) {
    await sleep(interval);
    last = await shipment.packageStatus({ shopId: ctx.shopId, channelId, packages });
    if (last.polling) {
      step = last.polling.increase_interval_time || step;
    }
    const pending = last.list.filter((x) => !x.message && !x.third_party_tn && !x.can_print_waybill && !x.can_print_normal_waybill);
    if (!pending.length || (last.total && last.success >= last.total)) break;
    interval = Math.min(interval + step, 5000);
  }
  const printable = await shipment.canPrint({ shopId: ctx.shopId, packages });
  return { status: last, printable };
}

async function confirmArrange() {
  if (ctx.busy) return;
  const addr = $('#arrAddrSel').value;
  const addrName = ($('#arrAddrSel').selectedOptions[0] || {}).textContent || addr;
  const time = ($('#arrSlots input:checked') || {}).value;
  if (!addr || !time) return log('error', 'Chọn địa chỉ và ngày lấy hàng');
  const groups = packagesByChannel(ctx.orders);
  const count = [...groups.values()].reduce((s, g) => s + g.length, 0);
  if (!count) return log('error', 'Không có kiện nào để chuẩn bị hàng');
  const label = ($('#arrSlots input:checked').parentElement.textContent || '').trim();
  if (!confirm(`Chuẩn bị hàng cho ${count} kiện (${ctx.orders.length} đơn)?\n\nHình thức: Lấy hàng tận nơi\nĐịa chỉ lấy hàng: ${addrName}\nNgày lấy hàng: ${label}\n\nSau khi xác nhận, đơn vị vận chuyển sẽ đến lấy hàng – không hoàn tác được.`)) return;

  ctx.busy = true;
  $('#arrConfirm').disabled = true;
  const okOrderIds = new Set();
  try {
    for (const [channelId, packages] of groups) {
      log('info', `Kênh ${channelId}: gửi yêu cầu lấy hàng cho ${packages.length} kiện...`);
      const res = await shipment.initOrders({ shopId: ctx.shopId, channelId, packages, addressId: addr, pickupTime: time });
      const okPkgs = [];
      for (const r of res.results) {
        const p = packages.find((x) => x.packageNumber === r.packageNumber);
        if (r.ok) {
          okPkgs.push(p);
          log('success', `✔ ${p ? p.orderSn : r.packageNumber}: đã gửi yêu cầu`);
        } else {
          log('error', `✖ ${p ? p.orderSn : r.packageNumber}: ${r.message}`);
        }
      }
      if (!okPkgs.length) continue;
      log('info', `Đang chờ Shopee xử lý (nhóm ${res.groupId})...`);
      const done = await waitDone(channelId, okPkgs);
      for (const p of okPkgs) {
        const pr = done.printable.find((x) => x.packageNumber === p.packageNumber);
        const st = done.status && done.status.list.find((x) => x.primary_package_number === p.packageNumber);
        if (pr && pr.canPrint) {
          okOrderIds.add(String(p.orderId));
          log('success', `✔ ${p.orderSn}: đã chuẩn bị hàng, in được phiếu giao${st && st.third_party_tn ? ' – MVĐ ' + st.third_party_tn : ''}`);
        } else {
          log('error', `… ${p.orderSn}: Shopee chưa xử lý xong${st && st.message ? ' – ' + st.message : ''}. Đợi một lát rồi thử in phiếu.`);
        }
      }
    }
    const okOrders = ctx.orders.filter((o) => okOrderIds.has(String(o.orderId)));
    if (ctx.onDone) {
      log('info', 'Đang load lại các đơn để cập nhật trạng thái & mã vận đơn...');
      await ctx.onDone(okOrders);
      log('success', '✔ Đã load lại các đơn.');
    }
  } catch (e) {
    log('error', '✖ ' + e.message);
    if (e.response) console.warn('Phản hồi Shopee:', e.response);
  } finally {
    ctx.busy = false;
    $('#arrConfirm').disabled = false;
  }
}

/**
 * orders: các đơn đã chọn. onDone(okOrders): gọi khi xong (để load lại các đơn).
 */
export async function openArrangeDialog(orders, { onDone }) {
  const m = ensureModal();
  $('#arrLog').innerHTML = '';
  $('#arrSlots').innerHTML = '';
  $('#arrConfirm').disabled = true;
  const usable = orders.filter((o) => (o.packages || []).some((p) => p.channelId));
  const skipped = orders.length - usable.length;
  ctx = { orders: usable, shopId: null, busy: false, onDone };
  $('#arrSummary').innerHTML = `Đã chọn <b>${orders.length}</b> đơn · chuẩn bị được <b>${usable.length}</b> đơn.
    ${skipped ? `<div class="err">${skipped} đơn thiếu mã kiện / kênh vận chuyển – bỏ qua.</div>` : ''}
    <div class="hint">Chỉ chọn đơn ở trạng thái <b>Chờ lấy hàng</b> chưa chuẩn bị.</div>`;
  $('#arrLoadSlots').onclick = loadSlots;
  $('#arrAddrAdd').onclick = addAddress;
  $('#arrAddrDel').onclick = deleteAddress;
  $('#arrAutoFind').onclick = async () => {
    const entry = await autoFindAddresses();
    if (entry.list.length && $('#arrAddrSel').value) loadSlots();
  };
  // Đổi địa chỉ thì phải lấy lại ngày lấy hàng
  $('#arrAddrSel').onchange = () => { $('#arrSlots').innerHTML = ''; $('#arrConfirm').disabled = true; if ($('#arrAddrSel').value) loadSlots(); };
  $('#arrConfirm').onclick = confirmArrange;
  m.classList.remove('hidden');

  try {
    const shop = await getShopInfo();
    ctx.shopId = shop.shopId;
    let entry = await renderAddresses();
    // Chưa lưu địa chỉ nào: tự tìm luôn (ghi nhớ từ trang Shopee + dò trong dữ liệu đơn)
    if (!entry.list.length && usable.length) entry = await autoFindAddresses({ quiet: true });
    if ($('#arrAddrSel').value && usable.length) loadSlots();
  } catch (e) {
    log('error', 'Không đọc được shop: ' + e.message);
  }
}
