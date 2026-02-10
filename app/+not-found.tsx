import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/auth/auth-context';

export default function NotFoundScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
