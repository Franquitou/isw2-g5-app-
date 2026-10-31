import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, InfoRow, SectionCard } from '@/components';
import { apiConfig, appConfig } from '@/api';
import { TarjetaNavegacion } from '@/features/catalog';
import { SessionActions } from '@/features/auth/components/SessionActions';
import { colors, spacing, typography } from '@/theme';

const proximamente = [
  'Partidos, eventos, tabla de posiciones y suspendidos.',
];

/**
 * Pantalla inicial de la aplicación.
 * Presenta los módulos disponibles y enlaza al catálogo público; los módulos
 * que dependen de otros equipos se listan como próximos, sin adelantar pantallas.
 */
export default function HomeScreen() {
  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>TEMPORADA 2026</Text>
        <Text style={styles.title}>Liga Amateur Santafesina</Text>
        <Text style={styles.description}>
          Consultá los torneos, equipos, jugadores, canchas y árbitros de la liga.
        </Text>
      </View>

      <SectionCard title="Módulos disponibles" subtitle="Funciones activas">
        <Text style={styles.listItem}>
          El catálogo público reúne la información de la liga sin necesidad de iniciar sesión.
        </Text>
        <TarjetaNavegacion
          href="/catalogo"
          titulo="Catálogo público"
          detalle="Torneos, equipos, jugadores, canchas y árbitros"
        />
      </SectionCard>

      <SessionActions />

      <SectionCard title="Próximamente" subtitle="Dependen de otros módulos">
        {proximamente.map((item) => (
          <Text key={item} style={styles.listItem}>
            • {item}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="Conexión" subtitle="Configuración de desarrollo">
        <InfoRow label="API" value={apiConfig.baseUrl} />
        <InfoRow label="Entorno" value={appConfig.environment} />
        <InfoRow
          label="Origen de la URL"
          value={
            apiConfig.usingFallbackUrl
              ? 'Valor por defecto: configurá EXPO_PUBLIC_API_URL en .env'
              : 'Definida en EXPO_PUBLIC_API_URL'
          }
          tone={apiConfig.usingFallbackUrl ? 'warning' : 'default'}
        />
      </SectionCard>

      <Text style={styles.footer}>
        Los datos se consultan en línea desde el backend de la liga.
      </Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  eyebrow: {
    ...typography.label,
    color: colors.primary,
    letterSpacing: 1,
  },
  title: {
    ...typography.title,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
  },
  listItem: {
    ...typography.body,
    color: colors.text,
  },
  footer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
