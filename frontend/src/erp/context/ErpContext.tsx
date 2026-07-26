import { createContext, useContext, ReactNode } from 'react';
import { useErpStore, ErpStore } from '../store/useErpStore';

const ErpContext = createContext<ErpStore | null>(null);

export function ErpProvider({ children }: { children: ReactNode }) {
  const store = useErpStore();
  return <ErpContext.Provider value={store}>{children}</ErpContext.Provider>;
}

export function useErp(): ErpStore {
  const ctx = useContext(ErpContext);
  if (!ctx) throw new Error('useErp must be used within ErpProvider');
  return ctx;
}
