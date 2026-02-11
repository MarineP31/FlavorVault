import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PURCHASES_ERROR_CODE, PurchasesError } from 'react-native-purchases';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { ENTITLEMENT_ID } from '@/lib/services/revenuecat-service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface PaywallProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

const FEATURES = [
  { icon: 'scan-outline', text: 'Scan recipes from photos' },
  { icon: 'text-outline', text: 'Smart text extraction' },
  { icon: 'infinite-outline', text: 'Unlimited scans' },
];

export function Paywall({ visible, onClose, onPurchaseComplete }: PaywallProps) {
  const insets = useSafeAreaInsets();

  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const getPurchaseErrorMessage = (error: PurchasesError): string => {
    switch (error.code) {
      case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
        return '';
      case PURCHASES_ERROR_CODE.NETWORK_ERROR:
        return 'Network error. Please check your connection and try again.';
      case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
        return 'This product is not available for purchase.';
      case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
        return 'Purchases are not allowed on this device.';
      case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
        return 'The purchase was invalid. Please try again.';
      case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
        return 'You already own this subscription. Try restoring your purchases.';
      case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
        return 'Your payment is pending. You will get access once the payment is confirmed.';
      case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
        return 'There was a problem with the App Store. Please try again later.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  useEffect(() => {
    if (visible) {
      loadOfferings();
    }
  }, [visible]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages) {
        const sortedPackages = [...offerings.current.availablePackages].sort((a, b) => {
          const order = ['$rc_monthly', '$rc_annual', '$rc_lifetime'];
          return order.indexOf(a.identifier) - order.indexOf(b.identifier);
        });
        setPackages(sortedPackages);
        const annual = sortedPackages.find(p => p.identifier === '$rc_annual');
        setSelectedPackage(annual || sortedPackages[0] || null);
      } else {
        setLoadError(true);
      }
    } catch (error) {
      console.error('Error loading offerings:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      setPurchasing(true);
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        onPurchaseComplete();
        onClose();
      }
    } catch (error) {
      const purchaseError = error as PurchasesError;
      const message = getPurchaseErrorMessage(purchaseError);
      if (message) {
        Alert.alert('Purchase Failed', message);
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active[ENTITLEMENT_ID]) {
        Alert.alert('Success', 'Your purchase has been restored!');
        onPurchaseComplete();
        onClose();
      } else {
        Alert.alert('No Purchases Found', 'We could not find any previous purchases to restore.');
      }
    } catch (error) {
      const purchaseError = error as PurchasesError;
      if (purchaseError.code === PURCHASES_ERROR_CODE.NETWORK_ERROR) {
        Alert.alert('Network Error', 'Please check your connection and try again.');
      } else {
        Alert.alert('Restore Failed', 'Something went wrong. Please try again.');
      }
    } finally {
      setRestoring(false);
    }
  };

  const getPackageLabel = (pkg: PurchasesPackage): string => {
    switch (pkg.identifier) {
      case '$rc_monthly':
        return 'Monthly';
      case '$rc_annual':
        return 'Yearly';
      case '$rc_lifetime':
        return 'Lifetime';
      default:
        return pkg.product.title;
    }
  };

  const getPackageBadge = (pkg: PurchasesPackage): string | null => {
    if (pkg.identifier === '$rc_annual') return 'Best Value';
    return null;
  };

  const formatPrice = (pkg: PurchasesPackage): string => {
    const price = pkg.product.priceString;
    switch (pkg.identifier) {
      case '$rc_monthly':
        return `${price}/month`;
      case '$rc_annual':
        return `${price}/year`;
      case '$rc_lifetime':
        return price;
      default:
        return price;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <LinearGradient
          colors={['#FF6B35', '#FF8C42', '#FFA559']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>

            <View style={styles.heroSection}>
              <View style={styles.logoContainer}>
                <Ionicons name="camera" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Unlock Pro</Text>
              <Text style={styles.subtitle}>
                Scan and digitize recipes instantly
              </Text>
            </View>

            <View style={styles.card}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF6B35" />
                </View>
              ) : loadError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="cloud-offline-outline" size={48} color="#8E8E93" />
                  <Text style={styles.errorText}>Unable to load subscription options</Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.retryButton,
                      pressed && styles.retryButtonPressed,
                    ]}
                    onPress={loadOfferings}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.packagesSection}>
                  {packages.map((pkg) => {
                    const isSelected = selectedPackage?.identifier === pkg.identifier;
                    const badge = getPackageBadge(pkg);

                    return (
                      <Pressable
                        key={pkg.identifier}
                        style={({ pressed }) => [
                          styles.packageCard,
                          isSelected && styles.packageCardSelected,
                          pressed && styles.packageCardPressed,
                        ]}
                        onPress={() => setSelectedPackage(pkg)}
                      >
                        <View style={styles.packageContent}>
                          <View style={[styles.radio, isSelected && styles.radioSelected]}>
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <View style={styles.packageInfo}>
                            <View style={styles.packageLabelRow}>
                              <Text style={styles.packageLabel}>
                                {getPackageLabel(pkg)}
                              </Text>
                              {badge && (
                                <View style={styles.badge}>
                                  <Text style={styles.badgeText}>{badge}</Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.packagePrice}>{formatPrice(pkg)}</Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Pressable
                style={({ pressed }) => [
                  styles.purchaseButton,
                  (purchasing || !selectedPackage) && styles.buttonDisabled,
                  pressed && styles.purchaseButtonPressed,
                ]}
                onPress={handlePurchase}
                disabled={purchasing || !selectedPackage}
              >
                {purchasing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.purchaseButtonText}>Continue</Text>
                )}
              </Pressable>

              <Pressable
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={restoring}
              >
                {restoring ? (
                  <ActivityIndicator size="small" color="#8E8E93" />
                ) : (
                  <Text style={styles.restoreText}>Restore Purchases</Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.legalText}>
              Cancel anytime. Subscriptions auto-renew.
            </Text>
          </ScrollView>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
  },
  errorContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  packagesSection: {
    gap: 12,
    marginBottom: 24,
  },
  packageCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  packageCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  packageCardPressed: {
    opacity: 0.8,
  },
  packageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  radioSelected: {
    borderColor: '#FF6B35',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF6B35',
  },
  packageInfo: {
    flex: 1,
  },
  packageLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  packageLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  badge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  packagePrice: {
    fontSize: 14,
    color: '#8E8E93',
  },
  purchaseButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  purchaseButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  restoreButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  restoreText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '500',
  },
  legalText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 20,
  },
});
