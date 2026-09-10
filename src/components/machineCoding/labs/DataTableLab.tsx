import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { CustomSelect } from '../../ui/CustomSelect';
import { Search, ChevronUp, ChevronDown, CheckSquare, Square, Filter, RotateCcw, FileSpreadsheet, FileText, Download, Printer } from 'lucide-react';

const ROLE_FILTER_OPTIONS = [
  { value: 'All', label: 'All Roles' },
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Backend', label: 'Backend' },
  { value: 'Fullstack', label: 'Fullstack' },
  { value: 'DevOps', label: 'DevOps' },
];

const PAGE_SIZE_OPTIONS = [
  { value: '5', label: '5 rows' },
  { value: '10', label: '10 rows' },
];

export interface EngineerRecord {
  id: string;
  name: string;
  avatar: string;
  role: 'Frontend' | 'Backend' | 'DevOps' | 'Fullstack';
  experienceYears: number;
  rating: number;
  status: 'Active' | 'On Leave' | 'Contract';
}

const MOCK_ENGINEERS: EngineerRecord[] = [
  { id: '1', name: 'Sophia Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', role: 'Frontend', experienceYears: 6, rating: 4.9, status: 'Active' },
  { id: '2', name: 'Liam Murphy', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', role: 'Backend', experienceYears: 8, rating: 4.7, status: 'Active' },
  { id: '3', name: 'Aarav Patel', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', role: 'Fullstack', experienceYears: 5, rating: 4.8, status: 'Active' },
  { id: '4', name: 'Emma Watson', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', role: 'DevOps', experienceYears: 7, rating: 4.6, status: 'On Leave' },
  { id: '5', name: 'Noah Kim', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', role: 'Frontend', experienceYears: 3, rating: 4.5, status: 'Active' },
  { id: '6', name: 'Olivia Garcia', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80', role: 'Backend', experienceYears: 4, rating: 4.7, status: 'Contract' },
  { id: '7', name: 'Lucas Silva', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', role: 'Fullstack', experienceYears: 9, rating: 5.0, status: 'Active' },
  { id: '8', name: 'Mia Johnson', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80', role: 'Frontend', experienceYears: 2, rating: 4.3, status: 'Active' },
  { id: '9', name: 'Ethan Brown', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80', role: 'DevOps', experienceYears: 10, rating: 4.9, status: 'Active' },
  { id: '10', name: 'Ava Martinez', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80', role: 'Backend', experienceYears: 5, rating: 4.6, status: 'On Leave' },
  { id: '11', name: 'Jackson Lee', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80', role: 'Fullstack', experienceYears: 4, rating: 4.4, status: 'Contract' },
  { id: '12', name: 'Isabella Davis', avatar: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=100&auto=format&fit=crop&q=80', role: 'Frontend', experienceYears: 7, rating: 4.8, status: 'Active' },
];

export const DataTableLab: React.FC = () => {
  const [data] = useState<EngineerRecord[]>(MOCK_ENGINEERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [sortColumn, setSortColumn] = useState<keyof EngineerRecord | null>('rating');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectAllRef = useRef<HTMLInputElement>(null);

  // Sorting Handler with 3-state cycling
  const handleSort = (col: keyof EngineerRecord) => {
    if (sortColumn !== col) {
      setSortColumn(col);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortColumn(null);
      setSortDirection(null);
    }
  };

  // Filter & Sort Pipeline
  const filteredAndSorted = useMemo(() => {
    let list = [...data];

    // Global text search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
      );
    }

    // Role dropdown filter
    if (roleFilter !== 'All') {
      list = list.filter((r) => r.role === roleFilter);
    }

    // Dynamic sorting
    if (sortColumn && sortDirection) {
      list.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [data, search, roleFilter, sortColumn, sortDirection]);

  // Pagination slice
  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, page, pageSize]);

  // Indeterminate Checkbox State
  useEffect(() => {
    if (!selectAllRef.current) return;
    const isAllSelected = paginatedSlice.length > 0 && paginatedSlice.every((r) => selectedIds.includes(r.id));
    const isSomeSelected = paginatedSlice.some((r) => selectedIds.includes(r.id));

    selectAllRef.current.checked = isAllSelected;
    selectAllRef.current.indeterminate = isSomeSelected && !isAllSelected;
  }, [selectedIds, paginatedSlice]);

  const toggleSelectAll = () => {
    const pageIds = paginatedSlice.map((r) => r.id);
    const allPageSelected = pageIds.every((id) => selectedIds.includes(id));

    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const renderSortIndicator = (col: keyof EngineerRecord) => {
    if (sortColumn !== col) return <span style={{ opacity: 0.3 }}>⇅</span>;
    return sortDirection === 'asc' ? <ChevronUp size={14} style={{ color: 'var(--accent-primary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--accent-primary)' }} />;
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const targetRows = selectedIds.length > 0
      ? data.filter((r) => selectedIds.includes(r.id))
      : filteredAndSorted;

    const headers = ['ID', 'Name', 'Role', 'Experience (Years)', 'Rating', 'Status'];
    const csvRows = targetRows.map((r) => [
      `"${r.id}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.role}"`,
      r.experienceYears,
      r.rating,
      `"${r.status}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `engineers_data_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export to PDF via clean print layout
  const handleExportPDF = () => {
    const targetRows = selectedIds.length > 0
      ? data.filter((r) => selectedIds.includes(r.id))
      : filteredAndSorted;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Engineering Team Report</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #111; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          p { font-size: 12px; color: #666; margin-top: 0; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { text-align: left; background-color: #f3f4f6; padding: 8px 12px; border-bottom: 2px solid #e5e7eb; }
          td { padding: 8px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; background: #e0e7ff; color: #3730a3; }
          .badge.Active { background: #dcfce7; color: #15803d; }
          .badge.On-Leave { background: #fef9c3; color: #854d0e; }
          .avatar { width: 28px; height: 28px; border-radius: 50%; vertical-align: middle; margin-right: 8px; object-fit: cover; }
        </style>
      </head>
      <body>
        <h1>Engineering Team Roster</h1>
        <p>Exported ${targetRows.length} engineer records on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Engineer</th>
              <th>Role</th>
              <th>Experience</th>
              <th>Rating</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${targetRows.map((r) => `
              <tr>
                <td>#${r.id}</td>
                <td><img src="${r.avatar}" class="avatar" /> <strong>${r.name}</strong></td>
                <td>${r.role}</td>
                <td>${r.experienceYears} yrs</td>
                <td>⭐ ${r.rating}</td>
                <td><span class="badge ${r.status.replace(/\s+/g, '-')}">${r.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 840, margin: '0 auto' }}>
      {/* Controls Bar */}
      <Card variant="glass" padding="sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 200px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Filter by engineer name or role..."
            style={{
              flex: 1,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-xs)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <Filter size={12} />
            <span>Role:</span>
            <CustomSelect
              size="sm"
              value={roleFilter}
              options={ROLE_FILTER_OPTIONS}
              onChange={(val) => { setRoleFilter(val); setPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <span>Rows:</span>
            <CustomSelect
              size="sm"
              value={String(pageSize)}
              options={PAGE_SIZE_OPTIONS}
              onChange={(val) => { setPageSize(Number(val)); setPage(1); }}
            />
          </div>

          {/* Export Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Button
              size="xs"
              variant="outline"
              icon={<FileSpreadsheet size={13} style={{ color: 'var(--accent-success)' }} />}
              onClick={handleExportExcel}
              title="Export filtered/selected data as CSV for Excel"
            >
              Export Excel
            </Button>
            <Button
              size="xs"
              variant="outline"
              icon={<FileText size={13} style={{ color: 'var(--accent-primary)' }} />}
              onClick={handleExportPDF}
              title="Print or Save as PDF"
            >
              Export PDF
            </Button>
          </div>

          {selectedIds.length > 0 && (
            <Badge variant="purple" size="sm">
              {selectedIds.length} Selected
            </Badge>
          )}
        </div>
      </Card>

      {/* Table Surface */}
      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--bg-surface)', fontSize: 'var(--text-xs)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
              <th style={{ padding: '10px 12px', width: 36, textAlign: 'center' }}>
                <input ref={selectAllRef} type="checkbox" onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
              </th>
              <th style={{ padding: '10px 12px', width: 44, textAlign: 'center' }}>Photo</th>
              <th onClick={() => handleSort('name')} style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Name {renderSortIndicator('name')}</div>
              </th>
              <th onClick={() => handleSort('role')} style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Role {renderSortIndicator('role')}</div>
              </th>
              <th onClick={() => handleSort('experienceYears')} style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Exp {renderSortIndicator('experienceYears')}</div>
              </th>
              <th onClick={() => handleSort('rating')} style={{ padding: '10px 12px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Rating {renderSortIndicator('rating')}</div>
              </th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedSlice.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedSlice.map((row) => {
                const isSelected = selectedIds.includes(row.id);

                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--accent-primary-subtle)' : 'transparent',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelectRow(row.id)} style={{ cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <img
                        src={row.avatar}
                        alt={row.name}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid var(--border-default)',
                          display: 'inline-block',
                          verticalAlign: 'middle',
                        }}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=6366f1&color=fff&size=64`;
                        }}
                      />
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{row.role}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{row.experienceYears} yrs</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--accent-primary)' }}>⭐ {row.rating}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={row.status === 'Active' ? 'success' : row.status === 'On Leave' ? 'warning' : 'default'} size="sm">
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flexWrap: 'wrap', gap: 8 }}>
        <span>Showing {paginatedSlice.length > 0 ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length} engineers</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Button
            size="xs"
            variant="secondary"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span style={{ padding: '0 6px', fontWeight: 600, color: 'var(--text-primary)' }}>Page {page} / {totalPages}</span>
          <Button
            size="xs"
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
