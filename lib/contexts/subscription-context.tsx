import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  initializeRevenueCat,
  checkSubscriptionStatus,
  addCustomerInfoUpdateListener,
  ENTITLEMENT_ID,
} from '@/lib/services/revenuecat-service';
import { Paywall } from '@/components/paywall/Paywall';

interface SubscriptionContextValue {
  isPro: boolean;
  isLoading: boolean;
  showPaywall: (onSuccess?: () => void) => void;
  refreshStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const onPurchaseSuccessRef = useRef<(() => void) | null>(null);

  const refreshStatus = useCallback(async () => {
    const hasSubscription = await checkSubscriptionStatus();
    setIsPro(hasSubscription);
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initialize = async () => {
      try {
        await initializeRevenueCat();
        await refreshStatus();

        unsubscribe = addCustomerInfoUpdateListener((customerInfo) => {
          const hasEntitlement = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
          setIsPro(hasEntitlement);
        });
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      unsubscribe?.();
    };
  }, [refreshStatus]);

  const showPaywall = useCallback((onSuccess?: () => void) => {
    onPurchaseSuccessRef.current = onSuccess ?? null;
    setPaywallVisible(true);
  }, []);

  const handlePaywallClose = useCallback(() => {
    setPaywallVisible(false);
  }, []);

  const handlePurchaseComplete = useCallback(async () => {
    await refreshStatus();
    onPurchaseSuccessRef.current?.();
    onPurchaseSuccessRef.current = null;
  }, [refreshStatus]);

  return (
    <SubscriptionContext.Provider value={{ isPro, isLoading, showPaywall, refreshStatus }}>
      {children}
      <Paywall
        visible={paywallVisible}
        onClose={handlePaywallClose}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
