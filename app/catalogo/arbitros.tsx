import { AppScreen } from '@/components';
import {
  EncabezadoCatalogo,
  ItemCatalogo,
  ListaCatalogo,
  catalogApi,
  useListaCatalogo,
} from '@/features/catalog';

/**
 * Listado público de árbitros activos (RF-05).
 * No muestra el alta ni la edición: esas escrituras requieren rol ADMIN y
 * todavía no hay login en la app.
 */
export default function ArbitrosScreen() {
  const { datos, cargando, error, recargar } = useListaCatalogo(catalogApi.listarArbitros);

  return (
    <AppScreen>
      <EncabezadoCatalogo
        titulo="Árbitros"
        descripcion="Árbitros habilitados para dirigir los partidos de la liga."
      />

      <ListaCatalogo
        datos={datos}
        cargando={cargando}
        error={error}
        mensajeVacio="No hay árbitros activos para mostrar."
        recargar={recargar}
        renderItem={(arbitro) => (
          <ItemCatalogo
            key={arbitro.id}
            titulo={`${arbitro.apellido}, ${arbitro.nombre}`}
            detalle={`DNI ${arbitro.dni}`}
          />
        )}
      />
    </AppScreen>
  );
}
