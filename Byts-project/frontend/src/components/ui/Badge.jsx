import { cn } from "../../lib/utils";

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-slate-700 text-white border-slate-600',
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
};
