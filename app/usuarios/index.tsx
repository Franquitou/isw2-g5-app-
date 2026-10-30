import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { userError } from '@/features/users/services/userError';
import { usersApi } from '@/features/users/services/usersApi';
import type { Usuario } from '@/features/users/types';
import { colors, radii, spacing, typography } from '@/theme';

/** RF-02: lista usuarios activos por defecto y permite consultar los inactivos. */
export default function UsuariosScreen() {
  const [activo, setActivo] = useState(true);
  const [datos, setDatos] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const cargar = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await usersApi.listar(activo);
      if (currentRequest === requestId.current) setDatos(result);
    } catch (failure) {
      if (currentRequest === requestId.current) setError(userError(failure));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [activo]);

  useFocusEffect(useCallback(() => {
    void cargar();
    return () => { requestId.current++; };
  }, [cargar]));

  return (
    <AppScreen>
      <SectionCard title="Administrar usuarios" subtitle="Solo administradores">
        <View style={styles.actions}>
          <ActionButton title="Crear usuario" onPress={() => router.push('/usuarios/nuevo')} />
          <ActionButton title="Volver al inicio" onPress={() => router.replace('/')} secondary />
        </View>
      </SectionCard>
      <SectionCard title="Listado" subtitle="Filtrar por estado">
        <View style={styles.filters}>
          {[true, false].map((value) => (
            <Pressable key={String(value)} accessibilityRole="button" onPress={() => setActivo(value)}
              style={[styles.filter, activo === value && styles.selected]}>
              <Text style={styles.filterText}>{value ? 'Activos' : 'Inactivos'}</Text>
            </Pressable>
          ))}
        </View>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? (
          <View style={styles.actions}>
            <Text style={styles.error}>{error}</Text>
            <ActionButton title="Reintentar" onPress={() => { void cargar(); }} secondary />
          </View>
        ) : null}
        {!loading && !error && datos.length === 0 ? (
          <Text style={styles.muted}>No hay usuarios {activo ? 'activos' : 'inactivos'}.</Text>
        ) : null}
        {!loading && !error ? datos.map((usuario) => (
          <Pressable key={usuario.id} accessibilityRole="button"
            onPress={() => router.push(`/usuarios/${usuario.id}`)} style={styles.row}>
            <Text style={styles.name}>{usuario.nombreCompleto}</Text>
            <Text style={styles.muted}>{usuario.username} · {usuario.rol}</Text>
          </Pressable>
        )) : null}
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  filters: { flexDirection: 'row', gap: spacing.sm },
  filter: { padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md },
  selected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  filterText: { ...typography.label, color: colors.text },
  row: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
    padding: spacing.md, gap: spacing.xs },
  name: { ...typography.subtitle, color: colors.text },
  muted: { ...typography.body, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
