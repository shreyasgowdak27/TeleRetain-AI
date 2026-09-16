export interface Customer {
  id: string;
  displayId: string;
  churnRisk: number;
  riskLevel: RiskLevel;
  churnReason: string;
  retentionOffer: string;
  offerStatus: OfferStatus;
  monthlyCharges: number;
  tenureMonths: number;
  contractType: ContractType;
  internetService: InternetService;
  techSupport: boolean;
  onlineSecurity: boolean;
  createdAt: string;
}

export type RiskLevel = 'low' | 'medium' | 'high';
export type OfferStatus = 'pending' | 'accepted' | 'rejected';
export type RiskFilter = 'all' | RiskLevel;
export type ContractType = 'Month-to-month' | 'One year' | 'Two year';
export type InternetService = 'DSL' | 'Fiber optic' | 'No';

export interface Trend {
  value: string;
  direction: 'up' | 'down';
  positive: boolean;
}

export interface DashboardStats {
  totalCustomers: number;
  highRisk: number;
  retained: number;
  churnRate: number;
  totalTrend: Trend;
  highRiskTrend: Trend;
  retainedTrend: Trend;
  churnRateTrend: Trend;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PredictionInput {
  customerId: string;
  monthlyCharges: number;
  tenureMonths: number;
  contractType: ContractType;
  internetService: InternetService;
  techSupport: boolean;
  onlineSecurity: boolean;
}

export interface PredictionResult {
  churnRisk: number;
  riskLevel: RiskLevel;
  churnReason: string;
  churnReasonSentence: string;
  retentionOffer: string;
}
