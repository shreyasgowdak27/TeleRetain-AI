import type { OfferStatus, RiskLevel } from '../types';

export function formatReason(reason: string): string {
  return reason.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const REASON_SENTENCES: Record<string, string> = {
  high_billing: 'This customer is at risk due to high monthly billing.',
  short_tenure: 'This customer is at risk due to short tenure and early-stage vulnerability.',
  month_to_month: 'This customer is at risk due to a month-to-month contract with no lock-in.',
  fiber_service: 'This customer is at risk due to fiber optic service issues.',
  no_tech_support: 'This customer is at risk due to a lack of tech support.',
  no_online_security: 'This customer is at risk due to missing online security.',
  low_engagement: 'This customer shows low engagement and may churn.',
};

export function reasonToSentence(reason: string): string {
  return REASON_SENTENCES[reason] ?? `This customer is at risk due to ${formatReason(reason).toLowerCase()}.`;
}

const OFFERS: Record<string, string> = {
  high_billing: '20% discount on the next 3 months of service',
  short_tenure: 'Free upgrade to a premium plan for 2 months',
  month_to_month: 'Lock in a 1-year contract at a 10% lower monthly rate',
  fiber_service: 'Free service visit to optimize your fiber connection',
  no_tech_support: '3 months of complimentary priority tech support',
  no_online_security: 'Free online security suite for 6 months',
  low_engagement: 'Personalized check-in call with a retention specialist',
};

export function offerForReason(reason: string): string {
  return OFFERS[reason] ?? 'Personalized check-in call with a retention specialist';
}

export function progressColor(risk: number): string {
  if (risk > 70) return '#EF4444';
  if (risk > 40) return '#F59E0B';
  return '#10B981';
}

export function riskBadgeStyle(
  level: RiskLevel,
  tokens: { badgeHighBg: string; badgeHighText: string; badgeMediumBg: string; badgeMediumText: string; badgeLowBg: string; badgeLowText: string }
) {
  return {
    high: { bg: tokens.badgeHighBg, text: tokens.badgeHighText },
    medium: { bg: tokens.badgeMediumBg, text: tokens.badgeMediumText },
    low: { bg: tokens.badgeLowBg, text: tokens.badgeLowText },
  }[level];
}

export function statusBadgeStyle(
  status: OfferStatus,
  tokens: { badgePendingBg: string; badgePendingText: string; badgeAcceptedBg: string; badgeAcceptedText: string; badgeRejectedBg: string; badgeRejectedText: string }
) {
  return {
    pending: { label: 'Pending', bg: tokens.badgePendingBg, text: tokens.badgePendingText },
    accepted: { label: 'Accepted', bg: tokens.badgeAcceptedBg, text: tokens.badgeAcceptedText },
    rejected: { label: 'Rejected', bg: tokens.badgeRejectedBg, text: tokens.badgeRejectedText },
  }[status];
}
