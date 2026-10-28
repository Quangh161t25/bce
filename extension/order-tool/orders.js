// Đọc dữ liệu đơn hàng từ "order card" (và chi tiết đơn nếu đã tải) của Kênh Người Bán.
// Cấu trúc có thể thay đổi, nên các trường được tìm theo tên ở mọi cấp (deep search),
// và luôn giữ nguyên dữ liệu gốc (raw / detail) để xem / xuất đầy đủ.

const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const isText = (v) => typeof v === 'string' && v.trim() !== '';
const notEmpty = (v) => v !== undefined && v !== null && v !== '';

// Tìm giá trị đầu tiên có key nằm trong `keys` (duyệt theo chiều rộng, ưu tiên cấp nông).
export function findDeep(obj, keys, test = notEmpty) {
  const queue = [obj];
  const seen = new Set();
  while (queue.length) {
    const cur = queue.shift();
    if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
    seen.add(cur);
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(cur, k) && test(cur[k])) return cur[k];
    }
    for (const v of Object.values(cur)) if (v && typeof v === 'object') queue.push(v);
  }
  return undefined;
}

const ITEM_ID_KEYS = ['item_id', 'itemid', 'product_id'];
const hasItemId = (o) => ITEM_ID_KEYS.some((k) => o[k]);
const looksLikeLine = (o) => ['model_id', 'modelid', 'amount', 'quantity', 'item_price', 'order_price', 'model_name', 'item_sku', 'model_sku']
  .some((k) => o[k] !== undefined);

// Tất cả "dòng sản phẩm" trong đơn: { node, ctx } — ctx là các object cha gần nhất
// (tên / phân loại / ảnh thường nằm ở object anh em, không cùng chỗ với item_id).
function findItems(obj) {
  const out = [];
  const seen = new Set();
  (function walk(o, parents) {
    if (!o || typeof o !== 'object' || seen.has(o)) return;
    seen.add(o);
    if (!Array.isArray(o) && hasItemId(o) && looksLikeLine(o)) {
      out.push({ node: o, ctx: parents.filter((p) => !Array.isArray(p)).slice(-2).reverse() });
      return;
    }
    for (const v of Object.values(o)) walk(v, [...parents, o]);
  })(obj, []);
  const key = (x) => `${x.node.item_id ?? x.node.itemid ?? x.node.product_id}:${x.node.model_id ?? x.node.modelid ?? ''}`;
  const map = new Map();
  for (const x of out) if (!map.has(key(x))) map.set(key(x), x);
  return [...map.values()];
}

const isVariationText = (v) => isText(v) && /^\s*(Variation|Phân loại)\s*:/i.test(v);

// "Variation: Seka 4L [51118880508 S219-BK-00-GDD-00-001-Nồi nấu chậm...]"
//  -> { model: "Seka 4L", sku: "S219-BK-00-GDD-00-001-Nồi nấu chậm..." }
export function parseVariation(text) {
  const s = String(text || '').replace(/^\s*(Variation|Phân loại)\s*:\s*/i, '').trim();
  const m = s.match(/^(.*?)\s*\[(.*)\]\s*$/);
  if (!m) return { model: s, sku: '' };
  // Trong ngoặc có thể có chữ / ID phía trước SKU: "nồi cơm điện Z067-WH-00-GDD", "51118880508 S219-BK-..."
  // -> SKU bắt đầu từ mã đầu tiên dạng "ABC123-..." (có số và dấu gạch ngang).
  const inside = m[2].trim();
  const code = inside.match(/(?:^|\s)([A-Za-z]*\d[A-Za-z0-9]*-\S.*)$/);
  let sku = code ? code[1].trim() : inside.replace(/^\d{6,}\s+/, '').trim();
  if (/^\d+$/.test(sku)) sku = ''; // chỉ là ID phân loại, không phải SKU
  return { model: m[1].trim(), sku };
}

// Tiền: một số API trả giá nhân 100.000
function money(v) {
  const n = num(v);
  return n >= 1e9 && n % 1000 === 0 ? n / 100000 : n;
}

function timeOf(v) {
  const n = num(v);
  if (!n) return 0;
  return n > 1e12 ? Math.floor(n / 1000) : n; // ms -> s
}

const IMG = (h) => (!h ? '' : String(h).startsWith('http') ? h : `https://cf.shopee.vn/file/${h}_tn`);

// "Seka 4L [51118880508 S219-BK-00-...]" -> tên phân loại "Seka 4L"
function cleanModel(text) {
  return String(text || '').replace(/^Variation:\s*/i, '').replace(/\s*\[[^\]]*\]\s*$/, '').trim();
}

function parseItem({ node: it, ctx }) {
  // Tìm trong chính dòng sản phẩm trước, rồi tới các object cha gần nhất.
  const scopes = [it, ...ctx];
  const find = (keys, test) => {
    for (const s of scopes) {
      const v = findDeep(s, keys, test);
      if (v !== undefined) return v;
    }
    return undefined;
  };
  const variationText = find(['description', 'model_description', 'variation_description', 'model_name', 'variation_name', 'variation'], isVariationText) || '';
  const variation = parseVariation(variationText);
  const modelRaw = find(['model_name', 'variation_name', 'variation', 'model_desc', 'tier_variation_name'], (v) => isText(v) && !isVariationText(v)) || '';
  // `name` ở dòng model có thể chỉ là tên phân loại. Tìm tên sản phẩm
  // tường minh ở mọi scope trước, rồi mới dùng title/name của nhóm sản phẩm.
  const nameOk = (v) => isText(v) && !isVariationText(v);
  const productName = scopes.flatMap((s) => [s.product?.name, s.item_info?.item_name, s.item_info?.name, s.item_name, s.product_name]).find(nameOk)
    || scopes.map((s) => s.title).find(nameOk)
    || [...ctx, it].map((s) => s.name).find(nameOk)
    || findDeep(it, ['item_name', 'product_name'], nameOk)
    || findDeep(it, ['name', 'title'], nameOk)
    || '';
  return {
    itemId: Number(it.item_id ?? it.itemid ?? it.product_id),
    modelId: Number(it.model_id ?? it.modelid ?? 0),
    name: productName,
    model: cleanModel(it.item_model?.name || modelRaw) || variation.model,
    itemSku: it.product?.sku || find(['item_sku', 'parent_sku', 'product_sku'], isText) || '',
    modelSku: it.item_model?.sku || find(['model_sku', 'variation_sku', 'sku'], isText) || variation.sku,
    variationText,
    qty: num(find(['amount', 'quantity', 'item_count', 'qty']) ?? 1) || 1,
    price: money(find(['order_price', 'item_price', 'discounted_price', 'price'])),
    originalPrice: money(find(['original_price', 'price_before_discount'])),
    image: IMG(find(['image', 'item_image', 'cover_image', 'product_image'], isText))
  };
}

// "Lấy hàng vào ngày {timestamp}" -> "Lấy hàng vào ngày 15/10/2026".
// Giá trị thay vào {tên} lấy từ các trường cùng tên trong status_description (hoặc mảng tham số).
export function describeStatus(desc, fallback = null) {
  if (!desc) return '';
  if (typeof desc === 'string') return desc;
  const tpl = desc.description_value || desc.description || desc.text || '';
  if (!isText(tpl)) return '';
  const fmtTs = (v) => {
    const n = num(v);
    if (n < 1e9) return String(v);
    const d = new Date((n > 1e12 ? n : n * 1000));
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  // Tập tham số: mọi cặp key/value trong desc (kể cả trong mảng tham số dạng {key, value})
  const params = {};
  (function walk(o) {
    if (!o || typeof o !== 'object') return;
    if (!Array.isArray(o) && o.key !== undefined && o.value !== undefined) params[o.key] = o.value;
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === 'object') walk(v);
      else if (k !== 'description_value') params[k] = params[k] ?? v;
    }
  })(desc);
  // Không có mốc thời gian trong status_description thì tìm trong status_info (fallback)
  const anyTs = Object.values(params).find((v) => num(v) >= 1e9)
    ?? (fallback ? findDeep(fallback, ['timestamp', 'pickup_time', 'ship_by_date', 'deadline', 'time', 'update_time'], (v) => num(v) >= 1e9) : undefined);
  return tpl.replace(/\{(\w+)\}/g, (_, name) => {
    const v = params[name] ?? (/time|date|timestamp/i.test(name) ? anyTs : undefined);
    if (v === undefined) return `{${name}}`;
    return /time|date|timestamp/i.test(name) || num(v) >= 1e9 ? fmtTs(v) : String(v);
  });
}

// Mọi object nằm dưới key `key` ở mọi cấp
function allObjectsByKey(obj, key) {
  const out = [];
  const seen = new Set();
  (function walk(o) {
    if (!o || typeof o !== 'object' || seen.has(o)) return;
    seen.add(o);
    if (!Array.isArray(o) && o[key] && typeof o[key] === 'object') out.push(o[key]);
    for (const v of Object.values(o)) walk(v);
  })(obj);
  return out;
}

// Mã đơn Shopee bắt đầu bằng YYMMDD: "261015N7H1YQ42" -> 15/10/2026
export function dateFromOrderSn(sn) {
  const m = String(sn || '').match(/^(\d{2})(\d{2})(\d{2})/);
  if (!m) return null;
  const [y, mo, d] = [2000 + Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, m: mo, d, text: `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${y}`, time: new Date(y, mo - 1, d).getTime() / 1000 };
}

const TRACKING_KEYS = ['tracking_number', 'tracking_no', 'third_party_tn', 'shipping_traceno', 'consignment_no', 'logistics_tracking_number', 'tn'];

/**
 * card: order card từ danh sách đơn. detail: dữ liệu chi tiết đơn (nếu đã tải), được ưu tiên khi có.
 */
export function parseOrder(card, detail = null) {
  const src = detail ? { detail, card } : card;
  const ext = card.order_ext_info || {};
  const header = card.card_header || {};
  const buyer = header.buyer_info || findDeep(src, ['buyer_info']) || {};
  const pick = (keys, test) => findDeep(src, keys, test);

  let items = findItems(src).map(parseItem);
  // Không tìm thấy dòng sản phẩm có item_id: dựng 1 dòng từ chữ "Variation: ..." nếu có
  if (!items.length) {
    const vt = findDeep(src, ['description', 'model_name', 'variation'], isVariationText);
    if (vt) {
      const v = parseVariation(vt);
      items = [{ itemId: 0, modelId: 0, name: findDeep(src, ['item_name', 'product_name'], isText) || '', model: v.model,
        itemSku: '', modelSku: v.sku, variationText: vt, qty: 1, price: 0, originalPrice: 0, image: '' }];
    }
  }

  // Trạng thái: chỉ nhận chữ mô tả, không lấy số mã trạng thái hay dòng "Variation: ..."
  const statusOk = (v) => isText(v) && !isVariationText(v) && !/^\d+$/.test(v.trim());

  // Kiện hàng: card.package_level_order_card.package_list[]
  //   .fulfilment_info.tracking_number_list[]  -> mã vận đơn
  //   .status_info.status                      -> trạng thái
  //   .status_info.status_description.description_value (có {timestamp}) -> mô tả trạng thái
  const packages = (card.package_level_order_card && card.package_level_order_card.package_list) || [];
  // Mã vận đơn có thể nằm ở từng kiện hàng hoặc ngay card.fulfilment_info
  const pkgTracking = [...new Set([
    ...packages.flatMap((p) => (p.fulfilment_info && p.fulfilment_info.tracking_number_list) || []),
    ...((card.fulfilment_info && card.fulfilment_info.tracking_number_list) || [])
  ].filter(isText))];
  // Trạng thái: ưu tiên status_info của kiện hàng, rồi status_info cấp đơn, rồi mọi status_info khác
  const statusInfos = [...packages.map((p) => p.status_info), card.status_info,
    card.package_level_order_card && card.package_level_order_card.status_info, ...allObjectsByKey(card, 'status_info')].filter(Boolean);
  const pkgStatus = statusInfos.find((s) => statusOk(s.status) || statusOk(s.status_text) || statusOk(s.status_name));
  if (pkgStatus && !statusOk(pkgStatus.status)) pkgStatus.status = pkgStatus.status_text || pkgStatus.status_name;
  const pkgChannel = [...packages.map((p) => p.fulfilment_info || {}), card.fulfilment_info || {}].find((f) => f && (f.fulfilment_channel_name || f.channel_name));

  // Kiện hàng để in phiếu giao: mã kiện (OFG...) + kênh vận chuyển (channel_id, vd 50021 = SPX)
  const CHANNEL_KEYS = ['channel_id', 'fulfilment_channel_id', 'fulfillment_channel_id', 'logistics_channel_id', 'checkout_channel_id'];
  const isId = (v) => num(v) > 0;
  const cardChannel = findDeep(card, CHANNEL_KEYS, isId);
  let shipPackages = packages
    .map((p) => ({ packageNumber: p.package_number || findDeep(p, ['package_number', 'package_sn'], isText) || '', channelId: num(findDeep(p, CHANNEL_KEYS, isId) || cardChannel) }))
    .filter((p) => p.packageNumber);
  if (!shipPackages.length) {
    const pn = findDeep(card, ['package_number', 'package_sn'], isText);
    if (pn) shipPackages = [{ packageNumber: pn, channelId: num(cardChannel) }];
  }
  const orderSn = String(header.order_sn ?? pick(['order_sn']) ?? '');
  const snDate = dateFromOrderSn(orderSn);

  return {
    orderId: String(ext.order_id ?? pick(['order_id']) ?? ''),
    orderSn,
    buyer: buyer.username || buyer.buyer_username || pick(['buyer_username', 'username'], isText) || '',
    buyerId: String(ext.buyer_user_id ?? buyer.user_id ?? pick(['buyer_user_id', 'buyer_userid']) ?? ''),
    statusCode: (statusInfos.map((x) => x.status).find((v) => /^\d+$/.test(String(v ?? ''))) ?? ''),
    status: (pkgStatus && pkgStatus.status)
      || pick(['status_text', 'order_status_text', 'status_desc', 'status_title', 'list_view_status_text', 'status_name'], statusOk) || '',
    statusNote: (pkgStatus && describeStatus(pkgStatus.status_description, pkgStatus))
      || pick(['sub_status_text', 'status_sub_text', 'status_sub_title'], statusOk) || '',
    // Ngày đặt lấy từ 6 ký tự đầu mã đơn (YYMMDD); nếu không được mới dùng thời gian Shopee trả về
    orderDate: snDate ? snDate.text : '',
    createTime: (snDate && snDate.time) || timeOf(pick(['create_time', 'order_create_time', 'ctime'])),
    total: money(pick(['total_price', 'order_total', 'buyer_total_amount', 'total_amount', 'order_price_total'])),
    payment: pick(['payment_method_name', 'payment_method', 'payment_channel_name', 'payment_method_text'], isText) || '',
    shippingType: pick(['shipping_method_name', 'fulfilment_channel_type', 'channel_type_name'], isText) || '',
    shipping: (pkgChannel && (pkgChannel.fulfilment_channel_name || pkgChannel.channel_name)) || pick(['fulfilment_channel_name', 'fulfillment_channel_name', 'channel_name', 'logistics_channel_name', 'shipping_channel_name', 'carrier_name'], isText) || '',
    // Mã vận đơn: ưu tiên tracking_number_list của kiện hàng (nhiều kiện thì nối bằng ", ")
    tracking: pkgTracking.join(', ') || (detail ? findDeep(detail, TRACKING_KEYS, isText) : '') || '',
    shipBy: timeOf(pick(['ship_by_date', 'days_to_ship_deadline', 'ship_by_time', 'pickup_time', 'pickup_date'])),
    note: pick(['remark', 'buyer_note', 'message_to_seller', 'note'], isText) || '',
    address: detail ? (pick(['full_address', 'shipping_address', 'address'], isText) || '') : '',
    shippingFee: detail ? money(pick(['actual_shipping_fee', 'shipping_fee', 'estimated_shipping_fee'])) : 0,
    escrow: detail ? money(pick(['escrow_amount', 'seller_income', 'order_income'])) : 0,
    items,
    packages: shipPackages,
    raw: card,
    detail
  };
}

// Làm phẳng object: { "a.b[0].c": value } — dùng cho xem "toàn bộ thông tin".
export function flatten(obj, prefix = '', out = {}) {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    out[prefix] = obj;
    return out;
  }
  const entries = Array.isArray(obj) ? obj.map((v, i) => [`[${i}]`, v]) : Object.entries(obj);
  if (!entries.length) out[prefix] = Array.isArray(obj) ? '[]' : '{}';
  for (const [k, v] of entries) {
    const key = Array.isArray(obj) ? `${prefix}${k}` : prefix ? `${prefix}.${k}` : k;
    flatten(v, key, out);
  }
  return out;
}

// ---------- Doanh thu (get_order_income_components) ----------

// Các khoản hay dùng -> tên cột (theo field_name của Shopee)
export const INCOME_FIELDS = [
  ['MERCHANDISE_SUBTOTAL', 'Tổng tiền sản phẩm'],
  ['SHIPPING_FEE_PAID_BY_BUYER', 'Phí VC người mua trả'],
  ['ACTUAL_SHIPPING_FEE', 'Phí VC ước tính'],
  ['SHIPPING_REBATE_FROM_SHOPEE', 'Phí VC Shopee trợ giá'],
  ['COMMISSION_FEE', 'Phí cố định'],
  ['SERVICE_FEE', 'Phí dịch vụ'],
  ['TRANSACTION_FEE', 'Phí xử lý giao dịch'],
  ['FEES_AND_CHARGES', 'Tổng phụ phí'],
  ['VAT_WHT_AMOUNT', 'Thuế GTGT'],
  ['PIT_WHT_AMOUNT', 'Thuế TNCN'],
  ['TAX_SUBTOTAL', 'Tổng thuế'],
  ['ESCROW_AMOUNT', 'Doanh thu ước tính']
];

// Tiền trong API doanh thu luôn nhân 100.000
const incomeMoney = (v) => Math.round(num(v) / 1000) / 100;

/**
 * -> { byField: { FIELD_NAME: amount }, rows: [{ level, field, name, amount, caption, details: [{ name, amount }] }] }
 */
export function parseIncome(data) {
  const breakdown = (data && data.seller_income_breakdown && data.seller_income_breakdown.breakdown) || [];
  const byField = {};
  const rows = [];
  const feeDetails = (ext) => {
    if (!ext) return [];
    const lists = [ext.service_fee_infos, ext.commission_fee_infos, ext.seller_txn_fee_info ? [ext.seller_txn_fee_info] : null]
      .filter(Array.isArray).flat();
    return lists
      .filter((f) => f && (f.name || num(f.amount) || num(f.fee_rate)))
      .map((f) => ({ name: f.name || '', amount: incomeMoney(f.amount), rate: f.fee_rate ? f.fee_rate / 1000 : 0 }));
  };
  const add = (b, level) => {
    const amount = b.hide_amount ? null : incomeMoney(b.amount);
    if (b.field_name) byField[b.field_name] = amount;
    rows.push({ level, field: b.field_name || '', name: b.display_name || b.field_name || '', amount, caption: b.caption || '', details: feeDetails(b.ext_info) });
    for (const s of b.sub_breakdown || []) add(s, level + 1);
  };
  breakdown.forEach((b) => add(b, 0));
  return { byField, rows, escrow: byField.ESCROW_AMOUNT ?? null };
}
