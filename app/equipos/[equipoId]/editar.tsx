import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { EquipoForm, catalogAdminError, catalogApi, equiposApi } from '@/features/catalog';
import { colors, typography } from '@/theme';
import type { Equipo } from '@/types';

/** RF-03: edición de nombre y barrio; el torneo no cambia. */
export default function EditarEquipoScreen() {
  const { equipoId, torneoId } = useLocalSearchParams<{ equipoId?: string; torneoId?: string }>();
  const equipoNumero = Number(equipoId);
  const torneoNumero = Number(torneoId);
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setEquipo(null);
    setLoading(true);
    setError(null);
    if (!Number.isInteger(equipoNumero) || equipoNumero <= 0 ||
        !Number.isInteger(torneoNumero) || torneoNumero <= 0) {
      setError('El identificador del equipo o del torneo no es válido.');
      setLoading(false);
      return;
    }
    try {
      const equipos = await catalogApi.listarEquipos(torneoNumero);
      setEquipo(equipos.find((item) => item.id === equipoNumero) ?? null);
    } catch (failure) {
      setError(catalogAdminError(failure));
    } finally {
      setLoading(false);
    }
  }, [equipoNumero, torneoNumero]);

  useEffect(() => { void cargar(); }, [cargar]);

  return (
    <AppScreen>
      <SectionCard title="Editar equipo" subtitle="El torneo no se puede cambiar">
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error && !equipo ? (
          <Text style={styles.error}>El equipo no existe o fue dado de baja.</Text>
        ) : null}
        {equipo ? (
          <EquipoForm
            mode="edit"
            initial={equipo}
            onSave={async ({ nombre, barrio }) => {
              await equiposApi.editar(equipoNumero, { nombre, barrio });
              router.replace({
                pathname: '/equipos/[equipoId]',
                params: { equipoId: String(equipoNumero), torneoId: String(torneoNumero) },
              });
            }}
          />
        ) : null}
        {!loading && (error || !equipo) ? (
          <ActionButton title="Reintentar" onPress={() => { void cargar(); }} secondary />
        ) : null}
        <ActionButton title="Volver al detalle" onPress={() => router.back()} secondary />
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({ error: { ...typography.body, color: colors.danger } });
