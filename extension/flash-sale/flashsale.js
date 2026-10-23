// Nghiệp vụ Flash Sale dùng chung cho giao diện và chạy ngầm.
import { flashSale, sleep } from './shopee-api.js';

// rows: danh sách phân loại trong trình soạn thảo -> định dạng item của API Shopee.
export function toApiItems(rows) {
  return rows
    .filter((r) => r.enabled)
    .map((r) => ({
      item_id: Number(r.itemId),
      model_id: Number(r.modelId),
      status: 1,
      input_promo_price: Number(r.fsPrice),
      stock: Number(r.fsStock),
      purchase_limit: Number(r.limit) || 0
    }));
}

// Thứ tự hiển thị theo thứ tự sản phẩm trong danh sách.
export function toSequence(items) {
  const seen = [];
  for (const it of items) {
    const id = Number(it.item_id ?? it.itemId);
    if (!seen.includes(id)) seen.push(id);
  }
  return seen.map((item_id, i) => ({ item_id, display_sequence: i + 1 }));
}

export function validateRows(rows) {
  const errors = [];
  for (const r of rows.filter((x) => x.enabled)) {
    const label = `${r.itemName}${r.modelName ? ' - ' + r.modelName : ''}`;
    if (!(r.fsPrice > 0)) errors.push(`${label}: chưa có giá Flash Sale`);
    else if (r.price && r.fsPrice >= r.price) errors.push(`${label}: giá FS phải thấp hơn giá gốc`);
    if (!(r.fsStock > 0)) errors.push(`${label}: số lượng FS phải > 0`);
    else if (r.stock && r.fsStock > r.stock) errors.push(`${label}: số lượng FS vượt tồn kho (${r.stock})`);
  }
  return errors;
}

async function findFlashSaleIdBySlot(slotId) {
  const upcoming = await flashSale.listAll('next');
  const found = upcoming.find((f) => Number(f.timeslot_id) === Number(slotId));
  return found ? found.flash_sale_id : null;
}

// Tạo Flash Sale cho 1 khung giờ (hoặc cập nhật FS có sẵn) và đăng ký sản phẩm.
export async function registerFlashSale({ slotId, flashSaleId, items, sequence, onLog = () => {} }) {
  let id = flashSaleId;
  if (!id) {
    try {
      const d = await flashSale.create(slotId);
      id = d && d.flash_sale_id;
    } catch (e) {
      // Có thể khung giờ đã có FS rồi -> thử tìm lại.
      id = await findFlashSaleIdBySlot(slotId);
      if (!id) throw e;
      onLog('warn', `Khung giờ ${slotId} đã có Flash Sale #${id}, sẽ thêm sản phẩm vào FS này`);
    }
    if (!id) throw new Error(`Không tạo được Flash Sale cho khung giờ ${slotId}`);
    await sleep(800);
  }

  let res = await flashSale.setItems(id, items);
  let failed = (res && res.failed_items) || [];

  // Thử lại một lần cho các phân loại lỗi.
  if (failed.length && failed.length < items.length) {
    await sleep(1500);
    const retry = items.filter((it) =>
      failed.some((f) => Number(f.item_id) === it.item_id && Number(f.model_id) === it.model_id));
    res = await flashSale.setItems(id, retry);
    failed = (res && res.failed_items) || [];
  }

  if (sequence && sequence.length) {
    await sleep(600);
    try {
      await flashSale.setSequence(id, sequence);
    } catch (e) {
      onLog('warn', `FS #${id}: không sắp xếp được thứ tự sản phẩm (${e.message})`);
    }
  }

  return { flashSaleId: id, failed, okCount: items.length - failed.length };
}

export function describeFailed(f) {
  const reason = f.err_msg || f.error_msg || f.message || f.reason || f.err_code || f.error || f.code || '';
  return `SP ${f.item_id} / PL ${f.model_id}${reason !== '' ? ': ' + reason : ''}`;
}
