import type { OfferStatus, RiskLevel } from '../types';
import { riskBadgeStyle, statusBadgeStyle } from '../lib/format';
import { useTheme } from '../lib/theme';
import { Clock, CheckCircle, X } from 'lucide-react';

export function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  const { tokens } = useTheme();
  return (
    <button
      onClick={onClick}
      className="cursor-pointer px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-150"
      style={{
        background: isActive ? tokens.accent : 'transparent',
        color: isActive ? (tokens.mode === 'dark' ? '#1A1A1A' : '#FFFFFF') : tokens.textSecondary,
        border: isActive ? `1px solid ${tokens.accent}` : `1px solid ${tokens.cardBorder}`,
      }}
    >
      {label}
    </button>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const { tokens } = useTheme();
  const c = riskBadgeStyle(level, tokens);
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)} Risk
    </span>
  );
}

export function StatusBadge({ status }: { status: OfferStatus }) {
  const { tokens } = useTheme();
  const config = statusBadgeStyle(status, tokens);
  const Icon = status === 'pending' ? Clock : status === 'accepted' ? CheckCircle : X;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: config.bg, color: config.text }}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
