import { useMemo, useRef, useState } from 'react';
import { X, Loader2, CheckCircle, AlertTriangle, Sparkles, Search, ChevronDown } from 'lucide-react';
import type {
  ContractType,
  Customer,
  InternetService,
  PredictionInput,
  PredictionResult,
} from '../types';
import { reasonToSentence } from '../lib/format'; 
import { progressColor, riskBadgeStyle } from '../lib/format';
import { insertPrediction } from '../lib/api';
import { useTheme } from '../lib/theme';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { tokens } = useTheme();
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: tokens.textSecondary }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { tokens } = useTheme();
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm" style={{ color: tokens.textPrimary }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all duration-150 cursor-pointer"
        style={{ background: value ? tokens.accent : tokens.inputBorder }}
        aria-pressed={value}
      >
        <span
          className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-150"
          style={{ left: value ? '22px' : '2px' }}
        />
      </button>
    </div>
  );
}

function ResultCard({
  result,
  customer,
  isNew,
}: {
  result: PredictionResult;
  customer?: Customer;
  isNew?: boolean;
}) {
  const { tokens } = useTheme();
  const color = riskBadgeStyle(result.riskLevel, tokens);
  const bar = progressColor(result.churnRisk);
  return (
    <div className="mt-5 p-5 rounded-xl" style={{ background: tokens.accentSoftBg, border: `1px solid ${tokens.accentSoftBorder}` }}>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5" style={{ color: tokens.accent }} />
        <h4 className="text-sm font-semibold" style={{ color: tokens.textPrimary }}>
          {customer ? `${customer.displayId} ${isNew ? 'added' : 'updated'}` : 'Prediction Result'}
        </h4>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: bar }}>
          <span className="text-white font-bold text-lg">{result.churnRisk}%</span>
        </div>
        <div>
          <p className="text-xs" style={{ color: tokens.textSecondary }}>Churn Probability</p>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium mt-1"
            style={{ background: color.bg, color: color.text }}
          >
            {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk
          </span>
        </div>
      </div>
      <div className="flex gap-2 mb-3 p-3 rounded-lg" style={{ background: tokens.cardBg }}>
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: color.text }} />
        <p className="text-sm font-medium" style={{ color: color.text }}>{result.churnReasonSentence}</p>
      </div>
      <div className="p-3 rounded-lg" style={{ background: tokens.cardBg }}>
        <p className="text-xs uppercase tracking-wider font-medium mb-1" style={{ color: tokens.textSecondary }}>
          Recommended Retention Offer
        </p>
        <p className="text-sm font-medium" style={{ color: tokens.textPrimary }}>{result.retentionOffer}</p>
      </div>
    </div>
  );
}

function CustomerAutocomplete({
  options,
  selectedId,
  onSelect,
}: {
  options: Customer[];
  selectedId: string;
  onSelect: (c: Customer | undefined) => void;
}) {
  const { tokens } = useTheme();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options.filter((o) => o.displayId.toLowerCase().includes(q)).slice(0, 8);
  }, [options, query]);

  const inputStyle = { border: `1px solid ${tokens.inputBorder}`, background: tokens.inputBg, color: tokens.textPrimary };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative cursor-pointer" onClick={() => setOpen(true)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: tokens.textSecondary }} />
        <input
          type="text"
          value={selectedId || query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSelect(undefined);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search existing customer ID..."
          className="w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 cursor-pointer"
          style={{ ...inputStyle, paddingLeft: '2.5rem', '--tw-ring-color': tokens.accent } as React.CSSProperties}
        />
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: tokens.textSecondary }}
        />
      </div>

      {open && filtered.length > 0 && (
        <div
          className="absolute z-[210] left-0 right-0 mt-1 rounded-lg overflow-hidden chat-scroll"
          style={{ border: `1px solid ${tokens.cardBorder}`, background: tokens.cardBg, maxHeight: '240px', overflowY: 'auto' }}
        >
          {filtered.map((opt) => (
            <button
              key={opt.displayId}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(opt);
                setQuery('');
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors duration-150 cursor-pointer"
              style={{ color: tokens.textPrimary }}
              onMouseEnter={(e) => (e.currentTarget.style.background = tokens.rowHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="text-sm font-mono">{opt.displayId}</span>
              <span className="text-xs" style={{ color: progressColor(opt.churnRisk) }}>
                {opt.churnRisk}% risk
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PredictModal({
  existingCustomers,
  onClose,
  onSaved,
}: {
  existingCustomers: Customer[];
  onClose: () => void;
  onSaved: (c: Customer) => void;
}) {
  const { tokens } = useTheme();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<PredictionInput>({
    customerId: '',
    monthlyCharges: 60,
    tenureMonths: 12,
    contractType: 'Month-to-month',
    internetService: 'Fiber optic',
    techSupport: false,
    onlineSecurity: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [savedCustomer, setSavedCustomer] = useState<Customer | undefined>(undefined);
  const [savedIsNew, setSavedIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo<Customer[]>(() => existingCustomers, [existingCustomers]);

  const handleSelect = (c: Customer | undefined) => {
    if (!c) {
      setSelectedCustomer(null);
      setForm((f) => ({ ...f, customerId: '' }));
      return;
    }
    setSelectedCustomer(c);
    setForm({
      customerId: c.displayId,
      monthlyCharges: c.monthlyCharges,
      tenureMonths: c.tenureMonths,
      contractType: c.contractType,
      internetService: c.internetService,
      techSupport: c.techSupport,
      onlineSecurity: c.onlineSecurity,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSavedCustomer(undefined);
    try {
      const saved = await insertPrediction(form);
      const pred: PredictionResult = {
      churnRisk: saved.customer.churnRisk,
      riskLevel: saved.customer.riskLevel,
      churnReason: saved.customer.churnReason,
      churnReasonSentence: reasonToSentence(saved.customer.churnReason),
      retentionOffer: saved.customer.retentionOffer,
};
setResult(pred);
      setResult(pred);
      setSavedCustomer(saved.customer);
      setSavedIsNew(saved.isNew);
      onSaved(saved.customer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not run prediction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 text-sm rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 cursor-pointer';
  const inputStyle = { border: `1px solid ${tokens.inputBorder}`, background: tokens.inputBg, color: tokens.textPrimary };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto chat-scroll"
        style={{ background: tokens.cardBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: tokens.accent }}>
                <Sparkles className="w-4 h-4" style={{ color: tokens.mode === 'dark' ? '#1A1A1A' : '#FFFFFF' }} />
              </div>
              <h3 className="text-lg font-semibold" style={{ color: tokens.textPrimary }}>
                Predict Customer Churn
              </h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg transition-colors cursor-pointer" style={{ color: tokens.textMuted }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {selectedCustomer && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-3 flex-wrap" style={{ background: tokens.accentSoftBg, border: `1px solid ${tokens.accentSoftBorder}` }}>
              <span className="text-xs uppercase tracking-wider font-medium" style={{ color: tokens.textSecondary }}>
                Loaded
              </span>
              <span className="text-sm font-mono font-medium" style={{ color: tokens.textPrimary }}>
                {selectedCustomer.displayId}
              </span>
              <span className="text-xs" style={{ color: tokens.textSecondary }}>
                fields auto-filled from existing record
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Customer ID">
              <CustomerAutocomplete
                options={options}
                selectedId={selectedCustomer?.displayId ?? ''}
                onSelect={handleSelect}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Monthly Charges ($)">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthlyCharges}
                  onChange={(e) => setForm({ ...form, monthlyCharges: Number(e.target.value) })}
                  className={inputClass}
                  style={{ ...inputStyle, '--tw-ring-color': tokens.accent } as React.CSSProperties}
                />
              </Field>
              <Field label="Tenure (months)">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.tenureMonths}
                  onChange={(e) => setForm({ ...form, tenureMonths: Number(e.target.value) })}
                  className={inputClass}
                  style={{ ...inputStyle, '--tw-ring-color': tokens.accent } as React.CSSProperties}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Contract Type">
                <select
                  value={form.contractType}
                  onChange={(e) => setForm({ ...form, contractType: e.target.value as ContractType })}
                  className={inputClass}
                  style={{ ...inputStyle, '--tw-ring-color': tokens.accent } as React.CSSProperties}
                >
                  <option>Month-to-month</option>
                  <option>One year</option>
                  <option>Two year</option>
                </select>
              </Field>
              <Field label="Internet Service">
                <select
                  value={form.internetService}
                  onChange={(e) => setForm({ ...form, internetService: e.target.value as InternetService })}
                  className={inputClass}
                  style={{ ...inputStyle, '--tw-ring-color': tokens.accent } as React.CSSProperties}
                >
                  <option>DSL</option>
                  <option>Fiber optic</option>
                  <option>No</option>
                </select>
              </Field>
            </div>
            <div className="space-y-1 p-3 rounded-lg" style={{ background: tokens.accentSoftBg }}>
              <Toggle label="Tech Support" value={form.techSupport} onChange={(v) => setForm({ ...form, techSupport: v })} />
              <Toggle label="Online Security" value={form.onlineSecurity} onChange={(v) => setForm({ ...form, onlineSecurity: v })} />
            </div>

            {error && (
              <div className="p-3 rounded-lg text-sm flex items-center gap-2" style={{ background: tokens.dangerBg, color: tokens.dangerText }}>
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold rounded-lg transition-all duration-150 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: tokens.accent, color: tokens.mode === 'dark' ? '#1A1A1A' : '#FFFFFF' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Running Prediction...
                </>
              ) : (
                'Run Prediction'
              )}
            </button>
          </form>

          {result && <ResultCard result={result} customer={savedCustomer} isNew={savedIsNew} />}
        </div>
      </div>
    </div>
  );
}
