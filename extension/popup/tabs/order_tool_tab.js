// =========================================================================
// MODULE: ORDER TOOL — Quản lý trang làm việc (Sheet cai_dat) & Tự động dọn tab
// =========================================================================

(function() {
  const DEFAULT_QUICK_LINKS = [
    { id: "def_order", name: "Đơn hàng (Cần xử lý)", url: "https://banhang.shopee.vn/portal/sale/order?type=toship&source=to_process", enabled: true },
    { id: "def_product", name: "Tất cả sản phẩm (All)", url: "https://banhang.shopee.vn/portal/product/list/live/all?operationSortBy=recommend_v2&page=1&size=48", enabled: true },
    { id: "def_wameli", name: "Wameli (Quản trị)", url: "https://phanmem.wameli.vn/admin/", enabled: true }
  ];

  const STORAGE_QUICK_LINKS = "order_tool_quick_links";
  const STORAGE_KEY = "order_tool_auto_clean_config";
  const STORAGE_LAST_CLEAN = "order_tool_last_clean";
  const STORAGE_NEXT_RUN = "order_tool_next_run_at";

  // State
  let quickLinks = [...DEFAULT_QUICK_LINKS];
  let editingLinkId = null;
  let timerInterval = null;

  let currentConfig = {
    enabled: false,
    keepOrder: true,
    keepActiveTab: true,
    keepTabIds: [],
    keepTabUrls: []
  };

  // DOM Elements
  const statusEl = document.getElementById("order-tool-status");
  const autoBadge = document.getElementById("order-tool-auto-badge");
  const btnToggleAuto = document.getElementById("btn-toggle-auto-clean");
  const btnCleanNow = document.getElementById("btn-clean-tabs-now");
  const timerInfoEl = document.getElementById("order-tool-timer-info");

  const chkKeepOrder = document.getElementById("chk-keep-order");
  const chkKeepActiveTab = document.getElementById("chk-keep-active-tab");

  const openTabsCountEl = document.getElementById("open-tabs-count");
  const openTabsListEl = document.getElementById("open-tabs-list");
  const btnSelectAllTabs = document.getElementById("btn-select-all-tabs");
  const btnDeselectAllTabs = document.getElementById("btn-deselect-all-tabs");
  const btnRefreshOpenTabs = document.getElementById("btn-refresh-open-tabs");

  // Quick Links Elements
  const quickLinksCountEl = document.getElementById("quick-links-count");
  const quickLinksListEl = document.getElementById("quick-links-list");
  const btnOpenAllQuickLinks = document.getElementById("btn-open-all-quick-links");
  const btnToggleAddLink = document.getElementById("btn-toggle-add-link");
  const btnSyncSheetLinks = document.getElementById("btn-sync-sheet-links");

  const addLinkForm = document.getElementById("add-link-form");
  const formLinkTitle = document.getElementById("form-link-title");
  const inputLinkName = document.getElementById("input-link-name");
  const inputLinkUrl = document.getElementById("input-link-url");
  const btnSaveLinkItem = document.getElementById("btn-save-link-item");
  const btnCancelAddLink = document.getElementById("btn-cancel-add-link");

  function showStatus(msg, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.style.color = isError ? "#dc2626" : "#16a34a";
    if (!isError && msg) {
      setTimeout(() => {
        if (statusEl.textContent === msg) statusEl.textContent = "";
      }, 5000);
    }
  }

  function getDomain(urlStr) {
    try {
      const u = new URL(urlStr);
      return u.hostname.replace(/^www\./, "");
    } catch (e) {
      return urlStr.slice(0, 25);
    }
  }

  function getLinkStyle(urlStr) {
    const u = (urlStr || "").toLowerCase();
    if (u.includes("shopee.vn")) {
      return {
        icon: "📦",
        badge: "Shopee",
        bg: "#eff6ff",
        border: "#bfdbfe",
        badgeBg: "#dbeafe",
        badgeColor: "#1d4ed8",
        btnBg: "linear-gradient(135deg, #2563eb, #1d4ed8)"
      };
    }
    if (u.includes("wameli.vn")) {
      return {
        icon: "🏬",
        badge: "Wameli",
        bg: "#ecfdf5",
        border: "#a7f3d0",
        badgeBg: "#d1fae5",
        badgeColor: "#047857",
        btnBg: "linear-gradient(135deg, #059669, #047857)"
      };
    }
    if (u.includes("facebook.com") || u.includes("fb.com") || u.includes("zalo.me")) {
      return {
        icon: "💬",
        badge: getDomain(urlStr),
        bg: "#fdf4ff",
        border: "#f5d0fe",
        badgeBg: "#fae8ff",
        badgeColor: "#a21caf",
        btnBg: "linear-gradient(135deg, #c026d3, #a21caf)"
      };
    }
    return {
      icon: "🌐",
      badge: getDomain(urlStr),
      bg: "#f8fafc",
      border: "#e2e8f0",
      badgeBg: "#f1f5f9",
      badgeColor: "#475569",
      btnBg: "linear-gradient(135deg, #475569, #334155)"
    };
  }

  // Hàm so khớp URL của tab đang mở với một link đã lưu
  function isTabUrlMatchingSavedLink(tabUrl, savedUrl) {
    if (!tabUrl || !savedUrl) return false;
    const tUrl = String(tabUrl).trim();
    const sUrl = String(savedUrl).trim();
    if (tUrl === sUrl) return true;

    try {
      const uTab = new URL(tUrl);
      const uSaved = new URL(sUrl);

      // 1. Phải cùng hostname (bỏ www.)
      const hTab = uTab.hostname.replace(/^www\./, "").toLowerCase();
      const hSaved = uSaved.hostname.replace(/^www\./, "").toLowerCase();
      if (hTab !== hSaved) return false;

      // 2. Google Spreadsheets: so khớp ID bảng tính
      if (hTab.includes("docs.google.com") && uTab.pathname.includes("/spreadsheets/d/")) {
        const matchTab = uTab.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        const matchSaved = uSaved.pathname.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
        if (matchTab && matchSaved && matchTab[1] === matchSaved[1]) {
          return true;
        }
      }

      // 3. Chuẩn hoá pathname (bỏ dấu / ở cuối)
      const pTab = uTab.pathname.replace(/\/+$/, "").toLowerCase();
      const pSaved = uSaved.pathname.replace(/\/+$/, "").toLowerCase();

      // Trang quản trị Wameli: tab trong admin/ coi là khớp
      if (hSaved.includes("wameli.vn") && (pSaved === "/admin" || pSaved.startsWith("/admin/"))) {
        if (pTab === "/admin" || pTab.startsWith("/admin/")) return true;
      }

      // Nếu pathname khác nhau -> khác trang hoàn toàn (VD /portal/sale/order vs /portal/product/list)
      if (pTab !== pSaved) {
        return false;
      }

      // 4. Cùng pathname: kiểm tra tham số quan trọng nếu có (ví dụ type trong Shopee order)
      const sType = uSaved.searchParams.get("type");
      const tType = uTab.searchParams.get("type");
      if (sType && tType && sType.toLowerCase() !== tType.toLowerCase()) {
        return false;
      }

      return true;
    } catch (e) {
      return tUrl.toLowerCase() === sUrl.toLowerCase();
    }
  }

  // 1. Mở hoặc chuyển tab thông minh
  function openOrFocusTab(targetUrl, label) {
    showStatus(`Đang mở ${label}...`);
    chrome.tabs.query({}, (tabs) => {
      const match = tabs.find(t => isTabUrlMatchingSavedLink(t.url, targetUrl));

      if (match) {
        chrome.tabs.update(match.id, { active: true, url: targetUrl }, () => {
          if (chrome.windows?.update && match.windowId) {
            chrome.windows.update(match.windowId, { focused: true });
          }
          showStatus(`Đã chuyển tới tab: ${label}`);
          setTimeout(renderOpenTabs, 400);
        });
      } else {
        chrome.tabs.create({ url: targetUrl, active: true }, () => {
          showStatus(`Đã mở tab mới: ${label}`);
          setTimeout(renderOpenTabs, 500);
        });
      }
    });
  }

  // 2. Mở toàn bộ link làm việc (mở full tất cả các link bên dưới)
  function openAllQuickLinks() {
    const linksToOpen = quickLinks.filter(l => l.enabled !== false);
    const finalLinks = linksToOpen.length > 0 ? linksToOpen : quickLinks;
    if (!finalLinks.length) {
      showStatus("Chưa có link nào trong danh sách bên dưới để mở!", true);
      return;
    }

    showStatus(`Đang mở full ${finalLinks.length} trang làm việc bên dưới...`);
    chrome.tabs.query({}, (tabs) => {
      const usedTabIds = new Set();
      let createdCount = 0;
      let reusedCount = 0;
      let firstTabId = null;

      finalLinks.forEach((item, idx) => {
        const targetUrl = item.url;
        if (!targetUrl) return;

        // Tìm tab hiện có khớp trang này và chưa được gán cho link khác
        const match = tabs.find(t => !usedTabIds.has(t.id) && isTabUrlMatchingSavedLink(t.url, targetUrl));

        if (match) {
          usedTabIds.add(match.id);
          chrome.tabs.update(match.id, { url: targetUrl });
          if (idx === 0) firstTabId = match.id;
          reusedCount++;
        } else {
          // Chưa có tab tương ứng -> tạo tab mới riêng cho link này
          chrome.tabs.create({ url: targetUrl, active: idx === 0 }, (newTab) => {
            if (idx === 0 && newTab) firstTabId = newTab.id;
          });
          createdCount++;
        }
      });

      if (firstTabId) {
        chrome.tabs.update(firstTabId, { active: true }).catch(() => {});
      }

      showStatus(`🚀 Đã mở full ${finalLinks.length} link (${createdCount} tab mới, ${reusedCount} tab đã có)!`);
      setTimeout(renderOpenTabs, 700);
    });
  }

  // 3. Render danh sách Quick Links (kèm nút Bật / Tắt bên trái)
  function renderQuickLinks() {
    if (!quickLinksListEl) return;
    const activeCount = quickLinks.filter(l => l.enabled !== false).length;
    if (quickLinksCountEl) {
      quickLinksCountEl.textContent = `${activeCount}/${quickLinks.length}`;
      quickLinksCountEl.title = `${activeCount} link đang BẬT trên tổng số ${quickLinks.length} link`;
    }

    if (quickLinks.length === 0) {
      quickLinksListEl.innerHTML = `
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center; padding: 12px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">
          Chưa có link làm việc nào.<br>Bấm <b>"+ Thêm"</b> để thêm link mới (sẽ lưu vào Sheet <b>cai_dat</b>).
        </div>
      `;
      return;
    }

    quickLinksListEl.innerHTML = "";

    quickLinks.forEach((item, index) => {
      const isEnabled = item.enabled !== false;
      const style = getLinkStyle(item.url);
      const row = document.createElement("div");
      row.style.cssText = `display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px; background: ${isEnabled ? style.bg : '#f8fafc'}; border: 1px solid ${isEnabled ? style.border : '#e2e8f0'}; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); transition: all 0.15s ease; opacity: ${isEnabled ? '1' : '0.68'};`;

      row.onmouseenter = () => { row.style.boxShadow = "0 2px 5px rgba(0,0,0,0.08)"; };
      row.onmouseleave = () => { row.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)"; };

      // 1. Bên trái nhất: Nút BẬT / TẮT (Toggle switch)
      const toggleLabel = document.createElement("label");
      toggleLabel.title = isEnabled
        ? "Đang BẬT (Bấm để TẮT). Khi bật: Tự động mở khi bấm 'Mở toàn bộ' và được giữ lại khi dọn tab."
        : "Đang TẮT (Bấm để BẬT). Khi tắt: Bỏ qua khi 'Mở toàn bộ' và không được bảo vệ tab.";
      toggleLabel.style.cssText = "position: relative; display: inline-flex; align-items: center; cursor: pointer; flex-shrink: 0; margin: 0; user-select: none; padding: 2px 2px 2px 0;";
      toggleLabel.onclick = (e) => e.stopPropagation();

      const toggleInp = document.createElement("input");
      toggleInp.type = "checkbox";
      toggleInp.checked = isEnabled;
      toggleInp.style.cssText = "opacity: 0; width: 0; height: 0; position: absolute; margin: 0;";

      const toggleTrack = document.createElement("span");
      toggleTrack.style.cssText = `position: relative; width: 30px; height: 17px; background-color: ${isEnabled ? "#10b981" : "#cbd5e1"}; border-radius: 999px; transition: all 0.2s ease; display: inline-block; box-shadow: inset 0 1px 2px rgba(0,0,0,0.15);`;

      const toggleThumb = document.createElement("span");
      toggleThumb.style.cssText = `position: absolute; top: 2px; left: ${isEnabled ? "15px" : "2px"}; width: 13px; height: 13px; background-color: white; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: all 0.2s ease;`;

      toggleTrack.appendChild(toggleThumb);
      toggleLabel.appendChild(toggleInp);
      toggleLabel.appendChild(toggleTrack);

      toggleInp.onchange = (e) => {
        e.stopPropagation();
        const nextState = toggleInp.checked;
        item.enabled = nextState;
        persistQuickLinks(true);
        renderQuickLinks();
        renderOpenTabs();
        showStatus(nextState ? `🟢 Đã BẬT link "${item.name}"!` : `⚪ Đã TẮT link "${item.name}"!`);
      };

      // 2. Phần thông tin giữa: Icon, Tên, Badge
      const mid = document.createElement("div");
      mid.style.cssText = "display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0; cursor: pointer;";
      mid.title = `Bấm để mở: ${item.name}\n${item.url}`;
      mid.onclick = () => openOrFocusTab(item.url, item.name);

      const iconSpan = document.createElement("span");
      iconSpan.textContent = style.icon;
      iconSpan.style.cssText = `font-size: 13px; flex-shrink: 0; ${isEnabled ? '' : 'filter: grayscale(1);'}`;

      const infoCol = document.createElement("div");
      infoCol.style.cssText = "display: flex; flex-direction: column; min-width: 0; flex: 1;";

      const nameRow = document.createElement("div");
      nameRow.style.cssText = "display: flex; align-items: center; gap: 4px; min-width: 0;";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = item.name;
      nameSpan.style.cssText = `font-size: 11px; font-weight: 700; color: ${isEnabled ? '#0f172a' : '#64748b'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.25;`;
      nameRow.appendChild(nameSpan);

      if (!isEnabled) {
        const offBadge = document.createElement("span");
        offBadge.textContent = "TẮT";
        offBadge.style.cssText = "font-size: 8px; font-weight: 700; color: #64748b; background: #e2e8f0; padding: 1px 4px; border-radius: 3px; line-height: 11px; flex-shrink: 0;";
        nameRow.appendChild(offBadge);
      }

      const domainSpan = document.createElement("span");
      domainSpan.textContent = style.badge;
      domainSpan.style.cssText = `font-size: 9px; color: ${isEnabled ? style.badgeColor : '#94a3b8'}; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;

      infoCol.appendChild(nameRow);
      infoCol.appendChild(domainSpan);

      mid.appendChild(iconSpan);
      mid.appendChild(infoCol);

      // 3. Bên phải: Nút Mở, Sửa, Xóa
      const right = document.createElement("div");
      right.style.cssText = "display: flex; align-items: center; gap: 4px; flex-shrink: 0;";

      const btnOpen = document.createElement("button");
      btnOpen.type = "button";
      btnOpen.textContent = "↗ Mở";
      btnOpen.title = `Mở ${item.name}`;
      btnOpen.style.cssText = `width: auto; height: 23px; padding: 0 8px; font-size: 10px; font-weight: 700; background: ${isEnabled ? style.btnBg : '#94a3b8'}; color: white; border: none; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;`;
      btnOpen.onclick = (e) => {
        e.stopPropagation();
        openOrFocusTab(item.url, item.name);
      };

      const btnEdit = document.createElement("button");
      btnEdit.type = "button";
      btnEdit.textContent = "✏️";
      btnEdit.title = "Sửa tên hoặc link";
      btnEdit.style.cssText = "width: 23px; height: 23px; padding: 0; font-size: 10px; background: white; color: #334155; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;";
      btnEdit.onclick = (e) => {
        e.stopPropagation();
        startEditLink(item);
      };

      const btnDelete = document.createElement("button");
      btnDelete.type = "button";
      btnDelete.textContent = "🗑️";
      btnDelete.title = "Xóa link này";
      btnDelete.style.cssText = "width: 23px; height: 23px; padding: 0; font-size: 10px; background: white; color: #dc2626; border: 1px solid #fca5a5; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;";
      btnDelete.onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Xóa link "${item.name}" khỏi danh sách và Sheet cai_dat?`)) {
          deleteLink(item.id);
        }
      };

      right.appendChild(btnOpen);
      right.appendChild(btnEdit);
      right.appendChild(btnDelete);

      row.appendChild(toggleLabel);
      row.appendChild(mid);
      row.appendChild(right);
      quickLinksListEl.appendChild(row);
    });
  }

  // 4. Quản lý Thêm / Sửa / Xóa link & Đồng bộ Sheet cai_dat
  function startEditLink(item) {
    editingLinkId = item.id;
    if (formLinkTitle) formLinkTitle.textContent = `✏️ Sửa link: "${item.name}"`;
    if (inputLinkName) inputLinkName.value = item.name;
    if (inputLinkUrl) inputLinkUrl.value = item.url;
    if (addLinkForm) addLinkForm.style.display = "block";
    inputLinkName?.focus();
  }

  function resetLinkForm() {
    editingLinkId = null;
    if (formLinkTitle) formLinkTitle.textContent = "➕ Thêm link mới (Lưu Sheet cai_dat)";
    if (inputLinkName) inputLinkName.value = "";
    if (inputLinkUrl) inputLinkUrl.value = "";
    if (addLinkForm) addLinkForm.style.display = "none";
  }

  function saveLinkItem() {
    const rawName = (inputLinkName?.value || "").trim();
    let rawUrl = (inputLinkUrl?.value || "").trim();

    if (!rawName) {
      alert("Vui lòng nhập Tên trang làm việc!");
      inputLinkName?.focus();
      return;
    }
    if (!rawUrl) {
      alert("Vui lòng nhập Đường dẫn link / URL!");
      inputLinkUrl?.focus();
      return;
    }

    // Tự động thêm https:// nếu thiếu
    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = "https://" + rawUrl;
    }

    if (editingLinkId) {
      const idx = quickLinks.findIndex(l => l.id === editingLinkId);
      if (idx !== -1) {
        quickLinks[idx].name = rawName;
        quickLinks[idx].url = rawUrl;
        if (quickLinks[idx].enabled === undefined) {
          quickLinks[idx].enabled = true;
        }
      }
      showStatus(`✔ Đã cập nhật link "${rawName}"!`);
    } else {
      quickLinks.push({
        id: "link_" + Date.now(),
        name: rawName,
        url: rawUrl,
        enabled: true
      });
      showStatus(`✔ Đã thêm link mới "${rawName}"!`);
    }

    resetLinkForm();
    renderQuickLinks();
    persistQuickLinks(true);
  }

  function deleteLink(linkId) {
    quickLinks = quickLinks.filter(l => l.id !== linkId);
    renderQuickLinks();
    persistQuickLinks(true);
    showStatus("Đã xóa link khỏi danh sách!");
  }

  let currentShop = "";

  function getActiveShop(cb) {
    if (currentShop) {
      if (cb) cb(currentShop);
      return;
    }
    chrome.storage.local.get(["maGian", "dhHoanTextValue"], (st) => {
      currentShop = String(st.maGian || st.dhHoanTextValue || "").trim();
      if (cb) cb(currentShop);
    });
  }

  function updateShopSelectOptions() {
    const select = document.getElementById("quick-links-shop-select");
    if (!select) return;

    chrome.storage.local.get(["maGian", "dhHoanTextValue", "gianLinks"], (st) => {
      const activeShop = String(currentShop || st.maGian || st.dhHoanTextValue || "").trim();
      currentShop = activeShop;

      const datalist = document.getElementById("gian-suggestions");
      const listFromDatalist = datalist ? Array.from(datalist.querySelectorAll("option")).map(o => o.value.trim()).filter(Boolean) : [];
      const listFromGianLinks = Object.keys(st.gianLinks || {});
      const allShops = Array.from(new Set([...listFromDatalist, ...listFromGianLinks, activeShop])).filter(Boolean);

      select.innerHTML = "";
      if (allShops.length === 0) {
        const opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Chung (Mặc định)";
        select.appendChild(opt);
      } else {
        allShops.forEach(s => {
          const opt = document.createElement("option");
          opt.value = s;
          opt.textContent = s;
          if (activeShop && s.toLowerCase() === activeShop.toLowerCase()) {
            opt.selected = true;
          }
          select.appendChild(opt);
        });
      }
    });
  }

  function persistQuickLinks(syncSheet = false) {
    getActiveShop((shop) => {
      // 1. Lưu local cache ngay lập tức (cả cache chung và cache theo shop)
      chrome.storage.local.set({
        [STORAGE_QUICK_LINKS]: quickLinks,
        [`${STORAGE_QUICK_LINKS}_${shop || "default"}`]: quickLinks
      });

      // 2. Đồng bộ lên Google Sheet cai_dat (cột link_mo theo dạng JSON, mỗi shop 1 dòng)
      if (syncSheet) {
        showStatus(`Đang lưu vào cột link_mo cho shop [${shop || "Chung"}]...`);
        chrome.runtime.sendMessage({
          type: "SAVE_CAI_DAT_QUICK_LINKS",
          links: quickLinks,
          maGian: shop
        }, (res) => {
          if (res && res.ok) {
            showStatus(`✅ Đã lưu ${quickLinks.length} link vào cột link_mo (shop: ${shop || "Chung"}, dòng ${res.row || ""})!`);
          } else {
            showStatus("Lưu cục bộ OK (Chưa đồng bộ Sheet: " + (res?.error || "Không phản hồi") + ")", true);
          }
        });
      }
    });
  }

  function fetchQuickLinksFromSheet(showToast = false) {
    getActiveShop((shop) => {
      if (showToast) showStatus(`Đang tải link_mo từ Sheet cho shop [${shop || "Chung"}]...`);

      chrome.runtime.sendMessage({
        type: "FETCH_CAI_DAT_QUICK_LINKS",
        maGian: shop
      }, (res) => {
        if (res && res.ok && Array.isArray(res.links) && res.links.length > 0) {
          quickLinks = res.links;
          chrome.storage.local.set({
            [STORAGE_QUICK_LINKS]: quickLinks,
            [`${STORAGE_QUICK_LINKS}_${shop || "default"}`]: quickLinks
          });
          renderQuickLinks();
          if (showToast) showStatus(`✅ Đã đồng bộ ${quickLinks.length} link của shop [${shop || "Chung"}] từ cột link_mo!`);
        } else {
          // Nếu chưa có link nào trong cột link_mo của shop này, đọc từ cache hoặc khởi tạo mặc định
          chrome.storage.local.get([`${STORAGE_QUICK_LINKS}_${shop || "default"}`], (subSt) => {
            const cached = subSt[`${STORAGE_QUICK_LINKS}_${shop || "default"}`];
            if (Array.isArray(cached) && cached.length > 0) {
              quickLinks = cached;
            } else if (!quickLinks.length) {
              quickLinks = [...DEFAULT_QUICK_LINKS];
            }
            chrome.storage.local.set({ [STORAGE_QUICK_LINKS]: quickLinks });
            renderQuickLinks();
            if (showToast) showStatus(`Chưa có link_mo cho shop [${shop || "Chung"}]. Đã khởi tạo mẫu.`);
            persistQuickLinks(true);
          });
        }
      });
    });
  }

  // Expose global sync function
  window.syncQuickLinksFromSheet = fetchQuickLinksFromSheet;
  window.updateOrderToolShopSelect = updateShopSelectOptions;

  // Tự động đồng bộ lại khi ID sheet hoặc mã shop thay đổi
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local") {
      if (changes.customSpreadsheetId) {
        updateShopSelectOptions();
        fetchQuickLinksFromSheet(false);
      }
      if (changes.maGian || changes.dhHoanTextValue) {
        const nextShop = String(changes.maGian?.newValue || changes.dhHoanTextValue?.newValue || "").trim();
        if (nextShop && nextShop !== currentShop) {
          currentShop = nextShop;
          updateShopSelectOptions();
          fetchQuickLinksFromSheet(false);
        }
      }
    }
  });

  // Khởi động Quick Links
  function initQuickLinks() {
    updateShopSelectOptions();

    chrome.storage.local.get([STORAGE_QUICK_LINKS, "maGian", "dhHoanTextValue"], (st) => {
      currentShop = String(st.maGian || st.dhHoanTextValue || "").trim();
      if (Array.isArray(st[STORAGE_QUICK_LINKS]) && st[STORAGE_QUICK_LINKS].length > 0) {
        quickLinks = st[STORAGE_QUICK_LINKS];
        renderQuickLinks();
      } else {
        quickLinks = [...DEFAULT_QUICK_LINKS];
        renderQuickLinks();
      }
      // Đồng bộ ngầm từ Sheet cai_dat cột link_mo
      fetchQuickLinksFromSheet(false);
    });

    const shopSelect = document.getElementById("quick-links-shop-select");
    if (shopSelect) {
      shopSelect.addEventListener("change", (e) => {
        currentShop = e.target.value.trim();
        chrome.storage.local.set({ maGian: currentShop, dhHoanTextValue: currentShop });
        fetchQuickLinksFromSheet(true);
      });
    }

    btnOpenAllQuickLinks?.addEventListener("click", openAllQuickLinks);
    btnToggleAddLink?.addEventListener("click", () => {
      if (addLinkForm.style.display === "none") {
        resetLinkForm();
        addLinkForm.style.display = "block";
        inputLinkName?.focus();
      } else {
        resetLinkForm();
      }
    });
    btnCancelAddLink?.addEventListener("click", resetLinkForm);
    btnSaveLinkItem?.addEventListener("click", saveLinkItem);
    btnSyncSheetLinks?.addEventListener("click", () => fetchQuickLinksFromSheet(true));

    inputLinkUrl?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveLinkItem();
      if (e.key === "Escape") resetLinkForm();
    });
    inputLinkName?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") inputLinkUrl?.focus();
      if (e.key === "Escape") resetLinkForm();
    });
  }

  // Nút Seller Hub nội bộ
  const PAGE_TO_MODULE = { "app.html": "order-shopee", "wameli.html": "order-wml" };
  function openHubPage(page) {
    if (typeof window.openSellerHub === "function") {
      return window.openSellerHub(PAGE_TO_MODULE[page] || "order-shopee");
    }
    const fullUrl = chrome.runtime.getURL(`extension/order-tool/${page}`);
    return chrome.tabs.create({ url: fullUrl, active: true });
  }

  document.getElementById("btn-order-tool-open")?.addEventListener("click", () => openHubPage("app.html"));
  document.getElementById("btn-order-tool-wameli")?.addEventListener("click", () => openHubPage("wameli.html"));

  // 5. Lưu cấu hình dọn tab
  function saveConfig(cb) {
    chrome.storage.local.set({ [STORAGE_KEY]: currentConfig }, () => {
      if (cb) cb();
    });
  }

  // 6. Kiểm tra xem tab có được giữ bởi quy tắc không
  function isTabProtectedByRule(tab, cfg) {
    const url = tab.url || tab.pendingUrl || "";
    if (url.startsWith("chrome-extension://") || url.startsWith("chrome://") || url.startsWith("edge://") || url.startsWith("about:") || tab.pinned) {
      return { protected: true, reason: "Ghim / Hệ thống" };
    }
    if (cfg.keepActiveTab && tab.active) {
      return { protected: true, reason: "Đang xem" };
    }

    // Chỉ bảo vệ các tab khớp chính xác với link đã lưu bên dưới (đang BẬT)
    if (cfg.keepOrder !== false) {
      for (const item of quickLinks) {
        if (!item || !item.url || item.enabled === false) continue;
        if (isTabUrlMatchingSavedLink(url, item.url)) {
          return { protected: true, reason: item.name || "Link đã lưu" };
        }
      }
    }

    return { protected: false, reason: "" };
  }

  // 7. Render danh sách các tab đang mở
  function renderOpenTabs() {
    if (!openTabsListEl) return;
    chrome.tabs.query({}, (tabs) => {
      if (chrome.runtime.lastError || !tabs) {
        openTabsListEl.innerHTML = `<div style="font-size: 10px; color: #dc2626; text-align: center; padding: 6px;">Không thể đọc danh sách tab.</div>`;
        return;
      }

      const myExtId = chrome.runtime.id;
      const displayTabs = tabs.filter(t => {
        const u = t.url || "";
        return !(u.includes(myExtId) && u.includes("popup.html"));
      });

      if (openTabsCountEl) openTabsCountEl.textContent = String(displayTabs.length);

      if (displayTabs.length === 0) {
        openTabsListEl.innerHTML = `<div style="font-size: 10px; color: #64748b; text-align: center; padding: 6px;">Không có tab nào đang mở.</div>`;
        return;
      }

      openTabsListEl.innerHTML = "";

      displayTabs.forEach(tab => {
        const row = document.createElement("div");
        row.style.cssText = "display: flex; align-items: center; justify-content: space-between; gap: 6px; padding: 4px 6px; background: white; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 10.5px;";

        const left = document.createElement("div");
        left.style.cssText = "display: flex; align-items: center; gap: 5px; flex: 1; min-width: 0;";

        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.style.cssText = "accent-color: #2563eb; cursor: pointer; flex-shrink: 0; margin: 0;";

        const ruleCheck = isTabProtectedByRule(tab, currentConfig);
        const isExplicitlyKept = (currentConfig.keepTabIds || []).includes(tab.id) || (currentConfig.keepTabUrls || []).includes(tab.url);

        chk.checked = ruleCheck.protected || isExplicitlyKept;

        chk.addEventListener("change", () => {
          let tabIds = Array.isArray(currentConfig.keepTabIds) ? [...currentConfig.keepTabIds] : [];
          let tabUrls = Array.isArray(currentConfig.keepTabUrls) ? [...currentConfig.keepTabUrls] : [];

          if (chk.checked) {
            if (!tabIds.includes(tab.id)) tabIds.push(tab.id);
            if (tab.url && !tabUrls.includes(tab.url)) tabUrls.push(tab.url);
          } else {
            tabIds = tabIds.filter(id => id !== tab.id);
            if (tab.url) tabUrls = tabUrls.filter(u => u !== tab.url);
          }
          currentConfig.keepTabIds = tabIds;
          currentConfig.keepTabUrls = tabUrls;
          saveConfig();
        });

        const icon = document.createElement("img");
        icon.src = tab.favIconUrl || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='7' fill='%2394a3b8'/></svg>";
        icon.style.cssText = "width: 13px; height: 13px; border-radius: 2px; flex-shrink: 0; object-fit: contain;";
        icon.onerror = () => {
          icon.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='7' fill='%2394a3b8'/></svg>";
        };

        const titleSpan = document.createElement("span");
        titleSpan.textContent = tab.title || tab.url || "Tab " + tab.id;
        titleSpan.title = `${tab.title || ""}\n${tab.url || ""}`;
        titleSpan.style.cssText = "white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #1e293b; font-weight: 500; font-size: 10px;";

        left.appendChild(chk);
        left.appendChild(icon);
        left.appendChild(titleSpan);

        const badgeWrap = document.createElement("div");
        badgeWrap.style.cssText = "display: flex; gap: 3px; align-items: center; flex-shrink: 0;";

        if (tab.active) {
          const b = document.createElement("span");
          b.textContent = "Đang xem";
          b.style.cssText = "font-size: 8.5px; padding: 1px 4px; background: #dbeafe; color: #1d4ed8; border-radius: 3px; font-weight: 700;";
          badgeWrap.appendChild(b);
        }

        if (tab.pinned) {
          const b = document.createElement("span");
          b.textContent = "Ghim";
          b.style.cssText = "font-size: 8.5px; padding: 1px 4px; background: #fef3c7; color: #b45309; border-radius: 3px; font-weight: 700;";
          badgeWrap.appendChild(b);
        } else if (ruleCheck.protected && !tab.active) {
          const b = document.createElement("span");
          b.textContent = ruleCheck.reason;
          b.style.cssText = "font-size: 8.5px; padding: 1px 4px; background: #ecfdf5; color: #047857; border-radius: 3px; font-weight: 600; max-width: 85px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";
          badgeWrap.appendChild(b);
        }

        row.appendChild(left);
        row.appendChild(badgeWrap);
        openTabsListEl.appendChild(row);
      });
    });
  }

  // 8. Cập nhật UI trạng thái Bật/Tắt và Bộ đếm giờ
  function updateUIState(resData) {
    const isEnabled = !!(resData && resData.enabled);
    currentConfig.enabled = isEnabled;

    if (autoBadge) {
      if (isEnabled) {
        autoBadge.textContent = "🟢 Tự động: BẬT";
        autoBadge.style.background = "#dcfce7";
        autoBadge.style.color = "#15803d";
        autoBadge.style.borderColor = "#86efac";
      } else {
        autoBadge.textContent = "⚪ Tự động: TẮT";
        autoBadge.style.background = "#f1f5f9";
        autoBadge.style.color = "#64748b";
        autoBadge.style.borderColor = "#cbd5e1";
      }
    }

    if (btnToggleAuto) {
      if (isEnabled) {
        btnToggleAuto.innerHTML = `<span>🛑 Tắt Tự Động (Đang chạy)</span>`;
        btnToggleAuto.style.background = "#ef4444";
        btnToggleAuto.style.borderColor = "#dc2626";
      } else {
        btnToggleAuto.innerHTML = `<span>⚡ Bật Tự Động (30 phút)</span>`;
        btnToggleAuto.style.background = "#16a34a";
        btnToggleAuto.style.borderColor = "#15803d";
      }
    }

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    function refreshTimerDisplay() {
      chrome.storage.local.get([STORAGE_NEXT_RUN, STORAGE_LAST_CLEAN], (store) => {
        const nextRunAt = store[STORAGE_NEXT_RUN];
        const lastClean = store[STORAGE_LAST_CLEAN];

        let lastCleanText = "";
        if (lastClean && lastClean.time) {
          const dateStr = new Date(lastClean.time).toLocaleTimeString("vi-VN");
          lastCleanText = `<br><span style="color: #64748b; font-size: 9px;">• Đợt dọn gần nhất: <b>${dateStr}</b> (đã đóng <b>${lastClean.closedCount || 0}</b> tab, giữ <b>${lastClean.remainingCount || 0}</b> tab)</span>`;
        }

        if (!isEnabled || !nextRunAt) {
          if (timerInfoEl) {
            timerInfoEl.innerHTML = `⚪ <b>Trạng thái:</b> Đang tắt tự động.${lastCleanText}`;
          }
          return;
        }

        const diffMs = nextRunAt - Date.now();
        if (diffMs <= 0) {
          if (timerInfoEl) {
            timerInfoEl.innerHTML = `⚡ <b>Trạng thái:</b> Đang tiến hành dọn dẹp các tab thừa...${lastCleanText}`;
          }
        } else {
          const totalSec = Math.floor(diffMs / 1000);
          const mins = Math.floor(totalSec / 60);
          const secs = totalSec % 60;
          const nextTimeStr = new Date(nextRunAt).toLocaleTimeString("vi-VN");
          if (timerInfoEl) {
            timerInfoEl.innerHTML = `🟢 <b>Tự động 30 phút đang BẬT</b><br>⏳ Đợt dọn tiếp theo sau: <b>${mins} phút ${secs < 10 ? '0' : ''}${secs} giây</b> (lúc ${nextTimeStr})${lastCleanText}`;
          }
        }
      });
    }

    refreshTimerDisplay();
    if (isEnabled) {
      timerInterval = setInterval(refreshTimerDisplay, 1000);
    }
  }

  // 9. Lấy trạng thái từ Background
  function fetchStatusFromBackground() {
    chrome.runtime.sendMessage({ type: "ORDER_TOOL_GET_STATUS" }, (res) => {
      if (chrome.runtime.lastError || !res) {
        chrome.storage.local.get([STORAGE_KEY], (st) => {
          if (st[STORAGE_KEY]) {
            currentConfig = Object.assign(currentConfig, st[STORAGE_KEY]);
            syncCheckboxesWithConfig();
            updateUIState({ enabled: currentConfig.enabled });
            renderOpenTabs();
          }
        });
        return;
      }

      if (res.config) {
        currentConfig = Object.assign(currentConfig, res.config);
        syncCheckboxesWithConfig();
      }
      updateUIState(res);
      renderOpenTabs();
    });
  }

  function syncCheckboxesWithConfig() {
    if (chkKeepOrder) chkKeepOrder.checked = currentConfig.keepOrder !== false;
    if (chkKeepActiveTab) chkKeepActiveTab.checked = currentConfig.keepActiveTab !== false;
  }

  function bindRuleCheckbox(chkEl, key) {
    if (!chkEl) return;
    chkEl.addEventListener("change", () => {
      currentConfig[key] = chkEl.checked;
      saveConfig(() => {
        renderOpenTabs();
        showStatus("Đã lưu quy tắc giữ tab.");
      });
    });
  }

  bindRuleCheckbox(chkKeepOrder, "keepOrder");
  bindRuleCheckbox(chkKeepActiveTab, "keepActiveTab");

  // Nút Bật/Tắt tự động
  btnToggleAuto?.addEventListener("click", () => {
    const nextState = !currentConfig.enabled;
    showStatus(nextState ? "Đang bật tự động (chu kỳ 30 phút)..." : "Đang tắt tự động...");
    chrome.runtime.sendMessage({
      type: "ORDER_TOOL_TOGGLE_AUTO_CLEAN",
      enabled: nextState
    }, (res) => {
      if (chrome.runtime.lastError || !res || !res.ok) {
        showStatus("Lỗi kết nối tới background worker: " + (chrome.runtime.lastError?.message || ""), true);
        return;
      }
      currentConfig.enabled = res.enabled;
      updateUIState(res);
      showStatus(res.enabled ? "✅ Đã bật tự động dọn tab sau mỗi 30 phút!" : "Đã tắt tự động dọn tab.");
    });
  });

  // Nút Dọn ngay
  btnCleanNow?.addEventListener("click", () => {
    btnCleanNow.disabled = true;
    btnCleanNow.textContent = "⏳ Đang dọn...";
    showStatus("Đang dọn dẹp các tab thừa theo quy tắc...");

    chrome.runtime.sendMessage({ type: "ORDER_TOOL_TRIGGER_CLEAN_NOW" }, (res) => {
      btnCleanNow.disabled = false;
      btnCleanNow.textContent = "🧹 Dọn ngay";

      if (chrome.runtime.lastError || !res) {
        showStatus("Lỗi dọn dẹp: " + (chrome.runtime.lastError?.message || "Không phản hồi"), true);
        return;
      }

      if (res.error) {
        showStatus("Lỗi: " + res.error, true);
        return;
      }

      showStatus(`✅ Dọn xong: Đã đóng ${res.closedCount || 0} tab thừa, giữ lại ${res.remainingCount || 0} tab!`);
      renderOpenTabs();
      fetchStatusFromBackground();
    });
  });

  // Chọn hết / Bỏ hết / Làm mới danh sách tab
  btnSelectAllTabs?.addEventListener("click", () => {
    chrome.tabs.query({}, (tabs) => {
      const ids = tabs.map(t => t.id).filter(Boolean);
      const urls = tabs.map(t => t.url).filter(Boolean);
      currentConfig.keepTabIds = ids;
      currentConfig.keepTabUrls = urls;
      saveConfig(() => {
        renderOpenTabs();
        showStatus("Đã chọn giữ lại tất cả các tab đang mở.");
      });
    });
  });

  btnDeselectAllTabs?.addEventListener("click", () => {
    currentConfig.keepTabIds = [];
    currentConfig.keepTabUrls = [];
    saveConfig(() => {
      renderOpenTabs();
      showStatus("Đã bỏ chọn các tab riêng lẻ.");
    });
  });

  btnRefreshOpenTabs?.addEventListener("click", () => {
    renderOpenTabs();
    showStatus("Đã làm mới danh sách tab.");
  });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "ORDER_TOOL_AUTO_CLEAN_DONE") {
      renderOpenTabs();
      fetchStatusFromBackground();
      showStatus(`Tự động dọn hoàn tất: Đã đóng ${msg.result?.closedCount || 0} tab.`);
    }
  });

  // Khởi chạy
  initQuickLinks();
  fetchStatusFromBackground();
})();
