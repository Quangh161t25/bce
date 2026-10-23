(function() {
    // Variables
    const tabBtn = document.querySelector('.tab-btn[data-tab="tab-sp-giam-gia"]');
    const tbody = document.getElementById('sp-giam-gia-tbody');
    const thead = document.getElementById('sp-giam-gia-thead');
    const searchInput = document.getElementById('sp-giam-gia-search');

    let allData = [];
    let headers = [];
    let tableCols = [];
    let defaultCols = [];
    let dataLoaded = false;

    // Nút mở modal tùy chỉnh cột
    const btnCustom = document.getElementById('btn-col-custom-sp-giam-gia');
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
            tableId: 'table-sp-giam-gia',
            tableName: 'Dữ Liệu SP_GIAM_GIA',
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
            window.TableCustomizer.attachColumnResizers('table-sp-giam-gia', (newCfg) => {
                tableCols = newCfg;
            });
        }
    }

    // Reload whenever the tab is clicked to ensure it is always synchronized
    if (tabBtn) {
        tabBtn.addEventListener('click', () => {
            loadSpGiamGiaData();
        });
    }

    // Load immediately when the popup opens
    loadSpGiamGiaData();

    function loadSpGiamGiaData() {
        if (!tbody) return;
        tbody.innerHTML = '<tr><td style="padding: 10px; text-align: center; color: #64748b;">Đang tải dữ liệu từ sheet SP_GIAM_GIA...</td></tr>';
        
        chrome.storage.local.get(["maGian", "dhHoanTextValue"], (storageRes) => {
            const currentMaGian = (storageRes.maGian || storageRes.dhHoanTextValue || "").trim().toLowerCase();

            chrome.runtime.sendMessage({ type: "FETCH_SP_GIAM_GIA" }, (res) => {
                if (res && res.ok && res.values && res.values.length > 0) {
                    const rows = res.values;
                    headers = rows[0].map(h => String(h || "").trim());
                    
                    // Find Gian index
                    let gianIdx = headers.findIndex(h => h.toLowerCase() === 'gian' || h.toLowerCase() === 'mã gian' || h.toLowerCase() === 'ma gian' || h.toLowerCase() === 'ma_gian');
                    if (gianIdx === -1) {
                        gianIdx = headers.findIndex(h => h.toLowerCase().includes('gian'));
                    }
                    if (gianIdx === -1) gianIdx = 8; // Column I (index 8) is 'gian'

                    // Khởi tạo TableCustomizer cho SP_GIAM_GIA
                    defaultCols = buildDefaultCols(headers);
                    if (window.TableCustomizer) {
                        tableCols = window.TableCustomizer.getTableConfig('table-sp-giam-gia', defaultCols);
                        window.TableCustomizer.applyTableStyles('table-sp-giam-gia', tableCols);
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

                        // At least one column must be present to count as a valid row
                        if (row.some(c => c)) {
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
                    tbody.innerHTML = `<tr><td style="padding: 10px; text-align: center; color: red;">Lỗi tải dữ liệu hoặc sheet trống. (Kiểm tra lại tên sheet "SP_GIAM_GIA")</td></tr>`;
                }
            });
        });
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
        const filterMode = document.querySelector('input[name="sp-giam-gia-filter-mode"]:checked')?.value || 'OR';

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
                // Truncate long text
                else if (cellValue.length > 80 && !col.wrap) {
                    let shortText = cellValue.substring(0, 80) + '...';
                    cellHtml = `<span title="${cellValue.replace(/"/g, '&quot;')}">${shortText}</span>`;
                }

                // Add copy buttons for SKU column (Index 5 - Column F in sheet) or Product Name column (Index 1 - Column B)
                if (cellIndex === 5 || cellIndex === 1) {
                    if (cellValue) {
                        cellHtml = `<div style="display:flex; align-items:center; gap:6px;">
                            <div>${cellHtml}</div>
                            <button class="copy-cell-btn" data-text="${cellValue.replace(/"/g, '&quot;')}" style="padding: 2px 4px; font-size: 10px; cursor: pointer; border: 1px solid #cbd5e1; border-radius: 3px; background: #fff; min-width: 24px;" title="Copy">📋</button>
                        </div>`;
                    }
                }

                const td = document.createElement('td');
                td.setAttribute('data-col', col.id);
                td.style.cssText = "padding: 8px; border-bottom: 1px solid #f1f5f9; color: #475569;";
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

    document.querySelectorAll('input[name="sp-giam-gia-filter-mode"]').forEach(radio => {
        radio.addEventListener('change', renderTable);
    });

    tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('.copy-cell-btn');
        if (btn) {
            const text = btn.getAttribute('data-text');
            if (text) {
                navigator.clipboard.writeText(text).then(() => {
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '✅';
                    setTimeout(() => { btn.innerHTML = originalText; }, 1000);
                }).catch(err => console.error('Copy failed', err));
            }
        }
    });
})();
