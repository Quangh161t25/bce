import { wameli, toWameliDate } from './wameli-api.js';
import { readXlsx, base64ToBuffer, splitHeader } from './xlsx.js';
import { getTableConfig, saveTableConfig, applyTableStyles, attachColumnResizers, openColumnCustomizerModal } from './table-customizer.js';

const PAGE_SIZE = 100; // số dòng hiển thị mỗi trang

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let toastTimer = null;
function toast(msg, type = 'info') {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'toast ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 5000);
}
const status = (msg, cls = '') => {
  $('#wStatus').className = 'hint ' + cls;
  $('#wStatus').textContent = msg;
};

const state = { head: [], rows: [], page: 1, loading: false, stop: false, source: '' };

// Cách lấy theo loại dữ liệu
const MODES = {
  orders: [['excel_misa', 'Xuất Excel Misa (nhanh)'], ['excel_nhat', 'Xuất File Nhặt (nhanh)'], ['pages', 'Đọc từng trang (chậm)']],
  products: [['export', 'Xuất Excel (nhanh)'], ['pages', 'Đọc từng trang (chậm)']]
};
const kind = () => $('#wKind').value;
const kindLabel = () => (kind() === 'products' ? 'sản phẩm' : 'đơn xuất kho');

function syncKind() {
  $('#wMode').innerHTML = MODES[kind()].map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  $('#dateOpts').classList.toggle('hidden', kind() === 'products');
  $('#wMaxPages').value = kind() === 'products' ? 80 : 20;
  syncMode();
}
function syncMode() {
  $('#pageOpts').classList.toggle('hidden', $('#wMode').value !== 'pages');
}

// Bỏ các cột không cần (ô chọn, nút Sửa) của bảng trang web
function cleanTable(head, rows) {
  const keep = head.map((h, i) => (h && !/^sửa$/i.test(h) ? i : -1)).filter((i) => i !== -1);
  return { head: keep.map((i) => head[i]), rows: rows.map((r) => keep.map((i) => r[i] ?? '')) };
}

const PRODUCT_CACHE_KEY = 'wameliProductsCache'; // { head, rows, source, at }

function setData(head, rows, source) {
  state.head = head;
  state.rows = rows;
  state.page = 1;
  state.source = source;
  render();
  if (kind() === 'products') saveProductCache();
}

// Lưu danh sách sản phẩm vào máy (gọi cả khi đọc từng trang xong)
function saveProductCache() {
  if (kind() !== 'products' || !state.rows.length) return;
  chrome.storage.local.set({ [PRODUCT_CACHE_KEY]: { head: state.head, rows: state.rows, source: state.source, at: Date.now() } })
    .catch((e) => toast('Không lưu được danh sách sản phẩm: ' + e.message, 'error'));
}

async function restoreProductCache() {
  const { [PRODUCT_CACHE_KEY]: cache } = await chrome.storage.local.get(PRODUCT_CACHE_KEY);
  if (!cache || !Array.isArray(cache.rows) || !cache.rows.length) return;
  state.head = cache.head || [];
  state.rows = cache.rows;
  state.page = 1;
  const at = new Date(cache.at).toLocaleString('vi-VN');
  state.source = `${cache.source || ''} · đã lưu lúc ${at}`;
  render();
  status(`Đang hiển thị ${cache.rows.length} sản phẩm đã lưu lúc ${at}. Bấm "Lấy dữ liệu" để làm mới.`);
}

// ---------- Lưu sản phẩm mới vào sheet DS_SP ----------
// id_sp_con = Mã · id_sp = 4 ký tự đầu của Mã · ten_sp = Tên · gia_nhap_ncc = Giá nhập
// gia_ban = Giá bán lẻ · gia_dong_goi = Giá bán đóng gói · gia_thap_nhat = Giá bán thấp nhất
const normHead = (h) => String(h || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
const digits = (v) => String(v ?? '').replace(/[^\d]/g, '');

function productColumns() {
  const heads = state.head.map(normHead);
  const find = (test) => heads.findIndex(test);
  return {
    ma: find((h) => h === 'ma' || h === 'ma sp' || h === 'ma san pham'),
    ten: find((h) => h === 'ten' || h === 'ten sp' || h === 'ten san pham'),
    giaNhap: find((h) => h.startsWith('gia nhap')),
    giaBan: find((h) => h === 'gia ban le' || h === 'gia ban'),
    giaDongGoi: find((h) => /dong goi|don goi/.test(h)),
    giaThapNhat: find((h) => h.includes('thap nhat'))
  };
}

async function saveToSheet() {
  if (!state.rows.length) return toast('Chưa có sản phẩm. Bấm "Lấy dữ liệu" trước.', 'error');
  const col = productColumns();
  const LABELS = { ma: 'Mã', ten: 'Tên', giaNhap: 'Giá nhập', giaBan: 'Giá bán lẻ', giaDongGoi: 'Giá bán đóng gói', giaThapNhat: 'Giá bán thấp nhất' };
  const missing = Object.keys(LABELS).filter((k) => col[k] < 0).map((k) => LABELS[k]);
  if (missing.length) return toast('Không thấy cột: ' + missing.join(', '), 'error');

  const btn = $('#wToSheet');
  btn.disabled = true;
  try {
    status('Đang đọc sheet DS_SP...');
    const res = await chrome.runtime.sendMessage({ type: 'FETCH_DS_SP' });
    if (!res || !res.ok) throw new Error((res && res.error) || 'Không đọc được sheet DS_SP');
    const values = res.values || [];
    const header = (values[0] || []).map((h) => String(h || '').trim());
    const at = (name, fallback) => (header.indexOf(name) !== -1 ? header.indexOf(name) : fallback);
    const idx = {
      id_sp_con: header.indexOf('id_sp_con') !== -1 ? header.indexOf('id_sp_con') : at('id_sp_ct', 0),
      id_sp: at('id_sp', 1), ten_sp: at('ten_sp', 2), gia_nhap_ncc: at('gia_nhap_ncc', 3),
      gia_ban: at('gia_ban', 4), gia_dong_goi: at('gia_dong_goi', 5), gia_thap_nhat: at('gia_thap_nhat', 6)
    };
    const existing = new Set(values.slice(1).map((r) => String((r || [])[idx.id_sp_con] ?? '').trim()).filter(Boolean));

    const width = Math.max(header.length, ...Object.values(idx).map((i) => i + 1));
    const newRows = [];
    for (const r of state.rows) {
      const ma = String(r[col.ma] ?? '').trim();
      if (!ma || existing.has(ma)) continue;
      existing.add(ma);
      const row = new Array(width).fill('');
      row[idx.id_sp_con] = ma;
      row[idx.id_sp] = ma.slice(0, 4);
      row[idx.ten_sp] = String(r[col.ten] ?? '').trim();
      row[idx.gia_nhap_ncc] = digits(r[col.giaNhap]);
      row[idx.gia_ban] = digits(r[col.giaBan]);
      row[idx.gia_dong_goi] = digits(r[col.giaDongGoi]);
      row[idx.gia_thap_nhat] = digits(r[col.giaThapNhat]);
      newRows.push(row);
    }

    if (!newRows.length) {
      status('Tất cả sản phẩm đã có trong sheet DS_SP.');
      return toast('Không có sản phẩm mới (tất cả đã có trong DS_SP)', 'info');
    }
    if (!confirm(`Thêm ${newRows.length} sản phẩm mới vào sheet DS_SP?\n(${state.rows.length - newRows.length} sản phẩm đã có sẵn sẽ bỏ qua)`)) {
      status('Đã huỷ lưu vào sheet.');
      return;
    }
    status(`Đang thêm ${newRows.length} sản phẩm vào DS_SP...`);
    const add = await chrome.runtime.sendMessage({ type: 'APPEND_DS_SP', rowDatas: newRows });
    if (!add || !add.ok) throw new Error((add && add.error) || 'Không thêm được vào DS_SP');
    status(`Đã thêm ${newRows.length} sản phẩm mới vào sheet DS_SP.`);
    toast(`Đã lưu ${newRows.length} sản phẩm mới vào DS_SP`, 'success');
  } catch (e) {
    status('Lỗi lưu vào sheet: ' + e.message, 'err');
    toast(e.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

// ---------- Hiển thị ----------
function getColId(h, idx) {
  if (!h) return `col_${idx}`;
  const slug = String(h).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return slug ? `col_${slug}` : `col_${idx}`;
}

function buildWameliDefaultCols(head) {
  return head.map((h, idx) => {
    const colId = getColId(h, idx);
    const norm = normHead(h);
    let defaultWidth = 100;
    let defaultAlign = 'left';
    let defaultWrap = false;

    if (norm === 'ten' || norm === 'ten sp' || norm === 'ten san pham' || norm.includes('san pham') || norm.includes('ten')) {
      defaultWidth = 260; // Đảm bảo cột Tên đủ rộng hiển thị rõ ràng, không bị co ép 40px
      defaultWrap = true;
    } else if (norm === 'id') {
      defaultWidth = 65;
      defaultAlign = 'center';
    } else if (norm === 'ma' || norm === 'ma sp' || norm === 'ma vach' || norm.includes('sku') || norm.includes('ma don')) {
      defaultWidth = 120;
    } else if (norm.includes('gia') || norm.includes('tien') || norm.includes('phi')) {
      defaultWidth = 110;
      defaultAlign = 'right';
    } else if (norm.includes('ngay') || norm.includes('thoi gian') || norm.includes('gio')) {
      defaultWidth = 125;
      defaultAlign = 'center';
    } else if (norm === 'loai' || norm === 'trang thai' || norm.includes('trang thai')) {
      defaultWidth = 110;
      defaultAlign = 'center';
    } else if (norm.includes('so luong') || norm === 'sl') {
      defaultWidth = 65;
      defaultAlign = 'right';
    }

    return {
      id: colId,
      originalIndex: idx,
      label: h,
      visible: true,
      align: defaultAlign,
      wrap: defaultWrap,
      width: defaultWidth,
      fixed: false
    };
  });
}

function openWameliCustomizer() {
  if (!state.head.length) {
    toast('Chưa có dữ liệu bảng để tuỳ chỉnh. Hãy lấy dữ liệu trước.', 'info');
    return;
  }
  const tableConfigId = 'wTable_' + kind();
  const defaultCols = buildWameliDefaultCols(state.head);
  const currentConfig = getTableConfig(tableConfigId, defaultCols);

  openColumnCustomizerModal({
    tableId: 'wTable',
    storageKey: tableConfigId,
    tableName: kind() === 'products' ? 'Sản phẩm WML' : 'Đơn xuất kho WML',
    defaultCols,
    currentConfig,
    onSave: (newCfg) => {
      saveTableConfig(tableConfigId, newCfg);
      render();
    }
  });
}

function filtered() {
  const q = $('#wSearch').value.trim().toLowerCase();
  if (!q) return state.rows;
  return state.rows.filter((r) => r.join(' ').toLowerCase().includes(q));
}

function render() {
  const list = filtered();
  $('#wCount').textContent = list.length;
  $('#wSource').textContent = state.source;

  const tableConfigId = 'wTable_' + kind();
  const defaultCols = buildWameliDefaultCols(state.head);
  const config = getTableConfig(tableConfigId, defaultCols);

  if (state.head.length) {
    const theadHtml = config.map((c) => `<th data-col="${c.id}">${esc(c.label)}</th>`).join('') +
      `<th class="th-settings-gear" title="Tuỳ chỉnh chi tiết các cột">⚙️</th>`;
    $('#wTable thead').innerHTML = `<tr>${theadHtml}</tr>`;
  } else {
    $('#wTable thead').innerHTML = '';
  }

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const rows = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

  if (rows.length) {
    $('#wTable tbody').innerHTML = rows.map((r) =>
      `<tr>${config.map((c) => `<td data-col="${c.id}">${esc(r[c.originalIndex] ?? '')}</td>`).join('')}<td style="width:32px;min-width:32px;max-width:32px;padding:0;"></td></tr>`
    ).join('');
  } else {
    $('#wTable tbody').innerHTML = `<tr><td colspan="${Math.max(1, config.length + 1)}" class="muted">${state.rows.length ? 'Không có dòng khớp.' : 'Chưa có dữ liệu.'}</td></tr>`;
  }

  $('#wPager').innerHTML = pages > 1
    ? `<button class="btn small" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>‹ Trước</button>
       <span>Trang ${state.page}/${pages}</span>
       <button class="btn small" data-page="${state.page + 1}" ${state.page === pages ? 'disabled' : ''}>Sau ›</button>`
    : '';

  if (state.head.length) {
    applyTableStyles('wTable', config);
    attachColumnResizers('wTable', (newCfg) => {
      saveTableConfig(tableConfigId, newCfg);
    }, tableConfigId);

    const gear = $('#wTable thead .th-settings-gear');
    if (gear) {
      gear.onclick = openWameliCustomizer;
    }
  }
}

// ---------- Lấy dữ liệu ----------
function filterOpts() {
  const opts = { kind: kind(), keyword: $('#wKeyword').value.trim() };
  if (kind() === 'orders') {
    opts.from = toWameliDate($('#wFrom').value);
    opts.to = toWameliDate($('#wTo').value);
  }
  return opts;
}

async function loadExcel(task) {
  status('Đang yêu cầu Wameli xuất file Excel (có thể mất tới 1–2 phút)...');
  const opts = filterOpts();
  // Áp bộ lọc trước (Wameli lưu bộ lọc theo phiên), rồi xuất file
  const first = await wameli.filter(opts);
  status(`Wameli có ${first.total} dòng khớp bộ lọc. Đang xuất file...`);
  await sleep(2000);
  const res = await wameli.exportExcel(task, opts);
  const { head, rows } = splitHeader(await readXlsx(base64ToBuffer(res.base64)));
  const fileName = { excel_misa: 'Misa', excel_nhat: 'Nhặt', export: 'Excel sản phẩm' }[task] || task;
  setData(head, rows, `Nguồn: file ${fileName} (${Math.round(res.size / 1024)} KB) – Wameli báo ${first.total} ${kindLabel()}`);
  status(`Xong: ${rows.length} dòng từ file Excel.`, '');
  toast(`Đã lấy ${rows.length} dòng`, 'success');
}

async function loadPages() {
  const delay = Math.max(3, Number($('#wDelay').value) || 5) * 1000;
  const maxPages = Math.max(1, Number($('#wMaxPages').value) || 20);
  status('Đang áp bộ lọc trên Wameli...');
  const first = await wameli.filter(filterOpts());
  const { head } = cleanTable(first.head, []);
  const all = cleanTable(first.head, first.rows).rows;
  const lastPage = Math.min(first.maxPage || 1, maxPages);
  setData(head, all, `Nguồn: đọc trang – Wameli báo ${first.total} dòng`);
  for (let p = 2; p <= lastPage && !state.stop; p++) {
    status(`Đã lấy ${all.length}/${first.total} dòng. Nghỉ ${delay / 1000}s rồi đọc trang ${p}/${lastPage}...`);
    await sleep(delay);
    if (state.stop) break;
    const res = await wameli.page(p, kind());
    all.push(...cleanTable(res.head, res.rows).rows);
    render();
  }
  const more = first.maxPage > lastPage ? ` (còn ${first.maxPage - lastPage} trang chưa đọc – tăng "Tối đa" nếu cần)` : '';
  status(`${state.stop ? 'Đã dừng' : 'Xong'}: ${all.length}/${first.total} dòng${more}.`);
  saveProductCache();
}

async function load() {
  if (state.loading) return;
  if (kind() === 'orders' && (!$('#wFrom').value || !$('#wTo').value)) return toast('Chọn Từ ngày và Đến ngày', 'error');
  state.loading = true;
  state.stop = false;
  $('#wLoad').disabled = true;
  $('#wStop').classList.remove('hidden');
  try {
    const mode = $('#wMode').value;
    if (mode === 'pages') await loadPages();
    else await loadExcel(mode);
  } catch (e) {
    // Gặp lỗi (bị chặn, quá thời gian...) thì dừng hẳn, không thử lại dồn dập
    status(`Dừng do lỗi: ${e.message}. Đợi 15–30 phút rồi thử lại, hoặc tự xuất file trên Wameli và nhập vào ô bên trên.`, 'err');
    toast(e.message, 'error');
  } finally {
    state.loading = false;
    $('#wLoad').disabled = false;
    $('#wStop').classList.add('hidden');
    render();
  }
}

async function importFile(file) {
  try {
    const { head, rows } = splitHeader(await readXlsx(await file.arrayBuffer()));
    setData(head, rows, `Nguồn: file ${file.name}`);
    status(`Đã đọc ${rows.length} dòng từ ${file.name}.`);
    toast(`Đã đọc ${rows.length} dòng`, 'success');
  } catch (e) {
    toast('Không đọc được file: ' + e.message, 'error');
  }
}

function exportCsv() {
  const list = filtered();
  if (!list.length) return toast('Không có dữ liệu để xuất', 'error');
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [state.head.map(cell).join(','), ...list.map((r) => r.map(cell).join(','))];
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = kind() === 'products' ? `wameli-san-pham-${today}.csv` : `wameli-don-${$('#wFrom').value}_${$('#wTo').value}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

// ---------- Sự kiện ----------
const today = new Date().toISOString().slice(0, 10);
$('#wFrom').value = today;
$('#wTo').value = today;
const pageKind = new URLSearchParams(location.search).get('kind') === 'products' ? 'products' : 'orders';
$('#wKind').value = pageKind;
document.querySelector(`.nav-tab[data-nav="${pageKind}"]`)?.classList.add('active');
document.title = pageKind === 'products' ? 'Sản phẩm WML' : 'Đơn xuất kho WML';
$('.brand').textContent = pageKind === 'products' ? '🧾 Sản phẩm WML' : '🏬 Đơn xuất kho WML';
$('#upCard').classList.toggle('hidden', pageKind === 'products');
$('#wToSheet').classList.toggle('hidden', pageKind !== 'products');
$('#wKind').onchange = syncKind;
$('#wMode').onchange = syncMode;
syncKind();
$('#wToSheet').onclick = saveToSheet;
if (pageKind === 'products') restoreProductCache().catch(() => {});
$('#wLoad').onclick = load;
$('#wStop').onclick = () => { state.stop = true; status('Sẽ dừng sau trang đang đọc...'); };
$('#wFile').onchange = (e) => { if (e.target.files[0]) importFile(e.target.files[0]); e.target.value = ''; };
let t = null;
$('#wSearch').oninput = () => { clearTimeout(t); t = setTimeout(() => { state.page = 1; render(); }, 250); };
$('#wPager').onclick = (e) => {
  const b = e.target.closest('button[data-page]');
  if (!b) return;
  state.page = Number(b.dataset.page);
  render();
};
$('#wCsv').onclick = exportCsv;
if ($('#wColCustom')) $('#wColCustom').onclick = openWameliCustomizer;
render();
