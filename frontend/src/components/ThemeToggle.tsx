import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/theme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      className="relative w-11 h-6 rounded-full transition-all duration-200 cursor-pointer flex items-center"
      style={{ background: isDark ? '#F5F5F5' : '#E5E7EB' }}
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span
        className="absolute w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200"
        style={{
          left: isDark ? '22px' : '2px',
          top: '2px',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        {isDark ? <Moon className="w-3 h-3 text-gray-700" /> : <Sun className="w-3 h-3 text-amber-500" />}
      </span>
    </button>
  );
}
