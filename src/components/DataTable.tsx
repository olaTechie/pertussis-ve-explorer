import { useState, useMemo } from 'react';
import { ArrowUpDown, Download, Search } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  tooltip?: string;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps {
  columns: Column[];
  rows: Record<string, unknown>[];
  studyFilter?: string[];
  onStudyFilterChange?: (ids: string[]) => void;
}

export default function DataTable({ columns, rows }: DataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(row =>
      columns.some(col => {
        const val = row[col.key];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
      })
    );
  }, [rows, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      const na = Number(va);
      const nb = Number(vb);
      if (!isNaN(na) && !isNaN(nb)) {
        return sortDir === 'asc' ? na - nb : nb - na;
      }
      const sa = String(va);
      const sb = String(vb);
      return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const exportCSV = () => {
    const header = columns.map(c => c.label).join(',');
    const body = sorted.map(row =>
      columns.map(c => {
        const v = row[c.key];
        const s = v === null || v === undefined ? '' : String(v);
        return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(',')
    ).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pertussis_ve_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-mid"
          />
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1 px-3 py-1.5 text-xs border rounded-md hover:bg-gray-50 text-[#64748B]"
        >
          <Download size={12} /> Export CSV
        </button>
        <span className="text-xs text-[#64748B]">{sorted.length} rows</span>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-3 py-2 text-xs uppercase tracking-wide text-[#64748B] font-medium cursor-pointer hover:text-[#1E293B] whitespace-nowrap ${
                    col.key === 'studyId' ? 'sticky left-0 bg-gray-50 z-10' : ''
                  } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  onClick={() => handleSort(col.key)}
                  title={col.tooltip}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown size={10} className={sortKey === col.key ? 'text-navy' : 'opacity-30'} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-navy-light/30">
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`px-3 py-2 whitespace-nowrap ${
                      col.key === 'studyId' ? 'sticky left-0 bg-white font-medium z-10' : ''
                    } ${col.align === 'right' ? 'text-right font-mono' : col.align === 'center' ? 'text-center' : ''}`}
                  >
                    {row[col.key] !== null && row[col.key] !== undefined
                      ? String(row[col.key])
                      : <span className="text-gray-300">&mdash;</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-8 text-[#64748B]">
                  No data matches your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
