import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import RoBBadge from './RoBBadge';
import type { Study } from '../types';

const ROB_BORDER: Record<string, string> = {
  Low: 'border-l-rob-low',
  'Some concerns': 'border-l-rob-some',
  Moderate: 'border-l-rob-moderate',
  Serious: 'border-l-rob-serious',
  Critical: 'border-l-red-900',
};

const DESIGN_COLOR: Record<string, string> = {
  RCT: 'bg-blue-100 text-blue-800',
  TND: 'bg-purple-100 text-purple-800',
  'Case-Control': 'bg-amber-100 text-amber-800',
  'Nested Case-Control': 'bg-amber-100 text-amber-800',
  'Retrospective Cohort': 'bg-teal-100 text-teal-800',
  'TND+FMD': 'bg-indigo-100 text-indigo-800',
};

interface StudyCardProps {
  study: Study;
}

export default function StudyCard({ study }: StudyCardProps) {
  return (
    <Link to={`/studies/${study.id}`} className="block group">
      <Card
        className={`border-l-4 ${ROB_BORDER[study.rob] ?? 'border-l-gray-300'} transition-all duration-150 group-hover:-translate-y-0.5 group-hover:shadow-lg`}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-[#1E293B]">
                {study.author} {study.year}
              </h3>
              <p className="text-xs text-[#64748B]">
                {study.countryFlag} {study.country}
              </p>
            </div>
            <Badge variant="secondary" className={`${DESIGN_COLOR[study.design] ?? ''} text-[11px] shrink-0`}>
              {study.design}
            </Badge>
          </div>

          <div className="space-y-1">
            {study.primaryVE !== null ? (
              <p className="text-lg font-semibold text-navy">
                VE {study.primaryVE}%
                <span className="text-sm font-normal text-[#64748B] ml-1">
                  ({study.primaryVE_CI_lower}\u2013{study.primaryVE_CI_upper}%)
                </span>
              </p>
            ) : (
              <p className="text-sm font-medium text-[#64748B] italic">
                No traditional VE
              </p>
            )}
            <p className="text-xs text-[#64748B]">
              N = {study.nTotal?.toLocaleString()}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-[#64748B] space-y-0.5">
              <p>Comparator: {study.comparator.length > 30 ? study.comparator.slice(0, 30) + '\u2026' : study.comparator}</p>
              <p>Follow-up: {study.followUp}</p>
            </div>
            <RoBBadge judgement={study.rob} size="sm" />
          </div>

          {study.synthesisNote && (
            <p className="text-[10px] text-[#64748B] italic border-t pt-2">
              {study.synthesisNote}
            </p>
          )}

          <p className="text-xs text-navy-mid font-medium group-hover:underline">
            View study &rarr;
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
