import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen, InfoRow, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { catalogAdminError, catalogApi, equiposApi } from '@/features/catalog';
import { colors, radii, spacing, typography } from '@/theme';
import type { Equipo, Jugador, Torneo } from '@/types';

/**
 * RF-03 y RF-04: detalle del equipo con su plantel activo.
 * Permite editar el equipo, darlo de baja lógica y administrar sus jugadores.
 */
export default function EquipoAdminScreen() {
  const { equipoId, torneoId } = useLocalSearchParams<{ equipoId?: string; torneoId?: string }>();
  const equipoNumero = Number(equipoId);
  const torneoNumero = Number(torneoId);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const datosValidos =
    Number.isInteger(equipoNumero) && equipoNumero > 0 &&
    Number.isInteger(torneoNumero) && torneoNumero > 0;

  const cargar = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    if (!datosValidos) {
      setEquipo(null);
      setLoading(false);
      setError('El identificador del equipo o del torneo no es válido.');
      return;
    }
    try {
      const [listaTorneos, listaEquipos] = await Promise.all([
        catalogApi.listarTorneos(),
        catalogApi.listarEquipos(torneoNumero),
      ]);
      if (currentRequest !== requestId.current) return;
      const encontrado = listaEquipos.find((item) => item.id === equipoNumero) ?? null;
      setTorneo(listaTorneos.find((item) => item.id === torneoNumero) ?? null);
      setEquipo(encontrado);
      setJugadores(encontrado ? await catalogApi.listarJugadores(equipoNumero) : []);
    } catch (failure) {
      if (currentRequest === requestId.current) setError(catalogAdminError(failure));
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [datosValidos, equipoNumero, torneoNumero]);

  useFocusEffect(useCallback(() => {
    void cargar();
    return () => { requestId.current++; };
  }, [cargar]));

  async function darDeBajaEquipo() {
    setSaving(true);
    setError(null);
    try {
      await equiposApi.darDeBaja(equipoNumero);
      router.replace({ pathname: '/equipos', params: { torneoId: String(torneoNumero) } });
    } catch (failure) {
      setError(catalogAdminError(failure));
      setSaving(false);
    }
  }

  function confirmarBajaEquipo() {
    const mensaje = 'El equipo dejará de listarse y conservará su historial. No se puede reactivar desde la app.';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`¿Dar de baja "${equipo?.nombre ?? ''}"? ${mensaje}`)) {
        void darDeBajaEquipo();
      }
      return;
    }
    Alert.alert('Dar de baja el equipo', mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Dar de baja', style: 'destructive', onPress: () => { void darDeBajaEquipo(); } },
    ]);
  }

  return (
    <AppScreen>
      <SectionCard title="Equipo" subtitle={torneo ? `Torneo ${torneo.nombre}` : 'RF-03'}>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && !equipo ? (
          <View style={styles.actions}>
            <Text style={styles.muted}>El equipo no existe o fue dado de baja.</Text>
            <ActionButton title="Volver al listado" onPress={() => router.replace('/equipos')} secondary />
          </View>
        ) : null}
        {equipo ? (
          <View style={styles.actions}>
            <InfoRow label="Nombre" value={equipo.nombre} />
            <InfoRow label="Barrio" value={equipo.barrio ?? 'No informado'} />
            <InfoRow label="Estado" value="Activo" />
            <ActionButton
              title="Editar equipo"
              onPress={() => router.push({
                pathname: '/equipos/[equipoId]/editar',
                params: { equipoId: String(equipoNumero), torneoId: String(torneoNumero) },
              })}
            />
            <ActionButton title="Dar de baja el equipo" onPress={confirmarBajaEquipo} disabled={saving} secondary />
            <ActionButton
              title="Volver al listado"
              onPress={() => router.replace({ pathname: '/equipos', params: { torneoId: String(torneoNumero) } })}
              secondary
            />
          </View>
        ) : null}
      </SectionCard>

      {equipo ? (
        <SectionCard title="Plantel activo" subtitle="RF-04 · jugadores del equipo">
          <ActionButton
            title="Agregar jugador"
            onPress={() => router.push({
              pathname: '/equipos/[equipoId]/jugadores/nuevo',
              params: { equipoId: String(equipoNumero), torneoId: String(torneoNumero) },
            })}
          />
          {!loading && jugadores.length === 0 ? (
            <Text style={styles.muted}>Este equipo todavía no tiene jugadores activos.</Text>
          ) : null}
          {jugadores.map((jugador) => (
            <Pressable
              key={jugador.id}
              accessibilityRole="button"
              onPress={() => router.push({
                pathname: '/equipos/[equipoId]/jugadores/[jugadorId]/editar',
                params: {
                  equipoId: String(equipoNumero),
                  jugadorId: String(jugador.id),
                  torneoId: String(torneoNumero),
                },
              })}
              style={styles.row}
            >
              <Text style={styles.name}>{jugador.apellido}, {jugador.nombre}</Text>
              <Text style={styles.muted}>
                DNI {jugador.dni}
                {jugador.numeroCamiseta ? ` · Camiseta ${jugador.numeroCamiseta}` : ' · Sin camiseta'}
              </Text>
            </Pressable>
          ))}
        </SectionCard>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  row: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: { ...typography.subtitle, color: colors.text },
  muted: { ...typography.body, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
