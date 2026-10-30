import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { ApiError } from '@/api';
import { useSession } from '@/auth/SessionContext';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { colors, radii, spacing, typography } from '@/theme';

/** RF-01: inicia sesión sin almacenar la contraseña en el dispositivo. */
export default function LoginScreen() {
  const { session, loading, login } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <AppScreen><ActivityIndicator color={colors.primary} /></AppScreen>;
  if (session) return <Redirect href="/" />;

  async function submit() {
    if (!username.trim() || !password) {
      setError('Ingresá el usuario y la contraseña.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await login(username, password);
      setPassword('');
      router.replace('/');
    } catch (failure) {
      setError(failure instanceof ApiError && failure.status === 401
        ? 'Usuario o contraseña incorrectos, o cuenta desactivada.'
        : failure instanceof Error ? failure.message : 'No se pudo iniciar sesión.');
    } finally {
      setSending(false);
    }
  }

  return (
    <AppScreen>
      <SectionCard title="Iniciar sesión" subtitle="Acceso de administradores y delegados">
        <View style={styles.form}>
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            accessibilityLabel="Usuario"
            style={styles.input}
          />
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            accessibilityLabel="Contraseña"
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ActionButton title={sending ? 'Ingresando…' : 'Ingresar'} onPress={() => { void submit(); }} disabled={sending} />
          <ActionButton title="Volver al catálogo público" onPress={() => router.replace('/')} secondary />
        </View>
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  label: { ...typography.label, color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm,
    padding: spacing.md, backgroundColor: colors.surface, color: colors.text },
  error: { ...typography.body, color: colors.danger },
});
