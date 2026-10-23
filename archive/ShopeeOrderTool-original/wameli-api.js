// Đọc đơn "Xuất kho đơn hàng" và danh sách "Sản phẩm" trên Wameli (phanmem.wameli.vn) bằng phiên đăng nhập của bạn.
// Request chạy bên trong một tab Wameli (qua chrome.scripting). Máy chủ Wameli xử lý từng request
// một và dễ chặn khi gọi dồn dập, nên phía gọi luôn chạy tuần tự và nghỉ giữa các lần.

const ORIGIN = 'https://phanmem.wameli.vn';
const ITEMS_PAGE = ORIGIN + '/admin/order_items/items';

let cachedTabId = null;

function waitTabComplete(tabId, timeout = 60000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { cleanup(); reject(new Error('Hết thời gian chờ tải trang Wameli')); }, timeout);
    function listener(id, info, tab) {
      if (id === tabId && info.status === 'complete') { cleanup(); resolve(tab); }
    }
    function cleanup() { clearTimeout(timer); chrome.tabs.onUpdated.removeListener(listener); }
    chrome.tabs.onUpdated.addListener(listener);
    chrome.tabs.get(tabId).then((t) => { if (t.status === 'complete') { cleanup(); resolve(t); } }).catch((e) => { cleanup(); reject(e); });
  });
}

const WAMELI_DEFAULT_USER = 'Admin';
const WAMELI_DEFAULT_PASS = 'wameli2026abc';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getWameliCredentials() {
  try {
    const { wameliUser, wameliPass } = await chrome.storage.local.get(['wameliUser', 'wameliPass']);
    return {
      user: wameliUser || WAMELI_DEFAULT_USER,
      pass: wameliPass || WAMELI_DEFAULT_PASS
    };
  } catch (e) {
    return { user: WAMELI_DEFAULT_USER, pass: WAMELI_DEFAULT_PASS };
  }
}

async function checkIsLoginPage(tabId) {
  try {
    const [inj] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const hasPwd = !!document.querySelector('input[type="password"]');
        const isLoginUrl = location.href.includes('login');
        return hasPwd || isLoginUrl;
      }
    });
    return !!(inj && inj.result);
  } catch (e) {
    return false;
  }
}

export async function loginWameli(tabId) {
  const { user, pass } = await getWameliCredentials();

  let statusCheck = null;
  try {
    const [res] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const pwd = document.querySelector('input[type="password"]');
        return { hasPwd: !!pwd, url: location.href };
      }
    });
    statusCheck = res?.result;
  } catch (e) {}

  if (!statusCheck?.hasPwd) {
    await chrome.tabs.update(tabId, { url: ORIGIN + '/admin' });
    await waitTabComplete(tabId);
    await sleep(500);
  }

  const [fillResult] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (u, p) => {
      const pwd = document.querySelector('input[type="password"]');
      if (!pwd) {
        const hasAdmin = location.href.startsWith('https://phanmem.wameli.vn/admin') && !location.href.includes('login');
        if (hasAdmin) return { alreadyLoggedIn: true };
        return { ok: false, error: 'Không tìm thấy ô nhập mật khẩu trên trang Wameli' };
      }

      const form = pwd.closest('form') || document.body;
      let userInput = form.querySelector('input[name*="user" i], input[name*="login" i], input[name*="name" i], input[name*="email" i], input[name*="account" i], input[id*="user" i], input[id*="login" i]');
      if (!userInput) {
        const textInputs = [...form.querySelectorAll('input:not([type="hidden"]):not([type="password"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"])')];
        userInput = textInputs[0] || document.querySelector('input[type="text"]');
      }

      if (!userInput) return { ok: false, error: 'Không tìm thấy ô nhập tài khoản' };

      userInput.focus();
      userInput.value = u;
      userInput.dispatchEvent(new Event('input', { bubbles: true }));
      userInput.dispatchEvent(new Event('change', { bubbles: true }));

      pwd.focus();
      pwd.value = p;
      pwd.dispatchEvent(new Event('input', { bubbles: true }));
      pwd.dispatchEvent(new Event('change', { bubbles: true }));

      const btn = form.querySelector('button[type="submit"], input[type="submit"], button, .btn-primary, .btn-login, a.btn')
        || document.querySelector('button[type="submit"], input[type="submit"]');

      if (btn) {
        btn.click();
      } else if (form && form.tagName === 'FORM') {
        form.submit();
      } else {
        pwd.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
        pwd.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', keyCode: 13, bubbles: true }));
      }

      return { ok: true };
    },
    args: [user, pass]
  });

  if (fillResult?.result?.alreadyLoggedIn) {
    return true;
  }

  if (!fillResult?.result?.ok) {
    throw new Error(fillResult?.result?.error || 'Không thể điền form đăng nhập Wameli');
  }

  try {
    await waitTabComplete(tabId, 15000);
  } catch (e) {}
  await sleep(1500);

  const [verify] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const pwd = document.querySelector('input[type="password"]');
      const errEl = document.querySelector('.alert, .message, .error, .danger, #system-message, .alert-danger, .error-message');
      const errMsg = errEl ? errEl.textContent.trim().replace(/\s+/g, ' ') : '';
      return {
        stillLogin: !!pwd,
        errMsg,
        url: location.href
      };
    }
  });

  const res = verify?.result;
  if (res?.stillLogin) {
    const reason = res.errMsg ? `: ${res.errMsg}` : ' (vui lòng kiểm tra lại mật khẩu)';
    throw new Error(`Đăng nhập Wameli tài khoản "${user}" không thành công${reason}`);
  }

  return true;
}

async function getWameliTab() {
  if (cachedTabId !== null) {
    try {
      const t = await chrome.tabs.get(cachedTabId);
      if (t.url && t.url.startsWith(ORIGIN + '/admin')) {
        const isLogin = await checkIsLoginPage(t.id);
        if (!isLogin) return t.id;
        await loginWameli(t.id);
        return t.id;
      }
    } catch (e) { /* tab đã đóng */ }
    cachedTabId = null;
  }
  const tabs = await chrome.tabs.query({ url: ORIGIN + '/*' });
  let tab = tabs.find((t) => t.url && t.url.startsWith(ORIGIN + '/admin') && !t.url.includes('login'));
  if (!tab && tabs.length) {
    tab = tabs[0];
  }
  if (!tab) tab = await chrome.tabs.create({ url: ITEMS_PAGE, active: false });
  tab = await waitTabComplete(tab.id);

  const isLogin = (tab.url && tab.url.includes('login')) || (await checkIsLoginPage(tab.id));
  if (isLogin) {
    await loginWameli(tab.id);
    tab = await chrome.tabs.get(tab.id);
  }

  cachedTabId = tab.id;
  return tab.id;
}

// ---- Hàm chạy trong tab Wameli (phải tự chứa, không dùng biến bên ngoài) ----
async function pageWameli(action, args) {
  // Hai loại dữ liệu: đơn xuất kho và sản phẩm (cùng kiểu trang quản trị, khác đường dẫn & bộ lọc)
  const KINDS = {
    orders: { path: '/admin/order_items/items', module: 'order_items', view: 'items', texts: 2, filters: 4 },
    products: { path: '/admin/product', module: 'products', view: 'products', texts: 0, filters: 2 }
  };
  const kind = KINDS[args.kind] || KINDS.orders;
  const ITEMS = kind.path;
  const timeoutFetch = async (url, opt = {}, ms = 90000) => {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), ms);
    try {
      return await fetch(url, { ...opt, credentials: 'include', signal: c.signal });
    } finally {
      clearTimeout(t);
    }
  };
  const cellText = (c) => {
    // Ô chỉ có ảnh (cột Ảnh sản phẩm) -> lấy link ảnh
    const imgs = [...c.querySelectorAll('img')].map((i) => i.getAttribute('src') || '').filter((src) => src && !/\/images\/(edit|delete|toolbar)/.test(src));
    if (!c.textContent.trim() && imgs.length) return imgs.map((src) => new URL(src, location.origin).href).join(' | ');
    const parts = [...c.querySelectorAll('*')].filter((e) => !e.children.length).map((e) => e.textContent.trim()).filter(Boolean);
    const uniq = [...new Set(parts)];
    return uniq.length > 1 ? uniq.join(' | ') : c.textContent.trim().replace(/\s+/g, ' ');
  };
  const parse = (html) => {
    const d = new DOMParser().parseFromString(html, 'text/html');
    const t = d.querySelector('table');
    if (!t && d.querySelector('input[type=password]')) return { error: 'Phiên đăng nhập Wameli đã hết, hãy đăng nhập lại.', needLogin: true };
    if (!t) return { error: 'Không thấy bảng đơn trên trang Wameli' };
    const headRow = t.tHead ? t.tHead.rows[0] : t.rows[0];
    const head = [...headRow.cells].map((c) => c.textContent.trim());
    const bodyRows = [...t.rows].filter((r) => r !== headRow && r.parentElement.tagName !== 'THEAD');
    const rows = bodyRows.map((r) => [...r.cells].map(cellText)).filter((r) => r.length >= head.length - 2);
    const total = Number((d.body.textContent.match(/Tổng\s*:\s*\[(\d+)\]/) || [])[1] || 0);
    const pages = [...d.querySelectorAll('a')].map((a) => (a.getAttribute('href') || '').match(/[?&]page=(\d+)/)).filter(Boolean).map((m) => Number(m[1]));
    return { head, rows, total, maxPage: pages.length ? Math.max(...pages) : 1 };
  };
  const formBody = (task) => {
    const f = new URLSearchParams({ text_count: String(kind.texts), keysearch: args.keyword || '' });
    if (kind.texts) {
      f.set('text0', args.from || '');
      f.set('text1', args.to || '');
    }
    f.set('filter_count', String(kind.filters));
    for (let i = 0; i < kind.filters; i++) f.set('filter' + i, (args.filters && args.filters[i]) || '');
    for (const [k, v] of Object.entries({
      toggle: '', sort_field: '', sort_direct: 'asc', module: kind.module, view: kind.view,
      total: '0', page: '0', field_change: '', task: task || '', boxchecked: '0', limit: '0'
    })) f.set(k, v);
    return f.toString();
  };

  try {
    if (action === 'filter') {
      const r = await timeoutFetch(ITEMS, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: formBody('') });
      if (r.status !== 200) return { error: `Wameli trả lỗi HTTP ${r.status}`, status: r.status };
      return parse(await r.text());
    }
    if (action === 'page') {
      const r = await timeoutFetch(`${ITEMS}?page=${Number(args.page)}`);
      if (r.status !== 200) return { error: `Wameli trả lỗi HTTP ${r.status}`, status: r.status };
      return parse(await r.text());
    }
    if (action === 'export') {
      const r = await timeoutFetch(ITEMS, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: formBody(args.task) }, 120000);
      if (r.status !== 200) return { error: `Wameli trả lỗi HTTP ${r.status}`, status: r.status };
      const type = r.headers.get('content-type') || '';
      if (!/sheet|excel|octet/i.test(type)) return { error: 'Wameli không trả file Excel (có thể chưa có dữ liệu hoặc bị chặn)' };
      const bytes = new Uint8Array(await r.arrayBuffer());
      let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      return { base64: btoa(bin), size: bytes.length };
    }
    // ----- Tải đơn lên (trang Đơn hàng > Thêm mới: /admin/order/upload) -----
    const UPLOAD = '/admin/order/upload';
    const listBody = (task) => new URLSearchParams({
      text_count: '2', filter_count: '4', sort_field: '', sort_direct: 'asc', module: 'order', view: 'upload',
      total: '0', page: '0', field_change: '', task, boxchecked: '0', limit: '0'
    }).toString();
    const messages = (d) => [...d.querySelectorAll('.alert, .message, #system-message, .error, .success, .notice')]
      .map((e) => e.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean).slice(0, 5);

    if (action === 'uploadForm') {
      // Mở form "Thêm mới" (chỉ đọc) để lấy danh sách Sàn / Kho / Shop / Giờ hiện có
      const r = await timeoutFetch(UPLOAD, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: listBody('add') });
      if (r.status !== 200) return { error: `Wameli trả lỗi HTTP ${r.status}`, status: r.status };
      const d = new DOMParser().parseFromString(await r.text(), 'text/html');
      const opts = (name) => [...(d.querySelector(`select[name="${name}"]`)?.options || [])]
        .filter((o) => o.value && o.value !== '0').map((o) => ({ value: o.value, text: o.text.trim() }));
      const seeding = [...d.querySelectorAll('input[name="is_seeding"]')].map((i) => ({
        value: i.value,
        checked: i.checked,
        label: (i.closest('label')?.textContent || i.parentElement?.textContent || i.nextSibling?.textContent || '').trim().slice(0, 40)
      }));
      if (!d.querySelector('input[name="file_xlsx"]')) {
        const hasPwd = !!d.querySelector('input[type="password"]');
        return { error: 'Không mở được form Thêm mới (phiên đăng nhập Wameli đã hết)', needLogin: hasPwd || true };
      }
      return { platforms: opts('platform_id'), warehouses: opts('warehouse_id'), shops: opts('shop_id'), hours: opts('house_id'), seeding };
    }

    if (action === 'uploadSave') {
      // args.fields: { is_seeding, platform_id, warehouse_id, shop_id, date, house_id, name }
      // args.pdfs / args.xlsx: [{ name, type, base64 }]
      const toFile = (f) => {
        const bin = atob(f.base64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new File([bytes], f.name, { type: f.type || 'application/octet-stream' });
      };
      const form = new FormData();
      for (const [k, v] of Object.entries(args.fields || {})) form.append(k, v ?? '');
      for (const f of args.pdfs || []) form.append('file_pdf[]', toFile(f));
      if (args.xlsx) form.append('file_xlsx', toFile(args.xlsx));
      for (const [k, v] of Object.entries({ module: 'order', view: 'upload', task: 'save', boxchecked: '0', page: '0', return: btoa(UPLOAD) })) form.append(k, v);
      const r = await timeoutFetch(UPLOAD, { method: 'POST', body: form }, 180000);
      if (r.status !== 200) return { error: `Wameli trả lỗi HTTP ${r.status}`, status: r.status };
      const d = new DOMParser().parseFromString(await r.text(), 'text/html');
      const stillForm = !!d.querySelector('input[name="file_xlsx"]');
      const msg = messages(d);
      // Lưu thành công thì Wameli quay về danh sách; nếu vẫn ở form là có lỗi
      if (stillForm) {
        const hasPwd = !!d.querySelector('input[type="password"]');
        if (hasPwd) return { error: 'Phiên đăng nhập Wameli đã hết', needLogin: true };
        return { error: 'Wameli không lưu: ' + (msg.join(' | ') || 'vẫn ở form Thêm mới, kiểm tra lại các trường') };
      }
      const first = d.querySelector('table') && d.querySelector('table').rows[1];
      return { ok: true, message: msg.join(' | '), firstRow: first ? [...first.cells].map((c) => c.textContent.trim().replace(/\s+/g, ' ')).slice(0, 12) : [] };
    }

    return { error: 'Lệnh không hợp lệ' };
  } catch (e) {
    return { error: e.name === 'AbortError' ? 'Wameli không phản hồi (quá thời gian chờ)' : 'Lỗi mạng: ' + e.message };
  }
}

async function run(action, args = {}, retryCount = 0) {
  const tabId = await getWameliTab();
  const [inj] = await chrome.scripting.executeScript({ target: { tabId }, func: pageWameli, args: [action, args] });
  const res = inj && inj.result;
  if (!res) throw new Error('Không chạy được lệnh trong tab Wameli');
  if (res.error) {
    const isAuthErr = res.needLogin || /đăng nhập|phiên|hết hạn|chưa đăng nhập/i.test(res.error);
    if (isAuthErr && retryCount < 1) {
      await loginWameli(tabId);
      return run(action, args, retryCount + 1);
    }
    const err = new Error(res.error);
    err.status = res.status;
    throw err;
  }
  return res;
}

// "2026-10-01" (ô chọn ngày) -> "01-10-2026" (định dạng Wameli)
export const toWameliDate = (iso) => (iso ? iso.split('-').reverse().join('-') : '');

// kind: 'orders' (Xuất kho đơn hàng) | 'products' (Sản phẩm)
export const wameli = {
  // Áp bộ lọc (Wameli lưu bộ lọc theo phiên), trả trang 1 + tổng số dòng
  filter: (opts) => run('filter', opts),
  page: (page, kind = 'orders') => run('page', { page, kind }),
  // task: đơn 'excel_misa' | 'excel_nhat'; sản phẩm 'export' — trả { base64, size }
  exportExcel: (task, opts) => run('export', { ...opts, task }),
  // Danh sách Sàn / Kho / Shop / Giờ trong form "Thêm mới" đơn
  uploadForm: () => run('uploadForm'),
  // Tạo 1 bản ghi đơn mới trên Wameli (kèm file PDF hoá đơn + file Excel đơn hàng)
  uploadSave: (fields, pdfs, xlsx) => run('uploadSave', { fields, pdfs, xlsx })
};
