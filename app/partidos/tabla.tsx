import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { catalogApi } from '@/features/catalog';
import { partidoError, partidosApi } from '@/features/partidos';
import { colors, radii, spacing, typography } from '@/theme';
import type { Posicion, Torneo } from '@/types';

/** RF-11: tabla de posiciones pública, ordenada por el backend. */
export default function TablaScreen() {
  const params = useLocalSearchParams<{ torneoId?: string }>();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoId, setTorneoId] = useState<number | null>(params.torneoId ? Number(params.torneoId) : null);
  const [tabla, setTabla] = useState<Posicion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const torneoRef = useRef<number | null>(torneoId);

  const cargar = useCallback(async (preferido?: number | null) => {
    const currentRequest = ++requestId.current;
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
      setTorneos(listaTorneos);
      setTorneoId(elegido);
      if (elegido === null) {
        setTabla([]);
        return;
      }
      const filas = await partidosApi.tabla(elegido);
      if (currentRequest !== requestId.current) return;
      setTabla(filas);
    } catch (failure) {
      if (currentRequest === requestId.current) setError(partidoError(failure));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  return (
    <AppScreen>
      <SectionCard title="Tabla de posiciones" subtitle="RF-11 · solo partidos finalizados">
        <Text style={styles.label}>Torneo</Text>
        <View style={styles.chips}>
          {torneos.map((torneo) => (
            <Pressable
              key={torneo.id}
              accessibilityRole="button"
              onPress={() => { void cargar(torneo.id); }}
              style={[styles.chip, torneoId === torneo.id && styles.chipActivo]}
            >
              <Text style={[styles.chipTexto, torneoId === torneo.id && styles.chipTextoActivo]}>
                {torneo.nombre}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? (
          <View style={styles.acciones}>
            <Text style={styles.error}>{error}</Text>
            <ActionButton title="Reintentar" onPress={() => { void cargar(torneoId); }} secondary />
          </View>
        ) : null}
        {!loading && !error && tabla.length === 0 ? (
          <Text style={styles.muted}>El torneo todavía no tiene equipos para la tabla.</Text>
        ) : null}

        {!loading && !error && tabla.length > 0 ? (
          <View style={styles.tabla}>
            <View style={[styles.fila, styles.cabecera]}>
              <Text style={[styles.cabeceraTexto, styles.posicion]}>#</Text>
              <Text style={[styles.cabeceraTexto, styles.equipo]}>Equipo</Text>
              <Text style={[styles.cabeceraTexto, styles.pts]}>PTS</Text>
            </View>
            {tabla.map((posicion, indice) => (
              <View key={posicion.equipoId} style={styles.fila}>
                <Text style={[styles.posicion, styles.posicionTexto]}>{indice + 1}</Text>
                <View style={styles.equipo}>
                  <Text style={styles.equipoNombre}>{posicion.equipo}</Text>
                  <Text style={styles.detalle}>
                    PJ {posicion.pj} · PG {posicion.pg} · PE {posicion.pe} · PP {posicion.pp}
                    {'  '}GF {posicion.gf} · GC {posicion.gc} · DG {posicion.dg}
                  </Text>
                </View>
                <Text style={styles.pts}>{posicion.pts}</Text>
              </View>
            ))}
          </View>
        ) : null}
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
  tabla: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  fila: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cabecera: { borderTopWidth: 0, backgroundColor: colors.surfaceMuted },
  cabeceraTexto: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  posicion: { width: 24 },
  posicionTexto: { ...typography.label, color: colors.textMuted },
  equipo: { flex: 1, gap: 2 },
  equipoNombre: { ...typography.label, color: colors.text },
  detalle: { ...typography.caption, color: colors.textMuted },
  pts: { ...typography.subtitle, color: colors.primaryDark, minWidth: 40, textAlign: 'right' },
  acciones: { gap: spacing.sm },
  muted: { ...typography.body, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
