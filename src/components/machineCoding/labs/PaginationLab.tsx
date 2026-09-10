import React, { useState, useMemo } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CustomSelect } from '../../ui/CustomSelect';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowRight, RotateCcw } from 'lucide-react';

const TOTAL_RECORDS_OPTIONS = [
  { value: '50', label: '50 Items (5 Pages)' },
  { value: '100', label: '100 Items (10 Pages)' },
  { value: '250', label: '250 Items (25 Pages)' },
  { value: '500', label: '500 Items (50 Pages)' },
  { value: '1000', label: '1,000 Items (100 Pages)' },
];

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 per page' },
  { value: '10', label: '10 per page' },
  { value: '20', label: '20 per page' },
  { value: '50', label: '50 per page' },
];

export const PaginationLab: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(6);
  const [totalItems, setTotalItems] = useState(250);
  const [pageSize, setPageSize] = useState(10);
  const [jumpPageInput, setJumpPageInput] = useState('');

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Safe page change within boundaries
  const handlePageChange = (p: number) => {
    const clamped = Math.max(1, Math.min(totalPages, p));
    setCurrentPage(clamped);
  };

  // Smart sliding window with ellipses algorithm
  const pageNumbers = useMemo(() => {
    const delta = 1; // Number of siblings around active page
    const leftSibling = Math.max(2, currentPage - delta);
    const rightSibling = Math.min(totalPages - 1, currentPage + delta);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    const list: (number | string)[] = [];

    // Always show page 1
    list.push(1);

    if (showLeftEllipsis) {
      list.push('left-ellipsis');
    } else if (leftSibling === 2) {
      list.push(2);
    }

    // Middle window
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        list.push(i);
      }
    }

    if (showRightEllipsis) {
      list.push('right-ellipsis');
    } else if (rightSibling === totalPages - 1 && totalPages > 1) {
      list.push(totalPages - 1);
    }

    // Always show last page if > 1
    if (totalPages > 1) {
      list.push(totalPages);
    }

    return Array.from(new Set(list));
  }, [currentPage, totalPages]);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpPageInput, 10);
    if (!isNaN(num)) {
      handlePageChange(num);
      setJumpPageInput('');
    }
  };

  const fromRecord = (currentPage - 1) * pageSize + 1;
  const toRecord = Math.min(currentPage * pageSize, totalItems);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      {/* Configuration & Controls Strip */}
      <Card variant="glass" padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Records:</span>
          <CustomSelect
            size="sm"
            value={String(totalItems)}
            options={TOTAL_RECORDS_OPTIONS}
            onChange={(val) => {
              setTotalItems(Number(val));
              setCurrentPage(1);
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Page Size:</span>
          <CustomSelect
            size="sm"
            value={String(pageSize)}
            options={PAGE_SIZE_OPTIONS}
            onChange={(val) => {
              setPageSize(Number(val));
              setCurrentPage(1);
            }}
          />
        </div>
      </Card>

      {/* Simulated Item Slice Preview */}
      <Card variant="elevated" padding="md" style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>
          Simulated Paginated Dataset Slice
        </div>
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: 4 }}>
          Showing Records #{fromRecord} to #{toRecord}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> total pages ({totalItems} total records)
        </div>
      </Card>

      {/* Interactive Pagination Bar */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        {/* First & Prev */}
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(1)}
          aria-label="First page"
          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronsLeft size={14} />
        </button>

        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Previous page"
          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page Buttons & Ellipses */}
        {pageNumbers.map((item, idx) => {
          if (typeof item === 'number') {
            const isCurrent = item === currentPage;
            return (
              <button
                key={idx}
                onClick={() => handlePageChange(item)}
                style={{
                  minWidth: 32,
                  height: 32,
                  padding: '0 8px',
                  borderRadius: 6,
                  border: isCurrent ? '1px solid var(--accent-primary)' : '1px solid var(--border-default)',
                  backgroundColor: isCurrent ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: isCurrent ? '#ffffff' : 'var(--text-primary)',
                  fontWeight: isCurrent ? 800 : 500,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {item}
              </button>
            );
          }

          return (
            <span key={idx} style={{ padding: '0 4px', color: 'var(--text-muted)', fontSize: 13, userSelect: 'none' }}>
              …
            </span>
          );
        })}

        {/* Next & Last */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next page"
          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        >
          <ChevronRight size={14} />
        </button>

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
          aria-label="Last page"
          style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        >
          <ChevronsRight size={14} />
        </button>
      </div>

      {/* Jump to Page Form */}
      <form onSubmit={handleJump} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 6, fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>Jump to page:</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={jumpPageInput}
          onChange={(e) => setJumpPageInput(e.target.value)}
          placeholder={`1–${totalPages}`}
          style={{ width: 64, padding: '4px 6px', borderRadius: 4, border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: 11, textAlign: 'center' }}
        />
        <Button size="xs" variant="secondary" type="submit">
          Go
        </Button>
      </form>
    </div>
  );
};
