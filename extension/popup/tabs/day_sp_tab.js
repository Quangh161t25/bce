(function() {
    const tabBtn = document.querySelector('.tab-btn[data-tab="tab-day-sp"]');
    const idsInput = document.getElementById('day-sp-ids-input');
    const btnGetFromHieuQua = document.getElementById('btn-get-ids-from-hieu-qua');
    const btnClear = document.getElementById('btn-clear-day-sp-ids');
    const btnStart = document.getElementById('btn-start-day-sp');
    const btnOpenList = document.getElementById('btn-open-shopee-product-list');
    const chkAutoRepeat = document.getElementById('chk-auto-repeat-4h');
    const timesListEl = document.getElementById('day-sp-schedule-times-list');
    const btnAddTime = document.getElementById('btn-add-day-sp-time');
    const statusText = document.getElementById('day-sp-status');
    const logList = document.getElementById('day-sp-log-list');

    const STORAGE_KEY = "shopee_auto_boost_config";
    const DEFAULT_SCHEDULE_TIMES = ["09:00", "13:20"];
    let scheduleTimes = [...DEFAULT_SCHEDULE_TIMES];
    let isRunning = false;

    function normalizeTimeToken(str) {
        const m = String(str || "").trim().match(/^(\d{1,2}):(\d{1,2})$/);
        if (!m) return null;
        const hh = Math.min(23, Math.max(0, parseInt(m[1], 10)));
        const mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
        return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }

    function renderScheduleTimes() {
        if (!timesListEl) return;
        timesListEl.innerHTML = '';

        scheduleTimes.forEach((timeVal, idx) => {
            const pill = document.createElement('div');
            pill.style.cssText = 'display: inline-flex; align-items: center; gap: 3px; background: white; border: 1px solid #cbd5e1; border-radius: 4px; padding: 1px 4px;';

            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.value = timeVal;
            timeInput.style.cssText = 'border: none; outline: none; background: transparent; font-size: 11px; font-weight: 600; color: #1e293b; padding: 1px 2px; cursor: pointer; width: auto;';
            timeInput.addEventListener('change', () => {
                const normalized = normalizeTimeToken(timeInput.value);
                if (normalized) {
                    scheduleTimes[idx] = normalized;
                    saveConfigAndSyncAlarms();
                    setStatus(`Đã cập nhật giờ đẩy: ${scheduleTimes.join(', ')}`);
                }
            });

            const btnDel = document.createElement('button');
            btnDel.type = 'button';
            btnDel.textContent = '×';
            btnDel.title = 'Xóa khung giờ này';
            btnDel.style.cssText = 'width: auto !important; min-height: 18px !important; height: 18px; padding: 0 4px; border: none; background: transparent; color: #ef4444; font-size: 13px; font-weight: bold; line-height: 1; cursor: pointer;';
            btnDel.addEventListener('click', () => {
                scheduleTimes.splice(idx, 1);
                renderScheduleTimes();
                saveConfigAndSyncAlarms();
                setStatus(scheduleTimes.length ? `Khung giờ đẩy: ${scheduleTimes.join(', ')}` : 'Đã xóa hết khung giờ đẩy.');
            });

            pill.appendChild(timeInput);
            pill.appendChild(btnDel);
            timesListEl.appendChild(pill);
        });
    }

    function syncAlarmsWithBackground() {
        if (chkAutoRepeat && chkAutoRepeat.checked && scheduleTimes.length > 0) {
            chrome.runtime.sendMessage({
                type: "SCHEDULE_AUTO_BOOST_ALARM",
                scheduleTimes: scheduleTimes
            });
        } else {
            chrome.runtime.sendMessage({ type: "CANCEL_AUTO_BOOST_ALARM" });
        }
    }

    function saveConfigAndSyncAlarms(extraData = {}) {
        saveConfig(extraData, () => {
            syncAlarmsWithBackground();
        });
    }

    // Load saved settings
    loadSavedConfig();

    function loadSavedConfig() {
        chrome.storage.local.get([STORAGE_KEY], (res) => {
            const config = res[STORAGE_KEY] || {};
            if (idsInput && config.ids) {
                idsInput.value = config.ids;
            }
            if (Array.isArray(config.scheduleTimes) && config.scheduleTimes.length > 0) {
                scheduleTimes = config.scheduleTimes.map(normalizeTimeToken).filter(Boolean);
            } else {
                scheduleTimes = [...DEFAULT_SCHEDULE_TIMES];
            }
            renderScheduleTimes();

            if (chkAutoRepeat && config.autoRepeat !== undefined) {
                chkAutoRepeat.checked = !!config.autoRepeat;
                if (chkAutoRepeat.checked) {
                    syncAlarmsWithBackground();
                }
            }
            if (config.lastLogs && logList) {
                renderLogs(config.lastLogs, config.lastRunTime);
            }
        });
    }

    function saveConfig(extraData = {}, callback = null) {
        chrome.storage.local.get([STORAGE_KEY], (res) => {
            const current = res[STORAGE_KEY] || {};
            const updated = {
                ...current,
                ids: idsInput ? idsInput.value.trim() : current.ids,
                autoRepeat: chkAutoRepeat ? chkAutoRepeat.checked : current.autoRepeat,
                scheduleTimes: scheduleTimes,
                ...extraData
            };
            chrome.storage.local.set({ [STORAGE_KEY]: updated }, () => {
                if (typeof callback === "function") callback(updated);
            });
        });
    }

    function setStatus(msg, type = "info") {
        if (!statusText) return;
        statusText.textContent = msg;
        if (type === "error") {
            statusText.style.color = "#ef4444";
        } else if (type === "success") {
            statusText.style.color = "#10b981";
        } else {
            statusText.style.color = "#64748b";
        }
    }

    function parseInputIds() {
        const raw = (idsInput ? idsInput.value : '').trim();
        if (!raw) return [];
        // Split by comma, semicolon, space, newline
        const tokens = raw.split(/[\s,;\n\r\t]+/);
        const ids = [];
        for (const token of tokens) {
            const clean = token.replace(/[^0-9]/g, '');
            if (clean && clean.length >= 6 && !ids.includes(clean)) {
                ids.push(clean);
            }
        }
        return ids;
    }

    function formatTime(timestamp) {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '';
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    }

    function formatDate(timestamp) {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '';
        const dd = String(d.getDate()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        return `${dd}/${MM}`;
    }

    let cachedLastLogs = null;
    let cachedLastRunTime = null;

    function renderLogs(results, lastRunTime = null) {
        if (!logList) return;
        cachedLastLogs = results;
        if (lastRunTime) cachedLastRunTime = lastRunTime;

        if (!results || !results.length) {
            logList.innerHTML = '<div style="padding: 10px; text-align: center; color: #94a3b8; font-size: 11px;">Chưa có lịch sử đẩy sản phẩm.</div>';
            const lastTimeEl = document.getElementById('day-sp-last-time');
            if (lastTimeEl) lastTimeEl.textContent = '';
            return;
        }

        const runTime = lastRunTime || cachedLastRunTime;
        const lastTimeEl = document.getElementById('day-sp-last-time');
        if (lastTimeEl && runTime) {
            const tStr = formatTime(runTime);
            const dStr = formatDate(runTime);
            const nextTimeStr = formatTime(runTime + 4 * 3600 * 1000);
            lastTimeEl.innerHTML = `⏱️ Đẩy lúc: <b style="color:#0f766e;">${tStr}</b> (${dStr}) · Lượt kế tiếp: <b style="color:#2563eb;">${nextTimeStr}</b>`;
        }

        let html = '';
        results.forEach((item, idx) => {
            let icon = '⏳';
            let badgeBg = '#f1f5f9';
            let badgeColor = '#475569';
            let timeInfo = '';

            const itemTime = item.boostedAt || item.timestamp || runTime;
            const timeStr = itemTime ? formatTime(itemTime) : '';
            const expireStr = item.expireAt ? formatTime(item.expireAt) : (itemTime ? formatTime(itemTime + 4 * 3600 * 1000) : '');

            let remainingText = '';
            if (item.status === 'boosted' || item.status === 'already_boosting') {
                const exp = item.expireAt || (itemTime ? itemTime + 4 * 3600 * 1000 : 0);
                if (exp) {
                    const diff = exp - Date.now();
                    if (diff > 0) {
                        const h = Math.floor(diff / 3600000);
                        const m = Math.floor((diff % 3600000) / 60000);
                        remainingText = `<span style="color:#0284c7;font-weight:600;">(còn ${h}h ${m}p)</span>`;
                    } else {
                        remainingText = `<span style="color:#16a34a;font-weight:600;">(đã hết 4h - có thể đẩy lại)</span>`;
                    }
                }
            }

            if (item.status === 'boosted') {
                icon = '🚀';
                badgeBg = '#dcfce7';
                badgeColor = '#15803d';
                timeInfo = timeStr ? `Đã đẩy lúc <b>${timeStr}</b> · Hết hạn lúc <b>${expireStr}</b> ${remainingText}` : 'Đã kích hoạt đẩy thành công!';
            } else if (item.status === 'already_boosting') {
                icon = '⏱️';
                badgeBg = '#e0f2fe';
                badgeColor = '#0369a1';
                timeInfo = `${item.msg || 'Đang trong thời gian đẩy'} ${remainingText}`;
            } else if (item.status === 'limit_reached') {
                icon = '⚠️';
                badgeBg = '#fef3c7';
                badgeColor = '#b45309';
                timeInfo = 'Đã đạt giới hạn 5/5 vị trí đẩy (Shopee tối đa 5 SP cùng lúc)';
            } else if (item.status === 'not_found' || item.status === 'error') {
                icon = '❌';
                badgeBg = '#fee2e2';
                badgeColor = '#b91c1c';
                timeInfo = item.msg || 'Không thể đẩy';
            }

            html += `
                <div style="padding: 6px 8px; margin-bottom: 4px; background: white; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 11px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                        <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; flex: 1;">
                            <span style="font-weight: bold; color: #64748b;">#${idx + 1}</span>
                            <span style="font-family: monospace; font-weight: 700; color: #1e293b;">${item.id}</span>
                            ${item.name ? `<span style="color: #475569; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${item.name}">- ${item.name}</span>` : ''}
                        </div>
                        <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: 600; white-space: nowrap;">
                            ${icon} ${item.status === 'boosted' ? 'Đã đẩy thành công!' : (item.msg || item.status)}
                        </span>
                    </div>
                    ${timeInfo ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding-top: 3px; border-top: 1px dashed #f1f5f9; font-size: 10px; color: #64748b;">
                            <span>${timeInfo}</span>
                            ${(timeStr && item.status !== 'boosted') ? `<span>Quét lúc ${timeStr}</span>` : ''}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        logList.innerHTML = html;
    }

    function ensureContentScriptInjected(tabId) {
        return new Promise((resolve) => {
            chrome.tabs.sendMessage(tabId, { type: "PING" }, (res) => {
                if (chrome.runtime.lastError || !res || !res.ok) {
                    chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ["extension/lib/xlsx.full.min.js", "extension/content/content.js"]
                    }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn("Lỗi inject content script:", chrome.runtime.lastError);
                            resolve(false);
                        } else {
                            setTimeout(() => resolve(true), 200);
                        }
                    });
                } else {
                    resolve(true);
                }
            });
        });
    }

    async function startAutoBoost() {
        if (isRunning) return;
        const ids = parseInputIds();
        if (!ids.length) {
            setStatus("Vui lòng nhập hoặc dán ít nhất 1 Mã sản phẩm hợp lệ!", "error");
            return;
        }

        isRunning = true;
        if (btnStart) {
            btnStart.disabled = true;
            btnStart.textContent = "⏳ Đang đẩy SP...";
            btnStart.style.opacity = "0.7";
        }
        setStatus(`Đang tìm và đẩy tối đa 5 SP trong danh sách (${ids.length} mã)...`);

        try {
            saveConfigAndSyncAlarms();

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const isProductListPage = tab && tab.url && (tab.url.includes("/portal/product/list") || tab.url.includes("/portal/product"));

            if (!isProductListPage) {
                setStatus("Đang tự động mở trang Danh sách sản phẩm Shopee và tiến hành đẩy 5 SP...", "info");
                chrome.runtime.sendMessage({
                    type: "RUN_AUTO_BOOST_NOW",
                    productIds: ids,
                    maxSlots: 5
                });
                return;
            }

            await ensureContentScriptInjected(tab.id);

            const response = await new Promise((resolve) => {
                chrome.tabs.sendMessage(tab.id, {
                    type: "EXECUTE_AUTO_BOOST_LIST",
                    productIds: ids,
                    maxSlots: 5
                }, (res) => {
                    resolve(res || { ok: false, error: chrome.runtime.lastError?.message || "Không có phản hồi từ trang Shopee" });
                });
            });

            if (!response || !response.ok) {
                setStatus(`Lỗi: ${response?.error || "Không thể thực hiện đẩy SP"}`, "error");
                return;
            }

            const results = response.results || [];
            const boostedCount = response.boostedCount || 0;
            const alreadyBoostingCount = response.alreadyBoostingCount || 0;

            const now = Date.now();
            const enhancedResults = (response.results || []).map(item => ({
                ...item,
                timestamp: item.timestamp || now,
                boostedAt: item.status === 'boosted' ? (item.boostedAt || now) : item.boostedAt,
                expireAt: item.status === 'boosted' ? (item.expireAt || (now + 4 * 60 * 60 * 1000)) : item.expireAt
            }));

            renderLogs(enhancedResults, now);
            saveConfig({ lastLogs: enhancedResults, lastRunTime: now });

            setStatus(`✓ Hoàn tất: Đã đẩy ${boostedCount} SP mới, ${alreadyBoostingCount} SP đang trong thời gian đẩy!`, "success");
        } catch (err) {
            setStatus(`Lỗi ngoại lệ: ${err.message}`, "error");
        } finally {
            isRunning = false;
            if (btnStart) {
                btnStart.disabled = false;
                btnStart.textContent = "🚀 ĐẨY 5 SP NGAY";
                btnStart.style.opacity = "1";
            }
        }
    }

    // Event listeners
    if (idsInput) {
        idsInput.addEventListener('input', () => saveConfig());
    }

    if (btnAddTime) {
        btnAddTime.addEventListener('click', () => {
            const defaultNew = !scheduleTimes.includes("09:00") ? "09:00"
                : !scheduleTimes.includes("13:20") ? "13:20"
                : !scheduleTimes.includes("17:30") ? "17:30"
                : "21:30";
            scheduleTimes.push(defaultNew);
            renderScheduleTimes();
            saveConfigAndSyncAlarms();
            setStatus(`Đã thêm khung giờ ${defaultNew}. Khung giờ hiện tại: ${scheduleTimes.join(', ')}`);
        });
    }

    if (chkAutoRepeat) {
        chkAutoRepeat.addEventListener('change', () => {
            saveConfigAndSyncAlarms();
            if (chkAutoRepeat.checked) {
                setStatus(`Đã bật tự động mở & đẩy SP lúc: ${scheduleTimes.join(', ')} hàng ngày.`);
            } else {
                setStatus("Đã tắt hẹn giờ tự động đẩy.");
            }
        });
    }

    if (btnGetFromHieuQua) {
        btnGetFromHieuQua.addEventListener('click', () => {
            // Check if performance tab has loaded products
            chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
                // First try to read directly from table-hieu-qua-sp if present in DOM
                const hieuQuaRows = Array.from(document.querySelectorAll('#hieu-qua-sp-tbody tr'));
                const foundIds = [];
                hieuQuaRows.forEach(tr => {
                    const copyBtn = tr.querySelector('.btn-copy-mini');
                    const id = copyBtn ? copyBtn.getAttribute('data-copy') : '';
                    if (id && !foundIds.includes(id)) {
                        foundIds.push(id);
                    }
                });

                if (foundIds.length > 0) {
                    idsInput.value = foundIds.join(", ");
                    saveConfig();
                    setStatus(`Đã lấy ${foundIds.length} Mã sản phẩm từ tab Hiệu quả SP!`, "success");
                } else {
                    setStatus("Chưa có dữ liệu từ tab Hiệu quả SP. Hãy mở tab Hiệu quả SP bấm 'Đọc Trang Hiện Tại' trước!", "error");
                }
            });
        });
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (idsInput) idsInput.value = '';
            saveConfig();
            setStatus("Đã xóa trắng danh sách mã sản phẩm.");
        });
    }

    const btnSet4hCycle = document.getElementById('btn-set-4h-cycle');
    if (btnSet4hCycle) {
        btnSet4hCycle.addEventListener('click', () => {
            scheduleTimes = ["00:15", "04:15", "08:15", "12:15", "16:15", "20:15"];
            renderScheduleTimes();
            saveConfigAndSyncAlarms();
            setStatus("✓ Đã thiết lập lịch đẩy liên tục mỗi 4 tiếng (00:15, 04:15, 08:15, 12:15, 16:15, 20:15)", "success");
        });
    }

    // Tự động cập nhật thời gian còn lại mỗi 30s khi đang mở popup
    setInterval(() => {
        if (cachedLastLogs && cachedLastLogs.length > 0) {
            renderLogs(cachedLastLogs, cachedLastRunTime);
        }
    }, 30000);

    if (btnStart) {
        btnStart.addEventListener('click', startAutoBoost);
    }

    if (btnOpenList) {
        btnOpenList.addEventListener('click', () => {
            chrome.tabs.create({ url: "https://banhang.shopee.vn/portal/product/list/live/all?operationSortBy=modified_time&page=1&size=48" });
        });
    }
})();
