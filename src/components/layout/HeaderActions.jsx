import React, { useRef } from 'react';
import { Search, RefreshCw, Upload, Plus, ArrowDownToLine } from 'lucide-react';

export default function HeaderActions({
    currentTab,
    searchTerm,
    onSearchChange,
    truongFilter,
    onTruongFilterChange,
    truongOptions = [],
    storeFilter,
    onStoreFilterChange,
    storeOptions = [],
    onReload,
    onUploadFiles,
    onAddNew,
    onBatchMinPrice
}) {
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0 && onUploadFiles) {
            onUploadFiles(files);
        }
        e.target.value = '';
    };

    const isDhTab = currentTab === 'DH';
    const isTinhGiaTab = currentTab === 'TINH_GIA';
    const showStoreFilter = currentTab === 'WEB_SP' || currentTab === 'SP_GIAM_GIA';

    return (
        <div id="headerActions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="search-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search className="search-icon" style={{ width: 18, height: 18 }} />
                <input
                    type="text"
                    id="searchInput"
                    className="search-input"
                    placeholder="Tìm kiếm nhanh..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {!isDhTab && (
                <>
                    <input
                        id="truongFilter"
                        className="filter-input"
                        type="text"
                        list="truongOptionsList"
                        placeholder="Lọc theo Trường..."
                        value={truongFilter}
                        onChange={(e) => onTruongFilterChange(e.target.value)}
                    />
                    <datalist id="truongOptionsList">
                        {truongOptions.map((opt, i) => (
                            <option key={i} value={opt} />
                        ))}
                    </datalist>

                    <select
                        id="storeFilter"
                        className="filter-input"
                        value={storeFilter}
                        onChange={(e) => onStoreFilterChange(e.target.value)}
                    >
                        <option value="">Chọn gian hàng...</option>
                        {storeOptions.map((store, i) => (
                            <option key={i} value={store}>
                                {store}
                            </option>
                        ))}
                    </select>
                </>
            )}

            <button id="reloadBtn" type="button" onClick={onReload} title="Tải lại dữ liệu">
                <RefreshCw style={{ width: 18, height: 18 }} />
                <span>Load lại</span>
            </button>

            {!isDhTab && (
                <>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        multiple
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                    />
                    <button
                        id="uploadBtn"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title={`Tải file Excel lên ${currentTab}`}
                    >
                        <Upload style={{ width: 18, height: 18 }} />
                        <span>Tải {currentTab} Lên</span>
                    </button>

                    <button id="addBtn" type="button" onClick={onAddNew} title="Thêm dòng mới">
                        <Plus style={{ width: 18, height: 18 }} />
                        <span>Thêm mới</span>
                    </button>
                </>
            )}

            {isTinhGiaTab && (
                <button
                    id="updateGiaDangMinBtn"
                    type="button"
                    style={{
                        height: '36px',
                        padding: '6px 14px',
                        background: '#059669',
                        color: '#fff',
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                    onClick={onBatchMinPrice}
                    title="Đặt giá đăng = giá bán thấp nhất cho các dòng đã chọn hoặc tất cả"
                >
                    <ArrowDownToLine style={{ width: 16, height: 16 }} />
                    <span>👇 Đặt Giá Đăng = Giá Thấp Nhất</span>
                </button>
            )}
        </div>
    );
}
