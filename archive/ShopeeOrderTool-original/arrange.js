// "Chuẩn bị hàng" – yêu cầu đơn vị vận chuyển tới lấy hàng (lấy hàng tận nơi) cho các đơn đã chọn.
import { shipment, getShopInfo, sleep } from './shopee-api.js';

const ADDR_KEY = 'arrangePickupAddress'; // { [shopId]: { list: [{ name, id }], last } }

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
    </div>
    <div class="toolbar">
      <label>Thêm địa chỉ: tên <input id="arrAddrName" placeholder="vd: Kho HN" style="width:120px"></label>
      <label>mã (address_id) <input id="arrAddrId" type="number" placeholder="vd: 200051580" style="width:130px"></label>
      <button id="arrAddrAdd" class="btn small">+ Thêm</button>
    </div>
    <div class="hint">Mã địa chỉ (address_id) lấy ở request <b>get_pickup_time_slots</b> khi chọn địa chỉ đó trên Kênh Người Bán. Mỗi shop lưu được nhiều địa chỉ (Kho HN, Kho HCM...).</div>
    <div id="arrSlots" class="toolbar"></div>
    <div class="toolbar">
      <label><input type="checkbox" id="arrThenShip" checked> Xong thì mở "In phiếu + Wameli" cho các đơn này</label>
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
    if (ctx.onDone) await ctx.onDone(okOrders, $('#arrThenShip').checked);
  } catch (e) {
    log('error', '✖ ' + e.message);
    if (e.response) console.warn('Phản hồi Shopee:', e.response);
  } finally {
    ctx.busy = false;
    $('#arrConfirm').disabled = false;
  }
}

/**
 * orders: các đơn đã chọn. onDone(okOrders, thenShip): gọi khi xong (để tải lại đơn / mở In phiếu + Wameli).
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
  // Đổi địa chỉ thì phải lấy lại ngày lấy hàng
  $('#arrAddrSel').onchange = () => { $('#arrSlots').innerHTML = ''; $('#arrConfirm').disabled = true; if ($('#arrAddrSel').value) loadSlots(); };
  $('#arrConfirm').onclick = confirmArrange;
  m.classList.remove('hidden');

  try {
    const shop = await getShopInfo();
    ctx.shopId = shop.shopId;
    const entry = await renderAddresses();
    if ($('#arrAddrSel').value && usable.length) loadSlots();
    else if (!entry.list.length) log('info', 'Chưa có địa chỉ lấy hàng cho shop này – thêm tên + mã địa chỉ ở trên.');
  } catch (e) {
    log('error', 'Không đọc được shop: ' + e.message);
  }
}
