import { useCallback, useEffect, useState } from 'react';
import { ErpScreen } from '../types';

export type FormAction = 'add' | 'edit';

interface RouteState {
  screen: ErpScreen;
  recordId: string | null;
  formAction: FormAction | null;
  gatePassTab: 'inward' | 'outward';
}

const VALID_SCREENS: ErpScreen[] = [
  'dashboard', 'inventory', 'stock-details', 'stock-transactions', 'purchase-orders', 'receiving', 'job-orders',
  'dispatch', 'users-access', 'invoices', 'reviewed-invoices', 'payments', 'vendor-payments', 'customer-payments',
  'customers', 'vendors', 'gate-pass', 'accounts', 'expenses', 'reports', 'settings', 'support',
];

const DEFAULT_SCREEN: ErpScreen = 'inventory';

function isValidScreen(value: string | null): value is ErpScreen {
  return value !== null && VALID_SCREENS.includes(value as ErpScreen);
}

function isNumericId(value: string | undefined): boolean {
  return Boolean(value && /^\d+$/.test(value));
}

function buildPath(
  screen: ErpScreen,
  extras?: {
    recordId?: string | null;
    gatePassTab?: 'inward' | 'outward';
    formAction?: FormAction | null;
  }
): string {
  if (screen === 'stock-details' && extras?.recordId) {
    return `/stock-details/${extras.recordId}`;
  }

  if (
    (screen === 'vendors' || screen === 'customers') &&
    extras?.recordId &&
    !extras?.formAction
  ) {
    return `/${screen}/${extras.recordId}`;
  }

  if (extras?.formAction === 'add') {
    return `/${screen}/add`;
  }

  if (extras?.formAction === 'edit' && extras.recordId) {
    return `/${screen}/edit/${extras.recordId}`;
  }

  if (screen === 'gate-pass' && extras?.gatePassTab === 'outward') {
    return '/gate-pass/outward';
  }

  return `/${screen}`;
}

function readRouteFromUrl(): RouteState {
  const segments = window.location.pathname.replace(/\/$/, '').split('/').filter(Boolean);

  if (segments.length === 0) {
    return {
      screen: DEFAULT_SCREEN,
      recordId: null,
      formAction: null,
      gatePassTab: 'inward' as const,
    };
  }

  const screenSeg = segments[0];
  const screen: ErpScreen = isValidScreen(screenSeg) ? screenSeg : DEFAULT_SCREEN;

  if (screen === 'stock-details' && segments[1]) {
    return {
      screen,
      recordId: segments[1],
      formAction: null,
      gatePassTab: 'inward' as const,
    };
  }

  if (screen === 'gate-pass') {
    const gatePassTab = segments[1] === 'outward' ? 'outward' as const : 'inward' as const;
    return { screen, recordId: null, formAction: null, gatePassTab };
  }

  if (segments[1] === 'add') {
    return { screen, recordId: null, formAction: 'add' as const, gatePassTab: 'inward' as const };
  }

  if (segments[1] === 'edit' && segments[2]) {
    return {
      screen,
      recordId: segments[2],
      formAction: 'edit' as const,
      gatePassTab: 'inward' as const,
    };
  }

  if ((screen === 'vendors' || screen === 'customers') && isNumericId(segments[1])) {
    return {
      screen,
      recordId: segments[1],
      formAction: null,
      gatePassTab: 'inward' as const,
    };
  }

  return { screen, recordId: null, formAction: null, gatePassTab: 'inward' as const };
}

function pushRoute(
  screen: ErpScreen,
  extras?: {
    recordId?: string | null;
    gatePassTab?: 'inward' | 'outward';
    formAction?: FormAction | null;
  }
) {
  const url = buildPath(screen, extras);
  window.history.pushState(null, '', url);
}

export function useErpRoute() {
  const [route, setRoute] = useState(readRouteFromUrl);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    if (path === '/') {
      pushRoute(DEFAULT_SCREEN);
      setRoute(readRouteFromUrl());
    }
  }, []);

  useEffect(() => {
    const onPopState = () => setRoute(readRouteFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((
    screen: ErpScreen,
    extras?: {
      recordId?: string | null;
      gatePassTab?: 'inward' | 'outward';
      formAction?: FormAction | null;
    }
  ) => {
    const nextTab = screen === 'gate-pass'
      ? (extras?.gatePassTab ?? route.gatePassTab)
      : route.gatePassTab;

    pushRoute(screen, {
      recordId: extras?.recordId,
      gatePassTab: screen === 'gate-pass' ? nextTab : undefined,
      formAction: extras?.formAction ?? null,
    });

    const nextRoute: RouteState = {
      screen,
      recordId: extras?.recordId ?? null,
      formAction: extras?.formAction ?? null,
      gatePassTab: nextTab,
    };
    setRoute(nextRoute);
  }, [route.gatePassTab]);

  const openForm = useCallback((screen: ErpScreen, action: FormAction, recordId?: string) => {
    navigate(screen, { formAction: action, recordId: action === 'edit' ? recordId : null });
  }, [navigate]);

  const closeForm = useCallback((screen: ErpScreen) => {
    navigate(screen, { formAction: null, recordId: null });
  }, [navigate]);

  const setGatePassTab = useCallback((tab: 'inward' | 'outward') => {
    pushRoute('gate-pass', { gatePassTab: tab });
    setRoute((prev) => ({ ...prev, screen: 'gate-pass', gatePassTab: tab, formAction: null, recordId: null }));
  }, []);

  return {
    screen: route.screen,
    recordId: route.recordId,
    formAction: route.formAction,
    gatePassTab: route.gatePassTab,
    navigate,
    openForm,
    closeForm,
    setGatePassTab,
  };
}
