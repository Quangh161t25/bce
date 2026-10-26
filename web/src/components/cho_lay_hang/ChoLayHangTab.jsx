import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle,
    Clock,
    ExternalLink,
    Loader2,
    RefreshCw,
    Search,
    Truck
} from 'lucide-react';
import { formatMoneyVND } from '../../utils/formatters.js';
import {
    fetchChoLayHang,
    hasExtensionBridge,
    isExtensionPage,
    openShopeeSeller,
    pingExtension,
    STAGE_LABELS
} from '../../services/shopeeLiveOrders.js';

const AUTO_OPTIONS = [
    { value: 0, label: 'Tắt' },
    { value: 15, label: '15 giây' },
    { value: 30, label: '30 giây' },
    { value: 60, label: '1 phút' },
    { value: 120, label: '2 phút' },
    { value: 300, label: '5 phút' }
];

const STATUS_PILLS = [
    { value: 0, label: 'Tất cả' },
    { value: 1, label: 'Chưa xử lý' },
    { value: 2, label: 'Đã xử lý' }
];

const SORT_FIELDS = ['shipBy', 'total', 'orderTime'];

function timeText(ts) {
    if (!ts) return '';
    try {
        return new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (_) {
        return '';
    }
}

export default function ChoLayHangTab() {
    const bridgeReady = hasExtensionBridge();

    const [bridgeState, setBridgeState] = useState(bridgeReady ? 'checking' : 'missing');
    const [bridgeInfo, setBridgeInfo] = useState({ code: '', error: '', tried: '' });

    // Đang mở web BÊN TRONG extension mà manifest đang chạy chưa có "externally_connectable"
    // => Chrome đang giữ manifest cũ, web deploy chưa gọi được. Hiện nút cập nhật 1 lần.
    const manifestStale = useMemo(() => {
        if (!isExtensionPage()) return false;
        try {
            const man = chrome.runtime.getManifest();
            const matches = (man && man.externally_connectable && man.externally_connectable.matches) || [];
            return matches.length === 0;
        } catch (_) {
            return false;
        }
    }, []);

    const [status, setStatus] = useState(0);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [warnings, setWarnings] = useState([]);
    const [lastAt, setLastAt] = useState(0);
    const [totalOnShopee, setTotalOnShopee] = useState(0);
    const [autoSec, setAutoSec] = useState(30);
    const [limit, setLimit] = useState(200);
    const [search, setSearch] = useState('');
    const [sortCol, setSortCol] = useState('shipBy');
    const [sortDir, setSortDir] = useState('asc');
    const [nextAt, setNextAt] = useState(0);
    const [nowTick, setNowTick] = useState(Date.now());

    const inFlight = useRef(false);
    const pending = useRef(false);
    const statusRef = useRef(status);
    const autoSecRef = useRef(autoSec);
    const limitRef = useRef(limit);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    // Kiểm tra kết nối tới extension (để biết web đã deploy có gọi được background không).
    const checkBridge = useCallback(async () => {
        if (!hasExtensionBridge()) {
            setBridgeState('missing');
            setBridgeInfo({ code: 'no-bridge', error: '' });
            return false;
        }
        setBridgeState('checking');
        const r = await pingExtension();
        if (!mounted.current) return false;
        setBridgeState(r.ok ? 'ok' : 'error');
        setBridgeInfo(r.ok
            ? { code: '', error: '', tried: '' }
            : { code: r.code || 'unknown', error: r.error || '', tried: r.tried || '' });
        return !!r.ok;
    }, []);

    useEffect(() => {
        if (!bridgeReady) {
            setBridgeState('missing');
            setBridgeInfo({ code: 'no-bridge', error: '' });
            return;
        }
        checkBridge();
    }, [bridgeReady, checkBridge]);

    useEffect(() => { statusRef.current = status; }, [status]);
    useEffect(() => { autoSecRef.current = autoSec; }, [autoSec]);
    useEffect(() => { limitRef.current = limit; }, [limit]);

    const refresh = useCallback(async () => {
        if (inFlight.current) {
            pending.current = true; // đang tải: nhớ để tải lại ngay khi xong
            return;
        }
        if (!hasExtensionBridge()) {
            setError('Trang này không chạy trong extension nên chưa đọc được đơn Shopee. Hãy mở web từ extension (dist/index.html).');
            return;
        }
        inFlight.current = true;
        setLoading(true);
        try {
            const res = await fetchChoLayHang({ status: statusRef.current, limit: limitRef.current });
            if (!mounted.current) return;
            setRows(res.rows);
            setWarnings(res.errors);
            setLastAt(res.at);
            setTotalOnShopee(res.total);
            setError('');
        } catch (e) {
            if (!mounted.current) return;
            const msg = (e && e.message) || String(e);
            setError(msg);
            if (e && e.code && e.code !== 'unknown') {
                setBridgeState('error');
                setBridgeInfo({ code: e.code, error: msg, tried: (e && e.tried) || '' });
            } else if (/kết nối được background|Chưa kết nối được extension|Background không phản hồi|Extension chưa cập nhật/i.test(msg)) {
                setBridgeState('error');
                setBridgeInfo({ code: 'unknown', error: msg, tried: (e && e.tried) || '' });
            }
        } finally {
            inFlight.current = false;
            if (mounted.current) {
                setLoading(false);
                setNextAt(autoSecRef.current > 0 ? Date.now() + autoSecRef.current * 1000 : 0);
            }
            if (pending.current && mounted.current) {
                pending.current = false;
                refresh();
            }
        }
    }, []);

    // Đổi nhóm trạng thái / số lượng đơn cần lấy → tải lại ngay
    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, limit]);

    // Tự động làm mới
    useEffect(() => {
        setNextAt(autoSec > 0 ? Date.now() + autoSec * 1000 : 0);
        if (!autoSec) return undefined;
        const id = setInterval(() => {
            if (document.hidden) return;
            refresh();
        }, autoSec * 1000);
        return () => clearInterval(id);
    }, [autoSec, refresh]);

    // Đồng hồ đếm ngược
    useEffect(() => {
        const id = setInterval(() => setNowTick(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => {
            const hay = [r.orderSn, r.buyer, r.tracking, r.tag, (r.items || []).join(' ')]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return hay.includes(q);
        });
    }, [rows, search]);

    const displayed = useMemo(() => {
        const list = [...filtered];
        if (!SORT_FIELDS.includes(sortCol)) return list;
        const dir = sortDir === 'desc' ? -1 : 1;
        const value = (r) => {
            if (sortCol === 'shipBy') return r.shipByTs || Number.MAX_SAFE_INTEGER;
            if (sortCol === 'total') return Number(r.total) || 0;
            return Number(r.orderTime) || 0;
        };
        list.sort((a, b) => (value(a) - value(b)) * dir);
        return list;
    }, [filtered, sortCol, sortDir]);

    const summary = useMemo(() => {
        let pending = 0;
        let done = 0;
        let late = 0;
        let amount = 0;
        const now = Date.now();
        filtered.forEach((r) => {
            if (r.stage === 2) done += 1;
            else pending += 1;
            amount += Number(r.total) || 0;
            if (r.shipByTs && r.shipByTs < now + 6 * 3600 * 1000) late += 1;
        });
        return { pending, done, late, amount, count: filtered.length };
    }, [filtered, nowTick]);

    const toggleSort = (col) => {
        if (sortCol === col) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCol(col);
            setSortDir(col === 'total' ? 'desc' : 'asc');
        }
    };

    const remaining = nextAt ? Math.max(0, Math.round((nextAt - nowTick) / 1000)) : 0;
    const autoLabel = !autoSec
        ? 'Tự động: tắt'
        : loading
            ? 'Đang tải…'
            : remaining > 0
                ? `Cập nhật sau ${remaining}s`
                : 'Sắp cập nhật…';

    const sortArrow = (col) => (sortCol === col ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '');

    const thStyle = {
        padding: '8px 10px',
        background: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
        fontSize: '0.72rem',
        fontWeight: 800,
        color: '#475569',
        textTransform: 'uppercase',
        textAlign: 'left',
        whiteSpace: 'nowrap'
    };

    const tdStyle = {
        padding: '8px 10px',
        borderBottom: '1px solid #f1f5f9',
        fontSize: '0.8rem',
        color: '#334155',
        verticalAlign: 'top'
    };

    return (
        <div className="header-container">
            {/* Thanh công cụ */}
            <div
                id="choLayHangToolbar"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#0f172a' }}>
                    <Truck size={18} style={{ color: '#ee4d2d' }} />
                    CHỜ LẤY HÀNG
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {STATUS_PILLS.map((p) => {
                        const active = status === p.value;
                        return (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => setStatus(p.value)}
                                style={{
                                    height: '28px',
                                    padding: '2px 10px',
                                    background: active ? '#4f46e5' : '#ffffff',
                                    color: active ? '#ffffff' : '#334155',
                                    border: `1px solid ${active ? '#4338ca' : '#cbd5e1'}`,
                                    borderRadius: '6px',
                                    fontWeight: active ? 700 : 600,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {p.label}
                            </button>
                        );
                    })}
                </div>

                <div className="search-container" style={{ position: 'relative', flexGrow: 1, minWidth: '180px', maxWidth: '340px' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Tìm mã đơn, người mua, sản phẩm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '100%', paddingLeft: '32px' }}
                    />
                </div>

                <button
                    type="button"
                    onClick={() => refresh()}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#334155',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: loading ? 'wait' : 'pointer'
                    }}
                >
                    {loading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
                    Làm mới
                </button>

                <select
                    value={autoSec}
                    onChange={(e) => setAutoSec(Number(e.target.value))}
                    title="Tự động đọc lại danh sách đơn"
                    style={{
                        padding: '8px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        background: '#fff',
                        color: '#334155',
                        fontSize: '0.8rem',
                        fontWeight: 600
                    }}
                >
                    {AUTO_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>Tự động: {o.label}</option>
                    ))}
                </select>

                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    title="Số đơn tối đa lấy cho MỖI nhóm trạng thái"
                    style={{
                        padding: '8px 10px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        background: '#fff',
                        color: '#334155',
                        fontSize: '0.8rem',
                        fontWeight: 600
                    }}
                >
                    {[100, 200, 400].map((n) => (
                        <option key={n} value={n}>Tối đa: {n} đơn/nhóm</option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={() => openShopeeSeller()}
                    title="Mở tab Kênh Người Bán (bắt buộc để đọc đơn)"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fff',
                        color: '#ea580c',
                        border: '1px solid #fdba74',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                    }}
                >
                    <ExternalLink size={14} />
                    Kênh Người Bán
                </button>

                <span
                    title={
                        bridgeState === 'ok'
                            ? 'Extension đã kết nối — đơn được đọc trực tiếp từ Shopee'
                            : bridgeState === 'checking'
                                ? 'Đang kiểm tra kết nối tới extension…'
                                : 'Chưa kết nối được extension — xem hướng dẫn bên dưới'
                    }
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: bridgeState === 'ok' ? '#047857' : bridgeState === 'checking' ? '#64748b' : '#b91c1c',
                        background: bridgeState === 'ok' ? '#ecfdf5' : bridgeState === 'checking' ? '#f1f5f9' : '#fef2f2',
                        border: `1px solid ${bridgeState === 'ok' ? '#a7f3d0' : bridgeState === 'checking' ? '#e2e8f0' : '#fecaca'}`,
                        borderRadius: '999px',
                        padding: '4px 10px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            display: 'inline-block',
                            background: bridgeState === 'ok' ? '#10b981' : bridgeState === 'checking' ? '#94a3b8' : '#ef4444'
                        }}
                    />
                    Extension {bridgeState === 'ok'
                        ? 'đã kết nối'
                        : bridgeState === 'checking'
                            ? 'đang kiểm tra…'
                            : bridgeInfo.code === 'not-installed'
                                ? 'chưa cài'
                                : bridgeInfo.code === 'not-updated'
                                    ? 'cần reload'
                                    : 'chưa kết nối'}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                    <Clock size={13} />
                    {lastAt ? `Cập nhật ${timeText(lastAt)}` : 'Chưa có dữ liệu'}
                    <span style={{ color: '#cbd5e1' }}>·</span>
                    <span style={{ color: autoSec ? '#0f766e' : '#94a3b8' }}>{autoLabel}</span>
                </div>
            </div>

            {/* Thống kê nhanh */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '8px',
                    width: '100%'
                }}
            >
                {[
                    { label: 'ĐANG HIỂN THỊ', value: summary.count, color: '#1e40af', bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '#bfdbfe' },
                    { label: 'CHƯA XỬ LÝ', value: summary.pending, color: '#9a3412', bg: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', border: '#fed7aa' },
                    { label: 'ĐÃ XỬ LÝ', value: summary.done, color: '#166534', bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '#bbf7d0' },
                    { label: 'SẮP / QUÁ HẠN', value: summary.late, color: '#9f1239', bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', border: '#fecdd3' },
                    { label: 'TỔNG TIỀN', value: formatMoneyVND(summary.amount), color: '#5b21b6', bg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)', border: '#e9d5ff' }
                ].map((c) => (
                    <div
                        key={c.label}
                        style={{
                            background: c.bg,
                            border: `1px solid ${c.border}`,
                            borderRadius: '8px',
                            padding: '6px 12px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{ fontSize: '0.68rem', fontWeight: 800, color: c.color, textTransform: 'uppercase' }}>{c.label}</div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: c.color, marginTop: '1px' }}>{c.value}</div>
                    </div>
                ))}
            </div>

            {/* Cảnh báo */}
            {totalOnShopee > rows.length && (
                <div style={noticeStyle('#eff6ff', '#93c5fd', '#1e40af')}>
                    <AlertTriangle size={16} />
                    <span>
                        Shopee đang có <b>{totalOnShopee}</b> đơn nhưng mới lấy được <b>{rows.length}</b>.
                        {' '}Tăng ô "Tối đa" hoặc lọc theo nhóm trạng thái để lấy đủ.
                    </span>
                </div>
            )}

            {!bridgeReady && (
                <div style={noticeStyle('#fffbeb', '#f59e0b', '#92400e')}>
                    <AlertTriangle size={16} />
                    <span>
                        Module này đọc đơn trực tiếp từ Shopee qua extension, nên cần extension
                        {' '}<b>Shopee Quản Lý SP</b> đang được bật.
                        {' '}Hãy cài/bật extension rồi tải lại trang này.
                        {' '}(Cách khác: mở web trong extension — bấm icon extension → nút <b>🌐 Web</b>.)
                    </span>
                </div>
            )}

            {manifestStale && (
                <div style={{ ...noticeStyle('#eff6ff', '#3b82f6', '#1e40af'), alignItems: 'flex-start' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ flexGrow: 1 }}>
                        Extension đang chạy <b>bản cũ</b> nên <b>web đã deploy (Vercel) chưa gọi được</b>.
                        {' '}Bấm <b>Cập nhật ngay</b> (chỉ cần 1 lần) → đợi 2 giây → mở lại trang web và bấm <b>Ctrl+Shift+R</b>.
                    </span>
                    <button
                        type="button"
                        onClick={() => { try { chrome.runtime.reload(); } catch (_) { /* ignore */ } }}
                        style={{
                            flexShrink: 0,
                            background: '#2563eb',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 12px',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                        }}
                    >
                        Cập nhật ngay
                    </button>
                </div>
            )}

            {bridgeReady && bridgeState === 'error' && (
                <div style={{ ...noticeStyle('#fffbeb', '#f59e0b', '#92400e'), alignItems: 'flex-start' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ flexGrow: 1 }}>
                        {bridgeInfo.code === 'not-installed' && (
                            <>
                                Trình duyệt này <b>chưa cài extension</b>. Cách cài: mở <b>chrome://extensions</b>
                                {' '}→ bật <b>Developer mode</b> (Chế độ dành cho nhà phát triển) → <b>Load unpacked</b>
                                {' '}→ chọn thư mục extension (ví dụ <b>D:\tải xuống 2\exten them sp12</b>).
                            </>
                        )}
                        {bridgeInfo.code === 'not-updated' && (
                            <>
                                Extension đã cài nhưng <b>chưa cập nhật</b>. Mở <b>chrome://extensions</b>
                                {' '}→ bấm nút <b>↻</b> (Reload) trên thẻ extension — hoặc <b>thoát hẳn Chrome rồi mở lại</b> —
                                {' '}sau đó tải lại trang này (F5).
                            </>
                        )}
                        {(bridgeInfo.code === 'unknown' || !bridgeInfo.code) && (
                            <>
                                Chưa gọi được extension. Kiểm tra: extension đang bật; tên miền
                                {' '}<b>{(() => { try { return window.location.origin; } catch (_) { return ''; } })()}</b>
                                {' '}đã khai báo trong <b>"externally_connectable"</b> của manifest.json; đã bấm <b>Reload</b> extension.
                            </>
                        )}
                        <div style={{ marginTop: 6, fontSize: '0.72rem', fontWeight: 500 }}>
                            Cách khác, luôn dùng được: bấm <b>icon extension</b> trên thanh công cụ → bấm nút <b>🌐 Web</b>.
                        </div>
                        {bridgeInfo.error ? (
                            <div style={{ marginTop: 4, fontSize: '0.7rem', fontWeight: 500, opacity: 0.85, wordBreak: 'break-word' }}>
                                Lỗi gốc: <code>{bridgeInfo.error}</code>
                                {bridgeInfo.tried ? (
                                    <div style={{ marginTop: 2 }}>Đã thử: <code>{bridgeInfo.tried}</code></div>
                                ) : null}
                            </div>
                        ) : null}
                    </span>
                    <button
                        type="button"
                        onClick={() => { checkBridge().then((ok) => { if (ok) refresh(); }); }}
                        style={{
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#fff',
                            color: '#92400e',
                            border: '1px solid #f59e0b',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                        }}
                    >
                        Kiểm tra lại
                    </button>
                </div>
            )}

            {error && bridgeReady && bridgeState === 'ok' && (
                <div style={noticeStyle('#fef2f2', '#ef4444', '#991b1b')}>
                    <AlertTriangle size={16} />
                    <span>
                        {error}
                        {' '}Hãy mở tab <b>banhang.shopee.vn</b> và đăng nhập Kênh Người Bán.
                    </span>
                </div>
            )}

            {warnings.length > 0 && (
                <div style={noticeStyle('#fffbeb', '#f59e0b', '#92400e')}>
                    <AlertTriangle size={16} />
                    <span>
                        {rows.length === 0 ? 'Chưa lấy được đơn: ' : 'Một phần dữ liệu chưa lấy được: '}
                        {warnings.join(' · ')}
                    </span>
                </div>
            )}

            {/* Bảng đơn */}
            <div className="table-wrapper" style={{ position: 'relative' }}>
                <table style={{ tableLayout: 'auto', width: '100%' }}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Mã đơn</th>
                            <th style={thStyle}>Người mua</th>
                            <th style={{ ...thStyle, minWidth: '240px' }}>Sản phẩm</th>
                            <th
                                style={{ ...thStyle, cursor: 'pointer', textAlign: 'right' }}
                                onClick={() => toggleSort('total')}
                            >
                                Tổng tiền{sortArrow('total')}
                            </th>
                            <th style={thStyle}>Nhóm</th>
                            <th
                                style={{ ...thStyle, cursor: 'pointer' }}
                                onClick={() => toggleSort('shipBy')}
                            >
                                Hạn gửi{sortArrow('shipBy')}
                            </th>
                            <th style={thStyle}>ĐVVC / Mã vận đơn</th>
                            <th style={thStyle}>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayed.map((r) => {
                            const late = r.shipByTs && r.shipByTs < Date.now();
                            return (
                                <tr key={`${r.orderSn}-${r.packageNumber || r.orderId}`}>
                                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', fontWeight: 700, color: '#0f172a' }}>
                                        {r.orderSn || '—'}
                                        {r.packageNumber && (
                                            <div style={{ fontWeight: 500, fontSize: '0.68rem', color: '#94a3b8' }}>
                                                {r.packageNumber}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{r.buyer || '—'}</td>
                                    <td style={{ ...tdStyle, whiteSpace: 'normal', minWidth: '240px', maxWidth: '420px' }}>
                                        {(r.items || []).length > 0 ? (
                                            <div style={{ display: 'grid', gap: '2px' }}>
                                                {r.items.map((it, idx) => (
                                                    <div key={idx} style={{ lineHeight: 1.3 }}>{it}</div>
                                                ))}
                                            </div>
                                        ) : '—'}
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 700 }}>
                                        {formatMoneyVND(r.total)}
                                    </td>
                                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: '999px',
                                                fontSize: '0.7rem',
                                                fontWeight: 800,
                                                background: r.stage === 2 ? '#dcfce7' : '#ffedd5',
                                                color: r.stage === 2 ? '#166534' : '#9a3412'
                                            }}
                                        >
                                            {STAGE_LABELS[r.stage] || '—'}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, whiteSpace: 'nowrap', color: late || r.warn ? '#b91c1c' : '#334155', fontWeight: late || r.warn ? 700 : 500 }}>
                                        {r.shipBy || '—'}
                                    </td>
                                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                                        {r.carrier || '—'}
                                        {r.tracking && (
                                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                                                {r.tracking}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                                        <div>{r.status || '—'}</div>
                                        {r.tag && (
                                            <div style={{ fontSize: '0.68rem', color: r.warn ? '#b91c1c' : '#64748b', fontWeight: r.warn ? 700 : 500 }}>
                                                {r.tag}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {loading && rows.length === 0 && (
                    <div style={emptyStyle}>
                        <Loader2 size={22} className="spin" />
                        <span>Đang đọc đơn từ Shopee…</span>
                    </div>
                )}

                {!loading && displayed.length === 0 && (
                    <div style={emptyStyle}>
                        <Truck size={26} style={{ color: '#cbd5e1' }} />
                        <span>
                            {!bridgeReady
                                ? 'Chưa kết nối được extension nên chưa đọc được đơn.'
                                : error || (rows.length === 0 && warnings.length > 0)
                                    ? 'Chưa đọc được đơn nào từ Shopee.'
                                    : rows.length === 0
                                        ? 'Chưa có đơn nào ở trạng thái chờ lấy hàng.'
                                        : 'Không có đơn nào khớp từ khoá tìm kiếm.'}
                        </span>
                        {rows.length === 0 && bridgeReady && !error && (
                            <button
                                type="button"
                                onClick={() => refresh()}
                                style={{
                                    marginTop: '4px',
                                    background: '#4f46e5',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '7px 14px',
                                    fontWeight: 700,
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Đọc lại
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function noticeStyle(background, border, color) {
    return {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background,
        border: `1px solid ${border}`,
        color,
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '0.82rem',
        fontWeight: 600,
        lineHeight: 1.35
    };
}

const emptyStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '40px 12px',
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: 600
};
