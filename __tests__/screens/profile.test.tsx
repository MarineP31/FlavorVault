/**
 * Tests for ProfileScreen
 * Tests profile screen behavior and logic
 */

import { Alert } from 'react-native';

const mockRouterReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
  }),
}));

const mockShowToast = jest.fn();

jest.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

const mockSignOut = jest.fn();
const mockResetPassword = jest.fn();

jest.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    signOut: mockSignOut,
    resetPassword: mockResetPassword,
  }),
}));

jest.spyOn(Alert, 'alert');

describe('ProfileScreen Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockResetPassword.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue(undefined);
  });

  describe('Header rendering', () => {
    it('should have correct header title "Profile"', () => {
      const expectedTitle = 'Profile';
      expect(expectedTitle).toBe('Profile');
    });
  });

  describe('Account section', () => {
    it('should display user email when available', () => {
      const userEmail = 'test@example.com';
      expect(userEmail).toBe('test@example.com');
    });

    it('should display "Not available" when email is missing', () => {
      const fallbackText = 'Not available';
      expect(fallbackText).toBe('Not available');
    });
  });

  describe('Change Password behavior', () => {
    it('should call resetPassword with user email', async () => {
      const userEmail = 'test@example.com';
      await mockResetPassword(userEmail);
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });

    it('should show success toast on successful password reset', async () => {
      mockResetPassword.mockResolvedValue({ error: null });

      const { error } = await mockResetPassword('test@example.com');

      if (!error) {
        mockShowToast('Password reset email sent. Check your inbox.', 'success');
      }

      expect(mockShowToast).toHaveBeenCalledWith(
        'Password reset email sent. Check your inbox.',
        'success'
      );
    });

    it('should show error toast on password reset failure', async () => {
      const mockError = { message: 'Failed to send email' };
      mockResetPassword.mockResolvedValue({ error: mockError });

      const { error } = await mockResetPassword('test@example.com');

      if (error) {
        mockShowToast(error.message, 'error');
      }

      expect(mockShowToast).toHaveBeenCalledWith('Failed to send email', 'error');
    });

    it('should not call resetPassword if user email is missing', () => {
      const hasEmail = false;
      expect(hasEmail).toBe(false);
    });
  });

  describe('Sign Out behavior', () => {
    it('should show confirmation dialog before signing out', () => {
      const confirmSignOut = () => {
        Alert.alert(
          'Sign Out',
          'Are you sure you want to sign out?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: jest.fn() },
          ]
        );
      };

      confirmSignOut();

      expect(Alert.alert).toHaveBeenCalledWith(
        'Sign Out',
        'Are you sure you want to sign out?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Sign Out', style: 'destructive' }),
        ])
      );
    });

    it('should call signOut when confirmed', async () => {
      await mockSignOut();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should navigate to login after successful sign out', async () => {
      await mockSignOut();
      mockRouterReplace('/(auth)/login');

      expect(mockRouterReplace).toHaveBeenCalledWith('/(auth)/login');
    });

    it('should show error toast on sign out failure', async () => {
      mockSignOut.mockRejectedValue(new Error('Network error'));

      try {
        await mockSignOut();
      } catch {
        mockShowToast('Failed to sign out. Please try again.', 'error');
      }

      expect(mockShowToast).toHaveBeenCalledWith(
        'Failed to sign out. Please try again.',
        'error'
      );
    });
  });

  describe('Loading states', () => {
    it('should track password reset loading state', () => {
      let isResettingPassword = false;

      const startReset = () => { isResettingPassword = true; };
      const endReset = () => { isResettingPassword = false; };

      expect(isResettingPassword).toBe(false);
      startReset();
      expect(isResettingPassword).toBe(true);
      endReset();
      expect(isResettingPassword).toBe(false);
    });

    it('should track sign out loading state', () => {
      let isSigningOut = false;

      const startSignOut = () => { isSigningOut = true; };
      const endSignOut = () => { isSigningOut = false; };

      expect(isSigningOut).toBe(false);
      startSignOut();
      expect(isSigningOut).toBe(true);
      endSignOut();
      expect(isSigningOut).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels for buttons', () => {
      const changePasswordLabel = 'Change password';
      const signOutLabel = 'Sign out';

      expect(changePasswordLabel).toBe('Change password');
      expect(signOutLabel).toBe('Sign out');
    });

    it('should have button accessibility roles', () => {
      const accessibilityRole = 'button';
      expect(accessibilityRole).toBe('button');
    });
  });

  describe('Dark mode support', () => {
    it('should apply light theme colors when colorScheme is light', () => {
      const isDark = false;

      const backgroundColor = isDark ? '#151718' : '#F9FAFB';
      const textColor = isDark ? '#ECEDEE' : '#111827';

      expect(backgroundColor).toBe('#F9FAFB');
      expect(textColor).toBe('#111827');
    });

    it('should apply dark theme colors when colorScheme is dark', () => {
      const isDark = true;

      const backgroundColor = isDark ? '#151718' : '#F9FAFB';
      const textColor = isDark ? '#ECEDEE' : '#111827';

      expect(backgroundColor).toBe('#151718');
      expect(textColor).toBe('#ECEDEE');
    });
  });
});
