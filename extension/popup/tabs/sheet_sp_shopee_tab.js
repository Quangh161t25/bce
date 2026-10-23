(function() {
    // Variables
    const tabBtn = document.querySelector('.tab-btn[data-tab="tab-sheet-sp-shopee"]');
    const tbody = document.getElementById('sheet-sp-shopee-tbody');
    const thead = document.getElementById('sheet-sp-shopee-thead');
    const searchInput = document.getElementById('sheet-sp-shopee-search');

    let allData = [];
    let headers = [];
    let tableCols = [];
    let defaultCols = [];
    let dataLoaded = false;

    // Button mở popup tùy chỉnh cột
    const btnCustom = document.getElementById('btn-col-custom-sp-shopee');
    if (btnCustom) {
        btnCustom.addEventListener('click', openCustomizer);
    }

    function buildDefaultCols(hdrs) {
        return hdrs.map((h, i) => {
            let defaultWidth = 110;
            let defaultWrap = false;
            let defaultAlign = 'left';
            let defaultFixed = false;
            const lower = h.toLowerCase();
            if (lower.includes('tên') || lower.includes('mô tả')) {
                defaultWidth = 240;
                defaultWrap = true;
            } else if (lower.includes('ảnh') || lower.includes('link') || lower.includes('video')) {
                defaultWidth = 75;
                defaultAlign = 'center';
            } else if (lower.includes('giá') || lower.includes('kho') || lower.includes('tiền')) {
                defaultWidth = 95;
                defaultAlign = 'right';
            } else if (lower.includes('ngày') || lower.includes('thời gian')) {
                defaultWidth = 110;
                defaultAlign = 'center';
            }
            return {
                id: `col_${i}`,
                originalIndex: i,
                label: h || `Cột ${i + 1}`,
                visible: true,
                align: defaultAlign,
                wrap: defaultWrap,
                width: defaultWidth,
                fixed: defaultFixed
            };
        });
    }

    function openCustomizer() {
        if (!window.TableCustomizer || !defaultCols.length) return;
        window.TableCustomizer.openColumnCustomizerModal({
            tableId: 'table-sheet-sp-shopee',
            tableName: 'Dữ Liệu SP_SHOPEE',
            defaultCols: defaultCols,
            currentConfig: tableCols,
            onSave: (newCfg) => {
                tableCols = newCfg;
                renderThead();
                renderTable();
            }
        });
    }

    function renderThead() {
        if (!thead) return;
        const activeCols = tableCols.filter(c => c.visible !== false);
        let theadHtml = '<tr>';
        activeCols.forEach(c => {
            theadHtml += `<th data-col="${c.id}" style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600; cursor: pointer;" title="Bấm để tùy chỉnh chi tiết cột">${c.label}</th>`;
        });
        theadHtml += `<th class="th-settings-gear" style="padding: 8px; border-bottom: 1px solid #e2e8f0; width: 34px; text-align: center; cursor: pointer; color: #0284c7;" title="Tùy chỉnh chi tiết các cột">⚙️</th>`;
        theadHtml += '</tr>';
        thead.innerHTML = theadHtml;

        const gear = thead.querySelector('.th-settings-gear');
        if (gear) {
            gear.onclick = openCustomizer;
        }
        thead.querySelectorAll('th[data-col]').forEach(th => {
            th.ondblclick = openCustomizer;
        });

        if (window.TableCustomizer) {
            window.TableCustomizer.attachColumnResizers('table-sheet-sp-shopee', (newCfg) => {
                tableCols = newCfg;
            });
        }
    }

    // Reload whenever the tab is clicked to ensure it is always synchronized
    if (tabBtn) {
        tabBtn.addEventListener('click', () => {
            loadSheetSpShopeeData();
        });
    }

    // Load immediately when the popup opens
    loadSheetSpShopeeData();

    function loadSheetSpShopeeData() {
        tbody.innerHTML = '<tr><td style="padding: 10px; text-align: center; color: #64748b;">Đang tải dữ liệu từ sheet SP_SHOPEE...</td></tr>';
        
        chrome.storage.local.get(["maGian", "dhHoanTextValue"], (storageRes) => {
            const currentMaGian = (storageRes.maGian || storageRes.dhHoanTextValue || "").trim().toLowerCase();

            chrome.runtime.sendMessage({ type: "FETCH_SP_SHOPEE" }, (res) => {
                if (res && res.ok && res.values && res.values.length > 0) {
                    const rows = res.values;
                    chrome.storage.local.set({ sp_shopee_cache_data: rows });
                    headers = rows[0].map(h => String(h || "").trim());
                    
                    // Find indices
                    window.sheetMaSpIdx = headers.findIndex(h => h.toLowerCase().includes('mã sản phẩm') || h.toLowerCase() === 'ma sp' || h.toLowerCase() === 'mã sp' || h.toLowerCase() === 'id');
                    window.sheetTenSpIdx = headers.findIndex(h => h.toLowerCase().includes('tên sản phẩm') || h.toLowerCase() === 'ten sp' || h.toLowerCase() === 'tên sp' || h.toLowerCase() === 'name');
                    window.sheetMaPlIdx = headers.findIndex(h => h.toLowerCase().includes('mã phân loại') || h.toLowerCase().includes('id phân loại') || h.toLowerCase() === 'ma phan loai');
                    window.sheetSkuIdx = headers.findIndex(h => h.toLowerCase() === 'sku' || h.toLowerCase().includes('sku phân loại') || h.toLowerCase() === 'sku sản phẩm');
                    
                    let gianIdx = headers.findIndex(h => h.toLowerCase() === 'gian' || h.toLowerCase() === 'mã gian' || h.toLowerCase() === 'ma gian' || h.toLowerCase() === 'ma_gian');
                    if (gianIdx === -1) gianIdx = 11; // default to Column L (index 11)

                    // Build column configuration and render thead
                    defaultCols = buildDefaultCols(headers);
                    if (window.TableCustomizer) {
                        tableCols = window.TableCustomizer.getTableConfig('table-sheet-sp-shopee', defaultCols);
                        window.TableCustomizer.applyTableStyles('table-sheet-sp-shopee', tableCols);
                    } else {
                        tableCols = defaultCols;
                    }
                    renderThead();

                    allData = [];
                    // Load from bottom to top (newest first)
                    for (let i = rows.length - 1; i >= 1; i--) {
                        const row = rows[i];
                        
                        // Check if gian matches currentMaGian (if currentMaGian is set)
                        if (currentMaGian) {
                            const rowGian = String(row[gianIdx] || "").trim().toLowerCase();
                            if (rowGian !== currentMaGian) {
                                continue; // skip if doesn't match
                            }
                        }

                        // At least first column must be present to count as a valid row
                        if (row[0]) {
                            const rowData = [];
                            for(let j = 0; j < headers.length; j++) {
                                rowData.push(String(row[j] || '').trim());
                            }
                            allData.push(rowData);
                        }
                    }
                    
                    dataLoaded = true;
                    renderTable();
                } else {
                    tbody.innerHTML = '<tr><td style="padding: 10px; text-align: center; color: red;">Lỗi tải dữ liệu hoặc sheet trống. (Kiểm tra lại tên sheet "SP_SHOPEE")</td></tr>';
                }
            });
        });
    }

    // Toast notification helper
    function showToast(msg) {
        let toast = document.getElementById('sheet-sp-shopee-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'sheet-sp-shopee-toast';
            toast.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.92); color: #ffffff; padding: 7px 15px; border-radius: 20px; font-size: 11px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,0.25); z-index: 999999; pointer-events: none; transition: opacity 0.2s, transform 0.2s; opacity: 0; white-space: nowrap; max-width: 90vw; overflow: hidden; text-overflow: ellipsis;';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(6px)';
        }, 1500);
    }

    // Injected hover style for copyable cells
    if (!document.getElementById('sheet-sp-shopee-copy-style')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'sheet-sp-shopee-copy-style';
        styleEl.textContent = `
            .copyable-cell {
                transition: background-color 0.15s, color 0.15s;
            }
            .copyable-cell:hover {
                background-color: #f0fdf4 !important;
                color: #15803d !important;
            }
        `;
        document.head.appendChild(styleEl);
    }

    function parseSearchTokens(rawQuery) {
        if (!rawQuery) return [];
        let text = String(rawQuery).trim();
        if (!text) return [];

        if (/[,;|\n]/.test(text)) {
            return text.split(/[,;|\n]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
        }

        if (/\s+(?:và|hoặc|and|or|\+)\s+/i.test(text)) {
            return text.split(/\s+(?:và|hoặc|and|or|\+)\s+/i).map(t => t.trim().toLowerCase()).filter(Boolean);
        }

        return text.split(/\s+/).map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    function renderTable() {
        if (!dataLoaded) return;

        let filtered = allData;

        const rawQuery = searchInput ? searchInput.value : '';
        const tokens = parseSearchTokens(rawQuery);
        const filterMode = document.querySelector('input[name="sheet-sp-shopee-filter-mode"]:checked')?.value || 'OR';

        if (tokens.length > 0) {
            const checkMatch = (row, token) => {
                return row.some(cellValue => String(cellValue || '').toLowerCase().includes(token));
            };

            if (filterMode === 'AND') {
                filtered = filtered.filter(row => tokens.every(token => checkMatch(row, token)));
            } else {
                // OR mode
                filtered = filtered.filter(row => tokens.some(token => checkMatch(row, token)));
            }
        }

        const activeCols = tableCols.filter(c => c.visible !== false);

        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${activeCols.length + 1}" style="padding: 10px; text-align: center; color: #64748b;">Không tìm thấy kết quả</td></tr>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        filtered.forEach(row => {
            const tr = document.createElement('tr');
            
            activeCols.forEach(col => {
                const cellIndex = col.originalIndex;
                const cellValue = row[cellIndex] || '';
                let cellHtml = cellValue;
                // If value looks like an image link, render it as an image
                if (cellValue.startsWith('http') && (cellValue.match(/\.(jpeg|jpg|gif|png|webp)/i) || cellValue.includes('googleusercontent') || cellValue.includes('drive.google'))) {
                    cellHtml = `<img src="${cellValue}" style="max-width: 60px; max-height: 60px; object-fit: contain; border-radius: 4px;" alt="ảnh">`;
                } 
                // Truncate long text if not wrapping
                else if (cellValue.length > 80 && !col.wrap) {
                    let shortText = cellValue.substring(0, 80) + '...';
                    cellHtml = `<span title="${cellValue.replace(/"/g, '&quot;')}">${shortText}</span>`;
                }

                const td = document.createElement('td');
                td.setAttribute('data-col', col.id);
                td.style.cssText = "padding: 8px; border-bottom: 1px solid #f1f5f9; color: #475569;";

                // Mã sản phẩm: Không có icon, click vào là copy ngay
                if (cellIndex === window.sheetMaSpIdx) {
                    const maSp = row[window.sheetMaSpIdx];
                    if (maSp) {
                        td.className = 'copyable-cell';
                        td.setAttribute('data-copy', maSp);
                        td.setAttribute('data-label', 'Mã SP');
                        td.setAttribute('title', `Click để sao chép Mã SP: ${maSp}`);
                        td.style.cursor = 'pointer';
                        cellHtml = `<span style="font-weight: 700; color: #1e293b;">${cellHtml}</span>`;
                    }
                } 
                // Tên sản phẩm: Không có icon, click vào là copy ngay
                else if (cellIndex === window.sheetTenSpIdx) {
                    const tenSp = row[window.sheetTenSpIdx];
                    if (tenSp) {
                        td.className = 'copyable-cell';
                        td.setAttribute('data-copy', tenSp);
                        td.setAttribute('data-label', 'Tên SP');
                        td.setAttribute('title', `Click để sao chép Tên SP: ${tenSp}`);
                        td.style.cursor = 'pointer';
                    }
                }
                // Hỗ trợ click để copy Mã Phân Loại và SKU nếu có
                else if ((cellIndex === window.sheetMaPlIdx || cellIndex === window.sheetSkuIdx) && cellValue) {
                    td.className = 'copyable-cell';
                    td.setAttribute('data-copy', cellValue);
                    td.setAttribute('data-label', headers[cellIndex] || 'dữ liệu');
                    td.setAttribute('title', `Click để sao chép: ${cellValue}`);
                    td.style.cursor = 'pointer';
                }

                td.innerHTML = cellHtml;
                tr.appendChild(td);
            });
            
            // Cột rỗng tương ứng với cột ⚙️ ở header
            const tdGear = document.createElement('td');
            tdGear.style.cssText = "padding: 8px; border-bottom: 1px solid #f1f5f9; text-align: center;";
            tr.appendChild(tdGear);

            fragment.appendChild(tr);
        });
        tbody.appendChild(fragment);
    }

    if (searchInput) {
        searchInput.addEventListener('input', renderTable);
    }

    document.querySelectorAll('input[name="sheet-sp-shopee-filter-mode"]').forEach(radio => {
        radio.addEventListener('change', renderTable);
    });

    tbody.addEventListener('click', (e) => {
        const target = e.target.closest('[data-copy]');
        if (target) {
            const val = target.getAttribute('data-copy');
            const label = target.getAttribute('data-label') || 'dữ liệu';
            if (val) {
                navigator.clipboard.writeText(val).then(() => {
                    const originalBg = target.style.backgroundColor;
                    target.style.transition = 'background-color 0.2s';
                    target.style.backgroundColor = '#dcfce7';
                    setTimeout(() => {
                        target.style.backgroundColor = originalBg || '';
                    }, 500);

                    showToast(`📋 Đã copy ${label}: ${val.length > 40 ? val.substring(0, 40) + '...' : val}`);
                }).catch(err => console.error('Copy failed', err));
            }
        }
    });
})();
