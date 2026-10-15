import React from 'react';
import { Copy, Trash2, Eraser } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard.js';

export default function DhBatchControls({
    selectedOrders = new Set(),
    onSelectAll,
    allSelected,
    onDeleteSelected,
    onClearTinhTrang
}) {
    const count = selectedOrders.size;

    const handleCopyMdh = async (separator) => {
        if (count === 0) {
            return;
        }
        const mdhList = Array.from(selectedOrders).filter(Boolean);
        const text = mdhList.join(separator);
        const sepDesc = separator === ', ' ? 'cách nhau dấu ", "' : 'cách nhau dấu ","';
        await copyToClipboard(text, `📋 Đã sao chép ${mdhList.length} MDH (${sepDesc}) vào clipboard!`);
    };

    if (count === 0) return null;

    return (
        <div
            id="dhBatchControlsBar"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 12px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                marginBottom: '6px',
                flexWrap: 'wrap'
            }}
        >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                Đã chọn: <span style={{ color: '#2563eb' }}>{count}</span> đơn hàng
            </div>

            <button
                type="button"
                onClick={() => handleCopyMdh(', ')}
                style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: '#ffffff',
                    color: '#2563eb',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
                title="Sao chép các mã đơn hàng đã chọn, phân cách bởi dấu phẩy và khoảng trắng (, )"
            >
                <Copy style={{ width: 14, height: 14 }} />
                <span>Copy MDH (, )</span>
            </button>

            <button
                type="button"
                onClick={() => handleCopyMdh(',')}
                style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: '#ffffff',
                    color: '#2563eb',
                    border: '1px solid #93c5fd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
                title="Sao chép các mã đơn hàng đã chọn, phân cách bởi dấu phẩy (,)"
            >
                <Copy style={{ width: 14, height: 14 }} />
                <span>Copy MDH (,)</span>
            </button>

            {onClearTinhTrang && (
                <button
                    type="button"
                    onClick={onClearTinhTrang}
                    style={{
                        padding: '5px 13px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: '#d97706',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 1px 2px rgba(217, 119, 6, 0.25)',
                        transition: 'all 0.15s'
                    }}
                    title="Xóa dữ liệu cột Tình trạng của các đơn hàng đã chọn trên Google Sheets"
                >
                    <Eraser style={{ width: 14, height: 14, color: '#ffffff' }} />
                    <span>Xóa Tình Trạng ({count})</span>
                </button>
            )}

            <button
                type="button"
                onClick={onDeleteSelected}
                style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginLeft: 'auto'
                }}
                title="Xóa toàn bộ các đơn hàng đã chọn khỏi Google Sheets"
            >
                <Trash2 style={{ width: 14, height: 14 }} />
                <span>Xóa {count} đơn đã chọn</span>
            </button>
        </div>
    );
}
