import { useState } from 'react';
import { X, Check, AlertTriangle, DollarSign, Calendar, Wifi, ShieldCheck, Headphones } from 'lucide-react';
import type { Customer } from '../types';
import { progressColor, reasonToSentence, riskBadgeStyle } from '../lib/format';
import { updateOfferStatus } from '../lib/api';
import { useTheme } from '../lib/theme';
import { RiskBadge, StatusBadge } from './Filters';

function ChurnDial({ risk }: { risk: number }) {
  const { tokens } = useTheme();
  const color = progressColor(risk);
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (risk / 100) * circumference;
  return (
    <div className="relative w-36 h-36">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="72" cy="72" r="56" fill="none" stroke={tokens.cardBorder} strokeWidth="10" />
        <circle
          cx="72"
          cy="72"
          r="56"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>
          {risk}%
        </span>
        <span className="text-xs mt-0.5" style={{ color: tokens.textSecondary }}>churn probability</span>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof DollarSign; label: string; value: string }) {
  const { tokens } = useTheme();
  return (
    <div className="p-3 rounded-lg flex items-center gap-3" style={{ background: tokens.accentSoftBg }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: tokens.cardBg }}>
        <Icon className="w-4 h-4" style={{ color: tokens.accent }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: tokens.textSecondary }}>{label}</p>
        <p className="text-sm font-medium truncate" style={{ color: tokens.textPrimary }}>{value}</p>
      </div>
    </div>
  );
}

export function CustomerModal({
  customer,
  onClose,
  onStatusChange,
}: {
  customer: Customer;
  onClose: () => void;
  onStatusChange: (id: string, status: 'accepted' | 'rejected') => void;
}) {
  const { tokens } = useTheme();
  const [status, setStatus] = useState(customer.offerStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const badgeColor = riskBadgeStyle(customer.riskLevel, tokens);

  const handleStatus = async (next: 'accepted' | 'rejected') => {
    setBusy(true);
    setError(null);
    try {
      await updateOfferStatus(customer.id, next);
      setStatus(next);
      onStatusChange(customer.id, next);
    } catch {
      setError('Could not update status. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto chat-scroll"
        style={{ background: tokens.cardBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm mb-1" style={{ color: tokens.textSecondary }}>Customer</p>
              <p className="text-xl font-mono font-semibold" style={{ color: tokens.textPrimary }}>
                {customer.displayId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors cursor-pointer"
              style={{ color: tokens.textMuted }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex flex-col items-center p-6 rounded-xl" style={{ background: tokens.accentSoftBg }}>
                <ChurnDial risk={customer.churnRisk} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: tokens.textSecondary }}>Risk Level</span>
                  <RiskBadge level={customer.riskLevel} />
                </div>
                <div className="flex gap-2 p-3 rounded-lg" style={{ background: badgeColor.bg }}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: badgeColor.text }} />
                  <p className="text-sm font-medium" style={{ color: badgeColor.text }}>
                    {reasonToSentence(customer.churnReason)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-xl" style={{ background: tokens.accentSoftBg, border: `1px solid ${tokens.accentSoftBorder}` }}>
                <p className="text-xs uppercase tracking-wider font-medium mb-2" style={{ color: tokens.textSecondary }}>
                  Retention Offer
                </p>
                <p className="text-sm font-medium" style={{ color: tokens.textPrimary }}>
                  {customer.retentionOffer}
                </p>
              </div>
              <div>
                <p className="text-sm mb-3" style={{ color: tokens.textSecondary }}>Update Status</p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleStatus('accepted')}
                    disabled={busy}
                    className="w-full py-2.5 px-4 text-sm font-medium rounded-lg text-white transition-all duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: '#10B981' }}
                  >
                    <Check className="w-4 h-4" /> Mark Accepted
                  </button>
                  <button
                    onClick={() => handleStatus('rejected')}
                    disabled={busy}
                    className="w-full py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: 'transparent', color: '#EF4444', border: '1px solid #EF4444' }}
                  >
                    <X className="w-4 h-4" /> Mark Rejected
                  </button>
                </div>
                {error && <p className="text-xs mt-2" style={{ color: '#EF4444' }}>{error}</p>}
              </div>
              <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${tokens.cardBorder}` }}>
                <span className="text-sm" style={{ color: tokens.textSecondary }}>Current Status</span>
                <StatusBadge status={status} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${tokens.cardBorder}` }}>
            <p className="text-sm mb-3" style={{ color: tokens.textSecondary }}>Customer Details</p>
            <div className="grid grid-cols-2 gap-3">
              <Stat icon={DollarSign} label="Monthly Charges" value={`$${customer.monthlyCharges.toFixed(2)}`} />
              <Stat icon={Calendar} label="Tenure" value={`${customer.tenureMonths} months`} />
              <Stat icon={Wifi} label="Internet Service" value={customer.internetService} />
              <Stat icon={Calendar} label="Contract" value={customer.contractType} />
              <Stat icon={Headphones} label="Tech Support" value={customer.techSupport ? 'Yes' : 'No'} />
              <Stat icon={ShieldCheck} label="Online Security" value={customer.onlineSecurity ? 'Yes' : 'No'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
