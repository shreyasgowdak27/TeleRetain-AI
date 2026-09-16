import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../lib/theme';

const STAFF = { name: 'Shreyas', role: 'Retention Analyst' };

interface Pos {
  top: number;
  left: number;
}

export function AccountDropdown() {
  const { tokens } = useTheme();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const menuWidth = 240;
    let left = r.right - menuWidth;
    if (left < 8) left = 8;
    setPos({ top: r.bottom + 8, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const menu = open
    ? createPortal(
        <div
          className="fixed w-60 rounded-xl p-2"
          style={{
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            background: tokens.cardBg,
            border: `1px solid ${tokens.cardBorder}`,
            zIndex: 9999,
          }}
          role="menu"
        >
          <div className="px-3 py-2.5" style={{ borderBottom: `1px solid ${tokens.cardBorder}` }}>
            <p className="text-sm font-semibold" style={{ color: tokens.textPrimary }}>{STAFF.name}</p>
            <p className="text-xs mt-0.5" style={{ color: tokens.textSecondary }}>{STAFF.role}</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-full mt-1 flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg transition-colors duration-150 cursor-pointer"
            style={{ color: tokens.textPrimary }}
            onMouseEnter={(e) => (e.currentTarget.style.background = tokens.rowHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            role="menuitem"
          >
            <LogOut className="w-4 h-4" style={{ color: tokens.textSecondary }} />
            Log out
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-150 hover:opacity-90"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: tokens.accent }}
        >
          <span className="text-sm font-medium" style={{ color: tokens.mode === 'dark' ? '#1A1A1A' : '#FFFFFF' }}>
            {STAFF.name.charAt(0)}
          </span>
        </div>
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform duration-150"
          style={{ color: tokens.textSecondary, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {menu}
    </>
  );
}
