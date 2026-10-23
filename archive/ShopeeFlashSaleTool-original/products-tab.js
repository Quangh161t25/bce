// Tab "Sản phẩm": tải và hiển thị toàn bộ sản phẩm của shop.
import { products, getShopInfo, sleep } from './shopee-api.js';
import { extractMedia } from './media.js';

const PAGE_SIZE = 50;
const CACHE_KEY = 'productCache';

const $ = (sel, el = document) => el.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => (Number(n) || 0).toLocaleString('vi-VN') + '₫';

const STATUS = {
  1: { label: 'Đang bán', cls: 'current' },
  4: { label: 'Bị khoá', cls: 'bad' },
  8: { label: 'Đã ẩn', cls: 'end' }
};

const state = {
  all: [],
  loadedAt: null,
  shopId: null,
  loading: false,
  stop: false,
  page: 1,
  selected: new Set(),
  expanded: new Set()
};

let hooks = { toast: () => {}, onFlashSale: () => {} };

// ---------- Tính toán ----------
const totalStock = (p) => p.models.reduce((a, m) => a + m.stock, 0);
const minPrice = (p) => Math.min(...p.models.map((m) => m.price || Infinity));
const maxPrice = (p) => Math.max(...p.models.map((m) => m.price || 0));

function statusOf(p) {
  if (p.unlisted && p.status === 1) return { label: 'Đã ẩn', cls: 'end' };
  return STATUS[p.status] || { label: `Trạng thái ${p.status}`, cls: '' };
}

function priceText(p) {
  const lo = minPrice(p);
  const hi = maxPrice(p);
  if (!Number.isFinite(lo) || !hi) return '-';
  return lo === hi ? money(lo) : `${money(lo)} – ${money(hi)}`;
}

function filtered() {
  const q = $('#pfSearch').value.trim().toLowerCase();
  const status = $('#pfStatus').value;
  const stock = $('#pfStock').value;
  const sort = $('#pfSort').value;

  let list = state.all.filter((p) => {
    if (q) {
      const hay = `${p.name} ${p.itemId} ${p.parentSku} ${p.models.map((m) => m.sku + ' ' + m.name).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (status === 'active' && !(p.status === 1 && !p.unlisted)) return false;
    if (status === 'hidden' && !(p.unlisted || p.status === 8)) return false;
    if (status === 'banned' && p.status !== 4) return false;
    const s = totalStock(p);
    if (stock === 'out' && s > 0) return false;
    if (stock === 'low' && !(s > 0 && s <= 10)) return false;
    if (stock === 'in' && s <= 0) return false;
    return true;
  });

  const sorters = {
    newest: (a, b) => b.createTime - a.createTime,
    name: (a, b) => a.name.localeCompare(b.name, 'vi'),
    priceAsc: (a, b) => minPrice(a) - minPrice(b),
    priceDesc: (a, b) => maxPrice(b) - maxPrice(a),
    stockAsc: (a, b) => totalStock(a) - totalStock(b),
    stockDesc: (a, b) => totalStock(b) - totalStock(a),
    sold: (a, b) => b.sold - a.sold
  };
  if (sorters[sort]) list = list.slice().sort(sorters[sort]);
  return list;
}

// ---------- Hiển thị ----------
function renderSummary() {
  const all = state.all;
  const active = all.filter((p) => p.status === 1 && !p.unlisted).length;
  const out = all.filter((p) => totalStock(p) <= 0).length;
  const models = all.reduce((a, p) => a + p.models.length, 0);
  $('#pSummary').innerHTML = all.length
    ? `<b>${all.length}</b> sản phẩm · ${models} phân loại · <b>${active}</b> đang bán · <b style="color:var(--err)">${out}</b> hết hàng`
      + (state.loadedAt ? ` · cập nhật ${new Date(state.loadedAt).toLocaleString('vi-VN')}` : '')
    : 'Chưa tải sản phẩm. Bấm "Tải toàn bộ sản phẩm".';
}

function render() {
  renderSummary();
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * PAGE_SIZE;
  const rows = list.slice(start, start + PAGE_SIZE);

  $('#pSelCount').textContent = state.selected.size;
  $('#pFilteredCount').textContent = list.length;

  const tbody = $('#pTable tbody');
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="16" class="muted">${state.all.length ? 'Không có sản phẩm khớp bộ lọc.' : 'Chưa có dữ liệu.'}</td></tr>`;
  } else {
    tbody.innerHTML = rows.map(productRows).join('');
  }
  loadPageMedia(rows);

  $('#pPager').innerHTML = pages > 1
    ? `<button class="btn small" data-page="${state.page - 1}" ${state.page === 1 ? 'disabled' : ''}>‹ Trước</button>
       <span>Trang ${state.page}/${pages}</span>
       <button class="btn small" data-page="${state.page + 1}" ${state.page === pages ? 'disabled' : ''}>Sau ›</button>`
    : '';
}

// ---------- Ô ảnh / video trong bảng ----------
const dateText = (p) => (p.createTime ? new Date(p.createTime * 1000).toLocaleDateString('vi-VN') : '-');

function thumb(img, title = '') {
  return `<a href="${esc(img.url)}" target="_blank" title="${esc(title || 'Mở ảnh gốc')}"><img class="cell-img" src="${esc(img.thumb)}" loading="lazy"></a>`;
}

function imagesCell(list, max = 3) {
  if (!list.length) return '<span class="muted">—</span>';
  const more = list.length > max ? `<button class="btn small" data-media title="Xem tất cả">+${list.length - max}</button>` : '';
  return `<div class="cell-imgs">${list.slice(0, max).map((x) => thumb(x)).join('')}${more}</div>`;
}

function videoCell(videos) {
  if (!videos.length) return '<span class="muted">—</span>';
  return videos.map((v) => (v.url
    ? `<a href="${esc(v.url)}" target="_blank" class="video-link" title="Mở video">${v.thumb ? `<img class="cell-img" src="${esc(v.thumb)}">` : ''}▶${v.duration ? ' ' + v.duration + 's' : ''}</a>`
    : `<span class="muted" title="Không có link phát">ID ${esc(v.id)}</span>`)).join(' ');
}

function productRows(p) {
  const st = statusOf(p);
  const media = mediaCache.get(p.itemId);
  const err = mediaErrors.get(p.itemId);
  const pending = !media && !err;
  const span = p.models.length;
  const loadingCell = pending ? '<span class="muted">…</span>' : `<span class="muted" title="${esc(err || '')}">lỗi</span>`;
  const shopLink = state.shopId ? `https://shopee.vn/product/${state.shopId}/${p.itemId}` : '';

  return p.models.map((m, i) => {
    const mImg = media && (media.modelImages || {})[m.modelId];
    const modelCells = `
      <td>${m.modelId || '—'}</td>
      <td>${esc(m.name) || '<span class="muted">Mặc định</span>'}</td>
      <td>${esc(m.sku) || '<span class="muted">—</span>'}</td>
      <td>${media ? (mImg ? thumb(mImg, m.name) : '<span class="muted">—</span>') : loadingCell}</td>`;
    const priceCells = `
      <td>${m.price ? money(m.price) : '-'}</td>
      <td>${m.promoPrice && m.promoPrice < m.price ? money(m.promoPrice) : '<span class="muted">—</span>'}</td>
      <td style="${m.stock <= 0 ? 'color:var(--err);font-weight:600' : ''}">${m.stock}</td>`;

    if (i > 0) return `<tr class="model-row" data-id="${p.itemId}">${modelCells}${priceCells}</tr>`;

    const rs = `rowspan="${span}"`;
    return `<tr class="first-model" data-id="${p.itemId}">
      <td ${rs}><input type="checkbox" data-sel ${state.selected.has(p.itemId) ? 'checked' : ''}></td>
      <td ${rs}>${p.itemId}</td>
      <td ${rs} class="name-cell"><div class="name">${esc(p.name)}</div><span class="status ${st.cls}">${st.label}</span></td>
      <td ${rs}>${esc(p.parentSku) || '<span class="muted">—</span>'}</td>
      ${modelCells}
      <td ${rs}>${media ? imagesCell(media.images) : (p.image ? `<img class="cell-img" src="${esc(p.image)}">` : loadingCell)}</td>
      <td ${rs}>${media ? imagesCell(media.descImages) : loadingCell}</td>
      <td ${rs}>${media ? videoCell(media.videos) : loadingCell}</td>
      ${priceCells}
      <td ${rs}>${dateText(p)}</td>
      <td ${rs} class="row">
        <button class="btn small" data-media>🖼 Ảnh &amp; Video</button>
        <a class="btn small" target="_blank" href="https://banhang.shopee.vn/portal/product/${p.itemId}">Sửa</a>
        ${shopLink ? `<a class="btn small" target="_blank" href="${shopLink}">Xem</a>` : ''}
      </td>
    </tr>`;
  }).join('');
}

// Tải ảnh/video cho các sản phẩm ở trang đang xem (lần lượt, có nghỉ để tránh bị chặn).
const mediaErrors = new Map();
let mediaQueueToken = 0;

async function loadPageMedia(rows) {
  const todo = rows.filter((p) => !mediaCache.has(p.itemId) && !mediaErrors.has(p.itemId));
  if (!todo.length) return;
  const token = ++mediaQueueToken;
  const progress = $('#pProgress');
  for (let i = 0; i < todo.length; i++) {
    if (token !== mediaQueueToken) return; // đã chuyển trang / lọc khác
    progress.textContent = `Đang tải ảnh/video ${i + 1}/${todo.length}...`;
    try {
      await getMedia(todo[i].itemId);
    } catch (e) {
      mediaErrors.set(todo[i].itemId, e.message);
    }
    if ((i + 1) % 5 === 0 || i === todo.length - 1) refreshRows(todo.slice(Math.max(0, i - 4), i + 1));
    await sleep(250);
  }
  if (token === mediaQueueToken) {
    progress.textContent = '';
    persistMedia();
  }
}

// Vẽ lại riêng các dòng của những sản phẩm vừa có ảnh/video.
function refreshRows(list) {
  const tbody = $('#pTable tbody');
  for (const p of list) {
    const old = [...tbody.querySelectorAll(`tr[data-id="${p.itemId}"]`)];
    if (!old.length) continue;
    const tmp = document.createElement('tbody');
    tmp.innerHTML = productRows(p);
    old[0].before(...tmp.children);
    old.forEach((tr) => tr.remove());
  }
}

// ---------- Tải dữ liệu ----------
async function loadCache() {
  try {
    const { [CACHE_KEY]: cache } = await chrome.storage.local.get(CACHE_KEY);
    if (cache && Array.isArray(cache.products)) {
      state.all = cache.products;
      state.loadedAt = cache.loadedAt;
      state.shopId = cache.shopId;
    }
  } catch (e) { /* bỏ qua */ }
}

async function loadAll() {
  if (state.loading) return;
  state.loading = true;
  state.stop = false;
  const btn = $('#btnPLoad');
  btn.disabled = true;
  $('#btnPStop').classList.remove('hidden');
  const progress = $('#pProgress');
  const result = [];
  try {
    const shop = await getShopInfo().catch(() => ({}));
    state.shopId = shop.shopId || state.shopId;
    let cursor = '';
    const seen = new Set();
    for (let i = 0; i < 200 && !state.stop; i++) {
      const res = await products.search({ cursor, pageSize: 48, pageNumber: i + 1 });
      // Bỏ trùng; nếu một trang không có sản phẩm mới thì coi như đã hết
      const fresh = res.products.filter((p) => !seen.has(p.itemId));
      fresh.forEach((p) => seen.add(p.itemId));
      result.push(...fresh);
      progress.textContent = `Đang tải... ${result.length}${res.total ? '/' + res.total : ''} sản phẩm`;
      if (!fresh.length) break;
      if (res.total && result.length >= res.total) break;
      cursor = res.cursor || '';
      await sleep(400);
    }
    state.all = result;
    mediaCache.clear();
    mediaErrors.clear();
    chrome.storage.local.remove(MEDIA_KEY).catch(() => {});
    state.loadedAt = Date.now();
    state.selected.clear();
    await chrome.storage.local.set({
      [CACHE_KEY]: { products: state.all, loadedAt: state.loadedAt, shopId: state.shopId }
    });
    progress.textContent = state.stop ? `Đã dừng – tải được ${state.all.length} sản phẩm` : '';
    hooks.toast(`Đã tải ${state.all.length} sản phẩm`, 'success');
  } catch (e) {
    progress.textContent = '';
    hooks.toast('Lỗi tải sản phẩm: ' + e.message, 'error');
  } finally {
    state.loading = false;
    btn.disabled = false;
    $('#btnPStop').classList.add('hidden');
    render();
  }
}

// ---------- Xuất Excel (CSV) ----------
// Cùng cột với bảng; mỗi phân loại một dòng. Tự lấy ảnh/video còn thiếu.
async function exportCsv() {
  const list = state.selected.size ? state.all.filter((p) => state.selected.has(p.itemId)) : filtered();
  if (!list.length) return hooks.toast('Không có sản phẩm để xuất', 'error');
  const missing = list.filter((p) => !mediaCache.has(p.itemId));
  if (missing.length > 100 && !confirm(`Cần tải ảnh/video cho ${missing.length} sản phẩm (khoảng ${Math.ceil(missing.length * 0.6 / 60)} phút). Tiếp tục?`)) return;

  const progress = $('#pProgress');
  for (let i = 0; i < missing.length; i++) {
    progress.textContent = `Đang lấy ảnh/video ${i + 1}/${missing.length}...`;
    try { await getMedia(missing[i].itemId); } catch (e) { mediaErrors.set(missing[i].itemId, e.message); }
    await sleep(300);
  }
  progress.textContent = '';
  if (missing.length) persistMedia();

  const head = ['ID chính', 'Tên sản phẩm', 'SKU', 'ID phân loại', 'Tên phân loại', 'SKU phân loại', 'Ảnh phân loại',
    'Ảnh chính', 'Ảnh mô tả', 'Video', 'Giá', 'Giá KM', 'Tồn kho', 'Ngày tạo', 'Trạng thái'];
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [head.map(cell).join(',')];
  for (const p of list) {
    const m0 = mediaCache.get(p.itemId);
    for (const m of p.models) {
      const mImg = m0 && (m0.modelImages || {})[m.modelId];
      lines.push([
        p.itemId, p.name, p.parentSku, m.modelId || '', m.name, m.sku, mImg ? mImg.url : '',
        m0 ? m0.images.map((x) => x.url).join('\n') : '',
        m0 ? m0.descImages.map((x) => x.url).join('\n') : '',
        m0 ? m0.videos.map((v) => v.url || (v.id ? 'video_id ' + v.id : '')).join('\n') : '',
        m.price, m.promoPrice && m.promoPrice < m.price ? m.promoPrice : '', m.stock, dateText(p), statusOf(p).label
      ].map(cell).join(','));
    }
  }
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `san-pham-shopee-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  hooks.toast(`Đã xuất ${list.length} sản phẩm`, 'success');
  render();
}

// ---------- Ảnh & Video ----------
const mediaCache = new Map(); // itemId -> media
const MEDIA_KEY = 'mediaCache_v3'; // v3: link video đầy đủ (kể cả khi nằm trong video_id)

async function loadMediaCache() {
  chrome.storage.local.remove(['mediaCache', 'mediaCache_v2']).catch(() => {}); // xoá bộ nhớ cũ (link video thiếu tên miền)
  try {
    const { [MEDIA_KEY]: saved } = await chrome.storage.local.get(MEDIA_KEY);
    for (const [id, m] of Object.entries(saved || {})) mediaCache.set(Number(id), m);
  } catch (e) { /* bỏ qua */ }
}

function persistMedia() {
  chrome.storage.local.set({ [MEDIA_KEY]: Object.fromEntries(mediaCache) }).catch(() => {});
}

async function getMedia(itemId) {
  if (mediaCache.has(itemId)) return mediaCache.get(itemId);
  const raw = await products.getRaw(itemId);
  if (!raw) throw new Error('Không lấy được dữ liệu sản phẩm');
  const media = extractMedia(raw);
  mediaCache.set(itemId, media);
  return media;
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    hooks.toast(`Đã copy ${label}`, 'success');
  } catch (e) {
    hooks.toast('Không copy được: ' + e.message, 'error');
  }
}

function mediaTile(img, caption = '') {
  return `<div class="media-tile">
    <a href="${esc(img.url)}" target="_blank" title="Mở ảnh gốc"><img src="${esc(img.thumb)}" loading="lazy"></a>
    ${caption ? `<div class="cap" title="${esc(caption)}">${esc(caption)}</div>` : ''}
    <button class="btn small" data-copy="${esc(img.url)}">Copy link</button>
  </div>`;
}

function mediaSection(title, items, html) {
  const links = items.map((x) => x.url).filter(Boolean).join('\n');
  return `<div class="media-section">
    <div class="card-head"><h4>${title} <span class="muted">(${items.length})</span></h4>
      ${items.length && links ? `<button class="btn small" data-copy-all="${esc(links)}">Copy tất cả link</button>` : ''}</div>
    ${items.length ? `<div class="media-grid">${html}</div>` : '<div class="muted">Không có</div>'}
  </div>`;
}

function renderMedia(p, media) {
  const videoHtml = media.videos.map((v) => `<div class="media-tile video">
      ${v.url
        ? `<video src="${esc(v.url)}" ${v.thumb ? `poster="${esc(v.thumb)}"` : ''} controls preload="none"></video>`
        : (v.thumb ? `<img src="${esc(v.thumb)}">` : '<div class="muted">Không có link phát</div>')}
      <div class="cap">${v.id ? 'ID ' + esc(v.id) : ''}${v.duration ? ` · ${v.duration}s` : ''}</div>
      ${v.url ? `<button class="btn small" data-copy="${esc(v.url)}">Copy link</button>` : ''}
    </div>`).join('');

  $('#pMediaBody').innerHTML = `
    ${mediaSection('Ảnh chính', media.images, media.images.map((img, i) => mediaTile(img, img.note || (i === 0 ? 'Ảnh bìa' : `Ảnh ${i + 1}`))).join(''))}
    ${mediaSection('Ảnh phân loại', media.variations, media.variations.map((v) => mediaTile(v, `${v.group}: ${v.option}`)).join(''))}
    ${mediaSection('Ảnh trong mô tả', media.descImages, media.descImages.map((img) => mediaTile(img)).join(''))}
    ${mediaSection('Video', media.videos, videoHtml)}`;
  $('#pMediaTitle').textContent = p ? p.name : '';
}

async function openMedia(itemId) {
  const p = state.all.find((x) => x.itemId === itemId);
  $('#pMediaTitle').textContent = p ? p.name : `Sản phẩm ${itemId}`;
  $('#pMediaBody').innerHTML = '<div class="muted">Đang tải ảnh & video...</div>';
  $('#pMedia').classList.remove('hidden');
  try {
    renderMedia(p, await getMedia(itemId));
  } catch (e) {
    $('#pMediaBody').innerHTML = `<div style="color:var(--err)">Lỗi: ${esc(e.message)}</div>`;
  }
}

async function exportMediaCsv() {
  const list = selectedProducts();
  if (!list.length) return hooks.toast('Hãy tích chọn sản phẩm cần xuất link ảnh/video', 'error');
  const btn = $('#btnPExportMedia');
  btn.disabled = true;
  const progress = $('#pProgress');
  const head = ['ID sản phẩm', 'Tên sản phẩm'];
  for (let i = 1; i <= 9; i++) head.push(`Ảnh ${i}`);
  head.push('Ảnh phân loại', 'Ảnh mô tả', 'Video');
  const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [head.map(cell).join(',')];
  let fail = 0;
  try {
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      progress.textContent = `Đang lấy ảnh/video ${i + 1}/${list.length}...`;
      try {
        const m = await getMedia(p.itemId);
        const imgs = m.images.map((x) => x.url);
        const row = [p.itemId, p.name];
        for (let k = 0; k < 9; k++) row.push(imgs[k] || '');
        row.push(m.variations.map((v) => `${v.group}: ${v.option} | ${v.url}`).join('\n'));
        row.push(m.descImages.map((x) => x.url).join('\n'));
        row.push(m.videos.map((v) => v.url || (v.id ? 'video_id ' + v.id : '')).join('\n'));
        lines.push(row.map(cell).join(','));
      } catch (e) {
        fail++;
        lines.push([p.itemId, p.name, 'LỖI: ' + e.message].map(cell).join(','));
      }
      await sleep(300);
    }
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `anh-video-san-pham-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    hooks.toast(`Đã xuất link ảnh/video của ${list.length - fail} sản phẩm${fail ? `, ${fail} lỗi` : ''}`, fail ? 'error' : 'success');
  } finally {
    progress.textContent = '';
    btn.disabled = false;
  }
}

function selectedProducts() {
  return state.all.filter((p) => state.selected.has(p.itemId));
}

// ---------- Khởi tạo ----------
export async function initProductsTab(h) {
  hooks = { ...hooks, ...h };

  $('#btnPLoad').onclick = loadAll;
  $('#btnPStop').onclick = () => { state.stop = true; };
  $('#btnPExport').onclick = exportCsv;
  $('#btnPExportMedia').onclick = exportMediaCsv;

  // Khung Ảnh & Video
  $('#pMediaClose').onclick = () => $('#pMedia').classList.add('hidden');
  $('#pMedia').addEventListener('click', (e) => {
    if (e.target.id === 'pMedia') $('#pMedia').classList.add('hidden');
    const one = e.target.closest('[data-copy]');
    if (one) copyText(one.dataset.copy, 'link');
    const all = e.target.closest('[data-copy-all]');
    if (all) copyText(all.dataset.copyAll, 'tất cả link');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') $('#pMedia').classList.add('hidden');
  });

  for (const id of ['#pfStatus', '#pfStock', '#pfSort']) {
    $(id).onchange = () => { state.page = 1; render(); };
  }
  let t = null;
  $('#pfSearch').oninput = () => {
    clearTimeout(t);
    t = setTimeout(() => { state.page = 1; render(); }, 250);
  };

  $('#pChkAll').onchange = (e) => {
    const start = (state.page - 1) * PAGE_SIZE;
    filtered().slice(start, start + PAGE_SIZE).forEach((p) => {
      if (e.target.checked) state.selected.add(p.itemId);
      else state.selected.delete(p.itemId);
    });
    render();
  };
  $('#btnPSelectFiltered').onclick = () => {
    filtered().forEach((p) => state.selected.add(p.itemId));
    render();
  };
  $('#btnPClearSel').onclick = () => {
    state.selected.clear();
    $('#pChkAll').checked = false;
    render();
  };

  $('#pTable tbody').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-id]');
    if (!tr) return;
    const id = Number(tr.dataset.id);
    if (e.target.matches('[data-sel]')) {
      if (e.target.checked) state.selected.add(id);
      else state.selected.delete(id);
      $('#pSelCount').textContent = state.selected.size;
    }
    if (e.target.closest('[data-media]')) openMedia(id);
    if (e.target.closest('[data-expand]')) {
      if (state.expanded.has(id)) state.expanded.delete(id);
      else state.expanded.add(id);
      render();
    }
  });

  $('#pPager').onclick = (e) => {
    const b = e.target.closest('button[data-page]');
    if (!b) return;
    state.page = Number(b.dataset.page);
    render();
    $('#pTable').scrollIntoView({ behavior: 'smooth' });
  };

  $('#btnPToFs').onclick = () => {
    const list = selectedProducts().filter((p) => p.status === 1 && !p.unlisted);
    if (!list.length) return hooks.toast('Chưa chọn sản phẩm đang bán nào', 'error');
    hooks.onFlashSale(list);
  };

  await loadCache();
  await loadMediaCache();
  render();
}
