import { Badge } from './ui/badge';
import type { RoBJudgement } from '../types';

const ROB_STYLES: Record<RoBJudgement, string> = {
  Low: 'bg-rob-low/15 text-green-700 border-rob-low/30',
  'Some concerns': 'bg-rob-some/15 text-yellow-700 border-rob-some/30',
  Moderate: 'bg-rob-moderate/15 text-orange-700 border-rob-moderate/30',
  Serious: 'bg-rob-serious/15 text-red-700 border-rob-serious/30',
  Critical: 'bg-red-900/15 text-red-900 border-red-900/30',
  NI: 'bg-gray-100 text-gray-500 border-gray-200',
  NR: 'bg-gray-100 text-gray-500 border-gray-200',
};

interface RoBBadgeProps {
  judgement: RoBJudgement;
  size?: 'sm' | 'default';
}

export default function RoBBadge({ judgement, size = 'default' }: RoBBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`${ROB_STYLES[judgement]} ${
        size === 'sm' ? 'text-[10px] px-1.5 py-0' : 'text-xs'
      } font-medium`}
    >
      {judgement}
    </Badge>
  );
}
