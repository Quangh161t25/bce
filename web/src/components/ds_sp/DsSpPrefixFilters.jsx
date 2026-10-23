import React from 'react';

export default function DsSpPrefixFilters({
    rows = [],
    currentTab,
    prefix1Filter = '',
    onPrefix1Change,
    prefix2Filter = '',
    onPrefix2Change
}) {
    if (currentTab !== 'DS_SP' && currentTab !== 'TINH_GIA' && currentTab !== 'WEB_SP') {
        return null;
    }

    if (!rows || rows.length === 0) {
        return null;
    }

    const getCode = (r) => {
        if (currentTab === 'WEB_SP') return String(r[2] || '').trim().toUpperCase();
        return String(r[1] || '').trim().toUpperCase();
    };

    // Calculate prefix1 counts
    const p1Counts = new Map();
    rows.forEach((r) => {
        const c = getCode(r);
        if (c.length >= 1) {
            const p1 = c.substring(0, 1);
            p1Counts.set(p1, (p1Counts.get(p1) || 0) + 1);
        }
    });

    // Sort reverse alphabetically (Z to A, 9 to 0) matching legacy app.js
    const sortedP1 = Array.from(p1Counts.entries())
        .filter(([_, cnt]) => cnt > 0)
        .sort((a, b) => b[0].localeCompare(a[0], 'vi', { numeric: true, sensitivity: 'base' }));

    // Calculate prefix2 counts based on prefix1
    const p2Counts = new Map();
    let p2Total = 0;
    rows.forEach((r) => {
        const c = getCode(r);
        if (!prefix1Filter || c.startsWith(prefix1Filter)) {
            p2Total++;
            if (c.length >= 2) {
                const p2 = c.substring(0, 2);
                p2Counts.set(p2, (p2Counts.get(p2) || 0) + 1);
            }
        }
    });

    const sortedP2 = Array.from(p2Counts.entries())
        .filter(([_, cnt]) => cnt > 0)
        .sort((a, b) => b[0].localeCompare(a[0], 'vi', { numeric: true, sensitivity: 'base' }));

    return (
        <div
            id="dsSpFilters"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '8px 12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '6px'
            }}
        >
            {/* 1-char prefixes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', minWidth: '60px' }}>
                    1 KÝ TỰ:
                </span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => {
                            onPrefix1Change('');
                            onPrefix2Change('');
                        }}
                        style={{
                            height: '26px',
                            padding: '0 8px',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: !prefix1Filter ? '#4f46e5' : '#f8fafc',
                            color: !prefix1Filter ? '#ffffff' : '#334155',
                            border: `1px solid ${!prefix1Filter ? '#4338ca' : '#cbd5e1'}`
                        }}
                    >
                        Tất cả <sub style={{ fontSize: '9px', fontWeight: 800 }}>{rows.length}</sub>
                    </button>

                    {sortedP1.map(([p, cnt]) => {
                        const isActive = prefix1Filter === p;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => {
                                    const next = isActive ? '' : p;
                                    onPrefix1Change(next);
                                    onPrefix2Change('');
                                }}
                                style={{
                                    height: '26px',
                                    padding: '0 8px',
                                    borderRadius: '5px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    background: isActive ? '#4f46e5' : '#ffffff',
                                    color: isActive ? '#ffffff' : '#334155',
                                    border: `1px solid ${isActive ? '#4338ca' : '#cbd5e1'}`
                                }}
                            >
                                {p} <sub style={{ fontSize: '9px', fontWeight: 800 }}>{cnt}</sub>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2-char prefixes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', minWidth: '60px' }}>
                    2 KÝ TỰ:
                </span>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        onClick={() => onPrefix2Change('')}
                        style={{
                            height: '26px',
                            padding: '0 8px',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: !prefix2Filter ? '#4f46e5' : '#f8fafc',
                            color: !prefix2Filter ? '#ffffff' : '#334155',
                            border: `1px solid ${!prefix2Filter ? '#4338ca' : '#cbd5e1'}`
                        }}
                    >
                        Tất cả <sub style={{ fontSize: '9px', fontWeight: 800 }}>{p2Total}</sub>
                    </button>

                    {sortedP2.map(([p, cnt]) => {
                        const isActive = prefix2Filter === p;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPrefix2Change(isActive ? '' : p)}
                                style={{
                                    height: '26px',
                                    padding: '0 8px',
                                    borderRadius: '5px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    background: isActive ? '#4f46e5' : '#ffffff',
                                    color: isActive ? '#ffffff' : '#334155',
                                    border: `1px solid ${isActive ? '#4338ca' : '#cbd5e1'}`
                                }}
                            >
                                {p} <sub style={{ fontSize: '9px', fontWeight: 800 }}>{cnt}</sub>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
