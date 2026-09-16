import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeTokens {
  mode: Theme;
  accent: string;
  accentSoftBg: string;
  accentSoftBorder: string;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  headerBg: string;
  headerBorder: string;
  rowHover: string;
  rowBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  iconMuted: string;
  dangerBg: string;
  dangerText: string;
  successBg: string;
  successText: string;
  warningBg: string;
  warningText: string;
  badgeHighBg: string;
  badgeHighText: string;
  badgeMediumBg: string;
  badgeMediumText: string;
  badgeLowBg: string;
  badgeLowText: string;
  badgePendingBg: string;
  badgePendingText: string;
  badgeAcceptedBg: string;
  badgeAcceptedText: string;
  badgeRejectedBg: string;
  badgeRejectedText: string;
}

const LIGHT: ThemeTokens = {
  mode: 'light',
  accent: '#1A1A1A',
  accentSoftBg: '#F3F4F6',
  accentSoftBorder: '#E5E7EB',
  pageBg: '#F9FAFB',
  cardBg: '#FFFFFF',
  cardBorder: '#E5E7EB',
  inputBg: '#FFFFFF',
  inputBorder: '#E5E7EB',
  headerBg: '#FFFFFF',
  headerBorder: '#E5E7EB',
  rowHover: '#F3F4F6',
  rowBorder: '#F3F4F6',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  iconMuted: '#6B7280',
  dangerBg: '#FEF2F2',
  dangerText: '#EF4444',
  successBg: '#ECFDF5',
  successText: '#10B981',
  warningBg: '#FFFBEB',
  warningText: '#F59E0B',
  badgeHighBg: '#FEE2E2',
  badgeHighText: '#B91C1C',
  badgeMediumBg: '#FEF3C7',
  badgeMediumText: '#B45309',
  badgeLowBg: '#D1FAE5',
  badgeLowText: '#047857',
  badgePendingBg: '#F3F4F6',
  badgePendingText: '#4B5563',
  badgeAcceptedBg: '#D1FAE5',
  badgeAcceptedText: '#047857',
  badgeRejectedBg: '#FEE2E2',
  badgeRejectedText: '#B91C1C',
};

const DARK: ThemeTokens = {
  mode: 'dark',
  accent: '#F5F5F5',
  accentSoftBg: '#2A2A2A',
  accentSoftBorder: '#3A3A3A',
  pageBg: '#121212',
  cardBg: '#1E1E1E',
  cardBorder: '#2E2E2E',
  inputBg: '#1A1A1A',
  inputBorder: '#333333',
  headerBg: '#1A1A1A',
  headerBorder: '#2E2E2E',
  rowHover: '#262626',
  rowBorder: '#262626',
  textPrimary: '#F5F5F5',
  textSecondary: '#A0A0A0',
  textMuted: '#737373',
  iconMuted: '#A0A0A0',
  dangerBg: '#3B1414',
  dangerText: '#F87171',
  successBg: '#0F2A1E',
  successText: '#34D399',
  warningBg: '#3A2A0A',
  warningText: '#FBBF24',
  badgeHighBg: '#3B1414',
  badgeHighText: '#F87171',
  badgeMediumBg: '#3A2A0A',
  badgeMediumText: '#FBBF24',
  badgeLowBg: '#0F2A1E',
  badgeLowText: '#34D399',
  badgePendingBg: '#2A2A2A',
  badgePendingText: '#A0A0A0',
  badgeAcceptedBg: '#0F2A1E',
  badgeAcceptedText: '#34D399',
  badgeRejectedBg: '#3B1414',
  badgeRejectedText: '#F87171',
};

const ThemeContext = createContext<{
  theme: Theme;
  tokens: ThemeTokens;
  toggle: () => void;
}>({
  theme: 'light',
  tokens: LIGHT,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    document.body.style.backgroundColor =
      theme === 'dark' ? '#121212' : '#F9FAFB';
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      tokens: theme === 'dark' ? DARK : LIGHT,
      toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
