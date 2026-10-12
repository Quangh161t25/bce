import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
    currentPage,
    totalRows,
    rowsPerPage = 100,
    onPageChange
}) {
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

    if (totalRows <= rowsPerPage) {
        return null;
    }

    const startRow = Math.min((currentPage - 1) * rowsPerPage + 1, totalRows);
    const endRow = Math.min(currentPage * rowsPerPage, totalRows);

    return (
        <div id="pagination" className="pagination-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '8px' }}>
            <button
                className="pagination-btn"
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px'
                }}
            >
                <ChevronLeft style={{ width: 16, height: 16 }} />
                <span>Trước</span>
            </button>

            <div className="page-info" style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                Trang {currentPage} / {totalPages} ({startRow}-{endRow} của {totalRows.toLocaleString('vi-VN')} dòng)
            </div>

            <button
                className="pagination-btn"
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px'
                }}
            >
                <span>Tiếp</span>
                <ChevronRight style={{ width: 16, height: 16 }} />
            </button>
        </div>
    );
}
