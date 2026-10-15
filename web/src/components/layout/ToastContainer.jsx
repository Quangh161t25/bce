import React, { useState, useEffect } from 'react';

export default function ToastContainer() {
    const [toast, setToast] = useState(null);

    useEffect(() => {
        let timer = null;
        const handleToast = (e) => {
            const message = e.detail;
            setToast(message);
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                setToast(null);
            }, 3000);
        };

        window.addEventListener('app-toast', handleToast);
        return () => {
            window.removeEventListener('app-toast', handleToast);
            if (timer) clearTimeout(timer);
        };
    }, []);

    if (!toast) return null;

    return (
        <div
            id="bceToast"
            className="bce-toast-notification"
            style={{
                opacity: 1,
                transform: 'translateY(0)',
                display: 'block'
            }}
        >
            {toast}
        </div>
    );
}
