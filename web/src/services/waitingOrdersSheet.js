import '../../../shared/order-sheet.js';
import { CONFIG } from '../config/sheetsConfig.js';
import { getAccessToken } from './googleAuth.js';

export async function fetchWaitingSheet() {
    const token = await getAccessToken();
    const range = encodeURIComponent(`'${globalThis.AutoInOrderSheet.TITLE}'!A:W`);
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${range}`, {headers:{Authorization:`Bearer ${token}`},cache:'no-store'});
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Không đọc được sheet ĐƠN CHƯA XLY');
    return globalThis.AutoInOrderSheet.parseSnapshot(data.values || []);
}
