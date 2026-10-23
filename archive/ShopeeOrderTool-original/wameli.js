import { wameli, toWameliDate } from './wameli-api.js';
import { readXlsx, base64ToBuffer, splitHeader } from './xlsx.js';

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

function setData(head, rows, source) {
  state.head = head;
  state.rows = rows;
  state.page = 1;
  state.source = source;
  render();
}

// ---------- Hiển thị ----------
function filtered() {
  const q = $('#wSearch').value.trim().toLowerCase();
  if (!q) return state.rows;
  return state.rows.filter((r) => r.join(' ').toLowerCase().includes(q));
}

function render() {
  const list = filtered();
  $('#wCount').textContent = list.length;
  $('#wSource').textContent = state.source;
  $('#wTable thead').innerHTML = state.head.length ? `<tr>${state.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr>` : '';
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const rows = list.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
  $('#wTable tbody').innerHTML = rows.length
    ? rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')
    : `<tr><td class="muted">${state.rows.length ? 'Không có dòng khớp.' : 'Chưa có dữ liệu.'}</td></tr>`;
  $('#wPager').innerHTML = pages > 1
    ? `<button class="btn small" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>‹ Trước</button>
       <span>Trang ${state.page}/${pages}</span>
       <button class="btn small" data-page="${state.page + 1}" ${state.page === pages ? 'disabled' : ''}>Sau ›</button>`
    : '';
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
$('#wKind').onchange = syncKind;
$('#wMode').onchange = syncMode;
syncKind();
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
render();
