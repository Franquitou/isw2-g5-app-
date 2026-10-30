import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/theme';
import { SessionProvider } from '@/auth/SessionContext';

/**
 * Layout raíz de Expo Router.
 * La base solo define un stack; cada módulo agrega sus rutas en `app/`
 * cuando el backend correspondiente esté disponible.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
        <StatusBar style="dark" />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
