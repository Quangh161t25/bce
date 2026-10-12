export async function searchBingImages(query) {
    let items = [];
    const bingTarget = 'https://www.bing.com/images/search?q=' + encodeURIComponent(query);
    let html = '';

    // 0. Nếu chạy trong môi trường Chrome Extension (có quyền truy cập trực tiếp <all_urls>)
    try {
        const directRes = await fetch(bingTarget, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });
        if (directRes.ok) {
            html = await directRes.text();
        }
    } catch (_) {}

    // 1. Local Server Bing API Proxy (configured in vite.config.js /api/bing-images -> localhost:8000)
    if (!html || html.length < 500) {
        try {
            const localRes = await fetch('/api/bing-images?q=' + encodeURIComponent(query));
            if (localRes.ok) {
                const localData = await localRes.json();
                if (localData.items && localData.items.length > 0) {
                    return localData.items;
                }
            }
        } catch (_) {}
    }

    // 2. Public CORS proxy fallback
    if (!html || html.length < 500) {
        try {
            const r = await fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(bingTarget));
            const j = await r.json();
            html = j.contents || '';
        } catch (_) {}
    }

    if (!html || html.length < 500) {
        try {
            const r = await fetch('https://corsproxy.io/?' + encodeURIComponent(bingTarget));
            html = await r.text();
        } catch (_) {}
    }

    if (html) {
        const murlMatches = [...html.matchAll(/murl&quot;:&quot;(https?:[^&]+)&quot;/g)].map(m => m[1]);
        const titleMatches = [...html.matchAll(/t1&quot;:&quot;([^&]+)&quot;/g)].map(m => m[1]);

        murlMatches.forEach((u, idx) => {
            const cleanUrl = u.replace(/\\/g, '');
            if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
                items.push({
                    link: cleanUrl,
                    thumbnail: cleanUrl,
                    title: titleMatches[idx] ? titleMatches[idx].replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec)) : query
                });
            }
        });
    }

    return items;
}
