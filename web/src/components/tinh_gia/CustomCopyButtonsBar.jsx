import React, { useState } from 'react';
import { Copy, Plus, X } from 'lucide-react';

export default function CustomCopyButtonsBar({
    customButtons = [],
    onAddButton,
    onRemoveButton
}) {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        const raw = String(inputValue || '').trim();
        if (!raw) return;

        const newItems = raw
            .split(/[,;|\n]+/)
            .map((s) => s.trim().replace(/^-+|-+$/g, ''))
            .filter(Boolean);

        if (newItems.length > 0) {
            onAddButton(newItems);
            setInputValue('');
        }
    };

    return (
        <div
            id="customCopyButtonsBar"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: '#f8fafc',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                width: '100%',
                flexWrap: 'wrap',
                marginBottom: '6px'
            }}
        >
            <span
                style={{
                    fontWeight: 700,
                    color: '#334155',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}
            >
                <Copy style={{ width: 16, height: 16, color: '#4f46e5' }} />
                <span>Quản lý Nút Copy Tùy Chỉnh:</span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                    placeholder="Tên nút (vd: GDD, 00-GDD)..."
                    style={{
                        width: '180px',
                        height: '32px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px'
                    }}
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    style={{
                        height: '32px',
                        padding: '4px 10px',
                        background: '#4f46e5',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '12px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <Plus style={{ width: 14, height: 14 }} />
                    <span>Thêm nút</span>
                </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginLeft: '8px' }}>
                {customButtons.map((btnText) => (
                    <span
                        key={btnText}
                        className="custom-btn-tag"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            background: '#e0e7ff',
                            color: '#4338ca',
                            border: '1px solid #c7d2fe',
                            borderRadius: '14px',
                            fontSize: '12px',
                            fontWeight: 700
                        }}
                    >
                        {btnText}
                        <button
                            type="button"
                            onClick={() => onRemoveButton(btnText)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                fontSize: '12px',
                                fontWeight: 900,
                                cursor: 'pointer',
                                padding: '0 2px',
                                lineHeight: 1
                            }}
                            title="Xóa nút này"
                        >
                            <X style={{ width: 12, height: 12 }} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
