import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { catalogAdminError, catalogApi } from '@/features/catalog';
import { colors, radii, spacing, typography } from '@/theme';
import type { Equipo, Torneo } from '@/types';

/**
 * RF-03: listado administrativo de equipos por torneo.
 * Reutiliza las consultas públicas de RF-05; las altas y bajas viven en las
 * pantallas hijas. Solo ADMIN llega acá por el layout del módulo.
 */
export default function EquiposAdminScreen() {
  const params = useLocalSearchParams<{ torneoId?: string }>();
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [torneoId, setTorneoId] = useState<number | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const torneoIdRef = useRef<number | null>(null);

  const cargar = useCallback(async (preferido?: number | null) => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const listaTorneos = await catalogApi.listarTorneos();
      if (currentRequest !== requestId.current) return;

      const objetivo = preferido ?? torneoIdRef.current ?? listaTorneos[0]?.id ?? null;
      const elegido = listaTorneos.some((torneo) => torneo.id === objetivo)
        ? objetivo
        : listaTorneos[0]?.id ?? null;

      torneoIdRef.current = elegido;
      setTorneos(listaTorneos);
      setTorneoId(elegido);

      const listaEquipos = elegido === null ? [] : await catalogApi.listarEquipos(elegido);
      if (currentRequest !== requestId.current) return;
      setEquipos(listaEquipos);
    } catch (failure) {
      if (currentRequest === requestId.current) setError(catalogAdminError(failure));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    const inicial = params.torneoId ? Number(params.torneoId) : null;
    void cargar(Number.isInteger(inicial) && (inicial ?? 0) > 0 ? inicial : null);
    return () => { requestId.current++; };
  }, [cargar, params.torneoId]));

  return (
    <AppScreen>
      <SectionCard title="Administrar equipos" subtitle="RF-03 · solo administradores">
        <View style={styles.actions}>
          <ActionButton
            title="Crear equipo"
            disabled={torneoId === null}
            onPress={() => {
              if (torneoId === null) return;
              router.push({ pathname: '/equipos/nuevo', params: { torneoId: String(torneoId) } });
            }}
          />
          <ActionButton title="Volver al inicio" onPress={() => router.replace('/')} secondary />
        </View>
      </SectionCard>

      <SectionCard title="Torneo" subtitle="Elegí el torneo a administrar">
        {loading && torneos.length === 0 ? <ActivityIndicator color={colors.primary} /> : null}
        <View style={styles.chips}>
          {torneos.map((torneo) => (
            <Pressable
              key={torneo.id}
              accessibilityRole="button"
              onPress={() => { void cargar(torneo.id); }}
              style={[styles.chip, torneoId === torneo.id && styles.chipSelected]}
            >
              <Text style={styles.chipText}>{torneo.nombre}</Text>
            </Pressable>
          ))}
        </View>
        {!loading && torneos.length === 0 ? (
          <Text style={styles.muted}>No hay torneos activos para administrar.</Text>
        ) : null}
      </SectionCard>

      <SectionCard title="Equipos activos" subtitle="Tocá un equipo para ver y editar su plantel">
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? (
          <View style={styles.actions}>
            <Text style={styles.error}>{error}</Text>
            <ActionButton title="Reintentar" onPress={() => { void cargar(torneoId); }} secondary />
          </View>
        ) : null}
        {!loading && !error && equipos.length === 0 ? (
          <Text style={styles.muted}>Este torneo todavía no tiene equipos activos.</Text>
        ) : null}
        {!loading && !error ? equipos.map((equipo) => (
          <Pressable
            key={equipo.id}
            accessibilityRole="button"
            onPress={() => router.push({
              pathname: '/equipos/[equipoId]',
              params: { equipoId: String(equipo.id), torneoId: String(torneoId) },
            })}
            style={styles.row}
          >
            <Text style={styles.name}>{equipo.nombre}</Text>
            <Text style={styles.muted}>{equipo.barrio ?? 'Barrio no informado'}</Text>
          </Pressable>
        )) : null}
        <Text style={styles.hint}>
          La baja es lógica: el equipo deja de listarse pero conserva su historial.
        </Text>
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
  },
  chipSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipText: { ...typography.label, color: colors.text },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: { ...typography.subtitle, color: colors.text },
  muted: { ...typography.body, color: colors.textMuted },
  hint: { ...typography.caption, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
