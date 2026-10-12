import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, ExternalLink } from 'lucide-react';
import { formatDisplayNumber, parseMoney } from '../../utils/formatters.js';

export default function DhSubrowItems({
    mdh,
    initialItems = [],
    dsSpPriceMap = new Map(),
    dsSpNameMap = new Map(),
    onSaveItems,
    onOpenDetail
}) {
    const [items, setItems] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        setItems(
            initialItems.map((item, idx) => ({
                ...item,
                _localId: item._sheetRow || `new_${idx}`
            }))
        );
    }, [initialItems]);

    const handleSkuChange = (index, value) => {
        const next = [...items];
        next[index] = { ...next[index], sku: value };

        // Auto find ID_SP if empty
        if (!next[index].id_sp) {
            const clean = String(value || '').trim().toUpperCase();
            if (clean.length >= 4) {
                const prefix = clean.substring(0, 4);
                if (dsSpPriceMap.has(prefix)) {
                    next[index].id_sp = prefix;
                    const matched = dsSpPriceMap.get(prefix);
                    if (matched && matched.giaBan > 0 && !next[index].don_gia) {
                        next[index].don_gia = matched.giaBan;
                    }
                }
            }
        }
        setItems(next);
    };

    const handleIdSpChange = (index, value) => {
        let clean = String(value || '').trim();
        if (clean.includes(' - ')) {
            clean = clean.split(/\s+[-–—]\s+/)[0].trim();
        }

        const next = [...items];
        next[index] = { ...next[index], id_sp: clean };

        const matched = dsSpPriceMap.get(clean.toUpperCase()) || dsSpPriceMap.get(clean.slice(0, 4).toUpperCase());
        if (matched && matched.giaBan > 0) {
            next[index].don_gia = matched.giaBan;
        }

        setItems(next);
    };

    const handleSlgChange = (index, value) => {
        const next = [...items];
        const slg = Math.max(0, parseInt(value, 10) || 0);
        next[index] = { ...next[index], slg };
        setItems(next);
    };

    const handleDonGiaChange = (index, value) => {
        const next = [...items];
        const donGia = parseMoney(value);
        next[index] = { ...next[index], don_gia: donGia };
        setItems(next);
    };

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                sku: '',
                id_sp: '',
                slg: 1,
                don_gia: 0,
                _sheetRow: null,
                _localId: `new_${Date.now()}`
            }
        ]);
    };

    const handleDeleteItem = (index) => {
        if (items.length <= 1) {
            alert('Đơn hàng cần ít nhất 1 dòng sản phẩm!');
            return;
        }
        const next = items.filter((_, i) => i !== index);
        setItems(next);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSaveItems(mdh, items);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            console.error('Error saving subrow items:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const totalAmount = items.reduce((acc, item) => {
        const slg = Math.max(0, parseInt(item.slg, 10) || 0);
        const donGia = parseMoney(item.don_gia || 0);
        return acc + (slg * donGia);
    }, 0);

    return (
        <div
            style={{
                padding: '10px 14px 14px 18px',
                background: '#f8fafc',
                borderLeft: '4px solid #4f46e5',
                borderBottom: '2px solid #cbd5e1',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
                maxWidth: '980px',
                width: 'fit-content',
                position: 'sticky',
                left: '10px'
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    flexWrap: 'wrap',
                    gap: '8px',
                    background: '#ffffff',
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                        📦 Bảng Sản Phẩm Đơn: <strong style={{ color: '#4338ca' }}>{mdh}</strong>
                    </span>
                    <span
                        style={{
                            fontSize: '11px',
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: 700
                        }}
                    >
                        {items.length} SP
                    </span>
                    <button
                        type="button"
                        onClick={handleAddItem}
                        style={{
                            padding: '4px 9px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#eff6ff',
                            color: '#1e40af',
                            border: '1px solid #bfdbfe',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                        }}
                        title="Thêm dòng sản phẩm mới"
                    >
                        <Plus style={{ width: 14, height: 14 }} />
                        <span>Thêm SP</span>
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Tổng tiền SP:{' '}
                        <strong style={{ color: '#059669', fontSize: '13px' }}>
                            {formatDisplayNumber(totalAmount)}
                        </strong>
                    </span>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            padding: '6px 18px',
                            fontSize: '12px',
                            fontWeight: 700,
                            background: saveSuccess ? '#10b981' : '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: '0 1px 3px rgba(22, 163, 74, 0.35)',
                            transition: 'all 0.15s'
                        }}
                        title="Lưu chi tiết sản phẩm vào Google Sheets"
                    >
                        <Save style={{ width: 14, height: 14 }} />
                        <span>{isSaving ? 'Đang lưu...' : saveSuccess ? '✅ Đã lưu!' : '💾 LƯU SẢN PHẨM'}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onOpenDetail(mdh)}
                        style={{
                            padding: '5px 10px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: '#ffffff',
                            color: '#4338ca',
                            border: '1px solid #c7d2fe',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        title="Mở modal chỉnh sửa toàn bộ đơn hàng"
                    >
                        <ExternalLink style={{ width: 14, height: 14 }} />
                        <span>Chi Tiết ĐH</span>
                    </button>
                </div>
            </div>

            <table
                style={{
                    width: '100%',
                    maxWidth: '980px',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
            >
                <thead>
                    <tr style={{ background: '#e2e8f0', color: '#334155', fontWeight: 700, borderBottom: '1px solid #cbd5e1' }}>
                        <th style={{ padding: '6px 8px', width: '36px', textAlign: 'center' }}>#</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>SKU</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left', width: '230px' }}>ID SP</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', width: '75px' }}>Số lượng</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right', width: '120px' }}>Đơn giá</th>
                        <th style={{ padding: '6px 8px', textAlign: 'right', width: '130px' }}>Thành tiền</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center', width: '85px' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, i) => {
                        const slg = Math.max(0, parseInt(item.slg, 10) || 0);
                        const donGia = parseMoney(item.don_gia || 0);
                        const subtotal = slg * donGia;
                        const spName = (item.id_sp && dsSpNameMap.has(item.id_sp.toUpperCase()))
                            ? dsSpNameMap.get(item.id_sp.toUpperCase())
                            : (item.id_sp && dsSpNameMap.has(item.id_sp.slice(0, 4).toUpperCase()))
                                ? dsSpNameMap.get(item.id_sp.slice(0, 4).toUpperCase())
                                : '';

                        return (
                            <tr
                                key={item._localId || i}
                                style={{
                                    borderBottom: '1px solid #e2e8f0',
                                    background: i % 2 === 0 ? '#ffffff' : '#f8fafc'
                                }}
                            >
                                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#64748b', fontWeight: 700 }}>
                                    {i + 1}
                                </td>
                                <td style={{ padding: '6px 8px' }}>
                                    <input
                                        type="text"
                                        value={item.sku || ''}
                                        onChange={(e) => handleSkuChange(i, e.target.value)}
                                        placeholder="SKU sản phẩm..."
                                        style={{
                                            width: '100%',
                                            minWidth: '110px',
                                            padding: '5px 8px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            background: '#ffffff'
                                        }}
                                    />
                                </td>
                                <td style={{ padding: '6px 8px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <input
                                            type="text"
                                            list="dhIdSpOptions"
                                            value={item.id_sp || ''}
                                            onChange={(e) => handleIdSpChange(i, e.target.value)}
                                            placeholder="Chọn hoặc nhập ID SP..."
                                            style={{
                                                width: '100%',
                                                minWidth: '130px',
                                                padding: '5px 8px',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                color: '#1e40af',
                                                background: '#ffffff'
                                            }}
                                        />
                                        {spName && (
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#64748b',
                                                    marginTop: '2px',
                                                    maxWidth: '250px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                title={spName}
                                            >
                                                {spName}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        value={item.slg ?? 0}
                                        onChange={(e) => handleSlgChange(i, e.target.value)}
                                        style={{
                                            width: '65px',
                                            textAlign: 'center',
                                            padding: '5px 6px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 700,
                                            background: '#ffffff'
                                        }}
                                    />
                                </td>
                                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                                    <input
                                        type="text"
                                        value={formatDisplayNumber(item.don_gia)}
                                        onChange={(e) => handleDonGiaChange(i, e.target.value)}
                                        style={{
                                            width: '110px',
                                            textAlign: 'right',
                                            padding: '5px 8px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            background: '#ffffff'
                                        }}
                                    />
                                </td>
                                <td style={{ padding: '6px 8px', textAlign: 'right' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                                        {formatDisplayNumber(subtotal)}
                                    </span>
                                </td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        style={{
                                            background: '#16a34a',
                                            color: '#ffffff',
                                            border: 'none',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            padding: '4px 8px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            marginRight: '4px'
                                        }}
                                        title="Lưu dòng này và đơn hàng"
                                    >
                                        💾 Lưu
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteItem(i)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            padding: '2px'
                                        }}
                                        title="Xóa dòng sản phẩm này"
                                    >
                                        <Trash2 style={{ width: 14, height: 14 }} />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
