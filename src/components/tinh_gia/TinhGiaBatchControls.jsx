import React, { useState } from 'react';
import { CheckSquare, Percent, ArrowDownToLine, Trash2, Eraser } from 'lucide-react';

export default function TinhGiaBatchControls({
    currentTab = 'TINH_GIA',
    selectedCount,
    onBatchProfit,
    onBatchMinPrice,
    onMoveToSpBo,
    onClearTinhTrang
}) {
    const [profitInput, setProfitInput] = useState('');

    if (selectedCount === 0) return null;

    const handleApplyProfit = () => {
        const val = parseFloat(profitInput);
        if (isNaN(val)) {
            alert('Vui lòng nhập tỷ lệ Lợi nhuận mong muốn (%) hợp lệ (VD: 15)');
            return;
        }
        onBatchProfit(val / 100);
        setProfitInput('');
    };

    return (
        <div
            id="productBatchControls"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f0fdf4',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #16a34a',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                width: '100%',
                flexWrap: 'wrap',
                marginBottom: '6px'
            }}
        >
            <span
                style={{
                    fontWeight: 700,
                    color: '#15803d',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}
            >
                <CheckSquare style={{ width: 18, height: 18, color: '#16a34a' }} />
                <span>Đã chọn {selectedCount} SP</span>
            </span>

            {currentTab === 'TINH_GIA' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>
                        Lợi nhuận mong muốn (%):
                    </span>
                    <input
                        type="number"
                        step="any"
                        value={profitInput}
                        onChange={(e) => setProfitInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleApplyProfit();
                            }
                        }}
                        placeholder="VD: 15"
                        style={{
                            width: '100px',
                            minWidth: '90px',
                            height: '34px',
                            padding: '4px 10px',
                            fontWeight: 600,
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px'
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleApplyProfit}
                        style={{
                            height: '34px',
                            padding: '0 14px',
                            background: '#0284c7',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Percent style={{ width: 15, height: 15 }} />
                        <span>Cập nhật lợi nhuận</span>
                    </button>

                    <button
                        type="button"
                        onClick={onBatchMinPrice}
                        style={{
                            height: '34px',
                            padding: '0 14px',
                            background: '#059669',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '12px',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <ArrowDownToLine style={{ width: 15, height: 15 }} />
                        <span>Giá đăng = Giá thấp nhất</span>
                    </button>
                </div>
            )}

            {currentTab === 'DS_SP' && onClearTinhTrang && (
                <button
                    type="button"
                    onClick={onClearTinhTrang}
                    style={{
                        height: '34px',
                        padding: '0 14px',
                        background: '#d97706',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 2px rgba(217, 119, 6, 0.25)'
                    }}
                    title="Xóa dữ liệu cột Tình trạng của các sản phẩm đã chọn trên Google Sheets"
                >
                    <Eraser style={{ width: 15, height: 15, color: '#fff' }} />
                    <span>Xóa Tình Trạng ({selectedCount})</span>
                </button>
            )}

            <button
                type="button"
                onClick={onMoveToSpBo}
                style={{
                    height: '34px',
                    padding: '0 14px',
                    background: '#dc2626',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginLeft: 'auto'
                }}
            >
                <Trash2 style={{ width: 15, height: 15 }} />
                <span>Chuyển sang SP_BO & Ẩn</span>
            </button>
        </div>
    );
}
