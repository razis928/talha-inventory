import { ContextProvider } from '@/providers/context-provider';

function Providers({ children }: { children: React.ReactNode }) {
  return <ContextProvider>{children}</ContextProvider>;
}

export default Providers;
