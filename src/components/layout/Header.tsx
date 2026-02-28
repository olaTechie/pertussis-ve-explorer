import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 bg-navy text-white flex items-center px-4 shrink-0">
      <button
        className="md:hidden mr-3 p-1 hover:bg-navy-mid rounded"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
      <div>
        <h1 className="text-base font-semibold leading-tight">
          Pertussis Vaccine Effectiveness &mdash; Systematic Review
        </h1>
        <p className="text-xs text-white/70 leading-tight">
          6 studies &middot; Adults &middot; 2004&ndash;2021
        </p>
      </div>
    </header>
  );
}
