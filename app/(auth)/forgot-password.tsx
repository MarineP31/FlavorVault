import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth/auth-context';
import { useToast } from '@/components/ui/Toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      if (error) {
        showToast(error.message, 'error');
      } else {
        setEmailSent(true);
        showToast('Reset link sent to your email', 'success');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, isDark && styles.containerDark]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Reset Password
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            {emailSent
              ? 'Check your email for a reset link'
              : 'Enter your email to receive a password reset link'}
          </Text>
        </View>

        {!emailSent ? (
          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Send Reset Link"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                size="large"
              />
            </View>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.buttonContainer}>
              <Button
                title="Back to Sign In"
                onPress={() => router.replace('/(auth)/login')}
                fullWidth
                size="large"
              />
            </View>
          </View>
        )}

        <View style={styles.backContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtitleDark: {
    color: '#9CA3AF',
  },
  form: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: 32,
  },
  successContainer: {
    alignItems: 'center',
  },
  backContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  backLink: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});
