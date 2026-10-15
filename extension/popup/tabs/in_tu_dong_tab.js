// =========================================================================
// MODULE: IN TỰ ĐỘNG (TOÀN QUY TRÌNH TỰ ĐỘNG HÓA ĐƠN HÀNG)
// 1. Xác nhận đơn hàng (mass_shipment_tab=201)
// 2. Đọc đơn Chờ lấy hàng (portal/sale/order?type=toship&source=processed&sort_by=ship_by_date_asc)
// 3. Tải file Excel đơn đã chọn
// 4. Chuyển Tạo phiếu và in/tải PDF (mass_shipment_tab=301)
// =========================================================================

(function() {
  const ORDER_PROCESSED_URL = "https://banhang.shopee.vn/portal/sale/order?type=toship&source=processed&sort_by=ship_by_date_asc";

  // Bước 1: trang Giao hàng loạt (tab 201) với bộ lọc cố định.
  // current_time lấy theo thời điểm bấm để bộ lọc "hạn giao" luôn đúng.
  function buildStep1ConfirmUrl() {
    const params = new URLSearchParams({
      "filter.product_location_id": "VN00Z9JEZ",
      "mass_shipment_tab": "201",
      "filter.shipping_method": "50021",
      "filter.order_item_filter_type": "item0",
      "filter.order_process_status": "1",
      "filter.sort.sort_type": "2",
      "filter.sort.ascending": "true",
      "filter.pre_order": "2",
      "filter.shipping_urgency_filter.current_time": String(Math.floor(Date.now() / 1000)),
      "filter.shipping_urgency_filter.shipping_urgency": "1",
      "filter.return_null_product_location_id_order": "false"
    });
    return `https://banhang.shopee.vn/portal/sale/mass/ship?${params.toString()}`;
  }
  const MASS_SHIP_301_URL = "https://banhang.shopee.vn/portal/sale/mass/ship?mass_shipment_tab=301";

  // Elements
  const btnOpenOrderPage = document.getElementById("btn-autoin-open-order-page");
  const btnStep1Confirm = document.getElementById("btn-autoin-step1-confirm");
  const btnStep2Read = document.getElementById("btn-autoin-step2-read");
  const btnStep3ExportExcel = document.getElementById("btn-autoin-step3-export-excel");
  const btnStep4PrintPdf = document.getElementById("btn-autoin-step4-print-pdf");
  const btnFullFlow = document.getElementById("btn-autoin-full-flow");
  const btnStop = document.getElementById("btn-autoin-stop");

  const statusEl = document.getElementById("autoin-status");
  const searchInput = document.getElementById("autoin-search-input");
  const countBadge = document.getElementById("autoin-count-badge");
  const selectedBadge = document.getElementById("autoin-selected-badge");
  const unprintedBadge = document.getElementById("autoin-unprinted-badge");
  const checkboxAll = document.getElementById("autoin-checkbox-all");
  const tbodyEl = document.getElementById("autoin-orders-tbody");

  const filterBtns = document.querySelectorAll(".autoin-filter-btn");

  let cachedOrders = [];
  let selectedOrderIds = new Set();
  let currentFilter = "all"; // "all" | "unprinted" | "printed"
  let isStepRunning = false;
  let isFullFlowRunning = false;

  function updateStatus(message, isError = false, isSuccess = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    if (isError) {
      statusEl.style.color = "#dc2626";
    } else if (isSuccess) {
      statusEl.style.color = "#16a34a";
    } else {
      statusEl.style.color = "#0284c7";
    }
  }

  function updateBadges() {
    const total = cachedOrders.length;
    const selected = selectedOrderIds.size;
    const unprintedCount = cachedOrders.filter(o => !o.isPrinted).length;

    if (countBadge) countBadge.innerHTML = `Tổng: <b>${total}</b>`;
    if (selectedBadge) selectedBadge.innerHTML = `Đã chọn: <b>${selected}</b>`;
    if (unprintedBadge) unprintedBadge.innerHTML = `Chưa in: <b>${unprintedCount}</b>`;

    if (checkboxAll) {
      const visibleOrders = getFilteredOrders();
      const visibleTotal = visibleOrders.length;
      let visibleSelectedCount = 0;
      visibleOrders.forEach(o => {
        if (selectedOrderIds.has(o.orderId)) visibleSelectedCount++;
      });

      if (visibleTotal > 0 && visibleSelectedCount === visibleTotal) {
        checkboxAll.checked = true;
        checkboxAll.indeterminate = false;
      } else if (visibleSelectedCount > 0 && visibleSelectedCount < visibleTotal) {
        checkboxAll.checked = false;
        checkboxAll.indeterminate = true;
      } else {
        checkboxAll.checked = false;
        checkboxAll.indeterminate = false;
      }
    }
  }

  // Dùng lại tab đang ở đúng trang (tab mở gần nhất), không có thì mở tab mới.
  async function getOrOpenTab(urlKeyword, fullUrl) {
    const tabs = await chrome.tabs.query({ url: "*://banhang.shopee.vn/*" });
    const matched = tabs.filter(t => t.url && t.url.includes(urlKeyword)).pop();
    if (matched?.id) {
      await chrome.tabs.update(matched.id, { active: true });
      return matched;
    }
    return openUrlInNewTab(fullUrl);
  }

  // Mở url trong 1 tab MỚI (không ghi đè tab đang mở) rồi đợi tải xong.
  async function openUrlInNewTab(fullUrl) {
    const newTab = await chrome.tabs.create({ url: fullUrl, active: true });
    if (newTab?.id) await waitForTabToLoad(newTab.id);
    return newTab;
  }

  function waitForTabToLoad(tabId) {
    return new Promise((resolve) => {
      const listener = (updatedId, changeInfo) => {
        if (updatedId === tabId && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener);
          setTimeout(resolve, 1500);
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }, 10000);
    });
  }

  // Chỉ gửi tới frame chính (frameId 0): content.js chạy all_frames nên
  // iframe con có thể trả lời trước với danh sách rỗng.
  async function sendTabMessage(tabId, message) {
    try {
      return await chrome.tabs.sendMessage(tabId, message, { frameId: 0 });
    } catch (_) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["extension/lib/xlsx.full.min.js", "extension/lib/html2pdf.bundle.min.js", "extension/lib/pdf-lib.min.js", "extension/content/content.js"]
      });
      await new Promise(r => setTimeout(r, 300));
      return await chrome.tabs.sendMessage(tabId, message, { frameId: 0 });
    }
  }

  function getFilteredOrders() {
    let list = cachedOrders;
    if (currentFilter === "unprinted") {
      list = list.filter(o => !o.isPrinted);
    } else if (currentFilter === "printed") {
      list = list.filter(o => o.isPrinted);
    }

    const q = (searchInput?.value || "").toLowerCase().trim();
    if (q) {
      list = list.filter(o => {
        const mdh = (o.orderId || "").toLowerCase();
        const mvd = (o.trackingNumber || "").toLowerCase();
        const name = (o.productName || "").toLowerCase();
        const sku = (o.sku || "").toLowerCase();
        const buyer = (o.buyerUsername || "").toLowerCase();
        return mdh.includes(q) || mvd.includes(q) || name.includes(q) || sku.includes(q) || buyer.includes(q);
      });
    }

    return list;
  }

  function renderOrders() {
    if (!tbodyEl) return;
    tbodyEl.innerHTML = "";

    const ordersToRender = getFilteredOrders();

    if (!Array.isArray(ordersToRender) || ordersToRender.length === 0) {
      tbodyEl.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 24px 10px; text-align: center; color: #94a3b8; font-style: italic;">
            ${cachedOrders.length === 0 ? "Chưa có dữ liệu. Bấm 'Bước 2: Đọc Đơn Chờ Lấy Hàng' để tải danh sách đơn." : "Không có đơn hàng nào khớp với bộ lọc."}
          </td>
        </tr>
      `;
      updateBadges();
      return;
    }

    ordersToRender.forEach((order) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #f1f5f9";
      tr.style.transition = "background-color 0.15s";
      tr.className = "autoin-order-row";
      tr.dataset.orderId = order.orderId;

      const isChecked = selectedOrderIds.has(order.orderId);
      if (isChecked) {
        tr.style.backgroundColor = "#f0fdf4";
      }

      // 1. Checkbox
      const tdCheck = document.createElement("td");
      tdCheck.style.cssText = "padding: 6px; text-align: center; vertical-align: middle;";
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.className = "autoin-chk-order";
      chk.dataset.orderId = order.orderId;
      chk.checked = isChecked;
      chk.style.cssText = "cursor: pointer; width: 14px; height: 14px;";
      chk.addEventListener("change", (e) => {
        if (e.target.checked) {
          selectedOrderIds.add(order.orderId);
          tr.style.backgroundColor = "#f0fdf4";
        } else {
          selectedOrderIds.delete(order.orderId);
          tr.style.backgroundColor = "";
        }
        updateBadges();
      });
      tdCheck.appendChild(chk);

      // 2. Ảnh sản phẩm
      const tdImg = document.createElement("td");
      tdImg.style.cssText = "padding: 4px; text-align: center; vertical-align: middle;";
      if (order.mainImage) {
        const img = document.createElement("img");
        img.src = order.mainImage;
        img.style.cssText = "width: 42px; height: 42px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0; cursor: pointer;";
        img.title = "Bấm để mở ảnh lớn";
        img.addEventListener("click", () => {
          window.open(order.mainImage, "_blank");
        });
        tdImg.appendChild(img);
      } else {
        tdImg.innerHTML = `<span style="font-size: 16px; color: #94a3b8;">📦</span>`;
      }

      // 3. Mã đơn hàng (MDH)
      const tdMdh = document.createElement("td");
      tdMdh.style.cssText = "padding: 6px 8px; vertical-align: middle;";
      tdMdh.innerHTML = `
        <span class="autoin-copy-text" data-copy="${order.orderId}" title="Bấm để sao chép MDH" style="color: #0284c7; font-weight: 700; font-size: 11px; cursor: pointer;">${order.orderId}</span>
      `;

      // 4. Mã vận đơn (MVD)
      const tdMvd = document.createElement("td");
      tdMvd.style.cssText = "padding: 6px 8px; vertical-align: middle;";
      if (order.trackingNumber) {
        tdMvd.innerHTML = `
          <span class="autoin-copy-text" data-copy="${order.trackingNumber}" title="Bấm để sao chép MVD" style="font-family: monospace; font-weight: 700; color: #334155; font-size: 10.5px; word-break: break-all; cursor: pointer;">${order.trackingNumber}</span>
        `;
      } else {
        tdMvd.innerHTML = `<span style="color: #94a3b8; font-style: italic;">Chưa có</span>`;
      }

      // 5. Sản phẩm & SKU
      const tdProd = document.createElement("td");
      tdProd.style.cssText = "padding: 6px 8px; vertical-align: middle; max-width: 170px;";
      tdProd.innerHTML = `
        <div style="font-weight: 600; color: #1e293b; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${order.productName}">
          ${order.productName}
        </div>
        <div style="font-size: 10px; color: #dc2626; font-weight: 700; margin-top: 2px; white-space: normal; word-break: break-word; line-height: 1.3;">
          SKU: ${order.sku || '--'}
        </div>
      `;

      // 6. Trạng thái in & Hạn giao
      const tdStatus = document.createElement("td");
      tdStatus.style.cssText = "padding: 6px 8px; vertical-align: middle;";
      const isPrinted = order.isPrinted;
      tdStatus.innerHTML = `
        <div style="display: flex; align-items: center; gap: 5px;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 10px; font-weight: bold; font-size: 9.5px; ${isPrinted ? 'background: #dcfce7; color: #15803d; border: 1px solid #86efac;' : 'background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa;'}">
            ${isPrinted ? '✓ Đã in' : '⏳ Chưa in'}
          </span>
        </div>
        <div style="font-size: 9.5px; color: #64748b; margin-top: 3px;" title="Hạn giao hàng">
          ⏰ ${order.shipByDate || '--'}
        </div>
      `;

      tr.appendChild(tdCheck);
      tr.appendChild(tdImg);
      tr.appendChild(tdMdh);
      tr.appendChild(tdMvd);
      tr.appendChild(tdProd);
      tr.appendChild(tdStatus);

      tbodyEl.appendChild(tr);
    });

    // Bấm vào MDH / MVD là sao chép
    tbodyEl.querySelectorAll(".autoin-copy-text").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const text = el.dataset.copy;
        if (!text) return;
        navigator.clipboard.writeText(text);
        el.textContent = "✓ Đã chép";
        setTimeout(() => { el.textContent = text; }, 1000);
      });
    });

    updateBadges();
  }

  // =========================================================================
  // BƯỚC 1: TỰ ĐỘNG XÁC NHẬN ĐƠN (2 KHO)
  // =========================================================================
  async function runStep1ConfirmOrders() {
    updateStatus("⚡ [Bước 1] Đang mở trang Giao hàng loạt (tab 201) với bộ lọc...");
    try {
      await openUrlInNewTab(buildStep1ConfirmUrl());
      updateStatus("⚡ [Bước 1] Đã mở trang, đang tự động xác nhận lấy hàng 2 kho...");

      if (typeof window.startAutoPickupAllWarehouses === "function") {
        await window.startAutoPickupAllWarehouses();
        updateStatus("✓ [Bước 1] Hoàn thành xác nhận đơn 2 kho!", false, true);
        return true;
      } else {
        updateStatus("✓ [Bước 1] Đã mở trang xác nhận đơn. Vui lòng bấm 'Tự động yêu cầu lấy hàng' trên tab In.", false, true);
        return true;
      }
    } catch (err) {
      updateStatus("❌ [Bước 1] Lỗi: " + err.message, true);
      return false;
    }
  }

  // =========================================================================
  // BƯỚC 2: ĐỌC ĐƠN CHỜ LẤY HÀNG TỪ /portal/sale/order
  // =========================================================================
  async function runStep2ReadOrders() {
    updateStatus("📥 [Bước 2] Đang mở trang Đơn Đã Xử Lý & đọc danh sách đơn...");
    try {
      const tab = await openUrlInNewTab(ORDER_PROCESSED_URL);
      if (!tab?.id) throw new Error("Không thể kết nối tới tab Shopee.");

      updateStatus("⏳ Đang quét danh sách đơn hàng (Tên, SKU, MDH, MVD, Trạng thái in)...");
      const response = await sendTabMessage(tab.id, { type: "AUTOIN_READ_PROCESSED_ORDERS" });

      if (!response?.ok) {
        throw new Error(response?.message || "Không đọc được danh sách đơn hàng.");
      }

      cachedOrders = Array.isArray(response.orders) ? response.orders : [];
      
      // Mặc định chọn tất cả các đơn CHƯA IN (hoặc tất cả đơn nếu toàn bộ đã in)
      const unprintedOnes = cachedOrders.filter(o => !o.isPrinted);
      if (unprintedOnes.length > 0) {
        selectedOrderIds = new Set(unprintedOnes.map(o => o.orderId));
      } else {
        selectedOrderIds = new Set(cachedOrders.map(o => o.orderId));
      }

      renderOrders();
      updateStatus(`✓ [Bước 2] Đã đọc được ${cachedOrders.length} đơn hàng (${unprintedOnes.length} đơn chưa in)!`, false, true);
      return true;
    } catch (err) {
      updateStatus("❌ [Bước 2] Lỗi: " + err.message, true);
      return false;
    }
  }

  // =========================================================================
  // BƯỚC 3: TẢI EXCEL ĐƠN ĐÃ CHỌN
  // =========================================================================
  async function runStep3ExportExcel() {
    const ordersToExport = cachedOrders.filter(o => selectedOrderIds.has(o.orderId));
    if (ordersToExport.length === 0) {
      alert("Vui lòng tích chọn ít nhất 1 đơn hàng trong bảng để xuất Excel.");
      return false;
    }

    updateStatus(`📊 [Bước 3] Đang tích chọn ${ordersToExport.length} đơn và bấm XLS trên trang Shopee...`);
    try {
      // Xuất bằng nút XLS trên trang Shopee (cùng mẫu Excel 28 cột của nút XLS)
      const tab = await getOrOpenTab("type=toship&source=processed", ORDER_PROCESSED_URL);
      if (!tab?.id) throw new Error("Không thể kết nối tới tab Shopee.");

      const response = await sendTabMessage(tab.id, {
        type: "AUTOIN_EXPORT_XLS",
        orderIds: ordersToExport.map(o => o.orderId)
      });
      if (!response?.ok) {
        throw new Error(response?.message || "Không bấm được nút XLS trên trang Shopee.");
      }

      const missingNote = response.missing > 0 ? ` (${response.missing} đơn không thấy trên trang hiện tại)` : "";
      updateStatus(`✓ [Bước 3] Đã bấm XLS tải Excel cho ${response.matched} đơn hàng${missingNote}!`, false, true);
      return true;
    } catch (err) {
      updateStatus("❌ [Bước 3] Lỗi: " + err.message, true);
      return false;
    }
  }

  // =========================================================================
  // BƯỚC 4: CHUYỂN TẠO PHIẾU & IN PDF NHỮNG ĐƠN ĐÃ CHỌN
  // =========================================================================
  async function runStep4PrintPdf() {
    const orderIdsToPrint = Array.from(selectedOrderIds);
    if (orderIdsToPrint.length === 0) {
      alert("Vui lòng tích chọn ít nhất 1 đơn hàng trong bảng để tạo phiếu.");
      return false;
    }

    updateStatus(`📑 [Bước 4] Đang mở trang Tạo phiếu (tab 301) cho ${orderIdsToPrint.length} đơn...`);
    try {
      const tab = await openUrlInNewTab(MASS_SHIP_301_URL);
      if (!tab?.id) throw new Error("Chưa kết nối được tới tab Shopee Tạo phiếu.");

      updateStatus(`⏳ Đang tích ${orderIdsToPrint.length} đơn, bấm 'Tạo phiếu đã chọn' và đợi trang in tải xong để tải PDF (tối đa ~1 phút)...`);
      const response = await sendTabMessage(tab.id, {
        type: "TAB301_SELECT_ORDERS_AND_GENERATE_DOC",
        orderIds: orderIdsToPrint,
        autoDownloadPdf: true
      });

      if (!response?.ok) {
        throw new Error(response?.message || "Không bấm được nút Tạo phiếu trên Shopee.");
      }

      updateStatus(`🎉 [Bước 4] ${response.message}`, false, true);
      return true;
    } catch (err) {
      updateStatus("❌ [Bước 4] Lỗi: " + err.message, true);
      return false;
    }
  }

  // =========================================================================
  // TOÀN QUY TRÌNH TỰ ĐỘNG (FULL FLOW: 1 -> 2 -> 3 -> 4)
  // =========================================================================
  async function runFullAutoFlow() {
    if (isFullFlowRunning) return;
    isFullFlowRunning = true;
    if (btnFullFlow) btnFullFlow.style.display = "none";
    if (btnStop) btnStop.style.display = "flex";

    updateStatus("🚀 Bắt đầu chạy tự động (Bước 3 -> 4)...");

    try {
      // Chạy trên danh sách đơn đã đọc ở Bước 2 và các đơn đang tích trong bảng
      if (cachedOrders.length === 0) {
        throw new Error("Chưa có danh sách đơn. Hãy bấm '2. Đọc Đơn Chờ Lấy' trước.");
      }
      if (selectedOrderIds.size === 0) {
        throw new Error("Chưa tích đơn nào trong bảng.");
      }

      // BƯỚC 3: Tải Excel
      const s3 = await runStep3ExportExcel();
      if (!isFullFlowRunning) return;
      if (!s3) throw new Error("Dừng lại do Bước 3 bị lỗi.");

      updateStatus("Chờ 2 giây trước khi chuyển Tạo phiếu...");
      await new Promise(r => setTimeout(r, 2000));
      if (!isFullFlowRunning) return;

      // BƯỚC 4: Tạo phiếu & In PDF
      const s4 = await runStep4PrintPdf();
      if (!isFullFlowRunning) return;
      if (!s4) throw new Error("Dừng lại do Bước 4 bị lỗi.");

      updateStatus("🎉 HOÀN THÀNH TỰ ĐỘNG (XUẤT EXCEL -> TẠO PHIẾU -> TẢI PDF)!", false, true);
    } catch (err) {
      updateStatus("❌ Lỗi chạy tự động: " + err.message, true);
    } finally {
      isFullFlowRunning = false;
      if (btnFullFlow) btnFullFlow.style.display = "flex";
      if (btnStop) btnStop.style.display = "none";
    }
  }

  // =========================================================================
  // EVENT LISTENERS
  // =========================================================================
  if (btnOpenOrderPage) {
    btnOpenOrderPage.addEventListener("click", () => {
      openUrlInNewTab(ORDER_PROCESSED_URL);
    });
  }

  if (btnStep1Confirm) {
    btnStep1Confirm.addEventListener("click", runStep1ConfirmOrders);
  }

  if (btnStep2Read) {
    btnStep2Read.addEventListener("click", runStep2ReadOrders);
  }

  if (btnStep3ExportExcel) {
    btnStep3ExportExcel.addEventListener("click", runStep3ExportExcel);
  }

  if (btnStep4PrintPdf) {
    btnStep4PrintPdf.addEventListener("click", runStep4PrintPdf);
  }

  if (btnFullFlow) {
    btnFullFlow.addEventListener("click", runFullAutoFlow);
  }

  if (btnStop) {
    btnStop.addEventListener("click", () => {
      isFullFlowRunning = false;
      updateStatus("🛑 Đang dừng quy trình tự động...");
    });
  }

  // Filter Buttons (Tất cả, Chưa in, Đã in)
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => {
        b.style.background = "white";
        b.style.color = "#475569";
        b.style.borderColor = "#cbd5e1";
      });
      btn.style.background = "#0284c7";
      btn.style.color = "white";
      btn.style.borderColor = "#0284c7";

      currentFilter = btn.dataset.filter || "all";
      renderOrders();
    });
  });

  // Checkbox Chọn tất cả / Bỏ chọn tất cả
  if (checkboxAll) {
    checkboxAll.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      const visibleOrders = getFilteredOrders();
      visibleOrders.forEach(o => {
        if (isChecked) {
          selectedOrderIds.add(o.orderId);
        } else {
          selectedOrderIds.delete(o.orderId);
        }
      });
      renderOrders();
    });
  }

  // Search input
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      renderOrders();
    });
  }
})();
