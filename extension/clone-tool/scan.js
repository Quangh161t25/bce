// "Quét tồn kho": bấm lần lượt từng phân loại trên trang sản phẩm shopee.vn
// và đọc dòng "... sản phẩm có sẵn" mà trang hiển thị.

const SHOPEE_ORIGIN = 'https://shopee.vn';

function waitTabComplete(tabId, timeout = 45000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error('Trang sản phẩm tải quá lâu')); }, timeout);
    function listener(id, info) {
      if (id === tabId && info.status === 'complete') { cleanup(); resolve(); }
    }
    function cleanup() { clearTimeout(timer); chrome.tabs.onUpdated.removeListener(listener); }
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.get(tabId).then((t) => { if (t.status === 'complete') { cleanup(); resolve(); } }).catch(() => {});
  });
}

async function findProductTab(itemId, url) {
  const tabs = await chrome.tabs.query({ url: SHOPEE_ORIGIN + '/*' });
  const re = new RegExp(`(-i\\.\\d+\\.${itemId}\\b|/product/\\d+/${itemId}\\b)`);
  let tab = tabs.find((t) => re.test(t.url || ''));
  if (!tab) {
    if (!url) throw new Error('Không tìm thấy tab sản phẩm trên shopee.vn – hãy mở lại trang sản phẩm.');
    tab = await chrome.tabs.create({ url, active: false });
  }
  await waitTabComplete(tab.id);
  return tab.id;
}

// ---- Chạy trong trang shopee.vn (phải tự chứa) ----
async function scanStockInPage(tiers, combos) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const candidates = () => [...document.querySelectorAll('button, [role="button"], [role="radio"], [aria-label]')];
  const findOption = (label) => {
    const n = norm(label);
    const list = candidates();
    return list.find((b) => norm(b.getAttribute('aria-label')) === n) || list.find((b) => norm(b.textContent) === n) || null;
  };
  const isSelected = (b) => b.getAttribute('aria-checked') === 'true' || b.getAttribute('aria-pressed') === 'true'
    || /(^|[\s-])(selected|active)/i.test(String(b.className));
  const isDisabled = (b) => b.disabled || b.getAttribute('aria-disabled') === 'true' || /disabled/i.test(String(b.className));
  const readStock = () => {
    const t = document.body.innerText;
    const m = t.match(/([\d.,]+)\s*sản phẩm có sẵn/i) || t.match(/còn\s*([\d.,]+)\s*sản phẩm/i) || t.match(/([\d.,]+)\s*pieces? available/i);
    return m ? Number(m[1].replace(/[.,]/g, '')) : null;
  };

  // Chờ trang hiển thị khung chọn số lượng
  for (let i = 0; i < 30 && readStock() === null; i++) await sleep(500);

  if (!combos.length) return { single: readStock(), results: [] };

  const results = [];
  for (const combo of combos) {
    let state = 'ok';
    for (let gi = 0; gi < combo.length; gi++) {
      const btn = findOption(tiers[gi].options[combo[gi]]);
      if (!btn) { state = 'notfound'; break; }
      if (isDisabled(btn)) { state = 'soldout'; break; }
      if (!isSelected(btn)) {
        btn.click();
        await sleep(400);
      }
    }
    if (state === 'notfound') { results.push({ tierIndex: combo, stock: null }); continue; }
    if (state === 'soldout') { results.push({ tierIndex: combo, stock: 0 }); continue; }
    await sleep(500);
    results.push({ tierIndex: combo, stock: readStock() });
  }
  return { single: null, results };
}

/**
 * @param record bản ghi sản phẩm nguồn (sclProducts[itemId])
 * @param src    sản phẩm đã normalizeSource
 * @returns {Promise<{scanned: number, total: number}>}
 */
export async function scanStock(record, src) {
  const tabId = await findProductTab(src.itemId, record.url);
  const tiers = src.tiers.slice(0, 2);
  const combos = tiers.length ? src.models.map((m) => m.tierIndex).filter((t) => t.length === tiers.length) : [];

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId },
    func: scanStockInPage,
    args: [tiers, combos]
  });
  const res = injection && injection.result;
  if (!res) throw new Error('Không chạy được trên trang sản phẩm');

  const scannedStock = {};
  if (!combos.length) {
    if (res.single == null) throw new Error('Không thấy dòng "sản phẩm có sẵn" trên trang – hãy mở trang sản phẩm và đăng nhập shopee.vn.');
    scannedStock.single = res.single;
  } else {
    res.results.forEach((r) => {
      if (r.stock != null) scannedStock[r.tierIndex.join('-')] = r.stock;
    });
  }

  const { sclProducts } = await chrome.storage.local.get('sclProducts');
  const all = sclProducts || {};
  if (all[src.itemId]) {
    all[src.itemId].scannedStock = scannedStock;
    await chrome.storage.local.set({ sclProducts: all });
  }
  return { scanned: Object.keys(scannedStock).length, total: combos.length || 1 };
}
