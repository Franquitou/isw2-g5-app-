import { AppScreen } from '@/components';
import {
  EncabezadoCatalogo,
  ItemCatalogo,
  ListaCatalogo,
  catalogApi,
  useListaCatalogo,
} from '@/features/catalog';

/**
 * Listado público de canchas activas (RF-05).
 * No muestra el alta ni la edición: esas escrituras requieren rol ADMIN y
 * todavía no hay login en la app.
 */
export default function CanchasScreen() {
  const { datos, cargando, error, recargar } = useListaCatalogo(catalogApi.listarCanchas);

  return (
    <AppScreen>
      <EncabezadoCatalogo
        titulo="Canchas"
        descripcion="Predios habilitados para disputar los partidos de la liga."
      />

      <ListaCatalogo
        datos={datos}
        cargando={cargando}
        error={error}
        mensajeVacio="No hay canchas activas para mostrar."
        recargar={recargar}
        renderItem={(cancha) => (
          <ItemCatalogo
            key={cancha.id}
            titulo={cancha.nombre}
            detalle={cancha.direccion ?? 'Dirección no informada'}
          />
        )}
      />
    </AppScreen>
  );
}
