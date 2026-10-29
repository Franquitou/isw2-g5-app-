import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { AppScreen, SectionCard } from '@/components';
import { colors, spacing, typography } from '@/theme';

/** Pantalla para rutas inexistentes. */
export default function NotFoundScreen() {
  return (
    <AppScreen>
      <SectionCard title="Pantalla no encontrada">
        <Text style={styles.text}>La ruta solicitada no existe en esta base móvil.</Text>
        <Link href="/" style={styles.link}>
          Volver al inicio
        </Link>
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.body,
    color: colors.textMuted,
  },
  link: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    paddingVertical: spacing.sm,
  },
});
