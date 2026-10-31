import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { useSession } from '@/auth/SessionContext';
import { AppScreen } from '@/components';
import { colors } from '@/theme';

/**
 * Protección visual de RF-03 y RF-04: ADMIN únicamente.
 * El backend vuelve a verificar el rol en cada escritura.
 */
export default function EquiposLayout() {
  const { session, loading } = useSession();
  if (loading) return <AppScreen><ActivityIndicator color={colors.primary} /></AppScreen>;
  if (!session) return <Redirect href="/login" />;
  if (session.rol !== 'ADMIN') return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
