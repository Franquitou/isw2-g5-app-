import { Link } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSession } from '@/auth/SessionContext';
import { SectionCard } from '@/components';
import { colors, radii, spacing, typography } from '@/theme';

/** Accesos del módulo A sin restringir la navegación al catálogo público. */
export function SessionActions() {
  const { session, loading, logout } = useSession();
  const [error, setError] = useState<string | null>(null);
  if (loading) return <ActivityIndicator color={colors.primary} />;

  if (!session) {
    return (
      <SectionCard title="Acceso de la liga" subtitle="Administradores y delegados">
        <Link href="/login" asChild>
          <Pressable style={styles.action} accessibilityRole="button">
            <Text style={styles.actionText}>Iniciar sesión</Text>
          </Pressable>
        </Link>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Sesión" subtitle={`${session.nombreCompleto} · ${session.rol}`}>
      <View style={styles.actions}>
        {session.rol === 'ADMIN' ? (
          <Link href="/usuarios" asChild>
            <Pressable style={styles.action} accessibilityRole="button">
              <Text style={styles.actionText}>Administrar usuarios</Text>
            </Pressable>
          </Link>
        ) : null}
        <Pressable
          style={styles.secondary}
          accessibilityRole="button"
          onPress={() => { void logout().catch(() => setError('No se pudo borrar la sesión del dispositivo.')); }}
        >
          <Text style={styles.secondaryText}>Cerrar sesión</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  action: { backgroundColor: colors.primary, borderRadius: radii.md, padding: spacing.md },
  actionText: { ...typography.label, color: colors.surface, textAlign: 'center' },
  secondary: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, padding: spacing.md },
  secondaryText: { ...typography.label, color: colors.primary, textAlign: 'center' },
  error: { ...typography.caption, color: colors.danger },
});
