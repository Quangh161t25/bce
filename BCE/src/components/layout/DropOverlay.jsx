import React from 'react';
import { UploadCloud } from 'lucide-react';

export default function DropOverlay({ visible, currentTab }) {
    if (!visible) return null;

    return (
        <div id="dropOverlay" style={{ display: 'flex' }}>
            <div className="drop-message">
                <UploadCloud style={{ width: 48, height: 48 }} />
                <span>Thả file vào đây để tải dữ liệu lên {currentTab}</span>
            </div>
        </div>
    );
}
