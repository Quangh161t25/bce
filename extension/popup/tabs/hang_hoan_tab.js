(function() {
    const btnRead = document.getElementById('btn-read-hang-hoan');
    const tbody = document.getElementById('hang-hoan-tbody');
    
    // Filters state
    let activeInfoFilter = 'ALL'; // 'ALL', 'NO', 'YES'
    let activeReturnFilter = 'ALL'; // 'ALL', 'YES', 'NO'
    let allHangHoanData = [];

    function ensureContentScriptInjected(tabId, callback) {
        chrome.tabs.sendMessage(tabId, { type: "PING" }, (res) => {
            if (chrome.runtime.lastError || !res || !res.ok) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["extension/lib/xlsx.full.min.js", "extension/content/content.js"]
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Lỗi inject script:", chrome.runtime.lastError);
                        callback(false);
                    } else {
                        setTimeout(() => callback(true), 150);
                    }
                });
            } else {
                callback(true);
            }
        });
    }

    function renderHangHoanTable() {
        if (!tbody) return;
        
        let filtered = allHangHoanData;

        // 1. Filter by hhBhInfo (Thẻ thông tin)
        if (activeInfoFilter === 'NO') {
            filtered = filtered.filter(item => !item.hhBhInfo || item.hhBhInfo === 'Chưa có');
        } else if (activeInfoFilter === 'YES') {
            filtered = filtered.filter(item => item.hhBhInfo && item.hhBhInfo !== 'Chưa có');
        }

        // 2. Filter by returnId (Mã YC trả hàng)
        if (activeReturnFilter === 'YES') {
            filtered = filtered.filter(item => item.returnId && item.returnId !== '-');
        } else if (activeReturnFilter === 'NO') {
            filtered = filtered.filter(item => !item.returnId || item.returnId === '-');
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="padding: 10px; text-align: center; color: #64748b;">Không tìm thấy dữ liệu phù hợp.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        filtered.forEach(item => {
            const tr = document.createElement('tr');
            
            // hhBhStyle formatting
            let hhBhStyle = "";
            let hhBhContent = item.hhBhInfo || 'Chưa có';
            if (hhBhContent !== 'Chưa có') {
                hhBhStyle = "background-color: #e2f0d9; color: #155724; font-weight: bold; border: 1px solid #c3e6cb; padding: 2px 6px; border-radius: 4px; display: inline-block; font-size: 10px; word-break: break-word;";
            } else {
                hhBhStyle = "color: #7f8c8d; font-style: italic;";
            }

            // Render product images and names
            let productsHtml = '';
            if (item.products && item.products.length > 0) {
                item.products.forEach(p => {
                    productsHtml += `
                        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
                            ${p.imgUrl ? `<img src="${p.imgUrl}" style="width: 40px; height: 40px; border-radius: 4px; border: 1px solid #cbd5e1; object-fit: cover; flex: 0 0 auto;">` : ''}
                            <div style="font-weight: 500; font-size: 11px; line-height: 1.3; color: #1e293b; word-break: break-word;">${p.pName || '-'}</div>
                        </div>
                    `;
                });
            } else {
                productsHtml = '-';
            }

            tr.innerHTML = `
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 190px; min-width: 190px;">${productsHtml}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: 500; width: 110px; min-width: 110px; vertical-align: top;">
                    <div>${item.orderId || '-'}</div>
                    ${item.udCtInfo ? `<div style="margin-top: 4px; padding: 2px 4px; background: #22c55e; color: white; border-radius: 3px; font-size: 10px; line-height: 1.2; word-break: break-word;" title="Hàng xuất kho (UD_CT)">${item.udCtInfo}</div>` : ''}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #475569; width: 110px; min-width: 110px; vertical-align: top;">${item.returnId || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #475569; width: 120px; min-width: 120px; vertical-align: top;">${item.trackingNum || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 11px; line-height: 1.3; width: 120px; min-width: 120px; vertical-align: top;">${item.solutionText || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 10px; line-height: 1.3; width: 150px; min-width: 150px; vertical-align: top;">${item.statusText || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 10px; line-height: 1.3; width: 150px; min-width: 150px; vertical-align: top;">${item.returnLogistics || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; width: 140px; min-width: 140px; vertical-align: top;"><span style="${hhBhStyle}">${hhBhContent}</span></td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 11px; line-height: 1.3; width: 130px; min-width: 130px; vertical-align: top;">${item.reasonText || '-'}</td>
            `;

            tbody.appendChild(tr);
        });
    }

    // Set up filter buttons click handlers
    function setupFilterButtons() {
        const infoBtns = document.querySelectorAll('.filter-info-btn');
        const returnBtns = document.querySelectorAll('.filter-return-btn');

        infoBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                infoBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'white';
                    b.style.color = '#475569';
                });
                btn.classList.add('active');
                btn.style.background = '#6366f1';
                btn.style.color = 'white';

                activeInfoFilter = btn.getAttribute('data-val');
                renderHangHoanTable();
            });
        });

        returnBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                returnBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'white';
                    b.style.color = '#475569';
                });
                btn.classList.add('active');
                btn.style.background = '#6366f1';
                btn.style.color = 'white';

                activeReturnFilter = btn.getAttribute('data-val');
                renderHangHoanTable();
            });
        });
    }

    setupFilterButtons();

    if (btnRead) {
        btnRead.addEventListener('click', () => {
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="9" style="padding: 10px; text-align: center; color: #64748b;">Đang đọc dữ liệu từ trang Shopee...</td></tr>';

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                if (!activeTab) {
                    tbody.innerHTML = '<tr><td colspan="9" style="padding: 10px; text-align: center; color: red;">Không tìm thấy tab hoạt động.</td></tr>';
                    return;
                }

                // Check URL
                const url = activeTab.url || "";
                const isReturnPage = url.includes("banhang.shopee.vn/portal/sale/return") || url.includes("banhang.shopee.vn/portal/sale/order");

                if (!isReturnPage) {
                    tbody.innerHTML = `<tr><td colspan="9" style="padding: 10px; text-align: center; color: red;">
                        Bạn chưa ở đúng trang Hàng hoàn của Shopee.<br>
                        <button id="btn-open-return-page" type="button" style="width: auto !important; margin-top: 8px; padding: 6px 12px; background: #ee4d2d; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Mở trang Hàng Hoàn Shopee</button>
                    </td></tr>`;

                    const btnOpen = document.getElementById('btn-open-return-page');
                    if (btnOpen) {
                        btnOpen.addEventListener('click', () => {
                            chrome.tabs.create({ url: 'https://banhang.shopee.vn/portal/sale/returnrefundcancel', active: true });
                        });
                    }
                    return;
                }

                ensureContentScriptInjected(activeTab.id, (injected) => {
                    if (!injected) {
                        tbody.innerHTML = '<tr><td colspan="9" style="padding: 10px; text-align: center; color: red;">Không thể kết nối tới trang Shopee (Lỗi tự động tiêm script). Vui lòng F5 tải lại trang Shopee và thử lại.</td></tr>';
                        return;
                    }

                    chrome.tabs.sendMessage(activeTab.id, { type: "READ_HANG_HOAN_LIST" }, (res) => {
                        if (chrome.runtime.lastError) {
                            tbody.innerHTML = '<tr><td colspan="9" style="padding: 10px; text-align: center; color: red;">Không thể kết nối tới trang Shopee. Hãy tải lại trang Shopee Trả hàng/Hoàn tiền và thử lại.</td></tr>';
                            return;
                        }

                        if (res && res.ok && res.data) {
                            allHangHoanData = res.data;
                            renderHangHoanTable();
                        } else {
                            tbody.innerHTML = `<tr><td colspan="9" style="padding: 10px; text-align: center; color: red;">Lỗi đọc dữ liệu: ${res && res.error ? res.error : 'Không phản hồi'}</td></tr>`;
                        }
                    });
                });
            });
        });
    }

    // ---------- 2 NÚT MỞ ĐƠN TRẢ HÀNG & GIAO THẤT BẠI + SẮP XẾP + ĐỌC ĐƠN ----------
    const btnOpenTraHang = document.getElementById('btn-open-tra-hang');
    const btnOpenGiaoThatBai = document.getElementById('btn-open-giao-that-bai');

    function openReturnTabAndSort(targetTab, tabName) {
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="9" style="padding: 14px; text-align: center; color: #2563eb; font-weight: bold;">
            ⏳ Đang chuyển sang [${tabName}] trên Shopee, chọn sắp xếp "Ngày yêu cầu (Mới - Cũ)" và đọc đơn...
        </td></tr>`;

        chrome.tabs.query({}, (tabs) => {
            // 1. Ưu tiên tab Shopee đang active (ngay cạnh sidepanel)
            let targetTabObj = tabs.find(t => t.active && t.url && t.url.includes("banhang.shopee.vn/portal/sale/returnrefundcancel"));
            if (!targetTabObj) {
                targetTabObj = tabs.find(t => t.active && t.url && t.url.includes("banhang.shopee.vn"));
            }
            // 2. Tiếp theo tìm tab returnrefundcancel bất kỳ
            if (!targetTabObj) {
                targetTabObj = tabs.find(t => t.url && t.url.includes("banhang.shopee.vn/portal/sale/returnrefundcancel"));
            }
            // 3. Tab Shopee bất kỳ
            if (!targetTabObj) {
                targetTabObj = tabs.find(t => t.url && t.url.includes("banhang.shopee.vn"));
            }

            if (targetTabObj) {
                chrome.tabs.update(targetTabObj.id, { active: true }, (updatedTab) => {
                    if (chrome.windows?.update && targetTabObj.windowId) {
                        try { chrome.windows.update(targetTabObj.windowId, { focused: true }); } catch (e) {}
                    }
                    const currentUrl = (updatedTab && updatedTab.url) || targetTabObj.url || "";
                    if (!currentUrl.includes("banhang.shopee.vn/portal/sale/returnrefundcancel")) {
                        chrome.tabs.update(targetTabObj.id, { url: "https://banhang.shopee.vn/portal/sale/returnrefundcancel" }, (navTab) => {
                            waitForTabLoad(navTab ? navTab.id : targetTabObj.id, () => {
                                triggerSwitchAndRead(navTab ? navTab.id : targetTabObj.id, targetTab, tabName);
                            });
                        });
                    } else {
                        triggerSwitchAndRead(targetTabObj.id, targetTab, tabName);
                    }
                });
            } else {
                chrome.tabs.create({ url: "https://banhang.shopee.vn/portal/sale/returnrefundcancel", active: true }, (newTab) => {
                    waitForTabLoad(newTab.id, () => {
                        triggerSwitchAndRead(newTab.id, targetTab, tabName);
                    });
                });
            }
        });
    }

    function waitForTabLoad(tabId, cb) {
        const onUpdated = (tid, info) => {
            if (tid === tabId && info.status === "complete") {
                chrome.tabs.onUpdated.removeListener(onUpdated);
                setTimeout(cb, 1000);
            }
        };
        chrome.tabs.onUpdated.addListener(onUpdated);
        setTimeout(() => {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            cb();
        }, 15000);
    }

    function triggerSwitchAndRead(tabId, targetTab, tabName) {
        ensureContentScriptInjected(tabId, (injected) => {
            if (!injected) {
                tbody.innerHTML = `<tr><td colspan="9" style="padding: 10px; text-align: center; color: red;">
                    Không thể kết nối tới trang Shopee. Hãy tải lại (F5) trang Shopee rồi thử lại.
                </td></tr>`;
                return;
            }

            chrome.tabs.sendMessage(tabId, { type: "SWITCH_RETURN_TAB_AND_SORT", targetTab }, { frameId: 0 }, (res) => {
                if (chrome.runtime.lastError || !res) {
                    tbody.innerHTML = `<tr><td colspan="9" style="padding: 10px; text-align: center; color: red;">
                        Lỗi kết nối trang Shopee (${chrome.runtime.lastError?.message || "Không phản hồi"}). Hãy tải lại trang Shopee Trả hàng/Hoàn tiền và thử lại.
                    </td></tr>`;
                    return;
                }

                if (res && res.ok && res.data) {
                    allHangHoanData = res.data;
                    renderHangHoanTable();
                    if (res.data.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="9" style="padding: 14px; text-align: center; color: #64748b;">
                            Đã chuyển sang [<b>${tabName}</b>] (Sắp xếp: Ngày yêu cầu Mới - Cũ) · Hiện không có đơn nào.
                        </td></tr>`;
                    }
                } else {
                    tbody.innerHTML = `<tr><td colspan="9" style="padding: 10px; text-align: center; color: red;">
                        Lỗi: ${res && res.error ? res.error : "Không phản hồi"}
                    </td></tr>`;
                }
            });
        });
    }

    
    const btnOpenLink = document.getElementById('btn-open-link-hang-hoan');
    if (btnOpenLink) {
        btnOpenLink.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'https://banhang.shopee.vn/portal/sale/returnrefundcancel', active: true });
        });
    }

    if (btnOpenTraHang) {
        btnOpenTraHang.addEventListener('click', () => {
            openReturnTabAndSort('tra_hang', 'Đơn Trả hàng Hoàn tiền');
        });
    }

    if (btnOpenGiaoThatBai) {
        btnOpenGiaoThatBai.addEventListener('click', () => {
            openReturnTabAndSort('giao_that_bai', 'Đơn Giao hàng không thành công');
        });
    }

    // Hàm lấy Google Access Token trực tiếp từ Popup (fallback an toàn tuyệt đối nếu background bị mất kết nối)
    async function getDirectGoogleToken() {
        if (typeof getGoogleAccessToken === "function") {
            try {
                const t = await getGoogleAccessToken("https://www.googleapis.com/auth/spreadsheets");
                if (t) return t;
            } catch (e) {
                console.warn("[hang_hoan_tab] getGoogleAccessToken failed:", e);
            }
        }

        const cfg = window.SHARED_GOOGLE_CONFIG;
        if (cfg && cfg.serviceAccountEmail && cfg.privateKey && typeof KJUR !== "undefined") {
            try {
                const header = { alg: "RS256", typ: "JWT" };
                const now = Math.floor(Date.now() / 1000);
                const payload = {
                    iss: cfg.serviceAccountEmail,
                    scope: "https://www.googleapis.com/auth/spreadsheets",
                    aud: cfg.tokenUrl || "https://oauth2.googleapis.com/token",
                    exp: now + 3600,
                    iat: now
                };
                const sHeader = JSON.stringify(header);
                const sPayload = JSON.stringify(payload);
                const sJWT = KJUR.jws.JWS.sign("RS256", sHeader, sPayload, cfg.privateKey);

                const res = await fetch(cfg.tokenUrl || "https://oauth2.googleapis.com/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${sJWT}`
                });
                const data = await res.json();
                if (data.access_token) return data.access_token;
            } catch (jwtErr) {
                console.warn("[hang_hoan_tab] Direct JWT sign failed:", jwtErr);
            }
        }
        return null;
    }

    const btnPopupFillHhShopDien = document.getElementById('btn-popup-fill-hh-shop-dien');
    if (btnPopupFillHhShopDien) {
        btnPopupFillHhShopDien.addEventListener('click', async () => {
            const origHtml = btnPopupFillHhShopDien.innerHTML;

            chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                const activeTab = tabs[0];
                const isShopeeReturn = activeTab && activeTab.url && activeTab.url.includes("banhang.shopee.vn/portal/sale/return");

                if (allHangHoanData.length === 0 && !isShopeeReturn) {
                    alert("Chưa có danh sách đơn hoàn. Vui lòng mở trang Hàng hoàn trên Shopee hoặc ấn 'Đọc' trước!");
                    return;
                }

                const countMsg = allHangHoanData.length > 0 ? `${allHangHoanData.length} đơn hoàn` : 'tất cả các đơn hoàn trên trang Shopee';
                if (!confirm(`Bạn có chắc muốn điền ${countMsg} vào Sheet HH_SHOP_DIEN (WAMELI KHO-SHOP)?`)) {
                    return;
                }

                btnPopupFillHhShopDien.innerHTML = "⏳ Đang điền...";
                btnPopupFillHhShopDien.disabled = true;

                try {
                    // Nếu đã có allHangHoanData được đọc vào popup:
                    if (allHangHoanData.length > 0) {
                        const storageRes = await new Promise(r => chrome.storage.local.get(["maGian", "dhHoanTextValue"], r));
                        const maGian = (storageRes?.maGian || storageRes?.dhHoanTextValue || "BCE").trim().toUpperCase();

                        const now = new Date();
                        const pad = (n) => String(n).padStart(2, '0');
                        const dd = pad(now.getDate());
                        const mm = pad(now.getMonth() + 1);
                        const yyyy = now.getFullYear();
                        const hh = pad(now.getHours());
                        const min = pad(now.getMinutes());
                        const ss = pad(now.getSeconds());
                        const ngay_tao = `${hh}:${min}:${ss} ${dd}/${mm}/${yyyy}`;
                        const ngay_tra = `${dd}/${mm}/${yyyy}`;

                        let baseId = Date.now();
                        const rowsToAppend = [];

                        allHangHoanData.forEach(item => {
                            const prods = (item.products && item.products.length > 0) ? item.products : [{ pName: "", imgUrl: "", sku: "", qty: 1 }];
                            const sol = (item.solutionText || "").toLowerCase();
                            const hoanTra = (sol.includes("trả") || sol.includes("tra")) ? "Trả" : ((sol.includes("hoàn") || sol.includes("hoan")) ? "Hoàn" : "Trả");
                            const mvd = item.forwardTracking || item.trackingNum || "";
                            const mvd_tra = item.trackingNum || "";

                            prods.forEach((p) => {
                                const rowId = String(baseId++);
                                const sku = p.sku || "";
                                const skuTra = p.sku || "";
                                const tenSp = p.pName || "";
                                const sl = String(p.qty || 1);
                                const anh = p.imgUrl || "";
                                const ghiChu = item.reasonText || "";

                                rowsToAppend.push([
                                    rowId, ngay_tao, ngay_tra, mvd, item.orderId || "",
                                    maGian, sku, tenSp, mvd_tra, skuTra, sl, hoanTra,
                                    ghiChu, "CHỜ XÁC NHẬN", "SHOP ĐIỀN", anh
                                ]);
                            });
                        });

                        let appendOk = false;
                        try {
                            const bgRes = await new Promise((resolve) => {
                                chrome.runtime.sendMessage({
                                    type: "APPEND_HH_SHOP_DIEN",
                                    spreadsheetId: "1cnA33cHHMhcOSaXa9l4Jeu6qw8QnXlUnEU4Bqtkj9wo",
                                    sheetName: "HH_SHOP_DIEN",
                                    rows: rowsToAppend
                                }, resolve);
                            });
                            if (bgRes && bgRes.ok) appendOk = true;
                        } catch (e) {}

                        // Fallback ghi trực tiếp nếu background không gửi được
                        if (!appendOk) {
                            const token = await getDirectGoogleToken();
                            if (!token) throw new Error("Không thể kết nối Google Sheets (cả background và trực tiếp).");
                            const appRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/1cnA33cHHMhcOSaXa9l4Jeu6qw8QnXlUnEU4Bqtkj9wo/values/${encodeURIComponent("HH_SHOP_DIEN!A:P")}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
                                method: "POST",
                                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                                body: JSON.stringify({ values: rowsToAppend })
                            });
                            const appData = await appRes.json().catch(() => ({}));
                            if (!appRes.ok) throw new Error(appData.error?.message || "Lỗi ghi dữ liệu vào sheet HH_SHOP_DIEN");
                        }

                        btnPopupFillHhShopDien.innerHTML = `✓ Đã điền ${rowsToAppend.length} dòng!`;
                        btnPopupFillHhShopDien.style.background = "#10b981";
                        btnPopupFillHhShopDien.style.color = "#ffffff";
                        alert(`Đã điền thành công ${rowsToAppend.length} dòng vào Sheet HH_SHOP_DIEN!`);
                        setTimeout(() => {
                            btnPopupFillHhShopDien.innerHTML = origHtml;
                            btnPopupFillHhShopDien.style.background = "#ecfdf5";
                            btnPopupFillHhShopDien.style.color = "#047857";
                            btnPopupFillHhShopDien.disabled = false;
                        }, 3000);
                        return;
                    }

                    // Nếu chưa đọc dữ liệu vào popup nhưng đang mở tab Shopee Return:
                    if (isShopeeReturn) {
                        chrome.tabs.sendMessage(activeTab.id, { type: "BATCH_FILL_HH_SHOP_DIEN" }, (res) => {
                            if (chrome.runtime.lastError || !res?.ok) {
                                alert("Lỗi điền vào HH_SHOP_DIEN: " + (chrome.runtime.lastError?.message || res?.error || "Không phản hồi"));
                                btnPopupFillHhShopDien.innerHTML = origHtml;
                                btnPopupFillHhShopDien.disabled = false;
                            } else {
                                btnPopupFillHhShopDien.innerHTML = `✓ Đã điền!`;
                                btnPopupFillHhShopDien.style.background = "#10b981";
                                btnPopupFillHhShopDien.style.color = "#ffffff";
                                alert(`Đã điền thành công vào Sheet HH_SHOP_DIEN!`);
                                setTimeout(() => {
                                    btnPopupFillHhShopDien.innerHTML = origHtml;
                                    btnPopupFillHhShopDien.style.background = "#ecfdf5";
                                    btnPopupFillHhShopDien.style.color = "#047857";
                                    btnPopupFillHhShopDien.disabled = false;
                                }, 3000);
                            }
                        });
                        return;
                    }

                } catch (err) {
                    alert("Lỗi: " + (err.message || String(err)));
                    btnPopupFillHhShopDien.innerHTML = origHtml;
                    btnPopupFillHhShopDien.disabled = false;
                }
            });
        });
    }

    // =========================================================================
    // SUB-TAB 2: ĐƠN KHO NHẬN (SHEET HH_BH TỪ SPREADSHEET 1cnA33cHHMhcOSaXa9l4Jeu6qw8QnXlUnEU4Bqtkj9wo)
    // =========================================================================
    const SPREADSHEET_ID_KHO = "1cnA33cHHMhcOSaXa9l4Jeu6qw8QnXlUnEU4Bqtkj9wo";
    const SHEET_NAME_KHO = "HH_BH";

    const subtabBtnShopee = document.getElementById('subtab-btn-shopee');
    const subtabBtnKhoNhan = document.getElementById('subtab-btn-kho-nhan');
    const viewShopee = document.getElementById('view-hang-hoan-shopee');
    const viewKhoNhan = document.getElementById('view-hang-hoan-kho-nhan');
    const shopeeHeaderActions = document.getElementById('shopee-header-actions');
    const khoNhanHeaderActions = document.getElementById('kho-nhan-header-actions');

    const khoFilterGianInput = document.getElementById('kho-nhan-filter-gian');
    const khoGianDatalist = document.getElementById('kho-nhan-gian-list');
    const khoSearchInput = document.getElementById('kho-nhan-search');
    const btnFetchKhoNhan = document.getElementById('btn-fetch-kho-nhan');
    const btnKhoSortToggle = document.getElementById('btn-kho-nhan-sort-toggle');
    const khoStatusText = document.getElementById('kho-nhan-status-text');
    const khoCountBadge = document.getElementById('kho-nhan-count-badge');
    const khoTbody = document.getElementById('kho-nhan-tbody');

    let allKhoNhanRows = [];
    let isSortKhoDesc = true; // Sắp xếp theo ngày lớn tới bé (mặc định)

    function switchSubTab(mode) {
        if (mode === 'kho-nhan') {
            if (viewShopee) viewShopee.style.display = 'none';
            if (viewKhoNhan) viewKhoNhan.style.display = 'block';
            if (shopeeHeaderActions) shopeeHeaderActions.style.display = 'none';
            if (khoNhanHeaderActions) khoNhanHeaderActions.style.display = 'flex';
            if (subtabBtnKhoNhan) {
                subtabBtnKhoNhan.style.background = '#059669';
                subtabBtnKhoNhan.style.color = '#ffffff';
            }
            if (subtabBtnShopee) {
                subtabBtnShopee.style.background = 'transparent';
                subtabBtnShopee.style.color = '#475569';
            }
            // Tải dữ liệu nếu chưa có
            if (allKhoNhanRows.length === 0) {
                fetchDonKhoNhan();
            }
        } else {
            if (viewShopee) viewShopee.style.display = 'block';
            if (viewKhoNhan) viewKhoNhan.style.display = 'none';
            if (shopeeHeaderActions) shopeeHeaderActions.style.display = 'flex';
            if (khoNhanHeaderActions) khoNhanHeaderActions.style.display = 'none';
            if (subtabBtnShopee) {
                subtabBtnShopee.style.background = '#2563eb';
                subtabBtnShopee.style.color = '#ffffff';
            }
            if (subtabBtnKhoNhan) {
                subtabBtnKhoNhan.style.background = 'transparent';
                subtabBtnKhoNhan.style.color = '#475569';
            }
        }
    }

    subtabBtnShopee?.addEventListener('click', () => switchSubTab('shopee'));
    subtabBtnKhoNhan?.addEventListener('click', () => switchSubTab('kho-nhan'));

    // Đồng bộ mã gian ban đầu từ ô mã gian chung (dh-hoan-text hoặc storage)
    function initMaGianFilter() {
        chrome.storage.local.get(["maGian", "dhHoanTextValue"], (st) => {
            const currentGian = String(st.maGian || st.dhHoanTextValue || "").trim();
            if (khoFilterGianInput && !khoFilterGianInput.value && currentGian) {
                khoFilterGianInput.value = currentGian;
            }
        });
    }
    initMaGianFilter();

    document.getElementById("dh-hoan-text")?.addEventListener("input", (e) => {
        const val = (e.target.value || "").trim();
        if (khoFilterGianInput && (!khoFilterGianInput.value || khoFilterGianInput.value === val)) {
            khoFilterGianInput.value = val;
            renderKhoNhanTable();
        }
    });

    // Hàm chuyển chuỗi ngày sang timestamp để sắp xếp chính xác
    function parseDateToTimestamp(val) {
        if (!val) return 0;
        const s = String(val).trim();
        if (!s) return 0;

        // 1. Số ngày serial Excel (e.g. 45587)
        if (/^\d{5}(\.\d+)?$/.test(s)) {
            return (parseFloat(s) - 25569) * 86400 * 1000;
        }

        // 2. YYYY-MM-DD hoặc YYYY/MM/DD
        const isoMatch = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
        if (isoMatch) {
            const [_, y, m, d, hh, mm, ss] = isoMatch;
            return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(hh || 0), parseInt(mm || 0), parseInt(ss || 0)).getTime();
        }

        // 3. DD/MM/YYYY hoặc DD-MM-YYYY
        const vnMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
        if (vnMatch) {
            const [_, d, m, y, hh, mm, ss] = vnMatch;
            return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(hh || 0), parseInt(mm || 0), parseInt(ss || 0)).getTime();
        }

        const parsed = Date.parse(s);
        return isNaN(parsed) ? 0 : parsed;
    }

    // Đọc dữ liệu từ Google Sheet HH_BH
    async function fetchDonKhoNhan() {
        if (!khoTbody) return;
        khoTbody.innerHTML = `<tr><td colspan="9" style="padding: 16px; text-align: center; color: #059669; font-weight: bold;">
            ⏳ Đang tải tất cả đơn từ Google Sheet HH_BH (ID: ${SPREADSHEET_ID_KHO})...
        </td></tr>`;
        if (khoStatusText) khoStatusText.textContent = "Đang kết nối Google Sheets...";

        let rawValues = null;

        // 1. Thử gửi message tới background service worker trước
        try {
            const bgRes = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    type: "FETCH_DON_KHO_NHAN",
                    spreadsheetId: SPREADSHEET_ID_KHO,
                    sheetName: SHEET_NAME_KHO
                }, (res) => {
                    if (chrome.runtime.lastError || !res) {
                        resolve(null);
                    } else {
                        resolve(res);
                    }
                });
            });
            if (bgRes && bgRes.ok && Array.isArray(bgRes.values)) {
                rawValues = bgRes.values;
            }
        } catch (e) {
            console.warn("[fetchDonKhoNhan] Background sendMessage error, falling back:", e);
        }

        // 2. Nếu background không phản hồi (message port closed, service worker idle...), tải trực tiếp qua Google Sheets API
        if (!rawValues) {
            try {
                if (khoStatusText) khoStatusText.textContent = "Đang tải trực tiếp Google Sheets...";
                const token = await getDirectGoogleToken();
                if (!token) throw new Error("Không lấy được token xác thực Google.");

                const fetchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID_KHO}/values/${encodeURIComponent(SHEET_NAME_KHO)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await fetchRes.json().catch(() => ({}));
                if (!fetchRes.ok) {
                    throw new Error(data.error?.message || `Không đọc được sheet ${SHEET_NAME_KHO}.`);
                }
                rawValues = data.values || [];
            } catch (directErr) {
                console.error("[fetchDonKhoNhan] Direct fetch error:", directErr);
                khoTbody.innerHTML = `<tr><td colspan="9" style="padding: 14px; text-align: center; color: red;">
                    Lỗi đọc sheet HH_BH: ${directErr.message || String(directErr)}<br>
                    <button id="btn-retry-fetch-kho" type="button" style="margin-top: 8px; padding: 4px 10px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">🔄 Thử lại</button>
                </td></tr>`;
                document.getElementById('btn-retry-fetch-kho')?.addEventListener('click', fetchDonKhoNhan);
                return;
            }
        }

        if (rawValues.length <= 1) {
            khoTbody.innerHTML = `<tr><td colspan="9" style="padding: 14px; text-align: center; color: #64748b;">
                Sheet HH_BH chưa có dữ liệu nào.
            </td></tr>`;
            allKhoNhanRows = [];
            if (khoCountBadge) khoCountBadge.textContent = "0 đơn";
            return;
        }

        const headers = rawValues[0] || [];
        const normalize = s => String(s || "").trim().toLowerCase();

        // Tìm vị trí các cột theo tên hoặc gần đúng
        const findCol = (keys, fallback = -1) => {
            for (const k of keys) {
                const idx = headers.findIndex(h => normalize(h) === normalize(k));
                if (idx !== -1) return idx;
            }
            for (const k of keys) {
                const idx = headers.findIndex(h => normalize(h).includes(normalize(k)));
                if (idx !== -1) return idx;
            }
            return fallback;
        };

        const colNgay = findCol(['ngay_nhan', 'ngày nhận', 'ngay nhan', 'ngày', 'date', 'nhận'], 1);
        const colGian = findCol(['ma_gian', 'mã gian', 'gian', 'shop', 'tên shop'], 4);
        const colMvd = findCol(['mvd', 'mã vận đơn', 'ma van don', 'mã vd', 'tracking'], 2);
        const colMvd2 = findCol(['mvd_2', 'mvd 2', 'mvd phụ', 'mvd2'], 3);
        const colSku = findCol(['sku_ct', 'sku', 'mã sku', 'sản phẩm', 'san pham'], 10);
        const colSlg = findCol(['slg', 'số lượng', 'so luong', 'sl'], 11);
        const colTinhTrang = findCol(['tinh_trang', 'tình trạng', 'trạng thái', 'status'], 14);
        const colKho = findCol(['kho', 'kho nhận', 'ten kho'], 20);

            const parsedRows = [];
            const uniqueGianSet = new Set();

            for (let i = 1; i < rawValues.length; i++) {
                const r = rawValues[i];
                if (!r || r.length === 0 || r.every(c => !String(c || "").trim())) continue;

                const ngay_nhan = String(r[colNgay] || "").trim();
                const ma_gian = String(r[colGian] || "").trim();
                const mvd = String(r[colMvd] || "").trim();
                const mvd_2 = String(r[colMvd2] || "").trim();
                const sku_ct = String(r[colSku] || "").trim();
                const slg = String(r[colSlg] || "").trim();
                const tinh_trang = String(r[colTinhTrang] || "").trim();
                const kho = String(r[colKho] || "").trim();

                if (ma_gian) uniqueGianSet.add(ma_gian);

                parsedRows.push({
                    originalIndex: i,
                    ngay_nhan,
                    dateTimestamp: parseDateToTimestamp(ngay_nhan),
                    ma_gian,
                    mvd,
                    mvd_2,
                    sku_ct,
                    slg,
                    tinh_trang,
                    kho
                });
            }

            allKhoNhanRows = parsedRows;

            // Cập nhật danh sách gợi ý gian
            if (khoGianDatalist) {
                khoGianDatalist.innerHTML = "";
                Array.from(uniqueGianSet).sort().forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g;
                    khoGianDatalist.appendChild(opt);
                });
            }

            if (khoStatusText) {
                khoStatusText.textContent = `Đã tải ${allKhoNhanRows.length} đơn từ sheet HH_BH`;
            }

            renderKhoNhanTable();
    }

    // Hiển thị bảng đơn kho nhận (Lọc mã gian + Tìm kiếm + Sắp xếp ngày lớn tới bé)
    function renderKhoNhanTable() {
        if (!khoTbody) return;

        let filtered = [...allKhoNhanRows];

        // 1. Lọc theo ô mã gian
        const targetGian = (khoFilterGianInput ? khoFilterGianInput.value : "").trim().toLowerCase();
        if (targetGian && targetGian !== "all" && targetGian !== "tất cả") {
            filtered = filtered.filter(item => {
                const g = item.ma_gian.toLowerCase();
                return g === targetGian || g.includes(targetGian);
            });
        }

        // 2. Tìm kiếm theo từ khóa
        const kw = (khoSearchInput ? khoSearchInput.value : "").trim().toLowerCase();
        if (kw) {
            filtered = filtered.filter(item => {
                return item.mvd.toLowerCase().includes(kw) ||
                       item.mvd_2.toLowerCase().includes(kw) ||
                       item.sku_ct.toLowerCase().includes(kw) ||
                       item.tinh_trang.toLowerCase().includes(kw) ||
                       item.kho.toLowerCase().includes(kw) ||
                       item.ma_gian.toLowerCase().includes(kw) ||
                       item.ngay_nhan.toLowerCase().includes(kw);
            });
        }

        // 3. Sắp xếp theo ngày lớn tới bé (Mới nhất -> Cũ nhất)
        filtered.sort((a, b) => {
            if (isSortKhoDesc) {
                return (b.dateTimestamp - a.dateTimestamp) || (b.originalIndex - a.originalIndex);
            } else {
                return (a.dateTimestamp - b.dateTimestamp) || (a.originalIndex - b.originalIndex);
            }
        });

        // 4. Cập nhật nhãn số lượng
        if (khoCountBadge) {
            khoCountBadge.textContent = `${filtered.length} / ${allKhoNhanRows.length} đơn`;
        }

        if (filtered.length === 0) {
            khoTbody.innerHTML = `<tr><td colspan="9" style="padding: 14px; text-align: center; color: #64748b;">
                Không tìm thấy đơn nào phù hợp với bộ lọc (Mã gian: <b>${targetGian ? targetGian.toUpperCase() : 'Tất cả'}</b>).
            </td></tr>`;
            return;
        }

        khoTbody.innerHTML = "";
        filtered.forEach((item, idx) => {
            const tr = document.createElement('tr');
            tr.style.cssText = "border-bottom: 1px solid #e2e8f0; transition: background 0.1s;";
            tr.onmouseenter = () => tr.style.background = "#f1f5f9";
            tr.onmouseleave = () => tr.style.background = "";

            // Màu cho tình trạng
            let tinhTrangBadge = `<span style="color: #475569;">${item.tinh_trang || "-"}</span>`;
            const ttLower = item.tinh_trang.toLowerCase();
            if (ttLower.includes('nguyên vẹn') || ttLower.includes('tốt') || ttLower.includes('ok')) {
                tinhTrangBadge = `<span style="background: #dcfce7; color: #15803d; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${item.tinh_trang}</span>`;
            } else if (ttLower.includes('lỗi') || ttLower.includes('hỏng') || ttLower.includes('vỡ') || ttLower.includes('sai')) {
                tinhTrangBadge = `<span style="background: #fee2e2; color: #b91c1c; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${item.tinh_trang}</span>`;
            } else if (item.tinh_trang) {
                tinhTrangBadge = `<span style="background: #fef3c7; color: #b45309; font-weight: 600; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${item.tinh_trang}</span>`;
            }

            tr.innerHTML = `
                <td style="padding: 6px; text-align: center; color: #64748b; font-weight: 500;">${idx + 1}</td>
                <td style="padding: 6px; font-weight: 600; color: #0f172a; white-space: nowrap;">${item.ngay_nhan || "-"}</td>
                <td style="padding: 6px; white-space: nowrap;">
                    <span style="background: #f3e8ff; color: #7e22ce; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10.5px;">${item.ma_gian || "-"}</span>
                </td>
                <td style="padding: 6px; font-family: monospace; font-weight: 700; color: #047857; white-space: nowrap; cursor: pointer;" title="Bấm để sao chép MVD">
                    ${item.mvd || "-"}
                </td>
                <td style="padding: 6px; font-family: monospace; color: #64748b; font-size: 10.5px;">${item.mvd_2 || "-"}</td>
                <td style="padding: 6px; font-weight: 600; color: #1e293b;">${item.sku_ct || "-"}</td>
                <td style="padding: 6px; text-align: center; font-weight: 700; color: #2563eb;">${item.slg || "1"}</td>
                <td style="padding: 6px;">${tinhTrangBadge}</td>
                <td style="padding: 6px; white-space: nowrap;">
                    <span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 10px;">${item.kho || "-"}</span>
                </td>
            `;

            // Bấm vào MVD để copy
            const mvdTd = tr.children[3];
            if (mvdTd && item.mvd) {
                mvdTd.addEventListener('click', () => {
                    navigator.clipboard.writeText(item.mvd).then(() => {
                        const original = mvdTd.textContent;
                        mvdTd.textContent = "✓ Đã copy!";
                        setTimeout(() => mvdTd.textContent = original, 1200);
                    });
                });
            }

            khoTbody.appendChild(tr);
        });
    }

    // Sự kiện bộ lọc mã gian và tìm kiếm
    khoFilterGianInput?.addEventListener('input', () => {
        renderKhoNhanTable();
    });

    khoSearchInput?.addEventListener('input', () => {
        renderKhoNhanTable();
    });

    btnFetchKhoNhan?.addEventListener('click', () => {
        fetchDonKhoNhan();
    });

    // Đổi chiều sắp xếp
    btnKhoSortToggle?.addEventListener('click', () => {
        isSortKhoDesc = !isSortKhoDesc;
        if (btnKhoSortToggle) {
            btnKhoSortToggle.textContent = isSortKhoDesc ? "📅 Ngày: Lớn → Bé ▼" : "📅 Ngày: Bé → Lớn ▲";
        }
        renderKhoNhanTable();
    });

})();
