import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface InfoRowProps {
  label: string;
  value: string;
  tone?: 'default' | 'warning';
}

/** Fila etiqueta/valor para mostrar datos de configuración o estado. */
export function InfoRow({ label, value, tone = 'default' }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, tone === 'warning' && styles.warning]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    ...typography.body,
    color: colors.text,
  },
  warning: {
    color: colors.warning,
  },
});
