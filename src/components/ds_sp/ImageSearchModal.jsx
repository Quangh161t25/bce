import React, { useState, useEffect } from 'react';
import { X, Search, Globe, Image as ImageIcon, Save, ExternalLink } from 'lucide-react';
import { searchBingImages } from '../../services/imageSearchService.js';

export default function ImageSearchModal({
    isOpen,
    onClose,
    productName = '',
    productId = '',
    currentImageUrl = '',
    onSaveImage
}) {
    const [query, setQuery] = useState('');
    const [directUrl, setDirectUrl] = useState('');
    const [selectedUrl, setSelectedUrl] = useState('');
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const initialQuery = productName || productId || '';
            setQuery(initialQuery);
            setDirectUrl(currentImageUrl || '');
            setSelectedUrl(currentImageUrl || '');
            setImages([]);
            setStatusMessage('');

            if (initialQuery) {
                performSearch(initialQuery);
            }
        }
    }, [isOpen, productName, productId, currentImageUrl]);

    const performSearch = async (searchQuery) => {
        const q = String(searchQuery || query).trim();
        if (!q) return;

        setIsLoading(true);
        setStatusMessage('Đang tìm kiếm ảnh từ Bing Images...');
        try {
            const items = await searchBingImages(q);
            setImages(items);
            if (items.length === 0) {
                setStatusMessage('Không tìm thấy ảnh tự động. Bạn có thể mở Bing/Google Images để copy link dán vào ô bên trên!');
            } else {
                setStatusMessage(`Tìm thấy ${items.length} ảnh cho "${q}"`);
            }
        } catch (err) {
            console.error('Image search error:', err);
            setStatusMessage('Lỗi khi tìm ảnh: ' + (err.message || err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectImage = (url) => {
        setSelectedUrl(url);
        setDirectUrl(url);
    };

    const handleOpenBing = () => {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    };

    const handleOpenGoogle = () => {
        const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
        window.open(url, '_blank');
    };

    const handleSave = async () => {
        const urlToSave = String(directUrl || selectedUrl).trim();
        if (!urlToSave) {
            alert('Vui lòng chọn hoặc dán link ảnh trước.');
            return;
        }

        setIsSaving(true);
        try {
            await onSaveImage(urlToSave);
            onClose();
        } catch (err) {
            console.error('Save image error:', err);
            alert('Lỗi khi lưu ảnh: ' + (err.message || err));
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            id="imageModal"
            className="modal-mask"
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
                if (e.target.id === 'imageModal') onClose();
            }}
        >
            <div
                className="modal"
                style={{
                    background: '#ffffff',
                    width: '90vw',
                    maxWidth: '1000px',
                    height: '85vh',
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
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
                    <div>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                            🖼️ Thêm / Tìm Ảnh Sản Phẩm (Ghi Cột K)
                        </h2>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {statusMessage || `${productId ? productId + ' - ' : ''}${productName}`}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                        <X style={{ width: 22, height: 22 }} />
                    </button>
                </div>

                {/* Toolbar */}
                <div
                    style={{
                        padding: '12px 20px',
                        borderBottom: '1px solid #e2e8f0',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}
                >
                    {/* Search row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        performSearch(query);
                                    }
                                }}
                                placeholder="Nhập từ khóa tìm kiếm ảnh..."
                                style={{ width: '100%', height: '36px', padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => performSearch(query)}
                            disabled={isLoading}
                            style={{
                                height: '36px',
                                padding: '0 14px',
                                background: '#4f46e5',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 700,
                                fontSize: '12px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Search style={{ width: 15, height: 15 }} />
                            <span>{isLoading ? 'Đang tìm...' : '🔍 Tìm Tự Động'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenBing}
                            style={{
                                height: '36px',
                                padding: '0 12px',
                                background: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <ExternalLink style={{ width: 14, height: 14 }} />
                            <span>🔎 Mở Bing</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenGoogle}
                            style={{
                                height: '36px',
                                padding: '0 12px',
                                background: '#ea580c',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 600,
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <Globe style={{ width: 14, height: 14 }} />
                            <span>🌐 Mở Google</span>
                        </button>
                    </div>

                    {/* Direct URL input */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>
                            Dán link trực tiếp:
                        </span>
                        <input
                            type="text"
                            value={directUrl}
                            onChange={(e) => {
                                setDirectUrl(e.target.value);
                                setSelectedUrl(e.target.value);
                            }}
                            placeholder="https://... (dán link ảnh trực tiếp tại đây)"
                            style={{ flex: 1, height: '34px', padding: '4px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
                        />
                    </div>
                </div>

                {/* Body (Images Grid) */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#f8fafc' }}>
                    {isLoading && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
                            <div style={{ fontSize: '14px', fontWeight: 600 }}>Đang tìm kiếm ảnh...</div>
                        </div>
                    )}

                    {!isLoading && images.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🖼️</div>
                            <div style={{ fontSize: '15px', fontWeight: 600, color: '#475569' }}>
                                Chưa có ảnh tự động nào
                            </div>
                            <div style={{ fontSize: '13px', marginTop: '6px', color: '#64748b' }}>
                                Bạn có thể tìm kiếm từ khóa mới hoặc bấm "Mở Google / Bing" để sao chép địa chỉ hình ảnh!
                            </div>
                        </div>
                    )}

                    {!isLoading && images.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                            {images.map((item, idx) => {
                                const isSelected = selectedUrl === item.link;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleSelectImage(item.link)}
                                        style={{
                                            border: `2px solid ${isSelected ? '#4f46e5' : '#e2e8f0'}`,
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            background: '#ffffff',
                                            transition: 'all 0.15s',
                                            boxShadow: isSelected ? '0 0 0 3px rgba(79, 70, 229, 0.3)' : 'none',
                                            transform: isSelected ? 'scale(1.02)' : 'none'
                                        }}
                                    >
                                        <div style={{ width: '100%', height: '130px', background: '#f1f5f9', overflow: 'hidden' }}>
                                            <img
                                                src={item.thumbnail || item.link}
                                                alt={item.title || 'Product'}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                        <div style={{ padding: '6px 8px' }}>
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#334155',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                title={item.title}
                                            >
                                                {item.title || 'Ảnh sản phẩm'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer with preview & Save */}
                <div
                    style={{
                        padding: '12px 20px',
                        borderTop: '1px solid #e2e8f0',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        {selectedUrl ? (
                            <img
                                src={selectedUrl}
                                alt="Preview"
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                <ImageIcon style={{ width: 20, height: 20 }} />
                            </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0, fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selectedUrl || 'Chưa chọn ảnh nào'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving || !selectedUrl}
                            style={{
                                padding: '8px 20px',
                                background: '#16a34a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 700,
                                cursor: (isSaving || !selectedUrl) ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 1px 3px rgba(22, 163, 74, 0.35)'
                            }}
                        >
                            <Save style={{ width: 16, height: 16 }} />
                            <span>{isSaving ? 'Đang lưu...' : '💾 Lưu Ảnh (Cột K)'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
