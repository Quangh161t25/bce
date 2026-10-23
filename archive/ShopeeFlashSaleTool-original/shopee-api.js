// Lớp gọi API Kênh Người Bán Shopee.
// Mọi request được chạy BÊN TRONG một tab banhang.shopee.vn (qua chrome.scripting),
// nên trình duyệt tự gửi kèm cookie đăng nhập như khi bạn thao tác trên web.

const SELLER_ORIGIN = 'https://banhang.shopee.vn';
const SELLER_START_PAGE = SELLER_ORIGIN + '/portal/marketing';

let cachedTabId = null;

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function waitTabComplete(tabId, timeout = 45000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Hết thời gian chờ tải trang Kênh Người Bán'));
    }, timeout);
    function listener(id, info, tab) {
      if (id === tabId && info.status === 'complete') {
        cleanup();
        resolve(tab);
      }
    }
    function cleanup() {
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(listener);
    }
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.get(tabId).then((t) => {
      if (t.status === 'complete') {
        cleanup();
        resolve(t);
      }
    }).catch((e) => {
      cleanup();
      reject(e);
    });
  });
}

// Tìm (hoặc mở ngầm) một tab Kênh Người Bán để chạy request.
async function getSellerTab() {
  if (cachedTabId !== null) {
    try {
      const t = await chrome.tabs.get(cachedTabId);
      if (t.url && t.url.startsWith(SELLER_ORIGIN)) {
        if (t.status !== 'complete') await waitTabComplete(t.id);
        return t.id;
      }
    } catch (e) { /* tab đã đóng */ }
    cachedTabId = null;
  }

  const tabs = await chrome.tabs.query({ url: SELLER_ORIGIN + '/*' });
  let tab = tabs.find((t) => t.status === 'complete') || tabs[0];
  if (!tab) {
    tab = await chrome.tabs.create({ url: SELLER_START_PAGE, active: false });
  }
  tab = await waitTabComplete(tab.id);
  if (!tab.url || !tab.url.startsWith(SELLER_ORIGIN)) {
    throw new Error('Bạn chưa đăng nhập Kênh Người Bán Shopee. Hãy mở banhang.shopee.vn và đăng nhập.');
  }
  cachedTabId = tab.id;
  return tab.id;
}

// Hàm này được inject và chạy trong tab Shopee.
function pageFetch(url, method, body) {
  return fetch(url, {
    method,
    credentials: 'include',
    headers: {
      accept: 'application/json, text/plain, */*',
      'content-type': 'application/json'
    },
    body: body == null ? undefined : JSON.stringify(body)
  })
    .then(async (r) => ({ status: r.status, text: await r.text() }))
    .catch((e) => ({ status: 0, text: '', error: String(e) }));
}

async function getSpcCds() {
  const c = await chrome.cookies.get({ url: SELLER_ORIGIN, name: 'SPC_CDS' });
  return (c && c.value) || '';
}

export async function request(method, path, { params = {}, body = null } = {}) {
  const tabId = await getSellerTab();
  const spc = await getSpcCds();
  const qs = new URLSearchParams({ SPC_CDS: spc, SPC_CDS_VER: '2', version: '3.1.0' });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  const url = `${SELLER_ORIGIN}${path}?${qs.toString()}`;

  const [injection] = await chrome.scripting.executeScript({
    target: { tabId },
    func: pageFetch,
    args: [url, method, body]
  });
  const result = injection && injection.result;
  if (!result) throw new Error('Không chạy được request trong tab Shopee');
  if (result.error) throw new Error('Lỗi mạng: ' + result.error);
  if (result.status === 401 || result.status === 403) {
    throw new Error(`Shopee từ chối (HTTP ${result.status}). Hãy đăng nhập lại Kênh Người Bán.`);
  }

  let json;
  try {
    json = JSON.parse(result.text);
  } catch (e) {
    throw new Error(`Phản hồi không phải JSON (HTTP ${result.status})`);
  }
  const code = json.code ?? json.error ?? 0;
  if (code) {
    const err = new Error(json.message || json.msg || json.err_msg || `Shopee trả lỗi code ${code}`);
    err.code = code;
    err.response = json;
    throw err;
  }
  return json.data;
}

// ---------- Tiện ích chuẩn hoá dữ liệu ----------

export const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export const imageUrl = (hash) =>
  !hash ? '' : String(hash).startsWith('http') ? hash : `https://cf.shopee.vn/file/${hash}_tn`;

function pick(obj, paths) {
  for (const p of paths) {
    const v = p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

function normalizeModel(m, product) {
  return {
    modelId: Number(m.id ?? m.model_id ?? 0),
    name: m.name || m.model_name || '',
    sku: m.sku || '',
    sold: toNumber(pick(m, ['statistics.sold_count', 'sold_count', 'sold'])),
    price: toNumber(pick(m, ['price_info.input_normal_price', 'price_info.normal_price', 'input_normal_price', 'price'])
      ?? pick(product, ['price_info.input_normal_price', 'price_info.normal_price', 'price'])),
    promoPrice: toNumber(pick(m, ['price_info.input_promotion_price', 'price_info.promotion_price', 'input_promotion_price'])),
    stock: toNumber(pick(m, ['stock_detail.total_seller_stock', 'seller_stock_info.normal_stock', 'stock_detail.total_available_stock', 'stock_info.normal_stock', 'stock'])
      ?? pick(product, ['stock_detail.total_seller_stock', 'stock']))
  };
}

export function normalizeProduct(p) {
  const models = Array.isArray(p.model_list) && p.model_list.length
    ? p.model_list.map((m) => normalizeModel(m, p))
    : [normalizeModel({ id: 0 }, p)];
  return {
    itemId: Number(p.id ?? p.item_id ?? p.product_id),
    name: p.name || '',
    image: imageUrl(p.cover_image || (Array.isArray(p.images) && p.images[0])),
    status: Number(p.status ?? 1),
    unlisted: !!p.unlisted,
    parentSku: p.parent_sku || '',
    sold: toNumber(pick(p, ['statistics.sold_count', 'sold', 'sales', 'historical_sold']))
      || models.reduce((a, m) => a + m.sold, 0),
    views: toNumber(pick(p, ['statistics.view_count', 'view_count'])),
    likes: toNumber(pick(p, ['statistics.liked_count', 'liked_count', 'like_count'])),
    createTime: Number(p.create_time ?? p.ctime ?? 0),
    models
  };
}

// ---------- API ----------

export async function getShopInfo() {
  const d = await request('GET', '/api/selleraccount/shop_info/');
  return { name: (d && (d.name || d.shop_name)) || '', shopId: d && (d.shop_id || d.shopid) };
}

export const products = {
  async search({ keyword = '', cursor = '', pageSize = 24, pageNumber = 1 } = {}) {
    const params = { page_number: pageNumber, page_size: pageSize, cursor };
    if (keyword) {
      params.keyword = keyword;
      params.search_type = 'name';
    }
    const d = await request('GET', '/api/v3/mpsku/list/search_product_list', { params });
    const list = (d && d.products) || [];
    return {
      products: list.map(normalizeProduct),
      cursor: (d && d.page_info && d.page_info.cursor) || '',
      total: (d && d.page_info && d.page_info.total) || 0
    };
  },

  // Dữ liệu đầy đủ của 1 sản phẩm trong shop (dùng cho ảnh/video).
  async getRaw(itemId) {
    const d = await request('GET', '/api/v3/product/get_product_info', {
      params: { product_id: itemId, is_draft: false }
    });
    return (d && d.product_info) || null;
  },

  async getInfo(itemId) {
    const raw = await this.getRaw(itemId);
    return raw ? normalizeProduct(raw) : null;
  }
};

const LIST_TYPES = { all: 0, next: 1, current: 2, end: 3 };

export const flashSale = {
  // Khung giờ Flash Sale còn trống của shop trong `days` ngày tới.
  async timeSlots(days = 30) {
    const now = Math.floor(Date.now() / 1000);
    const d = await request('GET', '/api/marketing/v4/shop_flash_sale/time_slot/', {
      params: { start_time: now, end_time: now + days * 86400 }
    });
    const list = Array.isArray(d) ? d : (d && (d.time_slot_list || d.list)) || [];
    return list
      .map((s) => ({ id: Number(s.timeslot_id ?? s.time_slot_id), start: Number(s.start_time), end: Number(s.end_time) }))
      .sort((a, b) => a.start - b.start);
  },

  async list(type = 'next', offset = 0, limit = 50) {
    const d = await request('GET', '/api/marketing/v4/shop_flash_sale/list/', {
      params: { offset, limit, type: LIST_TYPES[type] ?? 0 }
    });
    return (d && d.flash_sale_list) || [];
  },

  async listAll(type = 'next', maxPages = 10) {
    const all = [];
    for (let page = 0; page < maxPages; page++) {
      const part = await this.list(type, page * 50, 50);
      all.push(...part);
      if (part.length < 50) break;
    }
    return all;
  },

  async get(flashSaleId) {
    return request('GET', '/api/marketing/v4/shop_flash_sale/get/', {
      params: { flash_sale_id: Number(flashSaleId) }
    });
  },

  // Toàn bộ sản phẩm/phân loại đang có trong 1 Flash Sale.
  async getItems(flashSaleId) {
    const items = [];
    const itemInfo = [];
    let modelInfo = [];
    for (let offset = 0; offset < 2000; offset += 100) {
      const d = await request('GET', '/api/marketing/v4/shop_flash_sale/batch_items/get', {
        params: { flash_sale_id: Number(flashSaleId), offset, limit: 100 }
      });
      const part = (d && d.items) || [];
      items.push(...part);
      itemInfo.push(...((d && d.item_info) || []));
      if (d && d.model_info_str) {
        try { modelInfo = modelInfo.concat(JSON.parse(d.model_info_str) || []); } catch (e) { /* bỏ qua */ }
      }
      if (part.length < 100) break;
    }
    return { items, itemInfo, modelInfo };
  },

  async create(timeSlotId) {
    return request('POST', '/api/marketing/v4/shop_flash_sale/set/', {
      body: { time_slot_id: Number(timeSlotId) }
    });
  },

  async setItems(flashSaleId, items) {
    return request('POST', '/api/marketing/v4/shop_flash_sale/batch_items/set/', {
      body: { flash_sale_id: Number(flashSaleId), items, use_global_category: true }
    });
  },

  async setSequence(flashSaleId, displaySequenceList) {
    return request('POST', '/api/marketing/v4/shop_flash_sale/item_seq/', {
      body: { flash_sale_id: Number(flashSaleId), display_sequence_list: displaySequenceList }
    });
  }
};
