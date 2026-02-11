import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const ENTITLEMENT_ID = 'FlavorVault Pro';

const getApiKey = (): string => {
  const extra = Constants.expoConfig?.extra;
  if (Platform.OS === 'ios') {
    return extra?.revenueCatIosApiKey || '';
  }
  return extra?.revenueCatAndroidApiKey || '';
};

export async function initializeRevenueCat(): Promise<void> {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn('RevenueCat API key not configured. Subscriptions will not work.');
    return;
  }

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  await Purchases.configure({ apiKey });
}

export async function checkSubscriptionStatus(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return false;
  }
}

export function addCustomerInfoUpdateListener(
  callback: (customerInfo: CustomerInfo) => void
): () => void {
  Purchases.addCustomerInfoUpdateListener(callback);
  return () => Purchases.removeCustomerInfoUpdateListener(callback);
}

export { ENTITLEMENT_ID };
