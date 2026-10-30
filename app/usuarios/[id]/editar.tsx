import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { useSession } from '@/auth/SessionContext';
import { UsuarioForm } from '@/features/users/components/UsuarioForm';
import { userError } from '@/features/users/services/userError';
import { usersApi } from '@/features/users/services/usersApi';
import type { Usuario } from '@/features/users/types';
import { colors, typography } from '@/theme';

/** RF-02: modifica nombre y rol, nunca username ni contraseña desde PUT. */
export default function EditarUsuarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const { session, updateName } = useSession();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setUsuario(null);
    setLoading(true);
    setError(null);
    try {
      setUsuario(await usersApi.consultar(userId));
    } catch (failure) {
      setError(userError(failure));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void cargar(); }, [cargar]);

  return (
    <AppScreen>
      <SectionCard title="Editar usuario">
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !usuario ? <ActionButton title="Reintentar" onPress={() => { void cargar(); }} secondary /> : null}
        {usuario ? (
          <UsuarioForm mode="edit" initial={usuario}
            isOwnAdmin={usuario.rol === 'ADMIN' && session?.username === usuario.username}
            onSave={async ({ nombreCompleto, rol }) => {
              const updated = await usersApi.editar(userId, { nombreCompleto, rol });
              if (session?.username === updated.username) await updateName(updated.nombreCompleto);
              router.replace(`/usuarios/${userId}`);
            }} />
        ) : null}
        <ActionButton title="Volver al detalle" onPress={() => router.replace(`/usuarios/${userId}`)} secondary />
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ error: { ...typography.body, color: colors.danger } });
