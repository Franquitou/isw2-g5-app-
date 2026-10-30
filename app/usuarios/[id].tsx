import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { useSession } from '@/auth/SessionContext';
import { AppScreen, InfoRow, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { userError } from '@/features/users/services/userError';
import { usersApi } from '@/features/users/services/usersApi';
import type { Usuario } from '@/features/users/types';
import { colors, spacing, typography } from '@/theme';

/** RF-02: detalle, activación y desactivación lógica con confirmación. */
export default function UsuarioDetalleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const { session } = useSession();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const cargar = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setUsuario(null);
    if (!Number.isInteger(userId) || userId <= 0) {
      setError('Identificador de usuario inválido.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await usersApi.consultar(userId);
      if (currentRequest === requestId.current) setUsuario(result);
    } catch (failure) {
      if (currentRequest === requestId.current) setError(userError(failure));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => {
    void cargar();
    return () => { requestId.current++; };
  }, [cargar]));

  async function changeStatus(activo: boolean) {
    setSaving(true);
    setError(null);
    try {
      setUsuario(await usersApi.cambiarEstado(userId, activo));
    } catch (failure) {
      setError(userError(failure));
    } finally {
      setSaving(false);
    }
  }

  function confirmDeactivate() {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('¿Desactivar este usuario?')) void changeStatus(false);
      return;
    }
    Alert.alert('Desactivar usuario', '¿Confirmás la desactivación de esta cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desactivar', style: 'destructive', onPress: () => { void changeStatus(false); } },
    ]);
  }

  const isOwnAdmin = !!usuario && usuario.rol === 'ADMIN' && session?.username === usuario.username;

  return (
    <AppScreen>
      <SectionCard title="Detalle del usuario">
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !usuario ? <ActionButton title="Reintentar" onPress={() => { void cargar(); }} secondary /> : null}
        {usuario ? (
          <View style={styles.content}>
            <InfoRow label="Usuario" value={usuario.username} />
            <InfoRow label="Nombre" value={usuario.nombreCompleto} />
            <InfoRow label="Rol" value={usuario.rol} />
            <InfoRow label="Estado" value={usuario.activo ? 'Activo' : 'Inactivo'} />
            <InfoRow label="Alta" value={new Date(usuario.fechaAlta).toLocaleString('es-AR')} />
            <ActionButton title="Editar datos" onPress={() => router.push(`/usuarios/${userId}/editar`)} />
            <ActionButton title="Cambiar contraseña" onPress={() => router.push(`/usuarios/${userId}/password`)} secondary />
            {usuario.activo && !isOwnAdmin ? (
              <ActionButton title="Desactivar usuario" onPress={confirmDeactivate} disabled={saving} secondary />
            ) : null}
            {!usuario.activo ? (
              <ActionButton title="Reactivar usuario" onPress={() => { void changeStatus(true); }} disabled={saving} />
            ) : null}
            {isOwnAdmin ? <Text style={styles.muted}>RN-08: no podés desactivar tu propia cuenta ADMIN.</Text> : null}
          </View>
        ) : null}
        <ActionButton title="Volver al listado" onPress={() => router.replace('/usuarios')} secondary />
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm },
  error: { ...typography.body, color: colors.danger },
  muted: { ...typography.caption, color: colors.textMuted },
});
