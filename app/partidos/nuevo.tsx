import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { useSession } from '@/auth/SessionContext';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { PartidoForm, partidosApi } from '@/features/partidos';
import { colors } from '@/theme';

/** RF-06: alta de partido; solo ADMIN. */
export default function NuevoPartidoScreen() {
  const { torneoId, fecha } = useLocalSearchParams<{ torneoId?: string; fecha?: string }>();
  const { session, loading } = useSession();
  const torneoParam = Number(torneoId);
  const fechaParam = Number(fecha);

  if (loading) return <AppScreen><ActivityIndicator color={colors.primary} /></AppScreen>;
  if (!session) return <Redirect href="/login" />;
  if (session.rol !== 'ADMIN') {
    return (
      <AppScreen>
        <SectionCard title="Nuevo partido" subtitle="Solo administradores">
          <ActionButton title="Volver al listado" onPress={() => router.replace('/partidos')} secondary />
        </SectionCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <SectionCard title="Nuevo partido" subtitle="RF-06 · programación">
        <PartidoForm
          mode="create"
          torneoInicialId={Number.isInteger(torneoParam) && torneoParam > 0 ? torneoParam : null}
          fechaInicial={Number.isInteger(fechaParam) && fechaParam > 0 ? fechaParam : null}
          onSave={async (values) => {
            const creado = await partidosApi.crear(values);
            router.replace({
              pathname: '/partidos/[partidoId]',
              params: { partidoId: String(creado.id) },
            });
          }}
        />
        <ActionButton title="Volver al listado" onPress={() => router.replace('/partidos')} secondary />
      </SectionCard>
    </AppScreen>
  );
}
