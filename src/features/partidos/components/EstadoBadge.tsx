import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';
import type { EstadoPartido } from '@/types';
import { ETIQUETA_ESTADO } from '../utils/partidoLabels';

const COLORES: Record<EstadoPartido, { fondo: string; texto: string }> = {
  PROGRAMADO: { fondo: colors.surfaceMuted, texto: colors.textMuted },
  EN_JUEGO: { fondo: colors.primarySoft, texto: colors.primaryDark },
  FINALIZADO: { fondo: colors.primarySoft, texto: colors.success },
  SUSPENDIDO: { fondo: colors.dangerSoft, texto: colors.danger },
};

/** Distintivo del estado de un partido. */
export function EstadoBadge({ estado }: { estado: EstadoPartido }) {
  const color = COLORES[estado];
  return (
    <View style={[styles.badge, { backgroundColor: color.fondo }]}>
      <Text style={[styles.text, { color: color.texto }]}>{ETIQUETA_ESTADO[estado]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});
