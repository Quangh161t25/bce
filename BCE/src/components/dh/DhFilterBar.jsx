import React from 'react';
import { Eraser } from 'lucide-react';

export default function DhFilterBar({
    gianOptions = [],
    selectedGianSet = new Set(),
    onToggleGian,
    tinhTrangCounts = new Map(),
    selectedTinhTrangSet = new Set(),
    onToggleTinhTrang,
    trangThaiCounts = new Map(),
    selectedTrangThaiSet = new Set(),
    onToggleTrangThai,
    monthOptions = [],
    selectedMonth = '',
    onMonthChange,
    dateFrom = '',
    onDateFromChange,
    dateTo = '',
    onDateToChange,
    onQuickDate,
    onClearFilters
}) {
    const totalOrdersCount = Array.from(tinhTrangCounts.values()).reduce((acc, c) => acc + c, 0);

    const presetTinhTrang = ['HỦY', 'HOÀN', 'TRẢ', 'XONG'];
    const allTinhTrangKeys = new Set(presetTinhTrang);
    tinhTrangCounts.forEach((_, k) => {
        if (k && k !== 'TINH_TRANG' && k !== '(TRỐNG)') allTinhTrangKeys.add(k);
    });

    const presetTrangThai = ['HỦY', 'HOÀN TRẢ', 'HOÀN THÀNH', 'XUNG ĐỘT'];
    const allTrangThaiKeys = new Set(presetTrangThai);
    trangThaiCounts.forEach((_, k) => {
        if (k && k !== 'TRANG_THAI' && k !== '(TRỐNG)') allTrangThaiKeys.add(k);
    });

    const emptyTinhTrangCount = tinhTrangCounts.get('(TRỐNG)') || 0;
    const emptyTrangThaiCount = trangThaiCounts.get('(TRỐNG)') || 0;

    return (
        <div
            id="dhFilterBar"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 12px',
                marginBottom: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
        >
            {/* Gian hàng Filter Buttons */}
            {gianOptions.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', minWidth: '75px' }}>
                        GIAN HÀNG:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {gianOptions.map((g) => {
                            const isSelected = selectedGianSet.has(g);
                            return (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => onToggleGian(g)}
                                    style={{
                                        height: '28px',
                                        padding: '2px 10px',
                                        background: isSelected ? '#4f46e5' : '#ffffff',
                                        color: isSelected ? '#ffffff' : '#334155',
                                        border: `1px solid ${isSelected ? '#4338ca' : '#cbd5e1'}`,
                                        borderRadius: '6px',
                                        fontWeight: isSelected ? 700 : 600,
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        boxShadow: isSelected ? '0 2px 4px rgba(79, 70, 229, 0.25)' : 'none'
                                    }}
                                >
                                    🏬 {g}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tình trạng Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', minWidth: '75px' }}>
                    TÌNH TRẠNG:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => onToggleTinhTrang('ALL')}
                        style={{
                            height: '28px',
                            padding: '2px 10px',
                            background: selectedTinhTrangSet.size === 0 ? '#4f46e5' : '#ffffff',
                            color: selectedTinhTrangSet.size === 0 ? '#ffffff' : '#334155',
                            border: `1px solid ${selectedTinhTrangSet.size === 0 ? '#4338ca' : '#cbd5e1'}`,
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        Tất cả <sub style={{ fontSize: '10px', fontWeight: 800 }}>{totalOrdersCount}</sub>
                    </button>

                    <button
                        type="button"
                        onClick={() => onToggleTinhTrang('(TRỐNG)')}
                        style={{
                            height: '28px',
                            padding: '2px 10px',
                            background: selectedTinhTrangSet.has('(TRỐNG)') ? '#475569' : '#f8fafc',
                            color: selectedTinhTrangSet.has('(TRỐNG)') ? '#ffffff' : '#475569',
                            border: `1px solid ${selectedTinhTrangSet.has('(TRỐNG)') ? '#334155' : '#cbd5e1'}`,
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        ⚪ (Trống) <sub style={{ fontSize: '10px', fontWeight: 800 }}>{emptyTinhTrangCount}</sub>
                    </button>

                    {Array.from(allTinhTrangKeys).map((st) => {
                        const cnt = tinhTrangCounts.get(st) || 0;
                        const isSelected = selectedTinhTrangSet.has(st);
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
                        }

                        return (
                            <button
                                key={st}
                                type="button"
                                onClick={() => onToggleTinhTrang(st)}
                                style={{
                                    height: '28px',
                                    padding: '2px 10px',
                                    background: bg,
                                    color: color,
                                    border: `1px solid ${border}`,
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {icon}{st} <sub style={{ fontSize: '10px', fontWeight: 800 }}>{cnt}</sub>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Trạng thái Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', minWidth: '75px' }}>
                    TRẠNG THÁI:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => onToggleTrangThai('ALL')}
                        style={{
                            height: '28px',
                            padding: '2px 10px',
                            background: selectedTrangThaiSet.size === 0 ? '#4f46e5' : '#ffffff',
                            color: selectedTrangThaiSet.size === 0 ? '#ffffff' : '#334155',
                            border: `1px solid ${selectedTrangThaiSet.size === 0 ? '#4338ca' : '#cbd5e1'}`,
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        Tất cả <sub style={{ fontSize: '10px', fontWeight: 800 }}>{totalOrdersCount}</sub>
                    </button>

                    {emptyTrangThaiCount > 0 && (
                        <button
                            type="button"
                            onClick={() => onToggleTrangThai('(TRỐNG)')}
                            style={{
                                height: '28px',
                                padding: '2px 10px',
                                background: selectedTrangThaiSet.has('(TRỐNG)') ? '#475569' : '#f8fafc',
                                color: selectedTrangThaiSet.has('(TRỐNG)') ? '#ffffff' : '#475569',
                                border: `1px solid ${selectedTrangThaiSet.has('(TRỐNG)') ? '#334155' : '#cbd5e1'}`,
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            ⚪ (Trống) <sub style={{ fontSize: '10px', fontWeight: 800 }}>{emptyTrangThaiCount}</sub>
                        </button>
                    )}

                    {Array.from(allTrangThaiKeys).map((st) => {
                        const cnt = trangThaiCounts.get(st) || 0;
                        const isSelected = selectedTrangThaiSet.has(st);
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
                        } else if (st === 'XUNG ĐỘT') {
                            icon = '⚠️ ';
                            bg = isSelected ? '#b91c1c' : '#fef2f2';
                            color = isSelected ? '#ffffff' : '#b91c1c';
                            border = isSelected ? '#991b1b' : '#f87171';
                        }

                        return (
                            <button
                                key={st}
                                type="button"
                                onClick={() => onToggleTrangThai(st)}
                                style={{
                                    height: '28px',
                                    padding: '2px 10px',
                                    background: bg,
                                    color: color,
                                    border: `1px solid ${border}`,
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {icon}{st} <sub style={{ fontSize: '10px', fontWeight: 800 }}>{cnt}</sub>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Nhóm Tháng Filter Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '75px' }}>
                    📅 NHÓM THÁNG:
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => onMonthChange('')}
                        style={{
                            height: '28px',
                            padding: '2px 10px',
                            background: !selectedMonth ? '#3b82f6' : '#ffffff',
                            color: !selectedMonth ? '#ffffff' : '#334155',
                            border: `1px solid ${!selectedMonth ? '#2563eb' : '#cbd5e1'}`,
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            boxShadow: !selectedMonth ? '0 2px 4px rgba(59, 130, 246, 0.25)' : 'none'
                        }}
                    >
                        Tất cả <sub style={{ fontSize: '10px', fontWeight: 800 }}>{totalOrdersCount}</sub>
                    </button>
                    {monthOptions.map((item) => {
                        const mKey = typeof item === 'string' ? item : item.key;
                        const cnt = typeof item === 'object' && item.count !== undefined ? item.count : (item.count || '');
                        const isSelected = selectedMonth === mKey;
                        return (
                            <button
                                key={mKey}
                                type="button"
                                onClick={() => onMonthChange(isSelected ? '' : mKey)}
                                style={{
                                    height: '28px',
                                    padding: '2px 10px',
                                    background: isSelected ? '#3b82f6' : '#ffffff',
                                    color: isSelected ? '#ffffff' : '#334155',
                                    border: `1px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    boxShadow: isSelected ? '0 2px 4px rgba(59, 130, 246, 0.25)' : 'none'
                                }}
                            >
                                Tháng {mKey} {cnt !== '' && <sub style={{ fontSize: '10px', fontWeight: 800 }}>{cnt}</sub>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Date Range & Quick Buttons Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>📅 Từ:</span>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => onDateFromChange(e.target.value)}
                        style={{
                            height: '28px',
                            padding: '2px 6px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '12px',
                            background: '#ffffff'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>📅 Đến:</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => onDateToChange(e.target.value)}
                        style={{
                            height: '28px',
                            padding: '2px 6px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            fontSize: '12px',
                            background: '#ffffff'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                        type="button"
                        onClick={() => onQuickDate('today')}
                        style={{ height: '26px', padding: '0 8px', fontSize: '11px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
                    >
                        Hôm nay
                    </button>
                    <button
                        type="button"
                        onClick={() => onQuickDate('thisWeek')}
                        style={{ height: '26px', padding: '0 8px', fontSize: '11px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
                    >
                        Tuần này
                    </button>
                    <button
                        type="button"
                        onClick={() => onQuickDate('thisMonth')}
                        style={{ height: '26px', padding: '0 8px', fontSize: '11px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
                    >
                        Tháng này
                    </button>
                    <button
                        type="button"
                        onClick={() => onQuickDate('lastWeek')}
                        style={{ height: '26px', padding: '0 8px', fontSize: '11px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
                    >
                        Tuần trước
                    </button>
                    <button
                        type="button"
                        onClick={() => onQuickDate('lastMonth')}
                        style={{ height: '26px', padding: '0 8px', fontSize: '11px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', color: '#334155', cursor: 'pointer' }}
                    >
                        Tháng trước
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onClearFilters}
                    style={{
                        height: '28px',
                        padding: '2px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginLeft: 'auto'
                    }}
                    title="Xóa toàn bộ các bộ lọc đang chọn"
                >
                    <Eraser style={{ width: 14, height: 14 }} />
                    <span>Xóa Lọc</span>
                </button>
            </div>
        </div>
    );
}
