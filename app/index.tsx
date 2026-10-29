import { StyleSheet, Text, View } from 'react-native';
import { AppScreen, InfoRow, SectionCard } from '@/components';
import { apiConfig, appConfig } from '@/api';
import { TarjetaNavegacion } from '@/features/catalog';
import { colors, spacing, typography } from '@/theme';

const included = [
  'Expo Router y navegación por archivos.',
  'Cliente HTTP con manejo uniforme de errores.',
  'Almacenamiento seguro del token JWT.',
  'Tipos del contrato de catálogo, equipos y jugadores.',
  'Tema y componentes visuales compartidos.',
];

const pending = [
  'RF-03 y RF-04: alta, edición y baja de equipos y jugadores (requieren login ADMIN).',
  'RF-01: login y usuarios (a cargo de Franco).',
  'Partidos, eventos, tabla y suspendidos (José y Mateo).',
];

/**
 * Pantalla inicial de la base móvil.
 * No consume endpoints todavía: solo muestra el estado de la configuración
 * y deja explícito qué falta implementar en el backend antes de cada pantalla.
 */
export default function HomeScreen() {
  return (
    <AppScreen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>LIGA AMATEUR SANTAFESINA</Text>
        <Text style={styles.title}>Base móvil</Text>
        <Text style={styles.description}>
          Proyecto Expo + TypeScript preparado para que cada integrante agregue las
          pantallas de su módulo sin duplicar configuración compartida.
        </Text>
      </View>

      <SectionCard title="Catálogo público" subtitle="RF-05 · sin necesidad de iniciar sesión">
        <Text style={styles.listItem}>
          Consultá torneos, equipos, jugadores, canchas y árbitros.
        </Text>
        <TarjetaNavegacion
          href="/catalogo"
          titulo="Abrir catálogo"
          detalle="Información pública de la liga"
        />
      </SectionCard>

      <SectionCard title="Configuración actual" subtitle="Variables de entorno de Expo">
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

      <SectionCard title="Incluido en esta base" subtitle="Infraestructura compartida">
        {included.map((item) => (
          <Text key={item} style={styles.listItem}>
            • {item}
          </Text>
        ))}
      </SectionCard>

      <SectionCard title="Pendiente de backend" subtitle="No se adelantan pantallas sin contrato">
        {pending.map((item) => (
          <Text key={item} style={styles.listItem}>
            • {item}
          </Text>
        ))}
      </SectionCard>

      <Text style={styles.footer}>
        Documentación del contrato: docs/API.md del repositorio backend.
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
