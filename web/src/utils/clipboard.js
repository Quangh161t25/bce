// Custom toast event dispatcher so any component or utility can trigger toasts
export function showToast(message) {
    window.dispatchEvent(new CustomEvent('app-toast', { detail: message }));
}

export function formatCustomCopyText(idSpCon, btnText, tenSp) {
    let cleanId = String(idSpCon || '').trim().replace(/-+$/, '');
    let cleanBtn = String(btnText || '').trim().replace(/^-+|-+$/g, '');
    let cleanName = String(tenSp || '').trim().replace(/^-+/, '');

    let parts = [cleanId];
    if (cleanBtn) parts.push(cleanBtn);
    parts.push('00-001');
    if (cleanName) parts.push(cleanName);

    return parts.join('-');
}

export async function copyToClipboard(text, successMessage = null) {
    const cleanText = String(text ?? '').trim();
    if (!cleanText) return false;

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(cleanText);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = cleanText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
        if (successMessage) {
            showToast(successMessage);
        }
        return true;
    } catch (err) {
        console.error('Failed to copy to clipboard', err);
        // Fallback
        try {
            const textarea = document.createElement('textarea');
            textarea.value = cleanText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            if (successMessage) {
                showToast(successMessage);
            }
            return true;
        } catch (e) {
            showToast('❌ Lỗi sao chép vào bộ nhớ đệm');
            return false;
        }
    }
}
