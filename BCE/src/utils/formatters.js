export function escapeHtml(val) {
    return String(val ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function escapeJsString(value) {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
}

export function parseMoney(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const raw = String(value ?? '').trim();
    if (!raw) return 0;
    const normalized = raw.replace(/\s/g, '').replace(/[^\d,.-]/g, '');
    if (!normalized) return 0;
    if (normalized.includes(',') && normalized.includes('.')) {
        return Number(normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
            ? normalized.replace(/\./g, '').replace(',', '.')
            : normalized.replace(/,/g, '')) || 0;
    }
    if (/^-?\d{1,3}([.,]\d{3})+$/.test(normalized)) return Number(normalized.replace(/[.,]/g, '')) || 0;
    return Number(normalized.replace(',', '.')) || 0;
}

export function formatDisplayNumber(value, showZero = true) {
    if (value === null || value === undefined || value === '') return showZero ? '0' : '';
    const num = parseMoney(value);
    if (!showZero && num === 0) return '';
    return new Intl.NumberFormat('vi-VN').format(Math.round(num));
}

export function formatMoneyVND(val) {
    if (val === null || val === undefined || isNaN(val)) return "0 đ";
    const num = Number(val);
    const isNeg = num < 0;
    const absVal = Math.abs(num);
    const formatted = new Intl.NumberFormat('vi-VN').format(Math.round(absVal));
    return isNeg ? `-${formatted} đ` : `${formatted} đ`;
}

export function colName(n) {
    let s = "";
    while (n >= 0) {
        s = String.fromCharCode((n % 26) + 65) + s;
        n = Math.floor(n / 26) - 1;
    }
    return s;
}

export function parseDhDate(val) {
    if (val === undefined || val === null || val === '') return null;
    const str = String(val).trim();
    if (!str) return null;

    if (!isNaN(str) && Number(str) > 30000 && Number(str) < 70000) {
        const serial = Number(str);
        const dateObj = new Date(Math.round((serial - 25569) * 86400 * 1000));
        if (!isNaN(dateObj.getTime())) return dateObj;
    }

    const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10);
        const month = parseInt(dmyMatch[2], 10) - 1;
        const year = parseInt(dmyMatch[3], 10);
        const hour = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
        const min = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
        const sec = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
        const dateObj = new Date(year, month, day, hour, min, sec);
        if (!isNaN(dateObj.getTime())) return dateObj;
    }

    const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[\sT]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1;
        const day = parseInt(isoMatch[3], 10);
        const hour = isoMatch[4] ? parseInt(isoMatch[4], 10) : 0;
        const min = isoMatch[5] ? parseInt(isoMatch[5], 10) : 0;
        const sec = isoMatch[6] ? parseInt(isoMatch[6], 10) : 0;
        const dateObj = new Date(year, month, day, hour, min, sec);
        if (!isNaN(dateObj.getTime())) return dateObj;
    }

    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDateDdMmYyyy(val) {
    const d = parseDhDate(val);
    if (!d) return String(val || '').trim();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}
