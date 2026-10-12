import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { formatDisplayNumber, parseMoney } from '../../utils/formatters.js';
import { recalculateTinhGiaModalState } from '../../utils/calculations.js';

export default function TinhGiaModal({
    isOpen,
    onClose,
    row,
    headers = [],
    onSaveRow
}) {
    const [state, setState] = useState({
        tenSp: '',
        giaBan: 0,
        giaDang: 0,
        loiNhuanPt: 0,
        laiMongMuon: 0,
        phiAdsPt: 0,
        phiAffPt: 0,
        phiCoDinhPt: 11,
        phiGiaoDichPt: 6,
        xtraPt: 5.5,
        thuePt: 1.5,
        phiCoDinhVal: 0,
        phiGiaoDichVal: 0,
        xtraVal: 0,
        thueVal: 0,
        phiAdsVal: 0,
        phiAffVal: 0,
        tongChiPhi: 0,
        tySuat: '0%'
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen && row) {
            const tenSp = row[2] || '';
            const giaBan = parseMoney(row[4] || 0);
            const giaDang = parseMoney(row[9] || 0);
            const laiMongMuon = parseMoney(row[8] || 0);

            const getRate = (idx, def) => {
                const s = String(row[idx] ?? def).replace('%', '').replace(',', '.').trim();
                const n = parseFloat(s);
                return Number.isFinite(n) ? n : def;
            };

            const initialState = {
                tenSp,
                giaBan,
                giaDang,
                loiNhuanPt: getRate(7, 0),
                laiMongMuon,
                phiAdsPt: getRate(10, 0),
                phiAffPt: getRate(11, 0),
                phiCoDinhPt: getRate(12, 11),
                phiGiaoDichPt: getRate(14, 6),
                xtraPt: getRate(16, 5.5),
                thuePt: getRate(18, 1.5),
                phiCoDinhVal: 0,
                phiGiaoDichVal: 0,
                xtraVal: 0,
                thueVal: 0,
                phiAdsVal: 0,
                phiAffVal: 0,
                tongChiPhi: 0,
                tySuat: '0%'
            };

            const recalculated = recalculateTinhGiaModalState(initialState, 'gia_đăng');
            setState(recalculated);
        }
    }, [isOpen, row]);

    if (!isOpen || !row) return null;

    const handleGiaDangChange = (val) => {
        const num = parseMoney(val);
        const next = recalculateTinhGiaModalState({ ...state, giaDang: num }, 'gia_đăng');
        setState(next);
    };

    const handleLoiNhuanPtChange = (val) => {
        const num = parseFloat(val) || 0;
        const next = recalculateTinhGiaModalState({ ...state, loiNhuanPt: num }, 'loi_nhuan%');
        setState(next);
    };

    const handleLaiMongMuonChange = (val) => {
        const num = parseMoney(val);
        const next = recalculateTinhGiaModalState({ ...state, laiMongMuon: num }, 'lai_mong_muon');
        setState(next);
    };

    const handleFeeRateChange = (field, val) => {
        const num = parseFloat(val) || 0;
        const next = recalculateTinhGiaModalState({ ...state, [field]: num }, 'phi');
        setState(next);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updatedRow = [...row];
            updatedRow[7] = state.tySuat;
            updatedRow[8] = state.laiMongMuon;
            updatedRow[9] = state.giaDang;
            updatedRow[10] = state.phiAdsPt + '%';
            updatedRow[11] = state.phiAffPt + '%';
            updatedRow[12] = state.phiCoDinhPt + '%';
            updatedRow[13] = state.phiCoDinhVal;
            updatedRow[14] = state.phiGiaoDichPt + '%';
            updatedRow[15] = state.phiGiaoDichVal;
            updatedRow[16] = state.xtraPt + '%';
            updatedRow[17] = state.xtraVal;
            updatedRow[18] = state.thuePt + '%';
            updatedRow[19] = state.thueVal;
            updatedRow[20] = 3000;
            updatedRow[21] = 2700;

            await onSaveRow(updatedRow);
            onClose();
        } catch (err) {
            console.error('Save pricing row error:', err);
            alert('Lỗi lưu giá: ' + (err.message || err));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="modal-mask"
            id="tinhGiaModal"
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
                if (e.target.id === 'tinhGiaModal') onClose();
            }}
        >
            <form
                className="modal tinh-gia-modal"
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
                    <h2 id="tinhGiaTitle" style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                        Tính Giá Sản Phẩm
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

                <div className="modal-body" style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Basic info */}
                    <div className="tinh-gia-section" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div className="tinh-gia-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tên sản phẩm</label>
                            <input
                                type="text"
                                value={state.tenSp}
                                readOnly
                                style={{ flex: 1, padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f1f5f9', fontSize: '13px', fontWeight: 600 }}
                            />
                        </div>
                        <div className="tinh-gia-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Giá nhập NCC</label>
                            <input
                                type="text"
                                value={formatDisplayNumber(state.giaBan)}
                                readOnly
                                style={{ width: '150px', textAlign: 'right', padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f1f5f9', fontSize: '13px', fontWeight: 700 }}
                            />
                        </div>
                    </div>

                    {/* Pricing inputs */}
                    <div className="tinh-gia-section highlight-section" style={{ background: '#eef2ff', padding: '14px', borderRadius: '8px', border: '1px solid #c7d2fe', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="tinh-gia-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#3730a3' }}>
                                Giá đăng <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formatDisplayNumber(state.giaDang)}
                                onChange={(e) => handleGiaDangChange(e.target.value)}
                                style={{ width: '160px', textAlign: 'right', padding: '6px 10px', border: '1px solid #818cf8', borderRadius: '6px', fontWeight: 800, fontSize: '14px', color: '#1e1b4b' }}
                            />
                        </div>

                        <div className="tinh-gia-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#3730a3' }}>
                                Lợi nhuận (%) <span style={{ color: 'red' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={state.loiNhuanPt}
                                    onChange={(e) => handleLoiNhuanPtChange(e.target.value)}
                                    style={{ width: '85px', textAlign: 'right', padding: '6px 8px', border: '1px solid #818cf8', borderRadius: '6px', fontWeight: 700, fontSize: '13px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleLoiNhuanPtChange(10)}
                                    style={{ padding: '4px 8px', background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    10%
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleLoiNhuanPtChange(20)}
                                    style={{ padding: '4px 8px', background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '5px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    20%
                                </button>
                            </div>
                        </div>

                        <div className="tinh-gia-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 700, color: '#3730a3' }}>
                                Lãi mong muốn <span style={{ color: 'red' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={formatDisplayNumber(state.laiMongMuon)}
                                onChange={(e) => handleLaiMongMuonChange(e.target.value)}
                                style={{ width: '160px', textAlign: 'right', padding: '6px 10px', border: '1px solid #818cf8', borderRadius: '6px', fontWeight: 800, fontSize: '14px', color: '#4f46e5' }}
                            />
                        </div>
                    </div>

                    {/* Fees grid */}
                    <div className="tinh-gia-section" style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <label style={{ fontSize: '12px', color: '#475569' }}>Phí Ads (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={state.phiAdsPt}
                                    onChange={(e) => handleFeeRateChange('phiAdsPt', e.target.value)}
                                    style={{ width: '70px', textAlign: 'right', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <label style={{ fontSize: '12px', color: '#475569' }}>Phí Affiliate (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={state.phiAffPt}
                                    onChange={(e) => handleFeeRateChange('phiAffPt', e.target.value)}
                                    style={{ width: '70px', textAlign: 'right', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <label style={{ fontSize: '12px', color: '#475569' }}>Phí cố định (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={state.phiCoDinhPt}
                                    onChange={(e) => handleFeeRateChange('phiCoDinhPt', e.target.value)}
                                    style={{ width: '70px', textAlign: 'right', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <label style={{ fontSize: '12px', color: '#475569' }}>Phí giao dịch (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={state.phiGiaoDichPt}
                                    onChange={(e) => handleFeeRateChange('phiGiaoDichPt', e.target.value)}
                                    style={{ width: '70px', textAlign: 'right', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <label style={{ fontSize: '12px', color: '#475569' }}>XTRA (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={state.xtraPt}
                                    onChange={(e) => handleFeeRateChange('xtraPt', e.target.value)}
                                    style={{ width: '70px', textAlign: 'right', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                                <label style={{ fontSize: '12px', color: '#475569' }}>Thuế (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={state.thuePt}
                                    onChange={(e) => handleFeeRateChange('thuePt', e.target.value)}
                                    style={{ width: '70px', textAlign: 'right', padding: '4px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Breakdown & Results */}
                    <div className="tinh-gia-section result-section" style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Phí cố định:</span>
                            <span style={{ fontWeight: 600 }}>{formatDisplayNumber(state.phiCoDinhVal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Phí giao dịch:</span>
                            <span style={{ fontWeight: 600 }}>{formatDisplayNumber(state.phiGiaoDichVal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>XTRA:</span>
                            <span style={{ fontWeight: 600 }}>{formatDisplayNumber(state.xtraVal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Thuế:</span>
                            <span style={{ fontWeight: 600 }}>{formatDisplayNumber(state.thueVal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Phí hạ tầng:</span>
                            <span style={{ fontWeight: 600 }}>3.000</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>PiShip:</span>
                            <span style={{ fontWeight: 600 }}>2.700</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Phí Ads:</span>
                            <span style={{ fontWeight: 600 }}>{formatDisplayNumber(state.phiAdsVal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748b' }}>Phí Affiliate:</span>
                            <span style={{ fontWeight: 600 }}>{formatDisplayNumber(state.phiAffVal)}</span>
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid #cbd5e1', margin: '4px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1e293b' }}>
                            <span>TỔNG CHI PHÍ:</span>
                            <span>{formatDisplayNumber(state.tongChiPhi)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: state.laiMongMuon < 0 ? '#dc2626' : '#16a34a' }}>
                            <span>LỢI NHUẬN:</span>
                            <span>{formatDisplayNumber(state.laiMongMuon)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: state.laiMongMuon < 0 ? '#dc2626' : '#16a34a' }}>
                            <span>TỶ SUẤT LỢI NHUẬN:</span>
                            <span>{state.tySuat}</span>
                        </div>
                    </div>
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
                        style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
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
