import React from 'react';
import { formatMoneyVND, formatDisplayNumber } from '../../utils/formatters.js';

export default function DhSummaryStats({ totalOrders, totalRevenue, totalProfit }) {
    return (
        <div
            id="dhSummaryStatsBar"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '8px',
                marginBottom: '6px',
                width: '100%'
            }}
        >
            <div
                style={{
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>
                        📦 TỔNG ĐƠN HÀNG
                    </div>
                    <div id="dhStatTotalOrders" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', marginTop: '1px' }}>
                        {formatDisplayNumber(totalOrders)}
                    </div>
                </div>
            </div>

            <div
                style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
                        📈 TỔNG DOANH THU
                    </div>
                    <div id="dhStatTotalRevenue" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', marginTop: '1px' }}>
                        {formatMoneyVND(totalRevenue)}
                    </div>
                </div>
            </div>

            <div
                style={{
                    background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e9d5ff',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7e22ce', textTransform: 'uppercase' }}>
                        💰 TỔNG LỢI NHUẬN
                    </div>
                    <div id="dhStatTotalProfit" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6b21a8', marginTop: '1px' }}>
                        {formatMoneyVND(totalProfit)}
                    </div>
                </div>
            </div>
        </div>
    );
}
