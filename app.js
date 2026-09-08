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
    googleCx: '',
    tabs: {
        'DS_SP': {
            range: 'DS_SP!A2:K',
            headers: ['id_sp_con', 'id_sp', 'ten_sp', 'gia_nhap_ncc', 'gia_ban', 'gia_dong_goi', 'gia_thap_nhat', 'id_sp_gian', 'udt', 'tinh_trang', 'anh'],
            priceCols: [3, 4, 5, 6],
            imgCol: 10
        },
        'TINH_GIA': {
            range: 'TINH_GIA!A2:V',
            headers: ['id_sp_con', 'id_sp', 'ten_sp', 'gia_nhap', 'gia_ban', 'gia_đong_goi', 'gia_thap_nhat', 'loi_nhuan%', 'lai_mong_muon', 'gia_đăng', 'phi_ads_%', 'phi_aff_%', '11%_phi_co_dinh', 'phi_co_dinh', '6%_phi_giao_dich', 'phi_giao_dich', '5.5% xtra', 'xtra', '1,5%_thue', 'thue', 'phi_ha_tang3.000_₫', 'phi_piship'],
            displayHeaders: ['id_sp_con', 'id_sp', 'ten_sp', 'gia_ban', 'gia_thap_nhat', 'loi_nhuan%', 'lai_mong_muon', 'gia_đăng', 'phi_ads_%', 'phi_aff_%', '11%_phi_co_dinh', 'phi_co_dinh', '6%_phi_giao_dich', 'phi_giao_dich', '5.5% xtra', 'xtra', '1,5%_thue', 'thue', 'phi_ha_tang3.000_₫', 'phi_piship'],
            priceCols: [3, 4, 5, 6, 8, 9, 13, 15, 17, 19, 20, 21]
        },
        'SP_BO': {
            range: 'SP_BO!A2:C',
            headers: ['id_sp_con', 'id_sp', 'ten_sp'],
            displayHeaders: ['id_sp_con', 'id_sp', 'ten_sp']
        },
        'SP_GIAM_GIA': {
            range: 'SP_GIAM_GIA!A2:I',
            headers: ['Mã sản phẩm', 'Tên Sản phẩm', 'Số SKU Sản phẩm', 'Mã phân loại hàng', 'Tên phân loại hàng', 'Số SKU Phân loại hàng', 'Giá gốc', 'Giá đã giảm', 'gian'],
            priceCols: [6, 7]
        },
        'WEB_SP': {
            range: 'WEB_SP!A2:O',
            headers: ['id', 'gian', 'sku', 'phan_loai', 'ten_sp', 'nganh_hang', 'mo_ta', 'anh', 'anh_mota', 'anh_phan_loai', 'link_video', 'gia', 'gia_khuyen_mai', 'id_shopee', 'link_shopee'],
            displayHeaders: ['id', 'gian', 'sku', 'phan_loai', 'ten_sp', 'nganh_hang', 'mo_ta', 'anh', 'anh_mota', 'anh_phan_loai', 'link_video', 'gia', 'gia_khuyen_mai', 'id_shopee', 'link_shopee'],
            priceCols: [11, 12],
            imgCol: 7
        },
        'DH': {
            range: 'DH!A2:Y',
            headers: ['gian', 'ngay', 'ngay_gio', 'mdh', 'mvd', 'tong_tien', 'ma_giam_gia', 'phi_vc', 'phu_phi', 'thue', 'doanh_thu', 'phi_khac', 'tien_sp', 'loi_nhuan', 'tinh_trang', 'trang_thai', 'sku', 'id_sp', 'slg', 'don_gia', 'thanh_tien', 'ten_khach', 'ng_nhan', 'dia_chi', 'link_don'],
            displayHeaders: ['gian', 'ngay', 'ngay_gio', 'mdh', 'mvd', 'tong_tien', 'ma_giam_gia', 'phi_vc', 'phu_phi', 'thue', 'doanh_thu', 'phi_khac', 'tien_sp', 'loi_nhuan', 'tinh_trang', 'trang_thai', 'ten_khach', 'ng_nhan', 'dia_chi', 'link_don'],
            priceCols: [5, 6, 7, 8, 9, 10, 11, 12, 13, 19, 20]
        }
    }
};

const DON_HANG_INDEX = {};
const DON_HANG_NUMERIC_HEADERS = new Set();
const DON_HANG_HEADERS = [];
const XNK_TT_TAB_STORAGE_KEY = 'xnkTtActiveTab';

// Stubs for removed DON_HANG module functions
function recalculateDonHangRows(rows) { return rows; }
function updateDonHangSummary() {}
function openDonHangDetail() {}
function getMatchedReturnStatusForOrder() { return ''; }
function getMvdDifferentStoreReturnStatusForOrder() { return ''; }
function getDonHangItemCount() { return 0; }
function getDonHangSummaryRows() { return allData; }
function parseDonHangDateTime() { return 0; }
async function fetchThongTinStoreNames() {}

let currentTab = '', allData = [], accessToken = null, tokenExpiry = 0;
let currentPage = 1, rowsPerPage = 150, filteredData = [];
let currentSortCol = null, currentSortDir = null;
let sheetTitleToIdCache = null;
let thongTinStoreNames = [];
let editingDonHangRows = [];
let dsSpNameMapCache = null;
let selectedOrderIds = new Set();
let selectedProductIds = new Set();
let selectedDhGianSet = new Set();
let selectedDhTinhTrangSet = new Set();
let selectedDhTrangThaiSet = new Set();
let spBoSetCache = null;
let orderCostDetailsExpanded = false;
let dsSpOptionsCache = null;
let rangeDataCache = {};
let allDataCache = {};
const TAB_LABELS = {
    'DH': 'Đơn Hàng DH',
    HOA_DON: 'HÓA ĐƠN',
    DS_SP: 'DS SP',
    TINH_GIA: 'TÍNH GIÁ',
    SP_GIAM_GIA: 'SP GIẢM GIÁ',
    NHAP_XUAT: 'NHẬP XUẤT',
    TON_KHO: 'TỒN KHO',
    WEB_SP: 'WEB SP'
};

const ID_PREFIXES = {

    HOA_DON: 'HD',
    NHAP_XUAT: 'NX',
    TON_KHO: 'TK'
};

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

async function switchTab(tabName, force = false) {
    const targetTab = CONFIG.tabs[tabName] ? tabName : 'DS_SP';
    if (targetTab === currentTab && !force && allData && allData.length > 0) return;
    currentSortCol = null;
    currentSortDir = null;
    const previousTab = currentTab;
    currentTab = targetTab;
    try { localStorage.setItem(XNK_TT_TAB_STORAGE_KEY, currentTab); } catch (_) { /* ignore */ }
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === currentTab);
    });
    
    // Check if we can reuse data
    const prevRange = CONFIG.tabs[previousTab]?.range;
    const currRange = CONFIG.tabs[currentTab]?.range;
    const canReuse = !force && prevRange && currRange && prevRange === currRange &&
                     allData && allData.length > 0;

    document.getElementById('tableWrapper').style.display = 'block';
    document.getElementById('headerActions').style.display = 'flex';
    document.getElementById('pageTitle').innerText = 'Hệ thống';
    const uploadBtn = document.getElementById('uploadBtn');
    const addBtn = document.getElementById('addBtn');
    const truongFilter = document.getElementById('truongFilter');
    const storeFilter = document.getElementById('storeFilter');
    if (uploadBtn) {
        uploadBtn.innerHTML = `<i data-lucide="upload" style="width:18px;"></i> Tải ${currentTab} Lên`;
        uploadBtn.style.display = (currentTab === 'DH') ? 'none' : 'flex';
        lucide.createIcons();
    }
    if (addBtn) addBtn.style.display = (currentTab === 'DH') ? 'none' : 'flex';
    if (truongFilter) {
        truongFilter.style.display = 'none';
        lucide.createIcons();
    }
    if (storeFilter) {
        storeFilter.style.display = (currentTab === 'WEB_SP' || currentTab === 'SP_GIAM_GIA') ? 'flex' : 'none';
    }
    const updateGiaDangMinBtn = document.getElementById('updateGiaDangMinBtn');
    if (updateGiaDangMinBtn) {
        updateGiaDangMinBtn.style.display = (currentTab === 'TINH_GIA') ? 'inline-flex' : 'none';
    }
    const quickCustomBox = document.getElementById('quickCustomButtonsBox');
    if (quickCustomBox) {
        quickCustomBox.style.display = (currentTab === 'TINH_GIA') ? 'inline-flex' : 'none';
    }
    const customCopyBar = document.getElementById('customCopyButtonsBar');
    if (customCopyBar) {
        customCopyBar.style.display = (currentTab === 'TINH_GIA') ? 'flex' : 'none';
        if (currentTab === 'TINH_GIA') renderCustomButtonsManager();
    }
    const dsSpFilters = document.getElementById('dsSpFilters');
    if (dsSpFilters) {
        dsSpFilters.style.display = (currentTab === 'DS_SP' || currentTab === 'TINH_GIA' || currentTab === 'WEB_SP') ? 'flex' : 'none';
    }
    const dhFilterBar = document.getElementById('dhFilterBar');
    if (dhFilterBar) {
        dhFilterBar.style.display = (currentTab === 'DH') ? 'flex' : 'none';
    }
    const dhSummaryStatsBar = document.getElementById('dhSummaryStatsBar');
    if (dhSummaryStatsBar) {
        dhSummaryStatsBar.style.display = (currentTab === 'DH') ? 'grid' : 'none';
    }
    document.getElementById('searchInput').value = '';
    selectedOrderIds.clear();
    selectedProductIds.clear();
    if (typeof updateProductBatchControls === 'function') updateProductBatchControls();
    resetFilters();
    currentPage = 1;
    
    if (canReuse) {
        if (currentTab === 'DS_SP' || currentTab === 'TINH_GIA' || currentTab === 'WEB_SP') {
            generateDsSpPrefix1Buttons();
        }
        populateFilters();
        renderHeaders();
        filterTable();
    } else if (!force && allDataCache[currentTab] && allDataCache[currentTab].length > 0) {
        allData = allDataCache[currentTab];
        if (currentTab === 'DS_SP' || currentTab === 'TINH_GIA') {
            spBoSetCache = null;
            await fetchSpBoSet();
            if (currentTab === 'TINH_GIA') {
                await fetchSpShopeeData();
            }
        }
        if (currentTab === 'DS_SP' || currentTab === 'TINH_GIA' || currentTab === 'WEB_SP') {
            generateDsSpPrefix1Buttons();
        }
        populateFilters();
        renderHeaders();
        filterTable();
    } else {
        await fetchData();
        if (currentTab === 'TINH_GIA') {
            await fetchSpShopeeData();
        }
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
    const range = CONFIG.tabs[currentTab]?.range;
    if (range) delete rangeDataCache[range];
    delete allDataCache[currentTab];
    await fetchData();
    if (currentTab === 'TINH_GIA') {
        await fetchSpShopeeData(true);
        await recalculateVisibleTinhGiaRows();
    }
    filterTable();
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

let spShopeeDataCache = null;
let spShopeeGianMapCache = null;
let isFetchingSpShopee = false;

async function fetchSpShopeeData(force = false) {
    if (spShopeeDataCache && spShopeeDataCache.length > 0 && !force) return spShopeeDataCache;
    if (isFetchingSpShopee) return [];
    isFetchingSpShopee = true;
    try {
        const token = await getAccessToken();
        let targetSheetTitle = null;
        const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}?fields=sheets(properties(title))`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (metaRes.ok) {
            const metaData = await metaRes.json();
            const titles = (metaData.sheets || []).map(s => s.properties?.title).filter(Boolean);
            targetSheetTitle = titles.find(t => t.toLowerCase().includes('sp_shopee') || t.toLowerCase().includes('shopee'));
            if (!targetSheetTitle) {
                targetSheetTitle = titles.find(t => t.toLowerCase().includes('web_sp') || t.toLowerCase().includes('ds_sp'));
            }
        }
        if (!targetSheetTitle) targetSheetTitle = 'sp_shopee';

        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${encodeURIComponent(targetSheetTitle + '!A2:Z')}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            spShopeeDataCache = data.values || [];
            spShopeeGianMapCache = null;
            if (currentTab === 'TINH_GIA') {
                renderTable();
            }
        } else {
            spShopeeDataCache = [];
            spShopeeGianMapCache = null;
        }
    } catch (err) {
        console.warn('Lỗi khi tải sp_shopee:', err);
        spShopeeDataCache = [];
        spShopeeGianMapCache = null;
    } finally {
        isFetchingSpShopee = false;
    }
    return spShopeeDataCache;
}

function buildSpShopeeGianMap() {
    if (!spShopeeDataCache || !spShopeeDataCache.length) return new Map();
    const map = new Map();

    spShopeeDataCache.forEach(r => {
        if (!Array.isArray(r) || !r.length) return;

        let gianVal = String(r[11] || '').trim().toUpperCase();
        if (!gianVal) {
            const btnList = typeof getSavedCustomButtons === 'function' ? getSavedCustomButtons() : [];
            for (const bText of btnList) {
                const normB = bText.trim().toUpperCase();
                if (r.some(cell => String(cell || '').trim().toUpperCase() === normB)) {
                    gianVal = normB;
                    break;
                }
            }
        }

        if (!gianVal) return;

        if (!map.has(gianVal)) {
            map.set(gianVal, new Set());
        }
        const set = map.get(gianVal);

        r.forEach(cell => {
            const str = String(cell || '').trim().toUpperCase();
            if (!str || str.length < 2) return;

            if (str.length <= 35) set.add(str);
            if (str.length >= 4) {
                set.add(str.substring(0, 4));
            }

            const parts = str.split(/[\s\-_\/,\.]+/);
            parts.forEach(p => {
                if (p.length >= 3 && p.length <= 15) {
                    set.add(p);
                    if (p.length >= 4) set.add(p.substring(0, 4));
                }
            });
        });
    });

    return map;
}

function isBtnInSpShopee(btnText, row) {
    if (!spShopeeDataCache || !spShopeeDataCache.length) {
        fetchSpShopeeData();
        return false;
    }
    const normBtn = String(btnText || '').trim().toUpperCase();
    if (!normBtn) return false;

    const valF = String(row[1] || row[5] || '').trim().toUpperCase();
    const valE = String(row[0] || row[4] || '').trim().toUpperCase();
    const rawIdSp = valF ? valF : valE;
    if (!rawIdSp) return false;

    const prefixF4 = valF.substring(0, 4);
    const prefixE4 = valE.substring(0, 4);

    if (!spShopeeGianMapCache) {
        spShopeeGianMapCache = buildSpShopeeGianMap();
    }

    for (const [gianKey, idSet] of spShopeeGianMapCache.entries()) {
        if (gianKey === normBtn || gianKey.includes(normBtn) || normBtn.includes(gianKey)) {
            if (idSet.has(prefixF4) || idSet.has(prefixE4) || idSet.has(valF) || idSet.has(valE) || idSet.has(rawIdSp)) {
                return true;
            }
        }
    }

    return false;
}

async function fetchSheetDataWithFallback(tabName) {
    const tabConfig = CONFIG.tabs[tabName];
    if (!tabConfig) throw new Error("Không tìm thấy cấu hình tab '" + tabName + "'");
    const cacheKey = 'sheet_cache_' + tabName;
    const url = "https://sheets.googleapis.com/v4/spreadsheets/" + CONFIG.spreadsheetId + "/values/" + encodeURIComponent(tabConfig.range);
    
    let token = await getAccessToken();
    let res = null;
    let data = null;
    let retries = 0;
    const maxRetries = 5;
    
    while (retries < maxRetries) {
        try {
            res = await fetch(url, { headers: { Authorization: "Bearer " + token } });
            data = await res.json();
            if (res.status === 429 || (data.error && (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED'))) {
                retries++;
                const waitSec = retries * 3;
                console.warn(`[HTTP 429] Quota Google API hết lượt cho '${tabName}'. Đang tự động thử lại (${retries}/${maxRetries}) sau ${waitSec}s...`);
                
                const loadingP = document.querySelector('#loading p');
                if (loadingP) {
                    loadingP.innerText = `⏳ Google API đang bận (HTTP 429 Limit Exceeded).\nTự động thử lại (${retries}/${maxRetries}) sau ${waitSec} giây...`;
                }
                
                // If LocalStorage cache is available, return it immediately on 429
                try {
                    const cachedStr = localStorage.getItem(cacheKey);
                    if (cachedStr) {
                        const cached = JSON.parse(cachedStr);
                        if (cached && Array.isArray(cached.values) && cached.values.length > 0) {
                            console.warn(`[CACHE 429 Fallback] Dùng dữ liệu bộ nhớ đệm LocalStorage cho '${tabName}' (${cached.values.length} dòng).`);
                            return cached.values;
                        }
                    }
                } catch (_) {}

                await new Promise(r => setTimeout(r, waitSec * 1000));
                continue;
            }
            if (res.ok && data) {
                const valuesArr = Array.isArray(data.values) ? data.values : [];
                try {
                    localStorage.setItem(cacheKey, JSON.stringify({
                        timestamp: Date.now(),
                        values: valuesArr
                    }));
                } catch (_) { /* ignore quota full */ }
                return valuesArr;
            }
            break;
        } catch (err) {
            retries++;
            if (retries >= maxRetries) break;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    
    // LocalStorage fallback if API fails or rate-limited
    try {
        const cachedStr = localStorage.getItem(cacheKey);
        if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            if (cached && Array.isArray(cached.values) && cached.values.length > 0) {
                console.warn("[CACHE] Dùng dữ liệu bộ nhớ đệm LocalStorage cho '" + tabName + "' (" + cached.values.length + " dòng).");
                return cached.values;
            }
        }
    } catch (_) {}

    if (data && data.error) {
        if (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED') {
            throw new Error("Google Sheets API đang bị quá tải lượt truy cập (HTTP 429 Rate Limit Exceeded). Vui lòng đợi 30-60 giây và tải lại trang!");
        }
        throw new Error(data.error.message || ("Lỗi Google API (" + (data.error.code || res?.status || 'Unknown') + ")"));
    }
    throw new Error("Không thể kết nối đến Google Sheets cho '" + tabName + "'.");
}

async function fetchData() {
    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang tải dữ liệu ${currentTab}...`;
    try {
        if (currentTab === 'SP_GIAM_GIA') {
            await ensureSpGiamGiaSheetExists();
        }
        if (currentTab === 'DH') {
            await ensureDhSheetExists();
        }
        
        const rawRows = await fetchSheetDataWithFallback(currentTab);
        const tabConfig = CONFIG.tabs[currentTab];
        rangeDataCache[tabConfig.range] = rawRows;
        
        allData = rawRows.map((row, i) => {
            const arr = Array.isArray(row) ? row.slice() : [];
            arr._sheetRow = i + 2;
            return arr;
        });

        if (currentTab === 'DS_SP' || currentTab === 'TINH_GIA') {
            try { await fetchSpBoSet(true); } catch (_) {}
        }

        if (currentTab === 'DS_SP' || currentTab === 'TINH_GIA' || currentTab === 'WEB_SP') { generateDsSpPrefix1Buttons(); }
        filteredData = [...allData];
        if (currentTab === 'NHAP_XUAT') {
            filteredData.sort((a, b) => parseDdMmYyyyDate(b[1]) - parseDdMmYyyyDate(a[1]));
        }
        if (currentTab === 'DS_SP' || currentTab === 'SP_GIAM_GIA') {
            filteredData.sort((a, b) => String(b[0] || '').localeCompare(String(a[0] || '')));
        }
        if (currentTab === 'TINH_GIA') {
            filteredData.sort((a, b) => String(b[1] || '').localeCompare(String(a[1] || '')));
        }
        if (currentTab === 'WEB_SP') {
            filteredData.sort((a, b) => String(b[2] || '').localeCompare(String(a[2] || ''), 'vi', { numeric: true, sensitivity: 'base' }));
        }
        populateFilters();
        renderHeaders();
        filterTable();
        allDataCache[currentTab] = allData;
    } catch (e) {
        console.error("Lỗi khi tải dữ liệu:", e);
        alert("Không thể tải dữ liệu: " + (e.message || e));
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}
function renderHeaders() {
    const head = document.getElementById('tableHead');
    const selectHeader = (currentTab === 'TINH_GIA' || currentTab === 'DS_SP')
        ? `<th class="select-col"><input type="checkbox" id="selectAllProductsCb" onchange="toggleAllVisibleProducts(this.checked)" title="Chọn tất cả sản phẩm đang lọc"></th>`
        : '';
    head.innerHTML = `<tr>${selectHeader}${getDisplayHeaders().map(h => {
        const isSorted = currentSortCol === h;
        const sortIndicator = isSorted
            ? (currentSortDir === 'desc' ? ' <span class="sort-arrow desc">▼</span>' : (currentSortDir === 'asc' ? ' <span class="sort-arrow asc">▲</span>' : ' <span class="sort-arrow default">↕</span>'))
            : ' <span class="sort-arrow default">↕</span>';
        const activeClass = isSorted ? ' sort-active' : '';
        const isSku = (h === 'sku' || h === 'id_sp_con' || h === 'id_sp');
        const isTenSp = (h === 'ten_sp' || h === 'ten_san_pham');
        const isMoTa = (h === 'mo_ta' || h === 'noi_dung');
        const colClass = isSku ? ' col-sku' : (isTenSp ? ' col-ten-sp' : (isMoTa ? ' col-mo-ta' : ''));
        const isNum = isNumericDisplayHeader(h);
        const textAlignStyle = isNum ? ' style="text-align: right;"' : '';
        return `<th data-col="${escapeHtml(h)}" class="sortable-header${activeClass}${colClass}"${textAlignStyle} onclick="handleHeaderSort('${escapeHtml(escapeJsString(h))}')" title="Bấm để sắp xếp">${escapeHtml(h.toUpperCase())}${sortIndicator}</th>`;
    }).join('')}</tr>`;
}

function handleHeaderSort(headerName) {
    if (currentSortCol !== headerName) {
        currentSortCol = headerName;
        currentSortDir = 'desc';
    } else {
        if (currentSortDir === 'desc') {
            currentSortDir = 'asc';
        } else if (currentSortDir === 'asc') {
            currentSortCol = null;
            currentSortDir = null;
        } else {
            currentSortDir = 'desc';
        }
    }
    renderHeaders();
    filterTable();
}

function getRowSortValue(row, headerName, storageHeaders, tabName) {
    if (!row) return '';
    const idx = storageHeaders.indexOf(headerName);
    const rawVal = (idx >= 0 ? row[idx] : row[headerName]) ?? '';
    
    if (headerName === 'ngay_h') return rawVal;
    if (headerName === 'ngay') {
        if (tabName === 'HOA_DON') return parseHoaDonDate(rawVal);
        if (tabName === 'NHAP_XUAT') return parseDdMmYyyyDate(rawVal);
        const time = new Date(String(rawVal).trim()).getTime();
        return Number.isNaN(time) ? 0 : time;
    }
    if (headerName === 'ngay_tai_len') return parseDdMmYyyyDate(rawVal);
    
    const isNumCol = isNumericDisplayHeader(headerName, tabName) || 
                     String(headerName).includes('%') || 
                     String(headerName).includes('gia_') || 
                     ['loi_nhuan%', 'lai_mong_muon', 'slg', 'don_gia', 'thanh_tien', 'ton_dau', 'nhap', 'xuat', 'ton', 'doanh_thu', 'tien_sp'].includes(headerName);
                     
    if (isNumCol) {
        return parseMoney(rawVal);
    }
    
    return String(rawVal || '').trim();
}

function applyHeaderSort() {
    if (!currentSortCol || !currentSortDir) return;
    const storageHeaders = getStorageHeaders(currentTab);
    
    filteredData.sort((rowA, rowB) => {
        const valA = getRowSortValue(rowA, currentSortCol, storageHeaders, currentTab);
        const valB = getRowSortValue(rowB, currentSortCol, storageHeaders, currentTab);
        
        let result = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
            result = valA - valB;
        } else {
            const strA = String(valA ?? '');
            const strB = String(valB ?? '');
            result = strA.localeCompare(strB, 'vi', { numeric: true, sensitivity: 'base' });
        }
        
        return currentSortDir === 'desc' ? -result : result;
    });
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
    return tabConfig.displayHeaders || tabConfig.headers;
}

function isNumericDisplayHeader(header, tabName = currentTab) {
    if (tabName === 'TON_KHO' && ['ton_dau', 'nhap', 'xuat', 'ton'].includes(header)) return true;
    const storageIndex = getStorageHeaders(tabName).indexOf(header);
    return storageIndex >= 0 && (CONFIG.tabs[tabName]?.priceCols || []).includes(storageIndex);
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

function populateFilters() {
    const truongValues = allData.map(row => String(row[1] || '').trim()).filter(Boolean);
    setDatalistOptions('truongOptions', truongValues);
    if (currentTab === 'WEB_SP') {
        const gianValues = allData.map(row => String(row[1] || '').trim()).filter(Boolean);
        setStoreFilterOptions(gianValues);
    } else if (currentTab === 'SP_GIAM_GIA') {
        const gianValues = allData.map(row => String(row[8] || '').trim()).filter(Boolean);
        setStoreFilterOptions(gianValues);
    } else if (currentTab === 'DON_HANG') {
        setStoreFilterOptions([...thongTinStoreNames, ...allData.map(row => String(row[DON_HANG_INDEX.gian_hang] || '').trim())]);
    } else {
        setStoreFilterOptions(thongTinStoreNames);
    }
    if (currentTab === 'HOA_DON') {
        setDatalistOptions('nccOptions', allData.map(row => String(row[2] || '').trim()).filter(Boolean));
    }
}

function resetFilters() {
    ['truongFilter', 'storeFilter', 'orderDateFrom', 'orderDateTo', 'orderMdhFilter', 'orderMvdFilter', 'orderTinhTrangFilter', 'orderTrangThaiFilter', 'orderProfitFilter'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    if (typeof selectedDhGianSet !== 'undefined') selectedDhGianSet.clear();
    if (typeof selectedDhTinhTrangSet !== 'undefined') selectedDhTinhTrangSet.clear();
    if (typeof selectedDhTrangThaiSet !== 'undefined') selectedDhTrangThaiSet.clear();
    if (typeof syncOrderStatusFilterButtons === 'function') syncOrderStatusFilterButtons();
    currentDsSpPrefix1Filter = '';
    currentDsSpPrefix2Filter = '';
    document.querySelectorAll('#dsSpPrefix1Buttons button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.prefix === '');
    });
    document.querySelectorAll('#dsSpPrefix2Buttons button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.prefix === '');
    });
}

function getDataSheetRow(row) {
    if (row && typeof row._sheetRow === 'number' && row._sheetRow >= 2) return row._sheetRow;
    const idx = allData.indexOf(row);
    return idx >= 0 ? idx + 2 : 0;
}

async function writeRecordRow(row, sheetRow, startColIndex = 0) {
    const token = await getAccessToken();
    const cleanRow = normalizeRow(row).slice(startColIndex);
    const rowNum = Number(sheetRow);
    if (!rowNum || rowNum < 2) throw new Error('Không xác Ä‘á»‹nh Ä‘Æ°á»£c dòng cần cập nhật.');
    const startColStr = colName(startColIndex);
    const endColStr = colName(getStorageHeaders().length - 1);

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${currentTab}!${startColStr}${rowNum}:${endColStr}${rowNum}?valueInputOption=RAW`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: [cleanRow] })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Cáº­p nháº­t dòng thất bại.');
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
        body: JSON.stringify({ valueInputOption: 'USER_ENTERED', data })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Cáº­p nháº­t nhiá» u dòng thất bại.');
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
            throw new Error(err.error?.message || 'Không Ä‘á» c Ä‘Æ°á»£c metadata sheet.');
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
        throw new Error(err.error?.message || 'XÃ³a dòng thất bại.');
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
        throw new Error(err.error?.message || 'ThÃªm dòng thất bại.');
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
        throw new Error(err.error?.message || 'XÃ³a dữ liệu cÅ© thất bại.');
    }
}

async function upsertRecordRows(rows) {
    let cleanRows = rows.map(normalizeRow).filter(row => row.some(cell => String(cell || '').trim()));
    if (!cleanRows.length) throw new Error('Không có dòng dữ liệu hợp lệ.');
    if (currentTab === 'DON_HANG') {
        const existingById = new Map(allData.map(row => [getRowId(row), row]).filter(([id]) => id));
        const updates = [];
        const appends = [];
        cleanRows.forEach(row => {
            const orderId = getRowId(row);
            if (!orderId) return;
            if (existingById.has(orderId)) {
                updates.push({ row, sheetRow: getDataSheetRow(existingById.get(orderId)) });
            } else {
                appends.push(row);
                existingById.set(orderId, row);
            }
        });
        recalculateDonHangRows([...updates.map(u => u.row), ...appends]);
        if (updates.length > 0) await batchWriteRecordRows(updates);
        if (appends.length > 0) await appendRecordRows(appends);
        return { updated: updates.length, inserted: appends.length, skipped: 0 };
    }
    const generatedIds = [];
    cleanRows.forEach(row => {
        if (!row[0]) {
            const id = generateNextId(generatedIds);
            row[0] = id;
            generatedIds.push(id);
        }
    });

    const existingById = new Map(allData.map(row => [getRowId(row), row]).filter(([id]) => id));
    const updates = [];
    const appends = [];
    for (const row of cleanRows) {
        const id = getRowId(row);
        const existing = existingById.get(id);
        if (existing) {
            updates.push({ row, sheetRow: getDataSheetRow(existing) });
        } else {
            appends.push(row);
            existingById.set(id, row);
        }
    }

    if (updates.length > 0) {
        await batchWriteRecordRows(updates);
    }
    await appendRecordRows(appends);
    return { updated: updates.length, inserted: appends.length, skipped: 0 };
}

function getFormRowValue(row, header, idx) {
    if (!row) {
        if (currentTab === 'DON_HANG' && header === 'gian_hang') {
            return String(document.getElementById('storeFilter')?.value || '').trim();
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
        const idSpCon = String(row[0] || '').trim().toUpperCase();
        const idSp = String(row[1] || '').trim().toUpperCase();
        const name = String(row[2] || '').trim();
        if (!name) return;
        if (idSp) {
            dsSpNameMapCache.set(idSp, name);
            if (idSp.length >= 4) dsSpNameMapCache.set(idSp.slice(0, 4), name);
        }
        if (idSpCon) {
            dsSpNameMapCache.set(idSpCon, name);
            dsSpNameMapCache.set(idSpCon.slice(0, 14), name);
            if (idSpCon.length >= 4 && !dsSpNameMapCache.has(idSpCon.slice(0, 4))) {
                dsSpNameMapCache.set(idSpCon.slice(0, 4), name);
            }
        }
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
        throw new Error(err.error?.message || 'Không Ä‘á» c Ä‘Æ°á»£c danh sách sản phẩm tá»« sheet DS_SP.');
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
    document.querySelector('#loading p').innerText = 'Đang cập nhật trạng thái hoàn hàng...';
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
}

let _activeImageTargetInputId = null;

function selectFormSkuValue(inputId, skuCode) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    const cleanSku = String(skuCode || '').trim().slice(0, 14);
    inputEl.value = cleanSku;

    const labelEl = inputEl.closest('label') || inputEl.parentElement;
    if (labelEl) {
        labelEl.querySelectorAll('.sku-option-pill').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.includes(cleanSku));
        });
    }

    onSkuInputChanged(inputEl);
    updateDsSpSuggestedName();
}

function getSkuSuggestionsList() {
    const list = [];
    const seen = new Set();

    const addSku = (code, name) => {
        const rawStr = String(code || '').trim();
        const cleanName = String(name || '').trim();
        if (!rawStr) return;
        const parts = rawStr.split(/[|,,]/).map(s => s.trim().slice(0, 14)).filter(Boolean);
        parts.forEach(cleanCode => {
            const key = cleanCode.toUpperCase();
            if (seen.has(key)) {
                const existing = list.find(item => item.code.toUpperCase() === key);
                if (existing && !existing.name && cleanName) {
                    existing.name = cleanName;
                }
                return;
            }
            seen.add(key);
            list.push({ code: cleanCode, name: cleanName });
        });
    };

    if (Array.isArray(allData)) {
        allData.forEach(row => {
            if (currentTab === 'WEB_SP') {
                addSku(row[2], row[4]);
            } else if (currentTab === 'DS_SP' || currentTab === 'TINH_GIA' || currentTab === 'SP_BO') {
                addSku(row[0], row[2]);
                addSku(row[1], row[2]);
            }
        });
    }

    if (typeof allDataCache === 'object') {
        Object.keys(allDataCache).forEach(tabKey => {
            const rows = allDataCache[tabKey];
            if (Array.isArray(rows)) {
                rows.forEach(row => {
                    if (tabKey === 'WEB_SP') {
                        addSku(row[2], row[4]);
                    } else if (tabKey === 'DS_SP' || tabKey === 'TINH_GIA' || tabKey === 'SP_BO') {
                        addSku(row[0], row[2]);
                        addSku(row[1], row[2]);
                    }
                });
            }
        });
    }

    return list;
}

function updateSkuDatalistOptions() {
    let datalist = document.getElementById('skuSuggestOptions');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'skuSuggestOptions';
        document.body.appendChild(datalist);
    }
    const skus = getSkuSuggestionsList();
    datalist.innerHTML = skus.map(item => `<option value="${escapeHtml(item.code)}">${escapeHtml(item.name ? item.code + ' — ' + item.name : item.code)}</option>`).join('');
}

function getDsSpProductName(skuVal) {
    if (!skuVal) return '';
    const cleanSku = String(skuVal).trim().toUpperCase();
    const prefix4 = cleanSku.slice(0, 4);
    if (!prefix4 || prefix4.length < 4) return '';

    // Check dsSpNameMapCache
    if (dsSpNameMapCache) {
        if (dsSpNameMapCache.has(prefix4)) return dsSpNameMapCache.get(prefix4);
        if (dsSpNameMapCache.has(cleanSku)) return dsSpNameMapCache.get(cleanSku);
    }

    // Direct search in DS_SP sheet data matching ID_SP (col index 1)
    const dsRows = (currentTab === 'DS_SP' ? allData : null) || allDataCache['DS_SP'] || [];
    if (Array.isArray(dsRows)) {
        for (const row of dsRows) {
            const idSp = String(row[1] || '').trim().toUpperCase(); // ID_SP
            const name = String(row[2] || '').trim(); // TEN_SP
            if (idSp === prefix4 && name) return name;
        }
        for (const row of dsRows) {
            const idSpCon = String(row[0] || '').trim().toUpperCase();
            const name = String(row[2] || '').trim();
            if (idSpCon.startsWith(prefix4) && name) return name;
        }
    }

    return '';
}

async function updateDsSpSuggestedName() {
    const suggestedInput = document.getElementById('dsSpSuggestedNameInput');
    if (!suggestedInput) return;

    const form = suggestedInput.closest('#formFields') || document;
    const skuInput = form.querySelector('[data-field="sku"]') || form.querySelector('[data-field="id_sp_con"]') || form.querySelector('[data-field="id_sp"]');
    const skuVal = String(skuInput?.value || '').trim();

    if (!skuVal) {
        suggestedInput.value = '';
        suggestedInput.placeholder = 'Chưa chọn SKU...';
        return;
    }

    try {
        await fetchDsSpNameMap();
    } catch (e) {
        console.error('Failed to load DS_SP name map:', e);
    }

    const matchedName = getDsSpProductName(skuVal);
    if (matchedName) {
        suggestedInput.value = matchedName;
    } else {
        const prefix4 = skuVal.slice(0, 4).toUpperCase();
        suggestedInput.value = '';
        suggestedInput.placeholder = `(Không tìm thấy SKU mã '${prefix4}' trong DS_SP)`;
    }
}

function copyDsSpNameToTenSp(tenSpInputId) {
    const suggestedInput = document.getElementById('dsSpSuggestedNameInput');
    const tenSpInput = document.getElementById(tenSpInputId);
    if (suggestedInput && tenSpInput && suggestedInput.value) {
        tenSpInput.value = suggestedInput.value;
    }
}

function onSkuInputChanged(inputEl) {
    updateDsSpSuggestedName();
}

function updateFormImgGallery(inputId) {
    const inputEl = document.getElementById(inputId);
    const galleryEl = document.getElementById('gallery_' + inputId);
    if (!inputEl || !galleryEl) return;
    const rawVal = String(inputEl.value || '').trim();
    const urls = rawVal.split(/[|,,]/).map(s => s.trim()).filter(s => s.startsWith('http://') || s.startsWith('https://'));
    if (urls.length === 0) {
        galleryEl.innerHTML = '<span style="color:#94a3b8; font-size:12px; font-weight:500;">Chưa có ảnh. Bấm nút "🖼️ Tìm / Thêm Ảnh" ở trên để chọn thêm ảnh.</span>';
        return;
    }
    galleryEl.innerHTML = urls.map((url, idx) => `
        <div class="form-img-card" title="${escapeHtml(url)}">
            <img src="${escapeHtml(url)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2394a3b8%22 stroke-width=%222%22><rect width=%2218%22 height=%2218%22 x=%223%22 y=%223%22 rx=%222%22/><circle cx=%229%22 cy=%229%22 r=%222%22/><path d=%22m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21%22/></svg>'">
            <button type="button" class="remove-btn" onclick="removeFormImgUrl('${inputId}', ${idx})" title="Xóa ảnh này">✕</button>
        </div>
    `).join('');
}

function removeFormImgUrl(inputId, removeIdx) {
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;
    const rawVal = String(inputEl.value || '').trim();
    const urls = rawVal.split(/[|,,]/).map(s => s.trim()).filter(Boolean);
    urls.splice(removeIdx, 1);
    inputEl.value = urls.join(' | ');
    updateFormImgGallery(inputId);
}

function openImageSearchForField(inputId) {
    _activeImageTargetInputId = inputId;
    const inputEl = document.getElementById(inputId);
    const form = inputEl?.closest('#formFields');
    const tenSpInput = form?.querySelector('[data-field="ten_sp"]') || form?.querySelector('[data-field="ten_san_pham"]');
    const query = tenSpInput?.value || '';

    _imgSearchRowIndex = null;
    _imgSearchSelectedUrl = null;
    const queryInput = document.getElementById('imgSearchQuery');
    const directInput = document.getElementById('imgDirectUrlInput');
    if (queryInput) queryInput.value = query;
    if (directInput) directInput.value = '';

    document.getElementById('imgSearchResults').innerHTML = document.getElementById('imgSearchPlaceholder').outerHTML;
    document.getElementById('imgSearchFooter').style.display = 'none';
    document.getElementById('imgSearchSubtitle').textContent = query ? `Sản phẩm: "${query}"` : 'Thêm / Tìm ảnh';

    const modal = document.getElementById('imgSearchModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (query) {
        setTimeout(searchProductImages, 150);
    }
}

function renderFormFields(rowOrGroup = null) {
    const container = document.getElementById('formFields');
    const row = rowOrGroup;
    const headers = getStorageHeaders();
    container.innerHTML = headers.map((header, idx) => {
        const rawValue = getFormRowValue(row, header, idx);
        const value = escapeHtml(rawValue);

        if (header === 'id') {
            const idValue = row ? rawValue : generateNextId();
            return `<input id="formField_${idx}" data-field="${header}" type="hidden" value="${escapeHtml(idValue)}">`;
        }

        if (['anh', 'anh_phan_loai', 'anh_mota'].includes(header)) {
            return `
            <div class="form-img-container">
                <label style="display:flex; justify-content:space-between; align-items:center;">
                    <span>${header.toUpperCase()} (Phân cách ảnh bởi dấu | )</span>
                    <button type="button" onclick="openImageSearchForField('formField_${idx}')" style="padding:4px 12px; background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; border:none; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">🖼️ Tìm / Thêm Ảnh</button>
                </label>
                <input id="formField_${idx}" data-field="${header}" type="text" value="${value}" placeholder="Link ảnh cách nhau bởi dấu | (vd: url1 | url2)..." oninput="updateFormImgGallery('formField_${idx}')">
                <div class="form-img-gallery" id="gallery_formField_${idx}"></div>
            </div>`;
        }

        if (header === 'sku' || header === 'id_sp_con' || header === 'id_sp') {
            const rawSkuStr = String(rawValue || '').trim();
            const skuParts = rawSkuStr.split(/[|,,]/).map(s => s.trim().slice(0, 14)).filter(Boolean);
            const displayValue = skuParts.length > 0 ? skuParts[0] : value;
            
            let pillButtonsHtml = '';
            if (skuParts.length > 0) {
                pillButtonsHtml = `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
                    ${skuParts.map((part, pIdx) => `
                        <button type="button" class="sku-option-pill ${pIdx === 0 ? 'active' : ''}" 
                            onclick="selectFormSkuValue('formField_${idx}', '${escapeHtml(part)}')">
                            📌 ${escapeHtml(part)}
                        </button>
                    `).join('')}
                </div>`;
            }

            return `
            <label>
                <span>${header.toUpperCase()} (Chọn SKU 14 ký tự)</span>
                <input id="formField_${idx}" data-field="${header}" type="text" value="${escapeHtml(displayValue)}" list="skuSuggestOptions" autocomplete="off" oninput="onSkuInputChanged(this)" placeholder="Nhập hoặc chọn SKU 14 ký tự...">
                ${pillButtonsHtml}
            </label>`;
        }

        if (header === 'ten_sp' || header === 'ten_san_pham') {
            const extraDsSpBox = (currentTab === 'WEB_SP') ? `
                <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:8px 12px; display:grid; gap:4px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:11px; font-weight:700; color:#0369a1;">📌 TÊN SP TỪ DS_SP (So sánh 4 ký tự SKU với ID_SP)</span>
                        <button type="button" onclick="copyDsSpNameToTenSp('formField_${idx}')" style="padding:2px 8px; background:#0284c7; color:#fff; border:none; border-radius:5px; font-size:11px; font-weight:600; cursor:pointer;">📋 Dùng tên này cho TEN_SP</button>
                    </div>
                    <input id="dsSpSuggestedNameInput" type="text" readonly style="background:#fff; color:#0f172a; font-weight:600; font-size:13px; border:1px solid #93c5fd; padding:6px 10px; border-radius:6px;" value="" placeholder="Đang tra cứu ID_SP từ DS_SP...">
                </div>` : '';

            return `
            <div style="display:grid; gap:8px;">
                <label>
                    <span>TEN_SP</span>
                    <input id="formField_${idx}" data-field="${header}" type="text" value="${value}">
                </label>
                ${extraDsSpBox}
            </div>`;
        }

        if (header === 'ghi_chu' || header === 'noi_dung' || header === 'mo_ta') {
            return `<label class="full-width-field"><span>${header.toUpperCase()}</span><textarea id="formField_${idx}" data-field="${header}" rows="3">${value}</textarea></label>`;
        }

        if (header === 'truong') {
            return `<label><span>TRƯỜNG</span><input id="formField_${idx}" data-field="${header}" type="text" value="${value}" list="truongOptions" autocomplete="off"></label>`;
        }

        if (header === 'mail') {
            return `<label><span>EMAIL</span><input id="formField_${idx}" data-field="${header}" type="email" value="${value}"></label>`;
        }

        if (currentTab === 'DON_HANG') {
            const options = null;
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
    if (currentTab === 'DON_HANG') {
        modal.classList.add('side-panel-mask');
        let groupRows = [];
        if (row) {
            const mdh = getRowId(row, 'DON_HANG');
            groupRows = allData.filter(r => getRowId(r, 'DON_HANG') === mdh && getDataSheetRow(r) > 0);
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
    updateSkuDatalistOptions();
    updateDsSpSuggestedName();
    const storageHeaders = getStorageHeaders();
    storageHeaders.forEach((h, idx) => {
        if (['anh', 'anh_phan_loai', 'anh_mota'].includes(h)) {
            updateFormImgGallery(`formField_${idx}`);
        }
    });
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
        renderFieldsTable('THÃ”NG TIN ÄÆ N HÃ€NG', generalHeaders)
        + renderFieldsTable('THÃ”NG TIN TÃ€I CHÃNH', financeHeaders);
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



async function saveRecordFromForm(event) {
    event.preventDefault();
    const headers = getStorageHeaders();
    const editingSheetRow = Number(document.getElementById('editingSheetRow').value);
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
            if (currentTab === 'TINH_GIA') {
                if (header === 'hanh_dong') {
                    return `<td><button class="btn primary" style="padding: 4px 12px; min-width: unset; height: 28px; line-height: 20px; font-size: 12px;" onclick="event.stopPropagation(); saveInlineTinhGia(${start + rowIndex}, this)">Lưu</button></td>`;
                }
                const editableCols = ['gia_đăng', 'loi_nhuan%', 'lai_mong_muon', 'phi_ads_%', 'phi_aff_%', '11%_phi_co_dinh', '6%_phi_giao_dich', '5.5% xtra', '1,5%_thue'];
                if (editableCols.includes(header)) {
                    let isCurrency = ['gia_đăng', 'lai_mong_muon'].includes(header);
                    let val = isCurrency ? formatDisplayNumber(cell) : (cellStr.includes('%') ? cellStr : cellStr + (cellStr ? '%' : ''));
                    let inputHtml = `<input type="text" class="inline-edit-input" data-header="${header}" value="${escapeHtml(String(val))}" oninput="handleInlineTinhGiaInput(${start + rowIndex}, this)" onchange="saveInlineTinhGia(${start + rowIndex}, this)" onclick="event.stopPropagation()">`;
                    if (header === 'loi_nhuan%') {
                        inputHtml = `<div style="display:flex; align-items:center; gap:4px;">` + inputHtml + `<button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickLoiNhuan(${start + rowIndex}, this, 10)">10%</button><button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickLoiNhuan(${start + rowIndex}, this, 20)">20%</button></div>`;
                    }
                    if (header === 'gia_đăng') {
                        inputHtml = `<div style="display:flex; align-items:center; gap:3px;">` + inputHtml + `<button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickGiaDang(${start + rowIndex}, this)" title="Điền Giá Thấp Nhất" style="padding: 2px 4px; font-size: 10px;">👇</button><button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickFees(${start + rowIndex}, this)" title="Điền Phí Mặc Định" style="padding: 2px 4px; font-size: 10px;">⚡</button><button onclick="event.stopPropagation(); copyInlineInput(this)" style="background:none; border:none; cursor:pointer; font-size:13px; padding:0; margin-left:2px;" title="Copy Giá Đăng">📋</button></div>`;
                        const numGiaDang = parseMoney(cell);
                        if (numGiaDang > 0) {
                            const roundedVal = Math.round(numGiaDang / 0.8);
                            inputHtml += `<div class="gia-dang-calc-val" style="display:flex; align-items:center; color: gray; font-size: 11px; margin-top: 4px; font-weight: 500;"><span class="calc-number">${formatDisplayNumber(roundedVal)}</span><button onclick="event.stopPropagation(); copyCalcValue(this, '${roundedVal}')" style="background:none; border:none; cursor:pointer; font-size:12px; margin-left:4px; padding:0;" title="Copy">📋</button></div>`;
                        } else {
                            inputHtml += `<div class="gia-dang-calc-val" style="display:none; align-items:center; color: gray; font-size: 11px; margin-top: 4px; font-weight: 500;"><span class="calc-number"></span><button onclick="event.stopPropagation(); copyCalcValue(this, '')" style="background:none; border:none; cursor:pointer; font-size:12px; margin-left:4px; padding:0;" title="Copy">📋</button></div>`;
                        }
                    }
                    return `<td>${inputHtml}</td>`;
                }
                if (header === 'gia_thap_nhat') {
                    const displayCell = isNumericDisplayHeader(header) ? formatDisplayNumber(cell) : cell;
                    const displayValue = displayCell;
                    const cellClass = '';
                    return `<td${cellClass} data-col="${header}">${escapeHtml(displayValue || '')}</td>`;
                }
            }
            const displayCell = isNumericDisplayHeader(header)
                ? formatDisplayNumber(cell)
                : cell;
            const displayValue = displayCell;

            const isSku = (header === 'sku' || header === 'id_sp_con' || header === 'id_sp');
            const isTenSp = (header === 'ten_sp' || header === 'ten_san_pham');
            const isMoTa = (header === 'mo_ta' || header === 'noi_dung');

            if (isSku || isTenSp || isMoTa) {
                const colClass = isSku ? 'col-sku' : (isTenSp ? 'col-ten-sp' : 'col-mo-ta');
                let extraPills = '';
                if (currentTab === 'TINH_GIA' && (header === 'ten_sp' || header === 'ten_san_pham')) {
                    const idSpConVal = String(row[0] || '').trim();
                    const tenSpVal = String(row[2] || '').trim();
                    const btnList = getSavedCustomButtons();
                    if (btnList.length > 0) {
                        extraPills = `<div style="display:flex; flex-direction:row; flex-wrap:wrap; align-items:center; gap:4px; margin-top:5px;">
                            ${btnList.map(bText => {
                                const isMatch = isBtnInSpShopee(bText, row);
                                const btnBg = isMatch ? '#10b981' : '#e0e7ff';
                                const btnColor = isMatch ? '#ffffff' : '#3730a3';
                                const btnBorder = isMatch ? '#059669' : '#c7d2fe';
                                return `<button type="button" class="copy-pill-btn" style="background:${btnBg}; color:${btnColor}; border:1px solid ${btnBorder}; border-radius:4px; font-size:11px; font-weight:700; padding:2px 6px; cursor:pointer; display:inline-flex; align-items:center; gap:3px; transition:all 0.15s; white-space:nowrap;" onclick="event.stopPropagation(); executeCustomCopy('${escapeJsString(idSpConVal)}', '${escapeJsString(bText)}', '${escapeJsString(tenSpVal)}', this)" title="Bấm để copy: ${escapeHtml(formatCustomCopyText(idSpConVal, bText, tenSpVal))}">
                                    📋 ${escapeHtml(bText)}
                                </button>`;
                            }).join('')}
                        </div>`;
                    }
                }
                return `<td class="${colClass}" data-col="${header}"><div class="multiline-cell-wrapper" title="${escapeHtml(displayValue || '')}">${escapeHtml(displayValue || '')}</div>${extraPills}</td>`;
            }

            const isNumCell = isNumericDisplayHeader(header);
            const cellStyle = isNumCell ? ' style="text-align: right;"' : '';
            return `<td data-col="${header}"${cellStyle}>${escapeHtml(displayValue || '')}</td>`;
        }).join('');

        const editAction = (currentTab === 'DH')
            ? ` ondblclick="openDhDetail('${escapeHtml(escapeJsString(String(row[3] || '')))}')"`
            : (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
                ? ` ondblclick="openDonHangDetail('${escapeHtml(escapeJsString(getRowId(row)))}')"`
                : currentTab === 'TINH_GIA'
                    ? ` ondblclick="event.stopPropagation()"`
                    : ` ondblclick="openRecordForm(${start + rowIndex})"`;
        const selectCell = (currentTab === 'TINH_GIA' || currentTab === 'DS_SP')
            ? `<td class="select-col" onclick="event.stopPropagation()"><input type="checkbox" class="product-select-cb" data-sp-id="${escapeHtml(escapeJsString(getRowProductId(row)))}" ${selectedProductIds.has(getRowProductId(row)) ? 'checked' : ''} onchange="toggleProductSelection('${escapeHtml(escapeJsString(getRowProductId(row)))}', this.checked)"></td>`
            : '';
        const imgSearchCell = currentTab === 'DS_SP'
            ? `<td onclick="event.stopPropagation()" style="white-space:nowrap;padding:0 8px;"><button onclick="event.stopPropagation(); openImageSearch(${start + rowIndex})" style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;border:none;border-radius:7px;padding:4px 10px;cursor:pointer;font-size:12px;font-weight:600;">🔍</button></td>`
            : '';
        return `<tr${editAction}>${selectCell}${cells}${imgSearchCell}</tr>`;
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
    const dateFromTime = dateFrom ? new Date(dateFrom + "T00:00:00").getTime() : 0;
    const dateToTime = dateTo ? new Date(dateTo + "T23:59:59").getTime() : 0;
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

        if (currentTab === 'DS_SP' || currentTab === 'TINH_GIA') {
            const idCon = String(row[0] || '').trim().toUpperCase();
            const idSp = String(row[1] || '').trim().toUpperCase();
            if (spBoSetCache && ((idCon && spBoSetCache.has(idCon)) || (idSp && !idCon && spBoSetCache.has(idSp)))) return false;
            if (currentTab === 'TINH_GIA' && String(row[0] || '').trim().length <= 5) return false;
            const code = String(row[1] || '').toUpperCase();
            const matchesDsSpPrefix1 = !currentDsSpPrefix1Filter || code.startsWith(currentDsSpPrefix1Filter);
            const matchesDsSpPrefix2 = !currentDsSpPrefix2Filter || code.startsWith(currentDsSpPrefix2Filter);
            return matchesSearch && matchesDsSpPrefix1 && matchesDsSpPrefix2 && matchesTruong;
        }

        if (currentTab === 'WEB_SP') {
            const matchesStore = !store || String(row[1] || '').trim().toLowerCase() === store.trim().toLowerCase();
            const skuCode = String(row[2] || '').trim().toUpperCase();
            const matchesPrefix1 = !currentDsSpPrefix1Filter || skuCode.startsWith(currentDsSpPrefix1Filter);
            const matchesPrefix2 = !currentDsSpPrefix2Filter || skuCode.startsWith(currentDsSpPrefix2Filter);
            return matchesSearch && matchesStore && matchesPrefix1 && matchesPrefix2 && matchesTruong;
        }

        if (currentTab === 'SP_GIAM_GIA') {
            const matchesStore = !store || String(row[8] || '').trim().toLowerCase() === store.trim().toLowerCase();
            return matchesSearch && matchesStore && matchesTruong;
        }

        if (currentTab === 'DH') {
            const selectedGianList = Array.from(selectedDhGianSet).map(g => g.toLowerCase());
            const selectedTinhTrangList = Array.from(selectedDhTinhTrangSet).map(s => s.trim().toUpperCase());
            const selectedTrangThaiList = Array.from(selectedDhTrangThaiSet).map(s => s.trim().toUpperCase());

            const startDateStr = document.getElementById('dhStartDateInput')?.value || '';
            const endDateStr = document.getElementById('dhEndDateInput')?.value || '';
            const startDateTime = startDateStr ? new Date(startDateStr + "T00:00:00").getTime() : 0;
            const endDateTime = endDateStr ? new Date(endDateStr + "T23:59:59").getTime() : 0;

            const rowGian = String(row[0] || '').trim().toLowerCase();
            const matchesGian = selectedGianList.length === 0 || selectedGianList.includes(rowGian);

            const rowTinhTrang = String(row[14] || '').trim().toUpperCase();
            const matchesTinhTrang = selectedTinhTrangList.length === 0 || selectedTinhTrangList.includes(rowTinhTrang);

            const rowTrangThai = String(row[15] || '').trim().toUpperCase();
            const matchesTrangThai = selectedTrangThaiList.length === 0 || selectedTrangThaiList.includes(rowTrangThai);

            const orderDateObj = parseDhDate(row[2]) || parseDhDate(row[1]);
            const orderTime = orderDateObj ? orderDateObj.getTime() : 0;

            const matchesStartDate = !startDateTime || (orderTime && orderTime >= startDateTime);
            const matchesEndDate = !endDateTime || (orderTime && orderTime <= endDateTime);

            return matchesSearch && matchesGian && matchesStartDate && matchesEndDate && matchesTinhTrang && matchesTrangThai;
        }

        if (!['DON_HANG', 'DON_HANG_CHI_TIET'].includes(currentTab)) return matchesSearch && matchesTruong;
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
        return matchesSearch && matchesDateFrom && matchesDateTo && matchesMdh && matchesMvd && matchesTinhTrang && matchesTrangThai && matchesProfit;
    });

    if (currentTab === 'DH') {
        populateDhGianFilter();
        populateDhTinhTrangFilter();
        populateDhTrangThaiFilter();
        filteredData = getDhSummaryRows(filteredData);
        filteredData.sort((a, b) => {
            const dateA = parseDhDate(a[2]) || parseDhDate(a[1]) || new Date(0);
            const dateB = parseDhDate(b[2]) || parseDhDate(b[1]) || new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
        updateDhSummaryStats();
    }
    if (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET') {
        filteredData.sort((a, b) => parseDonHangDateTime(b[DON_HANG_INDEX.ngay_h]) - parseDonHangDateTime(a[DON_HANG_INDEX.ngay_h]));
        updateDonHangSummary();
    }
    if (currentTab === 'HOA_DON') {
        filteredData.sort((a, b) => parseHoaDonDate(b[1]) - parseHoaDonDate(a[1]));
    }
    if (currentTab === 'NHAP_XUAT') {
        filteredData.sort((a, b) => parseDdMmYyyyDate(b[1]) - parseDdMmYyyyDate(a[1]));
    }
    if (currentTab === 'DS_SP' || currentTab === 'SP_GIAM_GIA') {
        filteredData.sort((a, b) => String(b[0] || '').localeCompare(String(a[0] || '')));
    }
    if (currentTab === 'TINH_GIA') {
        filteredData.sort((a, b) => String(b[1] || '').localeCompare(String(a[1] || '')));
    }
    if (currentTab === 'WEB_SP') {
        filteredData.sort((a, b) => String(b[2] || '').localeCompare(String(a[2] || ''), 'vi', { numeric: true, sensitivity: 'base' }));
    }
    if (currentTab === 'DS_SP' || currentTab === 'TINH_GIA' || currentTab === 'WEB_SP') {
        updateDsSpPrefixButtonCounts();
    }
    applyHeaderSort();
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

function getRowPrefixCode(row) {
    if (!row) return '';
    if (currentTab === 'WEB_SP') {
        return String(row[2] || '').trim().toUpperCase();
    }
    return String(row[1] || '').trim().toUpperCase();
}

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

function getPrefixBaseFilteredRows() {
    const term = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const truong = (document.getElementById('truongFilter')?.value || '').toLowerCase();
    const store = (document.getElementById('storeFilter')?.value || '').toLowerCase();
    const terms = term.split(',').map(s => s.trim()).filter(Boolean);

    return allData.filter(row => {
        const matchesSearch = terms.length === 0 || terms.some(t => row.some(cell => String(cell).toLowerCase().includes(t)));
        const matchesTruong = !truong || String(row[1] || '').toLowerCase().includes(truong);

        if (currentTab === 'DS_SP' || currentTab === 'TINH_GIA') {
            const idCon = String(row[0] || '').trim().toUpperCase();
            const idSp = String(row[1] || '').trim().toUpperCase();
            if (spBoSetCache && ((idCon && spBoSetCache.has(idCon)) || (idSp && !idCon && spBoSetCache.has(idSp)))) return false;
            if (currentTab === 'TINH_GIA' && String(row[0] || '').trim().length <= 5) return false;
            return matchesSearch && matchesTruong;
        }

        if (currentTab === 'WEB_SP') {
            const matchesStore = !store || String(row[1] || '').trim().toLowerCase() === store.trim().toLowerCase();
            return matchesSearch && matchesStore && matchesTruong;
        }

        return matchesSearch && matchesTruong;
    });
}

function generateDsSpPrefix1Buttons() {
    if (currentTab !== 'DS_SP' && currentTab !== 'TINH_GIA' && currentTab !== 'WEB_SP') return;
    const baseRows = getPrefixBaseFilteredRows();
    const prefixCounts = new Map();

    baseRows.forEach(row => {
        const code = getRowPrefixCode(row);
        if (code.length >= 1) {
            const p1 = code.substring(0, 1);
            prefixCounts.set(p1, (prefixCounts.get(p1) || 0) + 1);
        }
    });

    const sortedPrefixes = Array.from(prefixCounts.entries())
        .filter(([_, cnt]) => cnt > 0)
        .sort((a, b) => b[0].localeCompare(a[0], 'vi', { numeric: true, sensitivity: 'base' }))
        .map(entry => entry[0]);

    const container = document.getElementById('dsSpPrefix1Buttons');
    if (!container) return;

    container.innerHTML = `
        <button type="button" class="${!currentDsSpPrefix1Filter ? 'active' : ''}" data-prefix="" onclick="setDsSpPrefix1Filter('')">Tất cả <sub class="prefix-sub-count">${baseRows.length}</sub></button>
        ${sortedPrefixes.map(p => {
            const cnt = prefixCounts.get(p) || 0;
            return `<button type="button" class="${currentDsSpPrefix1Filter === p ? 'active' : ''}" data-prefix="${escapeHtml(p)}" onclick="setDsSpPrefix1Filter('${escapeHtml(escapeJsString(p))}')">${escapeHtml(p)}<sub class="prefix-sub-count">${cnt}</sub></button>`;
        }).join('')}
    `;

    generateDsSpPrefix2Buttons(currentDsSpPrefix1Filter);
}

function generateDsSpPrefix2Buttons(prefix1) {
    if (currentTab !== 'DS_SP' && currentTab !== 'TINH_GIA' && currentTab !== 'WEB_SP') return;
    const baseRows = getPrefixBaseFilteredRows();
    const prefixCounts = new Map();
    let totalCount = 0;

    baseRows.forEach(row => {
        const code = getRowPrefixCode(row);
        if (!prefix1 || code.startsWith(prefix1)) {
            totalCount++;
            if (code.length >= 2) {
                const p2 = code.substring(0, 2);
                prefixCounts.set(p2, (prefixCounts.get(p2) || 0) + 1);
            }
        }
    });

    const sortedPrefixes = Array.from(prefixCounts.entries())
        .filter(([_, cnt]) => cnt > 0)
        .sort((a, b) => b[0].localeCompare(a[0], 'vi', { numeric: true, sensitivity: 'base' }))
        .map(entry => entry[0]);

    const container = document.getElementById('dsSpPrefix2Buttons');
    if (!container) return;

    container.innerHTML = `
        <button type="button" class="${!currentDsSpPrefix2Filter ? 'active' : ''}" data-prefix="" onclick="setDsSpPrefix2Filter('')">Tất cả <sub class="prefix-sub-count">${totalCount}</sub></button>
        ${sortedPrefixes.map(p => {
            const cnt = prefixCounts.get(p) || 0;
            return `<button type="button" class="${currentDsSpPrefix2Filter === p ? 'active' : ''}" data-prefix="${escapeHtml(p)}" onclick="setDsSpPrefix2Filter('${escapeHtml(escapeJsString(p))}')">${escapeHtml(p)}<sub class="prefix-sub-count">${cnt}</sub></button>`;
        }).join('')}
    `;
}

function updateDsSpPrefixButtonCounts() {
    generateDsSpPrefix1Buttons();
}



function toggleOrderProfitFilter(value) {
    const input = document.getElementById('orderProfitFilter');
    if (!input) return;
    input.value = input.value === value ? '' : value;
    
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



function normalizeOrderStatus(orderStatus, returnStatus) {
    const value = `${orderStatus || ''} ${returnStatus || ''}`.toLocaleUpperCase('vi');
    if (value.includes('HỦY') || value.includes('HỦY')) return 'HỦY';
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



function buildDsSpRows(rows) {
    return rows.map(source => {
        const code = String(getExcelCell(source, 'Mã') || '').trim();
        return [
            code,
            code.slice(0, 4),
            String(getExcelCell(source, 'Tên') || '').trim(),
            parseMoney(getExcelCell(source, 'Giá nhập')),
            parseMoney(getExcelCell(source, 'Giá bán lẻ')),
            parseMoney(getExcelCell(source, 'Giá đóng gói')),
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
    const confirmMessage = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
        ? `Dữ liệu từ ${excelFiles.length} file (${fileNames}) sẽ được đọc theo tên cột và cập nhật sheet '${currentTab}'. Tiếp tục?`
        : (currentTab === 'DS_SP' || currentTab === 'SP_GIAM_GIA')
            ? `Dữ liệu từ ${excelFiles.length} file (${fileNames}) sẽ XÓA TOÀN BỘ dữ liệu cũ trong sheet '${currentTab}' rồi ghi dữ liệu mới. Tiếp tục?`
            : `Dữ liệu từ ${excelFiles.length} file (${fileNames}) sẽ cập nhật sheet '${currentTab}' theo id. Id đã có sẽ cập nhật, id mới sẽ thêm dòng. Tiếp tục?`;
    if (!confirm(confirmMessage)) return;

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang xử lý ${excelFiles.length} file và cập nhật Google Sheets...`;

    try {
        const reader = (currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
            ? readDonHangExcelRows
            : currentTab === 'DS_SP'
                ? readDsSpExcelRows
                : (currentTab === 'SP_GIAM_GIA')
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
        if (currentTab === 'DS_SP' || currentTab === 'SP_GIAM_GIA') {
            if (currentTab === 'SP_GIAM_GIA') await ensureSpGiamGiaSheetExists();
            await clearCurrentTabData();
            await appendRecordRows(allRowsToUpload);
            result = { updated: 0, inserted: allRowsToUpload.length, skipped: 0 };
        } else {
            result = await upsertRecordRows(allRowsToUpload);
        }
        alert((currentTab === 'DON_HANG' || currentTab === 'DON_HANG_CHI_TIET')
            ? `Đã thêm mới ${result.inserted} đơn hàng vào sheet '${currentTab}'. Bỏ qua ${result.skipped} dòng có mã đơn hàng trùng.`
            : currentTab === 'DS_SP'
                ? `Đã xóa dữ liệu cũ và ghi mới ${result.inserted} dòng vào sheet '${currentTab}'.`
                : `Đã cập nhật ${result.updated} dòng và thêm mới ${result.inserted} dòng vào sheet '${currentTab}'.`);
        try { localStorage.setItem(XNK_TT_TAB_STORAGE_KEY, currentTab); } catch (_) { }
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
    try { saved = localStorage.getItem(XNK_TT_TAB_STORAGE_KEY) || ''; } catch (_) { }
    await switchTab(CONFIG.tabs[saved] ? saved : 'DS_SP', true);
}

init();

// ==================== TINH GIA LOGIC ====================
let currentTinhGiaRow = null;
let currentTinhGiaRowIndex = -1;
let tinhGiaRecalculating = false;

function openTinhGiaForm(rowIndex) {
    if (rowIndex === null || rowIndex < 0 || rowIndex >= filteredData.length) return;
    currentTinhGiaRowIndex = rowIndex;
    const row = filteredData[rowIndex];
    currentTinhGiaRow = row;
    
    const headers = getStorageHeaders('TINH_GIA');
    const getVal = (colName) => String(row[headers.indexOf(colName)] ?? '').trim();
    const getNum = (colName) => parseMoney(getVal(colName));
    const getFloat = (colName) => parseFloat(getVal(colName)) || 0;

    document.getElementById('tg_rowIndex').value = rowIndex;
    document.getElementById('tg_ten_sp').value = getVal('ten_sp');
    document.getElementById('tg_gia_nhap_ncc').value = formatDisplayNumber(getNum('gia_nhap_ncc'));
    
    document.getElementById('tg_gia_đăng').value = formatDisplayNumber(getNum('gia_đăng'));
    document.getElementById('tg_loi_nhuan_pt').value = getVal('loi_nhuan_pt').replace('%', ''); 
    document.getElementById('tg_lai_mong_muon').value = formatDisplayNumber(getNum('lai_mong_muon'));
    
    document.getElementById('tg_phi_ads_pt').value = getVal('phi_ads_pt').replace('%', '') || 0;
    document.getElementById('tg_phi_aff_pt').value = getVal('phi_aff_pt').replace('%', '') || 0;
    document.getElementById('tg_phi_co_dinh_pt').value = getVal('11_phi_co_dinh').replace('%', '') || 11;
    document.getElementById('tg_phi_giao_dich_pt').value = getVal('6_phi_giao_dich').replace('%', '') || 6;
    document.getElementById('tg_xtra_pt').value = getVal('5.5_xtra').replace('%', '') || 5.5;
    document.getElementById('tg_thue_pt').value = getVal('1.5_thue').replace('%', '') || 1.5;

    recalculateTinhGia();

    document.getElementById('tinhGiaModal').classList.add('active');
}

function closeTinhGiaForm() {
    document.getElementById('tinhGiaModal').classList.remove('active');
    currentTinhGiaRow = null;
}

function formatCurrencyInput(input) {
    let val = input.value.replace(/\D/g, '');
    if (val !== '') {
        input.value = formatDisplayNumber(parseInt(val, 10));
    } else {
        input.value = '0';
    }
}

function getTgInputVal(id) {
    return document.getElementById(id).value;
}

function getTgInputNum(id) {
    return parseMoney(getTgInputVal(id));
}

function getTgInputFloat(id) {
    return parseFloat(getTgInputVal(id)) || 0;
}

function setQuickLoiNhuan(pt) {
    document.getElementById('tg_loi_nhuan_pt').value = pt;
    handleTinhGiaInput('loi_nhuan_pt');
}

function handleTinhGiaInput(source) {
    if (tinhGiaRecalculating) return;
    recalculateTinhGia(source);
}

function recalculateTinhGia(source = null) {
    tinhGiaRecalculating = true;
    
    try {
        const headers = getStorageHeaders('TINH_GIA');
        const giaBan = parseMoney(currentTinhGiaRow[headers.indexOf('gia_ban')] ?? '');
        
        let rAds = getTgInputFloat('tg_phi_ads_pt') / 100;
        let rAff = getTgInputFloat('tg_phi_aff_pt') / 100;
        let rCd = getTgInputFloat('tg_phi_co_dinh_pt') / 100;
        let rGd = getTgInputFloat('tg_phi_giao_dich_pt') / 100;
        let rXt = getTgInputFloat('tg_xtra_pt') / 100;
        let rTh = getTgInputFloat('tg_thue_pt') / 100;
        
        const phiHaTang = 3000;
        const phiPiship = 2700;
        const CFix = phiHaTang + phiPiship + giaBan;
        const RSum = rAds + rAff + rCd + rGd + rTh;
        
        let giaDang = getTgInputNum('tg_gia_đăng');
        let laiMongMuon = getTgInputNum('tg_lai_mong_muon');
        let loiNhuanPt = getTgInputFloat('tg_loi_nhuan_pt') / 100;

        if (source === 'lai_mong_muon') {
            let p1 = (laiMongMuon + CFix) / (1 - RSum - rXt);
            let xtra1 = p1 * rXt;
            if (xtra1 <= 50000) {
                giaDang = Math.round(p1);
            } else {
                let p2 = (laiMongMuon + CFix + 50000) / (1 - RSum);
                giaDang = Math.round(p2);
            }
            if (giaDang < 0 || isNaN(giaDang) || !isFinite(giaDang)) giaDang = 0;
            loiNhuanPt = giaDang > 0 ? laiMongMuon / giaDang : 0;
            document.getElementById('tg_gia_đăng').value = formatDisplayNumber(giaDang);
            document.getElementById('tg_loi_nhuan_pt').value = (loiNhuanPt * 100).toFixed(2);
            
        } else if (source === 'loi_nhuan%') {
            let p1 = CFix / (1 - RSum - loiNhuanPt - rXt);
            let xtra1 = p1 * rXt;
            if (xtra1 <= 50000) {
                giaDang = Math.round(p1);
            } else {
                let p2 = (CFix + 50000) / (1 - RSum - loiNhuanPt);
                giaDang = Math.round(p2);
            }
            if (giaDang < 0 || isNaN(giaDang) || !isFinite(giaDang)) giaDang = 0;
            laiMongMuon = Math.round(giaDang * loiNhuanPt);
            document.getElementById('tg_gia_đăng').value = formatDisplayNumber(giaDang);
            document.getElementById('tg_lai_mong_muon').value = formatDisplayNumber(laiMongMuon);
            
        } else if (source === 'gia_đăng' || source === 'phi' || source === null) {
            let xtra = Math.min(giaDang * rXt, 50000);
            let phiCoDinh = giaDang * rCd;
            let phiGiaoDich = giaDang * rGd;
            let thue = giaDang * rTh;
            let phiAds = giaDang * rAds;
            let phiAff = giaDang * rAff;
            
            laiMongMuon = giaDang - phiAds - phiAff - phiCoDinh - phiGiaoDich - xtra - thue - phiHaTang - phiPiship - giaBan;
            loiNhuanPt = giaDang > 0 ? laiMongMuon / giaDang : 0;
            
            document.getElementById('tg_lai_mong_muon').value = formatDisplayNumber(Math.round(laiMongMuon));
            document.getElementById('tg_loi_nhuan_pt').value = (loiNhuanPt * 100).toFixed(2);
        }
        
        let xtra = Math.min(giaDang * rXt, 50000);
        let phiCoDinh = Math.round(giaDang * rCd);
        let phiGiaoDich = Math.round(giaDang * rGd);
        let thue = Math.round(giaDang * rTh);
        let phiAds = Math.round(giaDang * rAds);
        let phiAff = Math.round(giaDang * rAff);
        
        document.getElementById('tg_phi_co_dinh_val').innerText = formatDisplayNumber(phiCoDinh);
        document.getElementById('tg_phi_giao_dich_val').innerText = formatDisplayNumber(phiGiaoDich);
        document.getElementById('tg_xtra_val').innerText = formatDisplayNumber(Math.round(xtra));
        document.getElementById('tg_thue_val').innerText = formatDisplayNumber(thue);
        document.getElementById('tg_phi_ads_val').innerText = formatDisplayNumber(phiAds);
        document.getElementById('tg_phi_aff_val').innerText = formatDisplayNumber(phiAff);
        
        let tongChiPhi = phiCoDinh + phiGiaoDich + Math.round(xtra) + thue + phiHaTang + phiPiship + phiAds + phiAff + giaBan;
        
        document.getElementById('tg_tong_chi_phi').innerText = formatDisplayNumber(tongChiPhi);
        document.getElementById('tg_loi_nhuan_val').innerText = formatDisplayNumber(Math.round(laiMongMuon));
        document.getElementById('tg_ty_suat_val').innerText = (loiNhuanPt * 100).toFixed(2) + '%';
        
    } finally {
        tinhGiaRecalculating = false;
    }
}

async function saveTinhGia(event) {
    event.preventDefault();
    if (currentTinhGiaRowIndex === -1 || !currentTinhGiaRow) return;
    
    const headers = getStorageHeaders('TINH_GIA');
    const newRow = [...currentTinhGiaRow];
    
    const setVal = (col, val) => {
        const idx = headers.indexOf(col);
        if (idx !== -1) newRow[idx] = val;
    };
    
    setVal('gia_đăng', getTgInputNum('tg_gia_đăng'));
    setVal('loi_nhuan%', getTgInputFloat('tg_loi_nhuan_pt') + '%');
    setVal('lai_mong_muon', getTgInputNum('tg_lai_mong_muon'));
    
    setVal('phi_ads_%', getTgInputFloat('tg_phi_ads_pt') + '%');
    setVal('phi_aff_%', getTgInputFloat('tg_phi_aff_pt') + '%');
    setVal('11%_phi_co_dinh', getTgInputFloat('tg_phi_co_dinh_pt') + '%');
    setVal('phi_co_dinh', parseMoney(document.getElementById('tg_phi_co_dinh_val').innerText));
    setVal('6%_phi_giao_dich', getTgInputFloat('tg_phi_giao_dich_pt') + '%');
    setVal('phi_giao_dich', parseMoney(document.getElementById('tg_phi_giao_dich_val').innerText));
    setVal('5.5% xtra', getTgInputFloat('tg_xtra_pt') + '%');
    setVal('xtra', parseMoney(document.getElementById('tg_xtra_val').innerText));
    setVal('1,5%_thue', getTgInputFloat('tg_thue_pt') + '%');
    setVal('thue', parseMoney(document.getElementById('tg_thue_val').innerText));
    setVal('phi_ha_tang3.000_₫', 3000);
    setVal('phi_piship', 2700);

    const sheetRow = getDataSheetRow(row);
    if (!sheetRow) {
        alert('Không xác định được dòng của sản phẩm này trên sheet TINH_GIA.');
        return;
    }

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = 'Đang lưu giá...';
    
    try {
        await writeRecordRow(newRow, sheetRow);
        closeTinhGiaForm();
        await fetchData();
        filterTable();
    } catch (err) {
        console.error(err);
        alert("Lỗi khi lưu dữ liệu tính giá: " + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}
function handleInlineTinhGiaInput(rowIndex, inputElement) {
    const tr = inputElement.closest('tr');
    const header = inputElement.dataset.header;
    const isCurrency = ['gia_đăng', 'lai_mong_muon'].includes(header);
    
    if (isCurrency) {
        let val = inputElement.value.replace(/\D/g, '');
        if (val !== '') {
            inputElement.value = formatDisplayNumber(parseInt(val, 10));
        } else {
            inputElement.value = '0';
        }
    }

    const row = filteredData[rowIndex];
    const headers = getStorageHeaders('TINH_GIA');
    const giaBan = parseMoney(row[headers.indexOf('gia_ban')] ?? '');
    
    const getTrFloat = (hdr) => {
        const el = tr.querySelector('[data-header="' + hdr + '"]');
        return el ? (parseFloat(String(el.value).replace('%', '').replace(',', '.')) || 0) : 0;
    };
    const getTrNum = (hdr) => {
        const el = tr.querySelector('[data-header="' + hdr + '"]');
        return el ? parseMoney(el.value) : 0;
    };
    
    let rAds = getTrFloat('phi_ads_%') / 100;
    let rAff = getTrFloat('phi_aff_%') / 100;
    let rCd = getTrFloat('11%_phi_co_dinh') / 100;
    let rGd = getTrFloat('6%_phi_giao_dich') / 100;
    let rXt = getTrFloat('5.5% xtra') / 100;
    let rTh = getTrFloat('1,5%_thue') / 100;
    
    const phiHaTang = 3000;
    const phiPiship = 2700;
    const CFix = phiHaTang + phiPiship + giaBan;
    const RSum = rAds + rAff + rCd + rGd + rTh;
    
    let giaDang = getTrNum('gia_đăng');
    let laiMongMuon = getTrNum('lai_mong_muon');
    let loiNhuanPt = getTrFloat('loi_nhuan%') / 100;

    let source = header;

    const setTdVal = (hdr, val) => {
        const td = tr.querySelector(`td[data-col="${hdr}"]`);
        if (td) td.innerText = formatDisplayNumber(Math.round(val));
    };

    if (source === 'lai_mong_muon') {
        let p1 = (laiMongMuon + CFix) / (1 - RSum - rXt);
        let xtra1 = p1 * rXt;
        if (xtra1 <= 50000) {
            giaDang = Math.round(p1);
        } else {
            let p2 = (laiMongMuon + CFix + 50000) / (1 - RSum);
            giaDang = Math.round(p2);
        }
        if (giaDang < 0 || isNaN(giaDang) || !isFinite(giaDang)) giaDang = 0;
        loiNhuanPt = giaDang > 0 ? laiMongMuon / giaDang : 0;
        
        tr.querySelector('[data-header="gia_đăng"]').value = formatDisplayNumber(giaDang);
        tr.querySelector('[data-header="loi_nhuan%"]').value = +(loiNhuanPt * 100).toFixed(2) + '%';
        
    } else if (source === 'loi_nhuan%') {
        let p1 = CFix / (1 - RSum - loiNhuanPt - rXt);
        let xtra1 = p1 * rXt;
        if (xtra1 <= 50000) {
            giaDang = Math.round(p1);
        } else {
            let p2 = (CFix + 50000) / (1 - RSum - loiNhuanPt);
            giaDang = Math.round(p2);
        }
        if (giaDang < 0 || isNaN(giaDang) || !isFinite(giaDang)) giaDang = 0;
        laiMongMuon = Math.round(giaDang * loiNhuanPt);
        
        tr.querySelector('[data-header="gia_đăng"]').value = formatDisplayNumber(giaDang);
        tr.querySelector('[data-header="lai_mong_muon"]').value = formatDisplayNumber(laiMongMuon);
        
    } else if (source === 'gia_đăng' || source.includes('phi_') || source.includes('xtra') || source.includes('thue')) {
        let xtra = Math.min(giaDang * rXt, 50000);
        let phiCoDinh = giaDang * rCd;
        let phiGiaoDich = giaDang * rGd;
        let thue = giaDang * rTh;
        let phiAds = giaDang * rAds;
        let phiAff = giaDang * rAff;
        
        laiMongMuon = giaDang - phiAds - phiAff - phiCoDinh - phiGiaoDich - xtra - thue - phiHaTang - phiPiship - giaBan;
        loiNhuanPt = giaDang > 0 ? laiMongMuon / giaDang : 0;
        
        tr.querySelector('[data-header="lai_mong_muon"]').value = formatDisplayNumber(Math.round(laiMongMuon));
        tr.querySelector('[data-header="loi_nhuan%"]').value = +(loiNhuanPt * 100).toFixed(2) + '%';
    }

    // Luôn luôn tính toán lại các phí để hiển thị realtime lên bảng
    let finalXtra = Math.min(giaDang * rXt, 50000);
    let finalPhiCoDinh = giaDang * rCd;
    let finalPhiGiaoDich = giaDang * rGd;
    let finalThue = giaDang * rTh;
    setTdVal('phi_co_dinh', finalPhiCoDinh);
    setTdVal('phi_giao_dich', finalPhiGiaoDich);
    setTdVal('xtra', finalXtra);
    setTdVal('thue', finalThue);

    const calcValDiv = tr.querySelector('.gia-dang-calc-val');
    if (calcValDiv) {
        if (giaDang > 0) {
            const roundedVal = Math.round(giaDang / 0.8);
            calcValDiv.style.display = 'flex';
            const span = calcValDiv.querySelector('.calc-number');
            if (span) span.innerText = formatDisplayNumber(roundedVal);
            const btn = calcValDiv.querySelector('button');
            if (btn) btn.setAttribute('onclick', `event.stopPropagation(); copyCalcValue(this, '${roundedVal}')`);
        } else {
            calcValDiv.style.display = 'none';
        }
    }
}

function copyCalcValue(btn, val) {
    if (!val) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(() => {
            const oldText = btn.innerText;
            btn.innerText = '✔';
            setTimeout(() => { btn.innerText = oldText; }, 1000);
        }).catch(err => console.error('Copy failed', err));
    } else {
        const ta = document.createElement('textarea');
        ta.value = val;
        ta.style.position = 'fixed';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            const oldText = btn.innerText;
            btn.innerText = '✔';
            setTimeout(() => { btn.innerText = oldText; }, 1000);
        } catch (e) {
            console.error('Copy failed fallback', e);
        }
        document.body.removeChild(ta);
    }
}

function copyInlineInput(btn) {
    const td = btn.closest('td');
    const input = td ? td.querySelector('input') : null;
    const val = input ? parseMoney(input.value) : 0;
    if (val) {
        copyCalcValue(btn, String(val));
    }
}

async function saveInlineTinhGia(rowIndex, btnElement) {
    const tr = btnElement.closest('tr');
    const row = filteredData[rowIndex];
    if (!row) return;

    const isBtn = btnElement && btnElement.tagName === 'BUTTON';
    if (isBtn) btnElement.innerText = 'Đang lưu...';

    const headers = getStorageHeaders('TINH_GIA');
    const newRow = [...row];
    
    const setVal = (col, val) => {
        const idx = headers.indexOf(col);
        if (idx !== -1) newRow[idx] = val;
    };

    const getTrFloat = (hdr) => {
        const el = tr.querySelector('[data-header="' + hdr + '"]');
        return el ? (parseFloat(String(el.value).replace('%', '').replace(',', '.')) || 0) : 0;
    };
    const getTrNum = (hdr) => {
        const el = tr.querySelector('[data-header="' + hdr + '"]');
        return el ? parseMoney(el.value) : 0;
    };

    let giaDang = getTrNum('gia_đăng');
    let rAds = getTrFloat('phi_ads_%') / 100;
    let rAff = getTrFloat('phi_aff_%') / 100;
    let rCd = getTrFloat('11%_phi_co_dinh') / 100;
    let rGd = getTrFloat('6%_phi_giao_dich') / 100;
    let rXt = getTrFloat('5.5% xtra') / 100;
    let rTh = getTrFloat('1,5%_thue') / 100;

    let xtra = Math.min(giaDang * rXt, 50000);
    let phiCoDinh = Math.round(giaDang * rCd);
    let phiGiaoDich = Math.round(giaDang * rGd);
    let thue = Math.round(giaDang * rTh);
    
    setVal('gia_đăng', giaDang);
    setVal('loi_nhuan%', getTrFloat('loi_nhuan%') + '%');
    setVal('lai_mong_muon', getTrNum('lai_mong_muon'));
    
    setVal('phi_ads_%', getTrFloat('phi_ads_%') + '%');
    setVal('phi_aff_%', getTrFloat('phi_aff_%') + '%');
    setVal('11%_phi_co_dinh', getTrFloat('11%_phi_co_dinh') + '%');
    setVal('phi_co_dinh', phiCoDinh);
    setVal('6%_phi_giao_dich', getTrFloat('6%_phi_giao_dich') + '%');
    setVal('phi_giao_dich', phiGiaoDich);
    setVal('5.5% xtra', getTrFloat('5.5% xtra') + '%');
    setVal('xtra', Math.round(xtra));
    setVal('1,5%_thue', getTrFloat('1,5%_thue') + '%');
    setVal('thue', thue);
    setVal('phi_ha_tang3.000_₫', 3000);
    setVal('phi_piship', 2700);

    const sheetRow = getDataSheetRow(row);
    if (!sheetRow) {
        alert('Không xác định được dòng của sản phẩm này trên sheet TINH_GIA.');
        if (isBtn) {
            btnElement.innerText = 'Lưu';
            btnElement.disabled = false;
        }
        return;
    }

    try {
        await writeRecordRow(newRow, sheetRow, 7);
        
        // Update local cache
        const allDataIdx = allData.findIndex(r => r._sheetRow === sheetRow);
        if (allDataIdx !== -1) {
            allData[allDataIdx] = newRow;
            newRow._sheetRow = sheetRow;
        }
        filteredData[rowIndex] = newRow;

        if (isBtn) {
            btnElement.innerText = '✅ Đã Lưu';
            btnElement.classList.replace('primary', 'success');
            setTimeout(() => {
                btnElement.innerText = 'Lưu';
                btnElement.classList.replace('success', 'primary');
                btnElement.disabled = false;
            }, 2000);
        }
    } catch (err) {
        console.error(err);
        alert("Lỗi khi lưu dữ liệu tính giá: " + err.message);
        if (isBtn) {
            btnElement.innerText = 'Lưu';
            btnElement.disabled = false;
        }
    }
}




function setInlineQuickGiaDang(rowIndex, btnElement) {
    const tr = btnElement.closest('tr');
    const input = tr.querySelector('[data-header="gia_đăng"]');
    const row = filteredData[rowIndex];
    const headers = getStorageHeaders('TINH_GIA');
    const giaThapNhat = parseMoney(String(row[headers.indexOf('gia_thap_nhat')] ?? ''));
    
    if (giaThapNhat > 0) {
        if (input) input.value = formatDisplayNumber(giaThapNhat);
        handleInlineTinhGiaInput(rowIndex, input);
        saveInlineTinhGia(rowIndex, tr);
    } else {
        setInlineQuickLoiNhuan(rowIndex, btnElement, 10);
    }
}

function setInlineQuickLoiNhuan(rowIndex, btnElement, pt) {
    const tr = btnElement.closest('tr');
    const input = tr.querySelector('[data-header="loi_nhuan%"]');
    if (input) {
        input.value = pt;
        handleInlineTinhGiaInput(rowIndex, input);
        saveInlineTinhGia(rowIndex, tr);
    }
}







function setInlineQuickFees(rowIndex, btnElement) {
    const tr = btnElement.closest('tr');
    const updateInput = (header, val) => {
        const input = tr.querySelector('[data-header="' + header + '"]');
        if (input) {
            input.value = val;
            handleInlineTinhGiaInput(rowIndex, input);
        }
    };
    
    updateInput('11%_phi_co_dinh', '11%');
    updateInput('6%_phi_giao_dich', '6%');
    updateInput('5.5% xtra', '5.5%');
    updateInput('1,5%_thue', '1.5%');
    
    saveInlineTinhGia(rowIndex, tr);
}

function recalculateTinhGiaRowData(sourceRow) {
    const row = [...sourceRow];
    const giaBan = parseMoney(row[4] ?? '');
    let giaDang = parseMoney(row[9] ?? '');
    
    const getRate = (idx, defaultVal) => {
        const valStr = String(row[idx] ?? defaultVal).replace('%', '').replace(',', '.').trim();
        const num = parseFloat(valStr);
        return (Number.isFinite(num) ? num : defaultVal) / 100;
    };
    
    let rAds = getRate(10, 0);
    let rAff = getRate(11, 0);
    let rCd = getRate(12, 11);
    let rGd = getRate(14, 6);
    let rXt = getRate(16, 5.5);
    let rTh = getRate(18, 1.5);
    
    const phiHaTang = 3000;
    const phiPiship = 2700;
    
    let xtra = Math.min(giaDang * rXt, 50000);
    let phiCoDinh = Math.round(giaDang * rCd);
    let phiGiaoDich = Math.round(giaDang * rGd);
    let thue = Math.round(giaDang * rTh);
    let phiAds = Math.round(giaDang * rAds);
    let phiAff = Math.round(giaDang * rAff);
    
    let laiMongMuon = giaDang - phiAds - phiAff - phiCoDinh - phiGiaoDich - xtra - thue - phiHaTang - phiPiship - giaBan;
    let loiNhuanPt = giaDang > 0 ? (laiMongMuon / giaDang) : 0;
    
    row[8] = Math.round(laiMongMuon);
    row[7] = +(loiNhuanPt * 100).toFixed(2) + '%';
    row[13] = phiCoDinh;
    row[15] = phiGiaoDich;
    row[17] = Math.round(xtra);
    row[19] = thue;
    row[20] = phiHaTang;
    row[21] = phiPiship;
    
    if (sourceRow._sheetRow) row._sheetRow = sourceRow._sheetRow;
    return row;
}

function hasTinhGiaRowChanges(before, after) {
    for (let i = 2; i <= 21; i++) {
        if (String(before[i] ?? '').trim() !== String(after[i] ?? '').trim()) {
            return true;
        }
    }
    return false;
}

async function recalculateVisibleTinhGiaRows() {
    if (currentTab !== 'TINH_GIA') return;
    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang đồng bộ từ DS_SP & tính lại công thức Tính Giá...`;
    try {
        const token = await getAccessToken();
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/DS_SP!A2:G`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Không đọc được dữ liệu từ DS_SP.');
        const dsSpData = await res.json();
        const dsSpRows = dsSpData.values || [];
        
        const spMap = new Map();
        dsSpRows.forEach(r => {
            const idCon = String(r[0] || '').trim().toUpperCase();
            const idSp = String(r[1] || '').trim().toUpperCase();
            const key = idCon ? `${idCon}::${idSp}` : idSp;
            if (key && !spMap.has(key)) spMap.set(key, r);
            if (idCon && !spMap.has(idCon)) spMap.set(idCon, r);
            if (idSp && !spMap.has(idSp)) spMap.set(idSp, r);
        });

        const existingKeys = new Set();
        const changedItems = [];
        
        allData.forEach(row => {
            const idCon = String(row[0] || '').trim().toUpperCase();
            const idSp = String(row[1] || '').trim().toUpperCase();
            if (idCon) existingKeys.add(idCon);
            if (idSp) existingKeys.add(idSp);
            if (idCon || idSp) existingKeys.add(`${idCon}::${idSp}`);
            
            const spRow = spMap.get(idCon ? `${idCon}::${idSp}` : idSp) || (idCon ? spMap.get(idCon) : null) || (idSp ? spMap.get(idSp) : null);
            const cloneRow = [...row];
            if (spRow) {
                if (String(cloneRow[2] || '').trim() !== String(spRow[2] || '').trim()) cloneRow[2] = spRow[2] ?? '';
                cloneRow[3] = parseMoney(spRow[3]);
                cloneRow[4] = parseMoney(spRow[4]);
                cloneRow[5] = parseMoney(spRow[5]);
                cloneRow[6] = parseMoney(spRow[6]);
            }
            const recalculated = recalculateTinhGiaRowData(cloneRow);
            if (hasTinhGiaRowChanges(row, recalculated)) {
                changedItems.push({ row: recalculated, sheetRow: getDataSheetRow(row) });
            }
        });

        const newRowsToAppend = [];
        dsSpRows.forEach(spRow => {
            const idCon = String(spRow[0] || '').trim().toUpperCase();
            const idSp = String(spRow[1] || '').trim().toUpperCase();
            const compositeKey = idCon ? `${idCon}::${idSp}` : idSp;
            if (!existingKeys.has(compositeKey) && !existingKeys.has(idCon || idSp)) {
                if (!idCon && !idSp) return;
                const newRow = Array(22).fill('');
                newRow[0] = spRow[0] ?? '';
                newRow[1] = spRow[1] ?? '';
                newRow[2] = spRow[2] ?? '';
                newRow[3] = parseMoney(spRow[3]);
                newRow[4] = parseMoney(spRow[4]);
                newRow[5] = parseMoney(spRow[5]);
                newRow[6] = parseMoney(spRow[6]);
                
                newRow[7] = '10%';
                newRow[8] = 0;
                const minP = parseMoney(spRow[6]);
                const sellP = parseMoney(spRow[4]);
                newRow[9] = minP > 0 ? minP : (sellP > 0 ? sellP : 0);
                newRow[10] = '0%';
                newRow[11] = '0%';
                newRow[12] = '11%';
                newRow[13] = 0;
                newRow[14] = '6%';
                newRow[15] = 0;
                newRow[16] = '5.5%';
                newRow[17] = 0;
                newRow[18] = '1.5%';
                newRow[19] = 0;
                newRow[20] = 3000;
                newRow[21] = 2700;
                
                const calculatedNewRow = recalculateTinhGiaRowData(newRow);
                newRowsToAppend.push(calculatedNewRow);
                if (idCon) existingKeys.add(idCon);
                if (idSp) existingKeys.add(idSp);
                existingKeys.add(compositeKey);
            }
        });

        if (changedItems.length > 0) {
            await batchWriteRecordRows(changedItems);
        }
        if (newRowsToAppend.length > 0) {
            await appendRecordRows(newRowsToAppend);
        }
        
        if (changedItems.length > 0 || newRowsToAppend.length > 0) {
            const range = CONFIG.tabs['TINH_GIA'].range;
            delete rangeDataCache[range];
            delete allDataCache['TINH_GIA'];
            await fetchData();
            filterTable();
            alert(`Đã cập nhật công thức cho ${changedItems.length} sản phẩm và bổ sung mới ${newRowsToAppend.length} sản phẩm từ DS_SP vào Tính Giá!`);
        }
    } catch (e) {
        console.error('Lỗi khi cập nhật module Tính Giá:', e);
        alert('Không thể cập nhật tự động Tính Giá: ' + e.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

function getRowProductId(row) {
    if (!row) return '';
    const idCon = String(row[0] ?? '').trim();
    const idSp = String(row[1] ?? '').trim();
    return (idCon || idSp).toUpperCase();
}

function toggleProductSelection(spId, checked) {
    const id = String(spId).trim().toUpperCase();
    if (!id) return;
    if (checked) {
        selectedProductIds.add(id);
    } else {
        selectedProductIds.delete(id);
        const selectAllCb = document.getElementById('selectAllProductsCb');
        if (selectAllCb) selectAllCb.checked = false;
    }
    updateProductBatchControls();
}

function toggleAllVisibleProducts(checked) {
    if (checked) {
        filteredData.forEach(row => {
            const id = getRowProductId(row);
            if (id) selectedProductIds.add(id);
        });
    } else {
        selectedProductIds.clear();
    }
    updateProductBatchControls();
    renderTable();
}

function updateProductBatchControls() {
    const panel = document.getElementById('productBatchControls');
    if (!panel) return;
    if ((currentTab === 'TINH_GIA' || currentTab === 'DS_SP') && selectedProductIds.size > 0) {
        panel.style.display = 'flex';
        const countSpan = document.getElementById('selectedProductsCount');
        if (countSpan) countSpan.innerText = `Đã chọn ${selectedProductIds.size} SP`;
        const profitContainer = document.getElementById('batchProfitContainer');
        if (profitContainer) profitContainer.style.display = currentTab === 'TINH_GIA' ? 'flex' : 'none';
    } else {
        panel.style.display = 'none';
    }
}

async function fetchSpBoSet(force = false) {
    if (spBoSetCache && !force) return spBoSetCache;
    try {
        const token = await getAccessToken();
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/SP_BO!A2:C`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            spBoSetCache = new Set();
            return spBoSetCache;
        }
        const data = await res.json();
        const rows = data.values || [];
        spBoSetCache = new Set();
        rows.forEach(r => {
            const idCon = String(r[0] || '').trim().toUpperCase();
            const idSp = String(r[1] || '').trim().toUpperCase();
            if (idCon) spBoSetCache.add(idCon);
            else if (idSp) spBoSetCache.add(idSp);
        });
        return spBoSetCache;
    } catch (e) {
        console.warn('Không đọc được SP_BO:', e);
        spBoSetCache = new Set();
        return spBoSetCache;
    }
}

async function ensureSpBoSheetExists() {
    try {
        await getSheetIdByTitle('SP_BO');
    } catch (e) {
        const token = await getAccessToken();
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{ addSheet: { properties: { title: 'SP_BO' } } }]
            })
        });
        if (res.ok) {
            sheetTitleToIdCache = null;
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/SP_BO!A1:C1?valueInputOption=RAW`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ values: [['id_sp_con', 'id_sp', 'ten_sp']] })
            });
        } else {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error?.message || 'Không thể tạo sheet SP_BO.');
        }
    }
}

async function appendRowsToSheet(sheetTitle, rows) {
    if (!rows.length) return;
    const token = await getAccessToken();
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${sheetTitle}!A2:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: rows })
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Thêm dòng vào sheet '${sheetTitle}' thất bại.`);
    }
}

function recalculateTinhGiaRowByProfitRate(sourceRow, targetProfitRateNum) {
    const row = [...sourceRow];
    const giaBan = parseMoney(row[4] ?? '');
    
    const getRate = (idx, defaultVal) => {
        const valStr = String(row[idx] ?? defaultVal).replace('%', '').replace(',', '.').trim();
        const num = parseFloat(valStr);
        return (Number.isFinite(num) ? num : defaultVal) / 100;
    };
    
    let rAds = getRate(10, 0);
    let rAff = getRate(11, 0);
    let rCd = getRate(12, 11);
    let rGd = getRate(14, 6);
    let rXt = getRate(16, 5.5);
    let rTh = getRate(18, 1.5);
    
    const phiHaTang = 3000;
    const phiPiship = 2700;
    const CFix = phiHaTang + phiPiship + giaBan;
    const RSum = rAds + rAff + rCd + rGd + rTh;
    const loiNhuanPt = targetProfitRateNum;
    
    let p1 = CFix / (1 - RSum - loiNhuanPt - rXt);
    let xtra1 = p1 * rXt;
    let giaDang = 0;
    if (xtra1 <= 50000) {
        giaDang = Math.round(p1);
    } else {
        let p2 = (CFix + 50000) / (1 - RSum - loiNhuanPt);
        giaDang = Math.round(p2);
    }
    if (giaDang < 0 || isNaN(giaDang) || !isFinite(giaDang)) giaDang = 0;
    
    row[9] = giaDang;
    row[7] = +(loiNhuanPt * 100).toFixed(2) + '%';
    
    return recalculateTinhGiaRowData(row);
}

async function batchUpdateTinhGiaProfit() {
    if (currentTab !== 'TINH_GIA' || selectedProductIds.size === 0) return;
    const inputEl = document.getElementById('batchProfitInput');
    const valStr = inputEl ? String(inputEl.value).trim() : '';
    if (!valStr) {
        alert('Vui lòng nhập tỷ lệ Lợi nhuận mong muốn (%) cần cập nhật (VD: 15 hoặc 15%)');
        if (inputEl) inputEl.focus();
        return;
    }
    const targetPt = parseFloat(valStr.replace('%', '').replace(',', '.'));
    if (isNaN(targetPt) || targetPt < 0 || targetPt >= 100) {
        alert('Tỷ lệ lợi nhuận không hợp lệ. Vui lòng nhập số từ 0 đến 99 (VD: 15)');
        return;
    }
    const rateNum = targetPt / 100;
    
    const itemsToUpdate = [];
    allData.forEach(row => {
        const prodId = getRowProductId(row);
        if (selectedProductIds.has(prodId)) {
            const newRow = recalculateTinhGiaRowByProfitRate(row, rateNum);
            itemsToUpdate.push({ row: newRow, sheetRow: getDataSheetRow(row) });
        }
    });
    
    if (itemsToUpdate.length === 0) {
        alert('Không tìm thấy dòng dữ liệu nào phù hợp với danh sách đã chọn.');
        return;
    }
    
    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang cập nhật lợi nhuận cho ${itemsToUpdate.length} sản phẩm...`;
    
    try {
        await batchWriteRecordRows(itemsToUpdate);
        
        itemsToUpdate.forEach(item => {
            const idx = allData.findIndex(r => r._sheetRow === item.sheetRow);
            if (idx !== -1) {
                allData[idx] = item.row;
                item.row._sheetRow = item.sheetRow;
            }
        });
        
        selectedProductIds.clear();
        const selectAllCb = document.getElementById('selectAllProductsCb');
        if (selectAllCb) selectAllCb.checked = false;
        updateProductBatchControls();
        
        filterTable();
        alert(`Đã cập nhật thành công tỷ lệ lợi nhuận ${targetPt}% cho ${itemsToUpdate.length} sản phẩm!`);
    } catch (err) {
        console.error('Lỗi khi cập nhật lợi nhuận hàng loạt:', err);
        alert('Không thể cập nhật hàng loạt: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function copySelectedToSpBo() {
    if (selectedProductIds.size === 0) return;
    if (!confirm(`Bạn có chắc chắn muốn chuyển ${selectedProductIds.size} sản phẩm đã chọn sang sheet SP_BO và ẩn khỏi hệ thống web không?`)) {
        return;
    }
    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang sao chép sang SP_BO & ẩn sản phẩm...`;
    
    try {
        await ensureSpBoSheetExists();
        await fetchSpBoSet(true);
        
        const rowsToAppend = [];
        
        allData.forEach(row => {
            const prodId = getRowProductId(row);
            if (selectedProductIds.has(prodId)) {
                const idCon = String(row[0] ?? '').trim();
                const idSp = String(row[1] ?? '').trim();
                const tenSp = String(row[2] ?? '').trim();
                const checkKey = (idCon || idSp).toUpperCase();
                if (checkKey && !spBoSetCache.has(checkKey)) {
                    rowsToAppend.push([idCon, idSp, tenSp]);
                    spBoSetCache.add(checkKey);
                }
            }
        });
        
        if (rowsToAppend.length > 0) {
            await appendRowsToSheet('SP_BO', rowsToAppend);
        }
        
        const count = selectedProductIds.size;
        selectedProductIds.clear();
        const selectAllCb = document.getElementById('selectAllProductsCb');
        if (selectAllCb) selectAllCb.checked = false;
        updateProductBatchControls();
        
        filterTable();
        alert(`Đã hoàn tất chuyển ${count} sản phẩm sang sheet SP_BO. Các sản phẩm này đã được ẩn khỏi danh sách web!`);
    } catch (err) {
        console.error('Lỗi khi copy sang SP_BO:', err);
        alert('Không thể chuyển sản phẩm sang SP_BO: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function batchUpdateGiaDangToMin() {
    if (currentTab !== 'TINH_GIA') return;

    const headers = getStorageHeaders('TINH_GIA');
    const minPriceColIdx = headers.indexOf('gia_thap_nhat');
    const listPriceColIdx = headers.indexOf('gia_dang');

    const targetRows = [];
    if (selectedProductIds.size > 0) {
        allData.forEach(row => {
            const prodId = getRowProductId(row);
            if (selectedProductIds.has(prodId)) {
                targetRows.push(row);
            }
        });
    } else {
        targetRows.push(...filteredData);
    }

    if (targetRows.length === 0) {
        alert('Không có sản phẩm nào trong danh sách để cập nhật.');
        return;
    }

    const itemsToUpdate = [];
    let minCount = 0;
    let tenPercentCount = 0;

    targetRows.forEach(row => {
        const giaThapNhat = parseMoney(String(row[minPriceColIdx !== -1 ? minPriceColIdx : 6] ?? ''));
        if (giaThapNhat > 0) {
            const newRow = [...row];
            newRow[listPriceColIdx !== -1 ? listPriceColIdx : 9] = giaThapNhat;
            if (row._sheetRow) newRow._sheetRow = row._sheetRow;
            const calculatedRow = recalculateTinhGiaRowData(newRow);
            itemsToUpdate.push({ row: calculatedRow, sheetRow: getDataSheetRow(row) });
            minCount++;
        } else {
            const calculatedRow = recalculateTinhGiaRowByProfitRate(row, 0.10);
            if (row._sheetRow) calculatedRow._sheetRow = row._sheetRow;
            itemsToUpdate.push({ row: calculatedRow, sheetRow: getDataSheetRow(row) });
            tenPercentCount++;
        }
    });

    const scopeText = selectedProductIds.size > 0 
        ? `${selectedProductIds.size} sản phẩm đã chọn` 
        : `tất cả ${targetRows.length} sản phẩm đang hiển thị`;
    
    let msg = `Bạn có chắc muốn tính lại và cập nhật Giá đăng cho ${scopeText}?\n\n` +
        `• ${minCount} SP có Giá thấp nhất (> 0) ➔ Giá đăng = Giá thấp nhất\n` +
        `• ${tenPercentCount} SP chưa có Giá thấp nhất (= 0) ➔ Điền Lợi nhuận = 10% để tính Giá đăng`;

    if (!confirm(msg)) return;

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = `Đang tính toán & đồng bộ Giá đăng cho ${itemsToUpdate.length} sản phẩm...`;

    try {
        await batchWriteRecordRows(itemsToUpdate);

        itemsToUpdate.forEach(item => {
            const idx = allData.findIndex(r => r._sheetRow === item.sheetRow);
            if (idx !== -1) {
                allData[idx] = item.row;
                item.row._sheetRow = item.sheetRow;
            }
        });

        selectedProductIds.clear();
        const selectAllCb = document.getElementById('selectAllProductsCb');
        if (selectAllCb) selectAllCb.checked = false;
        updateProductBatchControls();

        filterTable();
        alert(`Đã cập nhật thành công Giá đăng cho ${itemsToUpdate.length} sản phẩm!\n- ${minCount} SP bằng Giá thấp nhất\n- ${tenPercentCount} SP tính theo Lợi nhuận 10%`);
    } catch (err) {
        console.error('Lỗi khi cập nhật Giá đăng = Giá thấp nhất / Lợi nhuận 10%:', err);
        alert('Không thể cập nhật: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
//  IMAGE SEARCH & DIRECT URL MODULE (DS_SP – Column K: anh)
// -----------------------------------------------------------------------------

let _imgSearchRowIndex = null;
let _imgSearchSelectedUrl = null;

function openImageSearch(rowIndex) {
    _imgSearchRowIndex = rowIndex;
    _imgSearchSelectedUrl = null;
    const row = filteredData[rowIndex];
    const tabConfig = CONFIG.tabs[currentTab];
    const imgColIndex = tabConfig?.imgCol ?? 10;
    const tenSpIndex = currentTab === 'WEB_SP' ? 4 : 2;
    const tenSp = row ? String(row[tenSpIndex] || '').trim() : '';
    const currentImgUrl = row ? String(row[imgColIndex] || '').trim() : '';

    const queryInput = document.getElementById('imgSearchQuery');
    const directInput = document.getElementById('imgDirectUrlInput');

    if (queryInput) queryInput.value = tenSp;
    if (directInput) directInput.value = currentImgUrl;

    document.getElementById('imgSearchResults').innerHTML = document.getElementById('imgSearchPlaceholder').outerHTML;
    document.getElementById('imgSearchFooter').style.display = 'none';
    document.getElementById('imgSearchSubtitle').textContent = tenSp ? `Sản phẩm: "${tenSp}"` : 'Thêm / Tìm ảnh';

    if (currentImgUrl) {
        onDirectUrlInput(currentImgUrl);
    }

    const modal = document.getElementById('imgSearchModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Auto search images when opening popup if product name exists
    if (tenSp) {
        setTimeout(searchProductImages, 150);
    }
}

function closeImgSearch() {
    document.getElementById('imgSearchModal').style.display = 'none';
    document.body.style.overflow = '';
    _imgSearchRowIndex = null;
    _imgSearchSelectedUrl = null;
}

function openBingImageTab() {
    const query = (document.getElementById('imgSearchQuery')?.value || '').trim();
    if (!query) { alert('Vui lòng nhập tên sản phẩm.'); return; }
    const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&qs=n&form=QBIR`;
    window.open(url, '_blank');
}

function openGoogleImageTab() {
    const query = (document.getElementById('imgSearchQuery')?.value || '').trim();
    if (!query) { alert('Vui lòng nhập tên sản phẩm.'); return; }
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
}

function onDirectUrlInput(url) {
    const cleanUrl = String(url || '').trim();
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        _imgSearchSelectedUrl = cleanUrl;
        const footer = document.getElementById('imgSearchFooter');
        const preview = document.getElementById('imgSearchPreview');
        const urlEl = document.getElementById('imgSearchPreviewUrl');
        if (preview) preview.src = cleanUrl;
        if (urlEl) urlEl.textContent = cleanUrl;
        if (footer) footer.style.display = 'flex';
    }
}

async function saveDirectImage() {
    const urlInput = document.getElementById('imgDirectUrlInput');
    const url = (urlInput?.value || '').trim();
    if (!url) { alert('Vui lòng dán đường dẫn hình ảnh (URL).'); return; }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://');
        return;
    }
    _imgSearchSelectedUrl = url;
    await saveSelectedImage();
}

async function searchProductImages() {
    const query = (document.getElementById('imgSearchQuery')?.value || '').trim();
    if (!query) { alert('Vui lòng nhập tên sản phẩm để tìm kiếm'); return; }
    const btn = document.getElementById('imgSearchBtn');
    const resultsEl = document.getElementById('imgSearchResults');

    btn.disabled = true;
    btn.textContent = '⏳ Đang tìm...';
    resultsEl.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#9ca3af;"><div style="font-size:32px;margin-bottom:12px;">⏳</div><div style="font-size:14px;">Đang tìm kiếm danh sách ảnh sản phẩm từ Bing Images...</div></div>';

    try {
        let items = [];

        // 1. Local Server Bing API Proxy (Super fast, no CORS block!)
        try {
            const localRes = await fetch('/api/bing-images?q=' + encodeURIComponent(query));
            if (localRes.ok) {
                const localData = await localRes.json();
                if (localData.items && localData.items.length > 0) {
                    items = localData.items;
                }
            }
        } catch (_) {}

        // 2. Public CORS proxy fallback
        if (items.length === 0) {
            const bingTarget = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query);
            let html = '';
            
            try {
                const r = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(bingTarget));
                const j = await r.json();
                html = j.contents || '';
            } catch (_) {}

            if (!html || html.length < 500) {
                try {
                    const r = await fetch('https://corsproxy.io/?' + encodeURIComponent(bingTarget));
                    html = await r.text();
                } catch (_) {}
            }

            const murlMatches = [...html.matchAll(/murl&quot;:&quot;(https?:[^&]+)&quot;/g)].map(m => m[1]);
            const titleMatches = [...html.matchAll(/t1&quot;:&quot;([^&]+)&quot;/g)].map(m => m[1]);

            murlMatches.forEach((u, idx) => {
                const cleanUrl = u.replace(/\\/g, '');
                if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
                    items.push({
                        link: cleanUrl,
                        thumbnail: cleanUrl,
                        title: titleMatches[idx] ? titleMatches[idx].replace(/&#(\d+);/g, (m, dec) => String.fromCharCode(dec)) : query
                    });
                }
            });
        }

        document.getElementById('imgSearchSubtitle').textContent = `Tìm thấy ${items.length} ảnh cho "${query}"`;

        if (items.length === 0) {
            resultsEl.innerHTML = '<div style="text-align:center;padding:50px 20px;color:#9ca3af;"><div style="font-size:48px;margin-bottom:12px;">🖼️</div><div style="font-size:15px;font-weight:500;">Không tìm thấy danh sách ảnh tự động</div><div style="font-size:13px;margin-top:8px;">Anh hãy bấm nút <strong>"🔎 Mở Bing Images"</strong> hoặc <strong>"🌐 Mở Google Images"</strong> để chọn & copy link ảnh trực tiếp!</div></div>';
            return;
        }

        let gridHtml = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;">';
        items.forEach((item, i) => {
            const imgUrl = item.link || '';
            const thumb = item.thumbnail || imgUrl;
            const title = escapeHtml(item.title || '');
            gridHtml += `<div id="imgCard${i}" onclick="selectImage('${escapeHtml(escapeJsString(imgUrl))}', ${i})"
                style="border:2px solid #e5e7eb;border-radius:10px;cursor:pointer;overflow:hidden;transition:.2s;background:#fff;"
                onmouseover="if(!this.classList.contains('img-selected')){this.style.borderColor='#4f46e5';this.style.transform='scale(1.02)'}"
                onmouseout="if(!this.classList.contains('img-selected')){this.style.borderColor='#e5e7eb';this.style.transform=''}">
                <div style="width:100%;height:130px;overflow:hidden;background:#f1f5f9;">
                    <img src="${escapeHtml(thumb)}" alt="${title}" style="width:100%;height:100%;object-fit:cover;"
                        onerror="this.style.display='none';this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-size:24px;\\'>🖼️</div>'">
                </div>
                <div style="padding:6px 8px;">
                    <div style="font-size:11px;color:#334155;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${title}">${title}</div>
                </div>
            </div>`;
        });
        gridHtml += '</div>';
        resultsEl.innerHTML = gridHtml;
    } catch (err) {
        console.error('Image search error:', err);
        resultsEl.innerHTML = `<div style="text-align:center;padding:40px 20px;color:#ef4444;"><div style="font-size:40px;margin-bottom:12px;">⚠️</div><div style="font-size:14px;font-weight:600;">Lỗi khi tìm ảnh: ${escapeHtml(String(err.message||err))}</div></div>`;
    } finally {
        btn.disabled = false;
        btn.textContent = '🔍 Tìm Tự Động';
    }
}

function selectImage(imgUrl, cardIndex) {
    _imgSearchSelectedUrl = imgUrl;
    const directInput = document.getElementById('imgDirectUrlInput');
    if (directInput) directInput.value = imgUrl;

    document.querySelectorAll('[id^="imgCard"]').forEach(el => {
        el.classList.remove('img-selected');
        el.style.borderColor = '#e5e7eb';
        el.style.transform = '';
        el.style.boxShadow = '';
    });
    const card = document.getElementById(`imgCard${cardIndex}`);
    if (card) {
        card.classList.add('img-selected');
        card.style.borderColor = '#4f46e5';
        card.style.boxShadow = '0 0 0 3px rgba(79,70,229,.3)';
    }
    const footer = document.getElementById('imgSearchFooter');
    const preview = document.getElementById('imgSearchPreview');
    const urlEl = document.getElementById('imgSearchPreviewUrl');
    if (preview) preview.src = imgUrl;
    if (urlEl) urlEl.textContent = imgUrl;
    if (footer) footer.style.display = 'flex';
}

async function saveSelectedImage() {
    if (!_imgSearchSelectedUrl) { alert('Vui lòng chọn hoặc dán link một ảnh trước.'); return; }
    
    // If targeted from a form field input
    if (_activeImageTargetInputId) {
        const inputEl = document.getElementById(_activeImageTargetInputId);
        if (inputEl) {
            const currentVal = String(inputEl.value || '').trim();
            if (currentVal && !currentVal.includes(_imgSearchSelectedUrl)) {
                inputEl.value = currentVal + ' | ' + _imgSearchSelectedUrl;
            } else {
                inputEl.value = _imgSearchSelectedUrl;
            }
            updateFormImgGallery(_activeImageTargetInputId);
        }
        _activeImageTargetInputId = null;
        closeImgSearch();
        return;
    }

    if (_imgSearchRowIndex === null) return;
    const row = filteredData[_imgSearchRowIndex];
    if (!row) { alert('Không tìm thấy dòng sản phẩm.'); return; }
    const tabConfig = CONFIG.tabs[currentTab];
    const imgColIndex = tabConfig?.imgCol ?? 10;

    const existingVal = String(row[imgColIndex] || '').trim();
    let newVal = _imgSearchSelectedUrl;
    if (existingVal && !existingVal.includes(_imgSearchSelectedUrl)) {
        newVal = existingVal + ' | ' + _imgSearchSelectedUrl;
    }
    row[imgColIndex] = newVal;

    const sheetRow = getDataSheetRow(row);
    if (!sheetRow || sheetRow < 2) { alert('Không xác định được hàng trong sheet. Vui lòng load lại dữ liệu và thử lại.'); return; }
    const colLetter = String.fromCharCode(65 + imgColIndex);
    const targetRange = `${currentTab}!${colLetter}${sheetRow}`;
    try {
        const token = await getAccessToken();
        const res = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/${encodeURIComponent(targetRange)}?valueInputOption=RAW`,
            { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ values: [[newVal]] }) }
        );
        if (!res.ok) throw new Error(await res.text());
        filterTable();
        closeImgSearch();
        alert(`✅ Đã lưu link ảnh vào Cột ${colLetter} (${tabConfig?.headers[imgColIndex] || 'anh'}) của Google Sheet thành công!`);
    } catch (err) {
        alert('Lỗi khi lưu ảnh vào Google Sheet: ' + err.message);
    }
}


const CUSTOM_BUTTONS_KEY = 'bce_custom_copy_buttons';

function getSavedCustomButtons() {
    try {
        const raw = localStorage.getItem(CUSTOM_BUTTONS_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (_) {}
    return ['GDD'];
}

function saveCustomButtonsList(btnList) {
    localStorage.setItem(CUSTOM_BUTTONS_KEY, JSON.stringify(btnList));
    renderCustomButtonsManager();
    renderTable();
}

function addCustomCopyButton() {
    const input1 = document.getElementById('quickCustomButtonInput');
    const input2 = document.getElementById('newCustomButtonInput');
    
    const val1 = String(input1?.value || '').trim();
    const val2 = String(input2?.value || '').trim();
    const raw = (val1 + ' ' + val2).trim();
    if (!raw) return;

    const newItems = raw.split(/[,;|\n]+/).map(s => s.trim().replace(/^-+|-+$/g, '')).filter(Boolean);
    if (!newItems.length) return;

    const list = getSavedCustomButtons();
    let addedCount = 0;
    newItems.forEach(val => {
        if (!list.includes(val)) {
            list.push(val);
            addedCount++;
        }
    });
    
    if (addedCount > 0) {
        saveCustomButtonsList(list);
    }

    if (input1) input1.value = '';
    if (input2) input2.value = '';
}

function removeCustomCopyButton(btnText) {
    let list = getSavedCustomButtons();
    list = list.filter(b => b !== btnText);
    saveCustomButtonsList(list);
}

function renderCustomButtonsManager() {
    const list = getSavedCustomButtons();
    const tagHtml = list.map(btnText => `
        <span class="custom-btn-tag" style="display:inline-flex; align-items:center; gap:4px; padding:3px 8px; background:#e0e7ff; color:#4338ca; border:1px solid #c7d2fe; border-radius:14px; font-size:12px; font-weight:700;">
            ${escapeHtml(btnText)}
            <button type="button" onclick="removeCustomCopyButton('${escapeJsString(btnText)}')" style="background:none; border:none; color:#ef4444; font-size:12px; font-weight:900; cursor:pointer; padding:0 2px; line-height:1;" title="Xóa nút này">✕</button>
        </span>
    `).join('');

    const container1 = document.getElementById('customButtonsList');
    if (container1) container1.innerHTML = tagHtml;
    const container2 = document.getElementById('quickCustomButtonsList');
    if (container2) container2.innerHTML = tagHtml;
}

function formatCustomCopyText(idSpCon, btnText, tenSp) {
    let cleanId = String(idSpCon || '').trim().replace(/-+$/, '');
    let cleanBtn = String(btnText || '').trim().replace(/^-+|-+$/g, '');
    let cleanName = String(tenSp || '').trim().replace(/^-+/, '');

    let parts = [cleanId];
    if (cleanBtn) parts.push(cleanBtn);
    parts.push('00-001');
    if (cleanName) parts.push(cleanName);

    return parts.join('-');
}

function showToastNotification(msg) {
    let toast = document.getElementById('bceToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'bceToast';
        toast.className = 'bce-toast-notification';
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    
    if (window._toastTimeout) clearTimeout(window._toastTimeout);
    window._toastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
    }, 3000);
}

function executeCustomCopy(idSpCon, btnText, tenSp, btnEl) {
    const textToCopy = formatCustomCopyText(idSpCon, btnText, tenSp);
    const showSuccess = () => {
        showToastNotification('📋 Đã copy: ' + textToCopy);
        if (btnEl) {
            const origHtml = btnEl.innerHTML;
            btnEl.innerHTML = '✅ ' + escapeHtml(btnText);
            btnEl.style.background = '#86efac';
            btnEl.style.borderColor = '#22c55e';
            btnEl.style.color = '#14532d';
            setTimeout(() => {
                btnEl.innerHTML = origHtml;
                btnEl.style.background = '#e0e7ff';
                btnEl.style.borderColor = '#c7d2fe';
                btnEl.style.color = '#3730a3';
            }, 1000);
        }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(showSuccess).catch(() => {
            fallbackCopyText(textToCopy);
            showSuccess();
        });
    } else {
        fallbackCopyText(textToCopy);
        showSuccess();
    }
}

function fallbackCopyText(textToCopy) {
    const input = document.createElement('textarea');
    input.value = textToCopy;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToastNotification('📋 Đã copy: ' + textToCopy);
}


let editingDhRows = [];

function getDhSummaryRows(rawRows) {
    if (!Array.isArray(rawRows)) return [];
    const orderMap = new Map();
    rawRows.forEach(row => {
        const mdh = String(row[3] || '').trim();
        if (!mdh) return;
        if (!orderMap.has(mdh)) {
            const masterRow = [...row];
            masterRow._itemsCount = 1;
            orderMap.set(mdh, masterRow);
        } else {
            const masterRow = orderMap.get(mdh);
            masterRow._itemsCount = (masterRow._itemsCount || 1) + 1;
        }
    });
    return Array.from(orderMap.values());
}

function openDhDetail(mdh) {
    const cleanMdh = String(mdh || '').trim();
    if (!cleanMdh) return;

    editingDhRows = allData.filter(r => String(r[3] || '').trim() === cleanMdh && r._sheetRow);
    if (!editingDhRows.length) {
        alert('Không tìm thấy dữ liệu chi tiết cho đơn hàng ' + cleanMdh);
        return;
    }

    const firstRow = editingDhRows[0];
    document.getElementById('dhDetailTitle').innerText = 'Chi Tiết Đơn Hàng DH: ' + cleanMdh;
    document.getElementById('dhDetailItemsCount').innerText = editingDhRows.length;

    const generalHeaders = ['gian', 'ngay', 'ngay_gio', 'mdh', 'mvd', 'ten_khach', 'ng_nhan', 'dia_chi', 'link_don', 'tinh_trang', 'trang_thai'];
    const financeHeaders = ['tong_tien', 'ma_giam_gia', 'phi_vc', 'phu_phi', 'thue', 'doanh_thu', 'phi_khac', 'tien_sp', 'loi_nhuan'];
    const dhConfig = CONFIG.tabs['DH'];

    const renderInputRow = (hdr, isFinance = false) => {
        const idx = dhConfig.headers.indexOf(hdr);
        const val = firstRow[idx] ?? '';
        if (hdr === 'tinh_trang') {
            return `<div style="display:flex; align-items:center; justify-content:space-between; gap:10px; width:100%;">
                <span style="font-size:12px; font-weight:700; color:#334155; min-width:105px; text-transform:uppercase; white-space:nowrap;">tinh_trang</span>
                <input data-dh-hdr="tinh_trang" type="hidden" value="${escapeHtml(String(val))}">
                <div id="dhDetailTinhTrangButtons" style="display:flex; align-items:center; gap:6px; flex:1; flex-wrap:wrap;">
                    <button type="button" class="dh-status-btn" data-val="HỦY" onclick="setDhDetailTinhTrang('HỦY', this)" style="padding:5px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid #cbd5e1; transition:all 0.15s;">HỦY</button>
                    <button type="button" class="dh-status-btn" data-val="HOÀN" onclick="setDhDetailTinhTrang('HOÀN', this)" style="padding:5px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid #cbd5e1; transition:all 0.15s;">HOÀN</button>
                    <button type="button" class="dh-status-btn" data-val="TRẢ" onclick="setDhDetailTinhTrang('TRẢ', this)" style="padding:5px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid #cbd5e1; transition:all 0.15s;">TRẢ</button>
                    <button type="button" class="dh-status-btn" data-val="XONG" onclick="setDhDetailTinhTrang('XONG', this)" style="padding:5px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid #cbd5e1; transition:all 0.15s;">XONG</button>
                </div>
            </div>`;
        }
        if (hdr === 'trang_thai') {
            return `<div style="display:flex; align-items:center; justify-content:space-between; gap:10px; width:100%;">
                <span style="font-size:12px; font-weight:700; color:#334155; min-width:105px; text-transform:uppercase; white-space:nowrap;">trang_thai</span>
                <input data-dh-hdr="trang_thai" type="hidden" value="${escapeHtml(String(val))}">
                <div id="dhDetailTrangThaiButtons" style="display:flex; align-items:center; gap:6px; flex:1; flex-wrap:wrap;">
                    <button type="button" class="dh-trangthai-btn" data-val="HỦY" onclick="setDhDetailTrangThai('HỦY', this)" style="padding:5px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid #cbd5e1; transition:all 0.15s;">HỦY</button>
                    <button type="button" class="dh-trangthai-btn" data-val="HOÀN TRẢ" onclick="setDhDetailTrangThai('HOÀN TRẢ', this)" style="padding:5px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid #cbd5e1; transition:all 0.15s;">HOÀN TRẢ</button>
                    <button type="button" class="dh-trangthai-btn" data-val="HOÀN THÀNH" onclick="setDhDetailTrangThai('HOÀN THÀNH', this)" style="padding:5px 12px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid #cbd5e1; transition:all 0.15s;">HOÀN THÀNH</button>
                </div>
            </div>`;
        }
        const isNumeric = dhConfig.priceCols.includes(idx);
        const displayVal = isNumeric ? formatDisplayNumber(val) : val;
        const isReadOnly = ['mdh', 'doanh_thu', 'loi_nhuan', 'tien_sp'].includes(hdr);
        const onInputAttr = isFinance && !isReadOnly ? 'oninput="recalculateDhFinancials()"' : '';
        const isLoiNhuan = hdr === 'loi_nhuan';
        const alignRight = isFinance || isNumeric;
        return `<div style="display:flex; align-items:center; justify-content:space-between; gap:10px; width:100%;">
            <span style="font-size:12px; font-weight:700; color:${isLoiNhuan ? '#15803d' : '#334155'}; min-width:105px; text-transform:uppercase; white-space:nowrap;">${hdr}</span>
            <input data-dh-hdr="${hdr}" type="text" value="${escapeHtml(String(displayVal))}" ${isReadOnly ? 'readonly' : ''} ${onInputAttr} style="flex:1; min-width:0; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-weight:700; font-size:13px; text-align:${alignRight ? 'right' : 'left'}; color:${isLoiNhuan ? '#16a34a' : '#0f172a'}; ${isReadOnly ? 'background:#f1f5f9; cursor:not-allowed;' : ''}">
        </div>`;
    };

    const fieldsHtml = `
        <div style="background:#f8fafc; padding:16px; border:1px solid #cbd5e1; border-radius:10px; display:flex; flex-direction:column; gap:10px; width:100%;">
            <div style="font-weight:700; color:#1e293b; border-bottom:2px solid #cbd5e1; padding-bottom:6px; font-size:0.95rem;">📌 THÔNG TIN ĐƠN HÀNG</div>
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${generalHeaders.map(hdr => renderInputRow(hdr, false)).join('')}
            </div>
        </div>
        <div style="background:#f0fdf4; padding:16px; border:1px solid #bbf7d0; border-radius:10px; display:flex; flex-direction:column; gap:10px; width:100%;">
            <div style="font-weight:700; color:#15803d; border-bottom:2px solid #86efac; padding-bottom:6px; font-size:0.95rem;">💰 THÔNG TIN TÀI CHÍNH</div>
            <div style="display:flex; flex-direction:column; gap:10px;">
                ${financeHeaders.map(hdr => renderInputRow(hdr, true)).join('')}
            </div>
        </div>
    `;
    document.getElementById('dhDetailFields').innerHTML = fieldsHtml;

    const tinhTrangVal = firstRow[dhConfig.headers.indexOf('tinh_trang')] || 'XONG';
    const trangThaiVal = firstRow[dhConfig.headers.indexOf('trang_thai')] || 'HOÀN THÀNH';

    updateDhDetailStatusButtonStyles('tinh_trang', tinhTrangVal);
    updateDhDetailStatusButtonStyles('trang_thai', trangThaiVal);

    // Render items
    const slgIdx = dhConfig.headers.indexOf('slg');
    const donGiaIdx = dhConfig.headers.indexOf('don_gia');
    const skuIdx = dhConfig.headers.indexOf('sku');
    const idSpIdx = dhConfig.headers.indexOf('id_sp');

    const itemsHtml = editingDhRows.map((r, i) => {
        const slgRaw = String(r[slgIdx] ?? '').trim();
        const slg = slgRaw === '' ? 0 : (parseInt(slgRaw) >= 0 ? parseInt(slgRaw) : 0);
        const donGia = parseMoney(r[donGiaIdx] || 0);
        const subtotal = slg * donGia;
        return `
        <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:8px 14px; text-align:left; font-weight:600;">${i + 1}</td>
            <td style="padding:8px 14px;"><input data-dh-item-idx="${i}" data-dh-item-hdr="sku" type="text" value="${escapeHtml(String(r[skuIdx] ?? ''))}" style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-weight:600;"></td>
            <td style="padding:8px 14px;"><input data-dh-item-idx="${i}" data-dh-item-hdr="id_sp" type="text" value="${escapeHtml(String(r[idSpIdx] ?? ''))}" style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-weight:600;"></td>
            <td style="padding:8px 14px; text-align:center;"><input data-dh-item-idx="${i}" data-dh-item-hdr="slg" type="number" min="0" value="${escapeHtml(String(slg))}" style="width:65px; text-align:center; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-weight:600;" oninput="updateDhItemSubtotal(${i})"></td>
            <td style="padding:8px 14px; text-align:right;"><input data-dh-item-idx="${i}" data-dh-item-hdr="don_gia" type="text" value="${escapeHtml(String(formatDisplayNumber(donGia)))}" style="width:120px; text-align:right; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-weight:600;" oninput="updateDhItemSubtotal(${i})"></td>
            <td style="padding:8px 14px; text-align:right; font-weight:700; color:#0f172a;"><span id="dhSubtotal_${i}">${formatDisplayNumber(subtotal)}</span></td>
        </tr>
    `;
    }).join('');
    document.getElementById('dhDetailItemsBody').innerHTML = itemsHtml;

    recalculateDhFinancials();

    const modal = document.getElementById('dhDetailModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function setDhDetailTinhTrang(val, btnElement) {
    const hiddenInput = document.querySelector('[data-dh-hdr="tinh_trang"]');
    if (hiddenInput) hiddenInput.value = val;

    updateDhDetailStatusButtonStyles('tinh_trang', val);

    if (val === 'HỦY') {
        setDhDetailTrangThai('HỦY');
    } else if (val === 'HOÀN' || val === 'TRẢ') {
        setDhDetailTrangThai('HOÀN TRẢ');
    } else if (val === 'XONG' || val === 'HOÀN THÀNH') {
        setDhDetailTrangThai('HOÀN THÀNH');
    }

    recalculateDhFinancials();
}

function setDhDetailTrangThai(val, btnElement) {
    const hiddenInput = document.querySelector('[data-dh-hdr="trang_thai"]');
    if (hiddenInput) hiddenInput.value = val;

    updateDhDetailStatusButtonStyles('trang_thai', val);
}

function updateDhDetailStatusButtonStyles(hdr, selectedVal) {
    const selector = hdr === 'tinh_trang' ? '#dhDetailTinhTrangButtons button' : '#dhDetailTrangThaiButtons button';
    const normSelected = String(selectedVal || '').trim().toUpperCase();

    document.querySelectorAll(selector).forEach(btn => {
        const btnVal = String(btn.dataset.val || '').trim().toUpperCase();
        const isMatch = (btnVal === normSelected) || (btnVal === 'XONG' && normSelected === 'HOÀN THÀNH') || (btnVal === 'HOÀN THÀNH' && normSelected === 'XONG');

        if (btnVal === 'HỦY') {
            btn.style.background = isMatch ? '#dc2626' : '#fef2f2';
            btn.style.color = isMatch ? '#ffffff' : '#dc2626';
            btn.style.borderColor = '#fca5a5';
        } else if (btnVal === 'HOÀN' || btnVal === 'TRẢ' || btnVal === 'HOÀN TRẢ') {
            btn.style.background = isMatch ? '#d97706' : '#fffbeb';
            btn.style.color = isMatch ? '#ffffff' : '#d97706';
            btn.style.borderColor = '#fde68a';
        } else {
            btn.style.background = isMatch ? '#16a34a' : '#f0fdf4';
            btn.style.color = isMatch ? '#ffffff' : '#16a34a';
            btn.style.borderColor = '#86efac';
        }
    });
}

function recalculateDhFinancials() {
    const tinhTrangInput = document.querySelector('[data-dh-hdr="tinh_trang"]');
    const tinhTrangVal = String(tinhTrangInput?.value || '').trim().toUpperCase();

    const isCanceled = (tinhTrangVal === 'HỦY');
    const isReturnedOrRefunded = ['HOÀN', 'TRẢ', 'HOÀN TRẢ'].includes(tinhTrangVal);

    const tongTien = parseMoney(document.querySelector('[data-dh-hdr="tong_tien"]')?.value || '0');
    const phiVc = parseMoney(document.querySelector('[data-dh-hdr="phi_vc"]')?.value || '0');
    const phuPhi = parseMoney(document.querySelector('[data-dh-hdr="phu_phi"]')?.value || '0');
    const thue = parseMoney(document.querySelector('[data-dh-hdr="thue"]')?.value || '0');
    const phiKhac = parseMoney(document.querySelector('[data-dh-hdr="phi_khac"]')?.value || '0');

    let tienSp = 0;
    if (!isCanceled && !isReturnedOrRefunded) {
        const allSubtotalSpans = document.querySelectorAll('[id^="dhSubtotal_"]');
        allSubtotalSpans.forEach(span => {
            tienSp += parseMoney(span.innerText || '0');
        });
    }

    const tienSpInput = document.querySelector('[data-dh-hdr="tien_sp"]');
    if (tienSpInput) {
        tienSpInput.value = formatDisplayNumber(tienSp);
    }

    let doanhThu = 0;
    if (!isCanceled) {
        doanhThu = tongTien - (phiVc + phuPhi + thue + phiKhac);
    }

    const loiNhuan = doanhThu - tienSp;

    const doanhThuInput = document.querySelector('[data-dh-hdr="doanh_thu"]');
    if (doanhThuInput) {
        doanhThuInput.value = formatDisplayNumber(doanhThu);
    }

    const loiNhuanInput = document.querySelector('[data-dh-hdr="loi_nhuan"]');
    if (loiNhuanInput) {
        loiNhuanInput.value = formatDisplayNumber(loiNhuan);
        loiNhuanInput.style.color = loiNhuan < 0 ? '#dc2626' : '#16a34a';
    }
}

function updateDhItemSubtotal(itemIndex) {
    const slgInput = document.querySelector(`[data-dh-item-idx="${itemIndex}"][data-dh-item-hdr="slg"]`);
    const donGiaInput = document.querySelector(`[data-dh-item-idx="${itemIndex}"][data-dh-item-hdr="don_gia"]`);
    const subtotalSpan = document.getElementById(`dhSubtotal_${itemIndex}`);

    const slgRaw = slgInput?.value?.trim();
    const slg = (slgRaw !== undefined && slgRaw !== '' && !isNaN(slgRaw)) ? Math.max(0, parseInt(slgRaw)) : 0;
    const donGia = parseMoney(donGiaInput?.value || 0);
    const subtotal = slg * donGia;
    if (subtotalSpan) {
        subtotalSpan.innerText = formatDisplayNumber(subtotal);
    }

    recalculateDhFinancials();
}

function handleDhModalBackdropClick(event) {
    if (event.target && event.target.id === 'dhDetailModal') {
        closeDhDetail();
    }
}

function closeDhDetail() {
    const modal = document.getElementById('dhDetailModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    editingDhRows = [];
}

async function saveDhDetail() {
    if (!editingDhRows.length) return;
    const dhConfig = CONFIG.tabs['DH'];
    
    // Read input values
    const generalInputs = document.querySelectorAll('#dhDetailFields [data-dh-hdr]');
    const updatedFields = {};
    generalInputs.forEach(inp => {
        const hdr = inp.dataset.dhHdr;
        const idx = dhConfig.headers.indexOf(hdr);
        let val = inp.value.trim();
        if (dhConfig.priceCols.includes(idx)) {
            val = parseMoney(val);
        }
        updatedFields[idx] = val;
    });

    const itemsToUpdate = [];
    const skuIdx = dhConfig.headers.indexOf('sku');
    const idSpIdx = dhConfig.headers.indexOf('id_sp');
    const slgIdx = dhConfig.headers.indexOf('slg');
    const donGiaIdx = dhConfig.headers.indexOf('don_gia');
    const thanhTienIdx = dhConfig.headers.indexOf('thanh_tien');

    editingDhRows.forEach((r, i) => {
        const newRow = [...r];
        Object.keys(updatedFields).forEach(idx => {
            newRow[idx] = updatedFields[idx];
        });

        // Read item specific inputs
        const skuInput = document.querySelector(`[data-dh-item-idx="${i}"][data-dh-item-hdr="sku"]`);
        const idSpInput = document.querySelector(`[data-dh-item-idx="${i}"][data-dh-item-hdr="id_sp"]`);
        const slgInput = document.querySelector(`[data-dh-item-idx="${i}"][data-dh-item-hdr="slg"]`);
        const donGiaInput = document.querySelector(`[data-dh-item-idx="${i}"][data-dh-item-hdr="don_gia"]`);

        if (skuInput && skuIdx !== -1) newRow[skuIdx] = skuInput.value.trim();
        if (idSpInput && idSpIdx !== -1) newRow[idSpIdx] = idSpInput.value.trim();
        const slgVal = slgInput ? slgInput.value.trim() : '';
        if (slgIdx !== -1) newRow[slgIdx] = (slgVal === '' || isNaN(slgVal)) ? 0 : Math.max(0, parseInt(slgVal));
        if (donGiaInput && donGiaIdx !== -1) newRow[donGiaIdx] = parseMoney(donGiaInput.value);
        if (thanhTienIdx !== -1) newRow[thanhTienIdx] = (newRow[slgIdx] ?? 0) * (newRow[donGiaIdx] ?? 0); // thanh_tien

        if (r._sheetRow) newRow._sheetRow = r._sheetRow;
        itemsToUpdate.push({ row: newRow, sheetRow: getDataSheetRow(r) });
    });

    document.getElementById('loading').style.display = 'flex';
    document.querySelector('#loading p').innerText = 'Đang lưu thông tin đơn hàng DH...';
    try {
        await batchWriteRecordRows(itemsToUpdate);
        itemsToUpdate.forEach(item => {
            const idx = allData.findIndex(r => r._sheetRow === item.sheetRow);
            if (idx !== -1) {
                allData[idx] = item.row;
                item.row._sheetRow = item.sheetRow;
            }
            if (allDataCache['DH']) {
                const cIdx = allDataCache['DH'].findIndex(r => r._sheetRow === item.sheetRow);
                if (cIdx !== -1) {
                    allDataCache['DH'][cIdx] = item.row;
                    item.row._sheetRow = item.sheetRow;
                }
            }
        });
        closeDhDetail();
        filterTable();
        showToastNotification('✅ Đã lưu thông tin đơn hàng DH thành công!');
    } catch (err) {
        console.error('Lỗi khi lưu đơn hàng DH:', err);
        alert('Không thể lưu: ' + err.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

async function ensureDhSheetExists() {
    try {
        const token = await getAccessToken();
        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}?fields=sheets.properties`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const titles = (data.sheets || []).map(s => s.properties.title);
        if (!titles.includes('DH')) {
            const addSheetRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}:batchUpdate`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requests: [{
                        addSheet: {
                            properties: { title: 'DH' }
                        }
                    }]
                })
            });
            if (addSheetRes.ok) {
                const headers = CONFIG.tabs['DH'].headers;
                await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.spreadsheetId}/values/DH!A1:Y1?valueInputOption=USER_ENTERED`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        values: [headers]
                    })
                });
            }
        }
    } catch (err) {
        console.warn('Lỗi kiểm tra/tạo sheet DH:', err);
    }
}


function parseDhDate(val) {
    if (val === undefined || val === null || val === '') return null;
    const str = String(val).trim();
    if (!str) return null;

    if (!isNaN(str) && Number(str) > 30000 && Number(str) < 70000) {
        const serial = Number(str);
        const utc_days = Math.floor(serial - 25569);
        const dateObj = new Date(utc_days * 86400 * 1000);
        if (!isNaN(dateObj.getTime())) return dateObj;
    }

    const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmyMatch) {
        const day = parseInt(dmyMatch[1], 10);
        const month = parseInt(dmyMatch[2], 10) - 1;
        const year = parseInt(dmyMatch[3], 10);
        const dateObj = new Date(year, month, day);
        if (!isNaN(dateObj.getTime())) return dateObj;
    }

    const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1;
        const day = parseInt(isoMatch[3], 10);
        const dateObj = new Date(year, month, day);
        if (!isNaN(dateObj.getTime())) return dateObj;
    }

    const fallbackDate = new Date(str);
    if (!isNaN(fallbackDate.getTime())) return fallbackDate;

    return null;
}

function toggleDhGianFilter(gianName, btnElement) {
    if (selectedDhGianSet.has(gianName)) {
        selectedDhGianSet.delete(gianName);
    } else {
        selectedDhGianSet.add(gianName);
    }
    
    populateDhGianFilter();
    filterTable();
}

function toggleDhTinhTrangFilter(val) {
    if (!val) {
        selectedDhTinhTrangSet.clear();
    } else {
        if (selectedDhTinhTrangSet.has(val)) {
            selectedDhTinhTrangSet.delete(val);
        } else {
            selectedDhTinhTrangSet.add(val);
        }
    }
    populateDhTinhTrangFilter();
    filterTable();
}

function toggleDhTrangThaiFilter(val) {
    if (!val) {
        selectedDhTrangThaiSet.clear();
    } else {
        if (selectedDhTrangThaiSet.has(val)) {
            selectedDhTrangThaiSet.delete(val);
        } else {
            selectedDhTrangThaiSet.add(val);
        }
    }
    populateDhTrangThaiFilter();
    filterTable();
}

function populateDhGianFilter() {
    const container = document.getElementById('dhGianButtonsContainer');
    if (!container || !allData || !allData.length) return;

    const gianSet = new Set();
    allData.forEach(row => {
        const gian = String(row[0] || '').trim();
        if (gian && gian.toUpperCase() !== 'GIAN') gianSet.add(gian);
    });

    const sortedGian = Array.from(gianSet).sort();
    
    let buttonsHtml = '';
    sortedGian.forEach(g => {
        const isSelected = selectedDhGianSet.has(g);
        const bg = isSelected ? '#4f46e5' : '#ffffff';
        const color = isSelected ? '#ffffff' : '#334155';
        const border = isSelected ? '#4338ca' : '#cbd5e1';
        const weight = isSelected ? '700' : '600';
        const shadow = isSelected ? '0 2px 4px rgba(79, 70, 229, 0.25)' : 'none';

        buttonsHtml += `<button type="button" class="quick-btn dh-gian-btn" style="height: 30px; padding: 2px 10px; background: ${bg}; color: ${color}; border: 1px solid ${border}; border-radius: 6px; font-weight: ${weight}; font-size: 12px; cursor: pointer; transition: all 0.15s; box-shadow: ${shadow};" onclick="toggleDhGianFilter('${escapeHtml(escapeJsString(g))}', this)">🏬 ${escapeHtml(g)}</button>`;
    });

    container.innerHTML = buttonsHtml;
}

function populateDhTinhTrangFilter() {
    const container = document.getElementById('dhTinhTrangButtonsContainer');
    if (!container || !allData || !allData.length) return;

    const orderMap = new Map();
    allData.forEach(row => {
        const mdh = String(row[3] || '').trim();
        if (!mdh || orderMap.has(mdh)) return;
        const st = String(row[14] || '').trim().toUpperCase();
        orderMap.set(mdh, st);
    });

    const statusCounts = new Map();
    orderMap.forEach(st => {
        if (st) statusCounts.set(st, (statusCounts.get(st) || 0) + 1);
    });

    const presetList = ['HỦY', 'HOÀN', 'TRẢ', 'XONG'];
    const allStatuses = new Set(presetList);
    statusCounts.forEach((_, s) => {
        if (s && s !== 'TINH_TRANG') allStatuses.add(s);
    });

    const isAllActive = selectedDhTinhTrangSet.size === 0;
    const allBtnBg = isAllActive ? '#4f46e5' : '#ffffff';
    const allBtnColor = isAllActive ? '#ffffff' : '#334155';
    const allBtnBorder = isAllActive ? '#4338ca' : '#cbd5e1';

    let buttonsHtml = `<button type="button" class="quick-btn" style="height: 30px; padding: 2px 10px; background: ${allBtnBg}; color: ${allBtnColor}; border: 1px solid ${allBtnBorder}; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.15s;" onclick="toggleDhTinhTrangFilter('')">Tất cả <sub style="color: inherit; font-size: 10px; font-weight: 800; margin-left: 2px;">${orderMap.size}</sub></button>`;

    allStatuses.forEach(st => {
        const cnt = statusCounts.get(st) || 0;
        const isSelected = selectedDhTinhTrangSet.has(st);
        let bg = '#ffffff', color = '#334155', border = '#cbd5e1', icon = '';

        if (st === 'HỦY') {
            icon = '❌ ';
            bg = isSelected ? '#dc2626' : '#fef2f2';
            color = isSelected ? '#ffffff' : '#dc2626';
            border = isSelected ? '#b91c1c' : '#fca5a5';
        } else if (st === 'HOÀN') {
            icon = '↩️ ';
            bg = isSelected ? '#ea580c' : '#fff7ed';
            color = isSelected ? '#ffffff' : '#ea580c';
            border = isSelected ? '#c2410c' : '#fed7aa';
        } else if (st === 'TRẢ') {
            icon = '🔄 ';
            bg = isSelected ? '#d97706' : '#fffbeb';
            color = isSelected ? '#ffffff' : '#d97706';
            border = isSelected ? '#b45309' : '#fde68a';
        } else if (st === 'XONG') {
            icon = '✅ ';
            bg = isSelected ? '#16a34a' : '#f0fdf4';
            color = isSelected ? '#ffffff' : '#16a34a';
            border = isSelected ? '#15803d' : '#bbf7d0';
        } else {
            bg = isSelected ? '#4f46e5' : '#ffffff';
            color = isSelected ? '#ffffff' : '#334155';
            border = isSelected ? '#4338ca' : '#cbd5e1';
        }

        const shadow = isSelected ? '0 2px 4px rgba(0,0,0,0.15)' : 'none';
        buttonsHtml += `<button type="button" class="quick-btn" style="height: 30px; padding: 2px 10px; background: ${bg}; color: ${color}; border: 1px solid ${border}; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.15s; box-shadow: ${shadow};" onclick="toggleDhTinhTrangFilter('${escapeHtml(escapeJsString(st))}')">${icon}${escapeHtml(st)} <sub style="color: inherit; font-size: 10px; font-weight: 800; margin-left: 2px;">${cnt}</sub></button>`;
    });

    container.innerHTML = buttonsHtml;
}

function populateDhTrangThaiFilter() {
    const container = document.getElementById('dhTrangThaiButtonsContainer');
    if (!container || !allData || !allData.length) return;

    const orderMap = new Map();
    allData.forEach(row => {
        const mdh = String(row[3] || '').trim();
        if (!mdh || orderMap.has(mdh)) return;
        const st = String(row[15] || '').trim().toUpperCase();
        orderMap.set(mdh, st);
    });

    const statusCounts = new Map();
    orderMap.forEach(st => {
        if (st) statusCounts.set(st, (statusCounts.get(st) || 0) + 1);
    });

    const presetList = ['HỦY', 'HOÀN TRẢ', 'HOÀN THÀNH'];
    const allStatuses = new Set(presetList);
    statusCounts.forEach((_, s) => {
        if (s && s !== 'TRANG_THAI') allStatuses.add(s);
    });

    const isAllActive = selectedDhTrangThaiSet.size === 0;
    const allBtnBg = isAllActive ? '#4f46e5' : '#ffffff';
    const allBtnColor = isAllActive ? '#ffffff' : '#334155';
    const allBtnBorder = isAllActive ? '#4338ca' : '#cbd5e1';

    let buttonsHtml = `<button type="button" class="quick-btn" style="height: 30px; padding: 2px 10px; background: ${allBtnBg}; color: ${allBtnColor}; border: 1px solid ${allBtnBorder}; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.15s;" onclick="toggleDhTrangThaiFilter('')">Tất cả <sub style="color: inherit; font-size: 10px; font-weight: 800; margin-left: 2px;">${orderMap.size}</sub></button>`;

    allStatuses.forEach(st => {
        const cnt = statusCounts.get(st) || 0;
        const isSelected = selectedDhTrangThaiSet.has(st);
        let bg = '#ffffff', color = '#334155', border = '#cbd5e1', icon = '';

        if (st === 'HỦY') {
            icon = '❌ ';
            bg = isSelected ? '#dc2626' : '#fef2f2';
            color = isSelected ? '#ffffff' : '#dc2626';
            border = isSelected ? '#b91c1c' : '#fca5a5';
        } else if (st === 'HOÀN TRẢ' || st === 'HOÀN') {
            icon = '↩️ ';
            bg = isSelected ? '#ea580c' : '#fff7ed';
            color = isSelected ? '#ffffff' : '#ea580c';
            border = isSelected ? '#c2410c' : '#fed7aa';
        } else if (st === 'HOÀN THÀNH' || st === 'XONG') {
            icon = '✅ ';
            bg = isSelected ? '#16a34a' : '#f0fdf4';
            color = isSelected ? '#ffffff' : '#16a34a';
            border = isSelected ? '#15803d' : '#bbf7d0';
        } else {
            bg = isSelected ? '#0284c7' : '#ffffff';
            color = isSelected ? '#ffffff' : '#0369a1';
            border = isSelected ? '#0369a1' : '#bae6fd';
        }

        const shadow = isSelected ? '0 2px 4px rgba(0,0,0,0.15)' : 'none';
        buttonsHtml += `<button type="button" class="quick-btn" style="height: 30px; padding: 2px 10px; background: ${bg}; color: ${color}; border: 1px solid ${border}; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; transition: all 0.15s; box-shadow: ${shadow};" onclick="toggleDhTrangThaiFilter('${escapeHtml(escapeJsString(st))}')">${icon}${escapeHtml(st)} <sub style="color: inherit; font-size: 10px; font-weight: 800; margin-left: 2px;">${cnt}</sub></button>`;
    });

    container.innerHTML = buttonsHtml;
}

function updateDhSummaryStats() {
    const totalOrdersSpan = document.getElementById('dhStatTotalOrders');
    const totalRevenueSpan = document.getElementById('dhStatTotalRevenue');
    const totalProfitSpan = document.getElementById('dhStatTotalProfit');

    if (!totalOrdersSpan || !totalRevenueSpan || !totalProfitSpan) return;

    const totalOrders = filteredData.length;
    let totalRevenue = 0;
    let totalProfit = 0;

    filteredData.forEach(row => {
        totalRevenue += parseMoney(row[10] || 0); // doanh_thu
        totalProfit += parseMoney(row[13] || 0);   // loi_nhuan
    });

    totalOrdersSpan.innerText = formatDisplayNumber(totalOrders);
    totalRevenueSpan.innerText = formatDisplayNumber(totalRevenue) + ' đ';
    totalProfitSpan.innerText = formatDisplayNumber(totalProfit) + ' đ';

    totalProfitSpan.style.color = totalProfit < 0 ? '#dc2626' : '#6b21a8';
}

function setDhQuickDateRange(type, btnElement) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const dayOfWeek = now.getDay();

    let start = null;
    let end = null;

    const formatDateInput = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dt = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dt}`;
    };

    if (type === 'today') {
        start = new Date(year, month, day);
        end = new Date(year, month, day);
    } else if (type === 'this_week') {
        const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start = new Date(year, month, day + diffToMon);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
    } else if (type === 'this_month') {
        start = new Date(year, month, 1);
        end = new Date(year, month + 1, 0);
    } else if (type === 'last_week') {
        const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        start = new Date(year, month, day + diffToMon - 7);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
    } else if (type === 'last_month') {
        start = new Date(year, month - 1, 1);
        end = new Date(year, month, 0);
    }

    const startDateInput = document.getElementById('dhStartDateInput');
    const endDateInput = document.getElementById('dhEndDateInput');

    if (start && startDateInput) startDateInput.value = formatDateInput(start);
    if (end && endDateInput) endDateInput.value = formatDateInput(end);

    document.querySelectorAll('#dhQuickDateButtons button').forEach(btn => {
        btn.style.background = '#e2e8f0';
        btn.style.color = '#334155';
    });
    if (btnElement) {
        btnElement.style.background = '#4f46e5';
        btnElement.style.color = '#ffffff';
    }

    filterTable();
}

function clearDhFilters() {
    selectedDhGianSet.clear();
    selectedDhTinhTrangSet.clear();
    selectedDhTrangThaiSet.clear();
    const startDateInput = document.getElementById('dhStartDateInput');
    const endDateInput = document.getElementById('dhEndDateInput');
    const searchInput = document.getElementById('searchInput');

    if (startDateInput) startDateInput.value = '';
    if (endDateInput) endDateInput.value = '';
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('#dhQuickDateButtons button').forEach(btn => {
        btn.style.background = '#e2e8f0';
        btn.style.color = '#334155';
    });

    populateDhGianFilter();
    populateDhTinhTrangFilter();
    populateDhTrangThaiFilter();
    filterTable();
}
