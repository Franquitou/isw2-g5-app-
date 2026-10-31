import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useSession } from '@/auth/SessionContext';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { catalogApi } from '@/features/catalog';
import { EventoForm, partidoError, partidosApi } from '@/features/partidos';
import type { JugadorConEquipo } from '@/features/partidos';
import { colors, typography } from '@/theme';
import type { Equipo, PartidoDetalle } from '@/types';

/** RF-08: alta de evento mientras el partido está EN_JUEGO; ADMIN o DELEGADO. */
export default function NuevoEventoScreen() {
  const { partidoId } = useLocalSearchParams<{ partidoId?: string }>();
  const partidoNumero = Number(partidoId);
  const { session, loading: cargandoSesion } = useSession();
  const [partido, setPartido] = useState<PartidoDetalle | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<JugadorConEquipo[]>([]);
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
      const [listaEquipos, locales, visitantes] = await Promise.all([
        catalogApi.listarEquipos(detalle.torneoId),
        catalogApi.listarJugadores(detalle.equipoLocalId),
        catalogApi.listarJugadores(detalle.equipoVisitanteId),
      ]);
      if (currentRequest !== requestId.current) return;
      const nombreLocal = listaEquipos.find((equipo) => equipo.id === detalle.equipoLocalId)?.nombre
        ?? `Equipo #${detalle.equipoLocalId}`;
      const nombreVisitante = listaEquipos.find((equipo) => equipo.id === detalle.equipoVisitanteId)?.nombre
        ?? `Equipo #${detalle.equipoVisitanteId}`;
      setPartido(detalle);
      setEquipos(listaEquipos);
      setJugadores([
        ...locales.map((jugador) => ({ jugador, equipo: nombreLocal })),
        ...visitantes.map((jugador) => ({ jugador, equipo: nombreVisitante })),
      ]);
    } catch (failure) {
      if (currentRequest === requestId.current) setError(partidoError(failure));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [partidoNumero]);

  useEffect(() => { void cargar(); }, [cargar]);

  if (cargandoSesion) return <AppScreen><ActivityIndicator color={colors.primary} /></AppScreen>;
  if (!session) return <Redirect href="/login" />;
  if (session.rol !== 'ADMIN' && session.rol !== 'DELEGADO') {
    return (
      <AppScreen>
        <SectionCard title="Nuevo evento" subtitle="Solo ADMIN o DELEGADO">
          <ActionButton title="Volver al detalle" onPress={() => router.back()} secondary />
        </SectionCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <SectionCard title="Nuevo evento" subtitle="RF-08 · partido en juego">
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && partido && partido.estado !== 'EN_JUEGO' ? (
          <Text style={styles.error}>
            Solo se registran eventos en un partido EN_JUEGO. Este está {partido.estado.replace('_', ' ')}.
          </Text>
        ) : null}
        {partido && partido.estado === 'EN_JUEGO' ? (
          <>
            <Text style={styles.hint}>
              {equipos.find((equipo) => equipo.id === partido.equipoLocalId)?.nombre ?? 'Local'}
              {' vs '}
              {equipos.find((equipo) => equipo.id === partido.equipoVisitanteId)?.nombre ?? 'Visitante'}
            </Text>
            <EventoForm
              jugadores={jugadores}
              onSave={async (values) => {
                await partidosApi.crearEvento(partidoNumero, values);
                router.back();
              }}
            />
          </>
        ) : null}
        {!loading && (error || !partido || partido.estado !== 'EN_JUEGO') ? (
          <ActionButton title="Reintentar" onPress={() => { void cargar(); }} secondary />
        ) : null}
        <ActionButton title="Volver al detalle" onPress={() => router.back()} secondary />
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hint: { ...typography.body, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
