// =========================================================================
// MODULE: QUÉT TOÀN BỘ SẢN PHẨM SHOP SHOPEE (QUÉT SHOP TAB)
// =========================================================================

(function () {
  // DOM Elements - Sub-tabs Navigation
  const btnSubtabQuetMoi = document.getElementById('btn-subtab-quet-moi');
  const btnSubtabToanBo = document.getElementById('btn-subtab-toan-bo');
  const btnSubtabDanhSachShop = document.getElementById('btn-subtab-danh-sach-shop');
  const btnSubtabDocSheet = document.getElementById('btn-subtab-doc-sheet');
  const viewQuetMoi = document.getElementById('subtab-view-quet-moi');
  const viewToanBo = document.getElementById('subtab-view-toan-bo');
  const viewDanhSachShop = document.getElementById('subtab-view-danh-sach-shop');
  const viewDocSheet = document.getElementById('subtab-view-doc-sheet');
  const totalSavedBadge = document.getElementById('quet-shop-total-badge');
  const totalShopsBadge = document.getElementById('quet-shop-total-shops-badge');
  const sheetReadBadge = document.getElementById('quet-shop-sheet-read-badge');

  // DOM Elements - View 1 (Quét Shop Mới)
  const inputUrl = document.getElementById('quet-shop-url');
  const btnGetActiveTab = document.getElementById('btn-quet-shop-get-active-tab');
  const inputTenShop = document.getElementById('quet-shop-ten-shop');
  const selectLimit = document.getElementById('quet-shop-limit');
  const btnStart = document.getElementById('btn-start-quet-shop');
  const btnStop = document.getElementById('btn-stop-quet-shop');

  const infoCard = document.getElementById('quet-shop-info-card');
  const infoName = document.getElementById('quet-shop-info-name');
  const infoId = document.getElementById('quet-shop-info-id');
  const infoRating = document.getElementById('quet-shop-info-rating');
  const infoCount = document.getElementById('quet-shop-info-count');
  const infoFollowers = document.getElementById('quet-shop-info-followers');
  const infoVouchers = document.getElementById('quet-shop-info-vouchers');

  const progressWrap = document.getElementById('quet-shop-progress-container');
  const progressBar = document.getElementById('quet-shop-progress-bar');
  const progressPercent = document.getElementById('quet-shop-progress-percent');
  const statusText = document.getElementById('quet-shop-status-text');

  const toolbar = document.getElementById('quet-shop-toolbar');
  const filterInput = document.getElementById('quet-shop-filter-input');
  const filterSavedSelect = document.getElementById('quet-shop-filter-saved');
  const countBadge = document.getElementById('quet-shop-count-badge');
  const btnSelectUnsaved = document.getElementById('btn-quet-shop-select-unsaved');
  const btnSaveSheet = document.getElementById('btn-quet-shop-save-sheet');
  const btnSaveSpShopee = document.getElementById('btn-quet-shop-save-sp-shopee');
  const btnClearAll = document.getElementById('btn-quet-shop-clear-all');

  const tableSection = document.getElementById('quet-shop-table-section');
  const checkAll = document.getElementById('quet-shop-check-all');
  const tbody = document.getElementById('quet-shop-tbody');

  // DOM Elements - View 2 (Toàn bộ SP đã quét / Kho SP & Sửa shop)
  const btnHistoryRefresh = document.getElementById('btn-history-refresh');
  const historyFilterShop = document.getElementById('history-filter-shop');
  const btnHistoryEditShop = document.getElementById('btn-history-edit-shop');
  const btnHistorySaveSpShopee = document.getElementById('btn-history-save-sp-shopee');
  const historyFilterInput = document.getElementById('history-filter-input');
  const historyCountBadge = document.getElementById('history-count-badge');
  const historyTbody = document.getElementById('history-tbody');

  // DOM Elements - View 3 (Danh sách Shop)
  const btnShopListRefresh = document.getElementById('btn-shop-list-refresh');
  const shopListCountBadge = document.getElementById('shop-list-count-badge');
  const shopListFilterInput = document.getElementById('shop-list-filter-input');
  const shopListTbody = document.getElementById('shop-list-tbody');

  // DOM Elements - View 4 (Đọc sản phẩm từ sheet - có lọc gian)
  const sheetReadSourceSelect = document.getElementById('sheet-read-source-select');
  const sheetReadCountBadge = document.getElementById('sheet-read-count-badge');
  const btnSheetReadRefresh = document.getElementById('btn-sheet-read-refresh');
  const sheetReadFilterGian = document.getElementById('sheet-read-filter-gian');
  const sheetReadSearch = document.getElementById('sheet-read-search');
  const btnSheetReadClearFilter = document.getElementById('btn-sheet-read-clear-filter');
  const sheetReadTbody = document.getElementById('sheet-read-tbody');

  // Modal elements
  const modal = document.getElementById('quet-shop-modal');
  const modalTitle = document.getElementById('quet-shop-modal-title');
  const modalBody = document.getElementById('quet-shop-modal-body');
  const btnModalClose = document.getElementById('btn-quet-shop-modal-close');
  const btnModalCloseFooter = document.getElementById('btn-quet-shop-modal-close-footer');
  const btnModalCopyClone = document.getElementById('btn-quet-shop-modal-copy-clone');
  const btnModalSaveSheet = document.getElementById('btn-quet-shop-modal-save-sheet');

  // State
  let isScanning = false;
  let scanningTabId = null;
  let currentShopInfo = null;
  let scannedProducts = []; // Array of products from current scan session
  let allScannedProducts = []; // Persistent array of all products across shops
  let quetShopList = []; // Persistent array of shops
  let savedItemIds = new Set(); // Set of Shopee item IDs saved to Sheet QUET_SP
  let selectedItemIds = new Set(); // Selected IDs in current scan table
  let currentModalItem = null;
  let activeSubtab = 'scan'; // 'scan' | 'history' | 'shops'

  // Utility formatters
  function fmtMoney(num) {
    if (num == null || num === '' || isNaN(num) || num === 0) return '0đ';
    return Number(num).toLocaleString('vi-VN') + 'đ';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function findColIndex(headers, keywords, fallback = -1) {
    if (!Array.isArray(headers)) return fallback;
    // Pass 1: exact match
    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i] || '').trim().toLowerCase();
      if (!h) continue;
      for (const kw of keywords) {
        if (h === kw.toLowerCase()) return i;
      }
    }
    // Pass 2: partial match
    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i] || '').trim().toLowerCase();
      if (!h) continue;
      for (const kw of keywords) {
        const kwLower = kw.toLowerCase();
        if (h.includes(kwLower)) {
          // If keyword is 'mô tả', avoid matching 'ảnh mô tả'
          if (kwLower === 'mô tả' && (h.includes('ảnh') || h.includes('hinh'))) continue;
          return i;
        }
      }
    }
    return fallback;
  }

  // 1. Sub-tab switching
  function switchSubtab(tab) {
    activeSubtab = tab;

    btnSubtabQuetMoi.style.background = '#f1f5f9';
    btnSubtabQuetMoi.style.color = '#475569';
    btnSubtabToanBo.style.background = '#f1f5f9';
    btnSubtabToanBo.style.color = '#475569';
    if (btnSubtabDanhSachShop) {
      btnSubtabDanhSachShop.style.background = '#f1f5f9';
      btnSubtabDanhSachShop.style.color = '#475569';
    }
    if (btnSubtabDocSheet) {
      btnSubtabDocSheet.style.background = '#f1f5f9';
      btnSubtabDocSheet.style.color = '#475569';
    }

    if (viewQuetMoi) viewQuetMoi.style.display = 'none';
    if (viewToanBo) viewToanBo.style.display = 'none';
    if (viewDanhSachShop) viewDanhSachShop.style.display = 'none';
    if (viewDocSheet) viewDocSheet.style.display = 'none';

    if (tab === 'scan') {
      btnSubtabQuetMoi.style.background = '#0284c7';
      btnSubtabQuetMoi.style.color = 'white';
      if (viewQuetMoi) viewQuetMoi.style.display = 'block';
      renderTable();
    } else if (tab === 'history') {
      btnSubtabToanBo.style.background = '#7c3aed';
      btnSubtabToanBo.style.color = 'white';
      if (viewToanBo) viewToanBo.style.display = 'block';
      populateHistoryShopDropdown();
      renderHistoryTable();
      if (allScannedProducts.length === 0) {
        syncAllProductsFromSheet(false);
      }
    } else if (tab === 'shops') {
      if (btnSubtabDanhSachShop) {
        btnSubtabDanhSachShop.style.background = '#059669';
        btnSubtabDanhSachShop.style.color = 'white';
      }
      if (viewDanhSachShop) viewDanhSachShop.style.display = 'block';
      renderShopListTable();
      if (allScannedProducts.length === 0 && quetShopList.length === 0) {
        syncAllProductsFromSheet(false);
      }
    } else if (tab === 'sheet') {
      if (btnSubtabDocSheet) {
        btnSubtabDocSheet.style.background = '#ea580c';
        btnSubtabDocSheet.style.color = 'white';
      }
      if (viewDocSheet) viewDocSheet.style.display = 'block';
      if (sheetRows.length === 0) {
        loadSheetProducts();
      } else {
        renderSheetTable();
      }
    }
  }

  btnSubtabQuetMoi?.addEventListener('click', () => switchSubtab('scan'));
  btnSubtabToanBo?.addEventListener('click', () => switchSubtab('history'));
  btnSubtabDanhSachShop?.addEventListener('click', () => switchSubtab('shops'));
  btnSubtabDocSheet?.addEventListener('click', () => switchSubtab('sheet'));

  // 2. Load cached state & sync saved IDs from Sheet & storage
  function loadCachedState() {
    chrome.storage.local.get([
      'quetShopProducts',
      'quetShopAllProducts',
      'quetShopList',
      'quetShopSavedItemIds',
      'quetShopInfo',
      'quetShopUrl',
      'quetShopTenShop'
    ], (res) => {
      if (res.quetShopUrl && inputUrl && !inputUrl.value) {
        inputUrl.value = res.quetShopUrl;
      }
      if (res.quetShopTenShop && inputTenShop && !inputTenShop.value) {
        inputTenShop.value = res.quetShopTenShop;
      }
      if (res.quetShopInfo) {
        currentShopInfo = res.quetShopInfo;
        renderShopInfoCard(currentShopInfo);
        if (!inputTenShop?.value && currentShopInfo.shopName) {
          inputTenShop.value = currentShopInfo.shopName;
        }
      }

      if (Array.isArray(res.quetShopSavedItemIds)) {
        savedItemIds = new Set(res.quetShopSavedItemIds.map(String));
      }

      if (Array.isArray(res.quetShopAllProducts)) {
        allScannedProducts = res.quetShopAllProducts;
      }

      if (Array.isArray(res.quetShopList)) {
        quetShopList = res.quetShopList;
      }

      if (Array.isArray(res.quetShopProducts) && res.quetShopProducts.length > 0) {
        scannedProducts = res.quetShopProducts;
        // Mark default selection: check unsaved items, uncheck saved items
        selectedItemIds.clear();
        scannedProducts.forEach(p => {
          const isSaved = savedItemIds.has(String(p.itemId));
          if (!isSaved) selectedItemIds.add(p.itemId);
        });
        showResultsUI();
        renderTable();
      }

      updateTotalSavedBadge();
      updateTotalShopBadges();
      populateHistoryShopDropdown();

      // Background sync with Google Sheet (QUET_SP & SP_SHOPEE) to read all products & saved IDs
      syncAllProductsFromSheet(false);
    });
  }

  // =========================================================================
  // PARSE & SYNC FULL PRODUCTS FROM GOOGLE SHEET QUET_SP
  // =========================================================================

  function parseProductsFromQuetSpRows(rows) {
    if (!Array.isArray(rows) || rows.length < 2) return [];

    const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
    const dataRows = rows.slice(1);

    const colShop = findColIndex(headers, ['tên shop', 'ten shop', 'shop'], 1);
    const colItemId = findColIndex(headers, ['id shopee', 'id sản phẩm', 'mã sản phẩm'], 2);
    const colName = findColIndex(headers, ['tên sản phẩm', 'ten san pham', 'tên sp', 'name'], 3);
    const colModelName = findColIndex(headers, ['tên phân loại', 'phan loai', 'phân loại'], 4);
    const colModelSku = findColIndex(headers, ['sku phân loại', 'sku'], 5);
    const colPrice = findColIndex(headers, ['giá gốc', 'giá bán', 'giá'], 6);
    const colPromoPrice = findColIndex(headers, ['giá km', 'gia km'], 7);
    const colVoucherDesc = findColIndex(headers, ['voucher của shop', 'voucher'], -1);
    const colPriceAfter = findColIndex(headers, ['giá sau shopee voucher', 'giá sau voucher'], -1);
    const colStock = findColIndex(headers, ['tồn kho', 'kho'], 8);
    const colSold = findColIndex(headers, ['đã bán'], 9);
    const colRating = findColIndex(headers, ['đánh giá'], 10);
    const colCat = findColIndex(headers, ['ngành hàng'], 11);
    const colBrand = findColIndex(headers, ['thương hiệu'], 12);
    const colUrl = findColIndex(headers, ['link sản phẩm', 'link'], 13);
    const colModelImg = findColIndex(headers, ['ảnh phân loại'], 14);
    const colMainImgs = findColIndex(headers, ['ảnh chính'], 15);
    const colDescImgs = findColIndex(headers, ['ảnh mô tả'], 16);
    const colVideo = findColIndex(headers, ['video'], 17);
    const colDesc = findColIndex(headers, ['mô tả sản phẩm', 'chi tiết sản phẩm', 'mô tả'], 18);

    const productMap = new Map();

    dataRows.forEach(r => {
      if (!r || !r.some(c => String(c || '').trim() !== '')) return;

      let itemId = colItemId >= 0 ? String(r[colItemId] || '').trim() : '';
      if (!itemId) {
        const qspId = String(r[0] || '').trim();
        const match = qspId.match(/^QSP_(\d+)/i);
        if (match) itemId = match[1];
      }
      if (!itemId) return;

      const shopName = String(r[colShop] || 'Shop Shopee').trim();
      const name = String(r[colName] || 'Sản phẩm Shopee').trim();
      const modelName = String(r[colModelName] || 'Mặc định').trim();
      const modelSku = String(r[colModelSku] || '').trim();
      const price = Number(r[colPrice] || 0);
      const promoPrice = (colPromoPrice >= 0 && r[colPromoPrice]) ? Number(r[colPromoPrice]) : null;
      const voucherDesc = colVoucherDesc >= 0 ? String(r[colVoucherDesc] || '').trim() : '';
      const priceAfter = (colPriceAfter >= 0 && r[colPriceAfter]) ? Number(r[colPriceAfter]) : (promoPrice || price);
      const stock = colStock >= 0 ? Number(r[colStock] || 0) : 0;
      const sold = colSold >= 0 ? Number(r[colSold] || 0) : 0;
      const rating = colRating >= 0 ? Number(r[colRating] || 5.0) : 5.0;
      const category = colCat >= 0 ? String(r[colCat] || '').trim() : '';
      const brand = colBrand >= 0 ? String(r[colBrand] || '').trim() : '';
      const productUrl = colUrl >= 0 ? String(r[colUrl] || `https://shopee.vn/product/0/${itemId}`).trim() : `https://shopee.vn/product/0/${itemId}`;
      const modelImg = colModelImg >= 0 ? String(r[colModelImg] || '').trim() : '';
      const mainImgsStr = colMainImgs >= 0 ? String(r[colMainImgs] || '').trim() : '';
      const descImgsStr = colDescImgs >= 0 ? String(r[colDescImgs] || '').trim() : '';
      const videoUrl = colVideo >= 0 ? String(r[colVideo] || '').trim() : '';
      const desc = colDesc >= 0 ? String(r[colDesc] || '').trim() : '';

      const firstMainImg = mainImgsStr ? mainImgsStr.split('|')[0].trim() : '';
      const thumbnail = modelImg || firstMainImg;

      const modelObj = {
        modelId: String(productMap.get(itemId)?.models?.length || '0'),
        name: modelName,
        sku: modelSku,
        price: price,
        promoPrice: promoPrice,
        stock: stock,
        imageUrl: modelImg || thumbnail,
        priceAfterVoucher: priceAfter,
        bestVoucher: (voucherDesc && voucherDesc !== 'Không có') ? { title: voucherDesc } : null
      };

      if (!productMap.has(itemId)) {
        productMap.set(itemId, {
          itemId: itemId,
          name: name,
          shopName: shopName,
          thumbnail: thumbnail,
          productUrl: productUrl,
          videoUrl: videoUrl,
          ratingStar: rating,
          historicalSold: sold,
          category: category,
          brand: brand,
          description: desc,
          mainImagesStr: mainImgsStr,
          descriptionImagesStr: descImgsStr,
          hasShopVoucher: Boolean(voucherDesc && voucherDesc !== 'Không có'),
          bestVoucher: (voucherDesc && voucherDesc !== 'Không có') ? { title: voucherDesc } : null,
          price: price,
          promoPrice: promoPrice,
          priceAfterVoucher: priceAfter,
          stock: stock,
          models: [modelObj]
        });
      } else {
        const existing = productMap.get(itemId);
        existing.models.push(modelObj);
        if (price > 0 && (existing.price === 0 || price < existing.price)) existing.price = price;
        if (promoPrice && (!existing.promoPrice || promoPrice < existing.promoPrice)) existing.promoPrice = promoPrice;
        if (priceAfter && (!existing.priceAfterVoucher || priceAfter < existing.priceAfterVoucher)) existing.priceAfterVoucher = priceAfter;
        existing.stock += stock;
        if (modelObj.bestVoucher && !existing.bestVoucher) {
          existing.bestVoucher = modelObj.bestVoucher;
          existing.hasShopVoucher = true;
        }
        if (!existing.thumbnail && thumbnail) existing.thumbnail = thumbnail;
      }
    });

    return Array.from(productMap.values());
  }

  function rebuildShopListFromAllProducts() {
    const shopMap = new Map();

    allScannedProducts.forEach(p => {
      const sName = (p.shopName || 'Shop Shopee').trim();
      const key = sName.toLowerCase();
      if (!shopMap.has(key)) {
        shopMap.set(key, {
          name: sName,
          shopId: p.shopId || '',
          url: p.productUrl || '',
          ratingStar: p.ratingStar || '5.0',
          itemCount: 0,
          followerCount: 0,
          lastScannedAt: new Date().toLocaleDateString('vi-VN')
        });
      }
      shopMap.get(key).itemCount++;
    });

    if (currentShopInfo?.shopName) {
      const key = currentShopInfo.shopName.trim().toLowerCase();
      if (shopMap.has(key)) {
        const item = shopMap.get(key);
        if (currentShopInfo.followerCount) item.followerCount = currentShopInfo.followerCount;
        if (currentShopInfo.ratingStar) item.ratingStar = currentShopInfo.ratingStar;
        if (currentShopInfo.shopId) item.shopId = currentShopInfo.shopId;
        if (currentShopInfo.shopUrl) item.url = currentShopInfo.shopUrl;
      }
    }

    quetShopList = Array.from(shopMap.values());
    saveShopListToCache();
  }

  let isSyncingFromSheet = false;

  async function syncAllProductsFromSheet(force = false) {
    if (isSyncingFromSheet) return;
    isSyncingFromSheet = true;

    if (btnHistoryRefresh) {
      btnHistoryRefresh.disabled = true;
      btnHistoryRefresh.textContent = '⏳ Đang đọc Sheet QUET_SP...';
    }

    try {
      const quetSpRes = await new Promise(resolve => {
        chrome.runtime.sendMessage({ type: 'FETCH_QUET_SP' }, resolve);
      });

      const parsedFromQuetSp = (quetSpRes && quetSpRes.ok && Array.isArray(quetSpRes.values))
        ? parseProductsFromQuetSpRows(quetSpRes.values)
        : [];

      allScannedProducts = parsedFromQuetSp;

      savedItemIds.clear();
      parsedFromQuetSp.forEach(p => savedItemIds.add(String(p.itemId)));

      saveSavedIdsToCache();
      saveAllProductsToCache();
      rebuildShopListFromAllProducts();
      updateTotalSavedBadge();
      updateTotalShopBadges();
      populateHistoryShopDropdown();
      renderTable();
      renderHistoryTable();
      renderShopListTable();

      if (force) {
        alert(`✅ Đã đọc thành công ${allScannedProducts.length} sản phẩm từ Sheet QUET_SP!`);
      }
    } catch (err) {
      console.warn('Lỗi đọc sản phẩm từ sheet QUET_SP:', err);
      if (force) {
        alert(`❌ Lỗi khi đọc dữ liệu từ Sheet QUET_SP: ${err.message}`);
      }
    } finally {
      isSyncingFromSheet = false;
      if (btnHistoryRefresh) {
        btnHistoryRefresh.disabled = false;
        btnHistoryRefresh.textContent = '🔄 Đọc từ Sheet';
      }
      if (btnShopListRefresh) {
        btnShopListRefresh.disabled = false;
        btnShopListRefresh.textContent = '🔄 Tải lại';
      }
    }
  }

  function saveSavedIdsToCache() {
    chrome.storage.local.set({ quetShopSavedItemIds: Array.from(savedItemIds) });
  }

  function saveCurrentProductsToCache() {
    chrome.storage.local.set({
      quetShopProducts: scannedProducts,
      quetShopInfo: currentShopInfo,
      quetShopUrl: inputUrl?.value?.trim() || '',
      quetShopTenShop: inputTenShop?.value?.trim() || ''
    });
  }

  function saveAllProductsToCache() {
    chrome.storage.local.set({
      quetShopAllProducts: allScannedProducts
    });
    updateTotalSavedBadge();
    updateTotalShopBadges();
    populateHistoryShopDropdown();
  }

  function updateTotalSavedBadge() {
    if (totalSavedBadge) {
      totalSavedBadge.textContent = allScannedProducts.length;
    }
  }

  // Merge products into persistent allScannedProducts store
  function mergeIntoAllProducts(newItems, shopName) {
    const defaultShop = shopName || inputTenShop?.value?.trim() || currentShopInfo?.shopName || 'Shop Shopee';
    newItems.forEach(item => {
      const existingIdx = allScannedProducts.findIndex(p => String(p.itemId) === String(item.itemId));
      const enriched = {
        ...item,
        shopName: item.shopName || defaultShop,
        scannedAt: item.scannedAt || new Date().toISOString()
      };
      if (existingIdx >= 0) {
        allScannedProducts[existingIdx] = {
          ...allScannedProducts[existingIdx],
          ...enriched,
          shopName: allScannedProducts[existingIdx].shopName || defaultShop
        };
      } else {
        allScannedProducts.push(enriched);
      }
    });
    saveAllProductsToCache();
  }

  // 3. Button "Lấy link tab hiện tại"
  btnGetActiveTab?.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs && tabs[0];
      if (activeTab && activeTab.url && activeTab.url.includes('shopee.vn')) {
        inputUrl.value = activeTab.url;
        chrome.storage.local.set({ quetShopUrl: activeTab.url });
      } else {
        alert('Tab đang mở không phải là trang Shopee (shopee.vn).');
      }
    });
  });

  // Tên shop lấy input listener
  inputTenShop?.addEventListener('input', () => {
    const val = inputTenShop.value.trim();
    chrome.storage.local.set({ quetShopTenShop: val });
  });

  // 4. Render Shop Info Card
  function renderShopInfoCard(info) {
    if (!info || !info.shopId) {
      if (infoCard) infoCard.style.display = 'none';
      return;
    }
    if (infoCard) infoCard.style.display = 'block';
    if (infoName) infoName.textContent = info.shopName || 'Shop Shopee';
    if (infoId) infoId.textContent = `(ID: ${info.shopId})`;
    if (infoRating) infoRating.textContent = info.ratingStar || '5.0';
    if (infoCount) infoCount.textContent = info.itemCount ? info.itemCount.toLocaleString('vi-VN') : '0';
    if (infoFollowers) infoFollowers.textContent = info.followerCount ? info.followerCount.toLocaleString('vi-VN') : '0';
    if (infoVouchers) {
      if (info.vouchers && info.vouchers.length > 0) {
        infoVouchers.textContent = `Có ${info.vouchers.length} Voucher (Lớn nhất: ${info.vouchers[0].title})`;
        infoVouchers.style.color = '#b45309';
      } else if (info.hasShopVoucher === false) {
        infoVouchers.textContent = 'Shop không có voucher';
        infoVouchers.style.color = '#64748b';
      } else {
        infoVouchers.textContent = '-';
        infoVouchers.style.color = '#64748b';
      }
    }

    if (inputTenShop && !inputTenShop.value && info.shopName) {
      inputTenShop.value = info.shopName;
      chrome.storage.local.set({ quetShopTenShop: info.shopName });
    }
  }

  // 5. Normalizing user URL
  function cleanAndNormalizeShopUrl(raw) {
    let url = String(raw || '').trim();
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.includes('shopee.vn')) {
        url = 'https://' + url;
      } else {
        url = 'https://shopee.vn/' + url;
      }
    }
    return url;
  }

  // 6. Start scanning
  btnStart?.addEventListener('click', async () => {
    const rawUrl = inputUrl?.value?.trim();
    if (!rawUrl) {
      alert('Vui lòng nhập link Shop Shopee (vd: https://shopee.vn/ten_shop)');
      inputUrl?.focus();
      return;
    }

    const shopUrl = cleanAndNormalizeShopUrl(rawUrl);
    inputUrl.value = shopUrl;
    chrome.storage.local.set({ quetShopUrl: shopUrl });

    const maxItems = parseInt(selectLimit?.value || '0', 10);
    const tenShop = inputTenShop?.value?.trim() || '';
    if (tenShop) {
      chrome.storage.local.set({ quetShopTenShop: tenShop });
    }

    // Reset state for new scan
    scannedProducts = [];
    selectedItemIds.clear();
    currentShopInfo = null;
    isScanning = true;

    // Update UI
    btnStart.disabled = true;
    btnStart.innerHTML = '⏳ Đang quét...';
    btnStop.disabled = false;
    btnStop.style.opacity = '1';

    if (progressWrap) progressWrap.style.display = 'block';
    if (progressBar) progressBar.style.width = '5%';
    if (progressPercent) progressPercent.textContent = '5%';
    if (statusText) statusText.textContent = 'Đang mở trang Shop Shopee...';

    showResultsUI();
    renderTable();

    try {
      const tabs = await chrome.tabs.query({ url: '*://shopee.vn/*' });
      let matchedTab = null;

      const urlClean = shopUrl.replace(/^https?:\/\/shopee\.vn\/?/i, '').split(/[/?#]/)[0];
      if (tabs && tabs.length > 0 && urlClean) {
        matchedTab = tabs.find(t => t.url && t.url.toLowerCase().includes(urlClean.toLowerCase()));
      }

      if (matchedTab) {
        scanningTabId = matchedTab.id;
        const matchedNorm = matchedTab.url.split('#')[0].split('?')[0].replace(/\/+$/, '').toLowerCase();
        const shopNorm = shopUrl.split('#')[0].split('?')[0].replace(/\/+$/, '').toLowerCase();

        if (matchedNorm !== shopNorm) {
          await chrome.tabs.update(matchedTab.id, { url: shopUrl, active: true });
          const onUpdatedListener = (tabId, changeInfo) => {
            if (tabId === matchedTab.id && changeInfo.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(onUpdatedListener);
              setTimeout(() => {
                startScanInTab(matchedTab.id, shopUrl, maxItems);
              }, 1200);
            }
          };
          chrome.tabs.onUpdated.addListener(onUpdatedListener);
        } else {
          chrome.tabs.update(matchedTab.id, { active: true });
          startScanInTab(matchedTab.id, shopUrl, maxItems);
        }
      } else {
        const newTab = await chrome.tabs.create({ url: shopUrl, active: true });
        scanningTabId = newTab.id;

        const onUpdatedListener = (tabId, changeInfo) => {
          if (tabId === newTab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(onUpdatedListener);
            setTimeout(() => {
              startScanInTab(newTab.id, shopUrl, maxItems);
            }, 1200);
          }
        };
        chrome.tabs.onUpdated.addListener(onUpdatedListener);
      }
    } catch (err) {
      stopScanningUI();
      if (statusText) statusText.textContent = '❌ Lỗi: ' + err.message;
      alert('Không thể mở tab Shopee: ' + err.message);
    }
  });

  // Ping tab and send start command
  async function startScanInTab(tabId, shopUrl, maxItems) {
    let retries = 0;
    const maxRetries = 20;

    const pingInterval = setInterval(async () => {
      retries++;
      if (!isScanning) {
        clearInterval(pingInterval);
        return;
      }

      try {
        const pingRes = await chrome.tabs.sendMessage(tabId, { type: 'PING' });
        if (pingRes && pingRes.ok) {
          clearInterval(pingInterval);
          if (statusText) statusText.textContent = 'Đã kết nối tab Shopee, đang gửi lệnh quét...';

          chrome.tabs.sendMessage(tabId, {
            type: 'START_SCAN_SHOP',
            shopUrl: shopUrl,
            maxItems: maxItems,
            delayMs: 350
          }, (res) => {
            if (chrome.runtime.lastError) {
              console.warn('Lỗi gửi START_SCAN_SHOP:', chrome.runtime.lastError.message);
              stopScanningUI();
              if (statusText) statusText.textContent = '❌ Lỗi kết nối script: ' + chrome.runtime.lastError.message;
              alert('Lỗi kết nối với trang Shopee: ' + chrome.runtime.lastError.message);
              return;
            }
            if (res && !res.ok) {
              console.warn('START_SCAN_SHOP trả về lỗi:', res.error);
              stopScanningUI();
              if (statusText) statusText.textContent = '❌ Lỗi: ' + (res.error || 'Quét thất bại');
              alert('Lỗi quét Shop: ' + (res.error || 'Vui lòng kiểm tra lại link shop.'));
            }
          });
        }
      } catch (e) {
        if (statusText) statusText.textContent = `Đang kết nối script trên trang Shopee (${retries}/${maxRetries})...`;
        if (retries >= maxRetries) {
          clearInterval(pingInterval);
          stopScanningUI();
          if (statusText) statusText.textContent = '❌ Không thể kết nối với trang Shopee. Hãy tải lại trang Shopee và thử lại.';
          alert('Không thể kết nối với trang Shopee sau 20 lần thử. Hãy F5 trang Shopee và thử lại.');
        }
      }
    }, 600);
  }

  // 7. Stop scanning
  btnStop?.addEventListener('click', () => {
    if (!isScanning) return;
    if (scanningTabId) {
      chrome.tabs.sendMessage(scanningTabId, { type: 'STOP_SCAN_SHOP' }, () => {
        if (chrome.runtime.lastError) {}
      });
    }
    stopScanningUI();
    if (statusText) statusText.textContent = `⏹ Đã dừng quét. Tổng cộng đã đọc: ${scannedProducts.length} sản phẩm.`;
    finalizeScanResults();
  });

  function stopScanningUI() {
    isScanning = false;
    btnStart.disabled = false;
    btnStart.innerHTML = '🚀 Bắt đầu quét sản phẩm';
    btnStop.disabled = true;
    btnStop.style.opacity = '0.6';
  }

  function finalizeScanResults() {
    const shopName = inputTenShop?.value?.trim() || currentShopInfo?.shopName || 'Shop Shopee';
    mergeIntoAllProducts(scannedProducts, shopName);
    updateShopInList(shopName, currentShopInfo, inputUrl?.value?.trim());
    saveCurrentProductsToCache();
    renderTable();
  }

  // 8. Listen to progress messages from content script
  chrome.runtime.onMessage.addListener((message) => {
    if (!message) return;

    if (message.type === 'SCAN_SHOP_SHOP_INFO') {
      currentShopInfo = message.shopInfo;
      renderShopInfoCard(currentShopInfo);
      if (currentShopInfo?.shopName && (!inputTenShop || !inputTenShop.value)) {
        inputTenShop.value = currentShopInfo.shopName;
        chrome.storage.local.set({ quetShopTenShop: currentShopInfo.shopName });
      }
    }

    if (message.type === 'SCAN_SHOP_PROGRESS') {
      if (message.statusText && statusText) {
        statusText.textContent = message.statusText;
      }

      if (message.phase === 'LISTING') {
        const percent = Math.min(25, 5 + Math.round((message.scannedCount || 0) * 1.5));
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressPercent) progressPercent.textContent = percent + '%';
      }

      if (message.phase === 'DETAILS') {
        const cur = message.current || 1;
        const tot = message.total || 1;
        const percent = Math.min(100, 25 + Math.round((cur / tot) * 75));
        if (progressBar) progressBar.style.width = percent + '%';
        if (progressPercent) progressPercent.textContent = percent + '%';

        if (message.item) {
          const item = message.item;
          item.shopName = inputTenShop?.value?.trim() || currentShopInfo?.shopName || 'Shop Shopee';
          const exists = scannedProducts.findIndex(p => p.itemId === item.itemId);
          if (exists >= 0) {
            scannedProducts[exists] = item;
          } else {
            scannedProducts.push(item);
            // Default check: check if unsaved, uncheck if already saved
            const isSaved = savedItemIds.has(String(item.itemId));
            if (!isSaved) {
              selectedItemIds.add(item.itemId);
            }
          }
          renderTable();
        }
      }
    }

    if (message.type === 'SCAN_SHOP_DONE') {
      stopScanningUI();
      if (progressBar) progressBar.style.width = '100%';
      if (progressPercent) progressPercent.textContent = '100%';
      if (statusText) {
        statusText.textContent = message.statusText || `✓ Hoàn thành! Đã quét ${scannedProducts.length} sản phẩm.`;
      }
      if (Array.isArray(message.items) && message.items.length > 0) {
        const shopName = inputTenShop?.value?.trim() || currentShopInfo?.shopName || 'Shop Shopee';
        scannedProducts = message.items.map(item => ({
          ...item,
          shopName: item.shopName || shopName
        }));
        selectedItemIds.clear();
        scannedProducts.forEach(p => {
          const isSaved = savedItemIds.has(String(p.itemId));
          if (!isSaved) selectedItemIds.add(p.itemId);
        });
        renderTable();
      }
      finalizeScanResults();
    }

    if (message.type === 'SCAN_SHOP_ERROR') {
      stopScanningUI();
      if (statusText) {
        statusText.textContent = '❌ Lỗi: ' + (message.error || 'Quét thất bại');
      }
      alert('Lỗi quét Shop: ' + (message.error || 'Vui lòng kiểm tra lại link shop.'));
    }
  });

  // 9. Table display & filtering for VIEW 1 (Quét Shop Mới)
  function showResultsUI() {
    if (toolbar) toolbar.style.display = 'block';
    if (tableSection) tableSection.style.display = 'block';
  }

  filterInput?.addEventListener('input', () => renderTable());
  filterSavedSelect?.addEventListener('change', () => renderTable());

  function getFilteredScanProducts() {
    const kw = (filterInput?.value || '').trim().toLowerCase();
    const savedFilter = filterSavedSelect?.value || 'all';

    return scannedProducts.filter(p => {
      const isSaved = savedItemIds.has(String(p.itemId));
      if (savedFilter === 'unsaved' && isSaved) return false;
      if (savedFilter === 'saved' && !isSaved) return false;

      if (!kw) return true;
      const name = (p.name || '').toLowerCase();
      const id = String(p.itemId || '');
      const modelsText = (p.models || []).map(m => `${m.name} ${m.sku}`).join(' ').toLowerCase();
      return name.includes(kw) || id.includes(kw) || modelsText.includes(kw);
    });
  }

  // Render variations breakdown with detailed prices
  function renderVariationPricesHtml(p) {
    const models = p.models || [];
    if (models.length === 0) {
      const priceText = p.promoPrice ? `
        <b style="color: #dc2626;">${fmtMoney(p.promoPrice)}</b>
        <span style="color: #94a3b8; text-decoration: line-through; font-size: 9px; margin-left: 2px;">${fmtMoney(p.price)}</span>
      ` : `<b style="color: #0f172a;">${fmtMoney(p.price)}</b>`;
      return `
        <div style="font-size: 9px; color: #64748b; margin-bottom: 2px;">Đơn lẻ:</div>
        <div>${priceText}</div>
      `;
    }

    const isMulti = models.length > 1;
    const badge = `
      <div style="margin-bottom: 3px; display: flex; justify-content: space-between; align-items: center;">
        <span style="display: inline-block; padding: 1px 5px; font-size: 9px; font-weight: bold; border-radius: 3px; ${isMulti ? 'background: #e0f2fe; color: #0369a1;' : 'background: #f1f5f9; color: #475569;'}">
          ${isMulti ? `${models.length} phân loại` : '1 phân loại'}
        </span>
      </div>
    `;

    const rows = models.map((m, idx) => {
      const hasPromo = m.promoPrice && Number(m.promoPrice) > 0 && Number(m.promoPrice) < Number(m.price);
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px; padding: 2px 0; border-bottom: 1px dotted #e2e8f0; font-size: 10px; line-height: 1.25;">
          <span style="color: #334155; max-width: 85px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(m.name || 'Mặc định')}">
            • ${escapeHtml(m.name || ('PL ' + (idx + 1)))}
          </span>
          <span style="white-space: nowrap; text-align: right;">
            ${hasPromo ? `
              <b style="color: #dc2626;">${fmtMoney(m.promoPrice)}</b>
              <span style="color: #94a3b8; text-decoration: line-through; font-size: 9px; margin-left: 2px;">${fmtMoney(m.price)}</span>
            ` : `
              <b style="color: #0f172a;">${fmtMoney(m.price)}</b>
            `}
          </span>
        </div>
      `;
    }).join('');

    return `
      ${badge}
      <div style="max-height: 85px; overflow-y: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 4px;">
        ${rows}
      </div>
    `;
  }

  // Render variations with price after Shopee Voucher
  function renderVariationVoucherPricesHtml(p) {
    const models = p.models || [];
    const hasVoucher = Boolean(p.hasShopVoucher && (p.voucherDiscount > 0 || p.bestVoucher));
    const bestVoucher = p.bestVoucher;

    const shopVoucherBadge = hasVoucher
      ? `<div style="margin-bottom: 3px;">
          <span style="display: inline-block; padding: 1px 5px; font-size: 9px; font-weight: bold; border-radius: 3px; background: #fef3c7; color: #b45309; border: 1px solid #fde68a;" title="${escapeHtml(bestVoucher?.title || '')}">
            ${escapeHtml(p.voucherBadge || '🎟️ Voucher shop')}
          </span>
        </div>`
      : `<div style="margin-bottom: 3px;">
          <span style="display: inline-block; padding: 1px 5px; font-size: 9px; border-radius: 3px; background: #f1f5f9; color: #94a3b8;">
            Không có voucher
          </span>
        </div>`;

    if (models.length === 0) {
      const activeP = (p.promoPrice && Number(p.promoPrice) > 0) ? Number(p.promoPrice) : Number(p.price);
      const priceAfter = p.priceAfterVoucher != null ? p.priceAfterVoucher : activeP;
      return `
        ${shopVoucherBadge}
        <div style="font-size: 11px; font-weight: bold; color: ${hasVoucher ? '#b45309' : '#0f172a'};">
          ${fmtMoney(priceAfter)}
        </div>
      `;
    }

    const rows = models.map((m, idx) => {
      const mActiveP = (m.promoPrice && Number(m.promoPrice) > 0) ? Number(m.promoPrice) : Number(m.price);
      const priceAfter = m.priceAfterVoucher != null ? m.priceAfterVoucher : (p.voucherDiscount ? Math.max(0, mActiveP - p.voucherDiscount) : mActiveP);
      const mBadge = m.voucherBadge || p.voucherBadge || '';

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px; padding: 2px 0; border-bottom: 1px dotted #e2e8f0; font-size: 10px; line-height: 1.25;">
          <span style="color: #334155; max-width: 80px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(m.name || 'Mặc định')}">
            • ${escapeHtml(m.name || ('PL ' + (idx + 1)))}
          </span>
          <span style="white-space: nowrap; text-align: right;">
            <b style="color: ${hasVoucher ? '#b45309' : '#0f172a'}; font-size: 10px;">${fmtMoney(priceAfter)}</b>
            ${hasVoucher && mBadge ? `<span style="font-size: 8px; color: #b45309; margin-left: 2px;">${escapeHtml(mBadge)}</span>` : ''}
          </span>
        </div>
      `;
    }).join('');

    return `
      ${shopVoucherBadge}
      <div style="max-height: 85px; overflow-y: auto; background: ${hasVoucher ? '#fffbeb' : '#f8fafc'}; border: 1px solid ${hasVoucher ? '#fde68a' : '#e2e8f0'}; border-radius: 4px; padding: 2px 4px;">
        ${rows}
      </div>
    `;
  }

  function renderTable() {
    if (!tbody) return;
    const items = getFilteredScanProducts();

    // Update count badge
    const totalItems = scannedProducts.length;
    const unsavedCount = scannedProducts.filter(p => !savedItemIds.has(String(p.itemId))).length;
    const selectedCount = scannedProducts.filter(p => selectedItemIds.has(p.itemId)).length;

    if (countBadge) {
      countBadge.innerHTML = `${totalItems} SP (⚠️ Chưa lưu: <b>${unsavedCount}</b>) - Đã chọn: <b>${selectedCount}</b>`;
    }

    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="padding: 24px; text-align: center; color: #94a3b8; font-size: 12px;">Chưa có sản phẩm nào. Hãy bấm "🚀 Bắt đầu quét sản phẩm" để đọc dữ liệu.</td></tr>`;
      return;
    }

    let html = '';
    items.forEach((p, index) => {
      const isChecked = selectedItemIds.has(p.itemId);
      const isSaved = savedItemIds.has(String(p.itemId));
      const thumb = p.thumbnail || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"/>';

      const sheetBadge = isSaved
        ? `<span style="display: inline-block; padding: 2px 6px; font-size: 9px; font-weight: 700; border-radius: 3px; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;">✅ Đã lưu</span>`
        : `<span style="display: inline-block; padding: 2px 6px; font-size: 9px; font-weight: 700; border-radius: 3px; background: #fef3c7; color: #b45309; border: 1px solid #fde68a;">⚠️ Chưa lưu</span>`;

      html += `
        <tr style="border-bottom: 1px solid #f1f5f9; ${isChecked ? 'background: #f0fdf4;' : ''}" data-item-id="${escapeHtml(p.itemId)}">
          <td style="padding: 6px 4px; text-align: center;">
            <input type="checkbox" class="quet-shop-row-chk" data-item-id="${escapeHtml(p.itemId)}" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
          </td>
          <td style="padding: 6px 4px; text-align: center; color: #64748b;">${index + 1}</td>
          <td style="padding: 4px; text-align: center;">
            <div style="position: relative; width: 40px; height: 40px; margin: 0 auto; border-radius: 4px; overflow: hidden; border: 1px solid #e2e8f0; background: #fafafa;">
              <img src="${escapeHtml(thumb)}" alt="Thumb" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
              ${p.videoUrl ? '<span style="position: absolute; bottom: 1px; right: 1px; background: rgba(0,0,0,0.65); color: white; font-size: 8px; padding: 1px 2px; border-radius: 2px;">▶</span>' : ''}
            </div>
          </td>
          <td style="padding: 6px 8px; max-width: 190px;">
            <div style="font-weight: 600; color: #1e293b; font-size: 11px; line-height: 1.35; margin-bottom: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(p.name)}">
              ${escapeHtml(p.name)}
            </div>
            <div style="font-size: 10px; color: #64748b; display: flex; align-items: center; gap: 6px;">
              <span>ID: <b>${escapeHtml(p.itemId)}</b></span>
              <a href="${escapeHtml(p.productUrl)}" target="_blank" style="color: #0284c7; text-decoration: none;" title="Mở trên Shopee">↗ Link</a>
            </div>
          </td>
          <td style="padding: 6px 6px;">
            ${renderVariationPricesHtml(p)}
          </td>
          <td style="padding: 6px 6px; background: #fffdf5;">
            ${renderVariationVoucherPricesHtml(p)}
          </td>
          <td style="padding: 6px 4px; text-align: center;">
            ${sheetBadge}
          </td>
          <td style="padding: 6px 4px; text-align: center; font-size: 10px; color: #475569;">
            <div>${p.historicalSold ? Number(p.historicalSold).toLocaleString('vi-VN') : '0'}</div>
            <div style="color: #f59e0b; font-weight: bold;">⭐ ${p.ratingStar || '5.0'}</div>
          </td>
          <td style="padding: 6px 4px; text-align: center;">
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <button type="button" class="btn-row-view ghost" data-item-id="${escapeHtml(p.itemId)}" style="padding: 2px 4px; font-size: 10px; border-radius: 3px; border: 1px solid #cbd5e1; background: white; color: #0284c7; cursor: pointer;">
                👁 Xem
              </button>
              <button type="button" class="btn-row-clone secondary" data-item-id="${escapeHtml(p.itemId)}" style="padding: 2px 4px; font-size: 10px; border-radius: 3px; background: #7c3aed; color: white; border: none; font-weight: bold; cursor: pointer; white-space: nowrap;" title="Sao chép sản phẩm này về shop Shopee của bạn">
                📋 Sao chép
              </button>
              <button type="button" class="btn-row-save-sheet secondary" data-item-id="${escapeHtml(p.itemId)}" style="padding: 2px 4px; font-size: 10px; border-radius: 3px; background: #16a34a; color: white; border: none; font-weight: bold; cursor: pointer;" title="Lưu sản phẩm này vào Sheet QUET_SP">
                💾 Lưu sheet
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;

    // Row Checkbox handlers
    tbody.querySelectorAll('.quet-shop-row-chk').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.dataset.itemId;
        if (e.target.checked) selectedItemIds.add(id);
        else selectedItemIds.delete(id);
        const tr = e.target.closest('tr');
        if (tr) tr.style.background = e.target.checked ? '#f0fdf4' : '';
        renderTableCountStats();
      });
    });

    // Row View handlers
    tbody.querySelectorAll('.btn-row-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.itemId;
        const item = scannedProducts.find(p => p.itemId === id) || allScannedProducts.find(p => p.itemId === id);
        if (item) openDetailModal(item);
      });
    });

    // Row Clone handlers
    tbody.querySelectorAll('.btn-row-clone').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.itemId;
        const item = scannedProducts.find(p => p.itemId === id) || allScannedProducts.find(p => p.itemId === id);
        if (item) cloneToShopeeTab(item);
      });
    });

    // Row Save Sheet handlers
    tbody.querySelectorAll('.btn-row-save-sheet').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.itemId;
        const item = scannedProducts.find(p => p.itemId === id) || allScannedProducts.find(p => p.itemId === id);
        if (item) pushProductsToQuetSpSheet([item]);
      });
    });
  }

  function renderTableCountStats() {
    const totalItems = scannedProducts.length;
    const unsavedCount = scannedProducts.filter(p => !savedItemIds.has(String(p.itemId))).length;
    const selectedCount = scannedProducts.filter(p => selectedItemIds.has(p.itemId)).length;
    if (countBadge) {
      countBadge.innerHTML = `${totalItems} SP (⚠️ Chưa lưu: <b>${unsavedCount}</b>) - Đã chọn: <b>${selectedCount}</b>`;
    }
  }

  // 10. Check All Checkbox
  checkAll?.addEventListener('change', () => {
    const isChecked = checkAll.checked;
    const items = getFilteredScanProducts();
    items.forEach(p => {
      if (isChecked) selectedItemIds.add(p.itemId);
      else selectedItemIds.delete(p.itemId);
    });
    renderTable();
  });

  // 11. "Chọn SP chưa lưu" button
  btnSelectUnsaved?.addEventListener('click', () => {
    selectedItemIds.clear();
    const items = getFilteredScanProducts();
    items.forEach(p => {
      if (!savedItemIds.has(String(p.itemId))) {
        selectedItemIds.add(p.itemId);
      }
    });
    renderTable();
  });

  // 12. Clear all scanned products in current scan session
  btnClearAll?.addEventListener('click', () => {
    if (!scannedProducts.length) return;
    if (!confirm('Bạn có chắc muốn xóa danh sách sản phẩm vừa quét? (Dữ liệu trong "Toàn bộ SP đã quét" vẫn được giữ)')) return;
    scannedProducts = [];
    selectedItemIds.clear();
    currentShopInfo = null;
    chrome.storage.local.remove(['quetShopProducts', 'quetShopInfo']);
    renderShopInfoCard(null);
    if (progressWrap) progressWrap.style.display = 'none';
    if (toolbar) toolbar.style.display = 'none';
    if (tableSection) tableSection.style.display = 'none';
    renderTable();
  });

  // =========================================================================
  // VIEW 2: TOÀN BỘ SẢN PHẨM ĐÃ QUÉT (KHO SP & SỬA SHOP)
  // =========================================================================

  function populateHistoryShopDropdown() {
    if (!historyFilterShop) return;
    const currentVal = historyFilterShop.value;

    const shopCounts = {};
    allScannedProducts.forEach(p => {
      const sName = p.shopName || 'Shop Shopee';
      shopCounts[sName] = (shopCounts[sName] || 0) + 1;
    });

    const shops = Object.keys(shopCounts).sort();
    let opts = '<option value="">-- Tất cả các Shop (' + allScannedProducts.length + ' SP) --</option>';
    shops.forEach(s => {
      opts += `<option value="${escapeHtml(s)}">${escapeHtml(s)} (${shopCounts[s]} SP)</option>`;
    });

    historyFilterShop.innerHTML = opts;
    if (shops.includes(currentVal)) {
      historyFilterShop.value = currentVal;
    }
  }

  function getFilteredHistoryProducts() {
    const selectedShop = (historyFilterShop?.value || '').trim();
    const kw = (historyFilterInput?.value || '').trim().toLowerCase();

    return allScannedProducts.filter(p => {
      if (selectedShop && (p.shopName || 'Shop Shopee') !== selectedShop) {
        return false;
      }
      if (!kw) return true;
      const name = (p.name || '').toLowerCase();
      const id = String(p.itemId || '');
      const sName = (p.shopName || '').toLowerCase();
      const modelsText = (p.models || []).map(m => `${m.name} ${m.sku}`).join(' ').toLowerCase();
      return name.includes(kw) || id.includes(kw) || sName.includes(kw) || modelsText.includes(kw);
    });
  }

  function renderHistoryTable() {
    if (!historyTbody) return;
    const items = getFilteredHistoryProducts();

    if (historyCountBadge) {
      historyCountBadge.textContent = `${items.length} SP`;
    }

    if (items.length === 0) {
      const emptyMsg = isSyncingFromSheet
        ? '⏳ Đang đọc sản phẩm từ Google Sheet (QUET_SP & SP_SHOPEE)... Vui lòng đợi trong giây lát.'
        : 'Chưa có sản phẩm nào trong kho lưu trữ hoặc không khớp bộ lọc. Bấm nút <b>"🔄 Đọc từ Sheet"</b> ở góc trên bên phải để nạp dữ liệu từ Google Sheet.';
      historyTbody.innerHTML = `<tr><td colspan="8" style="padding: 24px; text-align: center; color: #94a3b8; font-size: 12px;">${emptyMsg}</td></tr>`;
      return;
    }

    let html = '';
    items.forEach((p, index) => {
      const thumb = p.thumbnail || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"/>';
      const shopName = p.shopName || 'Shop Shopee';

      html += `
        <tr style="border-bottom: 1px solid #f1f5f9;" data-item-id="${escapeHtml(p.itemId)}">
          <td style="padding: 6px 4px; text-align: center; color: #64748b;">${index + 1}</td>
          <td style="padding: 6px 6px; font-size: 11px;">
            <div style="font-weight: 600; color: #6d28d9; max-width: 95px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(shopName)}">
              ${escapeHtml(shopName)}
            </div>
            <button type="button" class="btn-row-edit-shop ghost" data-item-id="${escapeHtml(p.itemId)}" style="border: none; background: transparent; color: #0284c7; font-size: 10px; cursor: pointer; padding: 0;" title="Đổi tên shop cho sản phẩm này">
              ✏️ Sửa
            </button>
          </td>
          <td style="padding: 4px; text-align: center;">
            <div style="position: relative; width: 40px; height: 40px; margin: 0 auto; border-radius: 4px; overflow: hidden; border: 1px solid #e2e8f0; background: #fafafa;">
              <img src="${escapeHtml(thumb)}" alt="Thumb" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
              ${p.videoUrl ? '<span style="position: absolute; bottom: 1px; right: 1px; background: rgba(0,0,0,0.65); color: white; font-size: 8px; padding: 1px 2px; border-radius: 2px;">▶</span>' : ''}
            </div>
          </td>
          <td style="padding: 6px 8px; max-width: 190px;">
            <div style="font-weight: 600; color: #1e293b; font-size: 11px; line-height: 1.35; margin-bottom: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(p.name)}">
              ${escapeHtml(p.name)}
            </div>
            <div style="font-size: 10px; color: #64748b; display: flex; align-items: center; gap: 6px;">
              <span>ID: <b>${escapeHtml(p.itemId)}</b></span>
              <a href="${escapeHtml(p.productUrl)}" target="_blank" style="color: #0284c7; text-decoration: none;" title="Mở trên Shopee">↗ Link</a>
            </div>
          </td>
          <td style="padding: 6px 6px;">
            ${renderVariationPricesHtml(p)}
          </td>
          <td style="padding: 6px 6px; background: #fffdf5;">
            ${renderVariationVoucherPricesHtml(p)}
          </td>
          <td style="padding: 6px 4px; text-align: center; font-size: 10px; color: #475569;">
            <div>${p.historicalSold ? Number(p.historicalSold).toLocaleString('vi-VN') : '0'}</div>
            <div style="color: #f59e0b; font-weight: bold;">⭐ ${p.ratingStar || '5.0'}</div>
          </td>
          <td style="padding: 6px 4px; text-align: center;">
            <div style="display: flex; flex-direction: column; gap: 3px;">
              <button type="button" class="btn-history-view ghost" data-item-id="${escapeHtml(p.itemId)}" style="padding: 2px 4px; font-size: 10px; border-radius: 3px; border: 1px solid #cbd5e1; background: white; color: #0284c7; cursor: pointer;">
                👁 Xem
              </button>
              <button type="button" class="btn-history-clone secondary" data-item-id="${escapeHtml(p.itemId)}" style="padding: 2px 4px; font-size: 10px; border-radius: 3px; background: #7c3aed; color: white; border: none; font-weight: bold; cursor: pointer; white-space: nowrap;" title="Sao chép sản phẩm này về shop Shopee của bạn">
                📋 Sao chép
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    historyTbody.innerHTML = html;

    // Row View handlers
    historyTbody.querySelectorAll('.btn-history-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.itemId;
        const item = allScannedProducts.find(p => p.itemId === id);
        if (item) openDetailModal(item);
      });
    });

    // Row Clone handlers
    historyTbody.querySelectorAll('.btn-history-clone').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.itemId;
        const item = allScannedProducts.find(p => p.itemId === id) || scannedProducts.find(p => p.itemId === id);
        if (item) cloneToShopeeTab(item);
      });
    });

    // Row Edit Shop Name handler
    historyTbody.querySelectorAll('.btn-row-edit-shop').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.itemId;
        const item = allScannedProducts.find(p => p.itemId === id);
        if (!item) return;
        const curShop = item.shopName || '';
        const newName = prompt(`Nhập tên shop mới cho sản phẩm "${item.name}":`, curShop);
        if (newName !== null && newName.trim() && newName.trim() !== curShop) {
          renameShopGlobally(curShop, newName.trim());
        }
      });
    });
  }

  // Filter events in history view
  historyFilterShop?.addEventListener('change', () => renderHistoryTable());
  historyFilterInput?.addEventListener('input', () => renderHistoryTable());
  btnHistoryRefresh?.addEventListener('click', () => {
    syncAllProductsFromSheet(true);
  });

  // "Sửa tên shop" button in history top bar
  btnHistoryEditShop?.addEventListener('click', () => {
    const curShop = historyFilterShop?.value || '';
    if (curShop) {
      const newName = prompt(`Nhập tên mới cho shop "${curShop}":`, curShop);
      if (newName !== null && newName.trim() && newName.trim() !== curShop) {
        const count = renameShopGlobally(curShop, newName.trim());
        alert(`✅ Đã cập nhật tên shop thành "${newName.trim()}" cho ${count} sản phẩm!`);
      }
    } else {
      const targetShop = prompt(`Bạn đang chọn tất cả shop. Nhập tên shop bạn muốn đổi:`, '');
      if (targetShop !== null && targetShop.trim()) {
        const found = allScannedProducts.some(p => (p.shopName || '').toLowerCase() === targetShop.trim().toLowerCase());
        if (!found) {
          alert(`Không tìm thấy sản phẩm nào thuộc shop "${targetShop.trim()}".`);
          return;
        }
        const updatedName = prompt(`Nhập tên mới thay thế cho "${targetShop.trim()}":`, targetShop.trim());
        if (updatedName !== null && updatedName.trim() && updatedName.trim() !== targetShop.trim()) {
          const count = renameShopGlobally(targetShop.trim(), updatedName.trim());
          alert(`✅ Đã cập nhật tên shop thành "${updatedName.trim()}" cho ${count} sản phẩm!`);
        }
      }
    }
  });

  // =========================================================================
  // VIEW 3: DANH SÁCH SHOP (QUẢN LÝ SHOP ĐÃ QUÉT)
  // =========================================================================

  function updateShopInList(shopName, shopInfo, shopUrl) {
    if (!shopName) return;
    const nowStr = new Date().toLocaleString('vi-VN');
    const existingIdx = quetShopList.findIndex(s => (s.name || '').toLowerCase() === shopName.toLowerCase());

    const shopData = {
      name: shopName,
      shopId: shopInfo?.shopId || (existingIdx >= 0 ? quetShopList[existingIdx].shopId : ''),
      url: shopUrl || (existingIdx >= 0 ? quetShopList[existingIdx].url : ''),
      ratingStar: shopInfo?.ratingStar || (existingIdx >= 0 ? quetShopList[existingIdx].ratingStar : '5.0'),
      itemCount: scannedProducts.length || 0,
      followerCount: shopInfo?.followerCount || (existingIdx >= 0 ? quetShopList[existingIdx].followerCount : 0),
      lastScannedAt: nowStr
    };

    if (existingIdx >= 0) {
      quetShopList[existingIdx] = {
        ...quetShopList[existingIdx],
        ...shopData
      };
    } else {
      quetShopList.push(shopData);
    }

    saveShopListToCache();
  }

  function saveShopListToCache() {
    chrome.storage.local.set({ quetShopList: quetShopList });
    updateTotalShopBadges();
  }

  function getUnifiedShopList() {
    const shopMap = new Map();

    // 1. Add from quetShopList
    quetShopList.forEach(s => {
      if (s && s.name) {
        shopMap.set(s.name.trim().toLowerCase(), {
          name: s.name.trim(),
          shopId: s.shopId || '',
          url: s.url || '',
          ratingStar: s.ratingStar || '5.0',
          itemCount: 0,
          followerCount: s.followerCount || 0,
          lastScannedAt: s.lastScannedAt || 'Trước đây'
        });
      }
    });

    // 2. Discover shops from allScannedProducts
    allScannedProducts.forEach(p => {
      const sName = (p.shopName || 'Shop Shopee').trim();
      const key = sName.toLowerCase();
      if (!shopMap.has(key)) {
        shopMap.set(key, {
          name: sName,
          shopId: p.shopId || '',
          url: p.productUrl || '',
          ratingStar: p.ratingStar || '5.0',
          itemCount: 0,
          followerCount: 0,
          lastScannedAt: p.scannedAt ? new Date(p.scannedAt).toLocaleString('vi-VN') : 'Trước đây'
        });
      }
    });

    // 3. Compute accurate product count from allScannedProducts
    const list = Array.from(shopMap.values());
    list.forEach(s => {
      const count = allScannedProducts.filter(p => (p.shopName || '').trim().toLowerCase() === s.name.toLowerCase()).length;
      s.itemCount = count;
    });

    return list;
  }

  function updateTotalShopBadges() {
    const list = getUnifiedShopList();
    if (totalShopsBadge) {
      totalShopsBadge.textContent = list.length;
    }
    if (shopListCountBadge) {
      shopListCountBadge.textContent = `${list.length} Shop`;
    }
  }

  function renameShopGlobally(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return 0;
    const oldKey = oldName.trim().toLowerCase();
    const trimmedNew = newName.trim();

    // 1. Update in allScannedProducts
    let count = 0;
    allScannedProducts.forEach(p => {
      if ((p.shopName || '').trim().toLowerCase() === oldKey) {
        p.shopName = trimmedNew;
        count++;
      }
    });

    // 2. Update in scannedProducts
    scannedProducts.forEach(p => {
      if ((p.shopName || '').trim().toLowerCase() === oldKey) {
        p.shopName = trimmedNew;
      }
    });

    // 3. Update in quetShopList
    let shopFound = false;
    quetShopList.forEach(s => {
      if ((s.name || '').trim().toLowerCase() === oldKey) {
        s.name = trimmedNew;
        shopFound = true;
      }
    });
    if (!shopFound) {
      quetShopList.push({
        name: trimmedNew,
        shopId: '',
        url: '',
        ratingStar: '5.0',
        itemCount: count,
        followerCount: 0,
        lastScannedAt: new Date().toLocaleString('vi-VN')
      });
    }

    // 4. Update inputTenShop if matching
    if (inputTenShop && (inputTenShop.value || '').trim().toLowerCase() === oldKey) {
      inputTenShop.value = trimmedNew;
      chrome.storage.local.set({ quetShopTenShop: trimmedNew });
    }

    saveAllProductsToCache();
    saveShopListToCache();
    saveCurrentProductsToCache();
    populateHistoryShopDropdown();
    updateTotalShopBadges();
    renderHistoryTable();
    renderShopListTable();

    return count;
  }

  function deleteShopGlobally(shopName) {
    if (!shopName) return;
    const targetKey = shopName.trim().toLowerCase();

    // 1. Remove products from allScannedProducts
    const initialLen = allScannedProducts.length;
    allScannedProducts = allScannedProducts.filter(p => (p.shopName || '').trim().toLowerCase() !== targetKey);
    const removedCount = initialLen - allScannedProducts.length;

    // 2. Remove shop from quetShopList
    quetShopList = quetShopList.filter(s => (s.name || '').trim().toLowerCase() !== targetKey);

    // 3. Save to storage
    saveAllProductsToCache();
    saveShopListToCache();

    // 4. Refresh views
    populateHistoryShopDropdown();
    updateTotalShopBadges();
    renderHistoryTable();
    renderShopListTable();

    alert(`✅ Đã xóa shop "${shopName}" và ${removedCount} sản phẩm liên quan khỏi kho lưu trữ.`);
  }

  function renderShopListTable() {
    if (!shopListTbody) return;
    const shops = getUnifiedShopList();
    const kw = (shopListFilterInput?.value || '').trim().toLowerCase();

    const filtered = shops.filter(s => {
      if (!kw) return true;
      const name = (s.name || '').toLowerCase();
      const id = String(s.shopId || '').toLowerCase();
      return name.includes(kw) || id.includes(kw);
    });

    updateTotalShopBadges();

    if (filtered.length === 0) {
      shopListTbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; text-align: center; color: #94a3b8; font-size: 12px;">Chưa có shop nào được quét hoặc không tìm thấy shop phù hợp.</td></tr>`;
      return;
    }

    let html = '';
    filtered.forEach((s, index) => {
      let shopUrl = s.url;
      if (!shopUrl || !shopUrl.startsWith('http')) {
        if (s.shopId) {
          shopUrl = `https://shopee.vn/shop/${s.shopId}`;
        } else {
          shopUrl = `https://shopee.vn/search?keyword=${encodeURIComponent(s.name)}`;
        }
      }

      html += `
        <tr style="border-bottom: 1px solid #f1f5f9;" data-shop-name="${escapeHtml(s.name)}">
          <td style="padding: 6px 4px; text-align: center; color: #64748b;">${index + 1}</td>
          <td style="padding: 6px 8px;">
            <div style="font-weight: 700; color: #047857; font-size: 12px; margin-bottom: 2px;">
              ${escapeHtml(s.name)}
            </div>
            <div style="font-size: 10px; color: #64748b; display: flex; align-items: center; gap: 6px;">
              ${s.shopId ? `<span>ID: <b>${escapeHtml(s.shopId)}</b></span>` : ''}
              <a href="${escapeHtml(shopUrl)}" target="_blank" style="color: #0284c7; text-decoration: none;" title="Mở trang shop trên Shopee">↗ Shopee</a>
            </div>
          </td>
          <td style="padding: 6px 6px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: bold; border-radius: 10px; background: #e0f2fe; color: #0369a1;">
              ${s.itemCount} SP
            </span>
          </td>
          <td style="padding: 6px 6px; text-align: center; font-size: 11px; color: #f59e0b; font-weight: bold;">
            ⭐ ${s.ratingStar || '5.0'}
          </td>
          <td style="padding: 6px 6px; font-size: 10px; color: #64748b; white-space: nowrap;">
            ${escapeHtml(s.lastScannedAt || '-')}
          </td>
          <td style="padding: 6px 6px; text-align: center;">
            <div style="display: flex; gap: 4px; justify-content: center; flex-wrap: wrap;">
              <button type="button" class="btn-shop-view-sp" data-shop-name="${escapeHtml(s.name)}" style="padding: 3px 6px; font-size: 10px; font-weight: 600; border-radius: 3px; background: #7c3aed; color: white; border: none; cursor: pointer;" title="Xem các sản phẩm đã quét của shop này">
                📦 Xem SP
              </button>
              <button type="button" class="btn-shop-rescan" data-shop-name="${escapeHtml(s.name)}" data-shop-url="${escapeHtml(s.url || '')}" style="padding: 3px 6px; font-size: 10px; font-weight: 600; border-radius: 3px; background: #0284c7; color: white; border: none; cursor: pointer;" title="Quét lại shop này">
                🔄 Quét lại
              </button>
              <button type="button" class="btn-shop-edit" data-shop-name="${escapeHtml(s.name)}" style="padding: 3px 5px; font-size: 10px; border-radius: 3px; border: 1px solid #cbd5e1; background: white; color: #334155; cursor: pointer;" title="Đổi tên shop">
                ✏️
              </button>
              <button type="button" class="btn-shop-delete" data-shop-name="${escapeHtml(s.name)}" data-item-count="${s.itemCount}" style="padding: 3px 5px; font-size: 10px; border-radius: 3px; border: 1px solid #fca5a5; background: #fef2f2; color: #dc2626; cursor: pointer;" title="Xóa shop và toàn bộ sản phẩm đã quét của shop này">
                🗑
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    shopListTbody.innerHTML = html;

    // Attach row events
    // 1. Xem SP
    shopListTbody.querySelectorAll('.btn-shop-view-sp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sName = e.currentTarget.dataset.shopName;
        switchSubtab('history');
        if (historyFilterShop) {
          historyFilterShop.value = sName;
        }
        renderHistoryTable();
      });
    });

    // 2. Quét lại
    shopListTbody.querySelectorAll('.btn-shop-rescan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sName = e.currentTarget.dataset.shopName;
        const sUrl = e.currentTarget.dataset.shopUrl;
        switchSubtab('scan');
        if (sUrl && inputUrl) {
          inputUrl.value = sUrl;
          chrome.storage.local.set({ quetShopUrl: sUrl });
        }
        if (sName && inputTenShop) {
          inputTenShop.value = sName;
          chrome.storage.local.set({ quetShopTenShop: sName });
        }
        if (inputUrl) inputUrl.focus();
      });
    });

    // 3. Sửa tên
    shopListTbody.querySelectorAll('.btn-shop-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sName = e.currentTarget.dataset.shopName;
        const newName = prompt(`Nhập tên mới cho shop "${sName}":`, sName);
        if (newName !== null && newName.trim() && newName.trim() !== sName) {
          const updatedCount = renameShopGlobally(sName, newName.trim());
          alert(`✅ Đã đổi tên shop thành "${newName.trim()}" (${updatedCount} sản phẩm)!`);
        }
      });
    });

    // 4. Xóa
    shopListTbody.querySelectorAll('.btn-shop-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const sName = e.currentTarget.dataset.shopName;
        const count = e.currentTarget.dataset.itemCount || 0;
        if (!confirm(`Bạn có chắc muốn xóa shop "${sName}" và toàn bộ ${count} sản phẩm đã quét của shop này khỏi bộ nhớ?`)) {
          return;
        }
        deleteShopGlobally(sName);
      });
    });
  }

  shopListFilterInput?.addEventListener('input', () => renderShopListTable());
  btnShopListRefresh?.addEventListener('click', () => {
    syncAllProductsFromSheet(true);
  });

  // =========================================================================
  // MODAL: VIEW DETAILS
  // =========================================================================
  function openDetailModal(item) {
    currentModalItem = item;
    if (!modal) return;

    modalTitle.textContent = item.name || 'Chi tiết sản phẩm';
    const isSaved = savedItemIds.has(String(item.itemId));
    const sheetBadge = isSaved
      ? `<span style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 700; border-radius: 4px; background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0;">✅ Đã lưu vào Sheet</span>`
      : `<span style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 700; border-radius: 4px; background: #fef3c7; color: #b45309; border: 1px solid #fde68a;">⚠️ Chưa lưu vào Sheet</span>`;

    let bodyHtml = `
      <!-- Basic Info Bar -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
        <div><b>Tên shop:</b> <span style="color: #6d28d9; font-weight: bold;">${escapeHtml(item.shopName || inputTenShop?.value || 'Shop Shopee')}</span></div>
        <div><b>Trạng thái Sheet:</b> ${sheetBadge}</div>
        <div><b>ID Shopee:</b> ${escapeHtml(item.itemId)}</div>
        <div><b>Voucher Shop:</b> ${item.hasShopVoucher ? `<span style="color: #b45309; font-weight: bold;">Có ${(item.shopVouchers || []).length} Voucher</span> (${escapeHtml(item.bestVoucher?.title || item.voucherBadge || '')})` : `<span style="color: #94a3b8;">Không có</span>`}</div>
        <div><b>Ngành hàng:</b> ${escapeHtml(item.category || 'Chưa có')}</div>
        <div><b>Thương hiệu:</b> ${escapeHtml(item.brand || 'No Brand')}</div>
        <div><b>Đã bán:</b> ${item.historicalSold ? Number(item.historicalSold).toLocaleString('vi-VN') : '0'}</div>
        <div><b>Đánh giá:</b> ⭐ ${item.ratingStar || '5.0'}</div>
        <div style="grid-column: span 2;">
          <b>Link SP:</b> <a href="${escapeHtml(item.productUrl)}" target="_blank" style="color: #0284c7; word-break: break-all;">${escapeHtml(item.productUrl)}</a>
        </div>
      </div>

      <!-- Main Images Gallery -->
      <div>
        <h4 style="margin: 0 0 6px; font-size: 12px; color: #1e293b;">🖼️ Ảnh chính (${(item.images || []).length} ảnh)</h4>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">
          ${(item.images || []).map((img, i) => `
            <a href="${escapeHtml(img)}" target="_blank" title="Ảnh ${i + 1} - Bấm để phóng to">
              <img src="${escapeHtml(img)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1; flex-shrink: 0;" loading="lazy">
            </a>
          `).join('')}
        </div>
      </div>

      <!-- Video Preview if available -->
      ${item.videoUrl ? `
        <div>
          <h4 style="margin: 0 0 6px; font-size: 12px; color: #1e293b;">🎬 Video sản phẩm</h4>
          <video controls src="${escapeHtml(item.videoUrl)}" style="max-width: 100%; max-height: 220px; border-radius: 6px; background: black;"></video>
          <div style="margin-top: 4px; font-size: 11px;">
            <a href="${escapeHtml(item.videoUrl)}" target="_blank" style="color: #0284c7;">↗ Mở link video trực tiếp</a>
          </div>
        </div>
      ` : ''}

      <!-- Variations Table with Detailed Prices -->
      <div>
        <h4 style="margin: 0 0 6px; font-size: 12px; color: #1e293b;">🏷️ Danh sách phân loại & Giá chi tiết (${(item.models || []).length} biến thể)</h4>
        <div style="max-height: 200px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
            <thead style="position: sticky; top: 0; background: #f1f5f9;">
              <tr style="border-bottom: 1px solid #cbd5e1;">
                <th style="padding: 4px 6px; width: 36px; text-align: center;">Ảnh</th>
                <th style="padding: 4px 6px;">Tên phân loại</th>
                <th style="padding: 4px 6px;">SKU</th>
                <th style="padding: 4px 6px; text-align: right;">Giá gốc</th>
                <th style="padding: 4px 6px; text-align: right;">Giá KM</th>
                <th style="padding: 4px 6px; text-align: right; background: #fefce8; color: #854d0e;">Giá sau Voucher</th>
                <th style="padding: 4px 6px; text-align: right;">Tồn kho</th>
              </tr>
            </thead>
            <tbody>
              ${(item.models || []).map(m => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 4px; text-align: center;">
                    <img src="${escapeHtml(m.imageUrl || item.thumbnail)}" style="width: 28px; height: 28px; object-fit: cover; border-radius: 3px; border: 1px solid #e2e8f0;" loading="lazy">
                  </td>
                  <td style="padding: 4px 6px; font-weight: 600;">${escapeHtml(m.name || 'Mặc định')}</td>
                  <td style="padding: 4px 6px; color: #64748b;">${escapeHtml(m.sku || '-')}</td>
                  <td style="padding: 4px 6px; text-align: right; ${m.promoPrice ? 'text-decoration: line-through; color: #94a3b8;' : 'font-weight: bold;'}">${fmtMoney(m.price)}</td>
                  <td style="padding: 4px 6px; text-align: right; font-weight: bold; color: #dc2626;">${m.promoPrice ? fmtMoney(m.promoPrice) : '-'}</td>
                  <td style="padding: 4px 6px; text-align: right; font-weight: bold; color: #b45309; background: #fffdf5;">${fmtMoney(m.priceAfterVoucher != null ? m.priceAfterVoucher : ((m.promoPrice || m.price) - (m.voucherDiscount || 0)))}</td>
                  <td style="padding: 4px 6px; text-align: right;">${m.stock ? Number(m.stock).toLocaleString('vi-VN') : '0'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Description Images -->
      ${(item.descriptionImages || []).length > 0 ? `
        <div>
          <h4 style="margin: 0 0 6px; font-size: 12px; color: #1e293b;">🖼️ Ảnh trong mô tả (${item.descriptionImages.length} ảnh)</h4>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">
            ${item.descriptionImages.map((img, i) => `
              <a href="${escapeHtml(img)}" target="_blank" title="Ảnh mô tả ${i + 1}">
                <img src="${escapeHtml(img)}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #cbd5e1; flex-shrink: 0;" loading="lazy">
              </a>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Full Description Text -->
      <div>
        <h4 style="margin: 0 0 6px; font-size: 12px; color: #1e293b;">📝 Nội dung mô tả sản phẩm</h4>
        <div style="max-height: 180px; overflow-y: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; font-size: 11px; line-height: 1.5; white-space: pre-wrap; color: #334155;">
          ${escapeHtml(item.description || 'Chưa có mô tả.')}
        </div>
      </div>
    `;

    modalBody.innerHTML = bodyHtml;
    modal.style.display = 'flex';
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
    currentModalItem = null;
  }

  btnModalClose?.addEventListener('click', closeModal);
  btnModalCloseFooter?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Modal actions: Save this item to Sheet QUET_SP
  btnModalSaveSheet?.addEventListener('click', () => {
    if (!currentModalItem) return;
    pushProductsToQuetSpSheet([currentModalItem]);
  });

  // Modal actions: Clone
  btnModalCopyClone?.addEventListener('click', () => {
    if (!currentModalItem) return;
    closeModal();
    cloneToShopeeTab(currentModalItem);
  });

  // Clone tool integration: "Sao chép sang Shopee"
  function cloneToShopeeTab(item) {
    if (!item) return;

    // Resolve product URL and open in new tab
    let targetUrl = String(item.productUrl || item.url || '').trim();
    if (!targetUrl && item.itemId) {
      targetUrl = `https://shopee.vn/product/${item.shopId || 0}/${item.itemId}`;
    }

    if (targetUrl) {
      try {
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: targetUrl, active: true });
        } else {
          window.open(targetUrl, '_blank');
        }
      } catch (err) {
        console.warn('Lỗi mở link sản phẩm:', err);
      }
    }

    chrome.storage.local.get('sclProducts', (res) => {
      const scl = res?.sclProducts || {};
      const existing = scl[item.itemId] || {};

      scl[item.itemId] = {
        ...existing,
        item_id: item.itemId,
        shop_id: item.shopId || existing.shop_id || '',
        title: item.name || existing.title || '',
        name: item.name || existing.name || '',
        description: item.description || existing.description || '',
        images: (item.images && item.images.length) ? item.images : (existing.images || []),
        tier_variations: existing.tier_variations || [],
        models: (existing.models && existing.models.length) ? existing.models : (item.models || []),
        price: (item.price || existing.price || 0) * (item.price && item.price < 1000000 ? 100000 : 1),
        price_before_discount: item.promoPrice ? ((item.price || 0) * (item.price && item.price < 1000000 ? 100000 : 1)) : (existing.price_before_discount || 0),
        historical_sold: item.historicalSold ?? existing.historical_sold ?? 0,
        item_rating: { rating_star: item.ratingStar || existing.item_rating?.rating_star || 5.0 },
        attributes: existing.attributes || [],
        categories: existing.categories || [],
        video_info_list: existing.video_info_list || (item.videoUrl ? [{ default_format: { url: item.videoUrl } }] : []),
        url: targetUrl || item.productUrl || existing.url || ''
      };

      chrome.storage.local.set({
        sclProducts: scl,
        sclLastItemId: item.itemId,
        cloneTargetUrl: targetUrl || item.productUrl
      }, () => {
        const cloneTabBtn = document.querySelector('.tab-btn[data-tab="tab-in-nang-cao"]');
        if (cloneTabBtn) {
          cloneTabBtn.click();
        } else {
          alert(`Đã chuẩn bị sản phẩm "${item.name}". Hãy mở tab "Sao chép sản phẩm" để tiếp tục!`);
        }
      });
    });
  }

  // =========================================================================
  // ACTION: LƯU VÀO SHEET QUET_SP
  // =========================================================================

  // Button in View 1 Toolbar
  btnSaveSheet?.addEventListener('click', () => {
    const selected = scannedProducts.filter(p => selectedItemIds.has(p.itemId));
    if (!selected.length) {
      alert('Vui lòng tích chọn ít nhất 1 sản phẩm để lưu vào Sheet QUET_SP.');
      return;
    }
    pushProductsToQuetSpSheet(selected);
  });


  function pushProductsToQuetSpSheet(products) {
    const defaultShop = inputTenShop?.value?.trim() || currentShopInfo?.shopName || 'Shop Shopee';
    const rows = [];
    const timestampStr = new Date().toLocaleString('vi-VN');

    products.forEach(prod => {
      const sName = prod.shopName || defaultShop;
      const models = prod.models && prod.models.length > 0 ? prod.models : [{
        name: 'Mặc định',
        sku: '',
        price: prod.price || 0,
        promoPrice: prod.promoPrice || '',
        stock: prod.stock || 0,
        modelId: '0',
        imageUrl: prod.thumbnail || ''
      }];

      models.forEach(m => {
        const mActiveP = (m.promoPrice && Number(m.promoPrice) > 0) ? Number(m.promoPrice) : Number(m.price || 0);
        const priceAfter = m.priceAfterVoucher != null ? m.priceAfterVoucher : (prod.priceAfterVoucher != null ? prod.priceAfterVoucher : mActiveP);
        const voucherDesc = m.bestVoucher?.title || prod.bestVoucher?.title || (prod.hasShopVoucher ? 'Có voucher shop' : 'Không có');

        rows.push({
          id: `QSP_${prod.itemId}_${m.modelId || '0'}`,
          shopName: sName,
          itemId: prod.itemId || '',
          name: prod.name || '',
          modelName: m.name || 'Mặc định',
          sku: m.sku || '',
          price: m.price || prod.price || 0,
          promoPrice: m.promoPrice || '',
          voucherDesc: voucherDesc,
          priceAfterVoucher: priceAfter,
          stock: m.stock || 0,
          sold: prod.historicalSold || 0,
          rating: prod.ratingStar || 5.0,
          category: prod.category || '',
          brand: prod.brand || '',
          url: prod.productUrl || '',
          modelImg: m.imageUrl || prod.thumbnail || '',
          mainImages: prod.mainImagesStr || '',
          descImages: prod.descriptionImagesStr || '',
          video: prod.videoUrl || '',
          description: prod.description || '',
          timestamp: timestampStr
        });
      });
    });

    if (rows.length === 0) {
      alert('Không có dữ liệu hợp lệ để lưu vào Sheet QUET_SP.');
      return;
    }

    const confirmMsg = `Bạn có chắc muốn lưu ${products.length} sản phẩm (tổng cộng ${rows.length} dòng chi tiết phân loại) vào Sheet QUET_SP?`;
    if (!confirm(confirmMsg)) return;

    if (btnSaveSheet) {
      btnSaveSheet.disabled = true;
      btnSaveSheet.textContent = '⏳ Đang lưu vào Sheet...';
    }

    chrome.runtime.sendMessage({
      type: 'APPEND_QUET_SP',
      values: rows
    }, (res) => {
      if (btnSaveSheet) {
        btnSaveSheet.disabled = false;
        btnSaveSheet.textContent = '💾 Lưu vào Sheet Quét SP';
      }

      if (res && res.ok) {
        // Mark products as saved
        products.forEach(p => {
          savedItemIds.add(String(p.itemId));
          selectedItemIds.delete(p.itemId);
        });

        saveSavedIdsToCache();
        saveAllProductsToCache();
        renderTable();
        renderHistoryTable();

        alert(`✅ Đã lưu thành công ${products.length} sản phẩm (tổng cộng ${rows.length} dòng phân loại) vào Sheet ${res.sheetTitle || 'QUET_SP'}!`);
      } else {
        alert(`❌ Lỗi khi lưu vào Sheet: ${res?.error || 'Không xác định'}`);
      }
    });
  }

  // =========================================================================
  // THÊM VÀO SHEET SP_SHOPEE ĐẦY ĐỦ
  // =========================================================================

  function saveToSpShopee(products, triggerBtn, customShopName) {
    if (!products || products.length === 0) {
      alert('Chưa có sản phẩm nào để thêm vào Sheet SP_SHOPEE đầy đủ.');
      return;
    }

    const defaultShop = customShopName || inputTenShop?.value?.trim() || currentShopInfo?.shopName || 'Shopee';
    const rows = [];
    const timestampStr = new Date().toLocaleDateString('vi-VN');

    products.forEach(prod => {
      const sName = prod.shopName || defaultShop;
      const models = prod.models && prod.models.length > 0 ? prod.models : [{
        name: 'Mặc định',
        sku: prod.parentSku || '',
        price: prod.price || 0,
        promoPrice: prod.promoPrice || '',
        stock: prod.stock || 0,
        modelId: '',
        imageUrl: prod.thumbnail || ''
      }];

      const isSingleDefault = models.length === 1 && (!models[0].modelId || models[0].modelId === '0' || !models[0].name || models[0].name === 'Mặc định');

      models.forEach(m => {
        let parentSkuVal = String(prod.parentSku || '').trim();
        let modelSkuVal = String(m.sku || '').trim();
        if (isSingleDefault) {
          const singleSku = parentSkuVal || modelSkuVal;
          parentSkuVal = singleSku;
          modelSkuVal = singleSku;
        }

        const mActiveP = (m.promoPrice && Number(m.promoPrice) > 0) ? Number(m.promoPrice) : Number(m.price || 0);
        const priceAfter = m.priceAfterVoucher != null ? m.priceAfterVoucher : (prod.priceAfterVoucher != null ? prod.priceAfterVoucher : mActiveP);

        rows.push([
          String(prod.itemId || ''),                                               // A: Mã Sản phẩm
          String(prod.name || ''),                                                 // B: Tên sản phẩm
          (isSingleDefault && !m.modelId) ? '' : String(m.modelId || ''),          // C: Mã phân loại
          (isSingleDefault && (!m.name || m.name === 'Mặc định')) ? '' : String(m.name || ''), // D: Tên phân loại
          parentSkuVal,                                                            // E: SKU Sản phẩm
          modelSkuVal,                                                             // F: SKU
          Number(m.price || prod.price || 0),                                      // G: Giá
          Number(m.stock ?? prod.stock ?? 0),                                      // H: Kho hàng
          Number(m.stock ?? prod.stock ?? 0),                                      // I: Tồn kho thực tế
          prod.thumbnail || (prod.mainImagesStr ? prod.mainImagesStr.split('|')[0] : ''), // J: Ảnh chính
          m.imageUrl || prod.thumbnail || '',                                      // K: Ảnh phân loại
          sName,                                                                   // L: Mã gian / Tên shop
          priceAfter || m.promoPrice || '',                                        // M: Giá KM / Giá sau voucher
          Number(m.stock ?? prod.stock ?? 0),                                      // N: Tồn kho
          timestampStr                                                             // O: Ngày tạo
        ]);
      });
    });

    if (rows.length === 0) {
      alert('Không có dữ liệu hợp lệ để thêm vào Sheet SP_SHOPEE.');
      return;
    }

    const confirmMsg = `Bạn có chắc muốn thêm tất cả ${products.length} sản phẩm (tổng cộng ${rows.length} dòng phân loại) vào Sheet SP_SHOPEE đầy đủ?`;
    if (!confirm(confirmMsg)) return;

    const btn = triggerBtn || btnSaveSpShopee;
    let oldText = '';
    if (btn) {
      oldText = btn.textContent;
      btn.disabled = true;
      btn.textContent = '⏳ Đang thêm vào Sheet...';
    }

    chrome.runtime.sendMessage({
      type: 'APPEND_SP_SHOPEE',
      values: rows
    }, (res) => {
      if (btn) {
        btn.disabled = false;
        btn.textContent = oldText || '📥 Thêm vào sheet SP Shopee đầy đủ';
      }

      if (res && res.ok) {
        products.forEach(p => {
          savedItemIds.add(String(p.itemId));
          selectedItemIds.delete(p.itemId);
        });

        saveSavedIdsToCache();
        saveAllProductsToCache();
        renderTable();
        renderHistoryTable();

        alert(`✅ Đã thêm thành công tất cả ${products.length} sản phẩm (${rows.length} dòng phân loại) vào Sheet SP_SHOPEE đầy đủ!`);

        // Refresh sheet view if loaded
        if (sheetRows.length > 0) {
          loadSheetProducts(true);
        }
      } else {
        alert(`❌ Lỗi khi thêm vào Sheet SP_SHOPEE: ${res?.error || 'Không xác định'}`);
      }
    });
  }

  // Nút thêm vào sheet SP Shopee từ View 1 (Quét Shop Mới)
  btnSaveSpShopee?.addEventListener('click', () => {
    if (!scannedProducts.length) {
      alert('Chưa có sản phẩm nào được quét. Vui lòng quét shop trước!');
      return;
    }
    saveToSpShopee(scannedProducts, btnSaveSpShopee);
  });

  // Nút thêm vào sheet SP Shopee từ View 2 (Toàn bộ SP đã quét)
  btnHistorySaveSpShopee?.addEventListener('click', () => {
    const selectedShop = historyFilterShop?.value?.trim();
    let prodsToSave = allScannedProducts;
    if (selectedShop) {
      prodsToSave = allScannedProducts.filter(p => (p.shopName || '') === selectedShop);
    }
    if (!prodsToSave.length) {
      alert('Không có sản phẩm nào trong kho lưu trữ để thêm vào Sheet SP_SHOPEE.');
      return;
    }
    saveToSpShopee(prodsToSave, btnHistorySaveSpShopee, selectedShop);
  });

  // =========================================================================
  // VIEW 4: ĐỌC SẢN PHẨM TỪ SHEET (CÓ LỌC GIAN)
  // =========================================================================
  let sheetRows = [];          // Danh sách các dòng đọc từ Sheet
  let sheetGianMap = new Map();// Map<gian, count>
  let sheetSelectedGian = '';
  let sheetSearchQuery = '';
  let isSheetLoading = false;

  function loadSheetProducts(force = false) {
    if (isSheetLoading) return;
    isSheetLoading = true;

    const source = sheetReadSourceSelect?.value || 'QUET_SP';
    const msgType = source === 'SP_SHOPEE' ? 'FETCH_SP_SHOPEE' : 'FETCH_QUET_SP';

    if (sheetReadTbody) {
      sheetReadTbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 24px; color: #ea580c; font-weight: 600;">
        ⏳ Đang đọc toàn bộ sản phẩm từ Sheet <b>${source}</b>... Vui lòng đợi trong giây lát.
      </td></tr>`;
    }

    if (btnSheetReadRefresh) {
      btnSheetReadRefresh.disabled = true;
      btnSheetReadRefresh.textContent = '⏳ Đang đọc...';
    }

    chrome.runtime.sendMessage({ type: msgType }, (res) => {
      isSheetLoading = false;
      if (btnSheetReadRefresh) {
        btnSheetReadRefresh.disabled = false;
        btnSheetReadRefresh.textContent = '🔄 Đọc từ Sheet';
      }

      if (res && res.ok && Array.isArray(res.values) && res.values.length > 1) {
        const rawHeaders = res.values[0].map(h => String(h || '').trim());
        const dataRows = res.values.slice(1);

        // Dynamically resolve column indices
        const idxMaSp = findColIndex(rawHeaders, ['id shopee', 'id sản phẩm', 'mã sản phẩm', 'ma san pham'], source === 'QUET_SP' ? 2 : 0);
        const idxTenSp = findColIndex(rawHeaders, ['tên sản phẩm', 'ten san pham', 'tên sp', 'name'], source === 'QUET_SP' ? 3 : 1);
        const idxMaPl = findColIndex(rawHeaders, ['mã phân loại', 'id phân loại', 'mã pl'], 2);
        const idxTenPl = findColIndex(rawHeaders, ['tên phân loại', 'phan loai', 'phân loại'], source === 'QUET_SP' ? 4 : 3);
        const idxSkuSp = findColIndex(rawHeaders, ['sku sản phẩm', 'sku sp'], 4);
        const idxSku = findColIndex(rawHeaders, ['sku phân loại', 'sku'], 5);
        const idxGia = findColIndex(rawHeaders, ['giá gốc', 'giá bán', 'giá'], 6);
        const idxKho = findColIndex(rawHeaders, ['kho hàng', 'tồn kho', 'tồn', 'kho'], source === 'QUET_SP' ? 8 : 7);
        const idxAnhPl = findColIndex(rawHeaders, ['ảnh phân loại', 'hình phân loại'], source === 'QUET_SP' ? 14 : 10);
        const idxAnhChinh = findColIndex(rawHeaders, ['ảnh chính', 'hình chính', 'ảnh sp'], source === 'QUET_SP' ? 15 : 9);
        const idxGian = findColIndex(rawHeaders, ['tên shop', 'ten shop', 'shop', 'mã gian', 'gian'], source === 'QUET_SP' ? 1 : 11);
        const idxGiaKm = findColIndex(rawHeaders, ['giá km', 'gia km', 'giá sau shopee voucher', 'giá sau voucher', 'voucher'], source === 'QUET_SP' ? 7 : 12);

        sheetRows = [];
        sheetGianMap.clear();

        dataRows.forEach((r, idx) => {
          if (!r || !r.some(c => String(c || '').trim() !== '')) return;

          const maSp = String(r[idxMaSp] || '').trim();
          const tenSp = String(r[idxTenSp] || '').trim();
          const maPl = String(r[idxMaPl] || '').trim();
          const tenPl = String(r[idxTenPl] || '').trim();
          const skuSp = String(r[idxSkuSp] || '').trim();
          const sku = String(r[idxSku] || '').trim();
          const gia = String(r[idxGia] || '').trim();
          const giaKm = String(r[idxGiaKm] || '').trim();
          const kho = String(r[idxKho] || '').trim();
          const gian = String(r[idxGian] || 'Chưa đặt gian').trim();
          const anhChinh = String(r[idxAnhChinh] || '').trim();
          const anhPl = String(r[idxAnhPl] || '').trim();

          const thumb = anhPl || (anhChinh ? anhChinh.split('|')[0].trim() : '');

          const item = {
            stt: idx + 1,
            maSp,
            tenSp,
            maPl,
            tenPl,
            skuSp,
            sku,
            gia,
            giaKm,
            kho,
            gian,
            thumb,
            productUrl: maSp ? `https://shopee.vn/product/0/${maSp}` : ''
          };

          sheetRows.push(item);
          sheetGianMap.set(gian, (sheetGianMap.get(gian) || 0) + 1);
        });

        // Populate gian dropdown
        populateSheetGianDropdown();

        // Update badge
        if (sheetReadBadge) sheetReadBadge.textContent = String(sheetRows.length);

        // Render table
        renderSheetTable();
      } else {
        sheetRows = [];
        sheetGianMap.clear();
        if (sheetReadBadge) sheetReadBadge.textContent = '0';
        if (sheetReadCountBadge) sheetReadCountBadge.textContent = '0 dòng';
        populateSheetGianDropdown();

        if (sheetReadTbody) {
          const errDetail = res?.error ? `<br><small style="color:#ef4444;">Chi tiết: ${escapeHtml(res.error)}</small>` : '';
          sheetReadTbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 20px; color: #64748b;">
            Sheet <b>${source}</b> hiện đang trống hoặc chưa có dữ liệu sản phẩm.${errDetail}
          </td></tr>`;
        }
      }
    });
  }

  function populateSheetGianDropdown() {
    if (!sheetReadFilterGian) return;

    let options = `<option value="">-- Tất cả Gian / Shop (${sheetRows.length} dòng) --</option>`;
    const sortedGians = Array.from(sheetGianMap.keys()).sort((a, b) => a.localeCompare(b, 'vi'));

    sortedGians.forEach(g => {
      const count = sheetGianMap.get(g);
      options += `<option value="${escapeHtml(g)}">${escapeHtml(g)} (${count} dòng)</option>`;
    });

    sheetReadFilterGian.innerHTML = options;

    if (sheetSelectedGian && sheetGianMap.has(sheetSelectedGian)) {
      sheetReadFilterGian.value = sheetSelectedGian;
    } else {
      sheetSelectedGian = '';
      sheetReadFilterGian.value = '';
    }
  }

  function renderSheetTable() {
    if (!sheetReadTbody) return;

    const q = (sheetReadSearch?.value || '').trim().toLowerCase();
    const selectedG = (sheetReadFilterGian?.value || '').trim().toLowerCase();

    const filtered = sheetRows.filter(item => {
      if (selectedG && item.gian.toLowerCase() !== selectedG) return false;
      if (q) {
        const match = item.tenSp.toLowerCase().includes(q)
          || item.maSp.toLowerCase().includes(q)
          || item.sku.toLowerCase().includes(q)
          || item.skuSp.toLowerCase().includes(q)
          || item.tenPl.toLowerCase().includes(q)
          || item.gian.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    if (sheetReadCountBadge) {
      sheetReadCountBadge.textContent = `${filtered.length}/${sheetRows.length} dòng`;
    }

    if (!filtered.length) {
      sheetReadTbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 24px; color: #64748b;">
        Không tìm thấy sản phẩm nào khớp với bộ lọc (Gian: "${sheetReadFilterGian?.value || 'Tất cả'}", Từ khóa: "${q}").
      </td></tr>`;
      return;
    }

    let html = '';
    filtered.forEach((item, index) => {
      const imgHtml = item.thumb
        ? `<img src="${escapeHtml(item.thumb)}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 3px; border: 1px solid #e2e8f0; display: block; margin: 0 auto; cursor: pointer;" title="Bấm để mở ảnh" onclick="window.open('${escapeHtml(item.thumb)}', '_blank')">`
        : `<div style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #94a3b8; margin: 0 auto;">No img</div>`;

      const plText = item.tenPl ? `<div style="font-weight: 600; color: #1e293b;">${escapeHtml(item.tenPl)}</div>` : '<span style="color: #94a3b8;">-</span>';
      const plIdText = item.maPl ? `<div style="font-size: 9px; color: #64748b;">ID: ${escapeHtml(item.maPl)}</div>` : '';

      const skuText = item.sku || item.skuSp;
      const skuHtml = skuText
        ? `<code style="font-size: 10px; background: #f1f5f9; padding: 1px 4px; border-radius: 3px; color: #0f172a; word-break: break-all;">${escapeHtml(skuText)}</code>`
        : `<span style="color: #94a3b8;">-</span>`;

      const priceOrig = item.gia ? fmtMoney(item.gia) : '-';
      const priceKm = item.giaKm ? `<span style="font-weight: 700; color: #b45309;">${fmtMoney(item.giaKm)}</span>` : '<span style="color: #94a3b8;">-</span>';

      const actionsHtml = `
        <div style="display: flex; gap: 4px; justify-content: center; align-items: center;">
          ${item.maSp ? `
            <button type="button" class="btn-sheet-copy-id ghost" data-id="${escapeHtml(item.maSp)}" style="padding: 2px 5px; font-size: 10px; height: 22px; border: 1px solid #cbd5e1; border-radius: 3px; cursor: pointer; white-space: nowrap;" title="Sao chép ID Shopee">
              📋 ID
            </button>
            <button type="button" class="btn-sheet-clone secondary" data-item-id="${escapeHtml(item.maSp)}" style="padding: 2px 5px; font-size: 10px; height: 22px; border-radius: 3px; background: #7c3aed; color: white; border: none; font-weight: bold; cursor: pointer; white-space: nowrap;" title="Sao chép sản phẩm này và mở link">
              📋 Sao chép
            </button>
            <a href="${escapeHtml(item.productUrl)}" target="_blank" style="padding: 2px 5px; font-size: 10px; height: 22px; line-height: 18px; border: 1px solid #bae6fd; background: #f0f9ff; color: #0284c7; border-radius: 3px; text-decoration: none; display: inline-flex; align-items: center;" title="Mở trang sản phẩm Shopee">
              🔗
            </a>
          ` : '<span style="color: #94a3b8;">-</span>'}
        </div>
      `;

      html += `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#fffbeb'" onmouseout="this.style.background='white'">
          <td style="padding: 6px 4px; text-align: center; color: #64748b; font-size: 10px;">${index + 1}</td>
          <td style="padding: 6px 6px;">
            <span style="display: inline-block; padding: 2px 6px; font-size: 10px; font-weight: 700; color: #9a3412; background: #ffedd5; border: 1px solid #fed7aa; border-radius: 3px; max-width: 95px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(item.gian)}">
              ${escapeHtml(item.gian)}
            </span>
          </td>
          <td style="padding: 4px; text-align: center;">${imgHtml}</td>
          <td style="padding: 6px 6px; font-family: monospace; font-size: 10px; color: #0369a1;">
            ${escapeHtml(item.maSp || '-')}
          </td>
          <td style="padding: 6px 6px;">
            <div style="font-weight: 600; color: #0f172a; line-height: 1.3; max-width: 200px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;" title="${escapeHtml(item.tenSp)}">
              ${escapeHtml(item.tenSp || '-')}
            </div>
          </td>
          <td style="padding: 6px 6px; font-size: 10px;">
            ${plText}
            ${plIdText}
          </td>
          <td style="padding: 6px 6px;">${skuHtml}</td>
          <td style="padding: 6px 6px; text-align: right; color: #475569; font-size: 10px;">${priceOrig}</td>
          <td style="padding: 6px 6px; text-align: right; font-size: 10px;">${priceKm}</td>
          <td style="padding: 6px 6px; text-align: center; font-size: 10px; font-weight: 600; color: #334155;">${item.kho || '0'}</td>
          <td style="padding: 6px 4px; text-align: center;">${actionsHtml}</td>
        </tr>
      `;
    });

    sheetReadTbody.innerHTML = html;

    // Attach copy ID listeners
    sheetReadTbody.querySelectorAll('.btn-sheet-copy-id').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-id');
        if (id) {
          navigator.clipboard.writeText(id).then(() => {
            const old = btn.textContent;
            btn.textContent = '✔ Copy!';
            btn.style.color = '#16a34a';
            setTimeout(() => {
              btn.textContent = old;
              btn.style.color = '';
            }, 1500);
          });
        }
      });
    });

    // Attach clone listeners
    sheetReadTbody.querySelectorAll('.btn-sheet-clone').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.itemId;
        const rowItem = sheetRows.find(r => r.maSp === id);
        if (rowItem) {
          const productObj = allScannedProducts.find(p => p.itemId === id) || {
            itemId: rowItem.maSp,
            name: rowItem.tenSp,
            shopName: rowItem.gian,
            productUrl: rowItem.productUrl,
            thumbnail: rowItem.thumb,
            price: Number(rowItem.gia) || 0,
            promoPrice: Number(rowItem.giaKm) || 0
          };
          cloneToShopeeTab(productObj);
        }
      });
    });
  }

  // Event listeners for View 4
  btnSheetReadRefresh?.addEventListener('click', () => {
    loadSheetProducts(true);
  });

  sheetReadSourceSelect?.addEventListener('change', () => {
    loadSheetProducts(true);
  });

  sheetReadFilterGian?.addEventListener('change', (e) => {
    sheetSelectedGian = e.target.value;
    renderSheetTable();
  });

  sheetReadSearch?.addEventListener('input', (e) => {
    sheetSearchQuery = e.target.value;
    renderSheetTable();
  });

  btnSheetReadClearFilter?.addEventListener('click', () => {
    if (sheetReadSearch) sheetReadSearch.value = '';
    if (sheetReadFilterGian) sheetReadFilterGian.value = '';
    sheetSelectedGian = '';
    sheetSearchQuery = '';
    renderSheetTable();
  });

  function exportItemsToExcel(itemsToExport) {
    if (!itemsToExport.length) {
      alert('Không có sản phẩm nào để xuất Excel.');
      return;
    }

    if (typeof XLSX === 'undefined') {
      alert('Thư viện XLSX chưa sẵn sàng. Vui lòng thử lại sau vài giây.');
      return;
    }

    const defaultShop = inputTenShop?.value?.trim() || currentShopInfo?.shopName || 'Shop Shopee';

    const headers = [
      'STT',
      'Tên shop',
      'ID Shopee',
      'Tên sản phẩm',
      'Tên phân loại',
      'SKU phân loại',
      'Giá gốc (VNĐ)',
      'Giá KM (VNĐ)',
      'Voucher của Shop',
      'Giá sau Shopee Voucher (VNĐ)',
      'Tồn kho',
      'Đã bán',
      'Đánh giá (Sao)',
      'Trạng thái Sheet',
      'Ngành hàng',
      'Thương hiệu',
      'Link sản phẩm',
      'Link Video',
      'Ảnh chính (URLs)',
      'Ảnh phân loại (URL)',
      'Ảnh mô tả (URLs)',
      'Mô tả sản phẩm'
    ];

    const data = [headers];
    let stt = 1;

    itemsToExport.forEach(prod => {
      const sName = prod.shopName || defaultShop;
      const isSaved = savedItemIds.has(String(prod.itemId));
      const models = prod.models && prod.models.length > 0 ? prod.models : [{
        name: 'Mặc định',
        sku: '',
        price: prod.price || 0,
        promoPrice: prod.promoPrice || '',
        stock: prod.stock || 0,
        imageUrl: prod.thumbnail || ''
      }];

      models.forEach(m => {
        const mActiveP = (m.promoPrice && Number(m.promoPrice) > 0) ? Number(m.promoPrice) : Number(m.price || 0);
        const priceAfter = m.priceAfterVoucher != null ? m.priceAfterVoucher : (prod.priceAfterVoucher != null ? prod.priceAfterVoucher : mActiveP);
        const voucherText = m.bestVoucher?.title || prod.bestVoucher?.title || (prod.hasShopVoucher ? 'Có voucher shop' : 'Không có');

        data.push([
          stt++,
          sName,
          prod.itemId,
          prod.name,
          m.name || 'Mặc định',
          m.sku || '',
          m.price || 0,
          m.promoPrice || '',
          voucherText,
          priceAfter || 0,
          m.stock || 0,
          prod.historicalSold || 0,
          prod.ratingStar || 5.0,
          isSaved ? 'Đã lưu' : 'Chưa lưu',
          prod.category || '',
          prod.brand || '',
          prod.productUrl,
          prod.videoUrl || '',
          prod.mainImagesStr || '',
          m.imageUrl || prod.variationImagesStr || '',
          prod.descriptionImagesStr || '',
          prod.description || ''
        ]);
      });
    });

    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);

      const colWidths = [
        { wch: 6 },  // STT
        { wch: 20 }, // Tên shop
        { wch: 15 }, // ID Shopee
        { wch: 40 }, // Tên sản phẩm
        { wch: 20 }, // Tên phân loại
        { wch: 18 }, // SKU
        { wch: 14 }, // Giá gốc
        { wch: 14 }, // Giá KM
        { wch: 22 }, // Voucher của Shop
        { wch: 18 }, // Giá sau Voucher
        { wch: 10 }, // Tồn kho
        { wch: 10 }, // Đã bán
        { wch: 10 }, // Đánh giá
        { wch: 14 }, // Trạng thái Sheet
        { wch: 25 }, // Ngành hàng
        { wch: 15 }, // Thương hiệu
        { wch: 45 }, // Link SP
        { wch: 40 }, // Video
        { wch: 50 }, // Ảnh chính
        { wch: 40 }, // Ảnh PL
        { wch: 40 }, // Ảnh mô tả
        { wch: 60 }  // Mô tả
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'San_Pham_Quet');
      const shopTitle = (defaultShop || 'Shopee').replace(/[/\\?%*:|"<>]/g, '_');
      const filename = `QuetShop_${shopTitle}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);
    } catch (err) {
      alert('Lỗi xuất file Excel: ' + err.message);
    }
  }

  // Initialize module
  loadCachedState();
})();
