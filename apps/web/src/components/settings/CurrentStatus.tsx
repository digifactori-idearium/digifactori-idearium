import { CloudOff, Cloud } from 'lucide-react';
import React from 'react';

export type Status = 'error' | 'existing';

interface CurrentStatusProps {
  status: Status;
}

const CONFIG: Record<
  Status,
  { icon: React.ReactNode; label: string; className: string }
> = {
  existing: {
    icon: <Cloud className="w-3.5 h-3.5" />,
    label: 'Existant',
    className: 'text-green-500',
  },
  error: {
    icon: <CloudOff className="w-3.5 h-3.5" />,
    label: 'Non-existant',
    className: 'text-red-500',
  },
};

export const CurrentStatus: React.FC<CurrentStatusProps> = ({ status }) => {
  const { icon, label, className } = CONFIG[status];
  return (
    <span className={`flex items-center gap-1  mt-1 font-medium ${className}`}>
      {icon}
      {label}
    </span>
  );
};
