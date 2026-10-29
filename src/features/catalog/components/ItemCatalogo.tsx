import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';

interface ItemCatalogoProps {
  titulo: string;
  detalle?: string | null;
  extra?: string | null;
}

/** Tarjeta de una fila del catálogo (cancha, árbitro, equipo o jugador). */
export function ItemCatalogo({ titulo, detalle, extra }: ItemCatalogoProps) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.titulo}>{titulo}</Text>
      {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
      {extra ? <Text style={styles.extra}>{extra}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  titulo: {
    ...typography.subtitle,
    color: colors.text,
  },
  detalle: {
    ...typography.body,
    color: colors.textMuted,
  },
  extra: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});
