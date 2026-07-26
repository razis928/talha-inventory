import { Moon, Sun, ChevronDown, Menu } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface ErpTopBarProps {
  onMenuClick: () => void;
}

export default function ErpTopBar({ onMenuClick }: ErpTopBarProps) {
  const { darkMode, toggleDarkMode } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="erp-document sticky top-0 z-30 mb-2">
      <div className="erp-statusbar justify-end">
        <button type="button" onClick={onMenuClick} className="erp-btn-ghost p-1 lg:hidden" aria-label="Open menu">
          <Menu size={16} />
        </button>

        <div className="flex-1 lg:flex-none" />

        <button type="button" onClick={toggleDarkMode} className="erp-btn-ghost p-1" title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="relative">
          <button type="button" onClick={() => setProfileOpen(!profileOpen)} className="erp-btn-ghost flex items-center gap-1 px-2">
            <span className="flex h-6 w-6 items-center justify-center border border-[var(--color-erp-border)] bg-[var(--color-erp-input-bg)] text-[10px] font-bold">AS</span>
            <span className="hidden text-xs sm:inline">Alex Sterling</span>
            <ChevronDown size={12} />
          </button>
          {profileOpen && (
            <>
              <button type="button" className="fixed inset-0 z-40" aria-label="Close" onClick={() => setProfileOpen(false)} />
              <div className="erp-document absolute right-0 z-50 mt-1 w-44">
                <div className="erp-titlebar text-xs">User</div>
                {['My Profile', 'Account Settings', 'Sign Out'].map((item) => (
                  <button key={item} type="button" className="erp-btn-ghost block w-full border-0 border-b border-[var(--color-erp-border)] bg-[var(--color-erp-toolbar)] px-3 py-2 text-left text-xs last:border-b-0" onClick={() => setProfileOpen(false)}>
                    {item}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
