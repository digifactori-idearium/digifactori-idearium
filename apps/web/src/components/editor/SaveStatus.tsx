import { Check, Loader2, CloudOff, Cloud } from 'lucide-react';
import React from 'react';

type Status = 'saved' | 'saving' | 'unsaved' | 'error';

interface SaveStatusProps {
  status: Status;
}

const CONFIG: Record<
  Status,
  { icon: React.ReactNode; label: string; className: string }
> = {
  saved: {
    icon: <Check className="w-3.5 h-3.5" />,
    label: 'Enregistré',
    className: 'text-emerald-600',
  },
  saving: {
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
    label: 'Enregistrement…',
    className: 'text-violet-500',
  },
  unsaved: {
    icon: <Cloud className="w-3.5 h-3.5" />,
    label: 'Non enregistré',
    className: 'text-amber-500',
  },
  error: {
    icon: <CloudOff className="w-3.5 h-3.5" />,
    label: 'Erreur',
    className: 'text-red-500',
  },
};

export const SaveStatus: React.FC<SaveStatusProps> = ({ status }) => {
  const { icon, label, className } = CONFIG[status];
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${className}`}
    >
      {icon}
      {label}
    </span>
  );
};
