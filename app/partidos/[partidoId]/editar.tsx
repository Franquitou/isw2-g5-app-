import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useSession } from '@/auth/SessionContext';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { PartidoForm, partidoError, partidosApi } from '@/features/partidos';
import { colors, typography } from '@/theme';
import type { Partido } from '@/types';

/** RF-06: edición de un partido PROGRAMADO; solo ADMIN. */
export default function EditarPartidoScreen() {
  const { partidoId } = useLocalSearchParams<{ partidoId?: string }>();
  const partidoNumero = Number(partidoId);
  const { session, loading: cargandoSesion } = useSession();
  const [partido, setPartido] = useState<Partido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const cargar = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    if (!Number.isInteger(partidoNumero) || partidoNumero <= 0) {
      setError('El identificador del partido no es válido.');
      setLoading(false);
      return;
    }
    try {
      const detalle = await partidosApi.detalle(partidoNumero);
      if (currentRequest !== requestId.current) return;
      setPartido(detalle);
    } catch (failure) {
      if (currentRequest === requestId.current) setError(partidoError(failure));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [partidoNumero]);

  useEffect(() => { void cargar(); }, [cargar]);

  if (cargandoSesion) return <AppScreen><ActivityIndicator color={colors.primary} /></AppScreen>;
  if (!session) return <Redirect href="/login" />;
  if (session.rol !== 'ADMIN') {
    return (
      <AppScreen>
        <SectionCard title="Editar partido" subtitle="Solo administradores">
          <ActionButton title="Volver al detalle" onPress={() => router.back()} secondary />
        </SectionCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <SectionCard title="Editar partido" subtitle="RF-06 · solo si está PROGRAMADO">
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && partido && partido.estado !== 'PROGRAMADO' ? (
          <Text style={styles.error}>
            Solo se puede editar un partido PROGRAMADO. Este está {partido.estado.replace('_', ' ')}.
          </Text>
        ) : null}
        {partido && partido.estado === 'PROGRAMADO' ? (
          <PartidoForm
            mode="edit"
            initial={partido}
            onSave={async (values) => {
              await partidosApi.editar(partidoNumero, values);
              router.replace({
                pathname: '/partidos/[partidoId]',
                params: { partidoId: String(partidoNumero) },
              });
            }}
          />
        ) : null}
        {!loading && (error || !partido || partido.estado !== 'PROGRAMADO') ? (
          <ActionButton title="Reintentar" onPress={() => { void cargar(); }} secondary />
        ) : null}
        <ActionButton title="Volver al detalle" onPress={() => router.back()} secondary />
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  error: { ...typography.body, color: colors.danger },
});
