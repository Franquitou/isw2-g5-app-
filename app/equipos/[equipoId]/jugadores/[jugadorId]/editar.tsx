import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, View } from 'react-native';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { JugadorForm, catalogAdminError, catalogApi, equiposApi } from '@/features/catalog';
import { colors, spacing, typography } from '@/theme';
import type { Jugador } from '@/types';

/**
 * RF-04: edición y baja lógica de un jugador.
 * No existe GET por jugador en el contrato: se busca dentro del plantel del equipo.
 */
export default function EditarJugadorScreen() {
  const { equipoId, jugadorId } = useLocalSearchParams<{ equipoId?: string; jugadorId?: string }>();
  const equipoNumero = Number(equipoId);
  const jugadorNumero = Number(jugadorId);
  const [jugador, setJugador] = useState<Jugador | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const datosValidos =
    Number.isInteger(equipoNumero) && equipoNumero > 0 &&
    Number.isInteger(jugadorNumero) && jugadorNumero > 0;

  const cargar = useCallback(async () => {
    setJugador(null);
    setLoading(true);
    setError(null);
    if (!datosValidos) {
      setError('El identificador del equipo o del jugador no es válido.');
      setLoading(false);
      return;
    }
    try {
      const jugadores = await catalogApi.listarJugadores(equipoNumero);
      setJugador(jugadores.find((item) => item.id === jugadorNumero) ?? null);
    } catch (failure) {
      setError(catalogAdminError(failure));
    } finally {
      setLoading(false);
    }
  }, [datosValidos, equipoNumero, jugadorNumero]);

  useEffect(() => { void cargar(); }, [cargar]);

  async function darDeBaja() {
    setSaving(true);
    setError(null);
    try {
      await equiposApi.darDeBajaJugador(jugadorNumero);
      router.back();
    } catch (failure) {
      setError(catalogAdminError(failure));
      setSaving(false);
    }
  }

  function confirmarBaja() {
    const mensaje = 'El jugador dejará de aparecer en el plantel y conservará su historial. No se puede reactivar desde la app.';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`¿Dar de baja a ${jugador?.nombre ?? ''} ${jugador?.apellido ?? ''}? ${mensaje}`)) {
        void darDeBaja();
      }
      return;
    }
    Alert.alert('Dar de baja al jugador', mensaje, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Dar de baja', style: 'destructive', onPress: () => { void darDeBaja(); } },
    ]);
  }

  return (
    <AppScreen>
      <SectionCard title="Editar jugador" subtitle="El equipo del jugador no se puede cambiar">
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && !jugador ? (
          <Text style={styles.error}>El jugador no existe o fue dado de baja.</Text>
        ) : null}
        {jugador ? (
          <View style={styles.actions}>
            <JugadorForm
              mode="edit"
              initial={jugador}
              onSave={async ({ nombre, apellido, dni, numeroCamiseta }) => {
                await equiposApi.editarJugador(jugadorNumero, { nombre, apellido, dni, numeroCamiseta });
                router.back();
              }}
            />
            <ActionButton
              title="Dar de baja al jugador"
              onPress={confirmarBaja}
              disabled={saving}
              secondary
            />
          </View>
        ) : null}
        {!loading && (error || !jugador) ? (
          <ActionButton title="Reintentar" onPress={() => { void cargar(); }} secondary />
        ) : null}
        <ActionButton title="Volver al detalle" onPress={() => router.back()} secondary />
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.sm },
  error: { ...typography.body, color: colors.danger },
});
