import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import { AppScreen } from '@/components';
import {
  EncabezadoCatalogo,
  ListaCatalogo,
  TarjetaNavegacion,
  catalogApi,
  useListaCatalogo,
} from '@/features/catalog';

/**
 * Equipos de un torneo (RF-05).
 * Cada equipo lleva al listado de sus jugadores.
 */
export default function EquiposDeTorneoScreen() {
  const { torneoId } = useLocalSearchParams<{ torneoId: string }>();
  const id = Number(torneoId);
  const cargar = useCallback(() => catalogApi.listarEquipos(id), [id]);
  const { datos, cargando, error, recargar } = useListaCatalogo(cargar);

  return (
    <AppScreen>
      <EncabezadoCatalogo
        titulo="Equipos"
        descripcion="Equipos activos inscriptos en el torneo."
      />

      <ListaCatalogo
        datos={datos}
        cargando={cargando}
        error={error}
        mensajeVacio="Este torneo todavía no tiene equipos activos."
        recargar={recargar}
        renderItem={(equipo) => (
          <View key={equipo.id}>
            <TarjetaNavegacion
              href={`/catalogo/equipos/${equipo.id}`}
              titulo={equipo.nombre}
              detalle={equipo.barrio ?? 'Barrio no informado'}
            />
          </View>
        )}
      />
    </AppScreen>
  );
}
