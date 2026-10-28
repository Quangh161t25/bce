import { getShopInfo, products, uploadImage } from './shopee-api.js';
import { loadShopSettings, toJpegBase64 } from './clone.js';

const $ = (s) => document.querySelector(s);
const MAX_IMAGES = 9;

// Trạng thái dữ liệu
let slots = Array(MAX_IMAGES).fill(null); // Mỗi phần tử là DataURL hoặc null
let currentSlotIndex = 0;
let variations = []; // Danh sách phân loại: { id, name, price, stock, sku, dataUrl }
let nextVarId = 1;
let currentVarImageId = null;
let currentMaGian = '';
let dsSpList = [];
let shopSettings = null;
let busy = false;

// ---------- Nhật ký (Log) ----------
function log(text, type = '') {
  const el = document.createElement('div');
  el.className = type;
  el.textContent = `${new Date().toLocaleTimeString('vi-VN')}  ${text}`;
  $('#log').prepend(el);
}

// ---------- Shop Status & Cài đặt ----------
async function checkShop() {
  const pill = $('#shopStatus');
  try {
    const info = await getShopInfo();
    pill.textContent = `Shop: ${info.name || info.shopId}`;
    pill.className = 'pill ok';
    await loadShopData();
  } catch (e) {
    pill.textContent = 'Chưa đăng nhập Kênh Người Bán';
    pill.title = e.message;
    pill.className = 'pill warn';
  }
}

async function loadShopData(force = false) {
  try {
    shopSettings = await loadShopSettings(force);
    renderChannels();
    renderLocations();
  } catch (err) {
    log('Lỗi tải cài đặt shop: ' + err.message, 'err');
  }
}

function renderChannels() {
  const list = $('#channelList');
  if (!list) return;
  list.innerHTML = '';
  const channels = shopSettings?.channels || [];
  if (!channels.length) {
    list.innerHTML = '<span class="hint small">Không tìm thấy đơn vị VC</span>';
    return;
  }
  channels.forEach((c) => {
    const chip = document.createElement('span');
    chip.className = 'chip active';
    chip.textContent = c.channel_name || `Kênh ${c.channel_id}`;
    list.appendChild(chip);
  });
}

function renderLocations() {
  const list = $('#locationList');
  if (!list) return;
  list.innerHTML = '';
  const locs = shopSettings?.locations || [];
  if (!locs.length) {
    list.innerHTML = '<span class="hint small">Không tìm thấy kho</span>';
    return;
  }
  locs.forEach((l, idx) => {
    const chip = document.createElement('span');
    chip.className = idx === 0 ? 'chip active' : 'chip';
    chip.textContent = l.address || l.location_id;
    chip.dataset.locId = l.location_id;
    chip.addEventListener('click', () => {
      list.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
    list.appendChild(chip);
  });
}

// ---------- Quản lý 9 Khung Ảnh Sản Phẩm ----------
function renderSlots() {
  const grid = $('#slotsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  let filledCount = 0;

  slots.forEach((dataUrl, idx) => {
    const slotEl = document.createElement('div');
    slotEl.className = 'photo-slot' + (dataUrl ? ' has-image' : '');
    slotEl.dataset.index = idx;

    const isCover = idx === 0;
    const badge = document.createElement('span');
    badge.className = 'slot-badge' + (isCover ? ' cover-badge' : '');
    badge.textContent = isCover ? 'Bìa *' : `Ảnh ${idx + 1}`;
    slotEl.appendChild(badge);

    if (dataUrl) {
      filledCount++;
      const img = document.createElement('img');
      img.src = dataUrl;
      slotEl.appendChild(img);

      const btnRemove = document.createElement('button');
      btnRemove.type = 'button';
      btnRemove.className = 'btn-remove-slot-img';
      btnRemove.textContent = '✕';
      btnRemove.title = 'Xóa ảnh này';
      btnRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        slots[idx] = null;
        renderSlots();
        log(`Đã xóa Ảnh ${idx + 1}`, 'warn');
      });
      slotEl.appendChild(btnRemove);

      // Bấm vào ảnh để đổi
      slotEl.addEventListener('click', () => {
        currentSlotIndex = idx;
        $('#singleSlotInput').click();
      });
    } else {
      const icon = document.createElement('div');
      icon.className = 'slot-empty-icon';
      icon.textContent = '+';
      slotEl.appendChild(icon);

      const label = document.createElement('div');
      label.className = 'slot-empty-label';
      label.textContent = isCover ? 'Thêm ảnh bìa' : `Thêm ảnh ${idx + 1}`;
      slotEl.appendChild(label);

      slotEl.addEventListener('click', () => {
        currentSlotIndex = idx;
        $('#singleSlotInput').click();
      });
    }

    // Drag & Drop cho từng slot
    slotEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      slotEl.classList.add('drag-over');
    });
    slotEl.addEventListener('dragleave', () => {
      slotEl.classList.remove('drag-over');
    });
    slotEl.addEventListener('drop', (e) => {
      e.preventDefault();
      slotEl.classList.remove('drag-over');
      const file = e.dataTransfer?.files?.[0];
      if (file && file.type.startsWith('image/')) {
        const fr = new FileReader();
        fr.onload = () => {
          slots[idx] = fr.result;
          renderSlots();
          log(`Đã nạp ảnh vào vị trí ${idx + 1} (kéo thả)`, 'ok');
        };
        fr.readAsDataURL(file);
      }
    });

    grid.appendChild(slotEl);
  });

  $('#photoCountBadge').textContent = `${filledCount}/9`;
}

function handleBatchImages(files) {
  if (!files || !files.length) return;
  const imageFiles = Array.from(files).filter(f => f.type && f.type.startsWith('image/'));
  if (!imageFiles.length) {
    alert('Vui lòng chọn các file định dạng hình ảnh!');
    return;
  }

  // Tìm các slot trống
  let targetSlot = 0;
  let added = 0;

  imageFiles.forEach((file) => {
    // Tìm slot trống tiếp theo
    while (targetSlot < MAX_IMAGES && slots[targetSlot]) {
      targetSlot++;
    }
    if (targetSlot >= MAX_IMAGES) return; // Đã đầy 9 ảnh

    const slotIdx = targetSlot;
    const fr = new FileReader();
    fr.onload = () => {
      slots[slotIdx] = fr.result;
      renderSlots();
    };
    fr.readAsDataURL(file);
    targetSlot++;
    added++;
  });

  log(`Đã thêm ${added} ảnh vào danh sách ảnh sản phẩm`, 'ok');
}

function clearAllImages() {
  slots = Array(MAX_IMAGES).fill(null);
  renderSlots();
  log('Đã dọn sạch toàn bộ 9 khung ảnh sản phẩm.', 'warn');
}

// ---------- Quản lý Phân loại hàng (Biến thể) ----------
function renderVariations() {
  const tbody = $('#variationTbody');
  const emptyNotice = $('#variationEmptyNotice');
  const tableWrap = $('#variationTableWrap');
  const quickBar = $('#varQuickBar');
  const countBadge = $('#varCount');

  if (!tbody) return;
  tbody.innerHTML = '';
  countBadge.textContent = variations.length;

  if (variations.length === 0) {
    emptyNotice.style.display = 'block';
    tableWrap.style.display = 'none';
    quickBar.style.display = 'none';
    return;
  }

  emptyNotice.style.display = 'none';
  tableWrap.style.display = 'block';
  quickBar.style.display = 'flex';

  variations.forEach((v, idx) => {
    const tr = document.createElement('tr');

    // Cột 1: Ảnh phân loại
    const tdImg = document.createElement('td');
    tdImg.style.textAlign = 'center';
    const picker = document.createElement('div');
    picker.className = 'var-img-picker';
    picker.title = 'Bấm để chọn ảnh cho phân loại này';

    if (v.dataUrl) {
      const img = document.createElement('img');
      img.src = v.dataUrl;
      picker.appendChild(img);

      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'var-img-remove';
      rm.textContent = '✕';
      rm.title = 'Bỏ ảnh phân loại';
      rm.addEventListener('click', (e) => {
        e.stopPropagation();
        v.dataUrl = null;
        renderVariations();
      });
      picker.appendChild(rm);
    } else {
      picker.innerHTML = '<span style="font-size: 16px; color: #94a3b8;">+</span>';
    }

    picker.addEventListener('click', () => {
      currentVarImageId = v.id;
      $('#varImageInput').click();
    });
    tdImg.appendChild(picker);
    tr.appendChild(tdImg);

    // Cột 2: Tên phân loại
    const tdName = document.createElement('td');
    const inpName = document.createElement('input');
    inpName.type = 'text';
    inpName.className = 'var-input';
    inpName.placeholder = 'Tên phân loại (VD: Màu Đỏ)';
    inpName.value = v.name || '';
    inpName.addEventListener('input', (e) => {
      v.name = e.target.value.trim();
    });
    tdName.appendChild(inpName);
    tr.appendChild(tdName);

    // Cột 3: Giá bán
    const tdPrice = document.createElement('td');
    const inpPrice = document.createElement('input');
    inpPrice.type = 'number';
    inpPrice.className = 'var-input';
    inpPrice.min = '1000';
    inpPrice.placeholder = 'Giá bán...';
    inpPrice.value = v.price || '';
    inpPrice.addEventListener('input', (e) => {
      v.price = Number(e.target.value) || 0;
    });
    tdPrice.appendChild(inpPrice);
    tr.appendChild(tdPrice);

    // Cột 4: Tồn kho
    const tdStock = document.createElement('td');
    const inpStock = document.createElement('input');
    inpStock.type = 'number';
    inpStock.className = 'var-input';
    inpStock.min = '0';
    inpStock.value = v.stock ?? 1000;
    inpStock.addEventListener('input', (e) => {
      v.stock = Number(e.target.value) || 0;
    });
    tdStock.appendChild(inpStock);
    tr.appendChild(tdStock);

    // Cột 5: SKU phân loại
    const tdSku = document.createElement('td');
    const inpSku = document.createElement('input');
    inpSku.type = 'text';
    inpSku.className = 'var-input';
    inpSku.placeholder = 'SKU...';
    inpSku.value = v.sku || '';
    inpSku.addEventListener('input', (e) => {
      v.sku = e.target.value.trim();
    });
    tdSku.appendChild(inpSku);
    tr.appendChild(tdSku);

    // Cột 6: Nút xóa
    const tdDel = document.createElement('td');
    tdDel.style.textAlign = 'center';
    const btnDel = document.createElement('button');
    btnDel.type = 'button';
    btnDel.className = 'btn-del-var';
    btnDel.textContent = '🗑️';
    btnDel.title = 'Xóa phân loại này';
    btnDel.addEventListener('click', () => {
      variations = variations.filter(item => item.id !== v.id);
      renderVariations();
      log(`Đã xóa phân loại: ${v.name || 'chưa đặt tên'}`, 'warn');
    });
    tdDel.appendChild(btnDel);
    tr.appendChild(tdDel);

    tbody.appendChild(tr);
  });
}

function addVariation(data = {}) {
  const singlePrice = Number($('#inputSinglePrice')?.value) || 0;
  const singleStock = Number($('#inputStock')?.value) || 1000;

  const newVar = {
    id: nextVarId++,
    name: data.name || '',
    price: data.price || singlePrice || 0,
    stock: data.stock ?? singleStock ?? 1000,
    sku: data.sku || '',
    dataUrl: data.dataUrl || null
  };
  variations.push(newVar);
  renderVariations();
  log(`Đã thêm 1 dòng phân loại mới (Tổng: ${variations.length})`, 'ok');
}

function clearAllVariations() {
  variations = [];
  renderVariations();
  log('Đã xóa toàn bộ phân loại hàng. Sản phẩm chuyển sang dạng Sản phẩm đơn.', 'warn');
}

function autoFillVarSkus() {
  const parentSku = ($('#parentSkuInput')?.value || '').trim();
  const maGian = ($('#manualMaGian')?.value || currentMaGian || '').trim().toLowerCase();

  variations.forEach((v) => {
    const slugName = (v.name || `pl${v.id}`)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    let sku = parentSku ? `${parentSku}-${slugName}` : slugName;
    if (maGian && !sku.toLowerCase().endsWith(`-${maGian}`)) {
      sku = `${sku}-${maGian}`;
    }
    v.sku = sku;
  });

  renderVariations();
  log('Đã tự động điền nhanh SKU cho toàn bộ phân loại!', 'ok');
}

// ---------- Xóa trắng toàn bộ Form ----------
function clearAllForm() {
  if (!confirm('Bạn có chắc chắn muốn XÓA TRẮNG toàn bộ form để tạo sản phẩm mới từ đầu?')) {
    return;
  }

  // 1. Tiêu đề & Mô tả
  $('#productTitleInput').value = '';
  $('#productDescInput').value = '';
  $('#titleCharCount').textContent = '0/120';
  $('#descCharCount').textContent = '0 ký tự';

  // 2. Ảnh
  slots = Array(MAX_IMAGES).fill(null);
  renderSlots();

  // 3. Thông tin bán hàng
  $('#parentSkuInput').value = '';
  $('#inputSinglePrice').value = '';
  $('#inputWeight').value = '500';
  $('#inputStock').value = '1000';

  // 4. Phân loại
  variations = [];
  renderVariations();

  log('🧹 ĐÃ XÓA TRẮNG TOÀN BỘ FORM! Sẵn sàng tạo sản phẩm mới.', 'ok');
}

// ---------- Gemini AI (Viết lại Tên & Mô tả) ----------
async function getGeminiApiKey() {
  const res = await chrome.storage.local.get(['geminiApiKey']);
  return (res.geminiApiKey || '').trim();
}

async function callGemini(promptText) {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Chưa có Gemini API Key! Hãy mở mục "🤖 Cài đặt Gemini AI" ở trên để nhập và lưu API Key.');
  }
  const model = $('#geminiModelSelect')?.value || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
  };

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await r.json();
  if (!r.ok) {
    throw new Error((data && data.error && data.error.message) || `HTTP ${r.status}`);
  }
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map(p => p.text).filter(Boolean).join('\n') || '';
  if (!text) throw new Error('Gemini trả về rỗng');
  return text.trim();
}

// ---------- Gợi ý SKU từ Google Sheet DS_SP ----------
async function loadDsSpData() {
  const res = await chrome.storage.local.get(['dsSpCache_data', 'maGian']);
  if (res.maGian) {
    currentMaGian = res.maGian.trim();
    if ($('#manualMaGian')) $('#manualMaGian').value = currentMaGian;
  }
  if (res.dsSpCache_data?.allData) {
    dsSpList = res.dsSpCache_data.allData;
  }
}

function attachSkuAutocomplete() {
  const input = $('#parentSkuInput');
  const dropdown = $('#parentSkuDropdown');
  if (!input || !dropdown) return;

  function hideDropdown() {
    dropdown.style.display = 'none';
  }

  function renderDropdown(filtered) {
    if (!filtered.length) {
      hideDropdown();
      return;
    }
    dropdown.innerHTML = '';
    filtered.slice(0, 15).forEach((item) => {
      const row = document.createElement('div');
      row.className = 'id-suggest-item';
      const sku = item.id_sp_con || item.sku || '';
      const name = item.ten_sp || item.name || '';
      row.innerHTML = `<b>${sku}</b> - <span style="color:#64748b;">${name}</span>`;
      row.addEventListener('click', () => {
        let finalSku = sku;
        const maGian = ($('#manualMaGian')?.value || currentMaGian || '').trim().toLowerCase();
        if (maGian && !finalSku.toLowerCase().endsWith(`-${maGian}`)) {
          finalSku = `${finalSku}-${maGian}`;
        }
        input.value = finalSku;
        if (!$('#productTitleInput').value && name) {
          $('#productTitleInput').value = name;
          $('#titleCharCount').textContent = `${name.length}/120`;
        }
        hideDropdown();
        log(`Đã chọn SKU: ${finalSku}`, 'ok');
      });
      dropdown.appendChild(row);
    });
    dropdown.style.display = 'block';
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q || !dsSpList.length) {
      hideDropdown();
      return;
    }
    const filtered = dsSpList.filter((it) => {
      const s = String(it.id_sp_con || it.sku || '').toLowerCase();
      const n = String(it.ten_sp || it.name || '').toLowerCase();
      return s.includes(q) || n.includes(q);
    });
    renderDropdown(filtered);
  });

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      hideDropdown();
    }
  });
}

// ---------- Điền vào tab Đăng sản phẩm Shopee ----------
async function sendMessageToShopeeTab(payload) {
  const tabs = await chrome.tabs.query({ url: '*://banhang.shopee.vn/*' });
  if (!tabs.length) {
    throw new Error('Không tìm thấy tab Kênh Người Bán (banhang.shopee.vn) đang mở!');
  }
  const sellerTab = tabs.find(t => t.url.includes('/portal/product/new') || t.url.includes('/portal/product/')) || tabs[0];
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(sellerTab.id, payload, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

// ---------- Đăng trực tiếp lên Shopee (Seller API) ----------
async function runDirectPublish() {
  if (busy) return;
  const title = ($('#productTitleInput')?.value || '').trim();
  const desc = ($('#productDescInput')?.value || '').trim();

  if (!title) {
    alert('Vui lòng nhập Tiêu đề sản phẩm!');
    return;
  }
  if (!slots[0]) {
    alert('Vui lòng chọn ít nhất Ảnh bìa (ô số 1) từ máy tính!');
    return;
  }

  const singlePrice = Number($('#inputSinglePrice')?.value) || 0;
  if (!variations.length && (!singlePrice || singlePrice < 1000)) {
    alert('Vui lòng nhập Giá bán sản phẩm (tối thiểu 1.000đ)!');
    return;
  }

  busy = true;
  const btn = $('#btnClone');
  btn.disabled = true;
  btn.textContent = '⏳ Đang đăng lên Shopee...';

  try {
    log('Bắt đầu đăng sản phẩm lên Shopee...');

    // 1. Tải các ảnh sản phẩm lên Shopee
    log('Đang tải ảnh sản phẩm lên máy chủ Shopee...');
    const uploadedImages = [];
    for (let i = 0; i < slots.length; i++) {
      if (slots[i]) {
        try {
          const base64 = await toJpegBase64(slots[i]);
          const imgId = await uploadImage(base64, 'image/jpeg', `img_${i + 1}.jpg`);
          uploadedImages.push(imgId);
          log(`✔ Đã tải Ảnh ${i + 1} lên Shopee (${imgId.substring(0, 8)}...)`, 'ok');
        } catch (err) {
          log(`⚠️ Không tải được Ảnh ${i + 1}: ${err.message}`, 'warn');
        }
      }
    }

    if (!uploadedImages.length) {
      throw new Error('Tất cả ảnh tải lên Shopee đều thất bại.');
    }

    // 2. Tải ảnh phân loại (nếu có)
    const varUploadedImages = [];
    if (variations.length > 0) {
      log('Đang tải ảnh phân loại lên Shopee...');
      for (const v of variations) {
        let vImgId = '';
        if (v.dataUrl) {
          try {
            const base64 = await toJpegBase64(v.dataUrl);
            vImgId = await uploadImage(base64, 'image/jpeg', `var_${v.id}.jpg`);
          } catch (e) {
            log(`⚠️ Bỏ qua ảnh phân loại ${v.name}: ${e.message}`, 'warn');
          }
        }
        varUploadedImages.push(vImgId);
      }
    }

    // 3. Chuẩn bị thuộc tính và kho
    const activeLoc = $('#locationList .chip.active');
    const locationId = activeLoc ? activeLoc.dataset.locId : (shopSettings?.locations?.[0]?.location_id || '');
    const weight = Number($('#inputWeight')?.value) || 500;
    const parentSku = ($('#parentSkuInput')?.value || '').trim();

    // 4. Xây dựng payload Shopee
    const channels = (shopSettings?.channels || []).map(c => ({
      channel_id: c.channel_id,
      enabled: true
    }));

    const payload = {
      name: title,
      description: desc || title,
      images: uploadedImages,
      weight: weight,
      dimension: { width: 10, length: 10, height: 10 },
      logistics_channels: channels,
      unlisted: !!$('#chkUnlisted')?.checked,
      item_status: $('#chkUnlisted')?.checked ? 'UNLIST' : 'NORMAL',
      parent_sku: parentSku,
      location_id: locationId
    };

    // Tạo cấu trúc phân loại hoặc sản phẩm đơn
    if (variations.length > 0) {
      const options = variations.map(v => (v.name || 'Loại').slice(0, 20));
      const hasAnyVarImg = varUploadedImages.some(Boolean);

      payload.tier_variations = [{
        name: 'Phân loại',
        options: options,
        images: hasAnyVarImg ? varUploadedImages : []
      }];

      payload.models = variations.map((v, idx) => ({
        name: (v.name || 'Loại').slice(0, 20),
        price: Math.round(Number(v.price || singlePrice) * 100000), // Quy đổi sang đơn vị Shopee (x100000)
        stock: Number(v.stock) || 1000,
        model_sku: v.sku || (parentSku ? `${parentSku}-${idx + 1}` : `SKU-${idx + 1}`),
        tier_index: [idx]
      }));
    } else {
      payload.price = Math.round(singlePrice * 100000);
      payload.stock = Number($('#inputStock')?.value) || 1000;
      payload.model_sku = parentSku;
    }

    log('Gửi thông tin đăng sản phẩm sang Shopee...');
    const result = await products.add(payload);
    const prodId = result?.data?.item_id || result?.data?.id || 'thành công';

    log(`🎉 ĐĂNG SẢN PHẨM LÊN SHOPEE THÀNH CÔNG! (ID: ${prodId})`, 'ok');
    alert(`🎉 Đăng sản phẩm thành công lên Shopee! (ID: ${prodId})`);

  } catch (err) {
    log(`❌ Lỗi đăng sản phẩm: ${err.message}`, 'err');
    alert('Lỗi đăng sản phẩm lên Shopee: ' + err.message);
  } finally {
    busy = false;
    btn.disabled = false;
    btn.textContent = '🚀 Đăng sản phẩm lên Shopee';
  }
}

// ---------- Khởi tạo sự kiện ----------
document.addEventListener('DOMContentLoaded', () => {
  checkShop();
  renderSlots();
  renderVariations();
  loadDsSpData();
  attachSkuAutocomplete();

  // Đếm ký tự tiêu đề & mô tả
  const titleInp = $('#productTitleInput');
  const titleCount = $('#titleCharCount');
  titleInp?.addEventListener('input', () => {
    titleCount.textContent = `${titleInp.value.length}/120`;
  });

  const descInp = $('#productDescInput');
  const descCount = $('#descCharCount');
  descInp?.addEventListener('input', () => {
    descCount.textContent = `${descInp.value.length} ký tự`;
  });

  // Chọn ảnh hàng loạt từ máy
  $('#btnPickBatchImages')?.addEventListener('click', () => $('#batchImageInput')?.click());
  $('#batchImageInput')?.addEventListener('change', (e) => {
    handleBatchImages(e.target.files);
    e.target.value = '';
  });

  // Chọn 1 ảnh cho 1 slot
  $('#singleSlotInput')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const fr = new FileReader();
      fr.onload = () => {
        slots[currentSlotIndex] = fr.result;
        renderSlots();
        log(`Đã nạp ảnh vào vị trí ${currentSlotIndex + 1}`, 'ok');
      };
      fr.readAsDataURL(file);
    }
    e.target.value = '';
  });

  // Chọn ảnh cho phân loại
  $('#varImageInput')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/') && currentVarImageId) {
      const targetVar = variations.find(v => v.id === currentVarImageId);
      if (targetVar) {
        const fr = new FileReader();
        fr.onload = () => {
          targetVar.dataUrl = fr.result;
          renderVariations();
          log(`Đã chọn ảnh cho phân loại: ${targetVar.name || targetVar.id}`, 'ok');
        };
        fr.readAsDataURL(file);
      }
    }
    e.target.value = '';
  });

  // Xóa hết ảnh
  $('#btnClearAllImages')?.addEventListener('click', clearAllImages);

  // Thêm phân loại
  $('#btnAddVariation')?.addEventListener('click', () => addVariation());
  $('#btnClearAllVariations')?.addEventListener('click', clearAllVariations);
  $('#btnAutoFillSku')?.addEventListener('click', autoFillVarSkus);

  // Áp dụng giá & kho nhanh cho tất cả phân loại
  $('#btnApplyQuickPrice')?.addEventListener('click', () => {
    const p = Number($('#quickPriceInput')?.value);
    if (!p) return;
    variations.forEach(v => { v.price = p; });
    renderVariations();
    log(`Đã áp giá ${p.toLocaleString()}đ cho tất cả phân loại.`, 'ok');
  });

  $('#btnApplyQuickStock')?.addEventListener('click', () => {
    const s = Number($('#quickStockInput')?.value);
    variations.forEach(v => { v.stock = s; });
    renderVariations();
    log(`Đã áp tồn kho ${s} cho tất cả phân loại.`, 'ok');
  });

  // Nút Xóa trắng
  $('#btnTopClearAll')?.addEventListener('click', clearAllForm);
  $('#btnBottomClearAll')?.addEventListener('click', clearAllForm);

  // Copy Tên & Mô tả
  $('#btnCopyTitle')?.addEventListener('click', () => {
    const val = titleInp?.value || '';
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      $('#btnCopyTitle').textContent = 'Đã copy!';
      setTimeout(() => { $('#btnCopyTitle').textContent = 'Copy'; }, 1500);
    });
  });

  $('#btnCopyDesc')?.addEventListener('click', () => {
    const val = descInp?.value || '';
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      $('#btnCopyDesc').textContent = 'Đã copy!';
      setTimeout(() => { $('#btnCopyDesc').textContent = 'Copy'; }, 1500);
    });
  });

  // Viết lại AI - Tên
  $('#btnRewriteTitleAi')?.addEventListener('click', async () => {
    const currentName = titleInp?.value.trim();
    if (!currentName) {
      alert('Vui lòng nhập tên sản phẩm trước khi viết lại!');
      return;
    }
    const btn = $('#btnRewriteTitleAi');
    btn.textContent = 'Đang viết...';
    btn.disabled = true;
    try {
      const prompt = `Bạn là chuyên gia SEO Shopee. Hãy viết lại 1 tiêu đề sản phẩm mới thật thu hút, chuẩn SEO Shopee cho sản phẩm: "${currentName}".
YÊU CẦU:
1. Độ dài tối đa 120 ký tự.
2. Đầy đủ: [Loại sản phẩm] + [Thương hiệu/Đặc điểm chính] + [Công dụng/Lợi ích nổi bật].
3. Chỉ trả về duy nhất 1 tiêu đề mới, không thêm lời chào hay ghi chú thừa.`;
      const res = await callGemini(prompt);
      if (res) {
        titleInp.value = res.replace(/["\n]/g, '').trim().substring(0, 120);
        titleCount.textContent = `${titleInp.value.length}/120`;
        log('✔ Đã viết lại tên sản phẩm bằng AI', 'ok');
      }
    } catch (e) {
      alert('Lỗi viết lại tên AI: ' + e.message);
      log('Lỗi viết lại tên AI: ' + e.message, 'err');
    } finally {
      btn.textContent = 'Viết lại AI';
      btn.disabled = false;
    }
  });

  // Viết lại AI - Mô tả
  $('#btnRewriteDescAi')?.addEventListener('click', async () => {
    const currentName = titleInp?.value.trim();
    const currentDesc = descInp?.value.trim();
    if (!currentName && !currentDesc) {
      alert('Vui lòng nhập tiêu đề hoặc vài dòng mô tả trước!');
      return;
    }
    const btn = $('#btnRewriteDescAi');
    btn.textContent = 'Đang viết...';
    btn.disabled = true;
    try {
      const prompt = `Bạn là chuyên gia viết content marketing và SEO Shopee hàng đầu. Hãy viết lại bài mô tả sản phẩm này thật chi tiết, hấp dẫn và chuẩn SEO Shopee.

YÊU CẦU BẮT BUỘC:
1. ĐỘ DÀI: Khoảng 2500 đến 2700 ký tự (Đảm bảo độ dài từ 2500 - 2700 ký tự, không vượt quá 2900 ký tự vì Shopee giới hạn tối đa 3000 ký tự).
2. HASHTAG: Ở CUỐI BÀI VIẾT, BẮT BUỘC THÊM TỪ 15 - 20 HASHTAG CHUẨN SEO liên quan đến sản phẩm (Định dạng: #hashtag1 #hashtag2 #hashtag3...).
3. BỐ CỤC ĐẦY ĐỦ RÕ RÀNG:
   - Đoạn giới thiệu cuốn hút về sản phẩm.
   - Đặc điểm nổi bật & Lợi ích vượt trội khi sử dụng sản phẩm.
   - Thông số kỹ thuật chi tiết.
   - Hướng dẫn sử dụng & Mẹo bảo quản.
   - Chính sách cam kết & Bảo hành đổi trả uy tín của shop.
   - Danh sách hashtag ở cuối cùng.
4. ĐỊNH DẠNG:
   - Dùng icon emoji sinh động, chuyên nghiệp cho từng đầu mục.
   - Giữ nguyên định dạng xuống dòng rõ ràng giữa các đoạn.
   - TUYỆT ĐỐI KHÔNG DÙNG ký tự markdown in đậm như ** hoặc __ hoặc * (Shopee không hỗ trợ markdown).
   - Chỉ trả về duy nhất nội dung bài mô tả.

Tên sản phẩm: ${currentName}
Thông tin mô tả: ${currentDesc || currentName}`;

      let newDesc = await callGemini(prompt);
      if (newDesc) {
        newDesc = newDesc.replace(/```markdown/gi, '').replace(/```/g, '').replace(/\*\*/g, '').replace(/\*/g, '').trim();
        if (!/#\w+/.test(newDesc)) {
          newDesc += '\n\n#shopee #chinhhang #freeship #giare #uytin';
        }
        if (newDesc.length > 2950) newDesc = newDesc.substring(0, 2900).trim();
        descInp.value = newDesc;
        descCount.textContent = `${newDesc.length} ký tự`;
        log(`✔ Đã viết lại mô tả sản phẩm bằng AI (${newDesc.length} ký tự)`, 'ok');
      }
    } catch (e) {
      alert('Lỗi viết lại mô tả AI: ' + e.message);
      log('Lỗi viết lại mô tả AI: ' + e.message, 'err');
    } finally {
      btn.textContent = 'Viết lại AI';
      btn.disabled = false;
    }
  });

  // Nút Điền vào SP (Tên & Mô tả)
  async function fillToShopeeTab(field = 'all') {
    const name = titleInp?.value.trim();
    const desc = descInp?.value.trim();
    if (!name && !desc) {
      alert('Chưa có Tiêu đề hoặc Mô tả để điền vào trang Shopee!');
      return;
    }

    const payload = { type: 'FILL_PRODUCT_TEXT', product: {} };
    if (field === 'name' || field === 'all') payload.product.name = name;
    if (field === 'desc' || field === 'all') payload.product.description = desc;

    try {
      const res = await sendMessageToShopeeTab(payload);
      log('✔ Đã gửi điền thông tin vào tab Đăng sản phẩm Shopee!', 'ok');
      alert('Đã điền thành công sang trang Shopee!');
    } catch (e) {
      alert('Lỗi: ' + e.message);
      log('Lỗi điền vào trang Shopee: ' + e.message, 'err');
    }
  }

  $('#btnPushTitleToProduct')?.addEventListener('click', () => fillToShopeeTab('name'));
  $('#btnPushDescToProduct')?.addEventListener('click', () => fillToShopeeTab('desc'));
  $('#btnFillShopeeTab')?.addEventListener('click', () => fillToShopeeTab('all'));

  // Đăng sản phẩm trực tiếp
  $('#btnClone')?.addEventListener('click', runDirectPublish);

  // Tải lại cài đặt shop
  $('#reloadShop')?.addEventListener('click', (e) => {
    e.preventDefault();
    loadShopData(true);
  });

  // Gemini API Key config
  chrome.storage.local.get(['geminiApiKey'], (r) => {
    if (r.geminiApiKey && $('#geminiApiKeyInput')) {
      $('#geminiApiKeyInput').value = r.geminiApiKey;
      $('#geminiStatusBadge').textContent = 'Đã lưu Key';
      $('#geminiStatusBadge').className = 'pill ok';
    }
  });

  $('#btnSaveGeminiKey')?.addEventListener('click', () => {
    const key = ($('#geminiApiKeyInput')?.value || '').trim();
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      $('#geminiStatusBadge').textContent = key ? 'Đã lưu Key' : 'Chưa có Key';
      $('#geminiStatusBadge').className = key ? 'pill ok' : 'pill';
      alert('Đã lưu Gemini API Key!');
    });
  });

  $('#btnTestGeminiKey')?.addEventListener('click', async () => {
    const msg = $('#geminiApiMsg');
    msg.textContent = '⏳ Đang kiểm tra kết nối...';
    try {
      const res = await callGemini('Hãy trả lời đúng 1 chữ: OK');
      msg.textContent = `✔ Kết nối thành công: ${res}`;
      msg.style.color = '#059669';
    } catch (e) {
      msg.textContent = `✖ Lỗi: ${e.message}`;
      msg.style.color = '#ef4444';
    }
  });

  $('#btnToggleGeminiKeyVis')?.addEventListener('click', () => {
    const inp = $('#geminiApiKeyInput');
    if (inp) inp.type = inp.type === 'password' ? 'text' : 'password';
  });

  // Paste ảnh (Ctrl+V) vào form
  window.addEventListener('paste', (e) => {
    const items = e.clipboardData?.items || [];
    for (const item of items) {
      if (item.type && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const fr = new FileReader();
          fr.onload = () => {
            // Đặt vào slot 0 (Bìa) hoặc slot trống đầu tiên
            const emptyIdx = slots.findIndex(s => !s);
            const targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
            slots[targetIdx] = fr.result;
            renderSlots();
            log(`✔ Đã dán ảnh từ clipboard (Ctrl+V) vào Ảnh ${targetIdx + 1}!`, 'ok');
          };
          fr.readAsDataURL(file);
        }
        break;
      }
    }
  });
});
