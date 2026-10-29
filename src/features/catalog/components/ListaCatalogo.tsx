import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';

interface ListaCatalogoProps<T> {
  datos: T[];
  cargando: boolean;
  error: string | null;
  mensajeVacio: string;
  recargar: () => void;
  renderItem: (item: T) => ReactNode;
}

/**
 * Muestra una lista del catálogo con sus estados de carga, error y vacío.
 *
 * Evita repetir la misma lógica visual en cada pantalla del módulo.
 */
export function ListaCatalogo<T>({
  datos,
  cargando,
  error,
  mensajeVacio,
  recargar,
  renderItem,
}: ListaCatalogoProps<T>) {
  if (cargando) {
    return (
      <View style={styles.estado}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.textoEstado}>Cargando…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.estado}>
        <Text style={[styles.textoEstado, styles.error]}>{error}</Text>
        <Pressable onPress={recargar} style={styles.boton} accessibilityRole="button">
          <Text style={styles.textoBoton}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (datos.length === 0) {
    return (
      <View style={styles.estado}>
        <Text style={styles.textoEstado}>{mensajeVacio}</Text>
      </View>
    );
  }

  return <View style={styles.lista}>{datos.map(renderItem)}</View>;
}

const styles = StyleSheet.create({
  lista: {
    gap: spacing.sm,
  },
  estado: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  textoEstado: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
  },
  boton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  textoBoton: {
    ...typography.label,
    color: colors.surface,
  },
});
