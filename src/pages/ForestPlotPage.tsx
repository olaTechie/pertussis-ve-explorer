import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ForestPlot from '../components/ForestPlot';
import { VE_ESTIMATES, STUDIES } from '../data/studies';

export default function ForestPlotPage() {
  const navigate = useNavigate();
  const [selectedStudies, setSelectedStudies] = useState<string[]>(STUDIES.map(s => s.id));
  const [subgroupFilter, setSubgroupFilter] = useState<'all' | 'overall' | 'time' | 'age'>('all');

  const filteredEstimates = useMemo(() => {
    return VE_ESTIMATES.filter(est => {
      if (!selectedStudies.includes(est.studyId)) return false;
      if (est.ve === null) return false;
      if (est.isSensitivity) return false;

      if (subgroupFilter === 'overall') return est.subgroupType === 'overall';
      if (subgroupFilter === 'time') return est.subgroupType === 'time';
      if (subgroupFilter === 'age') return est.subgroupType === 'age';
      return true;
    });
  }, [selectedStudies, subgroupFilter]);

  const toggleStudy = (id: string) => {
    setSelectedStudies(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#1E293B] mb-1">Forest Plot</h2>
      <p className="text-sm text-[#64748B] mb-4">
        Interactive visualization of VE estimates across studies.
        <span className="italic ml-1">Heterogeneous designs &mdash; narrative synthesis only.</span>
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 p-3 bg-white rounded-lg border">
        <div>
          <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1">Studies</label>
          <div className="flex flex-wrap gap-1">
            {STUDIES.map(s => (
              <button
                key={s.id}
                onClick={() => toggleStudy(s.id)}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  selectedStudies.includes(s.id)
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-[#64748B] border-gray-200 hover:border-navy'
                }`}
              >
                {s.author} {s.year}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[#64748B] uppercase tracking-wide block mb-1">Subgroup</label>
          <div className="flex gap-1">
            {(['all', 'overall', 'time', 'age'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => setSubgroupFilter(opt)}
                className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                  subgroupFilter === opt
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-[#64748B] border-gray-200 hover:border-navy'
                }`}
              >
                {opt === 'all' ? 'All' : opt === 'overall' ? 'Overall only' : opt === 'time' ? 'Time-stratified' : 'Age-stratified'}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Plot */}
      <div className="bg-white rounded-lg border p-4 overflow-x-auto">
        <ForestPlot
          estimates={filteredEstimates}
          onRowClick={(studyId) => navigate(`/studies/${studyId}`)}
        />
      </div>
    </div>
  );
}
