import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { CONFIG } from '../../config/sheetsConfig.js';
import { formatDisplayNumber, parseMoney } from '../../utils/formatters.js';

export default function RecordModal({
    isOpen,
    onClose,
    currentTab,
    initialData = null,
    onSave
}) {
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const tabConfig = CONFIG.tabs[currentTab];
    const headers = tabConfig?.headers || [];
    const displayHeaders = tabConfig?.displayHeaders || headers;
    const priceCols = tabConfig?.priceCols || [];

    useEffect(() => {
        if (isOpen) {
            const initial = {};
            headers.forEach((h, idx) => {
                if (initialData && Array.isArray(initialData)) {
                    initial[h] = initialData[idx] ?? '';
                } else if (initialData && typeof initialData === 'object') {
                    initial[h] = initialData[h] ?? '';
                } else {
                    initial[h] = '';
                }
            });
            setFormData(initial);
        }
    }, [isOpen, currentTab, initialData]);

    if (!isOpen) return null;

    const isEdit = Boolean(initialData);

    const handleChange = (header, val, isPrice) => {
        if (isPrice) {
            const num = parseMoney(val);
            setFormData(prev => ({ ...prev, [header]: num }));
        } else {
            setFormData(prev => ({ ...prev, [header]: val }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const rowValues = headers.map(h => formData[h] ?? '');
            await onSave(rowValues, initialData?._sheetRow);
            onClose();
        } catch (err) {
            console.error('Save record error:', err);
            alert('Lỗi khi lưu dữ liệu: ' + (err.message || err));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="modal-mask"
            id="recordModal"
            style={{
                display: 'flex',
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(3px)',
                zIndex: 9999,
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
            onClick={(e) => {
                if (e.target.id === 'recordModal') onClose();
            }}
        >
            <form
                className="modal"
                onSubmit={handleSubmit}
                style={{
                    background: '#ffffff',
                    width: '100%',
                    maxWidth: '560px',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden',
                    maxHeight: '90vh'
                }}
            >
                <div
                    className="modal-header"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 20px',
                        borderBottom: '1px solid #e2e8f0',
                        background: '#f8fafc'
                    }}
                >
                    <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                        {isEdit ? `Sửa Dữ Liệu (${currentTab})` : `Thêm Mới (${currentTab})`}
                    </h2>
                    <button
                        type="button"
                        className="icon-btn"
                        onClick={onClose}
                        title="Đóng"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                        <X style={{ width: 20, height: 20 }} />
                    </button>
                </div>

                <div
                    className="modal-body"
                    style={{
                        padding: '16px 20px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}
                >
                    {headers.map((h, idx) => {
                        const label = displayHeaders[idx] || h;
                        const isPrice = priceCols.includes(idx);
                        const val = formData[h] ?? '';
                        const displayVal = isPrice ? formatDisplayNumber(val) : val;

                        return (
                            <div
                                key={h}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}
                            >
                                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                                    {label}
                                </label>
                                <input
                                    type="text"
                                    value={displayVal}
                                    onChange={(e) => handleChange(h, e.target.value, isPrice)}
                                    placeholder={`Nhập ${label}...`}
                                    style={{
                                        padding: '7px 10px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: isPrice ? 700 : 500,
                                        textAlign: isPrice ? 'right' : 'left'
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>

                <div
                    className="modal-footer"
                    style={{
                        padding: '12px 20px',
                        borderTop: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '10px'
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            background: '#fff',
                            color: '#475569',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        style={{
                            padding: '8px 20px',
                            border: 'none',
                            borderRadius: '6px',
                            background: '#4f46e5',
                            color: '#fff',
                            fontWeight: 700,
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Save style={{ width: 16, height: 16 }} />
                        <span>{isSaving ? 'Đang lưu...' : 'Lưu'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
