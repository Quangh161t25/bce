import { getShopInfo } from './shopee-api.js';
import { normalizeSource, cloneProduct, applyPrice, imgUrl, loadShopSettings } from './clone.js';
import { scanStock } from './scan.js';

const OPTS_KEY = 'cloneOptions';
const DEFAULT_PROMPT = 'thay ảnh 2 vào ảnh 1 . thay thế tên sản phẩm + model+ đặc điểm + ảnh minh họa bên dưới phù hợp với sản phẩm + slogan+ {ten_sp}';
const DEFAULT_OPTS = {
  weight: 5000,
  stock: 1000,
  expiryDays: 365,
  priceChange: '',
  phone: '',
  titlePrefix: '',
  titleSuffix: '',
  modelSku: '',
  parentSku: '',
  useCaiDatCover: true,
  enableAiCover: false,
  aiProvider: 'gemini',
  dropCover: true,
  usePriceBefore: false,
  skipDuplicate: true,
  keepStock: false,
  copyVideo: false,
  descImages: true,
  unlisted: false,
  templateId: '',
  descPrefix: '',
  descSuffix: '',
  selectedChannels: null,
  selectedLocations: null,
  aiImage1: '',
  aiPrompt: DEFAULT_PROMPT
};
const AUTO_FLOW_TTL = 15 * 60 * 1000;
const AI_TARGETS = {
  gemini: 'https://gemini.google.com/app',
  chatgpt: 'https://chatgpt.com/'
};

const $ = (s) => document.querySelector(s);
const fmtMoney = (v) => (v ? Number(v).toLocaleString('vi-VN') + 'đ' : '');

let opts = { ...DEFAULT_OPTS };
let current = null; // sản phẩm nguồn đã chuẩn hoá
let currentItemId = '';
let aiImageIndex = 0;
let aiCover = null;
let busy = false;
let lastAiStatusTs = 0;
let aiWatchdog = null;
let currentMaGian = '';
let currentModelSkus = {};
let caiDatCoverUrl = '';
let cachedCaiDatRows = null;

// ---------- Nhật ký ----------

function log(text, type = '') {
  const el = document.createElement('div');
  el.className = type;
  el.textContent = `${new Date().toLocaleTimeString('vi-VN')}  ${text}`;
  $('#log').prepend(el);
}

// ---------- Tuỳ chọn ----------

async function loadOptions() {
  const { [OPTS_KEY]: saved } = await chrome.storage.local.get(OPTS_KEY);
  opts = { ...DEFAULT_OPTS, ...(saved || {}) };
  document.querySelectorAll('[data-opt]').forEach((el) => {
    const key = el.dataset.opt;
    if (el.type === 'checkbox') el.checked = !!opts[key];
    else el.value = opts[key] ?? '';
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => {
      opts[key] = el.type === 'checkbox' ? el.checked : el.type === 'number' ? Number(el.value) : el.value;
      chrome.storage.local.set({ [OPTS_KEY]: opts });
      if (key === 'priceChange' || key === 'usePriceBefore') renderPrices();
      if (key === 'aiImage1') renderAiImages();
      if (key === 'useCaiDatCover') renderCover();
      if (key === 'enableAiCover') {
        updateCloneButtonUI();
        renderCover();
      }
    });
  });
}

// ---------- Shop ----------

async function checkShop() {
  const pill = $('#shopStatus');
  try {
    const info = await getShopInfo();
    pill.textContent = `Shop: ${info.name || info.shopId}`;
    pill.className = 'pill ok';
    loadShop();
  } catch (e) {
    pill.textContent = 'Chưa đăng nhập Kênh Người Bán';
    pill.title = e.message;
    pill.className = 'pill err';
  }
}

// ---------- Vận chuyển & Kho ----------

function renderChips(boxSel, items, selectedKey, idOf, labelOf, emptyText) {
  const box = $(boxSel);
  box.innerHTML = '';
  if (!items.length) {
    box.innerHTML = `<span class="hint small">${emptyText}</span>`;
    return;
  }
  const selected = Array.isArray(opts[selectedKey]) ? opts[selectedKey].map(String) : null;
  items.forEach((it) => {
    const id = String(idOf(it));
    const label = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = selected ? selected.includes(id) : !it.off;
    cb.addEventListener('change', () => {
      opts[selectedKey] = [...box.querySelectorAll('input')].filter((x) => x.checked).map((x) => x.value);
      chrome.storage.local.set({ [OPTS_KEY]: opts });
    });
    cb.value = id;
    label.append(cb, document.createTextNode(' ' + labelOf(it)));
    label.title = `ID: ${id}`;
    box.appendChild(label);
  });
}

async function loadShop(force = false) {
  $('#channelList').innerHTML = '<span class="hint small">Đang tải...</span>';
  $('#locationList').innerHTML = '<span class="hint small">Đang tải...</span>';
  try {
    const settings = await loadShopSettings({ templateId: opts.templateId, force });
    renderChips('#channelList', settings.channels, 'selectedChannels', (c) => c.channelid,
      (c) => c._name || `Kênh ${c.channelid}`, 'Không có');
    renderChips('#locationList', settings.locations, 'selectedLocations', (l) => l.id,
      (l) => l.name || l.id, 'Shop dùng 1 kho mặc định');
  } catch (e) {
    $('#channelList').innerHTML = '';
    $('#channelList').append(Object.assign(document.createElement('span'), { className: 'hint small', textContent: e.message }));
    $('#locationList').innerHTML = '';
  }
}

// ---------- Quét tồn kho ----------

function renderScanButton() {
  const btn = $('#btnScan');
  if (!current) {
    btn.textContent = 'Quét tồn kho (0/0)';
    btn.disabled = true;
    return;
  }
  const total = current.tiers.length ? current.models.length : 1;
  btn.textContent = `Quét tồn kho (${current.stockScanned}/${total})`;
  btn.disabled = busy;
}

async function runScan() {
  if (!current) return;
  const btn = $('#btnScan');
  btn.disabled = true;
  btn.textContent = 'Đang quét...';
  try {
    const { sclProducts } = await chrome.storage.local.get('sclProducts');
    const record = sclProducts && sclProducts[current.itemId];
    if (!record) throw new Error('Chưa có dữ liệu sản phẩm, hãy F5 trang sản phẩm.');
    const { scanned, total } = await scanStock(record, current);
    log(`Quét tồn kho: đọc được ${scanned}/${total} phân loại.`, scanned ? 'ok' : 'warn');
    if (scanned) {
      opts.keepStock = true;
      document.querySelector('[data-opt="keepStock"]').checked = true;
      chrome.storage.local.set({ [OPTS_KEY]: opts });
    }
  } catch (e) {
    log('Quét tồn kho lỗi: ' + e.message, 'err');
  } finally {
    await setCurrentItem(currentItemId);
  }
}

// ---------- Sản phẩm nguồn ----------

const parseShopeeUrl = (url) => {
  const u = String(url || '');
  if (!/^https:\/\/shopee\.vn\//.test(u)) return null;
  let m = u.match(/-i\.(\d+)\.(\d+)/);
  if (m) return { shopId: m[1], itemId: m[2] };
  m = u.match(/\/product\/(\d+)\/(\d+)/);
  if (m) return { shopId: m[1], itemId: m[2] };
  return null;
};

async function setCurrentItem(itemId) {
  const { sclProducts } = await chrome.storage.local.get('sclProducts');
  const rec = sclProducts && sclProducts[itemId];
  if (itemId !== currentItemId) aiImageIndex = 0;
  currentItemId = itemId || '';
  current = rec ? normalizeSource(rec) : null;
  renderProduct();
}

async function detectFromActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const parsed = tab && parseShopeeUrl(tab.url);
  if (parsed) {
    await setCurrentItem(parsed.itemId);
  } else if (!currentItemId) {
    const { sclLastItemId } = await chrome.storage.local.get('sclLastItemId');
    if (sclLastItemId) await setCurrentItem(sclLastItemId);
  }
}

function renderPrices() {
  if (!current) {
    $('#priceNow').value = '';
    $('#priceAfter').value = '';
    return;
  }
  const lo = opts.usePriceBefore && current.priceBefore ? current.priceBefore : current.price;
  const hi = current.priceMax || lo;
  const range = (a, b) => (!b || a === b ? fmtMoney(a) : `${fmtMoney(a)} - ${fmtMoney(b)}`);
  $('#priceNow').value = range(lo, hi);
  $('#priceAfter').value = range(applyPrice(lo, opts.priceChange), applyPrice(hi, opts.priceChange));
}

function renderProduct() {
  const has = !!current;
  $('#productEmpty').hidden = has;
  $('#productBox').hidden = !has;
  updateCloneButtonUI();
  if (!has) {
    $('#productEmpty').innerHTML = currentItemId
      ? `Chưa có dữ liệu sản phẩm <b>${currentItemId}</b>. Hãy bấm <b>F5</b> trang sản phẩm trên shopee.vn.<br><br><button id="btnFetchActiveTab" style="display:inline-flex; align-items:center; gap:6px; padding:6px 14px; font-size:12px; background:#ea580c; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold; box-shadow:0 2px 4px rgba(234,88,12,0.3);">🔄 Bấm để tải lại trang Shopee & lấy dữ liệu</button>`
      : 'Mở một trang sản phẩm trên <b>shopee.vn</b> (nếu đã mở thì bấm F5) để lấy dữ liệu.';
    const fBtn = $('#btnFetchActiveTab');
    if (fBtn) {
      fBtn.onclick = async () => {
        fBtn.disabled = true;
        fBtn.textContent = '⏳ Đang tải lại...';
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.id) {
          chrome.tabs.reload(tab.id);
        }
      };
    }
  } else {
    $('#pImage').src = imgUrl(current.images[0]);
    $('#pName').textContent = current.name;
    const variants = current.tiers.length ? `${current.models.length} phân loại` : 'Không phân loại';
    const warn = current.categories.length ? '' : ' · ⚠ thiếu ngành hàng';
    $('#pMeta').textContent = `ID ${current.itemId} · ${current.images.length} ảnh · ${variants}${warn}`;
  }
  renderPrices();
  renderAiImages();
  renderCover();
  renderMedia();
  renderScanButton();
  renderVariations();
}

// ---------- Danh sách phân loại & Điền chi tiết SKU ----------

function getModelDisplayName(m, tiers) {
  if (m.name && m.name.trim()) return m.name.trim();
  if (tiers && tiers.length) {
    const parts = (m.tierIndex || []).map((ti, gi) => {
      return (tiers[gi] && tiers[gi].options && tiers[gi].options[ti]) || '';
    }).filter(Boolean);
    if (parts.length) return parts.join(' - ');
  }
  return `Phân loại ${(m.tierIndex || []).join('-') || '1'}`;
}

function getModelImage(m, tiers) {
  if (tiers && tiers[0] && Array.isArray(tiers[0].images) && m.tierIndex && m.tierIndex.length > 0) {
    const id = tiers[0].images[m.tierIndex[0]];
    if (id) return imgUrl(id);
  }
  return '';
}

async function renderVariations() {
  const section = $('#variationSection');
  const countEl = $('#varCount');
  const listEl = $('#variationList');
  if (!section || !listEl) return;

  const hasVariants = Boolean(current && current.tiers && current.tiers.length > 0 && current.models && current.models.length > 0);
  section.hidden = !hasVariants;
  if (!hasVariants) {
    listEl.innerHTML = '';
    return;
  }

  const storageKey = `modelSkus_${current.itemId}`;
  const saved = await chrome.storage.local.get(storageKey);
  currentModelSkus = saved[storageKey] || opts.modelSkus || {};

  const models = current.models;
  if (countEl) countEl.textContent = String(models.length);

  listEl.innerHTML = '';
  models.forEach((m) => {
    const key = m.tierIndex.join('-');
    const name = getModelDisplayName(m, current.tiers);
    const img = getModelImage(m, current.tiers);
    const priceVal = applyPrice(m.price, opts.priceChange) || m.price;
    const priceStr = priceVal ? fmtMoney(priceVal) : '';
    const stockStr = m.stock != null ? String(m.stock) : '0';
    const val = currentModelSkus[key] || '';

    const row = document.createElement('div');
    row.className = 'var-row';
    row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid #f1f5f9; gap: 8px;';

    const leftBox = document.createElement('div');
    leftBox.style.cssText = 'display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;';

    if (img) {
      const im = document.createElement('img');
      im.src = img + '_tn';
      im.alt = '';
      im.style.cssText = 'width: 32px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0; flex-shrink: 0;';
      leftBox.appendChild(im);
    } else {
      const placeholder = document.createElement('div');
      placeholder.style.cssText = 'width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 14px; flex-shrink: 0;';
      placeholder.textContent = '🏷️';
      leftBox.appendChild(placeholder);
    }

    const infoBox = document.createElement('div');
    infoBox.style.cssText = 'min-width: 0; flex: 1;';

    const nameEl = document.createElement('div');
    nameEl.style.cssText = 'font-weight: 600; font-size: 11px; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
    nameEl.textContent = name;
    nameEl.title = name;

    const metaEl = document.createElement('div');
    metaEl.style.cssText = 'font-size: 10px; color: #64748b;';
    metaEl.textContent = `${priceStr} · Kho: ${stockStr}`;

    infoBox.appendChild(nameEl);
    infoBox.appendChild(metaEl);
    leftBox.appendChild(infoBox);

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'var-sku-input';
    input.dataset.key = key;
    input.placeholder = `SKU ${name}...`;
    input.value = val;
    input.style.cssText = 'width: 150px; margin: 0; padding: 4px 6px; font-size: 11px; font-weight: bold; border: 1px solid #cbd5e1; border-radius: 4px; background: #fff;';
    input.addEventListener('input', () => {
      currentModelSkus[key] = input.value.trim();
      opts.modelSkus = currentModelSkus;
      if (current) {
        chrome.storage.local.set({ [`modelSkus_${current.itemId}`]: currentModelSkus });
      }
    });

    row.appendChild(leftBox);
    row.appendChild(input);
    listEl.appendChild(row);
  });
}

// ---------- Ảnh & Video của sản phẩm nguồn ----------

const fileSlug = (s) => String(s || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd')
  .replace(/[^\w]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60) || 'file';

async function downloadUrl(url, fileName) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const blob = await r.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}

const MEDIA_GROUPS = [
  ['main', '📷 Ảnh sản phẩm', 'anh'],
  ['variation', '🎨 Phân loại', 'phan_loai'],
  ['description', '📝 Mô tả', 'mo_ta'],
  ['video', '🎬 Video', 'video']
];

const mediaFileName = (m, i) => {
  const prefix = (MEDIA_GROUPS.find((g) => g[0] === m.group) || [])[2] || 'file';
  return `${fileSlug(current.name)}_${prefix}_${String(i + 1).padStart(2, '0')}_${fileSlug(m.label)}.${m.type === 'video' ? 'mp4' : 'jpg'}`;
};

function mediaItem(m, i) {
  const box = document.createElement('div');
  box.className = 'media-item';
  let el;
  if (m.type === 'video') {
    el = document.createElement('video');
    el.src = m.url;
    el.controls = true;
    el.preload = 'metadata';
    if (m.thumb) el.poster = m.thumb;
  } else {
    el = document.createElement('img');
    el.src = m.url + '_tn';
    el.loading = 'lazy';
    el.title = 'Bấm để xem ảnh gốc';
    el.addEventListener('click', () => chrome.tabs.create({ url: m.url }));
  }
  const cap = document.createElement('div');
  cap.className = 'cap';
  cap.textContent = m.label;
  cap.title = m.label;
  const acts = document.createElement('div');
  acts.className = 'acts';
  const open = document.createElement('a');
  open.textContent = 'Mở';
  open.addEventListener('click', () => chrome.tabs.create({ url: m.url }));
  const dl = document.createElement('a');
  dl.textContent = 'Tải';
  dl.addEventListener('click', () => downloadUrl(m.url, mediaFileName(m, i)).catch((e) => log(`Không tải được ${m.label}: ${e.message}`, 'err')));
  acts.append(open, dl);
  box.append(el, cap, acts);
  return box;
}

function renderMedia() {
  const media = (current && current.media) || [];
  $('#mediaCard').hidden = !media.length;
  if (!media.length) return;
  const nImg = media.filter((m) => m.type === 'image').length;
  const nVid = media.length - nImg;
  $('#mediaCount').textContent = `(${nImg} ảnh${nVid ? `, ${nVid} video` : ''})`;

  const container = $('#mediaGrid');
  container.innerHTML = '';
  MEDIA_GROUPS.forEach(([key, title]) => {
    const items = media.filter((m) => m.group === key);
    if (!items.length) return;
    const group = document.createElement('div');
    group.className = 'media-group';
    const head = document.createElement('div');
    head.className = 'media-group-head';
    const label = document.createElement('span');
    label.textContent = `${title} (${items.length})`;
    const dlGroup = document.createElement('a');
    dlGroup.textContent = '⬇ Tải nhóm này';
    dlGroup.addEventListener('click', () => downloadAllMedia(items, dlGroup));
    head.append(label, dlGroup);
    const grid = document.createElement('div');
    grid.className = 'media-grid';
    items.forEach((m, i) => grid.appendChild(mediaItem(m, i)));
    group.append(head, grid);
    container.appendChild(group);
  });
}

async function downloadAllMedia(list = null, btnEl = null) {
  const media = list || (current && current.media) || [];
  if (!media.length) return;
  const btn = btnEl || $('#btnDlAll');
  if (btn.dataset.busy) return;
  btn.dataset.busy = '1';
  const btnText = btn.textContent;
  btn.disabled = true;
  let ok = 0;
  for (let i = 0; i < media.length; i++) {
    btn.textContent = `Đang tải ${i + 1}/${media.length}...`;
    try {
      await downloadUrl(media[i].url, mediaFileName(media[i], i));
      ok++;
    } catch (e) {
      log(`Không tải được ${media[i].label}: ${e.message}`, 'err');
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  btn.textContent = btnText;
  btn.disabled = false;
  delete btn.dataset.busy;
  log(`Đã tải ${ok}/${media.length} file ảnh/video.`, ok === media.length ? 'ok' : 'warn');
}

// ---------- AI ảnh bìa ----------

function renderAiImages() {
  const url1 = String(opts.aiImage1 || '').trim();
  $('#aiImg1').hidden = !url1;
  $('#aiImg1Empty').hidden = !!url1;
  if (url1) $('#aiImg1').src = url1;

  const imgs = current ? current.images : [];
  if (aiImageIndex >= imgs.length) aiImageIndex = 0;
  const url2 = imgs.length ? imgUrl(imgs[aiImageIndex]) : '';
  $('#aiImg2').hidden = !url2;
  $('#aiImg2Empty').hidden = !!url2;
  if (url2) $('#aiImg2').src = url2;

  const thumbs = $('#aiThumbs');
  thumbs.innerHTML = '';
  if (imgs.length > 1) {
    imgs.forEach((id, i) => {
      const im = document.createElement('img');
      im.src = imgUrl(id) + '_tn';
      im.title = `Chọn ảnh ${i + 1} làm ảnh 2`;
      if (i === aiImageIndex) im.className = 'sel';
      im.addEventListener('click', () => {
        aiImageIndex = i;
        renderAiImages();
      });
      thumbs.appendChild(im);
    });
  }
}

async function urlToDataUrl(url) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const blob = await r.blob();
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(blob);
    });
  } catch (err) {
    try {
      const res = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'sclFetchImageDataUrl', url }, (r) => {
          if (chrome.runtime.lastError || !r || !r.dataUrl) resolve(null);
          else resolve(r.dataUrl);
        });
      });
      if (res) return res;
    } catch (_) {}
    throw err;
  }
}

async function openAi(target, auto = false) {
  if (!current) return log('Chưa có sản phẩm nguồn.', 'err');
  const buttons = ['#btnAuto', '#btnOpenAi'].map((s) => $(s)).filter(Boolean);
  buttons.forEach((b) => { b.disabled = true; });
  try {
    const images = [];
    const url1 = String(opts.aiImage1 || '').trim();
    if (url1) {
      try {
        images.push({ name: '1_anh_mau.jpg', dataUrl: await urlToDataUrl(url1) });
      } catch (e) {
        log('Không tải được ảnh 1 từ link: ' + e.message, 'warn');
      }
    } else {
      log('Chưa có link ảnh 1, chỉ gửi ảnh sản phẩm.', 'warn');
    }
    try {
      images.push({ name: '2_anh_san_pham.jpg', dataUrl: await urlToDataUrl(imgUrl(current.images[aiImageIndex])) });
    } catch (e) {
      log('Không tải được ảnh sản phẩm: ' + e.message, 'warn');
    }

    const prompt = String(opts.aiPrompt || DEFAULT_PROMPT).replace(/\{ten_sp\}/g, current.name).trim();
    try { await navigator.clipboard.writeText(prompt); } catch (e) { /* không bắt buộc */ }

    // Mở tab trước để gắn lệnh với đúng tab này (tab AI cũ đang mở sẽ không giành lệnh)
    const tab = await chrome.tabs.create({ url: AI_TARGETS[target] });
    await chrome.storage.local.set({
      pendingAiPayload: { target, prompt, images, timestamp: Date.now(), autoSend: !!auto, tabId: tab.id },
      aiLastProductId: current.itemId,
      aiAutoFlow: auto ? { productId: current.itemId, timestamp: Date.now() } : null
    });
    lastAiStatusTs = 0;
    clearTimeout(aiWatchdog);
    aiWatchdog = setTimeout(() => {
      if (!lastAiStatusTs) log('Chưa thấy phản hồi từ trang AI sau 60 giây. Kiểm tra tab AI: đã đăng nhập chưa? Thử F5 tab đó.', 'warn');
    }, 60000);
    log(auto
      ? 'Đang chạy tự động: mở Gemini → gửi → chờ ảnh → sao chép. Đừng đóng Side Panel!'
      : `Đã mở ${target === 'chatgpt' ? 'ChatGPT' : 'Gemini'} và điền sẵn ảnh + prompt.`);
  } catch (e) {
    log('Lỗi mở AI: ' + e.message, 'err');
  } finally {
    buttons.forEach((b) => { b.disabled = false; });
  }
}

const coverMatches = () => !!(aiCover && aiCover.dataUrl && current
  && (!aiCover.productId || String(aiCover.productId) === current.itemId));

function normalizeImageUrl(url) {
  if (!url) return '';
  url = String(url).trim();
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && (url.includes('drive.google.com') || url.includes('docs.google.com'))) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return url;
}

function parseCaiDatRows(rows, targetGian) {
  if (!rows || rows.length <= 1) return { coverUrl: '', gianList: [] };
  const headers = (rows[0] || []).map((h) => String(h || '').trim().toLowerCase());

  let gianIdx = headers.findIndex((h) => h === 'gian' || h === 'mã gian' || h === 'ma gian' || h === 'ma_gian' || h === 'magian');
  if (gianIdx === -1) gianIdx = 1;

  let anhIdx = headers.findIndex((h) =>
    h === 'anh_mau' || h === 'anh mau' || h === 'ảnh mẫu' ||
    h === 'anh_bia' || h === 'anh bia' || h === 'ảnh bìa' ||
    h === 'cover' || h.includes('anh_mau') || h.includes('ảnh')
  );
  if (anhIdx === -1) anhIdx = 3;

  const gianList = [];
  let foundCoverUrl = '';
  const cleanTarget = String(targetGian || '').trim().toLowerCase();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] || [];
    const g = String(row[gianIdx] || '').trim();
    if (g && !gianList.includes(g)) gianList.push(g);

    if (cleanTarget && g.toLowerCase() === cleanTarget && !foundCoverUrl) {
      const rawImg = String(row[anhIdx] || '').trim();
      if (rawImg) {
        const firstUrl = rawImg.split(/[\r\n,;|]+/)[0].trim();
        if (firstUrl) foundCoverUrl = normalizeImageUrl(firstUrl);
      }
    }
  }

  if (!foundCoverUrl && !cleanTarget) {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] || [];
      const rawImg = String(row[anhIdx] || '').trim();
      if (rawImg) {
        const firstUrl = rawImg.split(/[\r\n,;|]+/)[0].trim();
        if (firstUrl) {
          foundCoverUrl = normalizeImageUrl(firstUrl);
          break;
        }
      }
    }
  }

  return { coverUrl: foundCoverUrl, gianList };
}

async function loadCaiDatCover(gian = currentMaGian, forceReload = false) {
  const statusEl = $('#caiDatCoverStatus');
  if (statusEl) statusEl.innerHTML = '<span class="hint">⏳ Đang đọc Cột D...</span>';

  try {
    if (!cachedCaiDatRows || forceReload) {
      const res = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ type: 'FETCH_CAI_DAT' }, resolve);
      });
      if (res && res.ok && Array.isArray(res.values)) {
        cachedCaiDatRows = res.values;
      }
    }

    const { coverUrl, gianList } = parseCaiDatRows(cachedCaiDatRows, gian);

    const dl = $('#cloneMaGianList');
    if (dl && gianList.length > 0) {
      dl.innerHTML = gianList.map((g) => `<option value="${g}"></option>`).join('');
    }

    caiDatCoverUrl = coverUrl;

    if (coverUrl) {
      if (statusEl) {
        statusEl.innerHTML = `<span class="green-t" title="${coverUrl}">✔ Ảnh mẫu Cột D (${gian || 'mặc định'}): <a href="${coverUrl}" target="_blank" style="color: var(--green); text-decoration: underline;">Xem</a></span>`;
      }
      // Tự động điền link Cột D vào Ảnh 1 (Ảnh mẫu) cho AI
      opts.aiImage1 = coverUrl;
      const inpAi1 = $('[data-opt="aiImage1"]');
      if (inpAi1) inpAi1.value = coverUrl;
      chrome.storage.local.set({ [OPTS_KEY]: opts });
      renderAiImages();
    } else {
      if (statusEl) {
        statusEl.innerHTML = gian
          ? `<span class="hint" style="color: #ea580c;">⚠ Chưa có ảnh Cột D cho gian "${gian}"</span>`
          : '<span class="hint">Chưa chọn mã gian</span>';
      }
    }

    renderCover();
  } catch (err) {
    console.warn('Lỗi loadCaiDatCover:', err);
    if (statusEl) statusEl.innerHTML = `<span class="hint" style="color: #ef4444;">Lỗi đọc Sheet: ${err.message}</span>`;
  }
}

function renderCover() {
  const isAiCover = coverMatches();
  const coverTextEl = $('#coverText');
  if (isAiCover) {
    $('#coverBox').hidden = false;
    $('#coverEmpty').hidden = true;
    $('#btnClearCover').hidden = false;
    $('#coverImg').src = aiCover.dataUrl;
    if (coverTextEl) coverTextEl.textContent = '✔ Ảnh này (tạo từ AI) sẽ làm ảnh bìa khi sao chép sang Shopee';
  } else {
    $('#coverBox').hidden = true;
    $('#coverEmpty').hidden = false;
    $('#btnClearCover').hidden = true;
  }
  updateCloneButtonUI();
}

async function loadCover() {
  const { aiCoverImage } = await chrome.storage.local.get('aiCoverImage');
  aiCover = aiCoverImage && aiCoverImage.dataUrl ? aiCoverImage : null;
  renderCover();
}

// Nút "⚡ Tự động": khi Gemini gửi ảnh bìa về thì tự sao chép.
async function checkAutoFlow() {
  const { aiAutoFlow: flow } = await chrome.storage.local.get('aiAutoFlow');
  if (!flow || !aiCover) return;
  if (Date.now() - flow.timestamp > AUTO_FLOW_TTL) {
    await chrome.storage.local.remove('aiAutoFlow');
    return;
  }
  if (aiCover.timestamp < flow.timestamp || String(aiCover.productId) !== String(flow.productId)) return;
  if (!current || current.itemId !== String(flow.productId)) await setCurrentItem(String(flow.productId));
  if (!current) return;
  await chrome.storage.local.remove('aiAutoFlow');
  log('Đã có ảnh bìa mới từ Gemini, tự động sao chép sang Shopee...', 'ok');
  setTimeout(runClone, 800);
}

// ---------- Cập nhật nút Sao chép & Điều hướng AI / Đăng ngay ----------

function updateCloneButtonUI() {
  const btn = $('#btnClone');
  if (!btn) return;
  if (!current) {
    btn.disabled = true;
    btn.textContent = 'Sao chép sang Shopee';
    btn.title = 'Mở một trang sản phẩm trên shopee.vn để sao chép';
    btn.style.background = '';
    return;
  }
  if (busy) {
    btn.disabled = true;
    return;
  }
  btn.disabled = false;
  if (opts.enableAiCover) {
    if (coverMatches()) {
      btn.textContent = '✔ Sao chép sang Shopee (đã có ảnh bìa AI)';
      btn.title = 'Đã có ảnh bìa AI sẵn sàng: Bấm để đăng sản phẩm sang Shopee ngay';
      btn.style.background = '';
    } else {
      const pName = (opts.aiProvider || 'gemini') === 'chatgpt' ? 'ChatGPT' : 'Gemini';
      btn.textContent = '🪄 Tạo ảnh ' + pName + ' & Đăng Shopee';
      btn.title = 'Đang bật Tạo ảnh AI: Bấm để mở ' + pName + ' tự tạo ảnh bìa rồi tự động đăng sản phẩm sang Shopee';
      btn.style.background = (opts.aiProvider || 'gemini') === 'chatgpt' ? 'linear-gradient(135deg, #10a37f, #059669)' : 'linear-gradient(135deg, #2563eb, #7c3aed)';
    }
  } else {
    btn.textContent = '⚡ Đăng ngay sang Shopee';
    btn.title = 'Không bật Tạo ảnh AI: Bấm để đăng sản phẩm ngay sang Shopee (dùng ảnh Cột D / ảnh sẵn có)';
    btn.style.background = '';
  }
}

async function handleCloneClick() {
  if (busy || !current) return;

  // Nếu có tích chọn tạo ảnh AI VÀ chưa có ảnh AI hợp lệ cho sản phẩm này:
  if (opts.enableAiCover && !coverMatches()) {
    const targetAi = opts.aiProvider || 'gemini';
    const pName = targetAi === 'chatgpt' ? 'ChatGPT' : 'Gemini';
    log('Đang bật Tạo ảnh AI: Mở ' + pName + ' để tự động tạo ảnh bìa...', 'ok');
    const btn = $('#btnClone');
    if (btn) {
      btn.textContent = '⏳ Đang chờ tạo ảnh AI...';
      btn.disabled = true;
    }
    try {
      await openAi(targetAi, true);
    } catch (e) {
      log('Lỗi mở AI: ' + e.message, 'err');
      updateCloneButtonUI();
    }
    return;
  }

  // Nếu không tích chọn tạo ảnh AI (hoặc đã có sẵn ảnh bìa AI):
  // TỰ ĐĂNG LÊN LUÔN!
  await runClone();
}

// ---------- Sao chép ----------

async function runClone() {
  if (busy || !current) return;
  busy = true;
  $('#btnClone').disabled = true;
  $('#btnClone').textContent = '⏳ Đang đăng sản phẩm lên Shopee...';
  try {
    opts.modelSkus = currentModelSkus;
    const coverDataUrl = coverMatches() ? aiCover.dataUrl : null;

    const { productId } = await cloneProduct(current, opts, {
      coverDataUrl,
      log
    });
    log(`✔ Sao chép thành công! ID sản phẩm mới: ${productId}`, 'ok');
    chrome.tabs.create({ url: `https://banhang.shopee.vn/portal/product/${productId}`, active: false });
  } catch (e) {
    log('✖ ' + e.message, 'err');
  } finally {
    busy = false;
    updateCloneButtonUI();
  }
}

// ---------- Khởi động ----------

async function init() {
  await loadOptions();
  await loadCover();
  await detectFromActiveTab();
  checkShop();
  checkAutoFlow();
  updateCloneButtonUI();

  // Đọc mã gian từ chrome.storage.local và đồng bộ ô mã gian
  try {
    const storageGian = await chrome.storage.local.get(['maGian', 'dhHoanTextValue']);
    currentMaGian = String(storageGian.maGian || storageGian.dhHoanTextValue || '').trim();
    const maGianInput = $('#cloneMaGian');
    if (maGianInput) {
      maGianInput.value = currentMaGian;
      let debounceTimer = null;
      maGianInput.addEventListener('input', () => {
        currentMaGian = maGianInput.value.trim();
        chrome.storage.local.set({ maGian: currentMaGian, dhHoanTextValue: currentMaGian });
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          loadCaiDatCover(currentMaGian);
        }, 400);
      });
    }
    await loadCaiDatCover(currentMaGian);
  } catch (err) {
    console.warn('Lỗi khởi tạo mã gian:', err);
  }

  $('#btnClone')?.addEventListener('click', handleCloneClick);
  $('#btnDlAll')?.addEventListener('click', downloadAllMedia);
  $('#btnScan')?.addEventListener('click', runScan);
  $('#btnAutoFillSku')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!current || !current.models) return;
    const parentSkuVal = String($('#parentSkuInput')?.value || opts.parentSku || current.itemId || '').trim();
    current.models.forEach((m) => {
      const key = m.tierIndex.join('-');
      const name = getModelDisplayName(m, current.tiers);
      const slugName = fileSlug(name);
      const autoSku = parentSkuVal ? `${parentSkuVal}-${slugName}` : slugName;
      currentModelSkus[key] = autoSku;
      const inp = document.querySelector(`.var-sku-input[data-key="${key}"]`);
      if (inp) inp.value = autoSku;
    });
    opts.modelSkus = currentModelSkus;
    if (current) {
      chrome.storage.local.set({ [`modelSkus_${current.itemId}`]: currentModelSkus });
    }
    log('Đã tự động điền SKU cho tất cả phân loại.', 'ok');
  });
  $('#reloadShop')?.addEventListener('click', (e) => { e.preventDefault(); loadShop(true); });
  $('#btnToggleMedia')?.addEventListener('click', () => {
    const collapsed = $('#mediaGrid').classList.toggle('collapsed');
    $('#btnToggleMedia').textContent = collapsed ? 'Mở rộng' : 'Thu gọn';
  });
  // Lựa chọn AI: Gemini hoặc ChatGPT
  const aiRadios = document.querySelectorAll('input[name="aiProvider"]');
  aiRadios.forEach((r) => {
    r.checked = (r.value === (opts.aiProvider || 'gemini'));
    r.addEventListener('change', () => {
      if (r.checked) {
        opts.aiProvider = r.value;
        chrome.storage.local.set({ [OPTS_KEY]: opts });
        updateCloneButtonUI();
        log('Đã chọn dùng AI: ' + (r.value === 'chatgpt' ? 'ChatGPT' : 'Gemini'), 'ok');
      }
    });
  });

  const getActiveAiTarget = () => {
    const checked = document.querySelector('input[name="aiProvider"]:checked');
    return (checked ? checked.value : opts.aiProvider) || 'gemini';
  };
  $('#btnOpenAi')?.addEventListener('click', () => openAi(getActiveAiTarget(), false));
  $('#btnAuto')?.addEventListener('click', () => openAi(getActiveAiTarget(), true));
  $('#resetPrompt')?.addEventListener('click', (e) => {
    e.preventDefault();
    opts.aiPrompt = DEFAULT_PROMPT;
    document.querySelector('[data-opt="aiPrompt"]').value = DEFAULT_PROMPT;
    chrome.storage.local.set({ [OPTS_KEY]: opts });
  });
  function setCoverImageFromFile(file, source = 'file') {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      log('Chỉ chấp nhận file định dạng hình ảnh (PNG, JPG, WEBP)!', 'warn');
      return;
    }
    const fr = new FileReader();
    fr.onload = () => {
      chrome.storage.local.set({
        aiCoverImage: {
          dataUrl: fr.result,
          timestamp: Date.now(),
          source: source,
          productId: current ? current.itemId : ''
        }
      });
      const sourceLabel = source === 'paste' ? 'Dán Ctrl+V' : source === 'drop' ? 'Kéo thả' : 'Từ máy';
      log(`✔ Đã nhận ảnh bìa mới (${sourceLabel})!`, 'ok');
    };
    fr.readAsDataURL(file);
  }

  $('#btnPickCover')?.addEventListener('click', () => $('#coverFile')?.click());
  $('#coverFile')?.addEventListener('change', () => {
    const file = $('#coverFile')?.files?.[0];
    if (file) setCoverImageFromFile(file, 'file');
    if ($('#coverFile')) $('#coverFile').value = '';
  });

  // Kéo thả ảnh vào vùng ảnh bìa
  const coverZone = document.querySelector('.cover') || document.querySelector('#aiCard');
  if (coverZone) {
    ['dragenter', 'dragover'].forEach((name) => {
      coverZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        coverZone.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach((name) => {
      coverZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        coverZone.classList.remove('drag-over');
      });
    });
    coverZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (!dt) return;
      if (dt.files && dt.files.length > 0) {
        setCoverImageFromFile(dt.files[0], 'drop');
      } else {
        const html = dt.getData('text/html');
        const srcMatch = html && html.match(/src=["'](.*?)["']/);
        const uri = srcMatch ? srcMatch[1] : (dt.getData('text/uri-list') || dt.getData('text/plain'));
        if (uri && /^https?:\/\//i.test(uri)) {
          log('Đang tải ảnh kéo thả từ liên kết...', 'ok');
          chrome.runtime.sendMessage({ type: 'sclFetchImage', url: uri, source: 'drop' }, (res) => {
            if (res && res.ok) {
              log('✔ Đã đặt ảnh làm ảnh bìa!', 'ok');
            } else {
              log('Không thể tải ảnh từ link kéo thả: ' + (res?.error || 'lỗi'), 'warn');
            }
          });
        }
      }
    });
  }

  // Ctrl+V dán ảnh trực tiếp từ clipboard vào ảnh bìa
  window.addEventListener('paste', (e) => {
    const items = e.clipboardData && e.clipboardData.items;
    if (!items || items.length === 0) return;
    for (const item of items) {
      if (item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          setCoverImageFromFile(file, 'paste');
          break;
        }
      }
    }
  });
  $('#btnClearCover')?.addEventListener('click', () => chrome.storage.local.remove('aiCoverImage'));

  chrome.tabs.onActivated.addListener(detectFromActiveTab);
  chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (tab.active && (info.url || info.status === 'complete')) detectFromActiveTab();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.sclProducts && currentItemId) setCurrentItem(currentItemId);
    if (changes.sclLastItemId && !current) detectFromActiveTab();
    if (changes.aiCoverImage) loadCover().then(checkAutoFlow);
    if (changes.maGian || changes.dhHoanTextValue) {
      const newGian = String((changes.maGian?.newValue ?? changes.dhHoanTextValue?.newValue) || '').trim();
      if (newGian && newGian !== currentMaGian) {
        currentMaGian = newGian;
        const maGianInput = $('#cloneMaGian');
        if (maGianInput) maGianInput.value = newGian;
        loadCaiDatCover(newGian);
      }
    }
    const st = changes.aiStatus && changes.aiStatus.newValue;
    if (st && st.ts > lastAiStatusTs) {
      lastAiStatusTs = st.ts;
      log('AI: ' + st.text, st.error ? 'err' : '');
    }
  });
}

init();
