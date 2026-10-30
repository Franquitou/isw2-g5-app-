import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}

/** Botón reutilizable para formularios y acciones del módulo A. */
export function ActionButton({ title, onPress, disabled = false, secondary = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, secondary ? styles.secondary : styles.primary, disabled && styles.disabled]}
    >
      <Text style={[styles.text, secondary && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: radii.md, padding: spacing.md, alignItems: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.6 },
  text: { ...typography.label, color: colors.surface },
  secondaryText: { color: colors.primary },
});
