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
  $('#btnClone').disabled = !has || busy;
  if (!has) {
    $('#productEmpty').innerHTML = currentItemId
      ? `Chưa có dữ liệu sản phẩm <b>${currentItemId}</b>. Hãy bấm <b>F5</b> trang sản phẩm trên shopee.vn.`
      : 'Mở một trang sản phẩm trên <b>shopee.vn</b> (nếu đã mở thì bấm F5) để lấy dữ liệu.';
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
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const blob = await r.blob();
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}

async function openAi(target, auto = false) {
  if (!current) return log('Chưa có sản phẩm nguồn.', 'err');
  const buttons = ['#btnGemini', '#btnChatGpt', '#btnAuto'].map((s) => $(s));
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

function renderCover() {
  const ok = coverMatches();
  $('#coverBox').hidden = !ok;
  $('#coverEmpty').hidden = ok;
  $('#btnClearCover').hidden = !ok;
  if (ok) $('#coverImg').src = aiCover.dataUrl;
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

// ---------- Sao chép ----------

async function runClone() {
  if (busy || !current) return;
  busy = true;
  $('#btnClone').disabled = true;
  try {
    const { productId } = await cloneProduct(current, opts, {
      coverDataUrl: coverMatches() ? aiCover.dataUrl : null,
      log
    });
    log(`✔ Sao chép thành công! ID sản phẩm mới: ${productId}`, 'ok');
    chrome.tabs.create({ url: `https://banhang.shopee.vn/portal/product/${productId}`, active: false });
  } catch (e) {
    log('✖ ' + e.message, 'err');
  } finally {
    busy = false;
    $('#btnClone').disabled = !current;
  }
}

// ---------- Khởi động ----------

async function init() {
  await loadOptions();
  await loadCover();
  await detectFromActiveTab();
  checkShop();
  checkAutoFlow();

  $('#btnClone').addEventListener('click', runClone);
  $('#btnDlAll').addEventListener('click', downloadAllMedia);
  $('#btnScan').addEventListener('click', runScan);
  $('#reloadShop').addEventListener('click', (e) => { e.preventDefault(); loadShop(true); });
  $('#btnToggleMedia').addEventListener('click', () => {
    const collapsed = $('#mediaGrid').classList.toggle('collapsed');
    $('#btnToggleMedia').textContent = collapsed ? 'Mở rộng' : 'Thu gọn';
  });
  $('#btnGemini').addEventListener('click', () => openAi('gemini'));
  $('#btnChatGpt').addEventListener('click', () => openAi('chatgpt'));
  $('#btnAuto').addEventListener('click', () => openAi('gemini', true));
  $('#resetPrompt').addEventListener('click', (e) => {
    e.preventDefault();
    opts.aiPrompt = DEFAULT_PROMPT;
    document.querySelector('[data-opt="aiPrompt"]').value = DEFAULT_PROMPT;
    chrome.storage.local.set({ [OPTS_KEY]: opts });
  });
  $('#btnPickCover').addEventListener('click', () => $('#coverFile').click());
  $('#coverFile').addEventListener('change', () => {
    const file = $('#coverFile').files[0];
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => {
      chrome.storage.local.set({
        aiCoverImage: { dataUrl: fr.result, timestamp: Date.now(), source: 'file', productId: current ? current.itemId : '' }
      });
    };
    fr.readAsDataURL(file);
    $('#coverFile').value = '';
  });
  $('#btnClearCover').addEventListener('click', () => chrome.storage.local.remove('aiCoverImage'));

  chrome.tabs.onActivated.addListener(detectFromActiveTab);
  chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (tab.active && (info.url || info.status === 'complete')) detectFromActiveTab();
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes.sclProducts && currentItemId) setCurrentItem(currentItemId);
    if (changes.sclLastItemId && !current) detectFromActiveTab();
    if (changes.aiCoverImage) loadCover().then(checkAutoFlow);
    const st = changes.aiStatus && changes.aiStatus.newValue;
    if (st && st.ts > lastAiStatusTs) {
      lastAiStatusTs = st.ts;
      log('AI: ' + st.text, st.error ? 'err' : '');
    }
  });
}

init();
