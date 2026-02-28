import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, BarChart3, Table2, BookOpen, X } from 'lucide-react';
import { useState } from 'react';
import { STUDIES } from '../../data/studies';
import type { RoBJudgement } from '../../types';

const ROB_DOT: Record<RoBJudgement, string> = {
  Low: 'bg-rob-low',
  'Some concerns': 'bg-rob-some',
  Moderate: 'bg-rob-moderate',
  Serious: 'bg-rob-serious',
  Critical: 'bg-red-900',
  NI: 'bg-gray-400',
  NR: 'bg-gray-400',
};

const DATA_SECTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'study-design', label: 'Study Design' },
  { key: 'intervention', label: 'Intervention' },
  { key: 'population', label: 'Population' },
  { key: 've-estimates', label: 'VE Estimates' },
  { key: 'waning', label: 'Waning' },
  { key: 'risk-of-bias', label: 'Risk of Bias' },
  { key: 'notes', label: 'Notes' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [studiesExpanded, setStudiesExpanded] = useState(true);
  const [dataExpanded, setDataExpanded] = useState(true);
  const location = useLocation();

  const linkClass = (path: string) => {
    const active = location.pathname === path;
    return `flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
      active
        ? 'bg-navy-mid/30 text-white border-l-2 border-white'
        : 'text-white/80 hover:bg-navy-mid/20 hover:text-white border-l-2 border-transparent'
    }`;
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-[220px] bg-navy text-white flex flex-col shrink-0 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
          <span className="font-semibold text-sm">VE Explorer</span>
          <button className="md:hidden p-1 hover:bg-navy-mid rounded" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {/* Studies group */}
          <button
            onClick={() => setStudiesExpanded(!studiesExpanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white"
          >
            <BookOpen size={14} />
            Studies
            {studiesExpanded ? <ChevronDown size={14} className="ml-auto" /> : <ChevronRight size={14} className="ml-auto" />}
          </button>
          {studiesExpanded && (
            <div className="space-y-0.5">
              <NavLink to="/studies" end className={() => linkClass('/studies')} onClick={onClose}>
                All Studies
              </NavLink>
              {STUDIES.map(s => (
                <NavLink
                  key={s.id}
                  to={`/studies/${s.id}`}
                  className={() => linkClass(`/studies/${s.id}`)}
                  onClick={onClose}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${ROB_DOT[s.rob]}`} />
                  <span className="truncate">{s.author} {s.year}</span>
                </NavLink>
              ))}
            </div>
          )}

          {/* Forest Plot */}
          <NavLink
            to="/forest-plot"
            className={() => `flex items-center gap-2 w-full px-3 py-2 text-sm ${
              location.pathname === '/forest-plot'
                ? 'bg-navy-mid/30 text-white border-l-2 border-white rounded'
                : 'text-white/80 hover:bg-navy-mid/20 hover:text-white border-l-2 border-transparent rounded'
            }`}
            onClick={onClose}
          >
            <BarChart3 size={14} />
            Forest Plot
          </NavLink>

          {/* Data Explorer */}
          <button
            onClick={() => setDataExpanded(!dataExpanded)}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white"
          >
            <Table2 size={14} />
            Data Explorer
            {dataExpanded ? <ChevronDown size={14} className="ml-auto" /> : <ChevronRight size={14} className="ml-auto" />}
          </button>
          {dataExpanded && (
            <div className="space-y-0.5">
              {DATA_SECTIONS.map(sec => (
                <NavLink
                  key={sec.key}
                  to={`/data/${sec.key}`}
                  className={() => linkClass(`/data/${sec.key}`)}
                  onClick={onClose}
                >
                  {sec.label}
                </NavLink>
              ))}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
