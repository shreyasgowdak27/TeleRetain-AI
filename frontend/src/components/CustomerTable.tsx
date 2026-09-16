import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Bot } from 'lucide-react';
import type { Customer, RiskFilter } from '../types';
import { progressColor, formatReason } from '../lib/format';
import { useTheme } from '../lib/theme';
import { FilterChip, RiskBadge, StatusBadge } from './Filters';

function RiskBar({ risk }: { risk: number }) {
  const { tokens } = useTheme();
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium" style={{ color: tokens.textPrimary }}>
        {risk}%
      </span>
      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: tokens.rowBorder }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${risk}%`, background: progressColor(risk) }}
        />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  const { tokens } = useTheme();
  return (
    <tr>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded animate-pulse" style={{ background: tokens.rowBorder }} /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded animate-pulse" style={{ background: tokens.rowBorder }} /></td>
      <td className="px-6 py-4"><div className="h-6 w-20 rounded-full animate-pulse" style={{ background: tokens.rowBorder }} /></td>
      <td className="px-6 py-4"><div className="h-4 w-32 rounded animate-pulse" style={{ background: tokens.rowBorder }} /></td>
      <td className="px-6 py-4"><div className="h-4 w-40 rounded animate-pulse" style={{ background: tokens.rowBorder }} /></td>
      <td className="px-6 py-4"><div className="h-6 w-20 rounded-full animate-pulse" style={{ background: tokens.rowBorder }} /></td>
      <td className="px-6 py-4"><div className="h-4 w-10 rounded animate-pulse" style={{ background: tokens.rowBorder }} /></td>
    </tr>
  );
}

export interface CustomerTableProps {
  loading: boolean;
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  riskLevel: RiskFilter;
  onSearchChange: (s: string) => void;
  onRiskLevelChange: (r: RiskFilter) => void;
  onPageChange: (p: number) => void;
  onView: (c: Customer) => void;
  showFilters: boolean;
  showPagination: boolean;
  sectionTitle?: string;
}

export function CustomerTable({
  loading,
  customers,
  total,
  page,
  pageSize,
  search,
  riskLevel,
  onSearchChange,
  onRiskLevelChange,
  onPageChange,
  onView,
  showFilters,
  showPagination,
  sectionTitle,
}: CustomerTableProps) {
  const { tokens } = useTheme();
  const [localSearch, setLocalSearch] = useState(search);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const commitSearch = (value: string) => {
    setLocalSearch(value);
    onSearchChange(value);
  };

  return (
    <div className="rounded-xl" style={{ background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, minWidth: 0 }}>
      {showFilters ? (
        <div className="space-y-4" style={{ padding: 'clamp(12px, 2vw, 24px)', borderBottom: `1px solid ${tokens.cardBorder}`, minWidth: 0 }}>
          <div className="relative" style={{ minWidth: 0 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.textSecondary }} />
            <input
              type="text"
              placeholder="Search by Customer ID or reason..."
              value={localSearch}
              onChange={(e) => commitSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 cursor-pointer"
              style={{ border: `1px solid ${tokens.inputBorder}`, background: tokens.inputBg, color: tokens.textPrimary, '--tw-ring-color': tokens.accent } as React.CSSProperties}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterChip label="All" isActive={riskLevel === 'all'} onClick={() => onRiskLevelChange('all')} />
            <FilterChip label="High Risk" isActive={riskLevel === 'high'} onClick={() => onRiskLevelChange('high')} />
            <FilterChip label="Medium Risk" isActive={riskLevel === 'medium'} onClick={() => onRiskLevelChange('medium')} />
            <FilterChip label="Low Risk" isActive={riskLevel === 'low'} onClick={() => onRiskLevelChange('low')} />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3" style={{ padding: 'clamp(12px, 2vw, 24px)', borderBottom: `1px solid ${tokens.cardBorder}`, minWidth: 0 }}>
          <h2 className="font-semibold" style={{ color: tokens.textPrimary, fontSize: 'clamp(15px, 2vw, 18px)', overflowWrap: 'break-word' }}>
            {sectionTitle ?? 'Customer Analysis'}
          </h2>
          <span
            className="px-2.5 py-1 text-xs font-medium rounded-full shrink-0"
            style={{ background: tokens.accentSoftBg, color: tokens.textPrimary, whiteSpace: 'nowrap' }}
          >
            {total.toLocaleString()}
          </span>
        </div>
      )}

      <div className="table-scroll" style={{ minWidth: 0 }}>
        <table className="w-full" style={{ minWidth: '780px' }}>
          <thead>
            <tr style={{ background: tokens.mode === 'dark' ? '#242424' : '#F9FAFB', borderBottom: `1px solid ${tokens.cardBorder}` }}>
              {['Customer ID', 'Churn Risk', 'Risk Level', 'Churn Reason', 'Retention Offer', 'Status', 'Action'].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: tokens.textSecondary }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ background: tokens.accentSoftBg }}>
                      <Bot className="w-6 h-6" style={{ color: tokens.textMuted }} />
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: tokens.textPrimary }}>No customers found</p>
                    <p className="text-sm" style={{ color: tokens.textSecondary }}>Try a different search or filter</p>
                  </div>
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="transition-all duration-150 cursor-pointer"
                  style={{ height: '56px', borderBottom: `1px solid ${tokens.rowBorder}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = tokens.rowHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => onView(customer)}
                >
                  <td className="px-6">
                    <span className="font-mono text-sm whitespace-nowrap" style={{ color: tokens.textPrimary }}>
                      {customer.displayId}
                    </span>
                  </td>
                  <td className="px-6"><RiskBar risk={customer.churnRisk} /></td>
                  <td className="px-6"><RiskBadge level={customer.riskLevel} /></td>
                  <td className="px-6">
                    <span className="text-sm whitespace-nowrap" style={{ color: tokens.textSecondary }}>
                      {formatReason(customer.churnReason)}
                    </span>
                  </td>
                  <td className="px-6">
                    <span
                      className="text-sm truncate block max-w-[180px]"
                      style={{ color: tokens.textPrimary }}
                      title={customer.retentionOffer}
                    >
                      {customer.retentionOffer}
                    </span>
                  </td>
                  <td className="px-6"><StatusBadge status={customer.offerStatus} /></td>
                  <td className="px-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(customer);
                      }}
                      className="text-sm font-medium transition-all duration-150 hover:underline cursor-pointer whitespace-nowrap"
                      style={{ color: tokens.accent }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showPagination && !loading && customers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-0 justify-between" style={{ padding: 'clamp(12px, 2vw, 24px)', borderTop: `1px solid ${tokens.cardBorder}`, minWidth: 0 }}>
          <p className="text-sm" style={{ color: tokens.textSecondary, overflowWrap: 'break-word' }}>
            {total.toLocaleString()} total customers
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: tokens.textSecondary }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).slice(0, 7).map((_, i) => {
              const p = i + 1;
              const isActive = p === page;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer"
                  style={{
                    background: isActive ? tokens.accent : 'transparent',
                    color: isActive ? (tokens.mode === 'dark' ? '#1A1A1A' : '#FFFFFF') : tokens.textSecondary,
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ color: tokens.textSecondary }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
