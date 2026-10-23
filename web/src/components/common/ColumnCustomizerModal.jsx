import React, { useState, useEffect } from 'react';
import {
    Settings,
    X,
    RotateCcw,
    Check,
    ArrowUp,
    ArrowDown,
    Pin,
    AlignLeft,
    AlignCenter,
    AlignRight,
    GripVertical,
    WrapText
} from 'lucide-react';

export default function ColumnCustomizerModal({
    isOpen,
    onClose,
    tableName,
    defaultHeaders,
    currentConfig,
    onSave,
    getHeaderDisplayName
}) {
    // Khởi tạo state làm việc
    const [workingList, setWorkingList] = useState(() => {
        if (currentConfig && currentConfig.length) {
            return JSON.parse(JSON.stringify(currentConfig));
        }
        return (defaultHeaders || []).map((hdr) => ({
            id: hdr,
            label: getHeaderDisplayName ? getHeaderDisplayName(hdr) : hdr,
            visible: true,
            align: 'left',
            wrap: false,
            width: 0,
            fixed: false
        }));
    });

    // Cập nhật workingList khi modal mở hoặc config thay đổi
    useEffect(() => {
        if (!isOpen) return;
        if (currentConfig && currentConfig.length) {
            setWorkingList(JSON.parse(JSON.stringify(currentConfig)));
        } else if (defaultHeaders && defaultHeaders.length) {
            setWorkingList(defaultHeaders.map((hdr) => ({
                id: hdr,
                label: getHeaderDisplayName ? getHeaderDisplayName(hdr) : hdr,
                visible: true,
                align: 'left',
                wrap: false,
                width: 0,
                fixed: false
            })));
        }
    }, [isOpen, currentConfig, defaultHeaders, getHeaderDisplayName]);

    const [dragIndex, setDragIndex] = useState(null);

    const handleToggleVisible = (index) => {
        setWorkingList((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], visible: !next[index].visible };
            return next;
        });
    };

    const handleAlignChange = (index, align) => {
        setWorkingList((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], align };
            return next;
        });
    };

    const handleWrapChange = (index, wrap) => {
        setWorkingList((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], wrap };
            return next;
        });
    };

    const handleWidthChange = (index, widthStr) => {
        const val = parseInt(widthStr, 10);
        setWorkingList((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], width: isNaN(val) ? 0 : val };
            return next;
        });
    };

    const handleFixedChange = (index) => {
        setWorkingList((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], fixed: !next[index].fixed };
            return next;
        });
    };

    const handleMove = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= workingList.length) return;
        setWorkingList((prev) => {
            const next = [...prev];
            const [moved] = next.splice(fromIndex, 1);
            next.splice(toIndex, 0, moved);
            return next;
        });
    };

    const handleReset = () => {
        if (window.confirm('Khôi phục toàn bộ cột về trạng thái mặc định ban đầu?')) {
            const reset = defaultHeaders.map((hdr) => ({
                id: hdr,
                label: getHeaderDisplayName ? getHeaderDisplayName(hdr) : hdr,
                visible: true,
                align: 'left',
                wrap: false,
                width: 0,
                fixed: false
            }));
            setWorkingList(reset);
        }
    };

    const handleCheckAll = (visible) => {
        setWorkingList((prev) => prev.map((col) => ({ ...col, visible })));
    };

    const handleSaveAndApply = () => {
        onSave(workingList);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
        }}>
            <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                width: 'min(860px, 96vw)',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#f8fafc'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                            <Settings style={{ width: 18, height: 18 }} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                                Tuỳ chỉnh chi tiết các cột — {tableName}
                            </h3>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                                Kéo thả ⠿ hoặc ấn ▲▼ để sắp xếp, ẩn/hiện, căn lề, xuống dòng, kích thước và cố định cột.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px'
                        }}
                    >
                        <X style={{ width: 18, height: 18 }} />
                    </button>
                </div>

                {/* Sub-toolbar */}
                <div style={{
                    padding: '10px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    fontSize: '12px'
                }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={() => handleCheckAll(true)}
                            style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Hiện tất cả
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCheckAll(false)}
                            style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
                        >
                            Bỏ chọn hết
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            style={{ padding: '4px 10px', fontSize: '12px', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                            <RotateCcw style={{ width: 12, height: 12 }} /> Khôi phục mặc định
                        </button>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>
                        Tổng: <b>{workingList.length}</b> cột ({workingList.filter((c) => c.visible).length} đang hiện)
                    </div>
                </div>

                {/* Body list */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {workingList.map((col, idx) => (
                            <div
                                key={col.id}
                                draggable
                                onDragStart={() => setDragIndex(idx)}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.background = '#e0f2fe';
                                }}
                                onDragLeave={(e) => {
                                    e.currentTarget.style.background = '#ffffff';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.background = '#ffffff';
                                    if (dragIndex !== null && dragIndex !== idx) {
                                        handleMove(dragIndex, idx);
                                    }
                                    setDragIndex(null);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 12px',
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                                    transition: 'background .15s'
                                }}
                            >
                                {/* Drag Handle */}
                                <div style={{ cursor: 'grab', color: '#94a3b8', display: 'flex', alignItems: 'center' }} title="Kéo thả đổi vị trí">
                                    <GripVertical style={{ width: 16, height: 16 }} />
                                </div>

                                {/* Up / Down buttons */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                    <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => handleMove(idx, idx - 1)}
                                        style={{ border: 'none', background: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: 0, opacity: idx === 0 ? 0.3 : 1 }}
                                        title="Lên trên"
                                    >
                                        <ArrowUp style={{ width: 12, height: 12, color: '#475569' }} />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={idx === workingList.length - 1}
                                        onClick={() => handleMove(idx, idx + 1)}
                                        style={{ border: 'none', background: 'none', cursor: idx === workingList.length - 1 ? 'not-allowed' : 'pointer', padding: 0, opacity: idx === workingList.length - 1 ? 0.3 : 1 }}
                                        title="Xuống dưới"
                                    >
                                        <ArrowDown style={{ width: 12, height: 12, color: '#475569' }} />
                                    </button>
                                </div>

                                {/* Checkbox Visibility & Name */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '200px', cursor: 'pointer', margin: 0 }}>
                                    <input
                                        type="checkbox"
                                        checked={col.visible !== false}
                                        onChange={() => handleToggleVisible(idx)}
                                        style={{ cursor: 'pointer', width: 15, height: 15 }}
                                    />
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: col.visible !== false ? '#0f172a' : '#94a3b8' }}>
                                        {col.label}
                                    </span>
                                </label>

                                {/* Căn lề */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px', background: '#f8fafc' }}>
                                    <button
                                        type="button"
                                        onClick={() => handleAlignChange(idx, 'left')}
                                        title="Căn trái"
                                        style={{
                                            border: 'none',
                                            background: col.align === 'left' ? '#0284c7' : 'transparent',
                                            color: col.align === 'left' ? '#fff' : '#64748b',
                                            padding: '3px 6px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <AlignLeft style={{ width: 13, height: 13 }} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAlignChange(idx, 'center')}
                                        title="Căn giữa"
                                        style={{
                                            border: 'none',
                                            background: col.align === 'center' ? '#0284c7' : 'transparent',
                                            color: col.align === 'center' ? '#fff' : '#64748b',
                                            padding: '3px 6px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <AlignCenter style={{ width: 13, height: 13 }} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAlignChange(idx, 'right')}
                                        title="Căn phải"
                                        style={{
                                            border: 'none',
                                            background: col.align === 'right' ? '#0284c7' : 'transparent',
                                            color: col.align === 'right' ? '#fff' : '#64748b',
                                            padding: '3px 6px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <AlignRight style={{ width: 13, height: 13 }} />
                                    </button>
                                </div>

                                {/* Xuống dòng dạng icon */}
                                <button
                                    type="button"
                                    onClick={() => handleWrapChange(idx, !col.wrap)}
                                    title={col.wrap ? 'Xuống dòng: BẬT (Bấm để tắt)' : 'Xuống dòng: TẮT (Bấm để bật)'}
                                    style={{
                                        border: `1px solid ${col.wrap ? '#0284c7' : '#cbd5e1'}`,
                                        background: col.wrap ? '#0284c7' : '#f8fafc',
                                        color: col.wrap ? '#ffffff' : '#64748b',
                                        padding: '4px 7px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all .15s'
                                    }}
                                >
                                    <WrapText style={{ width: 14, height: 14 }} />
                                </button>

                                {/* Kích thước */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }} title="Nhập số px hoặc để trống / nhấp đúp để tự động">
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>Rộng:</span>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={col.width && Number(col.width) > 0 ? col.width : ''}
                                        placeholder="Tự động"
                                        onChange={(e) => {
                                            const cleaned = e.target.value.replace(/[^0-9]/g, '');
                                            handleWidthChange(idx, cleaned);
                                        }}
                                        onDoubleClick={() => handleWidthChange(idx, '0')}
                                        style={{ width: '75px', padding: '3px 6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', textAlign: 'center', background: '#fff' }}
                                    />
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>px</span>
                                </div>

                                {/* Cố định cột */}
                                <label style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    margin: 0,
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: col.fixed ? '#ecfdf5' : 'transparent',
                                    color: col.fixed ? '#065f46' : '#64748b',
                                    fontWeight: col.fixed ? 700 : 400
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={!!col.fixed}
                                        onChange={() => handleFixedChange(idx)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <Pin style={{ width: 12, height: 12 }} />
                                    <span>Cố định</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '12px 20px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    background: '#ffffff'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '7px 16px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            background: '#ffffff',
                            color: '#475569',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Huỷ
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveAndApply}
                        style={{
                            padding: '7px 18px',
                            border: '1px solid #0284c7',
                            borderRadius: '6px',
                            background: '#0284c7',
                            color: '#ffffff',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 3px rgba(2,132,199,0.3)'
                        }}
                    >
                        <Check style={{ width: 14, height: 14 }} /> Lưu &amp; Áp dụng
                    </button>
                </div>
            </div>
        </div>
    );
}
