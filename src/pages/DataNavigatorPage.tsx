import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import DataTable from '../components/DataTable';
import WaningChart from '../components/WaningChart';
import { STUDIES, VE_ESTIMATES, WANING_DATA, ROB_DATA } from '../data/studies';
import RoBBadge from '../components/RoBBadge';
import type { RoBJudgement } from '../types';

const SECTIONS = [
  { key: 'overview', label: 'Overview' },
  { key: 'study-design', label: 'Study Design' },
  { key: 'intervention', label: 'Intervention' },
  { key: 'population', label: 'Population' },
  { key: 've-estimates', label: 'VE Estimates' },
  { key: 'waning', label: 'Waning' },
  { key: 'risk-of-bias', label: 'Risk of Bias' },
  { key: 'notes', label: 'Notes' },
];

export default function DataNavigatorPage() {
  const { section = 'overview' } = useParams<{ section: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#1E293B] mb-1">Data Explorer</h2>
      <p className="text-sm text-[#64748B] mb-4">
        Browse extracted data across all 6 studies &mdash; mirrors the v3 Excel workbook.
      </p>

      <Tabs value={section} onValueChange={v => navigate(`/data/${v}`)}>
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {SECTIONS.map(s => (
            <TabsTrigger key={s.key} value={s.key} className="text-xs">
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {section === 'overview' && <OverviewSection />}
      {section === 'study-design' && <StudyDesignSection />}
      {section === 'intervention' && <InterventionSection />}
      {section === 'population' && <PopulationSection />}
      {section === 've-estimates' && <VEEstimatesSection />}
      {section === 'waning' && <WaningSection />}
      {section === 'risk-of-bias' && <RoBSection />}
      {section === 'notes' && <NotesSection />}
    </div>
  );
}

function OverviewSection() {
  const countries = new Set(STUDIES.map(s => s.country));
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Studies" value="6" />
        <StatCard label="Countries" value={String(countries.size)} />
        <StatCard label="Period" value="1997\u20132021" />
        <StatCard label="VE Estimates" value={String(VE_ESTIMATES.length)} />
      </div>
      <DataTable
        columns={[
          { key: 'studyId', label: 'Study ID' },
          { key: 'author', label: 'Author' },
          { key: 'year', label: 'Year', align: 'right' },
          { key: 'country', label: 'Country' },
          { key: 'design', label: 'Design' },
          { key: 'primaryVE', label: 'Primary VE %', align: 'right' },
          { key: 'ci', label: '95% CI' },
          { key: 'nTotal', label: 'N Total', align: 'right' },
          { key: 'rob', label: 'Overall RoB' },
        ]}
        rows={STUDIES.map(s => ({
          studyId: s.id,
          author: s.author,
          year: s.year,
          country: `${s.countryFlag} ${s.country}`,
          design: s.design,
          primaryVE: s.primaryVE ?? '\u2014',
          ci: s.primaryVE_CI_lower !== null ? `(${s.primaryVE_CI_lower}, ${s.primaryVE_CI_upper})` : '\u2014',
          nTotal: s.nTotal?.toLocaleString() ?? '\u2014',
          rob: s.rob,
        }))}
      />
    </div>
  );
}

function StudyDesignSection() {
  return (
    <DataTable
      columns={[
        { key: 'studyId', label: 'Study ID' },
        { key: 'design', label: 'Design' },
        { key: 'period', label: 'Study Period' },
        { key: 'setting', label: 'Setting' },
        { key: 'followUp', label: 'Follow-up' },
        { key: 'robTool', label: 'RoB Tool' },
      ]}
      rows={STUDIES.map(s => ({
        studyId: s.id,
        design: s.design,
        period: s.studyPeriod,
        setting: s.setting,
        followUp: s.followUp,
        robTool: s.robTool,
      }))}
    />
  );
}

function InterventionSection() {
  return (
    <DataTable
      columns={[
        { key: 'studyId', label: 'Study ID' },
        { key: 'vaccine', label: 'Vaccine' },
        { key: 'comparator', label: 'Comparator' },
      ]}
      rows={STUDIES.map(s => ({
        studyId: s.id,
        vaccine: s.vaccine,
        comparator: s.comparator,
      }))}
    />
  );
}

function PopulationSection() {
  return (
    <DataTable
      columns={[
        { key: 'studyId', label: 'Study ID' },
        { key: 'nTotal', label: 'N Total', align: 'right' },
        { key: 'nVacc', label: 'N Vaccinated', align: 'right' },
        { key: 'nUnvacc', label: 'N Unvaccinated', align: 'right' },
        { key: 'nCases', label: 'N Cases', align: 'right' },
        { key: 'nControls', label: 'N Controls', align: 'right' },
        { key: 'country', label: 'Country' },
      ]}
      rows={STUDIES.map(s => ({
        studyId: s.id,
        nTotal: s.nTotal?.toLocaleString() ?? '\u2014',
        nVacc: s.nVaccinated?.toLocaleString() ?? '\u2014',
        nUnvacc: s.nUnvaccinated?.toLocaleString() ?? '\u2014',
        nCases: s.nCases?.toLocaleString() ?? '\u2014',
        nControls: s.nControls?.toLocaleString() ?? '\u2014',
        country: `${s.countryFlag} ${s.country}`,
      }))}
    />
  );
}

function VEEstimatesSection() {
  const studyLookup = Object.fromEntries(STUDIES.map(s => [s.id, s]));
  return (
    <DataTable
      columns={[
        { key: 'studyId', label: 'Study' },
        { key: 'id', label: 'ID' },
        { key: 'label', label: 'Label' },
        { key: 'type', label: 'Type' },
        { key: 've', label: 'VE %', align: 'right' },
        { key: 'ci', label: '95% CI' },
        { key: 'time', label: 'Time' },
        { key: 'age', label: 'Age Group' },
        { key: 'adjusted', label: 'Adjusted' },
        { key: 'method', label: 'Method' },
        { key: 'page', label: 'Page' },
      ]}
      rows={VE_ESTIMATES.map(e => ({
        studyId: `${studyLookup[e.studyId]?.author ?? e.studyId} ${studyLookup[e.studyId]?.year ?? ''}`,
        id: e.id,
        label: e.label,
        type: e.estimateType,
        ve: e.ve !== null ? e.ve : '\u2014',
        ci: e.ci_lower !== null && e.ci_upper !== null ? `(${e.ci_lower}, ${e.ci_upper})` : '\u2014',
        time: e.timeSinceVaccLabel ?? '\u2014',
        age: e.ageGroup ?? '\u2014',
        adjusted: e.adjusted ? 'Yes' : 'No',
        method: e.calculationMethod,
        page: e.pageRef,
      }))}
    />
  );
}

function WaningSection() {
  return (
    <div>
      <div className="bg-white rounded-lg border p-4 mb-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-[#1E293B] mb-2">VE Waning Over Time</h3>
        <WaningChart data={WANING_DATA} />
      </div>
      <DataTable
        columns={[
          { key: 'study', label: 'Study' },
          { key: 'series', label: 'Series' },
          { key: 'time', label: 'Time Period' },
          { key: 'midpoint', label: 'Midpoint (yr)', align: 'right' },
          { key: 've', label: 'VE %', align: 'right' },
          { key: 'ci', label: '95% CI' },
        ]}
        rows={WANING_DATA.map((w, i) => {
          const s = STUDIES.find(s => s.id === w.studyId);
          return {
            _key: i,
            study: `${s?.author ?? w.studyId} ${s?.year ?? ''}`,
            series: w.series,
            time: w.timeLabel,
            midpoint: w.timeMidpoint_years,
            ve: w.ve !== null ? w.ve : '\u2014',
            ci: w.ci_lower !== null && w.ci_upper !== null ? `(${w.ci_lower}, ${w.ci_upper})` : '\u2014',
          };
        })}
      />
    </div>
  );
}

function RoBSection() {
  return (
    <div>
      <div className="overflow-x-auto border rounded-lg mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-3 py-2 text-xs text-left text-[#64748B] font-medium sticky left-0 bg-gray-50">Study</th>
              <th className="px-3 py-2 text-xs text-left text-[#64748B] font-medium">Tool</th>
              <th className="px-3 py-2 text-xs text-left text-[#64748B] font-medium">Domain</th>
              <th className="px-3 py-2 text-xs text-center text-[#64748B] font-medium">Judgement</th>
              <th className="px-3 py-2 text-xs text-left text-[#64748B] font-medium">Supporting Text</th>
            </tr>
          </thead>
          <tbody>
            {ROB_DATA.map((d, i) => {
              const study = STUDIES.find(s => s.id === d.studyId);
              return (
                <tr key={i} className="border-b last:border-0 hover:bg-navy-light/30">
                  <td className="px-3 py-2 font-medium sticky left-0 bg-white whitespace-nowrap">
                    {study?.author ?? d.studyId} {study?.year ?? ''}
                  </td>
                  <td className="px-3 py-2 text-xs">{d.tool}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    D{d.domainNumber}: {d.domainName}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <RoBBadge judgement={d.judgement as RoBJudgement} size="sm" />
                  </td>
                  <td className="px-3 py-2 text-xs text-[#64748B] max-w-md">
                    {d.supportingText}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NotesSection() {
  const notes = [
    { studyId: 'Ward2005', note: 'Vaccine is aP-only not Tdap; VE CIs very wide (n=10 cases); trial registration not provided.' },
    { studyId: 'Baxter2013', note: 'Two control groups: PCR-negative (primary) and KPNC population. ~50% adolescents. Waning data from supplementary table.' },
    { studyId: 'Bell2019', note: 'wP recipients excluded (aP-only population). Stratum-specific Ns not reported. VE at \u22658 yr not significant.' },
    { studyId: 'Liu2020', note: 'PCR VE (52%) preferred over prespecified primary (8%). Serology VE biased by Tdap-induced antibody. Population \u226545 yr, wP-primed.' },
    { studyId: 'Witt2013', note: 'No traditional VE (no unvaccinated group). RR aP vs wP only. Severe confounding by birth cohort. Narrative synthesis only.' },
    { studyId: 'Crowcroft2021', note: 'TND and FMD designs compared. TND preferred for synthesis. VE diverges at \u22658 yr (TND 41% vs FMD 74%). Children 0\u201322 yr only.' },
  ];
  return (
    <DataTable
      columns={[
        { key: 'studyId', label: 'Study' },
        { key: 'note', label: 'Extraction Notes' },
      ]}
      rows={notes.map(n => {
        const s = STUDIES.find(s => s.id === n.studyId);
        return {
          studyId: `${s?.author ?? n.studyId} ${s?.year ?? ''}`,
          note: n.note,
        };
      })}
    />
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border p-4 text-center">
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="text-xs text-[#64748B] uppercase tracking-wide">{label}</p>
    </div>
  );
}
