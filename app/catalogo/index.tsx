import { StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components';
import { EncabezadoCatalogo, TarjetaNavegacion } from '@/features/catalog';
import { spacing } from '@/theme';

/**
 * Menú del catálogo público (RF-05).
 * Agrupa las consultas disponibles para cualquier visitante, sin login.
 */
export default function CatalogoScreen() {
  return (
    <AppScreen>
      <EncabezadoCatalogo
        titulo="Catálogo"
        descripcion="Información pública de la liga: torneos, equipos, jugadores, canchas y árbitros."
      />

      <View style={styles.grupo}>
        <TarjetaNavegacion
          href="/catalogo/torneos"
          titulo="Torneos"
          detalle="Torneos activos y sus equipos"
        />
        <TarjetaNavegacion
          href="/catalogo/canchas"
          titulo="Canchas"
          detalle="Predios habilitados para jugar"
        />
        <TarjetaNavegacion
          href="/catalogo/arbitros"
          titulo="Árbitros"
          detalle="Árbitros activos de la liga"
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  grupo: {
    gap: spacing.sm,
  },
});
