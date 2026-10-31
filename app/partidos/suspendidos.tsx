import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { catalogApi } from '@/features/catalog';
import { ETIQUETA_MOTIVO, partidoError, partidosApi } from '@/features/partidos';
import { colors, radii, spacing, typography } from '@/theme';
import type { Equipo, Jugador, Suspendido, Torneo } from '@/types';

/** RF-12: jugadores suspendidos para una jornada, calculados desde la fecha anterior. */
export default function SuspendidosScreen() {
  const params = useLocalSearchParams<{ torneoId?: string; fecha?: string }>();
  const torneoParam = Number(params.torneoId);
  const fechaParam = Number(params.fecha);
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoId, setTorneoId] = useState<number | null>(
    Number.isInteger(torneoParam) && torneoParam > 0 ? torneoParam : null,
  );
  const [fecha, setFecha] = useState(Number.isInteger(fechaParam) && fechaParam > 0 ? fechaParam : 1);
  const [suspendidos, setSuspendidos] = useState<Suspendido[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const torneoRef = useRef<number | null>(torneoId);
  const fechaRef = useRef(fecha);

  const cargar = useCallback(async (preferido?: number | null, fechaPreferida?: number) => {
    const currentRequest = ++requestId.current;
    const fechaObjetivo = Math.max(1, fechaPreferida ?? fechaRef.current);
    setLoading(true);
    setError(null);
    try {
      const listaTorneos = await catalogApi.listarTorneos();
      if (currentRequest !== requestId.current) return;
      const objetivo = preferido ?? torneoRef.current ?? listaTorneos[0]?.id ?? null;
      const elegido = listaTorneos.some((torneo) => torneo.id === objetivo)
        ? objetivo
        : listaTorneos[0]?.id ?? null;

      torneoRef.current = elegido;
      fechaRef.current = fechaObjetivo;
      setTorneos(listaTorneos);
      setTorneoId(elegido);
      setFecha(fechaObjetivo);

      if (elegido === null) {
        setSuspendidos([]);
        setEquipos([]);
        setJugadores([]);
        return;
      }

      const [listaSuspendidos, listaEquipos] = await Promise.all([
        partidosApi.suspendidos(elegido, fechaObjetivo),
        catalogApi.listarEquipos(elegido),
      ]);
      if (currentRequest !== requestId.current) return;
      const listasJugadores = await Promise.all(
        listaEquipos.map((equipo) => catalogApi.listarJugadores(equipo.id)),
      );
      if (currentRequest !== requestId.current) return;
      setSuspendidos(listaSuspendidos);
      setEquipos(listaEquipos);
      setJugadores(listasJugadores.flat());
    } catch (failure) {
      if (currentRequest === requestId.current) setError(partidoError(failure));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const nombresEquipos = useMemo(
    () => new Map(equipos.map((equipo) => [equipo.id, equipo.nombre])),
    [equipos],
  );
  const nombresJugadores = useMemo(
    () => new Map(jugadores.map((jugador) => [jugador.id, `${jugador.apellido}, ${jugador.nombre}`])),
    [jugadores],
  );

  return (
    <AppScreen>
      <SectionCard title="Suspendidos" subtitle="RF-12 · sanción de la fecha anterior">
        <Text style={styles.label}>Torneo</Text>
        <View style={styles.chips}>
          {torneos.map((torneo) => (
            <Pressable
              key={torneo.id}
              accessibilityRole="button"
              onPress={() => { void cargar(torneo.id, fecha); }}
              style={[styles.chip, torneoId === torneo.id && styles.chipActivo]}
            >
              <Text style={[styles.chipTexto, torneoId === torneo.id && styles.chipTextoActivo]}>
                {torneo.nombre}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Jornada</Text>
        <View style={styles.stepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Jornada anterior"
            disabled={fecha <= 1}
            onPress={() => { void cargar(torneoId, fecha - 1); }}
            style={[styles.stepButton, fecha <= 1 && styles.stepDisabled]}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.stepValue}>Fecha {fecha}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Jornada siguiente"
            onPress={() => { void cargar(torneoId, fecha + 1); }}
            style={styles.stepButton}
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>

        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? (
          <View style={styles.acciones}>
            <Text style={styles.error}>{error}</Text>
            <ActionButton title="Reintentar" onPress={() => { void cargar(torneoId, fecha); }} secondary />
          </View>
        ) : null}
        {!loading && !error && suspendidos.length === 0 ? (
          <Text style={styles.muted}>No hay jugadores suspendidos para esta jornada.</Text>
        ) : null}

        {!loading && !error ? suspendidos.map((suspendido) => (
          <View key={`${suspendido.jugadorId}-${suspendido.motivo}`} style={styles.fila}>
            <Text style={styles.nombre}>
              {nombresJugadores.get(suspendido.jugadorId) ?? `Jugador #${suspendido.jugadorId}`}
            </Text>
            <Text style={styles.muted}>
              {nombresEquipos.get(suspendido.equipoId) ?? `Equipo #${suspendido.equipoId}`}
              {' · '}
              {ETIQUETA_MOTIVO[suspendido.motivo]}
            </Text>
            <Text style={styles.caption}>
              Sanción de la fecha {suspendido.numeroFechaSancion}
            </Text>
          </View>
        )) : null}
      </SectionCard>

      <ActionButton title="Volver a partidos" onPress={() => router.replace('/partidos')} secondary />
      <ActionButton title="Volver al inicio" onPress={() => router.replace('/')} secondary />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.label, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActivo: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipTexto: { ...typography.label, color: colors.text },
  chipTextoActivo: { color: colors.primaryDark },
  stepper: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  stepButton: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    height: 40,
    justifyContent: 'center',
    width: 48,
  },
  stepDisabled: { opacity: 0.4 },
  stepText: { ...typography.subtitle, color: colors.primaryDark },
  stepValue: { ...typography.label, color: colors.text, minWidth: 90, textAlign: 'center' },
  fila: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    gap: spacing.xs,
    padding: spacing.md,
  },
  nombre: { ...typography.subtitle, color: colors.text },
  caption: { ...typography.caption, color: colors.textMuted },
  acciones: { gap: spacing.sm },
  muted: { ...typography.body, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
