import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSession } from '@/auth/SessionContext';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { catalogApi } from '@/features/catalog';
import { PartidoCard, partidoError, partidosApi } from '@/features/partidos';
import { colors, radii, spacing, typography } from '@/theme';
import type { Arbitro, Cancha, Equipo, PartidoListado, Torneo } from '@/types';

/**
 * RF-10: listado público de partidos por torneo y jornada.
 * Los nombres de equipos, canchas y árbitros se resuelven con el catálogo público.
 */
export default function PartidosScreen() {
  const params = useLocalSearchParams<{ torneoId?: string; fecha?: string }>();
  const { session } = useSession();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoId, setTorneoId] = useState<number | null>(null);
  const [fecha, setFecha] = useState(1);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [arbitros, setArbitros] = useState<Arbitro[]>([]);
  const [partidos, setPartidos] = useState<PartidoListado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const torneoRef = useRef<number | null>(null);
  const fechaRef = useRef(1);

  const cargar = useCallback(async (torneoPreferido?: number | null, fechaPreferida?: number) => {
    const currentRequest = ++requestId.current;
    const fechaObjetivo = Math.max(1, fechaPreferida ?? fechaRef.current);
    setLoading(true);
    setError(null);
    try {
      const listaTorneos = await catalogApi.listarTorneos();
      if (currentRequest !== requestId.current) return;

      const objetivo = torneoPreferido ?? torneoRef.current ?? listaTorneos[0]?.id ?? null;
      const elegido = listaTorneos.some((torneo) => torneo.id === objetivo)
        ? objetivo
        : listaTorneos[0]?.id ?? null;

      torneoRef.current = elegido;
      fechaRef.current = fechaObjetivo;
      setTorneos(listaTorneos);
      setTorneoId(elegido);
      setFecha(fechaObjetivo);

      if (elegido === null) {
        setEquipos([]);
        setCanchas([]);
        setArbitros([]);
        setPartidos([]);
        return;
      }

      const [listaEquipos, listaCanchas, listaArbitros, listaPartidos] = await Promise.all([
        catalogApi.listarEquipos(elegido),
        catalogApi.listarCanchas(),
        catalogApi.listarArbitros(),
        partidosApi.listar(elegido, fechaObjetivo),
      ]);
      if (currentRequest !== requestId.current) return;
      setEquipos(listaEquipos);
      setCanchas(listaCanchas);
      setArbitros(listaArbitros);
      setPartidos(listaPartidos);
    } catch (failure) {
      if (currentRequest === requestId.current) setError(partidoError(failure));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    const torneoParam = params.torneoId ? Number(params.torneoId) : null;
    const fechaParam = params.fecha ? Number(params.fecha) : undefined;
    void cargar(
      Number.isInteger(torneoParam) && (torneoParam ?? 0) > 0 ? torneoParam : null,
      fechaParam && Number.isInteger(fechaParam) && fechaParam > 0 ? fechaParam : undefined,
    );
    return () => { requestId.current++; };
  }, [cargar, params.torneoId, params.fecha]));

  const nombresEquipos = useMemo(
    () => new Map(equipos.map((equipo) => [equipo.id, equipo.nombre])),
    [equipos],
  );
  const nombresCanchas = useMemo(
    () => new Map(canchas.map((cancha) => [cancha.id, cancha.nombre])),
    [canchas],
  );
  const nombresArbitros = useMemo(
    () => new Map(arbitros.map((arbitro) => [arbitro.id, `${arbitro.apellido}, ${arbitro.nombre}`])),
    [arbitros],
  );

  return (
    <AppScreen>
      <SectionCard title="Fixture y resultados" subtitle="RF-06 a RF-10 · consulta pública">
        <Text style={styles.intro}>
          Elegí un torneo y una jornada para ver los partidos y sus resultados.
        </Text>

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
        {!loading && torneos.length === 0 ? (
          <Text style={styles.muted}>No hay torneos activos.</Text>
        ) : null}

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

        {session?.rol === 'ADMIN' ? (
          <ActionButton
            title="Programar partido"
            disabled={torneoId === null}
            onPress={() => router.push({
              pathname: '/partidos/nuevo',
              params: { torneoId: torneoId ? String(torneoId) : '', fecha: String(fecha) },
            })}
          />
        ) : null}

        <ActionButton
          title="Ver tabla de posiciones"
          onPress={() => router.push({
            pathname: '/partidos/tabla',
            params: { torneoId: torneoId ? String(torneoId) : '' },
          })}
          secondary
        />
        <ActionButton
          title="Ver suspendidos de esta fecha"
          onPress={() => router.push({
            pathname: '/partidos/suspendidos',
            params: { torneoId: torneoId ? String(torneoId) : '', fecha: String(fecha) },
          })}
          secondary
        />
      </SectionCard>

      <SectionCard title={`Partidos · fecha ${fecha}`} subtitle="Tocá un partido para ver el detalle">
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? (
          <View style={styles.actions}>
            <Text style={styles.error}>{error}</Text>
            <ActionButton title="Reintentar" onPress={() => { void cargar(torneoId, fecha); }} secondary />
          </View>
        ) : null}
        {!loading && !error && torneos.length > 0 && partidos.length === 0 ? (
          <Text style={styles.muted}>No hay partidos cargados para esa jornada.</Text>
        ) : null}
        {!loading && !error ? partidos.map((partido) => (
          <PartidoCard
            key={partido.id}
            partido={partido}
            local={nombresEquipos.get(partido.equipoLocalId) ?? `Equipo #${partido.equipoLocalId}`}
            visitante={nombresEquipos.get(partido.equipoVisitanteId) ?? `Equipo #${partido.equipoVisitanteId}`}
            cancha={nombresCanchas.get(partido.canchaId) ?? `Cancha #${partido.canchaId}`}
            arbitro={nombresArbitros.get(partido.arbitroId) ?? `Árbitro #${partido.arbitroId}`}
            onPress={() => router.push({
              pathname: '/partidos/[partidoId]',
              params: { partidoId: String(partido.id) },
            })}
          />
        )) : null}
      </SectionCard>

      <ActionButton title="Volver al inicio" onPress={() => router.replace('/')} secondary />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: { ...typography.body, color: colors.textMuted },
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
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
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
  actions: { gap: spacing.sm },
  muted: { ...typography.body, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
