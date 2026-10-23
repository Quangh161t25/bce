// Modal Chi tiết & Chỉnh sửa sản phẩm (chuẩn cấu trúc Shopee Seller Portal)
import { products, sleep, getShopWarehouses, extractLocationsStock, toNumber } from './shopee-api.js';
import { extractMedia } from './media.js';

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => (Number(n) || 0).toLocaleString('vi-VN') + '₫';

const shortenWarehouseName = (name) => {
  if (!name) return 'Kho';
  let s = String(name).trim();
  s = s.replace(/^(kho|warehouse)\s+/i, '');
  s = s.replace(/\s*\(.*?\)\s*/g, '');
  if (s.length > 15) s = s.slice(0, 14) + '…';
  return s || 'Kho';
};

let currentItemId = null;
let currentRawData = null;
let currentMedia = null;
let currentWarehouses = [];
let currentActiveTab = 'all';
let isViewAllMode = true;
let saveCallback = null;
let hooks = { toast: () => {} };

export function initProductEditModal(h = {}) {
  hooks = { ...hooks, ...h };

  const modal = $('#pEditModal');
  if (!modal) return;

  // Đóng modal
  const closeModal = () => modal.classList.add('hidden');
  $('#pEditModalClose')?.addEventListener('click', closeModal);
  $('#btnPEditCancel')?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target.id === 'pEditModal') closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Chuyển tabs & cuộn tới section
  const tabBtns = $$('.p-edit-nav-tab', modal);
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.pTab;
      handleTabClick(tabId);
    });
  });

  // Nút Lưu lên Shopee
  $('#btnPEditSave')?.addEventListener('click', handleSaveToShopee);
}

function handleTabClick(tabId) {
  currentActiveTab = tabId;
  const modal = $('#pEditModal');
  const bodyEl = $('#pEditModalBody');
  if (!modal || !bodyEl) return;

  $$('.p-edit-nav-tab', modal).forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.pTab === tabId);
  });

  if (tabId === 'all') {
    isViewAllMode = true;
    bodyEl.classList.add('view-all');
    $$('.p-edit-tab-panel', modal).forEach((panel) => {
      panel.style.display = 'block';
    });
    bodyEl.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  if (isViewAllMode) {
    // Trong chế độ cuộn liên tục: cuộn tới section tương ứng
    const targetPanel = $(`#pEditPanel_${tabId}`, bodyEl);
    if (targetPanel) {
      targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } else {
    // Chế độ xem từng Tab đơn lẻ
    $$('.p-edit-tab-panel', modal).forEach((panel) => {
      panel.style.display = panel.id === `pEditPanel_${tabId}` ? 'block' : 'none';
    });
    bodyEl.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function adaptFallbackProduct(fb, raw = {}) {
  const out = { ...(raw || {}) };

  out.id = out.id || out.product_id || fb.itemId;
  out.name = out.name || fb.name || '';
  out.parent_sku = out.parent_sku || fb.parentSku || fb.sku || '';
  out.description = out.description || fb.description || fb.desc || '';
  out.link = out.link || fb.link || (fb.itemId ? `https://shopee.vn/product/0/${fb.itemId}` : '');
  out.create_time = out.create_time || fb.createTime || 0;
  out.status = out.status ?? fb.status ?? 1;
  out.weight = out.weight || fb.weight || 0;
  if (!out.dimension && fb.dimension) out.dimension = fb.dimension;

  // Images
  if (!Array.isArray(out.images) || !out.images.length) {
    out.images = (fb.images || []).map(img => (typeof img === 'string' ? img : img.url || img.thumb || ''));
  }
  if (!Array.isArray(out.description_images) || !out.description_images.length) {
    out.description_images = (fb.descImages || []).map(img => (typeof img === 'string' ? img : img.url || img.thumb || ''));
  }

  // Model list & Tiers
  if (!Array.isArray(out.model_list) || out.model_list.length === 0) {
    if (Array.isArray(fb.models) && fb.models.length > 0) {
      out.model_list = fb.models.map((m, idx) => ({
        id: Number(m.modelId || m.id || idx),
        model_id: Number(m.modelId || m.id || idx),
        name: m.name || m.modelName || 'Mặc định',
        sku: m.sku || m.modelSku || '',
        normal_price: m.price || 0,
        promo_price: m.promoPrice || 0,
        price_info: {
          input_normal_price: m.price || 0,
          normal_price: m.price || 0,
          input_promotion_price: m.promoPrice || 0,
          promotion_price: m.promoPrice || 0
        },
        stock: m.stock !== undefined ? m.stock : 0,
        sold: m.sold || 0,
        locationStocks: m.locationStocks || [],
        tier_index: [idx]
      }));

      if (!out.tier_variation || !out.tier_variation.length) {
        if (fb.models.length > 1) {
          out.tier_variation = [{
            name: 'Phân loại',
            options: fb.models.map(m => m.name || 'Mặc định'),
            images: fb.models.map(m => m.image || '')
          }];
        }
      }
    } else {
      out.model_list = [{
        id: 0,
        model_id: 0,
        name: 'Mặc định',
        sku: out.parent_sku || '',
        normal_price: fb.price || 0,
        stock: fb.stock || 0,
        locationStocks: []
      }];
    }
  }

  return out;
}

export async function openProductEditModal(itemId, fallbackProduct = null, onSaved = null) {
  currentItemId = Number(itemId);
  saveCallback = onSaved;

  const modal = $('#pEditModal');
  if (!modal) return;

  const titleEl = $('#pEditModalTitle');
  const idEl = $('#pEditModalId');
  const subEl = $('#pEditModalShop');
  const linkPortal = $('#btnPEditOpenShopee');
  const linkPublic = $('#btnPEditViewPublic');
  const bodyEl = $('#pEditModalBody');
  const statusMsg = $('#pEditStatusMsg');
  const banner = $('#pEditNoticeBanner');

  if (titleEl) titleEl.textContent = fallbackProduct?.name || `Chi tiết & Chỉnh sửa sản phẩm #${itemId}`;
  if (idEl) idEl.textContent = itemId;
  if (subEl) subEl.textContent = fallbackProduct?.gian ? ` · Gian: ${fallbackProduct.gian}` : '';
  if (linkPortal) linkPortal.href = `https://banhang.shopee.vn/portal/product/${itemId}`;
  if (linkPublic) linkPublic.href = fallbackProduct?.link || `https://shopee.vn/product/0/${itemId}`;
  if (statusMsg) statusMsg.textContent = '';
  if (banner) banner.style.display = 'none';

  modal.classList.remove('hidden');

  // Loading state
  bodyEl.innerHTML = `
    <div style="text-align:center;padding:50px 20px;color:#0284c7;font-weight:600;">
      <span style="display:inline-block;animation:spin 1s linear infinite;font-size:24px;margin-bottom:8px;">⏳</span>
      <div>Đang đọc thông tin chi tiết sản phẩm #${itemId} từ Shopee Seller Portal...</div>
      <div style="font-size:12px;color:#64748b;margin-top:6px;font-weight:400;">Bao gồm: Hình ảnh, Video, Mô tả, Thuộc tính, Phân loại, Giá & Tồn kho theo từng kho...</div>
    </div>
  `;

  try {
    // Tải đồng thời thông tin sản phẩm, tồn kho theo kho, và danh sách kho của shop
    const [rawRes, stockRes, whRes] = await Promise.allSettled([
      products.getRaw(itemId),
      products.getStock([itemId]),
      getShopWarehouses()
    ]);

    let raw = rawRes.status === 'fulfilled' ? rawRes.value : null;
    const stockMap = stockRes.status === 'fulfilled' ? stockRes.value : new Map();
    const warehouses = whRes.status === 'fulfilled' ? (whRes.value || []) : [];
    currentWarehouses = warehouses;

    if (!raw && fallbackProduct) {
      raw = fallbackProduct.raw || fallbackProduct;
    }
    if (fallbackProduct) {
      raw = adaptFallbackProduct(fallbackProduct, raw);
    }
    if (!raw) {
      throw new Error(`Không thể nạp dữ liệu sản phẩm #${itemId} từ Shopee. Hãy đảm bảo bạn đã đăng nhập Kênh Người Bán.`);
    }

    // Trích xuất media đầy đủ
    currentMedia = extractMedia(raw);
    if (!currentMedia.description && fallbackProduct?.description) {
      currentMedia.description = fallbackProduct.description;
    }
    if (!currentMedia.description && fallbackProduct?.desc) {
      currentMedia.description = fallbackProduct.desc;
    }
    if (!currentMedia.descImages?.length && fallbackProduct?.descImages?.length) {
      currentMedia.descImages = fallbackProduct.descImages.map((u) => (typeof u === 'string' ? { url: u, thumb: u } : u));
    }
    if (!currentMedia.images?.length && fallbackProduct?.images?.length) {
      currentMedia.images = fallbackProduct.images.map((u, idx) => (typeof u === 'string' ? { url: u, thumb: u, note: idx === 0 ? 'Ảnh bìa' : `Ảnh ${idx + 1}` } : u));
    }
    if (!currentMedia.videos?.length && fallbackProduct?.videos?.length) {
      currentMedia.videos = fallbackProduct.videos;
    }

    // Đồng bộ tồn kho chính xác từ stockMap hoặc fallbackProduct vào models
    const stockList = stockMap.get(Number(itemId)) || [];
    const stockByModel = new Map();
    stockList.forEach((s) => {
      stockByModel.set(Number(s.modelId), s);
    });

    if (Array.isArray(raw.model_list) && raw.model_list.length > 0) {
      raw.model_list.forEach((m) => {
        const mId = Number(m.id ?? m.model_id ?? 0);
        const fbModel = fallbackProduct?.models?.find((x) => Number(x.modelId) === mId);
        const liveStock = stockByModel.get(mId);

        if (liveStock) {
          m.stock = liveStock.stock;
          m.locationStocks = liveStock.locations || [];
        } else if (fbModel && fbModel.stock !== undefined) {
          m.stock = fbModel.stock;
          m.locationStocks = fbModel.locationStocks || [];
        } else {
          const locs = extractLocationsStock(m, raw, warehouses);
          m.locationStocks = locs;
          m.stock = locs.reduce((a, b) => a + (b.stock || 0), 0) || toNumber(m.stock_detail?.total_available_stock ?? m.seller_stock_info?.normal_stock ?? m.stock ?? 0);
        }
      });
    } else if (fallbackProduct?.models?.length > 0) {
      raw.model_list = fallbackProduct.models.map((m) => ({
        id: m.modelId,
        model_id: m.modelId,
        name: m.name,
        sku: m.sku,
        price: m.price,
        promo_price: m.promoPrice,
        stock: m.stock,
        locationStocks: m.locationStocks || []
      }));
    } else {
      // SP đơn không có phân loại
      const liveStock = stockByModel.get(0) || stockList[0];
      const singleStock = liveStock ? liveStock.stock : (fallbackProduct?.stock ?? raw.stock ?? 0);
      const locs = liveStock ? liveStock.locations : (fallbackProduct?.models?.[0]?.locationStocks || extractLocationsStock(raw, raw, warehouses));
      raw.model_list = [{
        id: 0,
        model_id: 0,
        name: 'Mặc định',
        sku: raw.parent_sku || fallbackProduct?.sku || '',
        price: fallbackProduct?.price || raw.price || 0,
        promo_price: fallbackProduct?.promoPrice || 0,
        stock: singleStock,
        locationStocks: locs
      }];
    }

    currentRawData = raw;

    // Kiểm tra nếu sản phẩm đang tham gia khuyến mãi / Flash Sale
    const isPromoActive = !!(raw.promotion_info || raw.flash_sale_info || (raw.model_list || []).some((m) => m.price_info?.input_promotion_price > 0 || (m.promo_price > 0 && m.promo_price < m.price)));
    if (banner && isPromoActive) {
      banner.style.display = 'flex';
    }

    renderModalPanels(raw, currentMedia, warehouses, fallbackProduct);

    // Mặc định hiển thị TẤT CẢ các mục liên tục giống Shopee Portal
    bodyEl.classList.add('view-all');
    $$('.p-edit-nav-tab', modal).forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.pTab === 'all');
    });
    bodyEl.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.warn('Lỗi đọc chi tiết sản phẩm:', err);
    bodyEl.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="color:#ef4444;font-weight:700;font-size:15px;margin-bottom:8px;">⚠️ Không thể đọc từ Kênh Người Bán: ${esc(err.message)}</div>
        <div class="muted" style="font-size:12.5px;margin-bottom:16px;">Có thể phiên đăng nhập Shopee đã hết hạn hoặc sản phẩm thuộc gian hàng khác.</div>
        <div style="display:inline-flex;gap:8px;">
          <button id="btnRetryLoadModal" class="btn small primary">🔄 Thử lại</button>
          <a href="https://banhang.shopee.vn/portal/product/${itemId}" target="_blank" class="btn small">🔗 Mở trực tiếp trên Shopee</a>
        </div>
      </div>
    `;
    $('#btnRetryLoadModal')?.addEventListener('click', () => openProductEditModal(itemId, fallbackProduct, onSaved));
  }
}

function renderModalPanels(raw, media, warehouses = [], fallbackProduct = null) {
  const bodyEl = $('#pEditModalBody');
  if (!bodyEl) return;

  const pName = raw.name || raw.title || '';
  const pSku = raw.parent_sku || raw.item_sku || raw.product_sku || raw.sku || '';
  const pDesc = media.description || raw.description || raw.desc || '';
  const weight = raw.weight || 0;
  const dim = raw.dimension || {};
  const length = dim.package_length || 0;
  const width = dim.package_width || 0;
  const height = dim.package_height || 0;
  const daysToShip = raw.days_to_ship || 2;
  const isPreOrder = !!(raw.is_pre_order || daysToShip > 2);

  // Categories
  const catPath = (raw.category_path || raw.categories || [])
    .map((c) => c.name || c.cat_name || c.display_name)
    .filter(Boolean)
    .join(' ❯ ') || (raw.category_id ? `ID Ngành hàng: ${raw.category_id}` : 'Chưa phân loại');

  // Video
  const videoObj = (media.videos && media.videos[0]) || null;

  // Thống kê
  const soldCount = raw.statistics?.sold_count ?? raw.sold ?? raw.historical_sold ?? fallbackProduct?.sold ?? 0;
  const viewCount = raw.statistics?.view_count ?? raw.views ?? fallbackProduct?.views ?? 0;
  const likeCount = raw.statistics?.liked_count ?? raw.likes ?? fallbackProduct?.likes ?? 0;

  // Brand / Thương hiệu
  const brandName = raw.brand?.original_brand_name || raw.brand_name || raw.brand || (raw.attributes || []).find((a) => (a.name || a.attribute_name || '').toLowerCase().includes('brand') || (a.name || a.attribute_name || '').toLowerCase().includes('thương hiệu'))?.value || 'NoBrand';

  // Long images (3:4)
  const longImages = (raw.long_images || raw.cover_3_4 || []).map((img) => (typeof img === 'string' ? { url: img, thumb: img } : img));

  bodyEl.innerHTML = `
    <!-- PANEL 1: THÔNG TIN CƠ BẢN -->
    <div id="pEditPanel_basic" class="p-edit-tab-panel">
      <div class="p-edit-panel-header">
        <span>📌 1. THÔNG TIN CƠ BẢN</span>
        <span style="font-size:11px;font-weight:normal;color:#64748b;">Mã SP: ${raw.id || currentItemId}</span>
      </div>

      <!-- 1. Hình ảnh sản phẩm (1:1) -->
      <div class="p-edit-section">
        <div class="p-edit-section-title">
          <span>🖼️ Hình ảnh sản phẩm (Tỷ lệ 1:1)</span>
          <span style="font-size:11px;font-weight:600;color:#0284c7;margin-left:auto;">${media.images.length} ảnh</span>
        </div>
        <div class="p-edit-img-grid">
          ${media.images.map((img, i) => `
            <div class="p-edit-img-tile" title="${img.note || (i === 0 ? 'Ảnh bìa' : `Ảnh ${i + 1}`)}">
              <img src="${esc(img.thumb || img.url)}" loading="lazy">
              ${i === 0 ? '<span class="p-edit-img-badge">Ảnh bìa</span>' : ''}
              <div style="position:absolute;bottom:0;inset-inline:0;background:rgba(0,0,0,0.65);display:flex;justify-content:center;padding:2px;gap:6px;">
                <a href="${esc(img.url)}" target="_blank" style="color:#fff;font-size:10px;text-decoration:none;" title="Xem ảnh gốc">🔍</a>
                <button type="button" class="btn-copy-img" data-copy-url="${esc(img.url)}" style="background:none;border:none;color:#fff;font-size:10px;cursor:pointer;padding:0;" title="Copy link ảnh">📋</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 2. Hình ảnh tỷ lệ 3:4 (nếu có) -->
      ${longImages.length ? `
        <div class="p-edit-section">
          <div class="p-edit-section-title">
            <span>📐 Hình ảnh tỷ lệ 3:4 (Ảnh dài)</span>
            <span style="font-size:11px;font-weight:600;color:#0284c7;margin-left:auto;">${longImages.length} ảnh</span>
          </div>
          <div class="p-edit-img-grid">
            ${longImages.map((img, i) => `
              <div class="p-edit-img-tile" style="aspect-ratio:3/4;">
                <img src="${esc(img.thumb || img.url)}" loading="lazy">
                <span class="p-edit-img-badge" style="background:#0284c7;">3:4</span>
                <div style="position:absolute;bottom:0;inset-inline:0;background:rgba(0,0,0,0.65);display:flex;justify-content:center;padding:2px;gap:6px;">
                  <a href="${esc(img.url)}" target="_blank" style="color:#fff;font-size:10px;text-decoration:none;">🔍</a>
                  <button type="button" class="btn-copy-img" data-copy-url="${esc(img.url)}" style="background:none;border:none;color:#fff;font-size:10px;cursor:pointer;padding:0;">📋</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- 3. Video sản phẩm -->
      <div class="p-edit-section">
        <div class="p-edit-section-title">
          <span>🎬 Video sản phẩm</span>
          ${videoObj ? `<span class="badge" style="background:#e0f2fe;color:#0369a1;font-size:11px;padding:2px 6px;">${videoObj.duration ? videoObj.duration + 's' : 'MP4'}</span>` : ''}
        </div>
        ${videoObj && videoObj.url ? `
          <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;">
            <video src="${esc(videoObj.url)}" ${videoObj.thumb ? `poster="${esc(videoObj.thumb)}"` : ''} controls style="max-height:180px;border-radius:6px;background:#000;border:1px solid #cbd5e1;"></video>
            <div style="font-size:12px;color:#475569;line-height:1.7;">
              <div>• <b>Định dạng:</b> MP4</div>
              <div>• <b>Thời lượng:</b> ${videoObj.duration ? videoObj.duration + ' giây' : 'Không xác định'}</div>
              ${videoObj.id ? `<div>• <b>Video ID:</b> <code style="font-size:11px;">${esc(videoObj.id)}</code></div>` : ''}
              <div style="margin-top:8px;display:flex;gap:6px;">
                <a href="${esc(videoObj.url)}" target="_blank" class="btn small" style="text-decoration:none;">▶ Mở video</a>
                <button type="button" class="btn small btn-copy-img" data-copy-url="${esc(videoObj.url)}">📋 Copy link video</button>
              </div>
            </div>
          </div>
        ` : '<div class="muted" style="font-size:12px;">Sản phẩm chưa có video giới thiệu.</div>'}
      </div>

      <!-- 4. Tên sản phẩm -->
      <div class="p-edit-section">
        <div class="p-edit-section-title">
          <span>* Tên sản phẩm</span>
          <span id="pEditNameCounter" style="font-size:11px;font-weight:600;color:#64748b;margin-left:auto;">${pName.length}/120</span>
        </div>
        <input id="pEditNameInput" type="text" maxlength="120" value="${esc(pName)}" style="width:100%;font-size:13.5px;font-weight:600;padding:8px 10px;border:1px solid #cbd5e1;border-radius:5px;box-sizing:border-box;">
      </div>

      <!-- 5. Ngành hàng & Thương hiệu -->
      <div class="p-edit-section">
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <div style="flex:2;min-width:240px;">
            <div class="p-edit-section-title"><span>📂 Ngành hàng</span></div>
            <div style="font-size:12.5px;color:#334155;background:#f1f5f9;padding:8px 12px;border-radius:5px;border:1px solid #e2e8f0;font-weight:500;">
              ${esc(catPath)}
            </div>
          </div>
          <div style="flex:1;min-width:160px;">
            <div class="p-edit-section-title"><span>🏷️ Thương hiệu (Brand)</span></div>
            <div style="font-size:12.5px;color:#0369a1;background:#f0f9ff;padding:8px 12px;border-radius:5px;border:1px solid #bae6fd;font-weight:700;">
              ${esc(brandName)}
            </div>
          </div>
        </div>
      </div>

      <!-- 6. Mã SKU sản phẩm cha & Item ID -->
      <div class="p-edit-section">
        <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">SKU Sản phẩm cha (Parent SKU):</label>
            <input id="pEditParentSkuInput" type="text" value="${esc(pSku)}" placeholder="Nhập SKU sản phẩm cha..." style="width:240px;font-size:13px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:5px;box-sizing:border-box;">
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">Mã sản phẩm (Item ID):</label>
            <div style="display:inline-flex;align-items:center;gap:6px;">
              <code style="font-size:13px;padding:6px 10px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:4px;font-weight:700;">${currentItemId}</code>
              <button type="button" class="btn small" onclick="navigator.clipboard.writeText('${currentItemId}').then(() => alert('Đã chép Item ID: ${currentItemId}'))">📋 Copy ID</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PANEL 2: THÔNG TIN CHI TIẾT (ATTRIBUTES) -->
    <div id="pEditPanel_attributes" class="p-edit-tab-panel">
      <div class="p-edit-panel-header">
        <span>📌 2. THÔNG TIN CHI TIẾT &amp; THUỘC TÍNH (ATTRIBUTES)</span>
      </div>
      <div class="p-edit-section">
        <div class="p-edit-section-title"><span>📋 Thông số thuộc tính sản phẩm</span></div>
        ${renderAttributesTable(raw)}
      </div>
    </div>

    <!-- PANEL 3: THÔNG TIN BÁN HÀNG & TỒN KHO -->
    <div id="pEditPanel_sales" class="p-edit-tab-panel">
      <div class="p-edit-panel-header">
        <span>📌 3. THÔNG TIN BÁN HÀNG &amp; KHO HÀNG (PHÂN LOẠI, GIÁ &amp; TỒN KHO)</span>
      </div>
      ${renderSalesPanel(raw, media, warehouses)}
    </div>

    <!-- PANEL 4: MÔ TẢ SẢN PHẨM -->
    <div id="pEditPanel_description" class="p-edit-tab-panel">
      <div class="p-edit-panel-header">
        <span>📌 4. MÔ TẢ SẢN PHẨM</span>
        <span id="pEditDescCounter" style="font-size:11px;font-weight:600;color:#64748b;">${pDesc.length} ký tự</span>
      </div>
      <div class="p-edit-section">
        <div class="p-edit-section-title">
          <span>📝 Nội dung văn bản mô tả</span>
        </div>
        <textarea id="pEditDescInput" rows="14" placeholder="Nhập nội dung mô tả sản phẩm..." style="width:100%;font-size:13px;line-height:1.6;padding:12px;border:1px solid #cbd5e1;border-radius:6px;box-sizing:border-box;font-family:inherit;">${esc(pDesc)}</textarea>
      </div>

      <!-- Ảnh trong mô tả -->
      <div class="p-edit-section">
        <div class="p-edit-section-title">
          <span>🖼️ Ảnh trong mô tả (${media.descImages.length} ảnh)</span>
        </div>
        ${media.descImages.length ? `
          <div class="p-edit-img-grid">
            ${media.descImages.map((img, i) => `
              <div class="p-edit-img-tile" title="Ảnh mô tả ${i + 1}">
                <img src="${esc(img.thumb || img.url)}" loading="lazy">
                <div style="position:absolute;bottom:0;inset-inline:0;background:rgba(0,0,0,0.65);display:flex;justify-content:center;padding:2px;gap:6px;">
                  <a href="${esc(img.url)}" target="_blank" style="color:#fff;font-size:10px;text-decoration:none;" title="Xem ảnh">🔍</a>
                  <button type="button" class="btn-copy-img" data-copy-url="${esc(img.url)}" style="background:none;border:none;color:#fff;font-size:10px;cursor:pointer;padding:0;" title="Copy link">📋</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<div class="muted" style="font-size:12px;">Sản phẩm không có ảnh trong phần mô tả.</div>'}
      </div>
    </div>

    <!-- PANEL 5: VẬN CHUYỂN -->
    <div id="pEditPanel_shipping" class="p-edit-tab-panel">
      <div class="p-edit-panel-header">
        <span>📌 5. VẬN CHUYỂN</span>
      </div>
      <div class="p-edit-section">
        <div class="p-edit-section-title"><span>⚖️ Cân nặng &amp; Kích thước đóng gói</span></div>
        <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;">
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">Cân nặng sau khi đóng gói (gram):</label>
            <input id="pEditWeightInput" type="number" min="1" value="${weight || ''}" placeholder="ví dụ: 500" style="width:160px;padding:7px 10px;border:1px solid #cbd5e1;border-radius:5px;">
          </div>
          <div>
            <label style="display:block;font-size:12px;font-weight:600;color:#334155;margin-bottom:4px;">Kích thước đóng gói (cm):</label>
            <div style="display:inline-flex;gap:6px;align-items:center;">
              <input id="pEditLengthInput" type="number" min="1" value="${length || ''}" placeholder="Dài" style="width:70px;padding:7px 8px;text-align:center;border:1px solid #cbd5e1;border-radius:5px;">
              <span>×</span>
              <input id="pEditWidthInput" type="number" min="1" value="${width || ''}" placeholder="Rộng" style="width:70px;padding:7px 8px;text-align:center;border:1px solid #cbd5e1;border-radius:5px;">
              <span>×</span>
              <input id="pEditHeightInput" type="number" min="1" value="${height || ''}" placeholder="Cao" style="width:70px;padding:7px 8px;text-align:center;border:1px solid #cbd5e1;border-radius:5px;">
              <span class="muted" style="font-size:11.5px;">(Dài × Rộng × Cao)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Kênh vận chuyển -->
      <div class="p-edit-section">
        <div class="p-edit-section-title"><span>🚚 Kênh vận chuyển hỗ trợ</span></div>
        ${renderShippingChannels(raw)}
      </div>
    </div>

    <!-- PANEL 6: THÔNG TIN KHÁC -->
    <div id="pEditPanel_others" class="p-edit-tab-panel">
      <div class="p-edit-panel-header">
        <span>📌 6. THÔNG TIN KHÁC &amp; THỐNG KÊ</span>
      </div>
      <div class="p-edit-section">
        <div style="display:flex;flex-direction:column;gap:14px;">
          <!-- Pre-order -->
          <div>
            <label style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:600;cursor:pointer;">
              <input id="pEditPreOrderChk" type="checkbox" ${isPreOrder ? 'checked' : ''}>
              Tôi cần thời gian chuẩn bị hàng dài hơn (Hàng đặt trước)
            </label>
            <div id="pEditPreOrderWrap" style="margin-top:6px;margin-left:22px;display:${isPreOrder ? 'flex' : 'none'};align-items:center;gap:6px;font-size:12.5px;">
              <span>Thời gian chuẩn bị hàng:</span>
              <input id="pEditDaysToShipInput" type="number" min="2" max="30" value="${daysToShip}" style="width:65px;padding:4px 8px;border:1px solid #cbd5e1;border-radius:4px;text-align:center;">
              <span>ngày (từ 2 - 30 ngày)</span>
            </div>
          </div>

          <!-- Thống kê sản phẩm -->
          <div style="display:flex;gap:20px;flex-wrap:wrap;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;">
            <div style="font-size:13px;color:#334155;">
              🛒 <b>Đã bán:</b> <span style="font-weight:700;color:#0284c7;font-size:14px;">${soldCount.toLocaleString('vi-VN')}</span>
            </div>
            <div style="font-size:13px;color:#334155;">
              👁️ <b>Lượt xem:</b> <span style="font-weight:700;color:#0284c7;font-size:14px;">${viewCount.toLocaleString('vi-VN')}</span>
            </div>
            <div style="font-size:13px;color:#334155;">
              ❤️ <b>Lượt thích:</b> <span style="font-weight:700;color:#e11d48;font-size:14px;">${likeCount.toLocaleString('vi-VN')}</span>
            </div>
            <div style="font-size:13px;color:#334155;">
              ✨ <b>Tình trạng:</b> <span class="badge" style="background:#e0f2fe;color:#0369a1;padding:2px 7px;font-weight:600;">Mới (100%)</span>
            </div>
            <div style="font-size:13px;color:#334155;">
              🌐 <b>Trạng thái:</b>
              <span class="badge ${raw.status === 1 ? 'current' : 'end'}" style="padding:2px 7px;font-weight:600;">
                ${raw.status === 1 ? 'Đang bán' : (raw.status === 4 ? 'Bị khoá' : 'Đã ẩn')}
              </span>
            </div>
          </div>

          <!-- Thời gian -->
          <div style="font-size:12px;color:#64748b;border-top:1px dashed #e2e8f0;padding-top:10px;line-height:1.7;">
            <div>• Ngày tạo sản phẩm: ${raw.create_time ? new Date(raw.create_time * 1000).toLocaleString('vi-VN') : '-'}</div>
            <div>• Cập nhật lần cuối: ${raw.update_time ? new Date(raw.update_time * 1000).toLocaleString('vi-VN') : '-'}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Gắn sự kiện realtime
  const nameInput = $('#pEditNameInput');
  const nameCounter = $('#pEditNameCounter');
  if (nameInput && nameCounter) {
    nameInput.addEventListener('input', () => {
      nameCounter.textContent = `${nameInput.value.length}/120`;
    });
  }

  const descInput = $('#pEditDescInput');
  const descCounter = $('#pEditDescCounter');
  if (descInput && descCounter) {
    descInput.addEventListener('input', () => {
      descCounter.textContent = `${descInput.value.length} ký tự`;
    });
  }

  const preOrderChk = $('#pEditPreOrderChk');
  const preOrderWrap = $('#pEditPreOrderWrap');
  if (preOrderChk && preOrderWrap) {
    preOrderChk.addEventListener('change', () => {
      preOrderWrap.style.display = preOrderChk.checked ? 'flex' : 'none';
    });
  }

  // Sự kiện copy link ảnh
  bodyEl.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-copy-img');
    if (copyBtn && copyBtn.dataset.copyUrl) {
      navigator.clipboard.writeText(copyBtn.dataset.copyUrl).then(() => {
        hooks.toast('Đã sao chép link ảnh/video', 'success');
      });
    }
  });

  // Tự động cộng tổng tồn kho khi sửa ô tồn từng kho (.wh-stock-subinput)
  bodyEl.addEventListener('input', (e) => {
    const subInp = e.target.closest('.wh-stock-subinput');
    if (subInp) {
      const tr = subInp.closest('tr[data-model-id]');
      if (tr) {
        const subInps = tr.querySelectorAll('.wh-stock-subinput');
        const sum = Array.from(subInps).reduce((acc, inp) => acc + (parseInt(inp.value, 10) || 0), 0);
        const mainStockInp = tr.querySelector('.p-edit-model-stock');
        if (mainStockInp) mainStockInp.value = sum;
      }
    }
  });

  // Áp dụng hàng loạt cho phân loại
  const btnApplyAll = $('#btnPEditApplyAll');
  if (btnApplyAll) {
    btnApplyAll.addEventListener('click', () => {
      const bulkPrice = parseFloat($('#pEditBulkPrice').value);
      const bulkStock = parseInt($('#pEditBulkStock').value, 10);
      const bulkSku = $('#pEditBulkSku')?.value.trim();

      if (isNaN(bulkPrice) && isNaN(bulkStock) && !bulkSku) {
        return hooks.toast('Vui lòng nhập giá, tồn kho hoặc SKU chung cần áp dụng', 'error');
      }

      if (!isNaN(bulkPrice) && bulkPrice > 0) {
        $$('.p-edit-model-price').forEach((inp) => { inp.value = bulkPrice; });
      }
      if (!isNaN(bulkStock) && bulkStock >= 0) {
        $$('.p-edit-model-stock').forEach((inp) => { inp.value = bulkStock; });
        // Nếu có các kho phụ, chia vào kho đầu tiên
        $$('#pEditPanel_sales tr[data-model-id]').forEach((tr) => {
          const whInps = tr.querySelectorAll('.wh-stock-subinput');
          if (whInps.length > 0) {
            whInps[0].value = bulkStock;
            for (let i = 1; i < whInps.length; i++) whInps[i].value = 0;
          }
        });
      }
      if (bulkSku) {
        $$('.p-edit-model-sku').forEach((inp, idx) => {
          inp.value = `${bulkSku}-${idx + 1}`;
        });
      }
      hooks.toast('Đã áp dụng cho toàn bộ phân loại hàng', 'success');
    });
  }
}

function renderAttributesTable(raw) {
  const attrs = raw.attributes || raw.attribute_list || raw.product_attributes || [];

  if (!attrs.length) {
    return '<div class="muted" style="font-size:12px;">Sản phẩm chưa thiết lập thuộc tính chi tiết hoặc danh mục không yêu cầu thuộc tính.</div>';
  }

  return `
    <table class="grid" style="font-size:12.5px;border-collapse:collapse;width:100%;">
      <thead>
        <tr style="background:#f1f5f9;text-align:left;">
          <th style="padding:7px 10px;width:35%;border:1px solid #cbd5e1;">Tên thuộc tính</th>
          <th style="padding:7px 10px;border:1px solid #cbd5e1;">Giá trị</th>
        </tr>
      </thead>
      <tbody>
        ${attrs.map((a) => {
          const name = a.name || a.attribute_name || a.display_name || `Thuộc tính #${a.id || a.attribute_id}`;
          let val = a.value || a.attribute_value || '';
          if (!val && Array.isArray(a.values)) val = a.values.join(', ');
          if (!val && Array.isArray(a.value_list)) val = a.value_list.map((v) => v.name || v.value).join(', ');
          if (!val && Array.isArray(a.values_detail)) val = a.values_detail.map((v) => v.name || v.value).join(', ');
          if (!val) val = '-';

          return `
            <tr>
              <td style="padding:7px 10px;border:1px solid #cbd5e1;font-weight:600;color:#334155;">
                ${esc(name)}
                ${a.is_mandatory ? '<span style="color:#ef4444;font-size:11px;margin-left:4px;">* (Bắt buộc)</span>' : ''}
              </td>
              <td style="padding:7px 10px;border:1px solid #cbd5e1;color:#0f172a;font-weight:500;">
                ${esc(val)}
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function renderSalesPanel(raw, media, warehouses = []) {
  const tiers = raw.tier_variation || [];
  const models = raw.model_list || [];

  return `
    <!-- Nhóm phân loại -->
    ${tiers.length ? `
      <div class="p-edit-section">
        <div class="p-edit-section-title"><span>🎨 Nhóm phân loại hàng (${tiers.length} nhóm)</span></div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          ${tiers.map((t, idx) => `
            <div style="background:#f8fafc;padding:10px 14px;border-radius:6px;border:1px solid #e2e8f0;">
              <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:6px;">
                Nhóm ${idx + 1}: ${esc(t.name || 'Phân loại')}
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${(t.options || []).map((opt, i) => {
                  const optImg = (t.images && t.images[i]) ? media.variations.find((v) => v.option === opt) : null;
                  return `
                    <div style="display:inline-flex;align-items:center;gap:5px;background:#fff;border:1px solid #cbd5e1;border-radius:4px;padding:3px 8px;font-size:12px;">
                      ${optImg ? `<img src="${esc(optImg.thumb || optImg.url)}" style="width:20px;height:20px;object-fit:cover;border-radius:2px;">` : ''}
                      <span>${esc(opt)}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Bảng phân loại hàng & Tồn kho -->
    <div class="p-edit-section">
      <div class="p-edit-section-title" style="margin-bottom:8px;">
        <span>📦 Danh sách phân loại, Giá &amp; Tồn kho (${models.length || 1})</span>
      </div>

      <!-- Công cụ áp dụng hàng loạt -->
      ${models.length > 1 ? `
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;background:#f0f9ff;padding:8px 12px;border-radius:6px;border:1px solid #bae6fd;flex-wrap:wrap;">
          <span style="font-size:12px;font-weight:700;color:#0369a1;">⚡ Áp dụng hàng loạt:</span>
          <input id="pEditBulkPrice" type="number" placeholder="Giá chung (₫)" style="width:115px;padding:4px 8px;font-size:12px;border:1px solid #cbd5e1;border-radius:4px;">
          <input id="pEditBulkStock" type="number" min="0" placeholder="Tồn kho chung" style="width:115px;padding:4px 8px;font-size:12px;border:1px solid #cbd5e1;border-radius:4px;">
          <input id="pEditBulkSku" type="text" placeholder="Tiền tố SKU" style="width:110px;padding:4px 8px;font-size:12px;border:1px solid #cbd5e1;border-radius:4px;">
          <button id="btnPEditApplyAll" type="button" class="btn small" style="background:#0284c7;color:#fff;font-weight:700;">Áp dụng cho tất cả</button>
        </div>
      ` : ''}

      <div class="table-wrap">
        <table class="grid" style="font-size:12.5px;width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f1f5f9;text-align:left;">
              <th style="padding:7px 10px;border:1px solid #cbd5e1;">Phân loại</th>
              <th style="padding:7px 10px;border:1px solid #cbd5e1;width:140px;">SKU phân loại</th>
              <th style="padding:7px 10px;border:1px solid #cbd5e1;width:125px;text-align:right;">Giá niêm yết (₫)</th>
              <th style="padding:7px 10px;border:1px solid #cbd5e1;width:105px;text-align:right;">Giá KM</th>
              <th style="padding:7px 10px;border:1px solid #cbd5e1;width:95px;text-align:center;">Tổng tồn</th>
              <th style="padding:7px 10px;border:1px solid #cbd5e1;min-width:140px;">Tồn theo từng kho</th>
              <th style="padding:7px 10px;border:1px solid #cbd5e1;width:75px;text-align:center;">Đã bán</th>
            </tr>
          </thead>
          <tbody>
            ${(models.length ? models : [{ id: 0, name: 'Mặc định' }]).map((m) => {
              const mId = Number(m.id ?? m.model_id ?? 0);
              const mName = m.name || m.model_name || 'Mặc định';
              const sku = m.sku || m.model_sku || '';
              const normalPrice = m.normal_price || m.price_info?.input_normal_price || m.price_info?.normal_price || m.price || 0;
              const promoPrice = m.promo_price || m.price_info?.input_promotion_price || m.price_info?.promotion_price || 0;
              const stock = m.stock !== undefined ? m.stock : toNumber(m.stock_detail?.total_available_stock ?? m.seller_stock_info?.normal_stock ?? 0);
              const sold = m.sold || m.statistics?.sold_count || 0;
              const locs = Array.isArray(m.locationStocks) && m.locationStocks.length > 0 ? m.locationStocks : [];
              const mImg = media.modelImages?.[mId] || null;

              return `
                <tr data-model-id="${mId}">
                  <td style="padding:7px 10px;border:1px solid #cbd5e1;font-weight:600;color:#0f172a;">
                    <div style="display:flex;align-items:center;gap:6px;">
                      ${mImg ? `<img src="${esc(mImg.thumb || mImg.url)}" style="width:24px;height:24px;object-fit:cover;border-radius:3px;border:1px solid #cbd5e1;">` : ''}
                      <div>
                        <div>${esc(mName)}</div>
                        ${mId ? `<div class="muted" style="font-size:10px;font-family:monospace;">ID: ${mId}</div>` : ''}
                      </div>
                    </div>
                  </td>
                  <td style="padding:6px;border:1px solid #cbd5e1;">
                    <input type="text" class="p-edit-model-sku" value="${esc(sku)}" placeholder="SKU" style="width:100%;padding:4px 6px;font-size:12px;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box;">
                  </td>
                  <td style="padding:6px;border:1px solid #cbd5e1;text-align:right;">
                    <input type="number" class="p-edit-model-price" value="${normalPrice}" min="1000" style="width:100%;padding:4px 6px;font-size:12px;font-weight:600;text-align:right;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box;">
                  </td>
                  <td style="padding:7px 10px;border:1px solid #cbd5e1;text-align:right;font-weight:600;color:#e11d48;">
                    ${promoPrice && promoPrice < normalPrice ? money(promoPrice) : '<span class="muted">—</span>'}
                  </td>
                  <td style="padding:6px;border:1px solid #cbd5e1;text-align:center;">
                    <input type="number" class="p-edit-model-stock" value="${stock}" min="0" style="width:100%;padding:4px 6px;font-size:12px;font-weight:700;text-align:center;border:1px solid #cbd5e1;border-radius:4px;box-sizing:border-box;">
                  </td>
                  <td style="padding:6px 8px;border:1px solid #cbd5e1;">
                    ${locs.length > 0 ? `
                      <div style="display:flex;flex-direction:column;gap:3px;">
                        ${locs.map((loc) => `
                          <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;font-size:11px;">
                            <span style="color:#475569;font-weight:500;" title="${esc(loc.warehouseName)}">${esc(shortenWarehouseName(loc.warehouseName))}:</span>
                            <input type="number" min="0" class="wh-stock-subinput" data-loc-id="${esc(loc.locationId)}" value="${loc.stock}" style="width:52px;height:20px;padding:0 3px;font-size:11.5px;font-weight:700;text-align:center;border:1px solid #cbd5e1;border-radius:3px;background:#fff;">
                          </div>
                        `).join('')}
                      </div>
                    ` : `<span class="muted" style="font-size:11.5px;">Kho mặc định (${stock})</span>`}
                  </td>
                  <td style="padding:7px 10px;border:1px solid #cbd5e1;text-align:center;font-size:12px;color:#64748b;">
                    ${sold}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderShippingChannels(raw) {
  const channels = raw.logistic_info || raw.logistics_channels || [];
  if (!channels.length) {
    return '<div class="muted" style="font-size:12px;">Đang sử dụng kênh vận chuyển mặc định của Shop.</div>';
  }

  return `
    <div style="display:flex;flex-direction:column;gap:6px;">
      ${channels.map((c) => {
        const name = c.channel_name || c.name || `Kênh #${c.channelid || c.channel_id}`;
        const enabled = !!c.enabled;
        return `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:5px;font-size:12.5px;">
            <span style="font-weight:500;color:#1e293b;">${esc(name)}</span>
            <span class="badge" style="background:${enabled ? '#dcfce7' : '#f1f5f9'};color:${enabled ? '#15803d' : '#94a3b8'};font-weight:600;font-size:11px;padding:2px 6px;">
              ${enabled ? '✔ Đang bật' : '✕ Đang tắt'}
            </span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function handleSaveToShopee() {
  if (!currentItemId || !currentRawData) return;

  const btnSave = $('#btnPEditSave');
  const statusMsg = $('#pEditStatusMsg');
  const modal = $('#pEditModal');

  // 1. Thu thập dữ liệu
  const name = $('#pEditNameInput')?.value.trim();
  const parentSku = $('#pEditParentSkuInput')?.value.trim();
  const desc = $('#pEditDescInput')?.value.trim();
  const weight = parseFloat($('#pEditWeightInput')?.value) || undefined;
  const pLength = parseInt($('#pEditLengthInput')?.value, 10) || undefined;
  const pWidth = parseInt($('#pEditWidthInput')?.value, 10) || undefined;
  const pHeight = parseInt($('#pEditHeightInput')?.value, 10) || undefined;

  const isPreOrder = !!$('#pEditPreOrderChk')?.checked;
  const daysToShip = isPreOrder ? parseInt($('#pEditDaysToShipInput')?.value, 10) || 2 : 2;

  if (!name) {
    handleTabClick('basic');
    $('#pEditNameInput')?.focus();
    return hooks.toast('Tên sản phẩm không được để trống!', 'error');
  }

  // 2. Thu thập models & tồn kho
  const modelRows = $$('#pEditPanel_sales tr[data-model-id]');
  const origModels = currentRawData.model_list || [];
  const updatedModels = [];

  for (const tr of modelRows) {
    const mId = Number(tr.dataset.modelId);
    const orig = origModels.find((m) => Number(m.id ?? m.model_id ?? 0) === mId) || { id: mId };

    const sku = tr.querySelector('.p-edit-model-sku')?.value.trim() || '';
    const price = parseFloat(tr.querySelector('.p-edit-model-price')?.value) || 0;
    const stock = parseInt(tr.querySelector('.p-edit-model-stock')?.value, 10) || 0;

    const whInps = tr.querySelectorAll('.wh-stock-subinput');
    let stockSettings = [];
    if (whInps.length > 0) {
      stockSettings = Array.from(whInps).map((inp) => ({
        location_id: inp.dataset.locId,
        sellable_stock: Math.max(0, parseInt(inp.value, 10) || 0)
      }));
    } else {
      stockSettings = [{ sellable_stock: stock }];
    }

    const entry = {
      id: mId,
      tier_index: orig.tier_index || [0],
      sku,
      stock_setting_list: stockSettings
    };
    if (price > 0) {
      entry.price_info = [{ normal_price: price }];
    }
    updatedModels.push(entry);
  }

  const updates = {
    name,
    parent_sku: parentSku,
    description: desc,
    days_to_ship: daysToShip
  };
  if (weight !== undefined) updates.weight = weight;
  if (pLength !== undefined || pWidth !== undefined || pHeight !== undefined) {
    updates.dimension = {
      package_length: pLength || 10,
      package_width: pWidth || 10,
      package_height: pHeight || 10
    };
  }
  if (updatedModels.length) {
    updates.model_list = updatedModels;
  }

  if (btnSave) {
    btnSave.disabled = true;
    btnSave.textContent = '⏳ Đang lưu lên Shopee...';
  }
  if (statusMsg) {
    statusMsg.textContent = 'Đang đồng bộ dữ liệu lên Shopee Seller Portal...';
    statusMsg.style.color = '#0284c7';
  }

  try {
    await products.updateFullProduct(currentItemId, updates);

    // Cập nhật state nội bộ
    currentRawData.name = name;
    currentRawData.parent_sku = parentSku;
    currentRawData.description = desc;
    if (weight !== undefined) currentRawData.weight = weight;

    hooks.toast(`✔ Đã cập nhật sản phẩm #${currentItemId} trên Shopee thành công!`, 'success');
    if (statusMsg) {
      statusMsg.textContent = '✔ Đã lưu thành công lên Shopee!';
      statusMsg.style.color = '#16a34a';
    }

    if (typeof saveCallback === 'function') {
      saveCallback(currentItemId, updates);
    }

    await sleep(600);
    modal.classList.add('hidden');
  } catch (err) {
    console.error('Lỗi lưu sản phẩm lên Shopee:', err);
    hooks.toast('Lỗi cập nhật Shopee: ' + err.message, 'error');
    if (statusMsg) {
      statusMsg.textContent = 'Lỗi: ' + err.message;
      statusMsg.style.color = '#ef4444';
    }
  } finally {
    if (btnSave) {
      btnSave.disabled = false;
      btnSave.textContent = '💾 Lưu thay đổi lên Shopee';
    }
  }
}
