import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';

interface TarjetaNavegacionProps {
  href: string;
  titulo: string;
  detalle?: string;
  icono?: ReactNode;
}

/** Tarjeta que navega a otra pantalla del catálogo. */
export function TarjetaNavegacion({ href, titulo, detalle }: TarjetaNavegacionProps) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.tarjeta} accessibilityRole="button">
        <View style={styles.textos}>
          <Text style={styles.titulo}>{titulo}</Text>
          {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
        </View>
        <Text style={styles.flecha}>›</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  textos: {
    flex: 1,
    gap: spacing.xs,
  },
  titulo: {
    ...typography.subtitle,
    color: colors.text,
  },
  detalle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  flecha: {
    ...typography.title,
    color: colors.primary,
    lineHeight: 30,
  },
});
