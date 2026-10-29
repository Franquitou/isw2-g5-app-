import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface EncabezadoCatalogoProps {
  titulo: string;
  descripcion?: string;
  /** Si es `false`, no muestra el enlace para volver. */
  volver?: boolean;
}

/**
 * Encabezado común de las pantallas del catálogo.
 * Incluye el enlace de vuelta para que la navegación por archivos no obligue
 * a repetir el mismo bloque en cada pantalla.
 */
export function EncabezadoCatalogo({ titulo, descripcion, volver = true }: EncabezadoCatalogoProps) {
  return (
    <View style={styles.contenedor}>
      {volver && router.canGoBack() ? (
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.volver}>
          <Text style={styles.textoVolver}>‹ Volver</Text>
        </Pressable>
      ) : null}
      <Text style={styles.titulo}>{titulo}</Text>
      {descripcion ? <Text style={styles.descripcion}>{descripcion}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: spacing.xs,
  },
  volver: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  textoVolver: {
    ...typography.label,
    color: colors.primary,
  },
  titulo: {
    ...typography.title,
    color: colors.text,
  },
  descripcion: {
    ...typography.body,
    color: colors.textMuted,
  },
});
