import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { parseMoney, formatDisplayNumber } from '../../utils/formatters.js';
import { recalculateDhFinancials } from '../../utils/calculations.js';

export default function DhDetailModal({
    isOpen,
    onClose,
    mdh,
    orderData, // master row or initial fields
    initialItems = [],
    dsSpPriceMap = new Map(),
    dsSpNameMap = new Map(),
    onSaveOrder
}) {
    const [formData, setFormData] = useState({});
    const [items, setItems] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && orderData) {
            setFormData({
                gian: orderData.gian ?? '',
                ngay: orderData.ngay ?? '',
                ngay_gio: orderData.ngay_gio ?? '',
                mdh: orderData.mdh ?? mdh ?? '',
                mvd: orderData.mvd ?? '',
                mvd_huy: orderData.mvd_huy ?? '',
                mdh_huy: orderData.mdh_huy ?? '',
                ten_khach: orderData.ten_khach ?? '',
                ng_nhan: orderData.ng_nhan ?? '',
                dia_chi: orderData.dia_chi ?? '',
                link_don: orderData.link_don ?? '',
                tinh_trang: orderData.tinh_trang ?? '',
                trang_thai: orderData.trang_thai ?? '',
                tong_tien: orderData.tong_tien ?? 0,
                ma_giam_gia: orderData.ma_giam_gia ?? 0,
                phi_vc: orderData.phi_vc ?? 0,
                phu_phi: orderData.phu_phi ?? 0,
                thue: orderData.thue ?? 0,
                phi_khac: orderData.phi_khac ?? 0,
                doanh_thu: orderData.doanh_thu ?? 0,
                tien_sp: orderData.tien_sp ?? 0,
                loi_nhuan: orderData.loi_nhuan ?? 0
            });

            setItems(
                initialItems.map((item, idx) => ({
                    ...item,
                    _localId: item._sheetRow || `item_${idx}`
                }))
            );
        }
    }, [isOpen, orderData, mdh, initialItems]);

    // Recalculate financials whenever relevant fields or items change
    useEffect(() => {
        if (!isOpen) return;

        const calc = recalculateDhFinancials({
            tinhTrang: formData.tinh_trang,
            tongTien: formData.tong_tien,
            phiVc: formData.phi_vc,
            phuPhi: formData.phu_phi,
            thue: formData.thue,
            phiKhac: formData.phi_khac,
            items
        });

        setFormData(prev => ({
            ...prev,
            tien_sp: calc.tienSp,
            doanh_thu: calc.doanhThu,
            loi_nhuan: calc.loiNhuan
        }));
    }, [
        formData.tinh_trang,
        formData.tong_tien,
        formData.phi_vc,
        formData.phu_phi,
        formData.thue,
        formData.phi_khac,
        items,
        isOpen
    ]);

    if (!isOpen) return null;

    const handleFieldChange = (field, val) => {
        setFormData(prev => ({ ...prev, [field]: val }));
    };

    const handleMoneyFieldChange = (field, val) => {
        const num = parseMoney(val);
        setFormData(prev => ({ ...prev, [field]: num }));
    };

    const setTinhTrang = (val) => {
        let newTrangThai = formData.trang_thai;
        if (val === 'HỦY') {
            newTrangThai = 'HỦY';
        } else if (val === 'HOÀN' || val === 'TRẢ') {
            newTrangThai = 'HOÀN TRẢ';
        } else if (val === 'XONG') {
            newTrangThai = 'HOÀN THÀNH';
        }

        setFormData(prev => ({
            ...prev,
            tinh_trang: val,
            trang_thai: newTrangThai
        }));
    };

    const setTrangThai = (val) => {
        setFormData(prev => ({ ...prev, trang_thai: val }));
    };

    const handleItemSkuChange = (index, value) => {
        const next = [...items];
        next[index] = { ...next[index], sku: value };
        if (!next[index].id_sp && value.trim().length >= 4) {
            const prefix = value.trim().slice(0, 4).toUpperCase();
            if (dsSpPriceMap.has(prefix)) {
                next[index].id_sp = prefix;
                const matched = dsSpPriceMap.get(prefix);
                if (matched && matched.giaBan > 0 && !next[index].don_gia) {
                    next[index].don_gia = matched.giaBan;
                }
            }
        }
        setItems(next);
    };

    const handleItemIdSpChange = (index, value) => {
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

    const handleItemSlgChange = (index, value) => {
        const next = [...items];
        next[index] = { ...next[index], slg: Math.max(0, parseInt(value, 10) || 0) };
        setItems(next);
    };

    const handleItemDonGiaChange = (index, value) => {
        const next = [...items];
        next[index] = { ...next[index], don_gia: parseMoney(value) };
        setItems(next);
    };

    const handleAddItem = () => {
        setItems([
            ...items,
            { sku: '', id_sp: '', slg: 1, don_gia: 0, _sheetRow: null, _localId: `new_${Date.now()}` }
        ]);
    };

    const handleDeleteItem = (index) => {
        if (items.length <= 1) {
            alert('Đơn hàng cần có ít nhất 1 sản phẩm.');
            return;
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSaveOrder(formData, items);
            onClose();
        } catch (err) {
            console.error('Error saving order detail:', err);
            alert('Lỗi khi lưu đơn hàng: ' + (err.message || err));
        } finally {
            setIsSaving(false);
        }
    };

    const normTinhTrang = String(formData.tinh_trang || '').trim().toUpperCase();
    const normTrangThai = String(formData.trang_thai || '').trim().toUpperCase();

    return (
        <div
            id="dhDetailModal"
            className="modal"
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
                if (e.target.id === 'dhDetailModal') onClose();
            }}
        >
            <div
                className="modal-content"
                style={{
                    background: '#ffffff',
                    width: '95vw',
                    maxWidth: '1200px',
                    height: '92vh',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 20px',
                        borderBottom: '1px solid #e2e8f0',
                        background: '#f8fafc'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                            Chi Tiết Đơn Hàng ĐH: <span style={{ color: '#4f46e5' }}>{formData.mdh}</span>
                        </h2>
                        <span
                            style={{
                                background: '#e0e7ff',
                                color: '#3730a3',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '10px'
                            }}
                        >
                            {items.length} SP
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b'
                        }}
                    >
                        <X style={{ width: 22, height: 22 }} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div
                    style={{
                        padding: '16px 20px',
                        overflowY: 'auto',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}
                >
                    {/* Top 2 Columns: Thông tin đơn hàng & Thông tin tài chính */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>
                        {/* THÔNG TIN ĐƠN HÀNG */}
                        <div
                            style={{
                                background: '#f8fafc',
                                padding: '16px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}
                        >
                            <div style={{ fontWeight: 700, color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: '6px', fontSize: '0.95rem' }}>
                                📌 THÔNG TIN ĐƠN HÀNG
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* GIAN */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>gian</span>
                                    <input
                                        type="text"
                                        value={formData.gian}
                                        onChange={(e) => handleFieldChange('gian', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
                                    />
                                </div>

                                {/* NGAY */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>ngay</span>
                                    <input
                                        type="text"
                                        value={formData.ngay}
                                        onChange={(e) => handleFieldChange('ngay', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
                                    />
                                </div>

                                {/* NGAY_GIO */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>ngay_gio</span>
                                    <input
                                        type="text"
                                        value={formData.ngay_gio}
                                        onChange={(e) => handleFieldChange('ngay_gio', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
                                    />
                                </div>

                                {/* MDH (Read-only) */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>mdh</span>
                                    <input
                                        type="text"
                                        value={formData.mdh}
                                        readOnly
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, fontSize: '13px', background: '#f1f5f9', cursor: 'not-allowed' }}
                                    />
                                </div>

                                {/* MVD */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>mvd</span>
                                    <input
                                        type="text"
                                        value={formData.mvd}
                                        onChange={(e) => handleFieldChange('mvd', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
                                    />
                                </div>

                                {/* MVD_HUY (Requested by user) */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', minWidth: '105px', textTransform: 'uppercase' }}>mvd_huy</span>
                                    <input
                                        type="text"
                                        value={formData.mvd_huy}
                                        onChange={(e) => handleFieldChange('mvd_huy', e.target.value)}
                                        placeholder="Mã vận đơn hủy (nếu có)..."
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
                                    />
                                </div>

                                {/* MDH_HUY (Requested by user) */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', minWidth: '105px', textTransform: 'uppercase' }}>mdh_huy</span>
                                    <input
                                        type="text"
                                        value={formData.mdh_huy}
                                        onChange={(e) => handleFieldChange('mdh_huy', e.target.value)}
                                        placeholder="Mã đơn hàng hủy (nếu có)..."
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #fca5a5', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
                                    />
                                </div>

                                {/* TEN_KHACH */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>ten_khach</span>
                                    <input
                                        type="text"
                                        value={formData.ten_khach}
                                        onChange={(e) => handleFieldChange('ten_khach', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
                                    />
                                </div>

                                {/* NG_NHAN */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>ng_nhan</span>
                                    <input
                                        type="text"
                                        value={formData.ng_nhan}
                                        onChange={(e) => handleFieldChange('ng_nhan', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
                                    />
                                </div>

                                {/* DIA_CHI */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>dia_chi</span>
                                    <input
                                        type="text"
                                        value={formData.dia_chi}
                                        onChange={(e) => handleFieldChange('dia_chi', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
                                    />
                                </div>

                                {/* LINK_DON */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>link_don</span>
                                    <input
                                        type="text"
                                        value={formData.link_don}
                                        onChange={(e) => handleFieldChange('link_don', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, fontSize: '13px' }}
                                    />
                                </div>

                                {/* TINH_TRANG (Buttons: HỦY, HOÀN, TRẢ, XONG) */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>tinh_trang</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                                        {['HỦY', 'HOÀN', 'TRẢ', 'XONG'].map((val) => {
                                            const isMatch = normTinhTrang === val;
                                            let bg = isMatch ? '#16a34a' : '#f0fdf4';
                                            let color = isMatch ? '#ffffff' : '#16a34a';
                                            let border = '#bbf7d0';
                                            if (val === 'HỦY') {
                                                bg = isMatch ? '#dc2626' : '#fef2f2';
                                                color = isMatch ? '#ffffff' : '#dc2626';
                                                border = '#fca5a5';
                                            } else if (val === 'HOÀN' || val === 'TRẢ') {
                                                bg = isMatch ? '#d97706' : '#fffbeb';
                                                color = isMatch ? '#ffffff' : '#d97706';
                                                border = '#fde68a';
                                            }
                                            return (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setTinhTrang(val)}
                                                    style={{
                                                        padding: '5px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        border: `1px solid ${border}`,
                                                        background: bg,
                                                        color: color,
                                                        transition: 'all 0.15s'
                                                    }}
                                                >
                                                    {val}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* TRANG_THAI (Buttons: HỦY, HOÀN TRẢ, HOÀN THÀNH, XUNG ĐỘT) */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>trang_thai</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
                                        {['HỦY', 'HOÀN TRẢ', 'HOÀN THÀNH', 'XUNG ĐỘT'].map((val) => {
                                            const isMatch = (normTrangThai === val) || (val === 'HOÀN THÀNH' && normTrangThai === 'XONG');
                                            let bg = isMatch ? '#16a34a' : '#f0fdf4';
                                            let color = isMatch ? '#ffffff' : '#16a34a';
                                            let border = '#bbf7d0';
                                            if (val === 'HỦY') {
                                                bg = isMatch ? '#dc2626' : '#fef2f2';
                                                color = isMatch ? '#ffffff' : '#dc2626';
                                                border = '#fca5a5';
                                            } else if (val === 'HOÀN TRẢ') {
                                                bg = isMatch ? '#d97706' : '#fffbeb';
                                                color = isMatch ? '#ffffff' : '#d97706';
                                                border = '#fde68a';
                                            } else if (val === 'XUNG ĐỘT') {
                                                bg = isMatch ? '#b91c1c' : '#fef2f2';
                                                color = isMatch ? '#ffffff' : '#b91c1c';
                                                border = '#f87171';
                                            }
                                            return (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setTrangThai(val)}
                                                    style={{
                                                        padding: '5px 12px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: 700,
                                                        cursor: 'pointer',
                                                        border: `1px solid ${border}`,
                                                        background: bg,
                                                        color: color,
                                                        transition: 'all 0.15s'
                                                    }}
                                                >
                                                    {val}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* THÔNG TIN TÀI CHÍNH */}
                        <div
                            style={{
                                background: '#f0fdf4',
                                padding: '16px',
                                border: '1px solid #bbf7d0',
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}
                        >
                            <div style={{ fontWeight: 700, color: '#15803d', borderBottom: '2px solid #86efac', paddingBottom: '6px', fontSize: '0.95rem' }}>
                                💰 THÔNG TIN TÀI CHÍNH
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {/* TONG_TIEN */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>tong_tien</span>
                                    <input
                                        type="text"
                                        value={formatDisplayNumber(formData.tong_tien)}
                                        onChange={(e) => handleMoneyFieldChange('tong_tien', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, fontSize: '13px', textAlign: 'right' }}
                                    />
                                </div>

                                {/* MA_GIAM_GIA */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>ma_giam_gia</span>
                                    <input
                                        type="text"
                                        value={formatDisplayNumber(formData.ma_giam_gia)}
                                        onChange={(e) => handleMoneyFieldChange('ma_giam_gia', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, fontSize: '13px', textAlign: 'right' }}
                                    />
                                </div>

                                {/* PHI_VC */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>phi_vc</span>
                                    <input
                                        type="text"
                                        value={formatDisplayNumber(formData.phi_vc)}
                                        onChange={(e) => handleMoneyFieldChange('phi_vc', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, fontSize: '13px', textAlign: 'right' }}
                                    />
                                </div>

                                {/* PHU_PHI */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>phu_phi</span>
                                    <input
                                        type="text"
                                        value={formatDisplayNumber(formData.phu_phi)}
                                        onChange={(e) => handleMoneyFieldChange('phu_phi', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, fontSize: '13px', textAlign: 'right' }}
                                    />
                                </div>

                                {/* THUE */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>thue</span>
                                    <input
                                        type="text"
                                        value={formatDisplayNumber(formData.thue)}
                                        onChange={(e) => handleMoneyFieldChange('thue', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, fontSize: '13px', textAlign: 'right' }}
                                    />
                                </div>

                                {/* PHI_KHAC */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>phi_khac</span>
                                    <input
                                        type="text"
                                        value={formatDisplayNumber(formData.phi_khac)}
                                        onChange={(e) => handleMoneyFieldChange('phi_khac', e.target.value)}
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, fontSize: '13px', textAlign: 'right' }}
                                    />
                                </div>

                                {/* TIEN_SP (Calculated) */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>tien_sp</span>
                                    <input
                                        type="text"
                                        value={formatDisplayNumber(formData.tien_sp)}
                                        readOnly
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, fontSize: '13px', textAlign: 'right', background: '#f1f5f9', cursor: 'not-allowed' }}
                                    />
                                </div>

                                {/* DOANH_THU (Calculated) */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', minWidth: '105px', textTransform: 'uppercase' }}>doanh_thu</span>
                                    <input
                                        type="text"
                                        value={formatDisplayNumber(formData.doanh_thu)}
                                        readOnly
                                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, fontSize: '13px', textAlign: 'right', background: '#f1f5f9', cursor: 'not-allowed' }}
                                    />
                                </div>

                                {/* LOI_NHUAN (Calculated) */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', minWidth: '105px', textTransform: 'uppercase' }}>loi_nhuan</span>
                                    <input
                                        type="text"
                                        value={formatDisplayNumber(formData.loi_nhuan)}
                                        readOnly
                                        style={{
                                            flex: 1,
                                            padding: '6px 10px',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '6px',
                                            fontWeight: 800,
                                            fontSize: '14px',
                                            textAlign: 'right',
                                            background: '#f1f5f9',
                                            color: formData.loi_nhuan < 0 ? '#dc2626' : '#16a34a',
                                            cursor: 'not-allowed'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SẢN PHẨM TRONG ĐƠN HÀNG */}
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                                📦 SẢN PHẨM TRONG ĐƠN HÀNG ({items.length})
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                style={{
                                    padding: '5px 10px',
                                    background: '#eff6ff',
                                    color: '#1e40af',
                                    border: '1px solid #bfdbfe',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Plus style={{ width: 14, height: 14 }} />
                                <span>Thêm SP</span>
                            </button>
                        </div>

                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', color: '#475569', fontWeight: 700 }}>
                                    <th style={{ padding: '8px 10px', width: '36px', textAlign: 'center' }}>#</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'left' }}>SKU</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '220px' }}>ID SP</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '80px' }}>Số lượng</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '130px' }}>Đơn giá</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '130px' }}>Thành tiền</th>
                                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '60px' }}>Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => {
                                    const slg = Math.max(0, parseInt(item.slg, 10) || 0);
                                    const donGia = parseMoney(item.don_gia || 0);
                                    const subtotal = slg * donGia;

                                    return (
                                        <tr key={item._localId || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>{i + 1}</td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <input
                                                    type="text"
                                                    value={item.sku || ''}
                                                    onChange={(e) => handleItemSkuChange(i, e.target.value)}
                                                    placeholder="SKU sản phẩm..."
                                                    style={{ width: '100%', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600 }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px' }}>
                                                <input
                                                    type="text"
                                                    list="dhIdSpOptions"
                                                    value={item.id_sp || ''}
                                                    onChange={(e) => handleItemIdSpChange(i, e.target.value)}
                                                    placeholder="ID SP..."
                                                    style={{ width: '100%', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700, color: '#1e40af' }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={item.slg ?? 0}
                                                    onChange={(e) => handleItemSlgChange(i, e.target.value)}
                                                    style={{ width: '65px', textAlign: 'center', padding: '5px 6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 700 }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                                                <input
                                                    type="text"
                                                    value={formatDisplayNumber(item.don_gia)}
                                                    onChange={(e) => handleItemDonGiaChange(i, e.target.value)}
                                                    style={{ width: '110px', textAlign: 'right', padding: '5px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600 }}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                                {formatDisplayNumber(subtotal)}
                                            </td>
                                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteItem(i)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
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
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: '12px 20px',
                        borderTop: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
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
                            background: '#ffffff',
                            color: '#475569',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        ❌ Đóng
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            padding: '8px 24px',
                            borderRadius: '6px',
                            background: '#4f46e5',
                            color: '#ffffff',
                            fontWeight: 700,
                            border: 'none',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)'
                        }}
                    >
                        <Save style={{ width: 16, height: 16 }} />
                        <span>{isSaving ? 'Đang lưu...' : '💾 Lưu Đơn Hàng'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
