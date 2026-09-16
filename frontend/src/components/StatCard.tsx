import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Trend } from '../types';
import { useTheme } from '../lib/theme';

export function StatCard({
  label,
  value,
  trend,
}: {
  label: string;
  value: number | string;
  trend?: Trend;
}) {
  const { tokens } = useTheme();
  const trendColor = trend ? (trend.positive ? '#10B981' : '#EF4444') : tokens.textMuted;
  return (
    <div
      className="rounded-xl relative overflow-hidden transition-all duration-150 hover:shadow-md"
      style={{ background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, minWidth: 0 }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: tokens.accent }} />
      <div className="p-5" style={{ minWidth: 0 }}>
        <p className="uppercase tracking-wider mb-2" style={{ color: tokens.textSecondary, fontSize: 'clamp(10px, 1.4vw, 11px)', overflowWrap: 'break-word' }}>
          {label}
        </p>
        <p className="font-bold mb-1" style={{ color: tokens.textPrimary, fontSize: 'clamp(22px, 4vw, 30px)', overflowWrap: 'break-word' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {trend && (
          <div className="flex items-center gap-1">
            {trend.direction === 'up' ? (
              <TrendingUp className="w-3.5 h-3.5" style={{ color: trendColor }} />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" style={{ color: trendColor }} />
            )}
            <span className="text-xs" style={{ color: trendColor }}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
