const CONFIG = {
    spreadsheetId: "19gZ6mR4UnKjZiWQc-W5CrCBKD7xz02Szd4Amlqvu99Y",
    serviceAccountEmail: "test-gia-ason@api-test-sheet-161.iam.gserviceaccount.com",
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC3NN84hLTkQPZd
Lj7niXZTICq7nHsuTn3J6r2Paq12m70/lYSmrwh1i0EStr9bO19QM8cevGlslwGr
WSVOLJlc6+w1HGPKvRXtA41kYV9MYIvpzIPQtkFE7Hxq71QyBARcv39Lfzze6Ioj
3G8VBvAKFLAnCUr97GHRv+KbCTFxPZupd3PEB+xS5ZUlzdBCEZvDid3iXaaEJJ+l
Td1apAGQHjtnDTLOkiTa8zf7X5ebALwnI9MziOdN8VyprHXGhkachPbKyrG0QwEs
2jtiI6Y5ULsBPjNefoavH8MKU5DEAT9h0fZ7KfsKYVMDuXqmEKBs0D3B4Z6aDZQW
wT2dDRZDAgMBAAECggEAEIuVoSzZVuFhaz1GI9ji0IacjvO50cIq7M8Zrj4/F756
Ew6PIhKENafAb7U4INm2AnzUMO8CqL9Jpxs85qUM3W4JysSByqLUiRW2184amIyb
j7jCXfLBTQn8AbHgrUepl5d/vBmFYMgon/mqjbNiGDb4FZgEQSkie5o6fi/dWp5d
NahbZl+WTOB/znhAfKh/zferHNxldR/ERmwOubZUerkqysWiBigc3ovpLSUof9ur
z3hNPPp0CKQjF40xuQc6FYTHUHMLuMvp78PXuc/mYqQmZ8VOGhU+faGtZ4m+QJly
dF5dS8U5cwKEF+ptuAUiWSahn6INb9yKn3+FcsW0UQKBgQDb8N4eWFvbgpRo/vxo
wBN2u2TWubj6clcrq/1a+VR0njC28Can0ogJHhrFhPxVs5D/rugs3HlbyAXJFptY
V0DZPCwBxGU5P5RbGjXWWEUXjp4ISKQD8WKfVlXNr79TqLdOg2NZBYQAi06Cpo/T
PV9l7LSG2Tj/9WdvD7W2wvrpaQKBgQDVPjpJN6xh7+sHtSU0mjKvrqigpHbuSQ/o
XpUaWSIpJffm5QpFPAOcTT5mHZCyllicJQIrfPSY+sH8n+sF03CUqVkV4Q2UqfOf
pFaLDB4P6SQ8iesZyF4VKFrj/cAvRJmp0e5W/DRnFkoEp+8c+nrru2+Dzm9kb7Uq
0CiltqYAywKBgBtcfrV1to+7Ue0x84KwintV2rifyDRX7yI+tjkQFYKgf1zyyUxN
c6D2vsvdvGqI+TvlrXqPPwW8/4NBrbeyux2LT8o0fYc+sp0WyKXOu2Gv21caelUH
PYam/eultn6Y2Z0J2V0kw4Qx0GWOhQv5cZnDdb3k3iNxixmU8b03ynEpAoGBAKEA
7O0fNe50QRZ+tOq0ihSPYQ55XrqnO3WNBDLynZJH8pbI1CpWF7vJrpVXOUs9rQWo
A61mGR/wJMtiywaJEHWOL48PbzuR3jno0NcHfSMyOoPi9jlvSWncIFQH4TVPLF5F
/Rh8L+ytrZE6YpWUoX6e9KGmGgDRPw5mQGpuL4RlAoGADe9n080SXlsUk4nHVjUz
Efv7EBoBkgOpqb9T1foRfJl46NxmmTOYV3iGIhjwcDskEg284k4iq/gH6EEFyEBc
Vz13jzB1nBgjfezFesVQz7bA/+Wik6HZtxAxVg38BKMt+Q1tYw9wOjbGPqOn++VC
sR2Sh8e3h3Knd6j1tceRIFU=
-----END PRIVATE KEY-----`,
    tokenUrl: "https://oauth2.googleapis.com/token",
    tabs: {
        'THONG_TIN': {
            range: 'THONG_TIN!A2:K',
            headers: ['id', 'truong', 'ten', 'ten_dang_nhap', 'mk', 'mail', 'ghi_chu', 'noi_dung', 'link', 'link_2', 'anh'],
            priceCols: [],
            imgCol: 10
        },
        'DON_HANG': {
            range: 'DON_HANG!A2:Y',
            headers: ['gian_hang', 'ngay', 'ngay_h', 'mdh', 'mvd', 'tong_tien', 'Mã giảm giá', 'Phí cố định', 'Phí Dịch Vụ', 'Phí xử lý giao dịch', 'phí thuế', 'phí piship', 'afl', 'doanh_thu', 'phí khác', 'tien_sp', 'loi_nhuan', 'tinh_trang', 'trang_thai', 'SKU phân loại hàng', 'id_sp', 'slg', 'don_gia', 'thanh_tien', 'hoan_hang'],
            displayHeaders: ['gian_hang', 'ngay', 'ngay_h', 'mdh', 'mvd', 'tong_tien', 'chi_phi', 'Mã giảm giá', 'Phí cố định', 'Phí Dịch Vụ', 'Phí xử lý giao dịch', 'phí thuế', 'phí piship', 'afl', 'doanh_thu', 'phí khác', 'tien_sp', 'loi_nhuan', 'tinh_trang', 'trang_thai', 'hoan_hang', 'mvd_tra', 'hh_kho'],
            priceCols: [5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 22, 23]
        },
        'DON_HANG_CHI_TIET': {
            range: 'DON_HANG!A2:Y',
            headers: ['gian_hang', 'ngay', 'ngay_h', 'mdh', 'mvd', 'tong_tien', 'Mã giảm giá', 'Phí cố định', 'Phí Dịch Vụ', 'Phí xử lý giao dịch', 'phí thuế', 'phí piship', 'afl', 'doanh_thu', 'phí khác', 'tien_sp', 'loi_nhuan', 'tinh_trang', 'trang_thai', 'SKU phân loại hàng', 'id_sp', 'slg', 'don_gia', 'thanh_tien', 'hoan_hang'],
            displayHeaders: ['gian_hang', 'ngay', 'mdh', 'mvd', 'tong_tien', 'chi_phi', 'doanh_thu', 'phí khác', 'tien_sp', 'loi_nhuan', 'tinh_trang', 'trang_thai', 'id_sp', 'slg', 'don_gia', 'thanh_tien', 'hoan_hang', 'mvd_tra', 'hh_kho'],
            priceCols: [5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 22, 23]
        },
        'HOA_DON': {
            range: 'HOA_DON!A2:D',
            headers: ['id', 'ngay', 'ncc', 'link_pdf'],
            priceCols: []
        },
        'DS_SP': {
            range: 'DS_SP!A2:G',
            headers: ['id_sp_con', 'id_sp', 'ten_sp', 'gia_nhap', 'gia_ban', 'gia_đong_goi', 'gia_thap_nhat'],
            priceCols: [3, 4, 5, 6]
        },
        'DH_HOAN': {
            range: 'DH_HOAN!A2:K',
            headers: ['gian', 'tinh_trang', 'ngay', 'mdh', 'mvd', 'ly_do', 'mdh_tra', 'mvd_tra', 'ghi_chu', 'trang_thai', 'ngay_tai_len'],
            priceCols: []
        },
        'NHAP_XUAT': {
            range: 'NHAP_XUAT!A2:H',
            headers: ['id', 'ngay', 'truong', 'gian', 'id_sp', 'slg', 'don_gia', 'thanh_tien'],
            displayHeaders: ['ngay', 'truong', 'gian', 'id_sp', 'slg', 'don_gia', 'thanh_tien'],
            priceCols: [5, 6, 7]
        },
        'TON_KHO': {
            range: 'TON_KHO!A2:D',
            headers: ['id', 'gian', 'id_sp', 'ton_dau'],
            displayHeaders: ['id', 'gian', 'id_sp', 'ton_dau', 'nhap', 'xuat', 'ton'],
            priceCols: [3]
        }
    }
};

const XNK_TT_TAB_STORAGE_KEY = 'xnkTtActiveTab';

let currentTab = '', allData = [], accessToken = null, tokenExpiry = 0;
let currentPage = 1, rowsPerPage = 150, filteredData = [];
let sheetTitleToIdCache = null;
let thongTinStoreNames = [];
let editingDonHangRows = [];
let dsSpNameMapCache = null;
let selectedOrderIds = new Set();
let orderCostDetailsExpanded = false;
let dsSpOptionsCache = null;
let rangeDataCache = {};
let allDataCache = {};
const TAB_LABELS = {
    THONG_TIN: 'THÔNG TIN',
    DON_HANG: 'ĐƠN HÀNG',
    DON_HANG_CHI_TIET: 'ĐH CHI TIẾT',
    HOA_DON: 'HÓA ĐƠN',
    DS_SP: 'DS SP',
    DH_HOAN: 'ĐƠN TRẢ',
    NHAP_XUAT: 'NHẬP XUẤT',
    TON_KHO: 'TỒN KHO'
};

const ID_PREFIXES = {
    THONG_TIN: 'TT',
    HOA_DON: 'HD',
    NHAP_XUAT: 'NX',
    TON_KHO: 'TK'
};

const DON_HANG_HEADERS = CONFIG.tabs.DON_HANG.headers;
const DON_HANG_INDEX = Object.fromEntries(DON_HANG_HEADERS.map((header, index) => [header, index]));
const DON_HANG_NUMERIC_HEADERS = new Set(['tong_tien', 'Mã giảm giá', 'Phí cố định', 'Phí Dịch Vụ', 'Phí xử lý giao dịch', 'phí thuế', 'phí piship', 'afl', 'doanh_thu', 'phí khác', 'tien_sp', 'loi_nhuan', 'slg', 'don_gia', 'thanh_tien']);
const DON_HANG_COST_DETAIL_HEADERS = ['Mã giảm giá', 'Phí cố định', 'Phí Dịch Vụ', 'Phí xử lý giao dịch', 'phí thuế', 'phí piship', 'afl'];
let selectedReturnOrderIds = new Set();
let returnStatusByOrderCache = null;
let returnStatusByMvdCache = null;

async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpiry - 300000) return accessToken;
    const header = { alg: "RS256", typ: "JWT" }, now = Math.floor(Date.now() / 1000),
        payload = { iss: CONFIG.serviceAccountEmail, scope: "https://www.googleapis.com/auth/spreadsheets", aud: CONFIG.tokenUrl, exp: now + 3600, iat: now };
    const sJWT = KJUR.jws.JWS.sign("RS256", JSON.stringify(header), JSON.stringify(payload), CONFIG.privateKey);
    const res = await fetch(CONFIG.tokenUrl, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${sJWT}` });
    const data = await res.json();
    accessToken = data.access_token; tokenExpiry = Date.now() + (data.expires_in * 1000);
    return accessToken;
}

async function switchTab(tabName) {
    if (tabName === currentTab) return;
    const previousTab = currentTab;
    currentTab = CONFIG.tabs[tabName] ? tabName : 'THONG_TIN';
    try { sessionStorage.setItem(XNK_TT_TAB_STORAGE_KEY, currentTab); } catch (_) { /* ignore */ }
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === currentTab);
    });
    
    // Check if we can reuse data
    const prevRange = CONFIG.tabs[previousTab]?.range;
    const currRange = CONFIG.tabs[currentTab]?.range;
    const canReuse = previousTab !== 'THONG_TIN' && currentTab !== 'THONG_TIN' &&
                     prevRange && currRange && prevRange === currRange &&
                     allData && allData.length > 0;

    document.getElementById('tableWrapper').style.display = 'block';
    document.getElementById('pagination').style.display = 'flex';
    document.getElementById('headerActions').style.display = 'flex';
    document.getElementById('pageTitle').innerText = 'Hệ thống';
    const uploadBtn = document.getElementById('uploadBtn');
    const addBtn = document.getElementById('addBtn');
    const fillProductPriceBtn = document.getElementById('fillProductPriceBtn');
    const deleteOrderBtn = document.getElementById('deleteOrderBtn');
    const truongFilter = document.getElementById('truongFilter');
    const storeFilter = document.getElementById('storeFilter');
    const orderFilters = document.getElementById('orderFilters');
    const returnOrderControls = document.getElementById('returnOrderControls');
    const changeUploadDateBtn = document.getElementById('changeUploadDateBtn');
    const newUploadDateLabel = document.getElementById('newUploadDateLabel');
    const isThongTinModule = currentTab === 'THONG_TIN';
    const isDonHangModule = currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET';
    const isReturnOrderModule = currentTab === 'DH_HOAN';
    const isStoreDataModule = currentTab === 'NHAP_XUAT' || currentTab === 'TON_KHO';
    if (uploadBtn) {
        uploadBtn.innerHTML = `<i data-lucide="upload" style="width:18px;"></i> ${isDonHangModule || isReturnOrderModule ? 'Thêm từ Excel' : `Tải ${currentTab} Lên`}`;
        uploadBtn.style.display = 'flex';
        lucide.createIcons();
    }
    if (addBtn) addBtn.style.display = isReturnOrderModule ? 'none' : 'flex';
    if (fillProductPriceBtn) fillProductPriceBtn.style.display = isDonHangModule ? 'flex' : 'none';
    if (deleteOrderBtn) {
        deleteOrderBtn.style.display = (isDonHangModule || isReturnOrderModule) ? 'flex' : 'none';
        deleteOrderBtn.innerHTML = `<i data-lucide="trash-2" style="width:18px;"></i> ${isReturnOrderModule ? 'Xóa đơn trả' : 'Xóa đơn hàng'}`;
    }
    if (changeUploadDateBtn && newUploadDateLabel) {
        changeUploadDateBtn.style.display = isReturnOrderModule ? 'flex' : 'none';
        newUploadDateLabel.style.display = isReturnOrderModule ? 'flex' : 'none';
    }
    if (truongFilter) {
        truongFilter.style.display = isThongTinModule ? 'block' : 'none';
        lucide.createIcons();
    }
    if (storeFilter) {
        storeFilter.style.display = isDonHangModule ? 'block' : 'none';
    }
    if (orderFilters) {
        orderFilters.style.display = isDonHangModule ? 'flex' : 'none';
    }
    if (returnOrderControls) {
        returnOrderControls.style.display = isReturnOrderModule ? 'flex' : 'none';
    }
    const dsSpFilters = document.getElementById('dsSpFilters');
    if (dsSpFilters) {
        dsSpFilters.style.display = currentTab === 'DS_SP' ? 'flex' : 'none';
    }
    document.getElementById('searchInput').value = '';
    selectedOrderIds.clear();
    selectedReturnOrderIds.clear();
    resetFilters();
    currentPage = 1;
    if (isDonHangModule || isReturnOrderModule || isStoreDataModule) await fetchThongTinStoreNames();
    if (isReturnOrderModule) setReturnStoreOptions();
    
    if (canReuse) {
        renderHeaders();
        filterTable();
    } else if (allDataCache[currentTab]) {
        allData = allDataCache[currentTab];
        renderHeaders();
        filterTable();
    } else {
        await fetchData();
    }
}

function toggleSidebar() {
    document.body.classList.toggle('sidebar-collapsed');
    const icon = document.querySelector('.sidebar-toggle i');
    if (icon) {
        icon.setAttribute('data-lucide', document.body.classList.contains('sidebar-collapsed') ? 'panel-left-open' : 'panel-left-close');
        lucide.createIcons();
    }
}

async function reloadCurrentTab() {
    currentPage = 1;
    await fetchData();
    filterTable();
    if (currentTab === 'DON_HANG') {
        await recalculateVisibleDonHangRows();
    }
}

let hhBhMvdSetCache = null;
async function fetchHhBhMvdSet(force = false) {
    if (hhBhMvdSetCache && !force) return hhBhMvdSetCache;
    try {
        const token = await getAccessToken();
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/1cnA33cHHMhcOSaXa9l4Jeu6qw8QnXlUnEU4Bqtkj9wo/values/HH_BH!C2:C`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Không đọc được HH_BH.');
        const data = await res.json();
        hhBhMvdSetCache = new Set((data.values || []).map(row => String(row[0] || '').trim()).filter(Boolean));
    } catch (err) {
        console.error('Lỗi khi tải HH_BH:', err);
        hhBhMvdSetCache = new Set();
    }
    return hhBhMvdSetCache;
}

async function fetchData() {
    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang tải dữ liệu ${currentTab}...`;
    try {
        const token = await getAccessToken();
        const tabConfig = CONFIG.tabs[currentTab];
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${tabConfig.range}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        
        const rawRows = data.values || [];
        rangeDataCache[tabConfig.range] = rawRows; // cache the fetched data
        
        let nhapXuatRows = [];
        if (currentTab === 'TON_KHO') {
            try {
                const resNX = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/NHAP_XUAT!A2:H`, { headers: { Authorization: `Bearer ${token}` } });
                if (resNX.ok) {
                    const nxData = await resNX.json();
                    nhapXuatRows = nxData.values || [];
                    rangeDataCache['NHAP_XUAT!A2:H'] = nhapXuatRows; // cache this too
                }
            } catch (err) {
                console.error('Failed to fetch NHAP_XUAT for TON_KHO', err);
            }
        }

        allData = rawRows.map((row, i) => {
            const arr = Array.isArray(row) ? row.slice() : [];
            arr._sheetRow = i + 2;
            return arr;
        });

        if (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET') {
            await fetchReturnStatusByOrderMap(true);
            const hhBhSet = await fetchHhBhMvdSet(true);
            allData.forEach(row => {
                const mdh = String(row[DON_HANG_INDEX.mdh] || '').trim();
                const currentMvd = String(row[DON_HANG_INDEX.mvd] || '').trim();
                let mvdTra = '';
                if (mdh && returnDataByOrderCache?.has(mdh)) {
                    mvdTra = returnDataByOrderCache.get(mdh).mvd_tra;
                }
                row.mvd_tra = mvdTra;
                row.hh_kho = (row.mvd_tra && hhBhSet.has(row.mvd_tra)) ? row.mvd_tra : '';
            });
        }

        if (currentTab === 'TON_KHO') {
            allData.forEach(row => {
                const gian = String(row[1] || '').trim();
                const idSp = String(row[2] || '').trim().toUpperCase();
                let nhap = 0;
                let xuat = 0;
                nhapXuatRows.forEach(nx => {
                    if (String(nx[3] || '').trim() === gian && String(nx[4] || '').trim().toUpperCase() === idSp) {
                        const isNhap = String(nx[2] || '').trim().toUpperCase() === 'NHẬP';
                        const slg = Number(nx[5]) || 0;
                        if (isNhap) nhap += slg;
                        else xuat += slg;
                    }
                });
                const tonDau = Number(row[3]) || 0;
                row['nhap'] = nhap;
                row['xuat'] = xuat;
                row['ton'] = tonDau + nhap - xuat;
            });
        }
        if (currentTab === 'DS_SP') {
            generateDsSpPrefix1Buttons();
        }
        filteredData = currentTab === 'DON_HANG' ? getDonHangSummaryRows() : [...allData];
        if (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET') {
            try { await fetchReturnStatusByOrderMap(true); } catch (err) { console.error(err); }
            filteredData.sort((a, b) => parseDonHangDateTime(b[DON_HANG_INDEX.ngay_h]) - parseDonHangDateTime(a[DON_HANG_INDEX.ngay_h]));
            updateDonHangSummary();
        }
        if (currentTab === 'HOA_DON') {
            filteredData.sort((a, b) => parseHoaDonDate(b[1]) - parseHoaDonDate(a[1]));
        }
        if (currentTab === 'NHAP_XUAT') {
            filteredData.sort((a, b) => parseDdMmYyyyDate(b[1]) - parseDdMmYyyyDate(a[1]));
        }
        if (currentTab === 'DH_HOAN') {
            filteredData.sort((a, b) => parseDdMmYyyyDate(b[2]) - parseDdMmYyyyDate(a[2]));
        }
        if (currentTab === 'DS_SP') {
            filteredData.sort((a, b) => String(b[0] || '').localeCompare(String(a[0] || '')));
        }
        populateFilters();
        renderHeaders();
        renderTable();
        allDataCache[currentTab] = allData;
    } catch (e) {
        console.error("Lỗi khi tải dữ liệu:", e);
        alert("Không thể tải dữ liệu. Vui lòng kiểm tra lại sheet '" + currentTab + "' có tồn tại không.");
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function renderHeaders() {
    const head = document.getElementById('tableHead');
    const selectHeader = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
        ? `<th class="select-col"><input type="checkbox" onchange="toggleAllVisibleOrders(this.checked)" title="Chọn tất cả đơn đang lọc"></th>`
        : currentTab === 'DH_HOAN'
            ? `<th class="select-col"><input type="checkbox" onchange="toggleAllReturnOrders(this.checked)" title="Chọn tất cả đơn trả"></th>`
            : '';
    head.innerHTML = `<tr>${selectHeader}${getDisplayHeaders().map(h => h === 'chi_phi'
        ? `<th class="cost-toggle-header" onclick="toggleOrderCostDetails()">CHI_PHÍ ${orderCostDetailsExpanded ? '−' : '+'}</th>`
        : `<th>${h.toUpperCase()}</th>`).join('')}</tr>`;
}

function normalizeRow(row) {
    const source = Array.isArray(row) ? row : [];
    return getStorageHeaders().map((_, idx) => String(source[idx] ?? '').trim());
}

function getStorageHeaders(tabName = currentTab) {
    const tabConfig = CONFIG.tabs[tabName];
    return tabConfig.headers;
}

function getDisplayHeaders(tabName = currentTab) {
    const tabConfig = CONFIG.tabs[tabName];
    let headers = tabConfig.displayHeaders || tabConfig.headers;
    if (tabName === 'DON_HANG' && !orderCostDetailsExpanded) {
        headers = headers.filter(header => !DON_HANG_COST_DETAIL_HEADERS.includes(header));
    }
    return headers;
}

function isNumericDisplayHeader(header, tabName = currentTab) {
    if (tabName === 'DON_HANG') return DON_HANG_NUMERIC_HEADERS.has(header);
    if (tabName === 'TON_KHO' && ['ton_dau', 'nhap', 'xuat', 'ton'].includes(header)) return true;
    const storageIndex = getStorageHeaders(tabName).indexOf(header);
    return storageIndex >= 0 && (CONFIG.tabs[tabName]?.priceCols || []).includes(storageIndex);
}

function getDonHangCostTotal(row) {
    return DON_HANG_COST_DETAIL_HEADERS.reduce((sum, header) => sum + parseMoney(row?.[DON_HANG_INDEX[header]]), 0);
}

function toggleOrderCostDetails() {
    orderCostDetailsExpanded = !orderCostDetailsExpanded;
    renderHeaders();
    renderTable();
}

function getDonHangSummaryRows(rows = allData) {
    const summaries = new Map();
    rows.forEach(row => {
        const orderId = getRowId(row, 'DON_HANG');
        if (!orderId) return;
        if (!summaries.has(orderId)) summaries.set(orderId, row);
    });
    return [...summaries.values()];
}

function getNhapXuatSummaryRows(rows = allData) {
    const summaries = new Map();
    rows.forEach(row => {
        const ngay = String(row[1] || '').trim();
        const truong = String(row[2] || '').trim();
        const gian = String(row[3] || '').trim();
        if (!ngay || !truong || !gian) return;
        const key = `${ngay}_${truong}_${gian}`;
        if (!summaries.has(key)) {
            summaries.set(key, [...row]);
        } else {
            const summaryRow = summaries.get(key);
            const currentSlg = parseMoney(summaryRow[5] || 0);
            const rowSlg = parseMoney(row[5] || 0);
            summaryRow[5] = currentSlg + rowSlg;
            summaryRow[4] = '(Nhiều sản phẩm)';
            summaryRow[6] = '';
            const currentTotal = parseMoney(summaryRow[7] || 0);
            const rowTotal = parseMoney(row[7] || 0);
            summaryRow[7] = currentTotal + rowTotal;
        }
    });
    return [...summaries.values()];
}

function getDonHangItemCount(orderId) {
    const key = String(orderId || '').trim();
    if (!key) return 0;
    return allData.filter(row => getRowId(row, 'DON_HANG') === key).length;
}

function toggleOrderSelection(orderId, checked) {
    const key = String(orderId || '').trim();
    if (!key) return;
    if (checked) selectedOrderIds.add(key);
    else selectedOrderIds.delete(key);
}

function toggleAllVisibleOrders(checked) {
    filteredData.forEach(row => {
        const orderId = getRowId(row, 'DON_HANG');
        if (!orderId) return;
        if (checked) selectedOrderIds.add(orderId);
        else selectedOrderIds.delete(orderId);
    });
    renderTable();
}

function getSelectedOrderIds() {
    return [...selectedOrderIds].filter(orderId => allData.some(row => getRowId(row, 'DON_HANG') === orderId));
}

function getReturnOrderKey(row) {
    return String(row?._sheetRow || row?.[2] || '').trim();
}

function getMatchedReturnStatusForOrder(row) {
    if (!returnStatusByOrderCache || currentTab !== 'DON_HANG') return '';
    const store = String(row?.[DON_HANG_INDEX.gian_hang] || '').trim().toLowerCase();
    const orderId = String(row?.[DON_HANG_INDEX.mdh] || '').trim();
    return returnStatusByOrderCache.get(`${store}::${orderId}`) || '';
}

function getMvdDifferentStoreReturnStatusForOrder(row) {
    if (!returnStatusByMvdCache || currentTab !== 'DON_HANG') return '';
    const store = String(row?.[DON_HANG_INDEX.gian_hang] || '').trim().toLowerCase();
    const mvd = String(row?.[DON_HANG_INDEX.mvd] || '').trim();
    if (!store || !mvd) return '';
    const matches = returnStatusByMvdCache.get(mvd) || [];
    return matches.find(item => item.store && item.store !== store)?.status || '';
}

function getReturnStatusClass(status) {
    const value = String(status || '').trim().toLocaleUpperCase('vi');
    if (value === 'HỦY') return 'return-status-cancel';
    if (value === 'HOÀN') return 'return-status-refund';
    if (value === 'TRẢ') return 'return-status-return';
    return '';
}

function toggleReturnOrderSelection(rowKey, checked) {
    const key = String(rowKey || '').trim();
    if (!key) return;
    if (checked) selectedReturnOrderIds.add(key);
    else selectedReturnOrderIds.delete(key);
}

function toggleAllReturnOrders(checked) {
    filteredData.forEach(row => {
        const key = getReturnOrderKey(row);
        if (!key) return;
        if (checked) selectedReturnOrderIds.add(key);
        else selectedReturnOrderIds.delete(key);
    });
    renderTable();
}

function colName(index) {
    let name = '';
    let num = index + 1;
    while (num > 0) {
        const rem = (num - 1) % 26;
        name = String.fromCharCode(65 + rem) + name;
        num = Math.floor((num - 1) / 26);
    }
    return name;
}

function getRowId(row, tabName = currentTab) {
    if (tabName === 'DON_HANG') {
        return String(row?.[DON_HANG_INDEX.mdh] || '').trim();
    }
    return String((row && row[0]) || '').trim();
}

function getRowById(id) {
    const key = String(id || '').trim();
    if (!key) return null;
    return allData.find(row => getRowId(row) === key) || null;
}

function generateNextId(extraIds = [], prefixTab = currentTab) {
    const ids = [...allData.map(getRowId), ...extraIds].filter(Boolean);
    const numericIds = ids.map(id => Number(id)).filter(n => Number.isFinite(n));
    if (numericIds.length === ids.length && numericIds.length) {
        return String(Math.max(...numericIds) + 1);
    }
    const now = new Date();
    const stamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0')
    ].join('');
    let candidate = `${ID_PREFIXES[prefixTab] || prefixTab}-${stamp}`;
    let suffix = 1;
    while (ids.includes(candidate)) {
        suffix += 1;
        candidate = `${ID_PREFIXES[prefixTab] || prefixTab}-${stamp}-${suffix}`;
    }
    return candidate;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function escapeJsString(value) {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n');
}

function setDatalistOptions(id, values) {
    const datalist = document.getElementById(id);
    if (!datalist) return;
    const counts = new Map();
    values.filter(Boolean).forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
    const uniqueValues = [...counts.keys()].sort();
    datalist.innerHTML = uniqueValues
        .map(value => `<option value="${escapeHtml(value)}" label="${escapeHtml(value)} (${counts.get(value)})"></option>`)
        .join('');
}

function setStoreFilterOptions(values) {
    const select = document.getElementById('storeFilter');
    if (!select) return;
    const currentValue = select.value;
    const uniqueValues = [...new Set(values.filter(Boolean))].sort();
    select.innerHTML = `<option value="">Chọn gian hàng...</option>${uniqueValues
        .map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
        .join('')}`;
    if (uniqueValues.includes(currentValue)) select.value = currentValue;
}

function setReturnStoreOptions() {
    const select = document.getElementById('returnStoreSelect');
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = `<option value="">Chọn gian...</option>${thongTinStoreNames
        .map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
        .join('')}`;
    if (thongTinStoreNames.includes(currentValue)) select.value = currentValue;
}

function populateFilters() {
    // Thu thập các giá trị của cột 'truong' (index 1) để đưa vào datalist Lọc theo Trường
    const truongValues = allData.map(row => String(row[1] || '').trim()).filter(Boolean);
    setDatalistOptions('truongOptions', truongValues);
    setStoreFilterOptions(currentTab === 'DON_HANG'
        ? [...thongTinStoreNames, ...allData.map(row => String(row[DON_HANG_INDEX.gian_hang] || '').trim())]
        : thongTinStoreNames);
    if (currentTab === 'HOA_DON') {
        setDatalistOptions('nccOptions', allData.map(row => String(row[2] || '').trim()).filter(Boolean));
    }
}

function resetFilters() {
    ['truongFilter', 'storeFilter', 'orderDateFrom', 'orderDateTo', 'orderMdhFilter', 'orderMvdFilter', 'orderTinhTrangFilter', 'orderTrangThaiFilter', 'orderProfitFilter', 'returnDateFrom', 'returnDateTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    syncOrderProfitFilterButtons();
    if (typeof syncOrderStatusFilterButtons === 'function') syncOrderStatusFilterButtons();
    currentDsSpPrefix1Filter = '';
    currentDsSpPrefix2Filter = '';
}

async function fetchThongTinStoreNames() {
    try {
        const token = await getAccessToken();
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/THONG_TIN!C2:C`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Không đọc được danh sách gian hàng.');
        const data = await res.json();
        thongTinStoreNames = [...new Set((data.values || []).map(row => String(row[0] || '').trim()).filter(Boolean))].sort();
        setStoreFilterOptions(thongTinStoreNames);
    } catch (err) {
        console.error('Lỗi khi tải danh sách gian hàng:', err);
        thongTinStoreNames = [];
    }
}

function getDataSheetRow(row) {
    if (row && typeof row._sheetRow === 'number' && row._sheetRow >= 2) return row._sheetRow;
    const idx = allData.indexOf(row);
    return idx >= 0 ? idx + 2 : 0;
}

async function writeRecordRow(row, sheetRow) {
    const token = await getAccessToken();
    const cleanRow = normalizeRow(row);
    const rowNum = Number(sheetRow);
    if (!rowNum || rowNum < 2) throw new Error('Không xác định được dòng cần cập nhật.');
    const endCol = colName(getStorageHeaders().length - 1);

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${currentTab}!A${rowNum}:${endCol}${rowNum}?valueInputOption=RAW`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [cleanRow] })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Cập nhật dòng thất bại.');
    }
}

async function batchWriteRecordRows(items) {
    if (!items.length) return;
    const token = await getAccessToken();
    const endCol = colName(getStorageHeaders().length - 1);
    const data = items.map(item => ({
        range: `${currentTab}!A${item.sheetRow}:${endCol}${item.sheetRow}`,
        values: [normalizeRow(item.row)]
    }));
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ valueInputOption: 'RAW', data })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Cập nhật nhiều dòng thất bại.');
    }
}

async function getSheetIdByTitle(title) {
    if (!sheetTitleToIdCache) {
        const token = await getAccessToken();
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}?fields=sheets.properties`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || 'Không đọc được metadata sheet.');
        }
        const data = await res.json();
        sheetTitleToIdCache = new Map((data.sheets || []).map(sheet => [sheet.properties.title, sheet.properties.sheetId]));
    }
    if (!sheetTitleToIdCache.has(title)) throw new Error(`Không tìm thấy sheet '${title}'.`);
    return sheetTitleToIdCache.get(title);
}

async function deleteSheetRows(sheetTitle, sheetRows) {
    const uniqueRows = [...new Set(sheetRows.filter(row => Number(row) >= 2))].sort((a, b) => b - a);
    if (!uniqueRows.length) return;
    const token = await getAccessToken();
    const sheetId = await getSheetIdByTitle(sheetTitle);
    const requests = uniqueRows.map(rowNumber => ({
        deleteDimension: {
            range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber
            }
        }
    }));
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Xóa dòng thất bại.');
    }
}

async function appendRecordRows(rows) {
    if (!rows.length) return;
    const token = await getAccessToken();
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${currentTab}!A2:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: rows.map(normalizeRow) })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Thêm dòng thất bại.');
    }
}

async function clearCurrentTabData() {
    const token = await getAccessToken();
    const endCol = colName(getStorageHeaders().length - 1);
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${currentTab}!A2:${endCol}:clear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Xóa dữ liệu cũ thất bại.');
    }
}

async function upsertRecordRows(rows) {
    let cleanRows = rows.map(normalizeRow).filter(row => row.some(cell => String(cell || '').trim()));
    if (currentTab === 'DON_HANG') {
        const existingOrderIds = new Set(allData.map(row => getRowId(row)).filter(Boolean));
        let skipped = 0;
        cleanRows = cleanRows.filter(row => {
            const orderId = getRowId(row);
            if (!orderId || existingOrderIds.has(orderId)) {
                skipped += 1;
                return false;
            }
            return true;
        });
        recalculateDonHangRows(cleanRows);
        await appendRecordRows(cleanRows);
        return { updated: 0, inserted: cleanRows.length, skipped };
    }
    let skipped = 0;
    const generatedIds = [];
    cleanRows.forEach(row => {
        if (currentTab === 'DON_HANG') return;
        if (!row[0]) {
            const id = generateNextId(generatedIds);
            row[0] = id;
            generatedIds.push(id);
        }
    });
    if (!cleanRows.length) throw new Error('Không có dòng dữ liệu hợp lệ.');

    const existingById = new Map(allData.map(row => [getRowId(row), row]).filter(([id]) => id));
    const updates = [];
    const appends = [];
    for (const row of cleanRows) {
        const id = getRowId(row);
        const existing = existingById.get(id);
        if (existing) {
            if (currentTab === 'DON_HANG') {
                skipped += 1;
            } else {
                updates.push({ row, sheetRow: getDataSheetRow(existing) });
            }
        } else {
            appends.push(row);
            existingById.set(id, row);
        }
    }

    for (const item of updates) {
        await writeRecordRow(item.row, item.sheetRow);
    }
    await appendRecordRows(appends);
    return { updated: updates.length, inserted: appends.length, skipped };
}

function getFormRowValue(row, header, idx) {
    if (!row) {
        if (currentTab === 'DON_HANG' && header === 'gian_hang') {
            return String(document.getElementById('storeFilter')?.value || '').trim();
        }
        if ((currentTab === 'HOA_DON' || currentTab === 'NHAP_XUAT') && header === 'ngay') {
            return toDateInputValue(formatDateDdMmYyyy(new Date().toISOString().slice(0, 10)));
        }
        return '';
    }
    if ((currentTab === 'HOA_DON' || currentTab === 'NHAP_XUAT') && header === 'ngay') {
        return toDateInputValue(row[idx]);
    }
    return row[idx] || '';
}

function parseMoney(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    const raw = String(value ?? '').trim();
    if (!raw) return 0;
    const normalized = raw.replace(/\s/g, '').replace(/[^\d,.-]/g, '');
    if (!normalized) return 0;
    if (normalized.includes(',') && normalized.includes('.')) {
        return Number(normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
            ? normalized.replace(/\./g, '').replace(',', '.')
            : normalized.replace(/,/g, '')) || 0;
    }
    if (/^-?\d{1,3}([.,]\d{3})+$/.test(normalized)) return Number(normalized.replace(/[.,]/g, '')) || 0;
    return Number(normalized.replace(',', '.')) || 0;
}

function roundMoney(value) {
    return Math.round((Number(value) || 0) * 100) / 100;
}

function formatDisplayNumber(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const number = parseMoney(raw);
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(number);
}

function getDonHangOrderKey(row) {
    return [
        row[DON_HANG_INDEX.gian_hang],
        row[DON_HANG_INDEX.mdh]
    ].map(value => String(value || '').trim()).join('::');
}

function recalculateDonHangRows(rows, options = {}) {
    const itemTotalsByOrder = new Map();
    const orderTotalsByOrder = new Map();
    if (options.aggregateTongTien) {
        rows.forEach(row => {
            const key = getDonHangOrderKey(row);
            orderTotalsByOrder.set(key, roundMoney((orderTotalsByOrder.get(key) || 0) + parseMoney(row[DON_HANG_INDEX.tong_tien])));
        });
    }
    rows.forEach(row => {
        const quantity = parseMoney(row[DON_HANG_INDEX.slg]);
        const unitPrice = parseMoney(row[DON_HANG_INDEX.don_gia]);
        const itemTotal = unitPrice && quantity ? roundMoney(unitPrice * quantity) : parseMoney(row[DON_HANG_INDEX.thanh_tien]);
        row[DON_HANG_INDEX.thanh_tien] = itemTotal || '';
        const key = getDonHangOrderKey(row);
        itemTotalsByOrder.set(key, roundMoney((itemTotalsByOrder.get(key) || 0) + itemTotal));
    });
    rows.forEach(row => {
        if (options.aggregateTongTien) {
            row[DON_HANG_INDEX.tong_tien] = orderTotalsByOrder.get(getDonHangOrderKey(row)) || '';
        }
        const total = parseMoney(row[DON_HANG_INDEX.tong_tien]);
        const shopDiscount = parseMoney(row[DON_HANG_INDEX['Mã giảm giá']]);
        const fixedFee = parseMoney(row[DON_HANG_INDEX['Phí cố định']]);
        const serviceFee = parseMoney(row[DON_HANG_INDEX['Phí Dịch Vụ']]);
        const transactionFee = parseMoney(row[DON_HANG_INDEX['Phí xử lý giao dịch']]);
        const taxFee = roundMoney((total - shopDiscount) * 0.015);
        const pishipFee = 2700;
        const aflFee = parseMoney(row[DON_HANG_INDEX['afl']]);
        const otherFee = parseMoney(row[DON_HANG_INDEX['phí khác']]);
        const productTotal = itemTotalsByOrder.get(getDonHangOrderKey(row)) || 0;
        const received = roundMoney(total - shopDiscount - fixedFee - serviceFee - transactionFee - taxFee - pishipFee - aflFee);
        const status = String(row[DON_HANG_INDEX.tinh_trang] || '').trim().toLocaleUpperCase('vi');
        row[DON_HANG_INDEX['phí thuế']] = taxFee;
        row[DON_HANG_INDEX['phí piship']] = pishipFee;
        
        if (status === 'HỦY') {
            row[DON_HANG_INDEX.doanh_thu] = 0;
        } else if (status === 'HOÀN' || status === 'TRẢ') {
            row[DON_HANG_INDEX.doanh_thu] = -pishipFee;
        } else {
            row[DON_HANG_INDEX.doanh_thu] = received;
        }
        
        row[DON_HANG_INDEX.tien_sp] = productTotal || '';
        if (status === 'HỦY') {
            row[DON_HANG_INDEX.trang_thai] = 'HỦY';
            row[DON_HANG_INDEX.loi_nhuan] = 0;
        } else if (status === 'HOÀN' || status === 'TRẢ') {
            row[DON_HANG_INDEX.trang_thai] = 'HỦY';
            row[DON_HANG_INDEX.loi_nhuan] = -pishipFee;
        } else {
            row[DON_HANG_INDEX.trang_thai] = 'HOÀN THÀNH';
            row[DON_HANG_INDEX.loi_nhuan] = roundMoney(received - otherFee - productTotal);
        }
    });
    return rows;
}

function hasDonHangFormulaChanges(before, after) {
    return ['phí thuế', 'phí piship', 'doanh_thu', 'tien_sp', 'loi_nhuan', 'thanh_tien']
        .some(header => String(before[DON_HANG_INDEX[header]] ?? '').trim() !== String(after[DON_HANG_INDEX[header]] ?? '').trim());
}

async function recalculateVisibleDonHangRows() {
    const visibleOrderIds = new Set(filteredData.map(row => getRowId(row, 'DON_HANG')).filter(Boolean));
    const targets = allData.filter(row => visibleOrderIds.has(getRowId(row, 'DON_HANG')));
    if (!targets.length) return;

    const recalculatedRows = recalculateDonHangRows(targets.map(row => normalizeRow(row)));
    const changedRows = recalculatedRows
        .map((row, index) => ({ row, source: targets[index] }))
        .filter(item => hasDonHangFormulaChanges(item.source, item.row));
    if (!changedRows.length) return;

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang cập nhật lại công thức ${changedRows.length} dòng đơn hàng...`;
    try {
        for (const item of changedRows) {
            await writeRecordRow(item.row, getDataSheetRow(item.source));
        }
        await fetchData();
        filterTable();
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function fetchDsSpGiaBanMap() {
    const token = await getAccessToken();
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/DS_SP!A2:G`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Không đọc được sheet DS_SP.');
    }
    const data = await res.json();
    const map = new Map();
    (data.values || []).forEach(row => {
        const idSp = String(row[1] || '').trim().toUpperCase();
        if (!idSp) return;
        map.set(idSp, parseMoney(row[4]));
    });
    return map;
}

async function fetchDsSpNameMap() {
    if (dsSpNameMapCache) return dsSpNameMapCache;
    const token = await getAccessToken();
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/DS_SP!A2:G`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Không đọc được tên sản phẩm từ sheet DS_SP.');
    }
    const data = await res.json();
    dsSpNameMapCache = new Map();
    (data.values || []).forEach(row => {
        const idSp = String(row[1] || '').trim().toUpperCase();
        const name = String(row[2] || '').trim();
        if (idSp) dsSpNameMapCache.set(idSp, name);
    });
    return dsSpNameMapCache;
}

async function fetchDsSpOptions() {
    if (dsSpOptionsCache) return dsSpOptionsCache;
    const token = await getAccessToken();
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/DS_SP!A2:G`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Không đọc được danh sách sản phẩm từ sheet DS_SP.');
    }
    const data = await res.json();
    const seen = new Set();
    dsSpOptionsCache = [];
    (data.values || []).forEach(row => {
        const idSp = String(row[1] || '').trim().toUpperCase();
        if (!idSp || seen.has(idSp)) return;
        seen.add(idSp);
        dsSpOptionsCache.push({ id: idSp, name: String(row[2] || '').trim(), gia_nhap: parseMoney(row[3]), gia_ban: parseMoney(row[4]) });
    });
    return dsSpOptionsCache;
}

let returnDataByOrderCache = null;
async function fetchReturnStatusByOrderMap(force = false) {
    if (returnStatusByOrderCache && !force) return returnStatusByOrderCache;
    const token = await getAccessToken();
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/DH_HOAN!A2:K`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Không đọc được sheet DH_HOAN.');
    }
    const data = await res.json();
    returnStatusByOrderCache = new Map();
    returnStatusByMvdCache = new Map();
    returnDataByOrderCache = new Map();
    (data.values || []).forEach(row => {
        const store = String(row[0] || '').trim().toLowerCase();
        const status = String(row[1] || '').trim().toLocaleUpperCase('vi');
        const orderId = String(row[3] || '').trim();
        const mvd = String(row[4] || '').trim();
        const mvdTra = String(row[7] || '').trim();
        if (store && orderId && status) {
            returnStatusByOrderCache.set(`${store}::${orderId}`, status);
            if (!returnDataByOrderCache.has(orderId)) {
                returnDataByOrderCache.set(orderId, { status, mvd_tra: mvdTra || mvd });
            }
        }
        if (store && mvd && status) {
            const matches = returnStatusByMvdCache.get(mvd) || [];
            matches.push({ store, status });
            returnStatusByMvdCache.set(mvd, matches);
        }
    });
    return returnStatusByOrderCache;
}

async function fillVisibleOrderProductPrices() {
    if (currentTab !== 'DON_HANG') return;
    const selectedIds = getSelectedOrderIds();
    if (!selectedIds.length) {
        alert('Vui lòng tick chọn đơn hàng cần điền giá.');
        return;
    }
    if (!confirm(`Điền giá bán từ DS_SP cho ${selectedIds.length} đơn hàng đã chọn?`)) return;

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = 'Đang điền giá sản phẩm từ DS_SP...';
    try {
        const priceMap = await fetchDsSpGiaBanMap();
        const selectedOrderIdSet = new Set(selectedIds);
        const targets = allData.filter(row => selectedOrderIdSet.has(getRowId(row, 'DON_HANG')));
        let matched = 0;
        let unmatched = 0;
        const rowsWithPrice = targets.map(row => {
            const nextRow = normalizeRow(row);
            const idSp = String(nextRow[DON_HANG_INDEX.id_sp] || String(nextRow[DON_HANG_INDEX['SKU phân loại hàng']] || '').slice(0, 4)).trim().toUpperCase();
            if (idSp && priceMap.has(idSp)) {
                nextRow[DON_HANG_INDEX.id_sp] = idSp;
                nextRow[DON_HANG_INDEX.don_gia] = priceMap.get(idSp);
                matched += 1;
            } else {
                unmatched += 1;
            }
            return nextRow;
        });
        const recalculatedRows = recalculateDonHangRows(rowsWithPrice);
        const changedRows = recalculatedRows
            .map((row, index) => ({ row, source: targets[index] }))
            .filter(item => String(item.source[DON_HANG_INDEX.don_gia] ?? '').trim() !== String(item.row[DON_HANG_INDEX.don_gia] ?? '').trim()
                || hasDonHangFormulaChanges(item.source, item.row));

        await batchWriteRecordRows(changedRows.map(item => ({ row: item.row, sheetRow: getDataSheetRow(item.source) })));
        await fetchData();
        filterTable();
        alert(`Đã điền giá cho ${matched} dòng sản phẩm. Không tìm thấy giá: ${unmatched} dòng. Đã đồng bộ ${changedRows.length} dòng trên sheet.`);
    } catch (err) {
        console.error(err);
        alert('Không điền được giá sản phẩm: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function deleteSelectedOrders() {
    if (currentTab === 'DH_HOAN') {
        await deleteSelectedReturnOrders();
        return;
    }
    if (currentTab !== 'DON_HANG') return;
    const selectedIds = getSelectedOrderIds();
    if (!selectedIds.length) {
        alert('Vui lòng tick chọn đơn hàng cần xóa.');
        return;
    }
    const rowsToDelete = allData.filter(row => selectedIds.includes(getRowId(row, 'DON_HANG')));
    if (!rowsToDelete.length) {
        alert('Không tìm thấy dòng dữ liệu của đơn đã chọn.');
        return;
    }
    if (!confirm(`Xóa ${selectedIds.length} đơn hàng đã chọn, gồm ${rowsToDelete.length} dòng sản phẩm?`)) return;

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = 'Đang xóa đơn hàng đã chọn...';
    try {
        await deleteSheetRows('DON_HANG', rowsToDelete.map(getDataSheetRow));
        selectedOrderIds.clear();
        await fetchData();
        filterTable();
        alert(`Đã xóa ${selectedIds.length} đơn hàng, ${rowsToDelete.length} dòng sản phẩm.`);
    } catch (err) {
        console.error(err);
        alert('Không xóa được đơn hàng: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function deleteSelectedReturnOrders() {
    const selectedKeys = [...selectedReturnOrderIds];
    if (!selectedKeys.length) {
        alert('Vui lòng tick chọn đơn trả cần xóa.');
        return;
    }
    const rowsToDelete = allData.filter(row => selectedKeys.includes(getReturnOrderKey(row)));
    if (!rowsToDelete.length) {
        alert('Không tìm thấy dòng đơn trả đã chọn.');
        return;
    }
    if (!confirm(`Xóa ${rowsToDelete.length} dòng đơn trả đã chọn?`)) return;

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = 'Đang xóa đơn trả đã chọn...';
    try {
        await deleteSheetRows('DH_HOAN', rowsToDelete.map(getDataSheetRow));
        selectedReturnOrderIds.clear();
        await fetchData();
        filterTable();
        alert(`Đã xóa ${rowsToDelete.length} dòng đơn trả.`);
    } catch (err) {
        console.error(err);
        alert('Không xóa được đơn trả: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function changeSelectedReturnOrderUploadDate() {
    const selectedKeys = [...selectedReturnOrderIds];
    if (!selectedKeys.length) {
        alert('Vui lòng tick chọn đơn trả cần đổi ngày tải lên.');
        return;
    }
    const isoDate = document.getElementById('newUploadDateInput')?.value;
    if (!isoDate) {
        alert('Vui lòng chọn ngày mới ở ô Đổi ngày.');
        return;
    }
    const newDate = formatDateDdMmYyyy(isoDate);

    const rowsToUpdate = allData.filter(row => selectedKeys.includes(getReturnOrderKey(row)));
    if (!rowsToUpdate.length) {
        alert('Không tìm thấy dòng đơn trả đã chọn.');
        return;
    }

    const DH_HOAN_UPLOAD_DATE_INDEX = 10;

    rowsToUpdate.forEach(row => {
        row[DH_HOAN_UPLOAD_DATE_INDEX] = newDate;
    });

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = 'Đang đổi ngày tải lên...';
    try {
        const items = rowsToUpdate.map(row => ({ row, sheetRow: getDataSheetRow(row) }));
        await batchWriteRecordRows(items);
        await fetchData();
        filterTable();
        alert(`Đã đổi ngày tải lên cho ${rowsToUpdate.length} dòng đơn trả.`);
    } catch (err) {
        console.error(err);
        alert('Không đổi được ngày tải lên: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function quickUpdateOrderStatus(orderId, newStatus) {
    if (currentTab !== 'DON_HANG') return;
    const targets = allData.filter(row => getRowId(row, 'DON_HANG') === orderId);
    if (!targets.length) return;

    targets.forEach(row => {
        row[DON_HANG_INDEX.tinh_trang] = newStatus;
    });

    // Cập nhật lợi nhuận và các trường khác
    recalculateDonHangRows(targets.map(r => r));

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang cập nhật tình trạng...`;
    try {
        const items = targets.map(row => ({ row, sheetRow: getDataSheetRow(row) }));
        await batchWriteRecordRows(items);
        
        const range = CONFIG.tabs[currentTab].range;
        if (rangeDataCache[range]) {
            targets.forEach(t => {
                if (t._sheetRow) {
                    const cacheIdx = t._sheetRow - 2;
                    if (rangeDataCache[range][cacheIdx]) {
                        CONFIG.tabs[currentTab].headers.forEach((_, colIdx) => {
                            rangeDataCache[range][cacheIdx][colIdx] = t[colIdx] ?? '';
                        });
                    }
                }
            });
        }
        
        filterTable();
    } catch (err) {
        console.error(err);
        alert('Cập nhật thất bại: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function quickUpdateOrderHoanHang(orderId, newStatus) {
    if (currentTab !== 'DON_HANG' && currentTab !== 'DON_HANG_CHI_TIET') return;
    const targets = allData.filter(row => getRowId(row, 'DON_HANG') === orderId);
    if (!targets.length) return;

    targets.forEach(row => {
        row[DON_HANG_INDEX.hoan_hang] = newStatus;
    });

    recalculateDonHangRows(targets.map(r => r));

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang cập nhật trạng thái hoàn hàng...`;
    try {
        const items = targets.map(row => ({ row, sheetRow: getDataSheetRow(row) }));
        await batchWriteRecordRows(items);
        
        const range = CONFIG.tabs[currentTab].range;
        if (rangeDataCache[range]) {
            targets.forEach(t => {
                if (t._sheetRow) {
                    const cacheIdx = t._sheetRow - 2;
                    if (rangeDataCache[range][cacheIdx]) {
                        CONFIG.tabs[currentTab].headers.forEach((_, colIdx) => {
                            rangeDataCache[range][cacheIdx][colIdx] = t[colIdx] ?? '';
                        });
                    }
                }
            });
        }
        
        filterTable();
    } catch (err) {
        console.error(err);
        alert('Cập nhật thất bại: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function getDonHangFieldOptions(header) {
    if (header === 'gian_hang') return thongTinStoreNames;
    if (header === 'tinh_trang') return ['HỦY', 'HOÀN', 'TRẢ', 'HOÀN THÀNH'];
    if (header === 'trang_thai') return ['HỦY', 'HOÀN THÀNH'];
    return null;
}

function recalculateDonHangForm() {
    if (currentTab !== 'DON_HANG') return;
    const row = DON_HANG_HEADERS.map((_, idx) => document.getElementById(`formField_${idx}`)?.value.trim() || '');
    row[DON_HANG_INDEX.ngay] = getDateOnly(row[DON_HANG_INDEX.ngay_h]);
    row[DON_HANG_INDEX.id_sp] = String(row[DON_HANG_INDEX['SKU phân loại hàng']] || '').slice(0, 4);
    recalculateDonHangRows([row]);
    ['ngay', 'phí thuế', 'phí piship', 'doanh_thu', 'tien_sp', 'loi_nhuan', 'trang_thai', 'id_sp', 'thanh_tien'].forEach(header => {
        const input = document.getElementById(`formField_${DON_HANG_INDEX[header]}`);
        if (input) input.value = row[DON_HANG_INDEX[header]];
    });
}

function renderOptionButtons(name, value, options, hiddenAttributes) {
    return `<div class="option-buttons" data-option-group="${escapeHtml(name)}">
        <input ${hiddenAttributes} type="hidden" value="${escapeHtml(value)}">
        ${options.map(option => `<button type="button" class="${String(value) === option ? 'active' : ''}" onclick="setOptionButtonValue(this, '${escapeHtml(option)}')">${escapeHtml(option)}</button>`).join('')}
    </div>`;
}

function setOptionButtonValue(button, value) {
    const group = button.closest('.option-buttons');
    if (!group) return;
    const input = group.querySelector('input[type="hidden"]');
    if (input) input.value = value;
    group.querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
    if (currentTab === 'DON_HANG') {
        recalculateDonHangForm();
        recalculateDonHangDetail();
    } else if (currentTab === 'NHAP_XUAT') {
        recalculateNhapXuatForm();
    }
}

function renderNhapXuatProductSelect(value = '') {
    const selectedValue = String(value || '').trim().toUpperCase();
    const options = dsSpOptionsCache || [];
    return `<select data-nhap-xuat-item-field="id_sp" onchange="recalculateNhapXuatForm()">
        <option value=""></option>
        ${options.map(item => {
        const label = item.name ? `${item.id} - ${item.name}` : item.id;
        return `<option value="${escapeHtml(item.id)}" ${selectedValue === item.id ? 'selected' : ''}>${escapeHtml(label)}</option>`;
    }).join('')}
    </select>`;
}

function renderNhapXuatItemRow(item = {}) {
    return `<tr data-sheet-row="${item._sheetRow || ''}">
        <td>${renderNhapXuatProductSelect(item.id_sp)}</td>
        <td><input data-nhap-xuat-item-field="slg" type="number" min="0" step="1" value="${escapeHtml(item.slg || '')}" oninput="recalculateNhapXuatForm()"></td>
        <td><input data-nhap-xuat-item-field="don_gia" type="text" readonly value="" style="background: #f8fafc; color: #64748b;"></td>
        <td><input data-nhap-xuat-item-field="thanh_tien" type="text" readonly value="" style="background: #f8fafc; color: #64748b; font-weight: bold;"></td>
        <td style="text-align: center; vertical-align: middle;"><input type="checkbox" data-nhap-xuat-item-field="xac_nhan" ${item.xac_nhan !== false ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer; margin-top: 5px;"></td>
        <td style="text-align: center; vertical-align: middle;"><button type="button" class="icon-btn" style="color: #ef4444; border: transparent; margin: 0 auto;" onclick="removeNhapXuatItemRow(this)"><i data-lucide="trash-2" style="width:16px;"></i></button></td>
    </tr>`;
}

function renderNhapXuatForm(groupRows = null) {
    const isEditing = groupRows && Array.isArray(groupRows) && groupRows.length > 0;
    const firstRow = isEditing ? groupRows[0] : null;
    const container = document.getElementById('formFields');
    const idValue = firstRow ? firstRow[0] : generateNextId();
    const dateValue = getFormRowValue(firstRow, 'ngay', 1);
    const fieldValue = firstRow ? String(firstRow[2] || '').trim() : 'NHẬP';
    const storeValue = firstRow ? String(firstRow[3] || '').trim() : '';
    
    const items = isEditing
        ? groupRows.map(r => ({ id_sp: r[4] || '', slg: r[5] || '', xac_nhan: true, _sheetRow: getDataSheetRow(r) }))
        : [{ id_sp: '', slg: '', xac_nhan: true, _sheetRow: '' }];

    const originalSheetRows = isEditing ? groupRows.map(r => getDataSheetRow(r)).join(',') : '';

    container.innerHTML = `
        <input id="formField_0" data-field="id" type="hidden" value="${escapeHtml(idValue)}">
        <input id="nhapXuatOriginalSheetRows" type="hidden" value="${originalSheetRows}">
        <div class="form-section-grid">
            <label><span>NGÀY</span><input id="formField_1" data-field="ngay" type="date" value="${escapeHtml(dateValue)}"></label>
            <label><span>TRƯỜNG</span>${renderOptionButtons('nhap_xuat_truong', fieldValue, ['NHẬP', 'XUẤT'], 'id="formField_2" data-field="truong"')}</label>
            <label><span>GIAN</span><select id="formField_3" data-field="gian"><option value=""></option>${thongTinStoreNames.map(option => `<option value="${escapeHtml(option)}" ${storeValue === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>
        </div>
        <div class="form-table-section">
            <div class="form-table-title" style="margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <strong style="font-size: 1.1rem; color: var(--primary);">SẢN PHẨM</strong>
                    <button type="button" class="secondary-btn compact-btn" style="display: flex; align-items: center; gap: 6px;" onclick="addNhapXuatItemRow()"><i data-lucide="plus" style="width:16px;"></i> Thêm sản phẩm</button>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="secondary-btn compact-btn" onclick="toggleAllNhapXuatConfirm(true)">Xác nhận hết</button>
                    <button type="button" class="secondary-btn compact-btn" onclick="toggleAllNhapXuatConfirm(false)">Bỏ xác nhận</button>
                </div>
            </div>
            <div style="overflow-x: auto; padding-bottom: 4px; border-radius: 8px; border: 1px solid var(--border);">
                <table class="form-edit-table" style="min-width: 700px; border: none;">
                    <thead><tr>
                        <th style="width: 35%; background: #f8fafc;">ID_SP</th>
                        <th style="width: 15%; background: #f8fafc;">SLG</th>
                        <th style="width: 20%; background: #f8fafc;">ĐƠN GIÁ</th>
                        <th style="width: 20%; background: #f8fafc;">THÀNH TIỀN</th>
                        <th style="width: 10%; text-align: center; background: #f8fafc;">XÁC NHẬN</th>
                        <th style="width: 50px; background: #f8fafc;"></th>
                    </tr></thead>
                    <tbody id="nhapXuatItemsBody">${items.map(renderNhapXuatItemRow).join('')}</tbody>
                </table>
            </div>
        </div>
    `;
    setTimeout(() => {
        recalculateNhapXuatForm();
        lucide.createIcons();
    }, 0);
}

function addNhapXuatItemRow() {
    document.getElementById('nhapXuatItemsBody')?.insertAdjacentHTML('beforeend', renderNhapXuatItemRow());
    lucide.createIcons();
}

function removeNhapXuatItemRow(button) {
    const body = document.getElementById('nhapXuatItemsBody');
    const rows = body ? [...body.querySelectorAll('tr')] : [];
    if (rows.length <= 1) {
        const row = button.closest('tr');
        row?.querySelectorAll('select,input[type="number"],input[type="text"]').forEach(input => { input.value = ''; });
        row?.querySelectorAll('input[type="checkbox"]').forEach(input => { input.checked = false; });
        return;
    }
    button.closest('tr')?.remove();
    recalculateNhapXuatForm();
}

function toggleAllNhapXuatConfirm(checked) {
    document.querySelectorAll('#nhapXuatItemsBody input[data-nhap-xuat-item-field="xac_nhan"]').forEach(cb => {
        cb.checked = checked;
    });
}

function recalculateNhapXuatForm() {
    if (currentTab !== 'NHAP_XUAT') return;
    const truong = document.getElementById('formField_2')?.value.trim() || 'NHẬP';
    const isNhap = truong === 'NHẬP';
    const optionsMap = new Map((dsSpOptionsCache || []).map(o => [o.id, o]));
    
    document.querySelectorAll('#nhapXuatItemsBody tr').forEach(tr => {
        const idSp = tr.querySelector('[data-nhap-xuat-item-field="id_sp"]')?.value.trim() || '';
        const slgInput = tr.querySelector('[data-nhap-xuat-item-field="slg"]');
        const donGiaInput = tr.querySelector('[data-nhap-xuat-item-field="don_gia"]');
        const thanhTienInput = tr.querySelector('[data-nhap-xuat-item-field="thanh_tien"]');
        
        let donGia = 0;
        if (idSp && optionsMap.has(idSp)) {
            const product = optionsMap.get(idSp);
            donGia = isNhap ? product.gia_nhap : product.gia_ban;
        }
        
        const slg = parseMoney(slgInput?.value || '');
        const thanhTien = donGia * slg;
        
        if (donGiaInput) donGiaInput.value = formatDisplayNumber(donGia);
        if (thanhTienInput) thanhTienInput.value = formatDisplayNumber(thanhTien);
    });
}

function renderFormFields(rowOrGroup = null) {
    const container = document.getElementById('formFields');
    if (currentTab === 'NHAP_XUAT') {
        renderNhapXuatForm(rowOrGroup);
        return;
    }
    const row = rowOrGroup;
    const headers = getStorageHeaders();
    container.innerHTML = headers.map((header, idx) => {
        const rawValue = getFormRowValue(row, header, idx);
        const value = escapeHtml(rawValue);

        if (header === 'id') {
            const idValue = row ? rawValue : generateNextId();
            return `<input id="formField_${idx}" data-field="${header}" type="hidden" value="${escapeHtml(idValue)}">`;
        }

        if (header === 'ghi_chu' || header === 'noi_dung') {
            return `<label><span>${header.toUpperCase()}</span><textarea id="formField_${idx}" data-field="${header}" rows="4">${value}</textarea></label>`;
        }

        if (header === 'truong') {
            return `<label><span>TRƯỜNG</span><input id="formField_${idx}" data-field="${header}" type="text" value="${value}" list="truongOptions" autocomplete="off"></label>`;
        }

        if (header === 'mail') {
            return `<label><span>EMAIL</span><input id="formField_${idx}" data-field="${header}" type="email" value="${value}"></label>`;
        }

        if (currentTab === 'HOA_DON') {
            if (header === 'ngay') {
                return `<label><span>NGÀY</span><input id="formField_${idx}" data-field="${header}" type="date" value="${value}"></label>`;
            }
            if (header === 'ncc') {
                return `<label><span>NCC</span><input id="formField_${idx}" data-field="${header}" type="text" value="${value}" list="nccOptions" autocomplete="off"></label>`;
            }
        }

        if (currentTab === 'NHAP_XUAT' || currentTab === 'TON_KHO') {
            if (header === 'ngay') {
                return `<label><span>NGÀY</span><input id="formField_${idx}" data-field="${header}" type="date" value="${value}"></label>`;
            }
            if (header === 'gian') {
                return `<label><span>GIAN</span><select id="formField_${idx}" data-field="${header}"><option value=""></option>${thongTinStoreNames.map(option => `<option value="${escapeHtml(option)}" ${String(rawValue) === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
            }
            if (header === 'slg' || header === 'ton_dau') {
                return `<label><span>${header.toUpperCase()}</span><input id="formField_${idx}" data-field="${header}" type="text" inputmode="decimal" value="${value}"></label>`;
            }
        }

        if (currentTab === 'DON_HANG') {
            const options = getDonHangFieldOptions(header);
            if (options) {
                if (header === 'tinh_trang') {
                    return `<label><span>${header.toUpperCase()}</span>${renderOptionButtons(`form_${header}`, rawValue, options, `id="formField_${idx}" data-field="${escapeHtml(header)}"`)}</label>`;
                }
                return `<label><span>${header.toUpperCase()}</span><select id="formField_${idx}" data-field="${header}"><option value=""></option>${options.map(option => `<option value="${escapeHtml(option)}" ${String(rawValue) === option ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
            }
            if (['ngay', 'phí thuế', 'phí piship', 'doanh_thu', 'tien_sp', 'loi_nhuan', 'id_sp', 'thanh_tien'].includes(header)) {
                return `<label><span>${header.toUpperCase()}</span><input id="formField_${idx}" data-field="${header}" type="text" value="${value}" readonly></label>`;
            }
        }

        return `<label><span>${header.toUpperCase()}</span><input id="formField_${idx}" data-field="${header}" type="text" value="${value}"></label>`;
    }).join('');
}

async function openRecordForm(rowIndex = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const row = rowIndex === null ? null : filteredData[rowIndex];

    document.getElementById('editingSheetRow').value = row ? getDataSheetRow(row) : '';
    if (currentTab === 'NHAP_XUAT') {
        modal.classList.add('side-panel-mask');
        let groupRows = null;
        if (row) {
            const ngay = String(row[1] || '').trim();
            const truong = String(row[2] || '').trim();
            const gian = String(row[3] || '').trim();
            groupRows = allData.filter(r => 
                String(r[1] || '').trim() === ngay && 
                String(r[2] || '').trim() === truong && 
                String(r[3] || '').trim() === gian
            );
        }
        try {
            await fetchDsSpOptions();
        } catch (err) {
            console.error(err);
            alert(err.message);
            return;
        }
        renderFormFields(groupRows);
    } else {
        modal.classList.remove('side-panel-mask');
        renderFormFields(row);
    }
    if (currentTab === 'DON_HANG') {
        document.getElementById('formFields').oninput = recalculateDonHangForm;
        recalculateDonHangForm();
    } else {
        document.getElementById('formFields').oninput = null;
    }
    title.innerText = row ? `Sửa ${TAB_LABELS[currentTab] || currentTab}` : `Thêm mới ${TAB_LABELS[currentTab] || currentTab}`;
    modal.classList.add('active');
    document.getElementById('formField_1')?.focus();
    lucide.createIcons();
}

function closeProductForm() {
    document.getElementById('productModal').classList.remove('active');
}

async function openDonHangDetail(orderId) {
    const rows = allData.filter(row => getRowId(row, 'DON_HANG') === String(orderId || '').trim());
    if (!rows.length) return;
    let productNameMap = new Map();
    try {
        productNameMap = await fetchDsSpNameMap();
    } catch (err) {
        console.error(err);
    }

    const generalHeaders = ['gian_hang', 'ngay', 'ngay_h', 'mdh', 'mvd', 'tinh_trang', 'trang_thai'];
    const financeHeaders = ['tong_tien', 'Mã giảm giá', 'Phí cố định', 'Phí Dịch Vụ', 'Phí xử lý giao dịch', 'phí thuế', 'phí piship', 'afl', 'doanh_thu', 'phí khác', 'tien_sp', 'loi_nhuan'];
    const itemHeaders = ['SKU phân loại hàng', 'id_sp', 'slg', 'don_gia', 'thanh_tien'];
    const firstRow = rows[0];
    editingDonHangRows = rows;
    document.getElementById('orderDetailTitle').innerText = `Chi tiết đơn hàng ${orderId}`;
    const renderDetailInput = (header, value, extraAttributes = '') => {
        const options = getDonHangFieldOptions(header);
        if (options) {
            if (header === 'tinh_trang') {
                return renderOptionButtons(`detail_${header}`, value, options, `data-order-header="${escapeHtml(header)}"`);
            }
            return `<select data-order-header="${escapeHtml(header)}">${options
                .map(option => `<option value="${escapeHtml(option)}" ${String(value) === option ? 'selected' : ''}>${escapeHtml(option)}</option>`)
                .join('')}</select>`;
        }
        const displayValue = DON_HANG_NUMERIC_HEADERS.has(header) ? formatDisplayNumber(value) : value;
        return `<input data-order-header="${escapeHtml(header)}" ${extraAttributes} type="text" value="${escapeHtml(displayValue)}">`;
    };
    const renderFieldsTable = (title, headers) => `<section class="order-detail-section">
        <h3>${escapeHtml(title)}</h3>
        <div class="order-detail-table-wrapper">
            <table class="order-detail-edit-table">
                <tbody>${headers.map(header => {
        const value = firstRow[DON_HANG_INDEX[header]] || '';
        return `<tr><th>${escapeHtml(header.toUpperCase())}</th><td>${renderDetailInput(header, value)}</td></tr>`;
    }).join('')}</tbody>
            </table>
        </div>
    </section>`;
    document.getElementById('orderDetailFields').innerHTML =
        renderFieldsTable('THÔNG TIN ĐƠN HÀNG', generalHeaders)
        + renderFieldsTable('THÔNG TIN TÀI CHÍNH', financeHeaders);
    document.getElementById('orderDetailFields').oninput = recalculateDonHangDetail;
    document.getElementById('orderDetailHead').innerHTML = `<tr>${itemHeaders.map(header => `<th>${escapeHtml(header.toUpperCase())}</th>`).join('')}</tr>`;
    const renderItemInput = (row, rowIndex, header) => {
        const value = DON_HANG_NUMERIC_HEADERS.has(header) ? formatDisplayNumber(row[DON_HANG_INDEX[header]]) : (row[DON_HANG_INDEX[header]] || '');
        if (header === 'id_sp') {
            const key = String(value || '').trim().toUpperCase();
            return `<td><div class="product-id-cell">
                <input data-order-item-row="${rowIndex}" data-order-item-header="${escapeHtml(header)}" type="text" value="${escapeHtml(value)}">
                <small data-product-name-row="${rowIndex}">${escapeHtml(productNameMap.get(key) || '')}</small>
            </div></td>`;
        }
        return `<td><input data-order-item-row="${rowIndex}" data-order-item-header="${escapeHtml(header)}" type="text" value="${escapeHtml(value)}"></td>`;
    };
    document.getElementById('orderDetailBody').innerHTML = rows.map((row, rowIndex) => `<tr>${itemHeaders
        .map(header => renderItemInput(row, rowIndex, header))
        .join('')}</tr>`).join('');
    document.getElementById('orderDetailBody').oninput = recalculateDonHangDetail;
    document.getElementById('orderDetailModal').onfocusout = formatDonHangDetailNumbers;
    document.getElementById('orderDetailModal').classList.add('active');
    recalculateDonHangDetail();
    lucide.createIcons();
}

function closeDonHangDetail() {
    document.getElementById('orderDetailModal').classList.remove('active');
    editingDonHangRows = [];
}

function formatDonHangDetailNumbers() {
    DON_HANG_NUMERIC_HEADERS.forEach(header => {
        document.querySelectorAll(`[data-order-header="${CSS.escape(header)}"], [data-order-item-header="${CSS.escape(header)}"]`).forEach(input => {
            input.value = formatDisplayNumber(input.value);
        });
    });
}

function recalculateDonHangDetail() {
    if (!editingDonHangRows.length) return;
    refreshOrderProductNames();
    const totalInput = document.querySelector(`[data-order-header="tong_tien"]`);
    const shopDiscountInput = document.querySelector(`[data-order-header="Mã giảm giá"]`);
    const fixedFeeInput = document.querySelector(`[data-order-header="Phí cố định"]`);
    const serviceFeeInput = document.querySelector(`[data-order-header="Phí Dịch Vụ"]`);
    const transactionFeeInput = document.querySelector(`[data-order-header="Phí xử lý giao dịch"]`);
    const taxFeeInput = document.querySelector(`[data-order-header="phí thuế"]`);
    const pishipFeeInput = document.querySelector(`[data-order-header="phí piship"]`);
    const aflFeeInput = document.querySelector(`[data-order-header="afl"]`);
    const receivedInput = document.querySelector(`[data-order-header="doanh_thu"]`);
    const taxFee = roundMoney((parseMoney(totalInput?.value) - parseMoney(shopDiscountInput?.value)) * 0.015);
    if (taxFeeInput) taxFeeInput.value = formatDisplayNumber(taxFee);
    const received = roundMoney(
        parseMoney(totalInput?.value)
        - parseMoney(shopDiscountInput?.value)
        - parseMoney(fixedFeeInput?.value)
        - parseMoney(serviceFeeInput?.value)
        - parseMoney(transactionFeeInput?.value)
        - taxFee
        - parseMoney(pishipFeeInput?.value)
        - parseMoney(aflFeeInput?.value)
    );
    let productTotal = 0;
    editingDonHangRows.forEach((_, rowIndex) => {
        const quantityInput = document.querySelector(`[data-order-item-row="${rowIndex}"][data-order-item-header="slg"]`);
        const unitPriceInput = document.querySelector(`[data-order-item-row="${rowIndex}"][data-order-item-header="don_gia"]`);
        const lineTotalInput = document.querySelector(`[data-order-item-row="${rowIndex}"][data-order-item-header="thanh_tien"]`);
        const lineTotal = roundMoney(parseMoney(quantityInput?.value) * parseMoney(unitPriceInput?.value));
        if (lineTotalInput) lineTotalInput.value = formatDisplayNumber(lineTotal);
        productTotal = roundMoney(productTotal + lineTotal);
    });
    const productTotalInput = document.querySelector(`[data-order-header="tien_sp"]`);
    if (productTotalInput) productTotalInput.value = formatDisplayNumber(productTotal);
    const otherFeeInput = document.querySelector(`[data-order-header="phí khác"]`);
    const profitInput = document.querySelector(`[data-order-header="loi_nhuan"]`);
    const statusInput = document.querySelector(`[data-order-header="tinh_trang"]`);
    const orderStatusInput = document.querySelector(`[data-order-header="trang_thai"]`);
    const status = String(statusInput?.value || '').trim().toLocaleUpperCase('vi');
    
    if (status === 'HỦY') {
        if (receivedInput) receivedInput.value = formatDisplayNumber(0);
    } else if (status === 'HOÀN' || status === 'TRẢ') {
        if (receivedInput) receivedInput.value = formatDisplayNumber(-parseMoney(pishipFeeInput?.value));
    } else {
        if (receivedInput) receivedInput.value = formatDisplayNumber(received);
    }

    if (profitInput) {
        if (status === 'HỦY') {
            if (orderStatusInput) orderStatusInput.value = 'HỦY';
            profitInput.value = formatDisplayNumber(0);
        } else if (status === 'HOÀN' || status === 'TRẢ') {
            if (orderStatusInput) orderStatusInput.value = 'HỦY';
            profitInput.value = formatDisplayNumber(-parseMoney(pishipFeeInput?.value));
        } else {
            if (orderStatusInput) orderStatusInput.value = 'HOÀN THÀNH';
            profitInput.value = formatDisplayNumber(parseMoney(receivedInput?.value) - parseMoney(otherFeeInput?.value) - productTotal);
        }
    }
}

function refreshOrderProductNames() {
    if (!dsSpNameMapCache) return;
    editingDonHangRows.forEach((_, rowIndex) => {
        const idInput = document.querySelector(`[data-order-item-row="${rowIndex}"][data-order-item-header="id_sp"]`);
        const skuInput = document.querySelector(`[data-order-item-row="${rowIndex}"][data-order-item-header="SKU phân loại hàng"]`);
        const nameEl = document.querySelector(`[data-product-name-row="${rowIndex}"]`);
        if (!idInput || !nameEl) return;
        if (!String(idInput.value || '').trim() && skuInput?.value) {
            idInput.value = String(skuInput.value || '').slice(0, 4).toUpperCase();
        }
        const key = String(idInput.value || '').trim().toUpperCase();
        nameEl.innerText = dsSpNameMapCache.get(key) || '';
    });
}

function addDonHangItem() {
    if (!editingDonHangRows.length) return;
    const firstRow = normalizeRow(editingDonHangRows[0]);
    const newRow = [...firstRow];
    ['SKU phân loại hàng', 'id_sp', 'slg', 'don_gia', 'thanh_tien'].forEach(header => {
        newRow[DON_HANG_INDEX[header]] = '';
    });
    editingDonHangRows.push(newRow);
    const rowIndex = editingDonHangRows.length - 1;
    const itemHeaders = ['SKU phân loại hàng', 'id_sp', 'slg', 'don_gia', 'thanh_tien'];
    document.getElementById('orderDetailBody').insertAdjacentHTML('beforeend', `<tr>${itemHeaders
        .map(header => header === 'id_sp'
            ? `<td><div class="product-id-cell"><input data-order-item-row="${rowIndex}" data-order-item-header="${escapeHtml(header)}" type="text" value=""><small data-product-name-row="${rowIndex}"></small></div></td>`
            : `<td><input data-order-item-row="${rowIndex}" data-order-item-header="${escapeHtml(header)}" type="text" value=""></td>`)
        .join('')}</tr>`);
    lucide.createIcons();
}

async function saveDonHangDetail() {
    if (!editingDonHangRows.length) return;
    recalculateDonHangDetail();
    const itemHeaders = ['SKU phân loại hàng', 'id_sp', 'slg', 'don_gia', 'thanh_tien'];
    const headerInputs = Array.from(document.querySelectorAll('[data-order-header]'));
    const commonValues = Object.fromEntries(headerInputs.map(input => [
        input.getAttribute('data-order-header'),
        input.value.trim()
    ]));
    const detailHeadersToSave = Object.keys(commonValues);
    const updatedRows = editingDonHangRows.map((sourceRow, rowIndex) => {
        const row = normalizeRow(sourceRow);
        detailHeadersToSave.forEach(header => {
            if (DON_HANG_INDEX[header] !== undefined) {
                row[DON_HANG_INDEX[header]] = DON_HANG_NUMERIC_HEADERS.has(header) ? parseMoney(commonValues[header]) : commonValues[header];
            }
        });
        itemHeaders.forEach(header => {
            const value = document.querySelector(`[data-order-item-row="${rowIndex}"][data-order-item-header="${CSS.escape(header)}"]`)?.value.trim() || '';
            row[DON_HANG_INDEX[header]] = DON_HANG_NUMERIC_HEADERS.has(header) ? parseMoney(value) : value;
        });
        return row;
    });

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = 'Đang lưu chi tiết đơn hàng...';
    try {
        const newRows = [];
        for (let index = 0; index < updatedRows.length; index += 1) {
            const sheetRow = getDataSheetRow(editingDonHangRows[index]);
            if (sheetRow) {
                await writeRecordRow(updatedRows[index], sheetRow);
            } else {
                newRows.push(updatedRows[index]);
            }
        }
        await appendRecordRows(newRows);
        closeDonHangDetail();
        await fetchData();
        filterTable();
    } catch (err) {
        console.error(err);
        alert('Không lưu được chi tiết đơn hàng: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function syncTonKhoFromNhapXuat(gian, idSps) {
    if (!gian || !idSps || !idSps.length) return;
    try {
        const token = await getAccessToken();
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/TON_KHO!A2:D`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const tonKhoRows = data.values || [];
        
        const existingTonKhoSet = new Set(
            tonKhoRows
                .filter(row => String(row[1] || '').trim() === gian)
                .map(row => String(row[2] || '').trim().toUpperCase())
        );
        
        const idsToProcess = [...new Set(idSps.map(id => id.trim().toUpperCase()))].filter(Boolean);
        const newTonKhoRows = [];
        const existingIds = tonKhoRows.map(row => String(row[0] || '').trim());
        
        for (const idSp of idsToProcess) {
            if (!existingTonKhoSet.has(idSp)) {
                const newId = generateNextId([...existingIds, ...newTonKhoRows.map(r => r[0])], 'TON_KHO');
                newTonKhoRows.push([newId, gian, idSp, 0]);
                existingTonKhoSet.add(idSp);
            }
        }
        
        if (newTonKhoRows.length > 0) {
            const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/TON_KHO!A2:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: newTonKhoRows })
            });
            if (!appendRes.ok) console.error('Failed to append to TON_KHO');
        }
    } catch (err) {
        console.error('Error syncing TON_KHO:', err);
    }
}

async function saveRecordFromForm(event) {
    event.preventDefault();
    const headers = getStorageHeaders();
    const editingSheetRow = Number(document.getElementById('editingSheetRow').value);
    if (currentTab === 'NHAP_XUAT') {
        try {
            const baseId = document.getElementById('formField_0')?.value.trim() || generateNextId();
            const ngay = formatDateDdMmYyyy(document.getElementById('formField_1')?.value.trim() || '');
            const truong = document.getElementById('formField_2')?.value.trim() || '';
            const gian = document.getElementById('formField_3')?.value.trim() || '';
            const itemRows = [...document.querySelectorAll('#nhapXuatItemsBody tr')]
                .filter(tr => tr.querySelector('[data-nhap-xuat-item-field="xac_nhan"]')?.checked)
                .map((tr, index) => {
                    const idSp = tr.querySelector('[data-nhap-xuat-item-field="id_sp"]')?.value.trim() || '';
                    const slg = parseMoney(tr.querySelector('[data-nhap-xuat-item-field="slg"]')?.value || '');
                    const donGia = parseMoney(tr.querySelector('[data-nhap-xuat-item-field="don_gia"]')?.value || '');
                    const thanhTien = parseMoney(tr.querySelector('[data-nhap-xuat-item-field="thanh_tien"]')?.value || '');
                    const sheetRow = tr.dataset.sheetRow || '';
                    return { idSp, slg, donGia, thanhTien, sheetRow, index };
                })
                .filter(item => item.idSp || item.slg);
            if (!ngay || !truong || !gian) throw new Error('Vui lòng nhập đủ ngày, trường và gian.');
            
            const originalSheetRows = (document.getElementById('nhapXuatOriginalSheetRows')?.value || '').split(',').filter(Boolean).map(Number);
            
            if (!itemRows.length) {
                if (originalSheetRows.length) {
                    if (!confirm('Bạn đã bỏ xác nhận tất cả sản phẩm. Toàn bộ nhóm dữ liệu này sẽ bị xóa. Bạn có chắc chắn?')) {
                        return;
                    }
                    document.getElementById('loading').style.display = 'flex';
                    document.querySelector('#loading p').innerText = `Đang xóa dữ liệu...`;
                    await deleteSheetRows('NHAP_XUAT', originalSheetRows);
                    closeProductForm();
                    await fetchData();
                    filterTable();
                    return;
                } else {
                    throw new Error('Vui lòng thêm và chọn xác nhận ít nhất một sản phẩm hợp lệ.');
                }
            }
            
            if (itemRows.some(item => !item.idSp || !item.slg)) throw new Error('Mỗi dòng sản phẩm được xác nhận phải có đủ ID_SP và SLG.');
            
            const rows = itemRows.map((item, index) => [
                baseId,
                ngay,
                truong,
                gian,
                item.idSp,
                item.slg,
                item.donGia,
                item.thanhTien
            ]);
            document.getElementById('loading').style.display = 'flex';
            document.querySelector('#loading p').innerText = `Đang lưu dữ liệu...`;
            
            const newRows = [];
            for (let i = 0; i < rows.length; i++) {
                if (i < originalSheetRows.length) {
                    await writeRecordRow(rows[i], originalSheetRows[i]);
                } else {
                    newRows.push(rows[i]);
                }
            }
            if (newRows.length) {
                await appendRecordRows(newRows);
            }
            if (originalSheetRows.length > rows.length) {
                const rowsToDelete = originalSheetRows.slice(rows.length);
                await deleteSheetRows('NHAP_XUAT', rowsToDelete);
            }
            
            document.querySelector('#loading p').innerText = `Đang đồng bộ tồn kho...`;
            const uniqueIdSps = [...new Set(itemRows.map(item => item.idSp))];
            await syncTonKhoFromNhapXuat(gian, uniqueIdSps);
            
            closeProductForm();
            await fetchData();
            filterTable();
        } catch (err) {
            console.error(err);
            alert(`Không lưu được dữ liệu: ` + err.message);
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
        return;
    }
    let row = headers.map((_, idx) => document.getElementById(`formField_${idx}`)?.value.trim() || '');
    if (currentTab === 'DON_HANG') {
        row[DON_HANG_INDEX.ngay] = getDateOnly(row[DON_HANG_INDEX.ngay_h]);
        row[DON_HANG_INDEX.id_sp] = String(row[DON_HANG_INDEX['SKU phân loại hàng']] || '').slice(0, 4);
        row = recalculateDonHangRows([row])[0];
    }
    if (currentTab === 'HOA_DON') {
        row[1] = formatDateDdMmYyyy(row[1]);
    }
    if (currentTab === 'NHAP_XUAT') {
        row[1] = formatDateDdMmYyyy(row[1]);
        row[5] = parseMoney(row[5]);
    }
    if (currentTab === 'TON_KHO') {
        row[3] = parseMoney(row[3]);
    }
    if (currentTab !== 'DON_HANG' && !row[0]) {
        row[0] = generateNextId();
    }

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang lưu dữ liệu...`;
    try {
        const existing = currentTab === 'DON_HANG'
            ? allData.find(item => getRowId(item) === getRowId(row))
            : getRowById(row[0]);
        if (currentTab === 'DON_HANG' && !editingSheetRow && existing) {
            throw new Error(`Mã đơn hàng '${getRowId(row)}' đã tồn tại. Mỗi mã đơn hàng chỉ được thêm một lần.`);
        }
        const targetSheetRow = editingSheetRow || (existing ? getDataSheetRow(existing) : 0);
        if (targetSheetRow) {
            await writeRecordRow(row, targetSheetRow);
        } else {
            await appendRecordRows([row]);
        }
        closeProductForm();
        await fetchData();
        filterTable();
    } catch (err) {
        console.error(err);
        alert(`Không lưu được dữ liệu: ` + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function initDragAndDrop() {
    const overlay = document.getElementById('dropOverlay');

    window.addEventListener('dragover', (e) => {
        e.preventDefault();
        overlay.classList.add('active');
    });

    window.addEventListener('dragleave', (e) => {
        if (e.relatedTarget === null) overlay.classList.remove('active');
    });

    window.addEventListener('drop', (e) => {
        e.preventDefault();
        overlay.classList.remove('active');
        if (e.dataTransfer.files.length > 0) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    });
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    const tabConfig = CONFIG.tabs[currentTab];
    const displayHeaders = getDisplayHeaders();
    const storageHeaders = getStorageHeaders();

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    tbody.innerHTML = pageData.map((row, rowIndex) => {
        const cells = displayHeaders.map(header => {
            if ((currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET') && header === 'chi_phi') {
                return `<td class="cost-toggle-cell" onclick="event.stopPropagation(); toggleOrderCostDetails();" title="Bấm để ${orderCostDetailsExpanded ? 'thu' : 'mở'} chi phí chi tiết">${escapeHtml(formatDisplayNumber(getDonHangCostTotal(row)))}</td>`;
            }
            const idx = storageHeaders.indexOf(header);
            const cell = (idx >= 0 ? row[idx] : row[header]) ?? '';
            if (idx === tabConfig.imgCol && cell) {
                const firstImg = cell.split(',')[0].trim();
                return `<td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="${firstImg}" class="table-img" onerror="this.style.display='none'">
                        <a href="${cell.split(',')[0].trim()}" target="_blank" style="color: var(--primary); text-decoration: none; font-size: 11px; font-weight: 600;">Xem</a>
                    </div>
                </td>`;
            }
            const cellStr = String(cell || '').trim();
            if (cellStr.startsWith('http://') || cellStr.startsWith('https://')) {
                const parts = cellStr.split(',');
                const linksHtml = parts.map((l, i) => `<a href="${l.trim()}" target="_blank" style="color: var(--primary); font-weight: 600; text-decoration: none;">Link ${parts.length > 1 ? i + 1 : ''}</a>`.trim());
                return `<td>${linksHtml.join(', ')}</td>`;
            }
            const displayCell = isNumericDisplayHeader(header)
                ? formatDisplayNumber(cell)
                : cell;
            const matchedReturnStatus = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET') && header === 'tinh_trang'
                ? getMatchedReturnStatusForOrder(row)
                : '';
            const mvdDifferentStoreReturnStatus = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET') && header === 'tinh_trang' && !matchedReturnStatus
                ? getMvdDifferentStoreReturnStatusForOrder(row)
                : '';
            const displayValue = displayCell;
            const classNames = [];
            if (
                ((currentTab === 'DON_HANG' && header === 'ngay_h') || (currentTab === 'DON_HANG_CHI_TIET' && header === 'mdh'))
                && getDonHangItemCount(getRowId(row, 'DON_HANG')) >= 2) {
                classNames.push('multi-item-date');
            }
            const returnStatusClass = matchedReturnStatus
                ? getReturnStatusClass(matchedReturnStatus)
                : (mvdDifferentStoreReturnStatus ? 'return-status-mvd-other-store' : '');
            if (returnStatusClass) classNames.push(returnStatusClass);
            const cellClass = classNames.length ? ` class="${classNames.join(' ')}"` : '';

            if ((currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET') && header === 'tinh_trang') {
                const statusOptions = ['HỦY', 'HOÀN', 'TRẢ', 'HOÀN THÀNH'];
                const orderIdStr = escapeHtml(escapeJsString(getRowId(row, 'DON_HANG')));
                const buttons = statusOptions.map(opt => `<button onclick="event.stopPropagation(); quickUpdateOrderStatus('${orderIdStr}', '${opt}')" style="font-size:10px; padding:2px 4px; cursor:pointer; background:${opt === displayValue ? 'var(--primary)' : '#f8f9fa'}; color:${opt === displayValue ? '#fff' : '#333'}; border:1px solid #ddd; border-radius:4px; margin:2px;">${escapeHtml(opt)}</button>`).join('');
                return `<td${cellClass} style="white-space:normal; min-width:140px;">${buttons}</td>`;
            }

            if ((currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET') && header === 'hoan_hang') {
                const hoanHangOptions = ['Đã về kho', 'Chưa về'];
                const orderIdStr = escapeHtml(escapeJsString(getRowId(row, 'DON_HANG')));
                const buttons = hoanHangOptions.map(opt => `<button onclick="event.stopPropagation(); quickUpdateOrderHoanHang('${orderIdStr}', '${opt}')" style="font-size:10px; padding:2px 4px; cursor:pointer; background:${opt === displayValue ? 'var(--primary)' : '#f8f9fa'}; color:${opt === displayValue ? '#fff' : '#333'}; border:1px solid #ddd; border-radius:4px; margin:2px;">${escapeHtml(opt)}</button>`).join('');
                return `<td${cellClass} style="white-space:normal; min-width:130px;">${buttons}</td>`;
            }

            return `<td${cellClass}>${escapeHtml(displayValue || '')}</td>`;
        }).join('');

        const editAction = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
            ? ` ondblclick="openDonHangDetail('${escapeHtml(escapeJsString(getRowId(row)))}')"`
            : ` ondblclick="openRecordForm(${start + rowIndex})"`;
        const selectCell = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
            ? `<td class="select-col"><input type="checkbox" ${selectedOrderIds.has(getRowId(row, 'DON_HANG')) ? 'checked' : ''} onclick="event.stopPropagation()" onchange="toggleOrderSelection('${escapeHtml(escapeJsString(getRowId(row, 'DON_HANG')))}', this.checked)"></td>`
            : currentTab === 'DH_HOAN'
                ? `<td class="select-col"><input type="checkbox" ${selectedReturnOrderIds.has(getReturnOrderKey(row)) ? 'checked' : ''} onclick="event.stopPropagation()" onchange="toggleReturnOrderSelection('${escapeHtml(escapeJsString(getReturnOrderKey(row)))}', this.checked)"></td>`
                : '';
        return `<tr${editAction}>${selectCell}${cells}</tr>`;
    }).join('');

    renderPagination();
}

function renderPagination() {
    const totalRows = filteredData.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    const pagination = document.getElementById('pagination');

    if (totalRows <= rowsPerPage) {
        pagination.innerHTML = '';
        return;
    }

    pagination.innerHTML = `
        <button class="pagination-btn" onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>
            <i data-lucide="chevron-left" style="width:16px;"></i> Trước
        </button>
        <div class="page-info">Trang ${currentPage} / ${totalPages} (${totalRows} dòng)</div>
        <button class="pagination-btn" onclick="changePage(1)" ${currentPage === totalPages ? 'disabled' : ''}>
            Tiếp <i data-lucide="chevron-right" style="width:16px;"></i>
        </button>
    `;
    lucide.createIcons();
}

function changePage(delta) {
    currentPage += delta;
    renderTable();
    document.querySelector('.table-wrapper').scrollTop = 0;
}

function filterTable() {
    const term = document.getElementById('searchInput').value.toLowerCase();
    const truong = (document.getElementById('truongFilter')?.value || '').toLowerCase();
    const store = (document.getElementById('storeFilter')?.value || '').toLowerCase();
    const dateFrom = document.getElementById('orderDateFrom')?.value || '';
    const dateTo = document.getElementById('orderDateTo')?.value || '';
    const mdh = (document.getElementById('orderMdhFilter')?.value || '').toLowerCase();
    const mvd = (document.getElementById('orderMvdFilter')?.value || '').toLowerCase();
    const tinhTrangList = (document.getElementById('orderTinhTrangFilter')?.value || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const trangThai = (document.getElementById('orderTrangThaiFilter')?.value || '').toLowerCase();
    const profitFilter = document.getElementById('orderProfitFilter')?.value || '';
    const dateFromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : 0;
    const dateToTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : 0;
    const sourceData = currentTab === 'DON_HANG' ? getDonHangSummaryRows() : allData;
    const terms = term.split(',').map(s => s.trim()).filter(Boolean);
    filteredData = sourceData.filter(row => {
        const matchesSearch = terms.length === 0 || terms.some(t => 
            currentTab === 'DON_HANG'
            ? allData.some(item => getRowId(item, 'DON_HANG') === getRowId(row, 'DON_HANG')
                && item.some(cell => String(cell).toLowerCase().includes(t)))
            : row.some(cell => String(cell).toLowerCase().includes(t))
        );
        const matchesTruong = !truong || String(row[1] || '').toLowerCase().includes(truong);
        const matchesStore = !['DON_HANG', 'DON_HANG_CHI_TIET'].includes(currentTab) || !store || String(row[DON_HANG_INDEX.gian_hang] || '').toLowerCase().includes(store);
        if (currentTab === 'DH_HOAN') {
            const returnStore = (document.getElementById('returnStoreSelect')?.value || '').toLowerCase();
            const returnTinhTrang = (document.getElementById('returnStatusSelect')?.value || '').toLowerCase();
            const returnDateFrom = document.getElementById('returnDateFrom')?.value || '';
            const returnDateTo = document.getElementById('returnDateTo')?.value || '';
            const returnDateFromTime = returnDateFrom ? new Date(`${returnDateFrom}T00:00:00`).getTime() : 0;
            const returnDateToTime = returnDateTo ? new Date(`${returnDateTo}T23:59:59`).getTime() : 0;
            const returnTime = parseDdMmYyyyDate(row[2]);
            const matchesReturnStore = !returnStore || String(row[0] || '').toLowerCase() === returnStore;
            const matchesReturnTinhTrang = !returnTinhTrang || String(row[1] || '').toLowerCase() === returnTinhTrang;
            const matchesReturnFrom = !returnDateFromTime || returnTime >= returnDateFromTime;
            const matchesReturnTo = !returnDateToTime || returnTime <= returnDateToTime;
            return matchesSearch && matchesReturnStore && matchesReturnTinhTrang && matchesReturnFrom && matchesReturnTo;
        }
        if (currentTab === 'DS_SP') {
            const tenSp = String(row[1] || '').toUpperCase();
            const matchesDsSpPrefix1 = !currentDsSpPrefix1Filter || tenSp.startsWith(currentDsSpPrefix1Filter);
            const matchesDsSpPrefix2 = !currentDsSpPrefix2Filter || tenSp.startsWith(currentDsSpPrefix2Filter);
            return matchesSearch && matchesDsSpPrefix1 && matchesDsSpPrefix2 && matchesTruong && matchesStore;
        }
        if (!['DON_HANG', 'DON_HANG_CHI_TIET'].includes(currentTab)) return matchesSearch && matchesTruong && matchesStore;
        const orderTime = parseDonHangDateTime(row[DON_HANG_INDEX.ngay_h]);
        const matchesDateFrom = !dateFromTime || orderTime >= dateFromTime;
        const matchesDateTo = !dateToTime || orderTime <= dateToTime;
        const matchesMdh = !mdh || String(row[DON_HANG_INDEX.mdh] || '').toLowerCase().includes(mdh);
        const matchesMvd = !mvd || String(row[DON_HANG_INDEX.mvd] || '').toLowerCase().includes(mvd);
        const matchesTinhTrang = tinhTrangList.length === 0 || tinhTrangList.includes(String(row[DON_HANG_INDEX.tinh_trang] || '').toLowerCase());
        const matchesTrangThai = !trangThai || String(row[DON_HANG_INDEX.trang_thai] || '').toLowerCase() === trangThai;
        const profit = parseMoney(row[DON_HANG_INDEX.loi_nhuan]);
        const matchesProfit = !profitFilter
            || (profitFilter === 'negative' && profit < 0)
            || (profitFilter === 'positive' && profit > 0);
        return matchesSearch && matchesStore && matchesDateFrom && matchesDateTo && matchesMdh && matchesMvd && matchesTinhTrang && matchesTrangThai && matchesProfit;
    });
    if (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET') {
        filteredData.sort((a, b) => parseDonHangDateTime(b[DON_HANG_INDEX.ngay_h]) - parseDonHangDateTime(a[DON_HANG_INDEX.ngay_h]));
        updateDonHangSummary();
        syncOrderProfitFilterButtons();
    }
    if (currentTab === 'HOA_DON') {
        filteredData.sort((a, b) => parseHoaDonDate(b[1]) - parseHoaDonDate(a[1]));
    }
    if (currentTab === 'NHAP_XUAT') {
        filteredData.sort((a, b) => parseDdMmYyyyDate(b[1]) - parseDdMmYyyyDate(a[1]));
    }
    if (currentTab === 'DH_HOAN') {
        filteredData.sort((a, b) => parseDdMmYyyyDate(b[2]) - parseDdMmYyyyDate(a[2]));
    }
    if (currentTab === 'DS_SP') {
        filteredData.sort((a, b) => String(b[0] || '').localeCompare(String(a[0] || '')));
    }
    currentPage = 1;
    renderTable();
}

function toIsoDateInput(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function setOrderQuickDateFilter(type) {
    const today = new Date();
    let start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let end = new Date(start);
    if (type === 'yesterday') {
        start.setDate(start.getDate() - 1);
        end = new Date(start);
    } else if (type === 'week') {
        const day = start.getDay() || 7;
        start.setDate(start.getDate() - day + 1);
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    } else if (type === 'month') {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
    document.getElementById('orderDateFrom').value = toIsoDateInput(start);
    document.getElementById('orderDateTo').value = toIsoDateInput(end);
    filterTable();
}

let currentDsSpPrefix1Filter = '';
let currentDsSpPrefix2Filter = '';

function setDsSpPrefix1Filter(prefix) {
    currentDsSpPrefix1Filter = prefix;
    currentDsSpPrefix2Filter = ''; // Reset 2nd level filter
    document.querySelectorAll('#dsSpPrefix1Buttons button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.prefix === prefix);
    });
    
    generateDsSpPrefix2Buttons(prefix);
    filterTable();
}

function setDsSpPrefix2Filter(prefix) {
    currentDsSpPrefix2Filter = prefix;
    document.querySelectorAll('#dsSpPrefix2Buttons button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.prefix === prefix);
    });
    filterTable();
}

function generateDsSpPrefix1Buttons() {
    if (currentTab !== 'DS_SP') return;
    const prefixes = new Set();
    allData.forEach(row => {
        const idSp = String(row[1] || '').trim().toUpperCase();
        if (idSp.length >= 1) prefixes.add(idSp.substring(0, 1));
    });
    
    const sortedPrefixes = Array.from(prefixes).sort();
    const container = document.getElementById('dsSpPrefix1Buttons');
    if (!container) return;
    
    container.innerHTML = `
        <button type="button" class="${!currentDsSpPrefix1Filter ? 'active' : ''}" data-prefix="" onclick="setDsSpPrefix1Filter('')">Tất cả</button>
        ${sortedPrefixes.map(p => `<button type="button" class="${currentDsSpPrefix1Filter === p ? 'active' : ''}" data-prefix="${escapeHtml(p)}" onclick="setDsSpPrefix1Filter('${escapeHtml(escapeJsString(p))}')">${escapeHtml(p)}</button>`).join('')}
    `;
    
    generateDsSpPrefix2Buttons(currentDsSpPrefix1Filter);
}

function generateDsSpPrefix2Buttons(prefix1) {
    if (currentTab !== 'DS_SP') return;
    const prefixes = new Set();
    allData.forEach(row => {
        const idSp = String(row[1] || '').trim().toUpperCase();
        if ((!prefix1 || idSp.startsWith(prefix1)) && idSp.length >= 2) {
            prefixes.add(idSp.substring(0, 2));
        }
    });
    
    const sortedPrefixes = Array.from(prefixes).sort();
    const container = document.getElementById('dsSpPrefix2Buttons');
    if (!container) return;
    
    container.innerHTML = `
        <button type="button" class="${!currentDsSpPrefix2Filter ? 'active' : ''}" data-prefix="" onclick="setDsSpPrefix2Filter('')">Tất cả</button>
        ${sortedPrefixes.map(p => `<button type="button" class="${currentDsSpPrefix2Filter === p ? 'active' : ''}" data-prefix="${escapeHtml(p)}" onclick="setDsSpPrefix2Filter('${escapeHtml(escapeJsString(p))}')">${escapeHtml(p)}</button>`).join('')}
    `;
}

function syncOrderProfitFilterButtons() {
    const value = document.getElementById('orderProfitFilter')?.value || '';
    document.querySelectorAll('[data-profit-filter]').forEach(button => {
        button.classList.toggle('active', button.dataset.profitFilter === value);
    });
}

function toggleOrderProfitFilter(value) {
    const input = document.getElementById('orderProfitFilter');
    if (!input) return;
    input.value = input.value === value ? '' : value;
    syncOrderProfitFilterButtons();
    filterTable();
}

function syncOrderStatusFilterButtons() {
    const valueStr = document.getElementById('orderTinhTrangFilter')?.value || '';
    const activeValues = valueStr.split(',').map(s => s.trim()).filter(Boolean);
    document.querySelectorAll('[data-status-filter]').forEach(button => {
        button.classList.toggle('active', activeValues.includes(button.dataset.statusFilter));
    });
}

function toggleStatusFilter(value) {
    const input = document.getElementById('orderTinhTrangFilter');
    if (!input) return;
    let activeValues = (input.value || '').split(',').map(s => s.trim()).filter(Boolean);
    if (activeValues.includes(value)) {
        activeValues = activeValues.filter(v => v !== value);
    } else {
        activeValues.push(value);
    }
    input.value = activeValues.join(',');
    syncOrderStatusFilterButtons();
    filterTable();
}

function updateDonHangSummary() {
    const receivedTotal = filteredData.reduce((sum, row) => sum + parseMoney(row[DON_HANG_INDEX.doanh_thu]), 0);
    const profitTotal = filteredData.reduce((sum, row) => sum + parseMoney(row[DON_HANG_INDEX.loi_nhuan]), 0);
    const receivedEl = document.getElementById('orderReceivedTotal');
    const profitEl = document.getElementById('orderProfitTotal');
    if (receivedEl) receivedEl.innerText = formatDisplayNumber(receivedTotal);
    if (profitEl) profitEl.innerText = formatDisplayNumber(profitTotal);
}

async function handleFileUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    await processFiles(files);
    event.target.value = '';
}

function readExcelRows(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array', nodim: true });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                expandWorksheetRef(worksheet);
                let rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (rows[0] && rows[0][0] && String(rows[0][0]).toUpperCase().includes("ID")) {
                    rows = rows.slice(1);
                }
                resolve(rows);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name}`));
        reader.readAsArrayBuffer(file);
    });
}

function getHeaderMappedCell(source, header) {
    const aliases = {
        id: ['id'],
        ngay: ['ngay', 'ngày'],
        truong: ['truong', 'trường'],
        gian: ['gian', 'gian_hang', 'gian hàng'],
        id_sp: ['id_sp', 'id sp', 'mã sp', 'ma sp'],
        slg: ['slg', 'số lượng', 'so luong'],
        ton_dau: ['ton_dau', 'tồn đầu', 'ton dau']
    };
    const keys = aliases[header] || [header];
    for (const key of keys) {
        const value = source[normalizeExcelHeader(key)];
        if (value !== undefined) return value;
    }
    return '';
}

function buildHeaderMappedRows(rows, tabName = currentTab) {
    const headers = getStorageHeaders(tabName);
    const priceCols = CONFIG.tabs[tabName]?.priceCols || [];
    return rows.map(source => headers.map((header, index) => {
        const rawValue = getHeaderMappedCell(source, header);
        if (header === 'ngay') return getDateOnly(formatExcelDateTime(rawValue));
        if (priceCols.includes(index)) return parseMoney(rawValue);
        return String(rawValue ?? '').trim();
    })).filter(row => row.some((cell, index) => index !== 0 && String(cell || '').trim()));
}

function readHeaderMappedExcelRows(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array', nodim: true });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                expandWorksheetRef(worksheet);
                const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                const headers = (matrix[0] || []).map(normalizeExcelHeader);
                const rows = matrix.slice(1).map(values => {
                    const row = {};
                    headers.forEach((header, index) => {
                        if (!(header in row)) row[header] = values[index] ?? '';
                    });
                    return row;
                });
                resolve(buildHeaderMappedRows(rows));
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name}`));
        reader.readAsArrayBuffer(file);
    });
}

function expandWorksheetRef(worksheet) {
    if (!worksheet) return;
    const cells = Object.keys(worksheet).filter(key => /^[A-Z]+[0-9]+$/i.test(key));
    if (!cells.length) return;
    const range = cells.reduce((acc, cell) => {
        const decoded = XLSX.utils.decode_cell(cell);
        acc.s.r = Math.min(acc.s.r, decoded.r);
        acc.s.c = Math.min(acc.s.c, decoded.c);
        acc.e.r = Math.max(acc.e.r, decoded.r);
        acc.e.c = Math.max(acc.e.c, decoded.c);
        return acc;
    }, { s: { r: Infinity, c: Infinity }, e: { r: -1, c: -1 } });
    worksheet['!ref'] = XLSX.utils.encode_range(range);
}

function normalizeExcelHeader(value) {
    return String(value ?? '').replace(/^\uFEFF/, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi');
}

function getExcelCell(row, header) {
    return row[normalizeExcelHeader(header)] ?? '';
}

function formatExcelDateTime(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return XLSX.SSF.format('dd/mm/yyyy hh:mm', value);
    }
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    const match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (match) {
        const [, day, month, year, hour = '00', minute = '00'] = match;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year} ${hour.padStart(2, '0')}:${minute}`;
    }
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatDateDdMmYyyy(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)) {
        const [day, month, year] = raw.split('/');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function toDateInputValue(value) {
    const raw = String(value || '').trim();
    const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    return '';
}

function parseHoaDonDate(value) {
    const raw = String(value || '').trim();
    const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();
    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])).getTime();
    return 0;
}

function parseDdMmYyyyDate(value) {
    const raw = String(value || '').trim();
    const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return 0;
    return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();
}

function getDateOnly(dateTime) {
    return String(dateTime || '').slice(0, 10);
}

function parseDonHangDateTime(value) {
    const raw = String(value || '').trim();
    const match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
    if (!match) return 0;
    const [, day, month, year, hour = '0', minute = '0'] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
}

function normalizeOrderStatus(orderStatus, returnStatus) {
    const value = `${orderStatus || ''} ${returnStatus || ''}`.toLocaleUpperCase('vi');
    if (value.includes('HỦY') || value.includes('HUỶ')) return 'HỦY';
    if (value.includes('TRẢ') || value.includes('HOÀN TIỀN')) return 'HOÀN TRẢ';
    return 'HOÀN THÀNH';
}

function buildDonHangRows(rows, priceMap) {
    const selectedStore = String(document.getElementById('storeFilter')?.value || '').trim();
    if (!selectedStore) throw new Error('Vui lòng chọn gian hàng trước khi thêm Excel.');

    const mappedRows = rows.map(source => {
        const row = Array(DON_HANG_HEADERS.length).fill('');
        const sku = String(getExcelCell(source, 'SKU phân loại hàng') || '').trim();
        const status = normalizeOrderStatus(
            getExcelCell(source, 'Trạng Thái Đơn Hàng'),
            getExcelCell(source, 'Trạng thái Trả hàng/Hoàn tiền')
        );
        row[DON_HANG_INDEX.gian_hang] = selectedStore;
        row[DON_HANG_INDEX.ngay_h] = formatExcelDateTime(getExcelCell(source, 'Ngày đặt hàng'));
        row[DON_HANG_INDEX.ngay] = getDateOnly(row[DON_HANG_INDEX.ngay_h]);
        row[DON_HANG_INDEX.mdh] = String(getExcelCell(source, 'Mã đơn hàng') || '').trim();
        row[DON_HANG_INDEX.mvd] = String(getExcelCell(source, 'Mã vận đơn') || '').trim();
        row[DON_HANG_INDEX.tong_tien] = parseMoney(getExcelCell(source, 'Tổng số tiền Người mua thanh toán'));
        row[DON_HANG_INDEX['Mã giảm giá']] = parseMoney(getExcelCell(source, 'Mã giảm giá') || getExcelCell(source, 'Mã giảm giá của Shop'));
        row[DON_HANG_INDEX['Phí cố định']] = parseMoney(getExcelCell(source, 'Phí cố định'));
        row[DON_HANG_INDEX['Phí Dịch Vụ']] = parseMoney(getExcelCell(source, 'Phí Dịch Vụ'));
        row[DON_HANG_INDEX['Phí xử lý giao dịch']] = parseMoney(getExcelCell(source, 'Phí xử lý giao dịch'));
        row[DON_HANG_INDEX['phí khác']] = '';
        row[DON_HANG_INDEX.tinh_trang] = status;
        row[DON_HANG_INDEX.trang_thai] = status === 'HỦY' ? 'HỦY' : 'HOÀN THÀNH';
        row[DON_HANG_INDEX['SKU phân loại hàng']] = sku;
        const idSp = sku.slice(0, 4);
        row[DON_HANG_INDEX.id_sp] = idSp;
        row[DON_HANG_INDEX.slg] = parseMoney(getExcelCell(source, 'Số lượng'));
        if (priceMap && priceMap.has(idSp)) {
            row[DON_HANG_INDEX.don_gia] = priceMap.get(idSp);
        }
        return row;
    }).filter(row => row[DON_HANG_INDEX.mdh]);

    return recalculateDonHangRows(mappedRows, { aggregateTongTien: true });
}

function readDonHangExcelRows(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array', nodim: true });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                expandWorksheetRef(worksheet);
                const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                const headers = (matrix[0] || []).map(normalizeExcelHeader);
                const requiredHeaders = ['Mã đơn hàng', 'SKU phân loại hàng'];
                const missingHeaders = requiredHeaders.filter(header => !headers.includes(normalizeExcelHeader(header)));
                if (missingHeaders.length) {
                    throw new Error(`File ${file.name} thiếu cột bắt buộc: ${missingHeaders.join(', ')}`);
                }
                const rows = matrix.slice(1).map(values => {
                    const row = {};
                    headers.forEach((header, index) => {
                        if (!(header in row)) row[header] = values[index] ?? '';
                    });
                    return row;
                });
                fetchDsSpGiaBanMap().then(priceMap => {
                    resolve(buildDonHangRows(rows, priceMap));
                }).catch(err => {
                    reject(err);
                });
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name}`));
        reader.readAsArrayBuffer(file);
    });
}

function buildDsSpRows(rows) {
    return rows.map(source => {
        const code = String(getExcelCell(source, 'Mã') || '').trim();
        return [
            code,
            code.slice(0, 4),
            String(getExcelCell(source, 'Tên') || '').trim(),
            parseMoney(getExcelCell(source, 'Giá nhập')),
            parseMoney(getExcelCell(source, 'Giá bán lẻ')),
            parseMoney(getExcelCell(source, 'Giá đón gói')),
            parseMoney(getExcelCell(source, 'Giá bán thấp nhất'))
        ];
    }).filter(row => row.some(cell => String(cell || '').trim()));
}

function readDsSpExcelRows(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array', nodim: true });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                expandWorksheetRef(worksheet);
                const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                const headers = (matrix[0] || []).map(normalizeExcelHeader);
                const requiredHeaders = ['Mã', 'Tên'];
                const missingHeaders = requiredHeaders.filter(header => !headers.includes(normalizeExcelHeader(header)));
                if (missingHeaders.length) {
                    throw new Error(`File ${file.name} thiếu cột bắt buộc: ${missingHeaders.join(', ')}`);
                }
                const rows = matrix.slice(1).map(values => {
                    const row = {};
                    headers.forEach((header, index) => {
                        if (!(header in row)) row[header] = values[index] ?? '';
                    });
                    return row;
                });
                resolve(buildDsSpRows(rows));
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name}`));
        reader.readAsArrayBuffer(file);
    });
}

function normalizeTextValue(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildReturnOrderRows(rows) {
    const selectedStore = String(document.getElementById('returnStoreSelect')?.value || '').trim();
    const selectedTinhTrang = String(document.getElementById('returnStatusSelect')?.value || '').trim();
    if (!selectedStore) throw new Error('Vui lòng chọn gian trước khi thêm Excel.');
    if (!selectedTinhTrang) throw new Error('Vui lòng chọn tình trạng trước khi thêm Excel.');

    const existingOrderIds = new Set(allData.map(row => String(row[3] || '').trim()).filter(Boolean));
    const seenOrderIds = new Set();
    const HEADERS = {
        orderId: 'Mã đơn hàng',
        waybill: 'Mã vận đơn',
        orderDate: 'Ngày đặt hàng',
        cancelReason: 'Lý do hủy',
        returnReason: 'Lí do Trả hàng/Hoàn tiền',
        claimId: 'Mã số khiếu nại',
        returnWaybill: 'Mã vận đơn trả hàng',
        returnRefundStatus: 'Trạng thái Trả hàng/Hoàn tiền',
        deliveryWaybill: 'Mã vận đơn giao hàng',
        refunded: 'Đã hoàn tiền cho Người mua',
        returning: 'Người mua đang trả hàng'
    };
    return rows.map(source => {
        const type = selectedTinhTrang.toLocaleUpperCase('vi');
        if (type === 'TRẢ') {
            const refundStatus = normalizeTextValue(getExcelCell(source, HEADERS.returnRefundStatus));
            if (refundStatus !== HEADERS.refunded && refundStatus !== HEADERS.returning) return null;
        }
        const orderId = String(getExcelCell(source, HEADERS.orderId) || '').trim();
        if (!orderId || existingOrderIds.has(orderId) || seenOrderIds.has(orderId)) return null;
        seenOrderIds.add(orderId);
        const reason = type === 'HỦY'
            ? String(getExcelCell(source, HEADERS.cancelReason) || '').trim()
            : type === 'TRẢ'
                ? String(getExcelCell(source, HEADERS.returnReason) || getExcelCell(source, HEADERS.cancelReason) || '').trim()
                : '';
        const claimId = type === 'TRẢ' ? String(getExcelCell(source, HEADERS.claimId) || '').trim() : '';
        const returnWaybill = type === 'TRẢ' ? String(getExcelCell(source, HEADERS.returnWaybill) || '').trim() : '';
        const waybill = type === 'TRẢ'
            ? String(getExcelCell(source, HEADERS.deliveryWaybill) || getExcelCell(source, HEADERS.waybill) || '').trim()
            : String(getExcelCell(source, HEADERS.waybill) || '').trim();
        const uploadDate = formatDateDdMmYyyy(toIsoDateInput(new Date()));
        return [
            selectedStore,
            selectedTinhTrang,
            getDateOnly(formatExcelDateTime(getExcelCell(source, HEADERS.orderDate))),
            orderId,
            waybill,
            reason,
            claimId,
            returnWaybill,
            '',
            '',
            uploadDate
        ];
    }).filter(Boolean);
}

function readReturnOrderExcelRows(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array', nodim: true });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                expandWorksheetRef(worksheet);
                const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
                const headers = (matrix[0] || []).map(normalizeExcelHeader);
                const rows = matrix.slice(1).map(values => {
                    const row = {};
                    headers.forEach((header, index) => {
                        if (!(header in row)) row[header] = values[index] ?? '';
                    });
                    return row;
                });
                resolve(buildReturnOrderRows(rows));
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error(`Không thể đọc file ${file.name}`));
        reader.readAsArrayBuffer(file);
    });
}

function truncateExcelNumericCellsInRow(row) {
    if (!Array.isArray(row)) return row;
    return row.map(cell => {
        if (typeof cell === 'number' && Number.isFinite(cell)) return Math.trunc(cell);
        return cell;
    });
}

async function processFiles(files) {
    const excelFiles = files.filter(f => /\.(xlsx|xls|csv)$/i.test(f.name));
    if (!excelFiles.length) {
        alert("Vui lòng tải lên file Excel hoặc CSV.");
        return;
    }

    const fileNames = excelFiles.map(f => f.name).join(", ");
    if ((currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET') && !String(document.getElementById('storeFilter')?.value || '').trim()) {
        alert('Vui lòng chọn gian hàng trước khi thêm Excel.');
        return;
    }
    if (currentTab === 'DH_HOAN' && (!String(document.getElementById('returnStoreSelect')?.value || '').trim() || !String(document.getElementById('returnStatusSelect')?.value || '').trim())) {
        alert('Vui lòng chọn gian và tình trạng trước khi thêm Excel.');
        return;
    }
    const confirmMessage = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
        ? `Dữ liệu từ ${excelFiles.length} file (${fileNames}) sẽ được đọc theo tên cột và cập nhật sheet '${currentTab}'. Tiếp tục?`
        : currentTab === 'DS_SP'
            ? `Dữ liệu từ ${excelFiles.length} file (${fileNames}) sẽ XÓA TOÀN BỘ dữ liệu cũ trong sheet '${currentTab}' rồi ghi dữ liệu mới. Tiếp tục?`
            : currentTab === 'DH_HOAN'
                ? `Dữ liệu từ ${excelFiles.length} file (${fileNames}) sẽ chỉ thêm Mã đơn hàng chưa tồn tại vào sheet '${currentTab}'. Tiếp tục?`
                : `Dữ liệu từ ${excelFiles.length} file (${fileNames}) sẽ cập nhật sheet '${currentTab}' theo id. Id đã có sẽ cập nhật, id mới sẽ thêm dòng. Tiếp tục?`;
    if (!confirm(confirmMessage)) return;

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang xử lý ${excelFiles.length} file và cập nhật Google Sheets...`;

    try {
        const reader = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
            ? readDonHangExcelRows
            : currentTab === 'DS_SP'
                ? readDsSpExcelRows
                : currentTab === 'DH_HOAN'
                    ? readReturnOrderExcelRows
                    : (currentTab === 'NHAP_XUAT' || currentTab === 'TON_KHO')
                        ? readHeaderMappedExcelRows
                        : readExcelRows;
        const rowsFromFiles = await Promise.all(excelFiles.map(reader));
        const allRowsToUpload = rowsFromFiles
            .flat()
            .filter(r => Array.isArray(r) && r.some(c => String(c || '').trim() !== ''))
            .map(truncateExcelNumericCellsInRow);

        if (!allRowsToUpload.length) {
            throw new Error("Không có dòng dữ liệu hợp lệ để tải lên.");
        }

        let result;
        if (currentTab === 'DS_SP') {
            await clearCurrentTabData();
            await appendRecordRows(allRowsToUpload);
            result = { updated: 0, inserted: allRowsToUpload.length, skipped: 0 };
        } else if (currentTab === 'DH_HOAN') {
            await appendRecordRows(allRowsToUpload);
            result = { updated: 0, inserted: allRowsToUpload.length, skipped: 0 };

            try {
                document.querySelector('#loading p').innerText = `Đang đồng bộ tình trạng về DON_HANG...`;
                const token = await getAccessToken();
                const dhRange = CONFIG.tabs['DON_HANG'].range;
                const req = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${dhRange}`, { headers: { Authorization: `Bearer ${token}` } });
                const dhData = await req.json();
                const dhRows = (dhData.values || []).map((r, i) => { const clone = [...r]; clone._sheetRow = i + 2; return clone; });

                const updates = [];
                allRowsToUpload.forEach(hoanRow => {
                    const mdh = String(hoanRow[3] || '').replace(/^'/, '').trim().toLocaleUpperCase('vi');
                    const newStatus = String(hoanRow[1] || '').trim().toLocaleUpperCase('vi');
                    if (!mdh || !newStatus) return;

                    const targets = dhRows.filter(r => String(r[DON_HANG_INDEX.mdh] || '').replace(/^'/, '').trim().toLocaleUpperCase('vi') === mdh && String(r[DON_HANG_INDEX.tinh_trang] || '').trim().toLocaleUpperCase('vi') !== newStatus);
                    if (targets.length) {
                        targets.forEach(r => r[DON_HANG_INDEX.tinh_trang] = newStatus);
                        recalculateDonHangRows(targets);
                        targets.forEach(r => updates.push({ row: r, sheetRow: r._sheetRow }));
                    }
                });

                if (updates.length > 0) {
                    const endCol = colName(CONFIG.tabs['DON_HANG'].headers.length - 1);
                    const batchData = updates.map(item => ({
                        range: `DON_HANG!A${item.sheetRow}:${endCol}${item.sheetRow}`,
                        values: [CONFIG.tabs['DON_HANG'].headers.map((_, idx) => String(item.row[idx] ?? '').trim())]
                    }));
                    const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values:batchUpdate`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ valueInputOption: 'RAW', data: batchData })
                    });
                    if (!batchRes.ok) {
                        console.error("Lỗi đồng bộ DON_HANG:", await batchRes.text());
                    } else {
                        rangeDataCache[dhRange] = dhRows.map(r => {
                            const arr = [...r];
                            delete arr._sheetRow;
                            return arr;
                        });
                        delete allDataCache['DON_HANG'];
                        delete allDataCache['DON_HANG_CHI_TIET'];
                    }
                }
            } catch (err) {
                console.error("Lỗi khi đồng bộ về DON_HANG:", err);
            }

        } else {
            result = await upsertRecordRows(allRowsToUpload);
        }
        alert((currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
            ? `Đã thêm mới ${result.inserted} đơn hàng vào sheet '${currentTab}'. Bỏ qua ${result.skipped} dòng có mã đơn hàng trùng.`
            : currentTab === 'DS_SP'
                ? `Đã xóa dữ liệu cũ và ghi mới ${result.inserted} dòng vào sheet '${currentTab}'.`
                : currentTab === 'DH_HOAN'
                    ? `Đã thêm mới ${result.inserted} dòng đơn trả vào sheet '${currentTab}'.`
                    : `Đã cập nhật ${result.updated} dòng và thêm mới ${result.inserted} dòng vào sheet '${currentTab}'.`);
        try { sessionStorage.setItem(XNK_TT_TAB_STORAGE_KEY, currentTab); } catch (_) { }
        await fetchData();
        filterTable();
    } catch (err) {
        console.error(err);
        alert("Lỗi khi tải dữ liệu: " + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function init() {
    lucide.createIcons();
    document.getElementById('pageTitle').innerText = 'Hệ thống';
    initDragAndDrop();
    let saved = '';
    try { saved = sessionStorage.getItem(XNK_TT_TAB_STORAGE_KEY) || ''; } catch (_) { }
    await switchTab(CONFIG.tabs[saved] ? saved : 'THONG_TIN');
}

init();

