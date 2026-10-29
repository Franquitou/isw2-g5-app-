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
 * Listado público de torneos activos (RF-05).
 * Cada torneo lleva al listado de sus equipos.
 */
export default function TorneosScreen() {
  const { datos, cargando, error, recargar } = useListaCatalogo(catalogApi.listarTorneos);

  return (
    <AppScreen>
      <EncabezadoCatalogo
        titulo="Torneos"
        descripcion="Torneos vigentes de la liga, del más reciente al más antiguo."
      />

      <ListaCatalogo
        datos={datos}
        cargando={cargando}
        error={error}
        mensajeVacio="No hay torneos activos para mostrar."
        recargar={recargar}
        renderItem={(torneo) => (
          <View key={torneo.id}>
            <TarjetaNavegacion
              href={`/catalogo/torneos/${torneo.id}`}
              titulo={torneo.nombre}
              detalle={`Temporada ${torneo.anio}`}
            />
          </View>
        )}
      />
    </AppScreen>
  );
}
