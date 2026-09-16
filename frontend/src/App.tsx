import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import type { Customer, DashboardStats, RiskFilter } from './types';
import { fetchCustomersPage, fetchStats } from './lib/api';
import { StatCard } from './components/StatCard';
import { CustomerTable } from './components/CustomerTable';
import { AISidebar } from './components/AISidebar';
import { CustomerModal } from './components/CustomerModal';
import { PredictModal } from './components/PredictModal';
import { AccountDropdown } from './components/AccountDropdown';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider, useTheme } from './lib/theme';

const PAGE_SIZE = 10;
const MOBILE_BREAKPOINT = 640;

type Nav = 'dashboard' | 'customers';

function useViewportWidth() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}

function Dashboard() {
  const { tokens } = useTheme();
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth <= MOBILE_BREAKPOINT;

  const [nav, setNav] = useState<Nav>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [search, setSearch] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskFilter>('all');
  const [page, setPage] = useState(1);

  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardCustomers, setDashboardCustomers] = useState<Customer[]>([]);
  const [dashboardTotal, setDashboardTotal] = useState(0);

  const [customersLoading, setCustomersLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersTotal, setCustomersTotal] = useState(0);

  const [selected, setSelected] = useState<Customer | null>(null);
  const [predictOpen, setPredictOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setDashboardLoading(true);
    try {
      const [statData, pageData] = await Promise.all([
        fetchStats(),
        fetchCustomersPage({ riskLevel: 'high', orderBy: 'churn_risk', ascending: false, page: 1, pageSize: 10 }),
      ]);
      setStats(statData);
      setDashboardCustomers(pageData.customers);
      setDashboardTotal(pageData.total);
    } catch {
      setStats(null);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (nav !== 'customers') return;
    let active = true;
    setCustomersLoading(true);
    fetchCustomersPage({ search, riskLevel, page, pageSize: PAGE_SIZE })
      .then(({ customers, total }) => {
        if (!active) return;
        setCustomers(customers);
        setCustomersTotal(total);
      })
      .catch(() => {
        if (!active) return;
        setCustomers([]);
        setCustomersTotal(0);
      })
      .finally(() => active && setCustomersLoading(false));
    return () => {
      active = false;
    };
  }, [nav, search, riskLevel, page]);

  const refreshAfterMutation = useCallback(() => {
    loadDashboard();
    if (nav === 'customers') {
      fetchCustomersPage({ search, riskLevel, page, pageSize: PAGE_SIZE }).then(({ customers, total }) => {
        setCustomers(customers);
        setCustomersTotal(total);
      });
    }
  }, [loadDashboard, nav, search, riskLevel, page]);

  const handleStatusChange = useCallback(
    (id: string, status: 'accepted' | 'rejected') => {
      const patch = (list: Customer[]) => list.map((c) => (c.id === id ? { ...c, offerStatus: status } : c));
      setDashboardCustomers(patch);
      setCustomers(patch);
      setSelected((c) => (c && c.id === id ? { ...c, offerStatus: status } : c));
      refreshAfterMutation();
    },
    [refreshAfterMutation]
  );

  const handlePredictSaved = useCallback(() => {
    loadDashboard();
    if (nav === 'customers') setPage(1);
  }, [loadDashboard, nav]);

  const headerTitle = nav === 'dashboard' ? 'Dashboard' : 'Customers';
  const headerSubtitle =
    nav === 'dashboard'
      ? 'Churn predictions and retention overview'
      : 'Browse and manage every customer record';

  const statsGrid = useMemo(() => {
    if (!stats) return null;
    return (
      <div
        className="grid gap-4 mb-6 sm:mb-8"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 22vw, 260px), 1fr))',
        }}
      >
        <StatCard label="Total Customers" value={stats.totalCustomers} trend={stats.totalTrend} />
        <StatCard label="High Risk" value={stats.highRisk} trend={stats.highRiskTrend} />
        <StatCard label="Retained" value={stats.retained} trend={stats.retainedTrend} />
        <StatCard label="Churn Rate" value={`${stats.churnRate}%`} trend={stats.churnRateTrend} />
      </div>
    );
  }, [stats]);

  return (
    <div className="min-h-screen" style={{ background: tokens.pageBg, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* 3px accent progress bar at very top */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-[300]" style={{ background: tokens.accent }} />

      {/* Navbar */}
      <nav
        className="fixed top-[3px] left-0 right-0 z-[100]"
        style={{ height: '56px', background: tokens.headerBg, borderBottom: `1px solid ${tokens.headerBorder}` }}
      >
        <div
          className="h-full flex items-center gap-2"
          style={{ paddingInline: 'clamp(12px, 3vw, 24px)' }}
        >
          {/* Logo: pinned on the left, outside the scrollable area */}
          <div className="flex items-center gap-2 shrink-0" style={{ minWidth: 0 }}>
            <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: tokens.accent }}>
              <span className="font-bold text-sm" style={{ color: tokens.mode === 'dark' ? '#1A1A1A' : '#FFFFFF' }}>T</span>
            </div>
            <span className="header-logo font-bold" style={{ color: tokens.textPrimary }}>
              TeleRetain AI
            </span>
          </div>

          {/* Horizontally scrollable nav + actions. Nothing is hidden or
              clipped — every item is reachable by scrolling. */}
          <div className="header-scroll flex items-center gap-2 sm:gap-3 flex-1" style={{ minWidth: 0 }}>
            {(['dashboard', 'customers'] as Nav[]).map((n) => (
              <button
                key={n}
                onClick={() => setNav(n)}
                className="relative py-2 text-sm font-medium transition-all duration-150 cursor-pointer capitalize whitespace-nowrap shrink-0"
                style={{ color: nav === n ? tokens.textPrimary : tokens.textSecondary, paddingInline: 'clamp(8px, 2vw, 16px)' }}
              >
                {n}
                {nav === n && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: tokens.accent }} />
                )}
              </button>
            ))}

            <div className="flex items-center gap-2 whitespace-nowrap shrink-0" style={{ color: tokens.textSecondary }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
              <span className="text-sm" style={{ color: tokens.textSecondary }}>Live</span>
            </div>
            <ThemeToggle />
            <button
              onClick={() => setPredictOpen(true)}
              className="flex items-center gap-1.5 rounded-lg transition-all duration-150 cursor-pointer hover:opacity-90 shrink-0 whitespace-nowrap"
              style={{
                background: tokens.accent,
                color: tokens.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
                paddingInline: 'clamp(10px, 2vw, 16px)',
                paddingBlock: '8px',
              }}
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">Predict Customer</span>
            </button>
            <AccountDropdown />
          </div>
        </div>
      </nav>

      {/* Body: single full-width content column. The assistant is now an
          overlay, so content never resizes when it opens. */}
      <div style={{ paddingTop: '59px', minHeight: '100vh' }}>
        <main
          className="overflow-y-auto"
          style={{ padding: 'clamp(16px, 3vw, 32px)', minWidth: 0 }}
        >
          <div className="mb-6 sm:mb-8" style={{ minWidth: 0 }}>
            <h1
              className="font-bold mb-1"
              style={{ color: tokens.textPrimary, fontSize: 'clamp(20px, 3vw, 28px)', overflowWrap: 'break-word' }}
            >
              {headerTitle}
            </h1>
            <p className="text-sm" style={{ color: tokens.textSecondary, overflowWrap: 'break-word' }}>
              {headerSubtitle}
            </p>
          </div>

          <div style={{ minWidth: 0 }}>
            {nav === 'dashboard' ? (
              <>
                {statsGrid}
                <CustomerTable
                  loading={dashboardLoading}
                  customers={dashboardCustomers}
                  total={dashboardTotal}
                  page={1}
                  pageSize={10}
                  search=""
                  riskLevel={'high'}
                  onSearchChange={() => {}}
                  onRiskLevelChange={() => {}}
                  onPageChange={() => {}}
                  onView={setSelected}
                  showFilters={false}
                  showPagination={false}
                  sectionTitle="High-Risk Customers"
                />
              </>
            ) : (
              <CustomerTable
                loading={customersLoading}
                customers={customers}
                total={customersTotal}
                page={page}
                pageSize={PAGE_SIZE}
                search={search}
                riskLevel={riskLevel}
                onSearchChange={(s) => {
                  setSearch(s);
                  setPage(1);
                }}
                onRiskLevelChange={(r) => {
                  setRiskLevel(r);
                  setPage(1);
                }}
                onPageChange={setPage}
                onView={setSelected}
                showFilters
                showPagination
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating chat button — always visible when the assistant is closed.
          Inline styles for position/z-index/size so rendering does not depend
          on Tailwind arbitrary-value classes being JIT-compiled in dev mode. */}
      {!assistantOpen && (
        <button
          onClick={() => setAssistantOpen(true)}
          className="rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-105"
          style={{
            position: 'fixed',
            right: '16px',
            bottom: '16px',
            zIndex: 110,
            width: '48px',
            height: '48px',
            background: tokens.accent,
            color: tokens.mode === 'dark' ? '#1A1A1A' : '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            opacity: 1,
          }}
          title="Open AI Assistant"
          aria-label="Open AI Assistant"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}

      {/* AI Assistant overlay.
          Mobile: full-screen. Desktop/tablet: fixed panel sliding in from
          the right over the content (does not push content aside). */}
      {assistantOpen && (
        <>
          {/* Dimmed backdrop on desktop only (closes on click); mobile is full-screen so no backdrop needed */}
          {!isMobile && (
            <div
              className="fixed inset-0 z-[140] bg-black/30 transition-opacity duration-300"
              onClick={() => setAssistantOpen(false)}
            />
          )}
          <div
            className={
              isMobile
                ? 'fixed inset-0 z-[150]'
                : 'fixed top-[59px] bottom-0 right-0 z-[150] animate-[slideIn_0.3s_ease-in-out]'
            }
            style={
              isMobile
                ? undefined
                : {
                    width: 'clamp(320px, 32vw, 420px)',
                    borderLeft: `1px solid ${tokens.cardBorder}`,
                    boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                  }
            }
          >
            <AISidebar onClose={() => setAssistantOpen(false)} />
          </div>
        </>
      )}

      {selected && (
        <CustomerModal
          customer={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {predictOpen && (
        <PredictModal
          existingCustomers={dashboardCustomers}
          onClose={() => setPredictOpen(false)}
          onSaved={handlePredictSaved}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
