import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { useToast } from '@/components/ui/Toast';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth/auth-context';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const { user, signOut, resetPassword } = useAuth();
  const { showToast } = useToast();
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleChangePassword = async () => {
    if (!user?.email) return;

    setIsResettingPassword(true);
    try {
      const { error } = await resetPassword(user.email);
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Password reset email sent. Check your inbox.', 'success');
      }
    } catch {
      showToast('Failed to send reset email. Please try again.', 'error');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
      ]
    );
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace('/(auth)/login' as any);
    } catch {
      showToast('Failed to sign out. Please try again.', 'error');
      setIsSigningOut(false);
    }
  };

  const themedStyles = {
    container: {
      backgroundColor: isDark ? '#151718' : '#F9FAFB',
    },
    header: {
      backgroundColor: isDark ? '#1C1E1F' : '#FFFFFF',
      borderBottomColor: isDark ? '#2C2E2F' : '#E5E7EB',
    },
    headerTitle: {
      color: isDark ? '#ECEDEE' : '#111827',
    },
    section: {
      backgroundColor: isDark ? '#1C1E1F' : '#FFFFFF',
    },
    sectionHeader: {
      borderBottomColor: isDark ? '#2C2E2F' : '#F3F4F6',
    },
    sectionTitle: {
      color: isDark ? '#ECEDEE' : '#111827',
    },
    infoLabel: {
      color: isDark ? '#9BA1A6' : '#6B7280',
    },
    infoValue: {
      color: isDark ? '#ECEDEE' : '#111827',
    },
    actionButtonText: {
      color: isDark ? '#ECEDEE' : '#111827',
    },
    divider: {
      backgroundColor: isDark ? '#2C2E2F' : '#F3F4F6',
    },
    chevronColor: isDark ? '#6B7280' : '#9CA3AF',
  };

  return (
    <SafeAreaView
      style={[styles.container, themedStyles.container]}
      edges={['top']}
      testID="profile-screen"
    >
      <View style={[styles.header, themedStyles.header]}>
        <Text style={[styles.headerTitle, themedStyles.headerTitle]}>Profile</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        testID="profile-scroll-view"
      >
        <View style={[styles.section, themedStyles.section]} testID="account-section">
          <View style={[styles.sectionHeader, themedStyles.sectionHeader]}>
            <Icon name="person-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.sectionTitle, themedStyles.sectionTitle]}>Account</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow} testID="email-row">
              <Text style={[styles.infoLabel, themedStyles.infoLabel]}>Email</Text>
              <Text
                style={[styles.infoValue, themedStyles.infoValue]}
                testID="user-email"
              >
                {user?.email ?? 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, themedStyles.section]} testID="settings-section">

          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleChangePassword}
              disabled={isResettingPassword}
              activeOpacity={0.7}
              testID="change-password-button"
              accessibilityRole="button"
              accessibilityLabel="Change password"
              accessibilityState={{ disabled: isResettingPassword }}
            >
              {isResettingPassword ? (
                <ActivityIndicator size="small" color={colors.primary} testID="password-loading" />
              ) : (
                <Icon name="key-outline" size={20} color={colors.primary} />
              )}
              <Text style={[styles.actionButtonText, themedStyles.actionButtonText]}>
                Change Password
              </Text>
              <Icon name="chevron-forward" size={20} color={themedStyles.chevronColor} />
            </TouchableOpacity>

            <View style={[styles.divider, themedStyles.divider]} />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={confirmSignOut}
              disabled={isSigningOut}
              activeOpacity={0.7}
              testID="sign-out-button"
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              accessibilityState={{ disabled: isSigningOut }}
            >
              {isSigningOut ? (
                <ActivityIndicator size="small" color="#EF4444" testID="signout-loading" />
              ) : (
                <Icon name="log-out-outline" size={20} color="#EF4444" />
              )}
              <Text style={[styles.actionButtonText, styles.signOutText]}>
                Sign Out
              </Text>
              <Icon name="chevron-forward" size={20} color={themedStyles.chevronColor} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionContent: {
    paddingVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  signOutText: {
    color: '#EF4444',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
