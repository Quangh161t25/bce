import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CONFIG, TAB_TITLES } from './config/sheetsConfig.js';
import {
    fetchSheetDataWithFallback,
    writeRecordRow,
    batchWriteRecordRows,
    deleteSheetRows,
    appendRecordRows,
    clearCurrentTabData,
    ensureDhSheetExists,
    ensureSpBoSheetExists,
    ensureSpGiamGiaSheetExists,
    fetchSpBoSet,
    fetchSpShopeeData,
    buildSpShopeeGianMap,
    fetchWebSpImageMap
} from './services/googleSheetsApi.js';
import {
    readDsSpExcelRows,
    readHeaderMappedExcelRows,
    readGenericExcelRows
} from './services/excelService.js';
import {
    parseMoney,
    formatDisplayNumber,
    parseDhDate
} from './utils/formatters.js';
import {
    recalculateTinhGiaRowData,
    recalculateTinhGiaRowByProfitRate,
    recalculateDhFinancials
} from './utils/calculations.js';
import { showToast } from './utils/clipboard.js';

import Sidebar from './components/layout/Sidebar.jsx';
import HeaderActions from './components/layout/HeaderActions.jsx';
import Pagination from './components/layout/Pagination.jsx';
import LoadingMask from './components/layout/LoadingMask.jsx';
import DropOverlay from './components/layout/DropOverlay.jsx';
import ToastContainer from './components/layout/ToastContainer.jsx';

import DataTable from './components/common/DataTable.jsx';
import RecordModal from './components/common/RecordModal.jsx';

import DhSummaryStats from './components/dh/DhSummaryStats.jsx';
import DhFilterBar from './components/dh/DhFilterBar.jsx';
import DhBatchControls from './components/dh/DhBatchControls.jsx';
import DhDetailModal from './components/dh/DhDetailModal.jsx';

import CustomCopyButtonsBar from './components/tinh_gia/CustomCopyButtonsBar.jsx';
import TinhGiaBatchControls from './components/tinh_gia/TinhGiaBatchControls.jsx';
import TinhGiaModal from './components/tinh_gia/TinhGiaModal.jsx';

import DsSpPrefixFilters from './components/ds_sp/DsSpPrefixFilters.jsx';
import ImageSearchModal from './components/ds_sp/ImageSearchModal.jsx';

const STORAGE_TAB_KEY = 'xnk_tt_current_tab';
const CUSTOM_BUTTONS_KEY = 'bce_custom_copy_buttons';

export default function App() {
    // -------------------------------------------------------------------------
    // Navigation & Global State
    // -------------------------------------------------------------------------
    const [currentTab, setCurrentTab] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_TAB_KEY) || 'DS_SP';
        } catch (_) {
            return 'DS_SP';
        }
    });
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Đang tải dữ liệu...');
    const [isDragOver, setIsDragOver] = useState(false);

    // Data for the current active tab
    const [allData, setAllData] = useState([]);

    // -------------------------------------------------------------------------
    // Shared Supporting Data (Caches)
    // -------------------------------------------------------------------------
    const [spBoSet, setSpBoSet] = useState(new Set());
    const [dsSpPriceMap, setDsSpPriceMap] = useState(new Map());
    const [dsSpNameMap, setDsSpNameMap] = useState(new Map());
    const [spShopeeGianMap, setSpShopeeGianMap] = useState(new Map());
    const [webSpImageMap, setWebSpImageMap] = useState(new Map());

    // Custom copy buttons for TINH_GIA
    const [customButtons, setCustomButtons] = useState(() => {
        try {
            const raw = localStorage.getItem(CUSTOM_BUTTONS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (_) {}
        return ['GDD'];
    });

    // -------------------------------------------------------------------------
    // Table Controls (Search, Sort, Pagination, Selection)
    // -------------------------------------------------------------------------
    const [searchTerm, setSearchTerm] = useState('');
    const [truongFilter, setTruongFilter] = useState('');
    const [storeFilter, setStoreFilter] = useState('');
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState(null); // 'asc' | 'desc' | null
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Prefix Filters (for DS_SP, TINH_GIA, WEB_SP)
    const [prefix1Filter, setPrefix1Filter] = useState('');
    const [prefix2Filter, setPrefix2Filter] = useState('');

    // DH Specific Filters & Subrows
    const [selectedDhGianSet, setSelectedDhGianSet] = useState(new Set());
    const [selectedDhTinhTrangSet, setSelectedDhTinhTrangSet] = useState(new Set());
    const [selectedDhTrangThaiSet, setSelectedDhTrangThaiSet] = useState(new Set());
    const [selectedMonth, setSelectedMonth] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [expandedSubrows, setExpandedSubrows] = useState(new Set());

    // -------------------------------------------------------------------------
    // Modals State
    // -------------------------------------------------------------------------
    const [recordModalOpen, setRecordModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const [tinhGiaModalOpen, setTinhGiaModalOpen] = useState(false);
    const [editingTinhGiaRow, setEditingTinhGiaRow] = useState(null);

    const [dhDetailModalOpen, setDhDetailModalOpen] = useState(false);
    const [editingDhMdh, setEditingDhMdh] = useState('');
    const [editingDhOrderData, setEditingDhOrderData] = useState(null);
    const [editingDhItems, setEditingDhItems] = useState([]);

    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageTarget, setImageTarget] = useState(null);

    // -------------------------------------------------------------------------
    // Tab Config Helpers
    // -------------------------------------------------------------------------
    const tabConfig = CONFIG.tabs[currentTab] || CONFIG.tabs['DS_SP'];
    const storageHeaders = tabConfig.headers || [];
    const displayHeaders = tabConfig.displayHeaders || storageHeaders;
    const priceCols = tabConfig.priceCols || [];

    // -------------------------------------------------------------------------
    // Load Supporting Maps (DS_SP, SP_BO, SP_SHOPEE, WEB_SP)
    // -------------------------------------------------------------------------
    const loadDsSpMaps = useCallback(async () => {
        try {
            const raw = await fetchSheetDataWithFallback('DS_SP');
            const priceMap = new Map();
            const nameMap = new Map();

            (raw || []).forEach((r) => {
                if (!Array.isArray(r) || !r.length) return;
                const idCon = String(r[0] || '').trim().toUpperCase();
                const idSp = String(r[1] || '').trim().toUpperCase();
                const tenSp = String(r[2] || '').trim();
                const giaNhap = parseMoney(r[3]);
                const giaBan = parseMoney(r[4]);
                const item = { idCon, idSp, tenSp, giaNhap, giaBan };

                if (idCon) {
                    priceMap.set(idCon, item);
                    nameMap.set(idCon, tenSp);
                }
                if (idSp && !priceMap.has(idSp)) {
                    priceMap.set(idSp, item);
                    nameMap.set(idSp, tenSp);
                }
                if (idCon && idCon.length >= 4 && !priceMap.has(idCon.slice(0, 4))) {
                    priceMap.set(idCon.slice(0, 4), item);
                    nameMap.set(idCon.slice(0, 4), tenSp);
                }
                if (idSp && idSp.length >= 4 && !priceMap.has(idSp.slice(0, 4))) {
                    priceMap.set(idSp.slice(0, 4), item);
                    nameMap.set(idSp.slice(0, 4), tenSp);
                }
            });

            setDsSpPriceMap(priceMap);
            setDsSpNameMap(nameMap);
        } catch (err) {
            console.warn('Could not load DS_SP price map:', err);
        }
    }, []);

    const loadSpShopee = useCallback(async () => {
        try {
            const spData = await fetchSpShopeeData();
            const gianMap = buildSpShopeeGianMap(spData, customButtons);
            setSpShopeeGianMap(gianMap);
        } catch (err) {
            console.warn('Could not load SP_SHOPEE:', err);
        }
    }, [customButtons]);

    const loadSpBo = useCallback(async () => {
        try {
            const boSet = await fetchSpBoSet();
            setSpBoSet(boSet);
            return boSet;
        } catch (err) {
            console.warn('Could not load SP_BO:', err);
            return new Set();
        }
    }, []);

    const loadWebSpImages = useCallback(async () => {
        try {
            const imgMap = await fetchWebSpImageMap();
            setWebSpImageMap(imgMap);
        } catch (err) {
            console.warn('Could not load WEB_SP images:', err);
        }
    }, []);

    // -------------------------------------------------------------------------
    // Load Active Tab Data
    // -------------------------------------------------------------------------
    const loadData = useCallback(async (tabToLoad = currentTab) => {
        setIsLoading(true);
        setLoadingText(`Đang tải dữ liệu ${TAB_TITLES[tabToLoad] || tabToLoad}...`);
        try {
            if (tabToLoad === 'DH') {
                await ensureDhSheetExists();
            } else if (tabToLoad === 'SP_BO') {
                await ensureSpBoSheetExists();
            } else if (tabToLoad === 'SP_GIAM_GIA') {
                await ensureSpGiamGiaSheetExists();
            }

            if (tabToLoad === 'DS_SP' || tabToLoad === 'TINH_GIA') {
                await loadSpBo();
            }

            const rawRows = await fetchSheetDataWithFallback(tabToLoad, (msg) => {
                setLoadingText(msg);
            });

            const validRows = (rawRows || []).filter(r => r && r.some(c => String(c || '').trim() !== ''));
            const rowsWithIndex = validRows.map((row, i) => {
                const arr = Array.isArray(row) ? [...row] : [];
                arr._sheetRow = i + 2;
                return arr;
            });

            setAllData(rowsWithIndex);
            setCurrentPage(1);
            setSelectedIds(new Set());
            setExpandedSubrows(new Set());

            // Secondary caches
            if (tabToLoad === 'TINH_GIA') {
                loadSpShopee();
                loadWebSpImages();
            }
            if (tabToLoad === 'DH') {
                loadDsSpMaps();
            }
        } catch (err) {
            console.error('Error fetching tab data:', err);
            showToast(`❌ Lỗi tải dữ liệu: ${err.message || err}`);
        } finally {
            setIsLoading(false);
        }
    }, [currentTab, loadSpBo, loadSpShopee, loadWebSpImages, loadDsSpMaps]);

    // Switch Tab
    const handleTabChange = (newTab) => {
        if (newTab === currentTab && allData.length > 0) return;
        setCurrentTab(newTab);
        try {
            localStorage.setItem(STORAGE_TAB_KEY, newTab);
        } catch (_) {}
        setSearchTerm('');
        setTruongFilter('');
        setStoreFilter('');
        setPrefix1Filter('');
        setPrefix2Filter('');
        setSortCol(null);
        setSortDir(null);
    };

    useEffect(() => {
        loadData(currentTab);
    }, [currentTab, loadData]);

    // Initial load for DS_SP price map so DH and TINH_GIA have it ready
    useEffect(() => {
        loadDsSpMaps();
    }, [loadDsSpMaps]);

    // -------------------------------------------------------------------------
    // DH Aggregate Data & Subrows Map
    // -------------------------------------------------------------------------
    const { dhMasterRows, dhSubrowItemsMap } = useMemo(() => {
        if (currentTab !== 'DH') {
            return { dhMasterRows: [], dhSubrowItemsMap: new Map() };
        }

        const masterMap = new Map();
        const itemsMap = new Map();

        allData.forEach((row) => {
            const mdh = String(row[3] || '').trim();
            if (!mdh) return;

            // Collect item
            if (!itemsMap.has(mdh)) {
                itemsMap.set(mdh, []);
            }
            itemsMap.get(mdh).push({
                sku: row[16] ?? '',
                id_sp: row[17] ?? '',
                slg: row[18] ?? 0,
                don_gia: row[19] ?? 0,
                thanh_tien: row[20] ?? 0,
                _sheetRow: row._sheetRow,
                _rawRow: row
            });

            // Master row
            if (!masterMap.has(mdh)) {
                const master = [...row];
                masterMap.set(mdh, master);
            }
        });

        return {
            dhMasterRows: Array.from(masterMap.values()),
            dhSubrowItemsMap: itemsMap
        };
    }, [currentTab, allData]);

    // -------------------------------------------------------------------------
    // DH Summary Stats & Filter Option Lists
    // -------------------------------------------------------------------------
    const {
        dhGianOptions,
        dhTinhTrangCounts,
        dhTrangThaiCounts,
        dhMonthOptions
    } = useMemo(() => {
        if (currentTab !== 'DH') {
            return {
                dhGianOptions: [],
                dhTinhTrangCounts: new Map(),
                dhTrangThaiCounts: new Map(),
                dhMonthOptions: []
            };
        }

        const gianSet = new Set();
        const ttCounts = new Map();
        const thCounts = new Map();
        const monthCounts = new Map();

        dhMasterRows.forEach((row) => {
            const gian = String(row[0] || '').trim();
            if (gian && gian.toUpperCase() !== 'GIAN') gianSet.add(gian);

            const tt = String(row[14] || '').trim().toUpperCase();
            if (tt) {
                ttCounts.set(tt, (ttCounts.get(tt) || 0) + 1);
            } else {
                ttCounts.set('(TRỐNG)', (ttCounts.get('(TRỐNG)') || 0) + 1);
            }

            const th = String(row[15] || '').trim().toUpperCase();
            if (th) {
                thCounts.set(th, (thCounts.get(th) || 0) + 1);
            } else {
                thCounts.set('(TRỐNG)', (thCounts.get('(TRỐNG)') || 0) + 1);
            }

            const d = parseDhDate(row[2]) || parseDhDate(row[1]);
            if (d) {
                const mStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                monthCounts.set(mStr, (monthCounts.get(mStr) || 0) + 1);
            }
        });

        const sortedMonths = Array.from(monthCounts.entries()).sort((a, b) => {
            const [mA, yA] = a[0].split('/').map(Number);
            const [mB, yB] = b[0].split('/').map(Number);
            if (yB !== yA) return yB - yA;
            return mB - mA;
        }).map(([key, count]) => ({ key, count }));

        return {
            dhGianOptions: Array.from(gianSet).sort(),
            dhTinhTrangCounts: ttCounts,
            dhTrangThaiCounts: thCounts,
            dhMonthOptions: sortedMonths
        };
    }, [currentTab, dhMasterRows]);

    // -------------------------------------------------------------------------
    // Filtering Logic
    // -------------------------------------------------------------------------
    const filteredRows = useMemo(() => {
        const source = (currentTab === 'DH') ? dhMasterRows : allData;
        const term = searchTerm.toLowerCase().trim();
        const terms = term.split(',').map(s => s.trim()).filter(Boolean);

        return source.filter((row) => {
            // General multi-term search
            if (terms.length > 0) {
                const match = (currentTab === 'DH')
                    ? allData.some(item =>
                        String(item[3] || '').trim() === String(row[3] || '').trim() &&
                        item.some(cell => String(cell || '').toLowerCase().includes(term))
                    )
                    : row.some(cell => String(cell || '').toLowerCase().includes(term));
                if (!match) return false;
            }

            // Trường filter
            if (truongFilter) {
                const truongVal = String(row[1] || '').toLowerCase();
                if (!truongVal.includes(truongFilter.toLowerCase())) return false;
            }

            // Store filter (for WEB_SP, SP_GIAM_GIA)
            if (storeFilter && (currentTab === 'WEB_SP' || currentTab === 'SP_GIAM_GIA')) {
                const storeIdx = currentTab === 'WEB_SP' ? 1 : 8;
                const rowStore = String(row[storeIdx] || '').trim().toLowerCase();
                if (rowStore !== storeFilter.toLowerCase()) return false;
            }

            // DS_SP & TINH_GIA Excluded SP_BO products filter
            if (currentTab === 'DS_SP' || currentTab === 'TINH_GIA') {
                const idCon = String(row[0] || '').trim().toUpperCase();
                const idSp = String(row[1] || '').trim().toUpperCase();
                if (spBoSet.size > 0) {
                    if (idCon && spBoSet.has(idCon)) return false;
                    if (idSp && !idCon && spBoSet.has(idSp)) return false;
                }
                if (currentTab === 'TINH_GIA' && String(row[0] || '').trim().length <= 5) {
                    return false;
                }

                // 1-char and 2-char prefix filters
                const code = String(row[1] || '').toUpperCase();
                if (prefix1Filter && !code.startsWith(prefix1Filter)) return false;
                if (prefix2Filter && !code.startsWith(prefix2Filter)) return false;
            }

            // WEB_SP Prefix filter
            if (currentTab === 'WEB_SP') {
                const skuCode = String(row[2] || '').trim().toUpperCase();
                if (prefix1Filter && !skuCode.startsWith(prefix1Filter)) return false;
                if (prefix2Filter && !skuCode.startsWith(prefix2Filter)) return false;
            }

            // DH Specific Filters
            if (currentTab === 'DH') {
                // Gian hang filter
                if (selectedDhGianSet.size > 0) {
                    const rowGian = String(row[0] || '').trim();
                    if (!selectedDhGianSet.has(rowGian)) return false;
                }

                // Tinh trang filter
                if (selectedDhTinhTrangSet.size > 0) {
                    const tt = String(row[14] || '').trim().toUpperCase();
                    if (selectedDhTinhTrangSet.has('(TRỐNG)')) {
                        if (tt && !selectedDhTinhTrangSet.has(tt)) return false;
                    } else {
                        if (!selectedDhTinhTrangSet.has(tt)) return false;
                    }
                }

                // Trang thai filter
                if (selectedDhTrangThaiSet.size > 0) {
                    const th = String(row[15] || '').trim().toUpperCase();
                    if (selectedDhTrangThaiSet.has('(TRỐNG)')) {
                        if (th && !selectedDhTrangThaiSet.has(th)) return false;
                    } else {
                        if (!selectedDhTrangThaiSet.has(th)) return false;
                    }
                }

                // Month filter
                if (selectedMonth) {
                    const d = parseDhDate(row[2]) || parseDhDate(row[1]);
                    if (!d) return false;
                    const mStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                    if (mStr !== selectedMonth) return false;
                }

                // Date Range filter
                if (dateFrom || dateTo) {
                    const d = parseDhDate(row[2]) || parseDhDate(row[1]);
                    if (!d) return false;
                    const time = d.getTime();
                    if (dateFrom && time < new Date(dateFrom + 'T00:00:00').getTime()) return false;
                    if (dateTo && time > new Date(dateTo + 'T23:59:59').getTime()) return false;
                }
            }

            return true;
        });
    }, [
        currentTab,
        dhMasterRows,
        allData,
        searchTerm,
        truongFilter,
        storeFilter,
        spBoSet,
        prefix1Filter,
        prefix2Filter,
        selectedDhGianSet,
        selectedDhTinhTrangSet,
        selectedDhTrangThaiSet,
        selectedMonth,
        dateFrom,
        dateTo
    ]);

    // -------------------------------------------------------------------------
    // Sorting Logic
    // -------------------------------------------------------------------------
    const sortedRows = useMemo(() => {
        if (!sortCol || !sortDir) {
            if (currentTab === 'DH') {
                return [...filteredRows].sort((a, b) => {
                    const da = parseDhDate(a[2]) || parseDhDate(a[1]) || new Date(0);
                    const db = parseDhDate(b[2]) || parseDhDate(b[1]) || new Date(0);
                    return db - da;
                });
            }
            if (currentTab === 'DS_SP' || currentTab === 'SP_GIAM_GIA') {
                return [...filteredRows].sort((a, b) => String(b[0] || '').localeCompare(String(a[0] || '')));
            }
            if (currentTab === 'TINH_GIA') {
                return [...filteredRows].sort((a, b) => String(b[1] || '').localeCompare(String(a[1] || '')));
            }
            if (currentTab === 'WEB_SP') {
                return [...filteredRows].sort((a, b) => String(b[2] || '').localeCompare(String(a[2] || ''), 'vi', { numeric: true, sensitivity: 'base' }));
            }
            return filteredRows;
        }

        const colIdx = storageHeaders.indexOf(sortCol);
        const isNumeric = priceCols.includes(colIdx);

        return [...filteredRows].sort((a, b) => {
            const valA = (colIdx >= 0 ? a[colIdx] : a[sortCol]) ?? '';
            const valB = (colIdx >= 0 ? b[colIdx] : b[sortCol]) ?? '';

            if (isNumeric) {
                const numA = parseMoney(valA);
                const numB = parseMoney(valB);
                return sortDir === 'asc' ? numA - numB : numB - numA;
            }

            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortDir === 'asc'
                ? strA.localeCompare(strB, 'vi')
                : strB.localeCompare(strA, 'vi');
        });
    }, [filteredRows, sortCol, sortDir, storageHeaders, priceCols, currentTab]);

    const handleSort = (col) => {
        if (sortCol === col) {
            if (sortDir === 'asc') setSortDir('desc');
            else if (sortDir === 'desc') {
                setSortCol(null);
                setSortDir(null);
            }
        } else {
            setSortCol(col);
            setSortDir('asc');
        }
    };

    // -------------------------------------------------------------------------
    // Pagination Slicing
    // -------------------------------------------------------------------------
    const rowsPerPage = 100;
    const totalRows = sortedRows.length;
    const paginatedRows = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return sortedRows.slice(start, start + rowsPerPage);
    }, [sortedRows, currentPage, rowsPerPage]);

    // -------------------------------------------------------------------------
    // DH Financial Totals for Stat Cards
    // -------------------------------------------------------------------------
    const { dhTotalOrders, dhTotalRevenue, dhTotalProfit } = useMemo(() => {
        if (currentTab !== 'DH') return { dhTotalOrders: 0, dhTotalRevenue: 0, dhTotalProfit: 0 };

        let rev = 0;
        let profit = 0;
        filteredRows.forEach((r) => {
            rev += parseMoney(r[10] || 0);    // doanh_thu
            profit += parseMoney(r[13] || 0); // loi_nhuan
        });

        return {
            dhTotalOrders: filteredRows.length,
            dhTotalRevenue: rev,
            dhTotalProfit: profit
        };
    }, [currentTab, filteredRows]);

    // -------------------------------------------------------------------------
    // Selection Handlers
    // -------------------------------------------------------------------------
    const handleToggleSelectRow = (id, checked) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const handleToggleSelectAll = (checked) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            paginatedRows.forEach(r => {
                const id = currentTab === 'DH' ? String(r[3] || '').trim() : String(r[0] || '').trim();
                if (id) {
                    if (checked) next.add(id);
                    else next.delete(id);
                }
            });
            return next;
        });
    };

    const allSelectedOnPage = useMemo(() => {
        if (paginatedRows.length === 0) return false;
        return paginatedRows.every(r => {
            const id = currentTab === 'DH' ? String(r[3] || '').trim() : String(r[0] || '').trim();
            return id && selectedIds.has(id);
        });
    }, [paginatedRows, selectedIds, currentTab]);

    // -------------------------------------------------------------------------
    // Subrow Expand / Collapse
    // -------------------------------------------------------------------------
    const handleToggleSubrow = (mdh) => {
        setExpandedSubrows(prev => {
            const next = new Set(prev);
            if (next.has(mdh)) next.delete(mdh);
            else next.add(mdh);
            return next;
        });
    };

    // -------------------------------------------------------------------------
    // DH Subrow Items Save
    // -------------------------------------------------------------------------
    const handleSaveSubrowItems = async (mdh, updatedItems) => {
        // Find existing raw rows for this mdh
        const existingRows = allData.filter(r => String(r[3] || '').trim() === mdh);
        if (!existingRows.length) return;

        const firstExisting = existingRows[0];
        const newTotalTienSp = updatedItems.reduce((acc, item) => acc + (Math.max(0, item.slg) * parseMoney(item.don_gia)), 0);

        const tinhTrangVal = String(firstExisting[14] || '').trim().toUpperCase();
        const isCanceled = tinhTrangVal === 'HỦY';
        const isReturned = ['HOÀN', 'TRẢ', 'HOÀN TRẢ'].includes(tinhTrangVal);

        const tongTien = parseMoney(firstExisting[5]);
        const phiVc = parseMoney(firstExisting[7]);
        const phuPhi = parseMoney(firstExisting[8]);
        const thue = parseMoney(firstExisting[9]);
        const phiKhac = parseMoney(firstExisting[11]);

        const calcTienSp = (isCanceled || isReturned) ? 0 : newTotalTienSp;
        const calcDoanhThu = isCanceled ? 0 : (tongTien - (phiVc + phuPhi + thue + phiKhac));
        const calcLoiNhuan = calcDoanhThu - calcTienSp;

        // Build new rows
        const itemsToUpdate = [];
        const rowsToAppend = [];

        updatedItems.forEach((item, idx) => {
            let rowData;
            if (idx < existingRows.length) {
                rowData = [...existingRows[idx]];
            } else {
                rowData = [...firstExisting];
                rowData._sheetRow = null;
            }

            rowData[10] = calcDoanhThu;
            rowData[12] = calcTienSp;
            rowData[13] = calcLoiNhuan;
            rowData[16] = item.sku;
            rowData[17] = item.id_sp;
            rowData[18] = item.slg;
            rowData[19] = item.don_gia;
            rowData[20] = item.slg * item.don_gia;

            if (idx < existingRows.length) {
                itemsToUpdate.push({ sheetRow: rowData._sheetRow, row: rowData });
            } else {
                rowsToAppend.push(rowData);
            }
        });

        // Write batch
        if (itemsToUpdate.length > 0) {
            await batchWriteRecordRows('DH', itemsToUpdate);
        }
        if (rowsToAppend.length > 0) {
            await appendRecordRows('DH', rowsToAppend);
        }

        // Live update allData state
        setAllData(prev => {
            const next = [...prev];
            itemsToUpdate.forEach(up => {
                const idx = next.findIndex(r => r._sheetRow === up.sheetRow);
                if (idx >= 0) next[idx] = up.row;
            });
            rowsToAppend.forEach(appRow => {
                next.push(appRow);
            });
            return next;
        });

        showToast(`✅ Đã lưu thành công ${updatedItems.length} sản phẩm đơn ${mdh}!`);
    };

    // -------------------------------------------------------------------------
    // DH Detail Modal Open & Save
    // -------------------------------------------------------------------------
    const handleOpenDhDetail = (mdh) => {
        const cleanMdh = String(mdh || '').trim();
        const rows = allData.filter(r => String(r[3] || '').trim() === cleanMdh);
        if (!rows.length) {
            alert(`Không tìm thấy dữ liệu cho đơn hàng ${cleanMdh}`);
            return;
        }

        const firstRow = rows[0];
        const orderData = {
            gian: firstRow[0],
            ngay: firstRow[1],
            ngay_gio: firstRow[2],
            mdh: firstRow[3],
            mvd: firstRow[4],
            tong_tien: firstRow[5],
            ma_giam_gia: firstRow[6],
            phi_vc: firstRow[7],
            phuPhi: firstRow[8],
            thue: firstRow[9],
            doanh_thu: firstRow[10],
            phi_khac: firstRow[11],
            tien_sp: firstRow[12],
            loi_nhuan: firstRow[13],
            tinh_trang: firstRow[14],
            trang_thai: firstRow[15],
            ten_khach: firstRow[21],
            ng_nhan: firstRow[22],
            dia_chi: firstRow[23],
            link_don: firstRow[24],
            mvd_huy: firstRow[25],
            mdh_huy: firstRow[26]
        };

        const items = rows.map(r => ({
            sku: r[16] ?? '',
            id_sp: r[17] ?? '',
            slg: r[18] ?? 0,
            don_gia: r[19] ?? 0,
            thanh_tien: r[20] ?? 0,
            _sheetRow: r._sheetRow
        }));

        setEditingDhMdh(cleanMdh);
        setEditingDhOrderData(orderData);
        setEditingDhItems(items);
        setDhDetailModalOpen(true);
    };

    const handleSaveDhDetail = async (updatedOrderData, updatedItems) => {
        const mdh = updatedOrderData.mdh;
        const existingRows = allData.filter(r => String(r[3] || '').trim() === mdh);
        if (!existingRows.length) return;

        const itemsToUpdate = [];
        const rowsToAppend = [];

        updatedItems.forEach((item, idx) => {
            let rowData;
            if (idx < existingRows.length) {
                rowData = [...existingRows[idx]];
            } else {
                rowData = [...existingRows[0]];
                rowData._sheetRow = null;
            }

            rowData[0] = updatedOrderData.gian;
            rowData[1] = updatedOrderData.ngay;
            rowData[2] = updatedOrderData.ngay_gio;
            rowData[3] = updatedOrderData.mdh;
            rowData[4] = updatedOrderData.mvd;
            rowData[5] = updatedOrderData.tong_tien;
            rowData[6] = updatedOrderData.ma_giam_gia;
            rowData[7] = updatedOrderData.phi_vc;
            rowData[8] = updatedOrderData.phu_phi;
            rowData[9] = updatedOrderData.thue;
            rowData[10] = updatedOrderData.doanh_thu;
            rowData[11] = updatedOrderData.phi_khac;
            rowData[12] = updatedOrderData.tien_sp;
            rowData[13] = updatedOrderData.loi_nhuan;
            rowData[14] = updatedOrderData.tinh_trang;
            rowData[15] = updatedOrderData.trang_thai;
            rowData[16] = item.sku;
            rowData[17] = item.id_sp;
            rowData[18] = item.slg;
            rowData[19] = item.don_gia;
            rowData[20] = item.slg * item.don_gia;
            rowData[21] = updatedOrderData.ten_khach;
            rowData[22] = updatedOrderData.ng_nhan;
            rowData[23] = updatedOrderData.dia_chi;
            rowData[24] = updatedOrderData.link_don;
            rowData[25] = updatedOrderData.mvd_huy;
            rowData[26] = updatedOrderData.mdh_huy;

            if (idx < existingRows.length) {
                itemsToUpdate.push({ sheetRow: rowData._sheetRow, row: rowData });
            } else {
                rowsToAppend.push(rowData);
            }
        });

        if (itemsToUpdate.length > 0) {
            await batchWriteRecordRows('DH', itemsToUpdate);
        }
        if (rowsToAppend.length > 0) {
            await appendRecordRows('DH', rowsToAppend);
        }

        setAllData(prev => {
            const next = [...prev];
            itemsToUpdate.forEach(up => {
                const idx = next.findIndex(r => r._sheetRow === up.sheetRow);
                if (idx >= 0) next[idx] = up.row;
            });
            rowsToAppend.forEach(appRow => {
                next.push(appRow);
            });
            return next;
        });

        showToast(`✅ Đã lưu thành công đơn hàng ${mdh}!`);
    };

    // -------------------------------------------------------------------------
    // DH Batch Delete Orders
    // -------------------------------------------------------------------------
    const handleDeleteSelectedOrders = async () => {
        const count = selectedIds.size;
        if (count === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn xóa ${count} đơn hàng đã chọn khỏi Google Sheets?`)) {
            return;
        }

        setIsLoading(true);
        setLoadingText(`Đang xóa ${count} đơn hàng khỏi Google Sheets...`);
        try {
            const sheetRowsToDelete = [];
            selectedIds.forEach((mdh) => {
                const matching = allData.filter(r => String(r[3] || '').trim() === mdh);
                matching.forEach(r => {
                    if (r._sheetRow) sheetRowsToDelete.push(r._sheetRow);
                });
            });

            await deleteSheetRows('DH', sheetRowsToDelete);

            // Filter out in local state
            setAllData(prev => prev.filter(r => !selectedIds.has(String(r[3] || '').trim())));
            setSelectedIds(new Set());
            showToast(`🗑️ Đã xóa thành công ${count} đơn hàng!`);
        } catch (err) {
            console.error('Error deleting orders:', err);
            showToast(`❌ Lỗi khi xóa đơn hàng: ${err.message || err}`);
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    // DH Batch Clear Tinh Trang for Selected Orders
    // -------------------------------------------------------------------------
    const handleClearSelectedTinhTrang = async () => {
        const count = selectedIds.size;
        if (count === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn XÓA TÌNH TRẠNG của ${count} đơn hàng đã chọn trên Google Sheets?`)) {
            return;
        }

        setIsLoading(true);
        setLoadingText(`Đang xóa tình trạng của ${count} đơn hàng trên Google Sheets...`);
        try {
            const itemsToUpdate = [];
            const nextData = [...allData];

            nextData.forEach((row, i) => {
                const mdh = String(row[3] || '').trim();
                if (selectedIds.has(mdh)) {
                    const updated = [...row];
                    updated[14] = ''; // Xóa dữ liệu cột tinh_trang (index 14)
                    if (String(updated[15] || '').trim().toUpperCase() === 'XUNG ĐỘT') {
                        updated[15] = ''; // Giải phóng trạng thái xung đột nếu có
                    }
                    nextData[i] = updated;
                    if (row._sheetRow) {
                        itemsToUpdate.push({ sheetRow: row._sheetRow, row: updated });
                    }
                }
            });

            if (itemsToUpdate.length > 0) {
                await batchWriteRecordRows('DH', itemsToUpdate);
            }

            setAllData(nextData);
            showToast(`✅ Đã xóa tình trạng của ${count} đơn hàng thành công!`);
        } catch (err) {
            console.error('Error clearing tinh_trang:', err);
            showToast(`❌ Lỗi khi xóa tình trạng: ${err.message || err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearDsSpTinhTrang = async () => {
        const count = selectedIds.size;
        if (count === 0) return;
        if (!window.confirm(`Bạn có chắc chắn muốn XÓA TÌNH TRẠNG của ${count} sản phẩm đã chọn trên Google Sheets?`)) {
            return;
        }

        setIsLoading(true);
        setLoadingText(`Đang xóa tình trạng của ${count} sản phẩm trên Google Sheets...`);
        try {
            const itemsToUpdate = [];
            const nextData = [...allData];

            nextData.forEach((row, i) => {
                const idCon = String(row[0] || '').trim();
                const idSp = String(row[1] || '').trim();
                if (selectedIds.has(idCon) || selectedIds.has(idSp)) {
                    const updated = [...row];
                    updated[9] = ''; // Cột tinh_trang trong DS_SP (index 9)
                    nextData[i] = updated;
                    if (row._sheetRow) {
                        itemsToUpdate.push({ sheetRow: row._sheetRow, row: updated });
                    }
                }
            });

            if (itemsToUpdate.length > 0) {
                await batchWriteRecordRows('DS_SP', itemsToUpdate);
            }

            setAllData(nextData);
            showToast(`✅ Đã xóa tình trạng của ${count} sản phẩm thành công!`);
        } catch (err) {
            console.error('Error clearing DS_SP tinh_trang:', err);
            showToast(`❌ Lỗi khi xóa tình trạng: ${err.message || err}`);
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    // TINH_GIA Operations (Custom buttons, inline edits, batch profit, SP_BO)
    // -------------------------------------------------------------------------
    const handleAddCustomButtons = (newButtons) => {
        const next = [...customButtons];
        newButtons.forEach(b => {
            if (!next.includes(b)) next.push(b);
        });
        setCustomButtons(next);
        try {
            localStorage.setItem(CUSTOM_BUTTONS_KEY, JSON.stringify(next));
        } catch (_) {}
    };

    const handleRemoveCustomButton = (btnToRemove) => {
        const next = customButtons.filter(b => b !== btnToRemove);
        setCustomButtons(next);
        try {
            localStorage.setItem(CUSTOM_BUTTONS_KEY, JSON.stringify(next));
        } catch (_) {}
    };

    const handleInlineTinhGiaChange = (rowIndex, header, value) => {
        setAllData(prev => {
            const next = [...prev];
            const targetRow = [...next[rowIndex]];
            const idx = storageHeaders.indexOf(header);
            if (idx >= 0) {
                targetRow[idx] = value;
                const recalculated = recalculateTinhGiaRowData(targetRow);
                next[rowIndex] = recalculated;
            }
            return next;
        });
    };

    const handleSaveInlineTinhGia = async (rowIndex) => {
        const targetRow = allData[rowIndex];
        if (!targetRow || !targetRow._sheetRow) return;
        try {
            await writeRecordRow('TINH_GIA', targetRow, targetRow._sheetRow);
            showToast('✅ Đã lưu giá sản phẩm!');
        } catch (err) {
            console.error('Error saving inline pricing:', err);
            showToast(`❌ Lỗi lưu giá: ${err.message || err}`);
        }
    };

    const handleQuickLoiNhuan = async (row, rowIndex, profitPercent) => {
        try {
            const rate = profitPercent / 100;
            const recalculated = recalculateTinhGiaRowByProfitRate(row, rate);

            setAllData(prev => {
                const next = [...prev];
                const actualIndex = next.findIndex(r => r._sheetRow === row._sheetRow);
                if (actualIndex >= 0) {
                    next[actualIndex] = recalculated;
                } else if (rowIndex < next.length) {
                    next[rowIndex] = recalculated;
                }
                return next;
            });

            if (recalculated._sheetRow) {
                await writeRecordRow('TINH_GIA', recalculated, recalculated._sheetRow);
                showToast(`✅ Đã đặt Lợi nhuận = ${profitPercent}% & lưu thành công!`);
            }
        } catch (err) {
            console.error('Error quick loi nhuan:', err);
            showToast(`❌ Lỗi đặt lợi nhuận: ${err.message || err}`);
        }
    };

    const handleQuickGiaDang = async (row, rowIndex) => {
        try {
            const updated = [...row];
            const giaThapNhat = parseMoney(updated[6] || 0);
            let recalculated;
            if (giaThapNhat > 0) {
                updated[9] = giaThapNhat; // gia_đăng
                recalculated = recalculateTinhGiaRowData(updated);
            } else {
                // Nếu chưa có giá thấp nhất -> tính theo Lợi nhuận 10%
                recalculated = recalculateTinhGiaRowByProfitRate(row, 0.10);
            }

            setAllData(prev => {
                const next = [...prev];
                const actualIndex = next.findIndex(r => r._sheetRow === row._sheetRow);
                if (actualIndex >= 0) {
                    next[actualIndex] = recalculated;
                } else if (rowIndex < next.length) {
                    next[rowIndex] = recalculated;
                }
                return next;
            });

            if (recalculated._sheetRow) {
                await writeRecordRow('TINH_GIA', recalculated, recalculated._sheetRow);
                showToast(giaThapNhat > 0 ? `✅ Đã điền Giá thấp nhất: ${formatDisplayNumber(giaThapNhat)} đ!` : `💡 Chưa có giá thấp nhất, đã tính theo Lợi nhuận 10%!`);
            }
        } catch (err) {
            console.error('Error quick gia dang:', err);
            showToast(`❌ Lỗi điền giá thấp nhất: ${err.message || err}`);
        }
    };

    const handleQuickFees = async (row, rowIndex) => {
        try {
            const updated = [...row];
            updated[12] = '11%';
            updated[14] = '6%';
            updated[16] = '5.5%';
            updated[18] = '1.5%';
            const recalculated = recalculateTinhGiaRowData(updated);

            setAllData(prev => {
                const next = [...prev];
                const actualIndex = next.findIndex(r => r._sheetRow === row._sheetRow);
                if (actualIndex >= 0) {
                    next[actualIndex] = recalculated;
                } else if (rowIndex < next.length) {
                    next[rowIndex] = recalculated;
                }
                return next;
            });

            if (recalculated._sheetRow) {
                await writeRecordRow('TINH_GIA', recalculated, recalculated._sheetRow);
                showToast('⚡ Đã điền các phí mặc định (11% Cố định, 6% GD, 5.5% XTRA, 1.5% Thuế)!');
            }
        } catch (err) {
            console.error('Error quick fees:', err);
            showToast(`❌ Lỗi điền phí: ${err.message || err}`);
        }
    };

    const handleBatchDefaultFees = async () => {
        const targetIds = selectedIds.size > 0 ? selectedIds : new Set(filteredRows.map(r => String(r[0] || '').trim()));
        if (targetIds.size === 0) return;

        setIsLoading(true);
        setLoadingText('Đang điền các phí mặc định (11% Cố định, 6% GD, 5.5% XTRA, 1.5% Thuế)...');
        try {
            const itemsToUpdate = [];
            const nextData = [...allData];

            nextData.forEach((row, i) => {
                const pId = String(row[0] || '').trim();
                if (targetIds.has(pId)) {
                    const updated = [...row];
                    updated[12] = '11%';
                    updated[14] = '6%';
                    updated[16] = '5.5%';
                    updated[18] = '1.5%';
                    const recalculated = recalculateTinhGiaRowData(updated);
                    nextData[i] = recalculated;
                    itemsToUpdate.push({ sheetRow: row._sheetRow, row: recalculated });
                }
            });

            await batchWriteRecordRows('TINH_GIA', itemsToUpdate);
            setAllData(nextData);
            showToast(`⚡ Đã điền các phí mặc định cho ${itemsToUpdate.length} sản phẩm!`);
        } catch (err) {
            console.error('Error batch updating fees:', err);
            showToast(`❌ Lỗi điền phí mặc định: ${err.message || err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBatchTinhGiaProfit = async (profitRate) => {
        if (selectedIds.size === 0) return;
        setIsLoading(true);
        setLoadingText(`Đang cập nhật lợi nhuận ${(profitRate * 100).toFixed(1)}%...`);
        try {
            const itemsToUpdate = [];
            const nextData = [...allData];

            nextData.forEach((row, i) => {
                const pId = String(row[0] || '').trim();
                if (selectedIds.has(pId)) {
                    const recalculated = recalculateTinhGiaRowByProfitRate(row, profitRate);
                    nextData[i] = recalculated;
                    itemsToUpdate.push({ sheetRow: row._sheetRow, row: recalculated });
                }
            });

            await batchWriteRecordRows('TINH_GIA', itemsToUpdate);
            setAllData(nextData);
            showToast(`✅ Đã cập nhật lợi nhuận cho ${itemsToUpdate.length} sản phẩm!`);
        } catch (err) {
            console.error('Error batch updating profit:', err);
            showToast(`❌ Lỗi cập nhật lợi nhuận: ${err.message || err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBatchMinPrice = async () => {
        const targetIds = selectedIds.size > 0 ? selectedIds : new Set(filteredRows.map(r => String(r[0] || '').trim()));
        if (targetIds.size === 0) return;

        setIsLoading(true);
        setLoadingText('Đang cập nhật giá đăng = giá bán thấp nhất...');
        try {
            const itemsToUpdate = [];
            const nextData = [...allData];

            nextData.forEach((row, i) => {
                const pId = String(row[0] || '').trim();
                if (targetIds.has(pId)) {
                    const updated = [...row];
                    const giaThapNhat = parseMoney(updated[6] || 0);
                    let recalculated;
                    if (giaThapNhat > 0) {
                        updated[9] = giaThapNhat; // gia_đăng
                        recalculated = recalculateTinhGiaRowData(updated);
                    } else {
                        // SP chưa có giá thấp nhất -> điền Lợi nhuận = 10% để tính giá đăng
                        recalculated = recalculateTinhGiaRowByProfitRate(row, 0.10);
                    }
                    nextData[i] = recalculated;
                    itemsToUpdate.push({ sheetRow: row._sheetRow, row: recalculated });
                }
            });

            await batchWriteRecordRows('TINH_GIA', itemsToUpdate);
            setAllData(nextData);
            showToast(`✅ Đã cập nhật giá đăng cho ${itemsToUpdate.length} sản phẩm!`);
        } catch (err) {
            console.error('Error updating min price:', err);
            showToast(`❌ Lỗi cập nhật giá thấp nhất: ${err.message || err}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoveToSpBo = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Bạn có chắc muốn chuyển ${selectedIds.size} sản phẩm sang SP_BO và ẩn khỏi bảng?`)) return;

        setIsLoading(true);
        setLoadingText('Đang chuyển sản phẩm sang SP_BO...');
        try {
            await ensureSpBoSheetExists();
            const rowsToBo = [];
            allData.forEach(row => {
                const pId = String(row[0] || '').trim();
                if (selectedIds.has(pId)) {
                    rowsToBo.push([row[0] ?? '', row[1] ?? '', row[2] ?? '']);
                }
            });

            await appendRecordRows('SP_BO', rowsToBo);

            // Update spBoSet
            setSpBoSet(prev => {
                const next = new Set(prev);
                rowsToBo.forEach(r => {
                    if (r[0]) next.add(String(r[0]).trim().toUpperCase());
                    if (r[1]) next.add(String(r[1]).trim().toUpperCase());
                });
                return next;
            });

            setSelectedIds(new Set());
            showToast(`🗑️ Đã chuyển ${rowsToBo.length} sản phẩm sang SP_BO!`);
        } catch (err) {
            console.error('Error moving to SP_BO:', err);
            showToast(`❌ Lỗi chuyển SP_BO: ${err.message || err}`);
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    // RecordModal Save (Generic Add / Edit)
    // -------------------------------------------------------------------------
    const handleSaveRecord = async (rowValues, sheetRow) => {
        if (sheetRow && sheetRow >= 2) {
            await writeRecordRow(currentTab, rowValues, sheetRow);
            setAllData(prev => {
                const next = [...prev];
                const idx = next.findIndex(r => r._sheetRow === sheetRow);
                if (idx >= 0) {
                    const updated = [...rowValues];
                    updated._sheetRow = sheetRow;
                    next[idx] = updated;
                }
                return next;
            });
            showToast(`✅ Đã cập nhật dòng trong sheet '${currentTab}'!`);
        } else {
            await appendRecordRows(currentTab, [rowValues]);
            await loadData(currentTab);
            showToast(`✅ Đã thêm mới dòng vào sheet '${currentTab}'!`);
        }
    };

    // -------------------------------------------------------------------------
    // Image Search Modal Save (DS_SP Column K)
    // -------------------------------------------------------------------------
    const handleSaveImageToRow = async (url) => {
        if (!imageTarget || !imageTarget.row) return;
        const row = imageTarget.row;
        const sheetRow = row._sheetRow;
        if (!sheetRow) return;

        const imgCol = tabConfig.imgCol ?? 10;
        const existing = String(row[imgCol] || '').trim();
        let newVal = url;
        if (existing && !existing.includes(url)) {
            newVal = existing + ' | ' + url;
        }

        const updatedRow = [...row];
        updatedRow[imgCol] = newVal;

        await writeRecordRow(currentTab, updatedRow, sheetRow);

        setAllData(prev => {
            const next = [...prev];
            const idx = next.findIndex(r => r._sheetRow === sheetRow);
            if (idx >= 0) next[idx] = updatedRow;
            return next;
        });

        showToast(`✅ Đã lưu ảnh sản phẩm vào Cột K!`);
    };

    // -------------------------------------------------------------------------
    // Excel Upload Handler (Drag & Drop or File Input)
    // -------------------------------------------------------------------------
    const handleProcessFiles = async (files) => {
        const excelFiles = files.filter(f => /\.(xlsx|xls|csv)$/i.test(f.name));
        if (!excelFiles.length) {
            alert('Vui lòng tải lên file Excel hoặc CSV (.xlsx, .xls, .csv)');
            return;
        }

        const fileNames = excelFiles.map(f => f.name).join(', ');
        const isOverwriteTab = currentTab === 'DS_SP' || currentTab === 'SP_GIAM_GIA';
        const confirmMsg = isOverwriteTab
            ? `Dữ liệu từ ${excelFiles.length} file (${fileNames}) sẽ XÓA TOÀN BỘ dữ liệu cũ trong sheet '${currentTab}' rồi ghi dữ liệu mới. Bạn có chắc chắn muốn tiếp tục?`
            : `Dữ liệu từ ${excelFiles.length} file (${fileNames}) sẽ được thêm vào sheet '${currentTab}'. Tiếp tục?`;

        if (!window.confirm(confirmMsg)) return;

        setIsLoading(true);
        setLoadingText(`Đang xử lý ${excelFiles.length} file và cập nhật Google Sheets...`);
        try {
            let allRowsToUpload = [];

            if (currentTab === 'DS_SP') {
                const fileRows = await Promise.all(excelFiles.map(readDsSpExcelRows));
                allRowsToUpload = fileRows.flat();
            } else if (currentTab === 'SP_GIAM_GIA') {
                const fileRows = await Promise.all(excelFiles.map(f => readHeaderMappedExcelRows(f, 'SP_GIAM_GIA')));
                allRowsToUpload = fileRows.flat();
            } else {
                const fileRows = await Promise.all(excelFiles.map(readGenericExcelRows));
                allRowsToUpload = fileRows.flat();
            }

            if (!allRowsToUpload.length) {
                alert('Không có dữ liệu hợp lệ trong file.');
                return;
            }

            if (isOverwriteTab) {
                await clearCurrentTabData(currentTab);
                await appendRecordRows(currentTab, allRowsToUpload);
                showToast(`✅ Đã xóa cũ và ghi mới ${allRowsToUpload.length} dòng vào sheet '${currentTab}'!`);
            } else {
                await appendRecordRows(currentTab, allRowsToUpload);
                showToast(`✅ Đã thêm mới ${allRowsToUpload.length} dòng vào sheet '${currentTab}'!`);
            }

            await loadData(currentTab);
        } catch (err) {
            console.error('Error processing Excel files:', err);
            alert('Lỗi xử lý file: ' + (err.message || err));
        } finally {
            setIsLoading(false);
        }
    };

    // Quick Date Handler for DH
    const handleQuickDate = (type) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const day = now.getDate();
        const dayOfWeek = now.getDay();

        const format = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dt = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${dt}`;
        };

        if (type === 'today') {
            const todayStr = format(new Date(year, month, day));
            setDateFrom(todayStr);
            setDateTo(todayStr);
        } else if (type === 'thisWeek') {
            const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
            const start = new Date(now.setDate(diff));
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            setDateFrom(format(start));
            setDateTo(format(end));
        } else if (type === 'thisMonth') {
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 0);
            setDateFrom(format(start));
            setDateTo(format(end));
        } else if (type === 'lastMonth') {
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0);
            setDateFrom(format(start));
            setDateTo(format(end));
        }
    };

    // Clear All DH Filters
    const handleClearDhFilters = () => {
        setSelectedDhGianSet(new Set());
        setSelectedDhTinhTrangSet(new Set());
        setSelectedDhTrangThaiSet(new Set());
        setSelectedMonth('');
        setDateFrom('');
        setDateTo('');
        setSearchTerm('');
    };

    // -------------------------------------------------------------------------
    // Drag and Drop Listeners
    // -------------------------------------------------------------------------
    useEffect(() => {
        let dragCounter = 0;

        const handleDragEnter = (e) => {
            e.preventDefault();
            dragCounter++;
            if (e.dataTransfer?.items?.length) {
                setIsDragOver(true);
            }
        };

        const handleDragLeave = (e) => {
            e.preventDefault();
            dragCounter--;
            if (dragCounter <= 0) {
                setIsDragOver(false);
                dragCounter = 0;
            }
        };

        const handleDragOver = (e) => {
            e.preventDefault();
        };

        const handleDrop = (e) => {
            e.preventDefault();
            dragCounter = 0;
            setIsDragOver(false);
            const files = Array.from(e.dataTransfer?.files || []);
            if (files.length > 0) {
                handleProcessFiles(files);
            }
        };

        window.addEventListener('dragenter', handleDragEnter);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragenter', handleDragEnter);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('drop', handleDrop);
        };
    }, [currentTab]);

    // Distinct stores for storeFilter dropdown in WEB_SP & SP_GIAM_GIA
    const storeDropdownOptions = useMemo(() => {
        if (currentTab !== 'WEB_SP' && currentTab !== 'SP_GIAM_GIA') return [];
        const storeIdx = currentTab === 'WEB_SP' ? 1 : 8;
        const set = new Set();
        allData.forEach(r => {
            const val = String(r[storeIdx] || '').trim();
            if (val) set.add(val);
        });
        return Array.from(set).sort();
    }, [currentTab, allData]);

    return (
        <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* Fullscreen Loading Spinner Mask */}
            <LoadingMask visible={isLoading} text={loadingText} />

            {/* Drag & Drop File Overlay */}
            <DropOverlay visible={isDragOver} currentTab={currentTab} />

            {/* Toast Notifications */}
            <ToastContainer />

            {/* Sidebar Navigation */}
            <Sidebar
                currentTab={currentTab}
                onTabChange={handleTabChange}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Application Area */}
            <main className="main-content">
                <div className="header-container">
                    {/* Top Action Bar */}
                    <HeaderActions
                        currentTab={currentTab}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        truongFilter={truongFilter}
                        onTruongFilterChange={setTruongFilter}
                        truongOptions={[]}
                        storeFilter={storeFilter}
                        onStoreFilterChange={setStoreFilter}
                        storeOptions={storeDropdownOptions}
                        onReload={() => loadData(currentTab)}
                        onUploadFiles={handleProcessFiles}
                        onAddNew={() => {
                            setEditingRecord(null);
                            setRecordModalOpen(true);
                        }}
                        onBatchMinPrice={handleBatchMinPrice}
                        onBatchDefaultFees={handleBatchDefaultFees}
                    />

                    {/* Tab DS_SP / TINH_GIA / WEB_SP: Prefix Filters Bar */}
                    {(currentTab === 'DS_SP' || currentTab === 'TINH_GIA' || currentTab === 'WEB_SP') && (
                        <DsSpPrefixFilters
                            rows={allData}
                            currentTab={currentTab}
                            prefix1Filter={prefix1Filter}
                            onPrefix1Change={setPrefix1Filter}
                            prefix2Filter={prefix2Filter}
                            onPrefix2Change={setPrefix2Filter}
                        />
                    )}

                    {/* Tab DS_SP or TINH_GIA: Batch Controls */}
                    {(currentTab === 'TINH_GIA' || currentTab === 'DS_SP') && (
                        <>
                            {currentTab === 'TINH_GIA' && (
                                <CustomCopyButtonsBar
                                    customButtons={customButtons}
                                    onAddButton={handleAddCustomButtons}
                                    onRemoveButton={handleRemoveCustomButton}
                                />
                            )}
                            <TinhGiaBatchControls
                                currentTab={currentTab}
                                selectedCount={selectedIds.size}
                                onBatchProfit={handleBatchTinhGiaProfit}
                                onBatchMinPrice={handleBatchMinPrice}
                                onBatchDefaultFees={handleBatchDefaultFees}
                                onMoveToSpBo={handleMoveToSpBo}
                                onClearTinhTrang={handleClearDsSpTinhTrang}
                            />
                        </>
                    )}

                    {/* Tab DH: Filter Bar, Batch Controls, and Summary Stats */}
                    {currentTab === 'DH' && (
                        <>
                            <DhFilterBar
                                gianOptions={dhGianOptions}
                                selectedGianSet={selectedDhGianSet}
                                onToggleGian={(g) => {
                                    setSelectedDhGianSet(prev => {
                                        const next = new Set(prev);
                                        if (next.has(g)) next.delete(g);
                                        else next.add(g);
                                        return next;
                                    });
                                }}
                                tinhTrangCounts={dhTinhTrangCounts}
                                selectedTinhTrangSet={selectedDhTinhTrangSet}
                                onToggleTinhTrang={(st) => {
                                    if (st === 'ALL') {
                                        setSelectedDhTinhTrangSet(new Set());
                                    } else {
                                        setSelectedDhTinhTrangSet(prev => {
                                            const next = new Set(prev);
                                            if (next.has(st)) next.delete(st);
                                            else next.add(st);
                                            return next;
                                        });
                                    }
                                }}
                                trangThaiCounts={dhTrangThaiCounts}
                                selectedTrangThaiSet={selectedDhTrangThaiSet}
                                onToggleTrangThai={(th) => {
                                    if (th === 'ALL') {
                                        setSelectedDhTrangThaiSet(new Set());
                                    } else {
                                        setSelectedDhTrangThaiSet(prev => {
                                            const next = new Set(prev);
                                            if (next.has(th)) next.delete(th);
                                            else next.add(th);
                                            return next;
                                        });
                                    }
                                }}
                                monthOptions={dhMonthOptions}
                                selectedMonth={selectedMonth}
                                onMonthChange={setSelectedMonth}
                                dateFrom={dateFrom}
                                onDateFromChange={setDateFrom}
                                dateTo={dateTo}
                                onDateToChange={setDateTo}
                                onQuickDate={handleQuickDate}
                                onClearFilters={handleClearDhFilters}
                            />

                            <DhBatchControls
                                selectedOrders={selectedIds}
                                onSelectAll={handleToggleSelectAll}
                                allSelected={allSelectedOnPage}
                                onDeleteSelected={handleDeleteSelectedOrders}
                                onClearTinhTrang={handleClearSelectedTinhTrang}
                            />

                            <DhSummaryStats
                                totalOrders={dhTotalOrders}
                                totalRevenue={dhTotalRevenue}
                                totalProfit={dhTotalProfit}
                            />
                        </>
                    )}
                </div>

                {/* Central Data Table */}
                <DataTable
                    currentTab={currentTab}
                    rows={paginatedRows}
                    storageHeaders={storageHeaders}
                    displayHeaders={displayHeaders}
                    priceCols={priceCols}
                    selectedIds={selectedIds}
                    onToggleSelectRow={handleToggleSelectRow}
                    onToggleSelectAll={handleToggleSelectAll}
                    allSelectedOnPage={allSelectedOnPage}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onRowDoubleClick={(row) => {
                        if (currentTab === 'DH') {
                            handleOpenDhDetail(String(row[3] || ''));
                        } else if (currentTab === 'TINH_GIA') {
                            setEditingTinhGiaRow(row);
                            setTinhGiaModalOpen(true);
                        } else {
                            setEditingRecord(row);
                            setRecordModalOpen(true);
                        }
                    }}
                    expandedSubrows={expandedSubrows}
                    onToggleSubrow={handleToggleSubrow}
                    subrowItemsMap={dhSubrowItemsMap}
                    dsSpPriceMap={dsSpPriceMap}
                    dsSpNameMap={dsSpNameMap}
                    onSaveSubrowItems={handleSaveSubrowItems}
                    onOpenDhDetail={handleOpenDhDetail}
                    customButtons={customButtons}
                    spShopeeGianMap={spShopeeGianMap}
                    webSpImageMap={webSpImageMap}
                    onOpenImageSearch={(row, idx) => {
                        setImageTarget({
                            row,
                            rowIndex: idx,
                            productName: row[2] || '',
                            productId: row[1] || row[0] || '',
                            currentImageUrl: row[tabConfig.imgCol ?? 10] || ''
                        });
                        setImageModalOpen(true);
                    }}
                    onInlineChange={handleInlineTinhGiaChange}
                    onSaveInline={handleSaveInlineTinhGia}
                    onQuickLoiNhuan={handleQuickLoiNhuan}
                    onQuickGiaDang={handleQuickGiaDang}
                    onQuickFees={handleQuickFees}
                />

                {/* Pagination Controls */}
                <Pagination
                    currentPage={currentPage}
                    totalRows={totalRows}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                />
            </main>

            {/* Datalist for ID_SP options autocomplete across the whole app */}
            <datalist id="dhIdSpOptions">
                {Array.from(dsSpPriceMap.entries()).map(([code, info]) => (
                    <option
                        key={code}
                        value={code}
                        label={`${info.tenSp || ''} - ${formatDisplayNumber(info.giaBan)} đ`}
                    />
                ))}
            </datalist>

            {/* Modals */}
            {recordModalOpen && (
                <RecordModal
                    isOpen={recordModalOpen}
                    onClose={() => setRecordModalOpen(false)}
                    currentTab={currentTab}
                    initialData={editingRecord}
                    onSave={handleSaveRecord}
                />
            )}

            {tinhGiaModalOpen && (
                <TinhGiaModal
                    isOpen={tinhGiaModalOpen}
                    onClose={() => setTinhGiaModalOpen(false)}
                    row={editingTinhGiaRow}
                    headers={storageHeaders}
                    onSaveRow={async (updatedRow) => {
                        await writeRecordRow('TINH_GIA', updatedRow, updatedRow._sheetRow);
                        setAllData(prev => {
                            const next = [...prev];
                            const idx = next.findIndex(r => r._sheetRow === updatedRow._sheetRow);
                            if (idx >= 0) next[idx] = updatedRow;
                            return next;
                        });
                        showToast('✅ Đã lưu giá sản phẩm thành công!');
                    }}
                />
            )}

            {dhDetailModalOpen && (
                <DhDetailModal
                    isOpen={dhDetailModalOpen}
                    onClose={() => setDhDetailModalOpen(false)}
                    mdh={editingDhMdh}
                    orderData={editingDhOrderData}
                    initialItems={editingDhItems}
                    dsSpPriceMap={dsSpPriceMap}
                    dsSpNameMap={dsSpNameMap}
                    onSaveOrder={handleSaveDhDetail}
                />
            )}

            {imageModalOpen && imageTarget && (
                <ImageSearchModal
                    isOpen={imageModalOpen}
                    onClose={() => {
                        setImageModalOpen(false);
                        setImageTarget(null);
                    }}
                    productName={imageTarget.productName}
                    productId={imageTarget.productId}
                    currentImageUrl={imageTarget.currentImageUrl}
                    onSaveImage={handleSaveImageToRow}
                />
            )}
        </div>
    );
}
