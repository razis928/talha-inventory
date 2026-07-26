import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import ConfirmModal from '../components/ConfirmModal';

interface ConfirmOptions {
  title?: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}

interface ThemeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
  confirm: (options: ConfirmOptions) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'manufacturepro-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'dark';
  });

  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY, 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  const confirm = useCallback((options: ConfirmOptions) => {
    setConfirmState(options);
  }, []);

  const handleConfirm = () => {
    confirmState?.onConfirm();
    setConfirmState(null);
  };

  const handleCancel = () => setConfirmState(null);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, confirm }}>
      {children}
      <ConfirmModal
        isOpen={!!confirmState}
        title={confirmState?.title ?? 'Confirm Delete'}
        message={confirmState?.message ?? ''}
        itemName={confirmState?.itemName}
        confirmLabel={confirmState?.confirmLabel ?? 'Delete'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useConfirmDelete() {
  const { confirm } = useTheme();
  return useCallback(
    (itemName: string, entityLabel: string, onConfirm: () => void) => {
      confirm({
        title: `Delete ${entityLabel}`,
        message: `Are you sure you want to delete this ${entityLabel.toLowerCase()}? This action cannot be undone.`,
        itemName,
        onConfirm,
      });
    },
    [confirm]
  );
}
