import { router, useLocalSearchParams } from 'expo-router';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { JugadorForm, equiposApi } from '@/features/catalog';

/** RF-04: alta de jugador en el equipo indicado por la ruta. */
export default function NuevoJugadorScreen() {
  const { equipoId } = useLocalSearchParams<{ equipoId?: string }>();
  const equipoNumero = Number(equipoId);

  if (!Number.isInteger(equipoNumero) || equipoNumero <= 0) {
    return (
      <AppScreen>
        <SectionCard title="Nuevo jugador" subtitle="No se indicó un equipo válido">
          <ActionButton title="Volver al listado" onPress={() => router.replace('/equipos')} secondary />
        </SectionCard>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <SectionCard title="Nuevo jugador" subtitle="El equipo se toma de la pantalla anterior">
        <JugadorForm
          mode="create"
          onSave={async ({ nombre, apellido, dni, numeroCamiseta }) => {
            await equiposApi.crearJugador(equipoNumero, { nombre, apellido, dni, numeroCamiseta });
            router.back();
          }}
        />
        <ActionButton title="Volver al detalle" onPress={() => router.back()} secondary />
      </SectionCard>
    </AppScreen>
  );
}
