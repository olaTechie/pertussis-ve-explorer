import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import RoBBadge from '../components/RoBBadge';
import {
  getStudy,
  getEstimatesForStudy,
  getRoBForStudy,
  getWaningForStudy,
  STUDY_ORDER,
} from '../data/studies';
import type { RoBJudgement } from '../types';

const ROB_BG: Record<RoBJudgement, string> = {
  Low: 'bg-rob-low/10',
  'Some concerns': 'bg-rob-some/10',
  Moderate: 'bg-rob-moderate/10',
  Serious: 'bg-rob-serious/10',
  Critical: 'bg-red-900/10',
  NI: 'bg-gray-50',
  NR: 'bg-gray-50',
};

export default function StudyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const study = getStudy(id ?? '');

  if (!study) {
    return (
      <div className="text-center py-12">
        <p className="text-[#64748B]">Study not found.</p>
        <Link to="/studies" className="text-navy-mid hover:underline text-sm">
          &larr; Back to studies
        </Link>
      </div>
    );
  }

  const estimates = getEstimatesForStudy(study.id);
  const robDomains = getRoBForStudy(study.id);
  const waning = getWaningForStudy(study.id);
  const idx = STUDY_ORDER.indexOf(study.id);
  const prevId = idx > 0 ? STUDY_ORDER[idx - 1] : null;
  const nextId = idx < STUDY_ORDER.length - 1 ? STUDY_ORDER[idx + 1] : null;

  return (
    <div className="max-w-5xl">
      {/* Breadcrumb + nav */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <Link to="/studies" className="hover:text-navy-mid">Studies</Link>
          <span>/</span>
          <span className="text-[#1E293B] font-medium">{study.author} {study.year}</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => prevId && navigate(`/studies/${prevId}`)}
            disabled={!prevId}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => nextId && navigate(`/studies/${nextId}`)}
            disabled={!nextId}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-[#1E293B] mb-1">
        {study.countryFlag} {study.author} et al. {study.year}
      </h2>
      <div className="flex gap-2 mb-6">
        <Badge variant="secondary">{study.design}</Badge>
        <RoBBadge judgement={study.rob} />
      </div>

      {/* Section 1: Study Overview */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold text-[#1E293B] mb-3">Study Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <Row label="Design" value={study.design} />
            <Row label="Country" value={study.country} />
            <Row label="Study Period" value={study.studyPeriod} />
            <Row label="Setting" value={study.setting} />
            <Row label="Vaccine" value={study.vaccine} />
            <Row label="Comparator" value={study.comparator} />
            <Row label="Follow-up" value={study.followUp} />
            <Row label="N Total" value={study.nTotal?.toLocaleString() ?? 'NR'} />
            {study.nVaccinated != null && <Row label="N Vaccinated" value={study.nVaccinated.toLocaleString()} />}
            {study.nUnvaccinated != null && <Row label="N Unvaccinated" value={study.nUnvaccinated.toLocaleString()} />}
            {study.nCases != null && <Row label="N Cases" value={study.nCases.toLocaleString()} />}
            {study.nControls != null && <Row label="N Controls" value={study.nControls.toLocaleString()} />}
            <Row label="RoB Tool" value={study.robTool} />
          </div>
          {study.synthesisNote && (
            <p className="mt-3 text-xs text-[#64748B] italic border-t pt-2">
              {study.synthesisNote}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 2: VE Estimates */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold text-[#1E293B] mb-3">
            VE Estimates ({estimates.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-[#64748B]">
                  <th className="pb-2 pr-3">Label</th>
                  <th className="pb-2 pr-3">Type</th>
                  <th className="pb-2 pr-3 text-right">VE %</th>
                  <th className="pb-2 pr-3 text-right">95% CI</th>
                  <th className="pb-2 pr-3">Time</th>
                  <th className="pb-2 pr-3">Method</th>
                  <th className="pb-2">Page</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map(est => {
                  const significant = est.ve !== null && est.ci_lower !== null && est.ci_upper !== null
                    && (est.ci_lower > 0 || est.ci_upper < 0);
                  return (
                    <tr
                      key={est.id}
                      className={`border-b last:border-0 ${est.isSensitivity ? 'bg-gray-50/50' : ''}`}
                    >
                      <td className="py-2 pr-3 font-medium">
                        {est.label}
                        {est.isSensitivity && (
                          <span className="ml-1 text-[10px] text-[#64748B] italic">(sensitivity)</span>
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge variant="outline" className="text-[10px]">{est.estimateType}</Badge>
                      </td>
                      <td className={`py-2 pr-3 text-right font-mono ${significant ? 'font-semibold' : 'text-[#64748B]'}`}>
                        {est.ve !== null ? `${est.ve}%` : '\u2014'}
                      </td>
                      <td className="py-2 pr-3 text-right font-mono text-xs text-[#64748B]">
                        {est.ci_lower !== null && est.ci_upper !== null
                          ? `(${est.ci_lower}, ${est.ci_upper})`
                          : '\u2014'}
                      </td>
                      <td className="py-2 pr-3 text-xs text-[#64748B]">
                        {est.timeSinceVaccLabel ?? est.ageGroup ?? '\u2014'}
                      </td>
                      <td className="py-2 pr-3 text-xs text-[#64748B] max-w-[140px] truncate">
                        {est.calculationMethod}
                      </td>
                      <td className="py-2 text-xs text-[#64748B]">{est.pageRef}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Waning mini-chart note */}
          {waning.length > 0 && (
            <p className="mt-3 text-xs text-[#64748B] italic">
              This study has {waning.length} waning time points.
              View the <Link to="/data/waning" className="text-navy-mid hover:underline">Waning chart</Link> for a visualization.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 3: Risk of Bias */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold text-[#1E293B] mb-1">
            Risk of Bias &mdash; {study.robTool}
          </h3>
          <p className="text-sm text-[#64748B] mb-3">
            Overall: <RoBBadge judgement={study.rob} />
          </p>
          <Separator className="mb-3" />
          <div className="space-y-2">
            {robDomains.map(d => (
              <div
                key={`${d.studyId}-${d.domainNumber}`}
                className={`rounded p-3 ${ROB_BG[d.judgement]}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#1E293B]">
                    D{d.domainNumber}: {d.domainName}
                  </span>
                  <RoBBadge judgement={d.judgement} size="sm" />
                </div>
                <p className="text-xs text-[#64748B]">{d.supportingText}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[#64748B] shrink-0 w-32">{label}:</span>
      <span className="text-[#1E293B]">{value}</span>
    </div>
  );
}
