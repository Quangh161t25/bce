import React from 'react';

export default function LoadingMask({ visible, text = 'Đang tải dữ liệu...' }) {
    if (!visible) return null;

    return (
        <div id="loading" className="loading-mask" style={{ display: 'flex' }}>
            <div className="spinner"></div>
            <p style={{ whiteSpace: 'pre-line', textAlign: 'center' }}>{text}</p>
        </div>
    );
}
