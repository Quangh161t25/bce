// Khung "Tải đơn lên Wameli": tạo bản ghi ở Đơn hàng → Thêm mới (Sàn, Kho, Shop, Ngày, Giờ,
// File name, hoá đơn PDF, đơn hàng Excel). Mỗi lần bấm chỉ gửi 1 request, có xác nhận trước.
import { wameli, toWameliDate } from './wameli-api.js';

const PREF_KEY = 'wameliUploadPrefs';
const FORM_KEY = 'wameliUploadForm';

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let form = null; // { platforms, warehouses, shops, hours, seeding }

function log(level, msg) {
  const box = $('#upLog');
  const line = document.createElement('div');
  line.className = 'log-line ' + level;
  line.innerHTML = `<span class="t">${new Date().toLocaleTimeString('vi-VN')}</span>${esc(msg)}`;
  box.appendChild(line);
  box.scrollTop = box.scrollHeight;
}

function fillSelect(sel, list, placeholder, value) {
  sel.innerHTML = `<option value="">${placeholder}</option>` + list.map((o) => `<option value="${esc(o.value)}">${esc(o.text)}</option>`).join('');
  if (value) sel.value = value;
}

async function prefs() {
  const { [PREF_KEY]: p } = await chrome.storage.local.get(PREF_KEY);
  return p || {};
}

async function renderForm() {
  const p = await prefs();
  const f = form || { platforms: [], warehouses: [], shops: [], hours: [], seeding: [] };
  fillSelect($('#upPlatform'), f.platforms, '--Sàn--', p.platform_id || '2');
  fillSelect($('#upWarehouse'), f.warehouses, '--Kho--', p.warehouse_id);
  renderShops(p.shop_id);
  fillSelect($('#upHour'), f.hours, '--Giờ--', p.house_id);
  const seed = f.seeding.length ? f.seeding : [];
  $('#upSeeding').innerHTML = seed.length
    ? 'Đơn seeding: ' + seed.map((s) => `<label><input type="radio" name="upSeed" value="${esc(s.value)}" ${(p.is_seeding ?? (s.checked ? s.value : '')) === s.value ? 'checked' : ''}> ${esc(s.label || (s.value === '1' ? 'Có' : 'Không'))}</label>`).join(' ')
    : '';
  if (!$('#upSeeding input:checked') && $('#upSeeding input[value="0"]')) $('#upSeeding input[value="0"]').checked = true;
}

function renderShops(selected) {
  const q = $('#upShopFilter').value.trim().toLowerCase();
  const list = (form ? form.shops : []).filter((s) => !q || s.text.toLowerCase().includes(q));
  const cur = selected ?? $('#upShop').value;
  fillSelect($('#upShop'), list, `--Shop-- (${list.length})`, cur);
}

async function loadForm(btn) {
  btn.disabled = true;
  $('#upInfo').textContent = 'Đang lấy danh sách từ Wameli (tự đăng nhập nếu cần)...';
  try {
    form = await wameli.uploadForm();
    await chrome.storage.local.set({ [FORM_KEY]: { ...form, at: Date.now() } });
    await renderForm();
    $('#upInfo').textContent = `Đã lấy: ${form.shops.length} shop, ${form.hours.length} khung giờ, ${form.warehouses.length} kho.`;
  } catch (e) {
    $('#upInfo').textContent = 'Không lấy được danh sách: ' + e.message;
  } finally {
    btn.disabled = false;
  }
}

function readFileB64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve({ name: file.name, type: file.type, base64: String(r.result).split(',')[1] || '' });
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

const textOf = (sel) => (sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : '');

async function save(btn) {
  const fields = {
    is_seeding: ($('#upSeeding input:checked') || {}).value || '0',
    platform_id: $('#upPlatform').value,
    warehouse_id: $('#upWarehouse').value,
    shop_id: $('#upShop').value,
    date: toWameliDate($('#upDate').value),
    house_id: $('#upHour').value,
    name: $('#upName').value.trim()
  };
  const missing = [['platform_id', 'Sàn'], ['warehouse_id', 'Kho'], ['shop_id', 'Shop'], ['date', 'Ngày'], ['house_id', 'Giờ']]
    .filter(([k]) => !fields[k]).map(([, l]) => l);
  if (missing.length) return log('error', 'Chưa chọn: ' + missing.join(', '));
  const pdfFiles = [...$('#upPdf').files];
  const xlsxFile = $('#upXlsx').files[0];
  if (!pdfFiles.length && !xlsxFile) return log('error', 'Chưa chọn file PDF hoặc Excel');

  const summary = `Tạo đơn mới trên Wameli?\n\nSàn: ${textOf($('#upPlatform'))}\nKho: ${textOf($('#upWarehouse'))}\nShop: ${textOf($('#upShop'))}\nNgày: ${fields.date}  Giờ: ${textOf($('#upHour'))}\nFile name: ${fields.name || '(trống)'}\nPDF: ${pdfFiles.map((f) => f.name).join(', ') || '(không)'}\nExcel: ${xlsxFile ? xlsxFile.name : '(không)'}`;
  if (!confirm(summary)) return;

  btn.disabled = true;
  try {
    log('info', `Đang tải lên ${pdfFiles.length} PDF${xlsxFile ? ' + 1 Excel' : ''}...`);
    const pdfs = await Promise.all(pdfFiles.map(readFileB64));
    const xlsx = xlsxFile ? await readFileB64(xlsxFile) : null;
    const res = await wameli.uploadSave(fields, pdfs, xlsx);
    log('success', `✔ Đã lưu trên Wameli${res.message ? ' – ' + res.message : ''}${res.firstRow && res.firstRow.length ? ' · Dòng mới nhất: ' + res.firstRow.filter(Boolean).join(' | ') : ''}`);
    await chrome.storage.local.set({ [PREF_KEY]: { ...fields, name: '' } });
    $('#upPdf').value = '';
    $('#upXlsx').value = '';
    $('#upName').value = '';
  } catch (e) {
    log('error', '✖ ' + e.message);
  } finally {
    btn.disabled = false;
  }
}

// ---------- Khởi tạo ----------
(async () => {
  $('#upDate').value = new Date().toISOString().slice(0, 10);
  const { [FORM_KEY]: cached } = await chrome.storage.local.get(FORM_KEY);
  if (cached) form = cached;
  await renderForm();
  if (cached) $('#upInfo').textContent = `Danh sách lấy lúc ${new Date(cached.at).toLocaleString('vi-VN')} (${cached.shops.length} shop). Bấm "Tải danh sách" để cập nhật.`;
  $('#upLoadForm').onclick = (e) => loadForm(e.currentTarget);
  $('#upShopFilter').oninput = () => renderShops();
  $('#upSave').onclick = (e) => save(e.currentTarget);
})();
