import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, InfoRow, SectionCard } from '@/components';
import { apiConfig, appConfig } from '@/api';
import { TarjetaNavegacion } from '@/features/catalog';
import { SessionActions } from '@/features/auth/components/SessionActions';
import { colors, spacing, typography } from '@/theme';

/**
 * Pantalla inicial de la aplicación.
 * Presenta los módulos disponibles y enlaza al catálogo público y a los partidos.
 */
export default function HomeScreen() {
  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>TEMPORADA 2026</Text>
        <Text style={styles.title}>Liga Amateur Santafesina</Text>
        <Text style={styles.description}>
          Consultá los torneos, equipos, jugadores, canchas, árbitros y partidos de la liga.
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
        <TarjetaNavegacion
          href="/partidos"
          titulo="Partidos y resultados"
          detalle="Fixture, resultados, tabla de posiciones y suspendidos"
        />
      </SectionCard>

      <SessionActions />

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
