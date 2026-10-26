// Đọc đơn Shopee trực tiếp (không qua Google Sheets) cho module "Chờ lấy hàng".
//
// Có 2 cách chạy web:
//   1) Mở ngay trong extension: chrome-extension://<id>/dist/index.html  -> gọi background qua sendMessage thường.
//   2) Deploy lên web (Vercel/Netlify/tên miền riêng...): trang web gọi background qua
//      chrome.runtime.sendMessage(EXTENSION_ID, ...) — cần extension khai báo "externally_connectable"
//      đúng domain trong manifest.json (đã khai báo sẵn localhost + vài host phổ biến).
// Cả 2 cách đều dùng lại đúng đường API của AutoIn (extension/autoin/background.js: bgFetchIndex + bgFetchCards)
// nên vẫn cần 1 tab banhang.shopee.vn đang mở và đã đăng nhập Kênh Người Bán.
//
// Trạng thái (order_to_ship_status trong tab "Chờ lấy hàng" - order_list_tab 300):
//   1 = Chưa xử lý
//   2 = Đã xử lý
//   0 = cả hai

export const SHOPEE_SELLER_URL = 'https://banhang.shopee.vn/';

// ID extension đang cài (unpacked ở D:\tải xuống 2\exten them sp12).
// Nếu bạn đóng gói lên Chrome Web Store thì ID sẽ khác -> sửa ở đây, hoặc mở web với ?ext=<id>.
export const EXTENSION_ID = 'fmioeaffjfappcimopogpnfmbbelbnh';

export const STAGE_LABELS = {
    1: 'Chưa xử lý',
    2: 'Đã xử lý'
};

function extensionId() {
    try {
        const fromUrl = new URLSearchParams(window.location.search).get('ext');
        if (fromUrl && /^[a-p]{32}$/.test(fromUrl)) return fromUrl;
    } catch (_) { /* ignore */ }
    return EXTENSION_ID;
}

// Trang đang chạy bên trong extension (chrome-extension://...).
export function isExtensionPage() {
    try {
        return typeof chrome !== 'undefined' && !!(chrome.runtime && chrome.runtime.id);
    } catch (_) {
        return false;
    }
}

// Có gọi được background không: trang extension (id) hoặc web đã deploy (chỉ có sendMessage).
export function hasExtensionBridge() {
    try {
        return typeof chrome !== 'undefined'
            && !!chrome.runtime
            && typeof chrome.runtime.sendMessage === 'function';
    } catch (_) {
        return false;
    }
}

// Hướng dẫn sửa lỗi kết nối, khác nhau giữa trang extension và web đã deploy.
function bridgeHint() {
    if (isExtensionPage()) {
        return 'Hãy Reload extension ở chrome://extensions rồi tải lại trang này.';
    }
    let origin = '';
    try { origin = window.location.origin; } catch (_) { /* ignore */ }
    return `Kiểm tra: (1) extension đã cài và đang bật; (2) tên miền ${origin || 'này'} đã có trong `
        + '"externally_connectable" của manifest.json; (3) đã bấm Reload extension.';
}

function sendMessage(message) {
    return new Promise((resolve, reject) => {
        const onResponse = (res) => {
            const err = chrome.runtime && chrome.runtime.lastError;
            if (err) {
                const text = err.message || '';
                if (/Receiving end does not exist|Could not establish connection/i.test(text)) {
                    const e = new Error('Extension chưa cập nhật. Hãy bấm ↻ Reload ở chrome://extensions (hoặc thoát hẳn Chrome rồi mở lại).');
                    e.code = 'not-updated';
                    reject(e);
                } else {
                    const e = new Error(text || 'Không gọi được background của extension.');
                    e.code = 'unknown';
                    reject(e);
                }
                return;
            }
            if (!res) {
                const e = new Error('Background không phản hồi. ' + bridgeHint());
                e.code = 'unknown';
                reject(e);
                return;
            }
            resolve(res);
        };
        try {
            if (isExtensionPage()) {
                chrome.runtime.sendMessage(message, onResponse);
            } else {
                // Web đã deploy: gửi sang extension theo ID.
                chrome.runtime.sendMessage(extensionId(), message, onResponse);
            }
        } catch (e) {
            const text = (e && e.message) || String(e);
            const err = new Error(text);
            if (/Invalid extension id/i.test(text)) {
                err.code = 'not-installed';
                err.message = `Chưa cài extension trên trình duyệt này (không thấy ID ${extensionId()}).`;
            } else {
                err.code = 'unknown';
            }
            reject(err);
        }
    });
}

// Kiểm tra nhanh xem extension có trả lời không (dùng để hiện trạng thái kết nối).
export async function pingExtension() {
    if (!hasExtensionBridge()) {
        return { ok: false, code: 'no-bridge', error: 'Trình duyệt này chưa có extension (hoặc trang chưa được cấp quyền gọi extension).' };
    }
    try {
        const res = await sendMessage({ type: 'autoin-ping' });
        return { ok: !!(res && res.ok), id: (res && res.id) || '', at: (res && res.at) || 0 };
    } catch (e) {
        return { ok: false, code: (e && e.code) || 'unknown', error: (e && e.message) || String(e) };
    }
}

/**
 * Lấy danh sách đơn "Chờ lấy hàng" từ Shopee.
 * @param {{ status?: 0|1|2, limit?: number }} options
 * @returns {Promise<{ rows: Array, total: number, at: number, errors: string[] }>}
 */
export async function fetchChoLayHang({ status = 0, limit = 200 } = {}) {
    if (!hasExtensionBridge()) {
        throw new Error('Chưa kết nối được extension. ' + bridgeHint());
    }

    const res = await sendMessage({ type: 'autoin-cho-lay-hang', status, limit });
    if (!res) {
        throw new Error('Background không phản hồi. ' + bridgeHint());
    }
    if (res.error) {
        throw new Error(res.error);
    }
    // ok === false nghĩa là 1 nhóm trạng thái lỗi: vẫn trả về phần đọc được + danh sách lỗi.
    return {
        rows: Array.isArray(res.rows) ? res.rows : [],
        total: Number(res.total) || 0,
        at: Number(res.at) || Date.now(),
        errors: Array.isArray(res.errors) ? res.errors : []
    };
}

// Mở (hoặc chuyển sang) tab Kênh Người Bán — điều kiện bắt buộc để background gọi được API Shopee.
// Trong trang extension thì chuyển tab; trên web đã deploy thì mở tab mới (không có quyền chrome.tabs).
export async function openShopeeSeller() {
    if (!hasExtensionBridge()) return false;
    const canUseTabs = isExtensionPage() && chrome.tabs && typeof chrome.tabs.create === 'function';
    if (!canUseTabs) {
        try {
            window.open(SHOPEE_SELLER_URL, '_blank', 'noopener');
            return true;
        } catch (_) {
            return false;
        }
    }
    try {
        const tabs = await chrome.tabs.query({ url: 'https://banhang.shopee.vn/*' });
        if (tabs.length) {
            const target = tabs[0];
            await chrome.tabs.update(target.id, { active: true });
            if (target.windowId != null) {
                await chrome.windows.update(target.windowId, { focused: true }).catch(() => {});
            }
            return true;
        }
        await chrome.tabs.create({ url: SHOPEE_SELLER_URL });
        return true;
    } catch (_) {
        return false;
    }
}
