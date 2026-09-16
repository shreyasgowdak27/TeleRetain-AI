import axios from 'axios';
import { formatReason, offerForReason, reasonToSentence } from './format';
import type {
  Customer,
  DashboardStats,
  PredictionInput,
  PredictionResult,
  RiskFilter,
} from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({ baseURL: API_BASE_URL });

interface BackendCustomer {
  customerID: string;
  features: Record<string, number>;
  churn_probability: number;
  churn_prediction: number;
  risk_level: string;
  churn_reason: string;
  retention_offer: string;
  offer_type: string;
  offer_priority: string;
  offer_status: string;
}

function mapCustomer(row: BackendCustomer): Customer {
  const f = row.features ?? {};
  return {
    id: row.customerID,
    displayId: row.customerID,
    churnRisk: Math.round((row.churn_probability ?? 0) * 100),
    riskLevel: (row.risk_level ?? 'low').toLowerCase() as Customer['riskLevel'],
    churnReason: row.churn_reason,
    retentionOffer: row.retention_offer,
    offerStatus: (row.offer_status ?? 'pending').toLowerCase() as Customer['offerStatus'],
    monthlyCharges: Number(f.MonthlyCharges ?? 0),
    tenureMonths: Number(f.tenure ?? 0),
    contractType: f['Contract_Month-to-month']
      ? 'Month-to-month'
      : f['Contract_One year']
        ? 'One year'
        : 'Two year',
    internetService: f['InternetService_Fiber optic']
      ? 'Fiber optic'
      : f.InternetService_DSL
        ? 'DSL'
        : 'No',
    techSupport: Boolean(f.TechSupport),
    onlineSecurity: Boolean(f.OnlineSecurity),
    createdAt: new Date().toISOString(),
  };
}

export interface FetchPageParams {
  search?: string;
  riskLevel?: RiskFilter;
  page: number;
  pageSize: number;
}

export async function fetchCustomersPage(
  params: FetchPageParams
): Promise<{ customers: Customer[]; total: number }> {
  const { data } = await api.get('/customers');
  let customers = (data.customers as BackendCustomer[]).map(mapCustomer);

  if (params.riskLevel && params.riskLevel !== 'all') {
    customers = customers.filter((c) => c.riskLevel === params.riskLevel);
  }
  if (params.search?.trim()) {
    const s = params.search.trim().toLowerCase();
    customers = customers.filter(
      (c) =>
        c.displayId.toLowerCase().includes(s) ||
        c.churnReason.toLowerCase().includes(s)
    );
  }

  const total = customers.length;
  const start = (params.page - 1) * params.pageSize;
  const paged = customers.slice(start, start + params.pageSize);

  return { customers: paged, total };
}

export async function fetchTotalCount(): Promise<number> {
  const { data } = await api.get('/customers');
  return data.total ?? 0;
}

export async function fetchStats(): Promise<DashboardStats> {
  const { data } = await api.get('/customers');
  const rows = (data.customers as BackendCustomer[]) ?? [];
  const total = rows.length;
  const highRisk = rows.filter((r) => r.risk_level?.toLowerCase() === 'high').length;
  const retained = rows.filter((r) => r.offer_status?.toLowerCase() === 'accepted').length;
  const avgChurn =
    total > 0
      ? Math.round(
          (rows.reduce((s, r) => s + (r.churn_probability ?? 0), 0) / total) * 100
        )
      : 0;

  return {
    totalCustomers: total,
    highRisk,
    retained,
    churnRate: avgChurn,
    totalTrend: { value: '2.4% from last week', direction: 'up', positive: true },
    highRiskTrend: { value: '5.1% from last week', direction: 'down', positive: true },
    retainedTrend: { value: '8.3% from last week', direction: 'up', positive: true },
    churnRateTrend: { value: '1.2% from last week', direction: 'down', positive: true },
  };
}

export async function updateOfferStatus(
  id: string,
  status: 'accepted' | 'rejected'
): Promise<void> {
  const backendStatus = status === 'accepted' ? 'Accepted' : 'Rejected';
  await api.patch(`/customers/${id}/offer-status`, null, {
    params: { status: backendStatus },
  });
}

export interface SavedPrediction {
  customer: Customer;
  isNew: boolean;
}

export async function insertPrediction(
  input: PredictionInput
): Promise<SavedPrediction> {
  const customerID =
    input.customerId.trim().toUpperCase() ||
    `CUST-${String(Date.now()).slice(-4)}`;

  const payload = {
    customerID,
    gender: 0,
    SeniorCitizen: 0,
    Partner: 0,
    Dependents: 0,
    tenure: input.tenureMonths,
    PhoneService: 1,
    MultipleLines: 0,
    OnlineSecurity: input.onlineSecurity ? 1 : 0,
    OnlineBackup: 0,
    DeviceProtection: 0,
    TechSupport: input.techSupport ? 1 : 0,
    StreamingTV: 0,
    StreamingMovies: 0,
    PaperlessBilling: 0,
    MonthlyCharges: input.monthlyCharges,
    TotalCharges: input.monthlyCharges * Math.max(input.tenureMonths, 1),
    InternetService_DSL: input.internetService === 'DSL' ? 1 : 0,
    InternetService_Fiber_optic: input.internetService === 'Fiber optic' ? 1 : 0,
    InternetService_No: input.internetService === 'No' ? 1 : 0,
    Contract_Month_to_month: input.contractType === 'Month-to-month' ? 1 : 0,
    Contract_One_year: input.contractType === 'One year' ? 1 : 0,
    Contract_Two_year: input.contractType === 'Two year' ? 1 : 0,
    PaymentMethod_Bank_transfer: 0,
    PaymentMethod_Credit_card: 0,
    PaymentMethod_Electronic_check: 1,
    PaymentMethod_Mailed_check: 0,
  };

  const { data } = await api.post('/predict', payload);

  const customer: Customer = {
    id: data.customerID,
    displayId: data.customerID,
    churnRisk: Math.round((data.churn_probability ?? 0) * 100),
    riskLevel: (data.risk_level ?? 'low').toLowerCase() as Customer['riskLevel'],
    churnReason: data.churn_reason,
    retentionOffer: data.retention_offer,
    offerStatus: 'pending',
    monthlyCharges: input.monthlyCharges,
    tenureMonths: input.tenureMonths,
    contractType: input.contractType,
    internetService: input.internetService,
    techSupport: input.techSupport,
    onlineSecurity: input.onlineSecurity,
    createdAt: new Date().toISOString(),
  };

  return { customer, isNew: true };
}

export async function answerQuestion(message: string): Promise<string> {
  const q = message.toLowerCase();
  const { data } = await api.get('/customers');
  const rows = (data.customers as BackendCustomer[]) ?? [];

  if (q.includes('most at risk') || q.includes('at risk') || q.includes('who')) {
    const top = [...rows]
      .sort((a, b) => (b.churn_probability ?? 0) - (a.churn_probability ?? 0))
      .slice(0, 3);
    if (top.length === 0) return 'No customers found.';
    const lines = top.map(
      (c) =>
        `• ${c.customerID} — ${Math.round((c.churn_probability ?? 0) * 100)}% (${c.risk_level}, ${formatReason(c.churn_reason)})`
    );
    return `The customers most at risk of churning are:\n\n${lines.join('\n')}`;
  }

  if (q.includes('retention') || q.includes('offer')) {
    const pending = rows.filter((r) => r.offer_status?.toLowerCase() === 'pending').length;
    const accepted = rows.filter((r) => r.offer_status?.toLowerCase() === 'accepted').length;
    const rejected = rows.filter((r) => r.offer_status?.toLowerCase() === 'rejected').length;
    return `Retention offer summary:\n• ${pending} pending\n• ${accepted} accepted\n• ${rejected} rejected`;
  }

  if (q.includes('churn rate') || q.includes('rate')) {
    const stats = await fetchStats();
    return `Today's average churn risk is ${stats.churnRate}%. ${stats.highRisk} customers are flagged high risk out of ${stats.totalCustomers}.`;
  }

  return 'I can help with churn risk, retention offers, and customer insights. Try asking "Who is most at risk?"';
}