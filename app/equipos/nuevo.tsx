import { router, useLocalSearchParams } from 'expo-router';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { EquipoForm, equiposApi } from '@/features/catalog';

/** RF-03: alta de equipo dentro del torneo indicado por la ruta. */
export default function NuevoEquipoScreen() {
  const { torneoId } = useLocalSearchParams<{ torneoId?: string }>();
  const torneo = Number(torneoId);

  if (!Number.isInteger(torneo) || torneo <= 0) {
    return (
      <AppScreen>
        <SectionCard title="Nuevo equipo" subtitle="No se indicó un torneo válido">
          <ActionButton title="Volver al listado" onPress={() => router.replace('/equipos')} secondary />
        </SectionCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <SectionCard title="Nuevo equipo" subtitle="El torneo se toma de la pantalla anterior">
        <EquipoForm
          mode="create"
          onSave={async ({ nombre, barrio }) => {
            const creado = await equiposApi.crear(torneo, { nombre, barrio });
            router.replace({
              pathname: '/equipos/[equipoId]',
              params: { equipoId: String(creado.id), torneoId: String(torneo) },
            });
          }}
        />
        <ActionButton title="Volver al listado" onPress={() => router.replace('/equipos')} secondary />
      </SectionCard>
    </AppScreen>
  );
}
