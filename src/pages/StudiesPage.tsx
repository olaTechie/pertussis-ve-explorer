import StudyCard from '../components/StudyCard';
import { STUDIES } from '../data/studies';

export default function StudiesPage() {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#1E293B] mb-1">Included Studies</h2>
      <p className="text-sm text-[#64748B] mb-6">
        6 studies evaluating pertussis vaccine effectiveness in adolescents and adults
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {STUDIES.map(study => (
          <StudyCard key={study.id} study={study} />
        ))}
      </div>
    </div>
  );
}
