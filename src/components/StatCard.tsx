import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend, 
  className,
  iconClassName 
}: StatCardProps) {
  return (
    <div className={cn(
      "bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-all duration-300 group",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
          "bg-zinc-50 text-zinc-600 group-hover:bg-brand-50 group-hover:text-brand-600",
          iconClassName
        )}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1",
            trend.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
          )}>
            {trend.isPositive ? '+' : '-'}{trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-zinc-900 tracking-tight">{value}</h3>
        {description && (
          <p className="text-xs text-zinc-500 mt-2 font-medium">{description}</p>
        )}
      </div>
    </div>
  );
}
