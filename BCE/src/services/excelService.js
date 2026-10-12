import * as XLSX from 'xlsx';
import { CONFIG } from '../config/sheetsConfig.js';
import { parseMoney } from '../utils/formatters.js';

function expandWorksheetRef(worksheet) {
    if (!worksheet) return;
    const cells = Object.keys(worksheet).filter(key => /^[A-Z]+[0-9]+$/i.test(key));
    if (!cells.length) return;
    const range = cells.reduce((acc, cell) => {
        const decoded = XLSX.utils.decode_cell(cell);
        acc.s.r = Math.min(acc.s.r, decoded.r);
        acc.s.c = Math.min(acc.s.c, decoded.c);
        acc.e.r = Math.max(acc.e.r, decoded.r);
        acc.e.c = Math.max(acc.e.c, decoded.c);
        return acc;
    }, { s: { r: Infinity, c: Infinity }, e: { r: -1, c: -1 } });
    worksheet['!ref'] = XLSX.utils.encode_range(range);
}

function normalizeExcelHeader(value) {
    return String(value ?? '').replace(/^\uFEFF/, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi');
}

function getExcelCell(row, header) {
    return row[normalizeExcelHeader(header)] ?? '';
}

function formatExcelDateTime(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return XLSX.SSF.format('dd/mm/yyyy hh:mm', value);
    }
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (match) {
        const [, day, month, year, hour = '00', minute = '00'] = match;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year} ${hour.padStart(2, '0')}:${minute}`;
    }
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getDateOnly(dateTimeStr) {
    if (!dateTimeStr) return '';
    return String(dateTimeStr).split(' ')[0].trim();
}

function getHeaderMappedCell(source, header) {
    const aliases = {
        id: ['id'],
        ngay: ['ngay', 'ngày'],
        truong: ['truong', 'trường'],
        gian: ['gian', 'gian_hang', 'gian hàng'],
        id_sp: ['id_sp', 'id sp', 'mã sp', 'ma sp'],
        slg: ['slg', 'số lượng', 'so luong'],
        ton_dau: ['ton_dau', 'tồn đầu', 'ton dau']
    };
    const keys = aliases[header] || [header];
    for (const key of keys) {
        const value = source[normalizeExcelHeader(key)];
        if (value !== undefined) return value;
    }
    return '';
}

export function readGenericExcelRows(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', nodim: true });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                expandWorksheetRef(worksheet);
                let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                if (rows[0] && rows[0][0] && String(rows[0][0]).toUpperCase().includes("ID")) {
                    rows = rows.slice(1);
                }
                resolve(rows);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name}`));
        reader.readAsArrayBuffer(file);
    });
}

export function readDsSpExcelRows(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array', nodim: true });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                expandWorksheetRef(worksheet);
                const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                const headers = (matrix[0] || []).map(normalizeExcelHeader);
                const requiredHeaders = ['Mã', 'Tên'];
                const missingHeaders = requiredHeaders.filter(header => !headers.includes(normalizeExcelHeader(header)));
                if (missingHeaders.length) {
                    throw new Error(`File ${file.name} thiếu cột bắt buộc: ${missingHeaders.join(', ')}`);
                }
                const rows = matrix.slice(1).map(values => {
                    const row = {};
                    headers.forEach((header, index) => {
                        if (!(header in row)) row[header] = values[index] ?? '';
                    });
                    return row;
                });
                const mapped = rows.map(source => {
                    const code = String(getExcelCell(source, 'Mã') || '').trim();
                    return [
                        code,
                        code.slice(0, 4),
                        String(getExcelCell(source, 'Tên') || '').trim(),
                        parseMoney(getExcelCell(source, 'Giá nhập')),
                        parseMoney(getExcelCell(source, 'Giá bán lẻ')),
                        parseMoney(getExcelCell(source, 'Giá đóng gói')),
                        parseMoney(getExcelCell(source, 'Giá bán thấp nhất'))
                    ];
                }).filter(r => r.some(c => String(c || '').trim()));
                resolve(mapped);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name}`));
        reader.readAsArrayBuffer(file);
    });
}

export function readHeaderMappedExcelRows(file, tabName = 'SP_GIAM_GIA') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array', nodim: true });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                expandWorksheetRef(worksheet);
                const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                const headers = (matrix[0] || []).map(normalizeExcelHeader);
                const rows = matrix.slice(1).map(values => {
                    const row = {};
                    headers.forEach((header, index) => {
                        if (!(header in row)) row[header] = values[index] ?? '';
                    });
                    return row;
                });
                const storageHeaders = CONFIG.tabs[tabName]?.headers || [];
                const priceCols = CONFIG.tabs[tabName]?.priceCols || [];
                const mappedRows = rows.map(source => storageHeaders.map((header, index) => {
                    const rawValue = getHeaderMappedCell(source, header);
                    if (header === 'ngay') return getDateOnly(formatExcelDateTime(rawValue));
                    if (priceCols.includes(index)) return parseMoney(rawValue);
                    return String(rawValue ?? '').trim();
                })).filter(row => row.some((cell, index) => index !== 0 && String(cell || '').trim()));
                resolve(mappedRows);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name}`));
        reader.readAsArrayBuffer(file);
    });
}

export function exportToExcel(headers, rows, filename = 'export.xlsx') {
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename);
}
