import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  highlight?: boolean;
}

export default function StatCard({ label, value, change, trend, highlight }: StatCardProps) {
  return (
    <div className={highlight ? 'erp-stat-box erp-stat-box-highlight' : 'erp-stat-box'}>
      <p className={`text-[10px] font-bold uppercase ${highlight ? 'text-white/80' : 'erp-muted'}`}>{label}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className={`text-lg font-bold ${highlight ? 'text-white' : 'erp-text'}`}>{value}</p>
        {change && trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-bold ${highlight ? 'text-white' : trend === 'up' ? 'text-green-700' : 'text-red-700'}`}>
            {trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
