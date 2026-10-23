// =========================================================================
// MODULE: TẠO PHIẾU (mass_shipment_tab=301)
// =========================================================================

(function() {
  const TAB301_URL = "https://banhang.shopee.vn/portal/sale/mass/ship?mass_shipment_tab=301";

  // Elements
  const btnOpenShopee = document.getElementById("btn-tab301-open-shopee");
  const btnFilterHanoi = document.getElementById("btn-tab301-filter-hanoi");
  const btnGenerateDoc = document.getElementById("btn-tab301-generate-doc");
  const btnRefreshTable = document.getElementById("btn-tab301-refresh-table");
  const statusEl = document.getElementById("tab301-status");
  const searchInput = document.getElementById("tab301-search-input");
  const countBadge = document.getElementById("tab301-count-badge");
  const selectedBadge = document.getElementById("tab301-selected-badge");
  const checkboxAll = document.getElementById("tab301-checkbox-all");
  const tbodyEl = document.getElementById("tab301-orders-tbody");

  let cachedOrders = [];
  let selectedOrderIds = new Set();
  let isFiltering = false;
  let isGenerating = false;

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

  function updateSelectedBadge() {
    if (!selectedBadge) return;
    const total = cachedOrders.length;
    const selected = selectedOrderIds.size;
    selectedBadge.innerHTML = `Đã chọn: <b>${selected}</b>${total > 0 ? ` / ${total}` : ''}`;
    
    // Update checkbox all state
    if (checkboxAll) {
      if (total > 0 && selected === total) {
        checkboxAll.checked = true;
        checkboxAll.indeterminate = false;
      } else if (selected > 0 && selected < total) {
        checkboxAll.checked = false;
        checkboxAll.indeterminate = true;
      } else {
        checkboxAll.checked = false;
        checkboxAll.indeterminate = false;
      }
    }
  }

  async function getOrOpenTab301() {
    const tabs = await chrome.tabs.query({ url: "*://banhang.shopee.vn/portal/sale/mass/ship*" });
    
    // Tìm tab đang mở đúng tab=301
    let tab301 = tabs.find(t => t.url && t.url.includes("mass_shipment_tab=301"));
    if (tab301?.id) {
      await chrome.tabs.update(tab301.id, { active: true });
      return tab301;
    }

    // Nếu có tab mass ship nhưng chưa phải 301 -> điều hướng tới 301
    if (tabs.length > 0 && tabs[0]?.id) {
      const existingTab = tabs[0];
      await chrome.tabs.update(existingTab.id, { url: TAB301_URL, active: true });
      await waitForTabToLoad(existingTab.id);
      return existingTab;
    }

    // Mở tab mới
    const newTab = await chrome.tabs.create({ url: TAB301_URL, active: true });
    if (newTab?.id) {
      await waitForTabToLoad(newTab.id);
    }
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

  async function sendTabMessage(tabId, message) {
    try {
      return await chrome.tabs.sendMessage(tabId, message, { frameId: 0 });
    } catch (_) {
      // Inject content script nếu chưa được nạp
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["extension/lib/xlsx.full.min.js", "extension/lib/pdf-lib.min.js", "extension/content/content.js"]
      });
      await new Promise(r => setTimeout(r, 300));
      return await chrome.tabs.sendMessage(tabId, message, { frameId: 0 });
    }
  }

  function renderOrders(ordersToRender) {
    if (!tbodyEl) return;
    tbodyEl.innerHTML = "";

    if (!Array.isArray(ordersToRender) || ordersToRender.length === 0) {
      tbodyEl.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 24px 10px; text-align: center; color: #94a3b8; font-style: italic;">
            ${searchInput?.value ? "Không tìm thấy đơn hàng nào khớp với từ khóa tìm kiếm." : "Không có đơn hàng nào."}
          </td>
        </tr>
      `;
      if (countBadge) countBadge.innerHTML = `Tổng: <b>0</b> đơn`;
      updateSelectedBadge();
      return;
    }

    if (countBadge) countBadge.innerHTML = `Tổng: <b>${ordersToRender.length}</b> đơn`;

    ordersToRender.forEach((order, index) => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #f1f5f9";
      tr.style.transition = "background-color 0.15s";
      tr.className = "tab301-order-row";
      tr.dataset.orderId = order.orderId;

      const isChecked = selectedOrderIds.has(order.orderId);
      if (isChecked) {
        tr.style.backgroundColor = "#f0fdf4";
      }

      // Checkbox
      const tdCheck = document.createElement("td");
      tdCheck.style.cssText = "padding: 6px; text-align: center; vertical-align: middle;";
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.className = "tab301-chk-order";
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
        updateSelectedBadge();
      });
      tdCheck.appendChild(chk);

      // Ảnh sản phẩm
      const tdImg = document.createElement("td");
      tdImg.style.cssText = "padding: 4px; text-align: center; vertical-align: middle;";
      if (order.mainImage) {
        const imgWrap = document.createElement("div");
        imgWrap.style.cssText = "position: relative; width: 44px; height: 44px; margin: 0 auto;";
        const img = document.createElement("img");
        img.src = order.mainImage;
        img.style.cssText = "width: 44px; height: 44px; object-fit: cover; border-radius: 4px; border: 1px solid #e2e8f0; cursor: pointer;";
        img.title = "Bấm để mở ảnh lớn";
        img.addEventListener("click", () => {
          window.open(order.mainImage, "_blank");
        });
        imgWrap.appendChild(img);

        if (Array.isArray(order.imageUrls) && order.imageUrls.length > 1) {
          const badge = document.createElement("span");
          badge.style.cssText = "position: absolute; bottom: 1px; right: 1px; background: rgba(0,0,0,0.65); color: white; font-size: 8.5px; padding: 0 3px; border-radius: 2px; font-weight: bold;";
          badge.textContent = `+${order.imageUrls.length - 1}`;
          imgWrap.appendChild(badge);
        }
        tdImg.appendChild(imgWrap);
      } else {
        tdImg.innerHTML = `<span style="font-size: 16px; color: #94a3b8;">📦</span>`;
      }

      // Mã đơn hàng (MDH)
      const tdMdh = document.createElement("td");
      tdMdh.style.cssText = "padding: 6px 8px; vertical-align: middle;";
      tdMdh.innerHTML = `
        <div style="display: flex; align-items: center; gap: 4px;">
          ${order.orderUrl ? `<a href="${order.orderUrl}" target="_blank" style="color: #0284c7; font-weight: 700; text-decoration: none; font-size: 11px;">${order.orderId}</a>` : `<span style="font-weight: 700; color: #1e293b;">${order.orderId}</span>`}
          <button type="button" class="tab301-btn-copy" data-copy="${order.orderId}" title="Sao chép MDH" style="padding: 1px 4px; font-size: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 3px; cursor: pointer;">📋</button>
        </div>
      `;

      // Mã vận đơn (MVD)
      const tdMvd = document.createElement("td");
      tdMvd.style.cssText = "padding: 6px 8px; vertical-align: middle;";
      if (order.trackingNumber) {
        tdMvd.innerHTML = `
          <div style="display: flex; align-items: center; gap: 4px;">
            <span style="font-family: monospace; font-weight: 700; color: #334155; font-size: 10.5px; word-break: break-all;">${order.trackingNumber}</span>
            <button type="button" class="tab301-btn-copy" data-copy="${order.trackingNumber}" title="Sao chép MVD" style="padding: 1px 4px; font-size: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 3px; cursor: pointer;">📋</button>
          </div>
        `;
      } else {
        tdMvd.innerHTML = `<span style="color: #94a3b8; font-style: italic;">Chưa có</span>`;
      }

      // Vận chuyển
      const tdCarrier = document.createElement("td");
      tdCarrier.style.cssText = "padding: 6px 8px; vertical-align: middle;";
      tdCarrier.innerHTML = `
        <div style="font-weight: 600; color: #475569; font-size: 10.5px;">${order.carrier || '--'}</div>
        ${order.tag ? `<div style="display: inline-block; font-size: 9.5px; padding: 1px 4px; background: #fff1f2; color: #e11d48; border-radius: 3px; border: 1px solid #fecdd3; font-weight: 600; margin-top: 2px;">${order.tag}</div>` : ''}
      `;

      // Người mua / Trạng thái in
      const tdBuyer = document.createElement("td");
      tdBuyer.style.cssText = "padding: 6px 8px; vertical-align: middle;";
      tdBuyer.innerHTML = `
        <div style="color: #1e293b; font-weight: 500;">${order.buyer || '--'}</div>
        ${order.confirmTime ? `<div style="color: #64748b; font-size: 9.5px;">${order.confirmTime}</div>` : ''}
        ${order.printedDocs ? `<div style="color: #15803d; font-size: 9px; margin-top: 1px;">✓ ${order.printedDocs}</div>` : ''}
      `;

      tr.appendChild(tdCheck);
      tr.appendChild(tdImg);
      tr.appendChild(tdMdh);
      tr.appendChild(tdMvd);
      tr.appendChild(tdCarrier);
      tr.appendChild(tdBuyer);

      tbodyEl.appendChild(tr);
    });

    // Gắn sự kiện sao chép
    tbodyEl.querySelectorAll(".tab301-btn-copy").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const text = btn.dataset.copy;
        if (text) {
          navigator.clipboard.writeText(text);
          const orig = btn.textContent;
          btn.textContent = "✓";
          setTimeout(() => { btn.textContent = orig; }, 1000);
        }
      });
    });

    updateSelectedBadge();
  }

  function filterOrdersBySearch() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    if (!q) {
      renderOrders(cachedOrders);
      return;
    }

    const filtered = cachedOrders.filter(o => {
      const mdh = (o.orderId || "").toLowerCase();
      const mvd = (o.trackingNumber || "").toLowerCase();
      const buyer = (o.buyer || "").toLowerCase();
      const carrier = (o.carrier || "").toLowerCase();
      return mdh.includes(q) || mvd.includes(q) || buyer.includes(q) || carrier.includes(q);
    });

    renderOrders(filtered);
  }

  // =========================================================================
  // ACTIONS
  // =========================================================================

  // 1. Mở trang Shopee tab 301
  if (btnOpenShopee) {
    btnOpenShopee.addEventListener("click", async () => {
      try {
        updateStatus("Đang mở trang Tạo phiếu (Tab 301)...");
        await getOrOpenTab301();
        updateStatus("Đã mở trang Shopee Tạo phiếu hàng loạt.", false, true);
      } catch (err) {
        updateStatus("Lỗi mở tab: " + err.message, true);
      }
    });
  }

  // 2. Lọc Đơn (Kho HN + Tất cả trạng thái)
  if (btnFilterHanoi) {
    btnFilterHanoi.addEventListener("click", async () => {
      if (isFiltering) return;
      isFiltering = true;
      btnFilterHanoi.disabled = true;
      if (btnGenerateDoc) btnGenerateDoc.disabled = true;

      updateStatus("🚀 Đang kết nối tới Shopee & Lọc Kho Hà Nội (Tất cả trạng thái)...");

      try {
        const tab = await getOrOpenTab301();
        if (!tab?.id) {
          throw new Error("Không thể mở hoặc kết nối tới tab Shopee.");
        }

        updateStatus("⏳ Đang áp dụng bộ lọc Kho HN, Tất cả ĐVVC, Tất cả Đặt trước, Tất cả Hạn giao hàng...");
        const response = await sendTabMessage(tab.id, { type: "TAB301_APPLY_ALL_FILTERS" });

        if (!response?.ok) {
          throw new Error(response?.message || "Lỗi khi áp dụng bộ lọc trên Shopee.");
        }

        cachedOrders = Array.isArray(response.orders) ? response.orders : [];
        
        // Mặc định chọn tất cả đơn tìm thấy
        selectedOrderIds = new Set(cachedOrders.map(o => o.orderId));

        renderOrders(cachedOrders);
        updateStatus(`✓ ${response.message || `Đã lọc và tải ${cachedOrders.length} đơn hàng!`}`, false, true);
      } catch (err) {
        updateStatus("❌ " + (err?.message || "Lỗi xử lý lọc đơn"), true);
      } finally {
        isFiltering = false;
        btnFilterHanoi.disabled = false;
        if (btnGenerateDoc) btnGenerateDoc.disabled = false;
      }
    });
  }

  // 3. Đọc lại bảng đơn hiện tại
  if (btnRefreshTable) {
    btnRefreshTable.addEventListener("click", async () => {
      try {
        updateStatus("Đang đọc lại danh sách đơn hàng từ Shopee...");
        const tab = await getOrOpenTab301();
        if (!tab?.id) throw new Error("Chưa mở tab Shopee.");

        const response = await sendTabMessage(tab.id, { type: "TAB301_GET_ORDERS" });
        if (!response?.ok) throw new Error(response?.message || "Không đọc được đơn hàng.");

        cachedOrders = Array.isArray(response.orders) ? response.orders : [];
        // Giữ lại các ID đang được chọn
        const newSelected = new Set();
        cachedOrders.forEach(o => {
          if (selectedOrderIds.has(o.orderId) || o.isChecked) {
            newSelected.add(o.orderId);
          }
        });
        if (newSelected.size === 0 && cachedOrders.length > 0) {
          cachedOrders.forEach(o => newSelected.add(o.orderId));
        }
        selectedOrderIds = newSelected;

        renderOrders(cachedOrders);
        updateStatus(`✓ Đã đọc được ${cachedOrders.length} đơn hàng.`, false, true);
      } catch (err) {
        updateStatus("❌ Lỗi: " + err.message, true);
      }
    });
  }

  // 4. Tạo Phiếu Đã Chọn
  if (btnGenerateDoc) {
    btnGenerateDoc.addEventListener("click", async () => {
      if (isGenerating) return;

      const orderIdsToProcess = Array.from(selectedOrderIds);
      if (orderIdsToProcess.length === 0) {
        alert("Vui lòng tích chọn ít nhất 1 đơn hàng trong bảng để tạo phiếu!");
        return;
      }

      isGenerating = true;
      btnGenerateDoc.disabled = true;
      if (btnFilterHanoi) btnFilterHanoi.disabled = true;

      updateStatus(`Đang chọn ${orderIdsToProcess.length} đơn trên web Shopee & bấm 'Tạo phiếu đã chọn'...`);

      try {
        const tab = await getOrOpenTab301();
        if (!tab?.id) throw new Error("Chưa kết nối được tới tab Shopee Tạo phiếu.");

        const response = await sendTabMessage(tab.id, {
          type: "TAB301_SELECT_ORDERS_AND_GENERATE_DOC",
          orderIds: orderIdsToProcess
        });

        if (!response?.ok) {
          throw new Error(response?.message || "Không bấm được nút 'Tạo phiếu đã chọn'.");
        }

        updateStatus(`🎉 ${response.message}`, false, true);
      } catch (err) {
        updateStatus("❌ " + (err?.message || "Lỗi tạo phiếu"), true);
      } finally {
        isGenerating = false;
        btnGenerateDoc.disabled = false;
        if (btnFilterHanoi) btnFilterHanoi.disabled = false;
      }
    });
  }

  // 5. Checkbox Chọn tất cả / Bỏ chọn tất cả
  if (checkboxAll) {
    checkboxAll.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      const rows = tbodyEl ? Array.from(tbodyEl.querySelectorAll(".tab301-order-row")) : [];
      
      rows.forEach(tr => {
        const id = tr.dataset.orderId;
        const chk = tr.querySelector(".tab301-chk-order");
        if (chk) chk.checked = isChecked;
        if (isChecked) {
          if (id) selectedOrderIds.add(id);
          tr.style.backgroundColor = "#f0fdf4";
        } else {
          if (id) selectedOrderIds.delete(id);
          tr.style.backgroundColor = "";
        }
      });

      updateSelectedBadge();
    });
  }

  // 6. Tìm kiếm thời gian thực
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      filterOrdersBySearch();
    });
  }
})();
