// In phiếu giao Shopee (PDF) + tạo file Excel đơn đúng mẫu, rồi tải lên Wameli (Đơn hàng → Thêm mới).
import { shippingDoc, getShopInfo, sleep } from './shopee-api.js';
import { wameli, toWameliDate } from './wameli-api.js';
import { buildXlsx, blobToBase64 } from './xlsx-write.js';

const PREF_KEY = 'shipWameliPrefs';
const SEQ_KEY = 'shipWameliSeq';
const FORM_KEY = 'wameliUploadForm';

// Mẫu cột file Excel đơn (giống file xuất đơn của Shopee)
export const EXCEL_HEAD = ['Mã đơn hàng', 'Mã Kiện Hàng', 'Ngày đặt hàng', 'Trạng Thái Đơn Hàng', 'Nhận xét từ Người mua',
  'Mã vận đơn', 'Đơn Vị Vận Chuyển', 'Phương thức giao hàng', 'Loại đơn hàng', 'Ngày giao hàng dự kiến', 'Ngày gửi hàng',
  'Thời gian giao hàng', 'Trạng thái Trả hàng/Hoàn tiền', 'SKU sản phẩm', 'Tên sản phẩm', 'Cân nặng sản phẩm', 'Tổng cân nặng',
  'Tên kho hàng', 'SKU phân loại hàng', 'Tên phân loại hàng', 'Giá gốc', 'Người bán trợ giá', 'Được Shopee trợ giá',
  'Tổng số tiền được người bán trợ giá', 'Giá gốc (Y)', 'Số lượng', 'Số lượng sản phẩm được hoàn trả',
  'Tổng số tiền Người mua thanh toán'];
const COL = { order: 0, tracking: 5, carrier: 6, sku: 18, priceY: 24, qty: 25 };

const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = (n) => String(n).padStart(2, '0');

// "Nhanh" + "SPX Express" -> "Nhanh-SPX Express"
const carrierName = (o) => [o.shippingType, o.shipping].filter(Boolean).join('-');

// Giá trị cột "Giá gốc (Y)" theo lựa chọn (mẫu của bạn: 18876400)
function priceY(item, mode, fixed) {
  if (mode === 'fixed') return Number(fixed) || 0;
  const unit = Number(item.originalPrice || item.price || 0);
  if (mode === 'total100') return Math.round(unit * Number(item.qty || 1) * 100);
  if (mode === 'unit') return unit;
  return Math.round(unit * 100); // unit100
}

export function excelRows(orders, yMode, yFixed = 1000000000) {
  const rows = [EXCEL_HEAD];
  for (const o of orders) {
    for (const it of o.items.length ? o.items : [{}]) {
      const r = new Array(EXCEL_HEAD.length).fill('');
      r[COL.order] = o.orderSn;
      r[COL.tracking] = o.tracking;
      r[COL.carrier] = carrierName(o);
      r[COL.sku] = it.modelSku || it.itemSku || '';
      r[COL.priceY] = yMode === 'fixed' || it.price || it.originalPrice ? priceY(it, yMode, yFixed) : '';
      r[COL.qty] = Number(it.qty) || '';
      rows.push(r);
    }
  }
  return rows;
}

// Đoán mã shop từ SKU: "X009-OR-00-BCE-00-001-..." -> "bce"
function guessShopCode(orders) {
  for (const o of orders) {
    for (const it of o.items) {
      const m = String(it.modelSku || it.itemSku || '').match(/^[A-Z0-9]+-[A-Z0-9]+-[0-9]+-([A-Z]{2,5})(-|$)/i);
      if (m) return m[1].toLowerCase();
    }
  }
  return '';
}

async function nextSeq(dayKey) {
  const { [SEQ_KEY]: s } = await chrome.storage.local.get(SEQ_KEY);
  const cur = s && s.day === dayKey ? s.n : 0;
  return cur + 1;
}
async function saveSeq(dayKey, n) {
  await chrome.storage.local.set({ [SEQ_KEY]: { day: dayKey, n } });
}

// Tên file tải về: tên gốc + (mã đơn hàng) + (mã vận đơn) của các đơn.
// Nhiều đơn thì nối bằng "_"; quá dài thì chỉ lấy 3 đơn đầu + "va-N-don".
const safeName = (t) => String(t || '').replace(/[\\/:*?"<>|,\s]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
function fileBaseFor(base, orders) {
  const withSn = $('#shipNameSn') && $('#shipNameSn').checked;
  const withTn = $('#shipNameTn') && $('#shipNameTn').checked;
  if (!withSn && !withTn) return base;
  const parts = orders.map((o) => [withSn ? o.orderSn : '', withTn ? o.tracking : ''].map(safeName).filter(Boolean).join('-')).filter(Boolean);
  if (!parts.length) return base;
  let extra = parts.join('_');
  if (extra.length > 150) extra = parts.slice(0, 3).join('_') + `_va-${parts.length - 3}-don`;
  return `${base}-${extra}`;
}

function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 8000);
}
function b64ToBlob(b64, type) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

// Ghép nhiều PDF (base64) thành 1 file bằng pdf-lib (vendor/pdf-lib.min.js, biến toàn cục PDFLib)
async function mergePdfs(list) {
  if (!globalThis.PDFLib) throw new Error('Chưa nạp được thư viện ghép PDF');
  const { PDFDocument } = globalThis.PDFLib;
  const out = await PDFDocument.create();
  for (const b64 of list) {
    const src = await PDFDocument.load(b64ToBlobBytes(b64), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const bytes = await out.save();
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return { base64: btoa(bin), pages: out.getPageCount() };
}
function b64ToBlobBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// ---------- Hộp thoại ----------
function ensureModal() {
  let m = $('#shipModal');
  if (m) return m;
  m = document.createElement('div');
  m.id = 'shipModal';
  m.className = 'modal hidden';
  m.innerHTML = `<div class="modal-box">
    <div class="card-head"><h3>📦 In phiếu giao + tải lên Wameli</h3><button class="btn small" data-close>✕ Đóng</button></div>
    <div id="shipSummary" class="hint"></div>
    <div class="section-title">File</div>
    <div class="toolbar">
      <label>Mã shop <input id="shipCode" style="width:80px" placeholder="vd: bce"></label>
      <label>Tên file <input id="shipBase" style="width:200px"></label>
      <label>Cột "Giá gốc (Y)"
        <select id="shipY">
          <option value="fixed">Giá trị cố định</option>
          <option value="unit100">Đơn giá × 100</option>
          <option value="total100">Thành tiền × 100</option>
          <option value="unit">Đơn giá</option>
        </select>
      </label>
      <input id="shipYFixed" type="number" value="1000000000" style="width:130px" title="Giá trị cột Giá gốc (Y)">
      <label><input type="checkbox" id="shipMerge" checked> Ghép các phiếu giao thành 1 file PDF</label>
    </div>
    <div class="toolbar">
      <span class="muted small">Thêm vào tên file tải về:</span>
      <label><input type="checkbox" id="shipNameSn"> Mã đơn hàng</label>
      <label><input type="checkbox" id="shipNameTn"> Mã vận đơn</label>
      <span id="shipNamePreview" class="muted small"></span>
    </div>
    <div class="section-title">Wameli</div>
    <div class="toolbar">
      <label>Sàn <select id="shipPlatform"></select></label>
      <label>Kho <select id="shipWarehouse"></select></label>
      <label>Shop <select id="shipShop" style="max-width:240px"></select></label>
      <label>Ngày <input id="shipDate" type="date"></label>
      <label>Giờ <select id="shipHour"></select></label>
      <button id="shipLoadForm" class="btn small">Tải danh sách từ Wameli</button>
    </div>
    <div class="toolbar">
      <button id="shipXlsx" class="btn" title="Chỉ tạo file Excel trong máy, không gửi gì lên Shopee">⬇ Tải Excel</button>
      <button id="shipPdf" class="btn" title="Tạo phiếu giao trên Shopee rồi tải PDF về máy">⬇ Tải PDF</button>
      <button id="shipBoth" class="btn" title="Tải cả PDF phiếu giao và file Excel về máy">⬇ Tải cả 2</button>
      <button id="shipUpload" class="btn primary">📦 In phiếu + tải lên Wameli</button>
    </div>
    <div id="shipLog" class="log-box"></div>
  </div>`;
  document.body.appendChild(m);
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('[data-close]')) m.classList.add('hidden');
  });
  return m;
}

function log(level, msg) {
  const box = $('#shipLog');
  const line = document.createElement('div');
  line.className = 'log-line ' + level;
  line.innerHTML = `<span class="t">${new Date().toLocaleTimeString('vi-VN')}</span>${esc(msg)}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function fillSelect(sel, list, placeholder, value) {
  sel.innerHTML = `<option value="">${placeholder}</option>` + (list || []).map((o) => `<option value="${esc(o.value)}">${esc(o.text)}</option>`).join('');
  if (value) sel.value = value;
}

const normVi = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();

// Chọn option có chữ khớp (bằng nhau trước, rồi chứa nhau)
function selectByText(sel, wanted) {
  const w = normVi(wanted);
  if (!w) return false;
  const opts = [...sel.options].filter((o) => o.value);
  const hit = opts.find((o) => normVi(o.textContent) === w) || opts.find((o) => normVi(o.textContent).includes(w) || w.includes(normVi(o.textContent)));
  if (hit) sel.value = hit.value;
  return !!hit;
}

// Kho mặc định: Hà Nội
function selectHanoiWarehouse() {
  const sel = $('#shipWarehouse');
  const hit = [...sel.options].find((o) => o.value && /ha noi|\bhn\b/.test(normVi(o.textContent)));
  if (hit) sel.value = hit.value;
}

// Tên shop Wameli theo sheet CAI_DAT: dòng có cột "gian" = mã shop -> cột "TEN_SHOP"
let caiDatRows = null;
async function tenShopByGian(code) {
  if (!code) return '';
  if (!caiDatRows) {
    const res = await chrome.runtime.sendMessage({ type: 'FETCH_CAI_DAT' }).catch(() => null);
    caiDatRows = (res && res.ok && res.values) || [];
  }
  const header = (caiDatRows[0] || []).map((h) => normVi(h));
  const gi = header.indexOf('gian');
  const ti = header.indexOf('ten_shop');
  if (gi < 0 || ti < 0) return '';
  const row = caiDatRows.slice(1).find((r) => normVi(r[gi]) === normVi(code));
  return row ? String(row[ti] || '').trim() : '';
}

async function selectShopByCode(code) {
  const tenShop = await tenShopByGian(code);
  if (tenShop && selectByText($('#shipShop'), tenShop)) {
    log('info', `Shop Wameli theo CAI_DAT (gian ${code} → ${tenShop}).`);
    return true;
  }
  if (tenShop) log('error', `Không thấy shop "${tenShop}" (gian ${code}) trong danh sách Wameli – chọn tay.`);
  return false;
}

// Giờ: hiện dạng nút, giá trị vẫn nằm trong ô chọn #shipHour (ẩn)
function renderHourButtons() {
  const sel = $('#shipHour');
  sel.classList.add('hidden');
  let box = $('#shipHourBtns');
  if (!box) {
    box = document.createElement('span');
    box.id = 'shipHourBtns';
    box.className = 'row';
    sel.after(box);
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-hour]');
      if (!b) return;
      sel.value = b.dataset.hour;
      renderHourButtons();
    });
  }
  const opts = [...sel.options].filter((o) => o.value);
  box.innerHTML = opts.length
    ? opts.map((o) => `<button type="button" class="btn small${o.value === sel.value ? ' primary' : ''}" data-hour="${esc(o.value)}">${esc(o.textContent)}</button>`).join('')
    : '<span class="muted small">Chưa có khung giờ</span>';
}

// Áp mặc định sau khi có danh sách Wameli
async function applyWameliDefaults(code, prefs) {
  selectHanoiWarehouse();
  if (!(await selectShopByCode(code))) {
    const remembered = prefs.codes && (prefs.codes[code] || prefs.codes[String(code).toLowerCase()]);
    if (remembered) $('#shipShop').value = remembered;
  }
  renderHourButtons();
}

async function renderWameliSelects(prefs) {
  const { [FORM_KEY]: form } = await chrome.storage.local.get(FORM_KEY);
  const f = form || {};
  fillSelect($('#shipPlatform'), f.platforms, '--Sàn--', prefs.platform_id || '2');
  fillSelect($('#shipWarehouse'), f.warehouses, '--Kho--', prefs.warehouse_id);
  fillSelect($('#shipShop'), f.shops, '--Shop--', prefs.shop_id);
  fillSelect($('#shipHour'), f.hours, '--Giờ--', prefs.house_id);
  return !!form;
}

let current = { orders: [], busy: false };

export async function openShipDialog(orders, { toast }) {
  const m = ensureModal();
  $('#shipLog').innerHTML = '';
  const usable = orders.filter((o) => o.packages && o.packages.length);
  const noPkg = orders.filter((o) => !o.packages || !o.packages.length);
  const noChannel = usable.filter((o) => o.packages.some((p) => !p.channelId));
  current = { orders, usable, busy: false };

  const { [PREF_KEY]: prefs0 } = await chrome.storage.local.get(PREF_KEY);
  const prefs = prefs0 || {};
  const now = new Date();
  const dayKey = `${pad(now.getDate())}${pad(now.getMonth() + 1)}`;
  // Mã shop: lấy theo "Mã gian" ở tab Cài đặt; chưa đặt thì đoán từ SKU / dùng mã lần trước
  const { maGian, dhHoanTextValue } = await chrome.storage.local.get(['maGian', 'dhHoanTextValue']);
  const code = String(maGian || dhHoanTextValue || '').trim() || guessShopCode(orders) || prefs.lastCode || '';
  $('#shipCode').value = code;
  const seq = await nextSeq(dayKey);
  const makeBase = () => `${dayKey}-${$('#shipCode').value.trim().toLowerCase() || 'shop'}-${pad(now.getHours())}${pad(now.getMinutes())}-${seq}`;
  $('#shipBase').value = makeBase();
  $('#shipNameSn').checked = !!prefs.nameSn;
  $('#shipNameTn').checked = !!prefs.nameTn;
  const preview = () => {
    const name = fileBaseFor($('#shipBase').value.trim() || makeBase(), orders);
    $('#shipNamePreview').textContent = `→ ${name}.pdf / .xlsx`;
    $('#shipNamePreview').title = name;
  };
  $('#shipCode').oninput = () => { $('#shipBase').value = makeBase(); preview(); };
  $('#shipCode').onchange = () => selectShopByCode($('#shipCode').value.trim());
  $('#shipBase').oninput = preview;
  $('#shipNameSn').onchange = preview;
  $('#shipNameTn').onchange = preview;
  preview();
  $('#shipY').value = prefs.yMode || 'fixed';
  $('#shipYFixed').value = prefs.yFixed || 1000000000;
  $('#shipMerge').checked = prefs.merge !== false;
  const syncY = () => $('#shipYFixed').classList.toggle('hidden', $('#shipY').value !== 'fixed');
  $('#shipY').onchange = syncY;
  syncY();
  $('#shipDate').value = now.toISOString().slice(0, 10);
  // Nhớ Shop Wameli theo mã shop
  const shopPrefs = { ...prefs, shop_id: (prefs.codes && prefs.codes[code]) || prefs.shop_id };
  const hasForm = await renderWameliSelects(shopPrefs);
  caiDatRows = null; // đọc lại CAI_DAT mỗi lần mở
  if (hasForm) await applyWameliDefaults(code, prefs);

  $('#shipSummary').innerHTML = `
    Đã chọn <b>${orders.length}</b> đơn · in được phiếu giao: <b>${usable.length}</b> đơn (${usable.reduce((s, o) => s + o.packages.length, 0)} kiện).
    ${noPkg.length ? `<div class="err">${noPkg.length} đơn chưa có mã kiện (thường do chưa "Chuẩn bị hàng"): ${noPkg.slice(0, 5).map((o) => esc(o.orderSn)).join(', ')}${noPkg.length > 5 ? '…' : ''}</div>` : ''}
    ${noChannel.length ? `<div class="err">${noChannel.length} đơn chưa đọc được mã kênh vận chuyển (channel_id) – sẽ bị bỏ qua khi in.</div>` : ''}
    ${hasForm ? '' : '<div class="err" id="shipFormWarn">Chưa có danh sách Sàn / Kho / Shop / Giờ của Wameli – đang tự lấy từ Wameli (tự đăng nhập Admin nếu cần)...</div>'}`;

  const btnForm = $('#shipLoadForm');
  const loadWameliForm = async () => {
    btnForm.disabled = true;
    btnForm.textContent = 'Đang lấy danh sách...';
    try {
      log('info', 'Đang kết nối Wameli (sẽ tự đăng nhập tài khoản Admin nếu chưa đăng nhập)...');
      const form = await wameli.uploadForm();
      await chrome.storage.local.set({ [FORM_KEY]: { ...form, at: Date.now() } });
      await renderWameliSelects(shopPrefs);
      await applyWameliDefaults($('#shipCode').value.trim(), prefs);
      $('#shipFormWarn') && $('#shipFormWarn').remove();
      log('success', `Đã lấy danh sách từ Wameli: ${form.shops.length} shop, ${form.hours.length} khung giờ, ${form.warehouses.length} kho.`);
    } catch (err) {
      log('error', 'Không lấy được danh sách Wameli: ' + err.message);
    } finally {
      btnForm.disabled = false;
      btnForm.textContent = 'Tải danh sách từ Wameli';
    }
  };
  btnForm.onclick = loadWameliForm;
  if (!hasForm) loadWameliForm();
  $('#shipXlsx').onclick = () => run({ mode: 'xlsx', toast, dayKey, seq });
  $('#shipPdf').onclick = () => run({ mode: 'pdf', toast, dayKey, seq });
  $('#shipBoth').onclick = () => run({ mode: 'both', toast, dayKey, seq });
  $('#shipUpload').onclick = () => run({ mode: 'upload', toast, dayKey, seq });
  m.classList.remove('hidden');
}

const SHIP_BUTTONS = ['#shipXlsx', '#shipPdf', '#shipBoth', '#shipUpload'];

async function run({ mode, toast, dayKey, seq }) {
  if (current.busy) return;
  const upload = mode === 'upload';
  const needPdf = mode !== 'xlsx';
  const needXlsx = mode !== 'pdf';
  // Chỉ tải Excel: không cần phiếu giao, dùng mọi đơn đã chọn
  const orders = needPdf ? current.usable.filter((o) => o.packages.every((p) => p.channelId)) : current.orders;
  if (!orders.length) return log('error', 'Không có đơn nào in được phiếu giao (thiếu mã kiện hoặc kênh vận chuyển)');
  const base0 = $('#shipBase').value.trim() || `${dayKey}-shop-${seq}`;
  // File tải về máy được thêm mã đơn / mã vận đơn; file gửi lên Wameli giữ tên gốc
  const base = upload ? base0 : fileBaseFor(base0, orders);
  const fields = {
    is_seeding: '0',
    platform_id: $('#shipPlatform').value,
    warehouse_id: $('#shipWarehouse').value,
    shop_id: $('#shipShop').value,
    date: toWameliDate($('#shipDate').value),
    house_id: $('#shipHour').value,
    name: ''
  };
  if (upload) {
    const missing = [['platform_id', 'Sàn'], ['warehouse_id', 'Kho'], ['shop_id', 'Shop'], ['date', 'Ngày'], ['house_id', 'Giờ']].filter(([k]) => !fields[k]).map(([, l]) => l);
    if (missing.length) return log('error', 'Chưa chọn: ' + missing.join(', '));
  }
  const groups = new Map();
  for (const o of orders) {
    for (const p of o.packages) {
      if (!groups.has(p.channelId)) groups.set(p.channelId, []);
      groups.get(p.channelId).push({ packageNumber: p.packageNumber, orderId: o.orderId });
    }
  }
  const textOf = (sel) => (sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : '');
  const question = upload
    ? `In phiếu giao cho ${orders.length} đơn trên Shopee và tạo đơn mới trên Wameli?\n\nShop Wameli: ${textOf($('#shipShop'))}\nNgày ${fields.date} – Giờ ${textOf($('#shipHour'))}\nFile: ${base}.pdf + ${base}.xlsx`
    : `In phiếu giao cho ${orders.length} đơn trên Shopee và tải về máy (không gửi lên Wameli)?\nFile: ${base}.pdf${needXlsx ? ` + ${base}.xlsx` : ''}`;
  // Tải Excel không đụng tới Shopee nên không cần hỏi lại
  if (needPdf && !confirm(question)) return;

  current.busy = true;
  SHIP_BUTTONS.forEach((b) => { $(b).disabled = true; });
  try {
    const pdfs = [];
    const shop = needPdf ? await getShopInfo() : null;
    if (needPdf && !shop.shopId) throw new Error('Không đọc được shop_id của shop Shopee');
    let gi = 0;
    for (const [channelId, packages] of needPdf ? groups : []) {
      gi++;
      log('info', `Tạo phiếu giao: kênh ${channelId}, ${packages.length} kiện...`);
      const job = await shippingDoc.createJob({ shopId: shop.shopId, channelId, packages });
      log('info', `Job ${job.job_id} (trạng thái ${job.job_status}) – đang tải PDF...`);
      await sleep(1500);
      const pdf = await shippingDoc.downloadPdf(job.job_id);
      const name = groups.size > 1 ? `${base}-${gi}.pdf` : `${base}.pdf`;
      pdfs.push({ name, type: 'application/pdf', base64: pdf.base64 });
      log('success', `✔ PDF ${name} (${Math.round(pdf.size / 1024)} KB)`);
    }

    // Ghép nhiều phiếu giao thành 1 file PDF
    if (pdfs.length > 1 && $('#shipMerge').checked) {
      log('info', `Đang ghép ${pdfs.length} file PDF...`);
      const merged = await mergePdfs(pdfs.map((p) => p.base64));
      pdfs.splice(0, pdfs.length, { name: `${base}.pdf`, type: 'application/pdf', base64: merged.base64 });
      log('success', `✔ Đã ghép thành ${base}.pdf (${merged.pages} trang)`);
    }

    let xlsxBlob = null;
    let xlsx = null;
    if (needXlsx) {
      xlsxBlob = buildXlsx(excelRows(orders, $('#shipY').value, $('#shipYFixed').value));
      xlsx = { name: `${base}.xlsx`, type: xlsxBlob.type, base64: await blobToBase64(xlsxBlob) };
      log('success', `✔ Excel ${xlsx.name} (${orders.reduce((s, o) => s + Math.max(1, o.items.length), 0)} dòng)`);
    }

    if (upload) {
      log('info', 'Đang tải lên Wameli...');
      const res = await wameli.uploadSave(fields, pdfs, xlsx);
      log('success', `✔ Đã tạo đơn trên Wameli${res.message ? ' – ' + res.message : ''}`);
      toast('Đã tải lên Wameli', 'success');
    } else {
      pdfs.forEach((p) => downloadBlob(b64ToBlob(p.base64, 'application/pdf'), p.name));
      if (xlsxBlob) downloadBlob(xlsxBlob, xlsx.name);
      toast(mode === 'xlsx' ? 'Đã tải file Excel' : mode === 'pdf' ? 'Đã tải file PDF' : 'Đã tải PDF + Excel', 'success');
    }

    await saveSeq(dayKey, seq);
    const { [PREF_KEY]: p0 } = await chrome.storage.local.get(PREF_KEY);
    const code = $('#shipCode').value.trim().toLowerCase();
    await chrome.storage.local.set({
      [PREF_KEY]: {
        ...(p0 || {}), ...fields, yMode: $('#shipY').value, yFixed: Number($('#shipYFixed').value) || 1000000000, merge: $('#shipMerge').checked, lastCode: code,
        nameSn: $('#shipNameSn').checked, nameTn: $('#shipNameTn').checked,
        codes: { ...((p0 && p0.codes) || {}), ...(code && fields.shop_id ? { [code]: fields.shop_id } : {}) }
      }
    });
  } catch (e) {
    log('error', '✖ ' + e.message);
    if (e.response) console.warn('Phản hồi:', e.response);
    toast(e.message, 'error');
  } finally {
    current.busy = false;
    SHIP_BUTTONS.forEach((b) => { $(b).disabled = false; });
  }
}
