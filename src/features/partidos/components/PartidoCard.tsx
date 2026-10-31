import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';
import type { PartidoListado } from '@/types';
import { EstadoBadge } from './EstadoBadge';
import { formatearFechaHora } from '../utils/partidoLabels';

interface Props {
  partido: PartidoListado;
  local: string;
  visitante: string;
  cancha: string;
  arbitro: string;
  onPress: () => void;
}

/** Tarjeta del listado público: equipos, marcador, estado y recursos. */
export function PartidoCard({ partido, local, visitante, cancha, arbitro, onPress }: Props) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.cabecera}>
        <EstadoBadge estado={partido.estado} />
        <Text style={styles.fecha}>
          Fecha {partido.numeroFecha} · {formatearFechaHora(partido.fechaHoraInicio)}
        </Text>
      </View>

      <View style={styles.marcador}>
        <Text style={styles.equipo} numberOfLines={2}>{local}</Text>
        <Text style={styles.goles}>
          {partido.estado === 'PROGRAMADO'
            ? 'vs'
            : `${partido.resultado.golesLocal} - ${partido.resultado.golesVisitante}`}
        </Text>
        <Text style={[styles.equipo, styles.equipoDerecha]} numberOfLines={2}>{visitante}</Text>
      </View>

      <Text style={styles.recurso}>
        {cancha} · {arbitro}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  cabecera: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  fecha: {
    ...typography.caption,
    color: colors.textMuted,
  },
  marcador: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  equipo: {
    ...typography.label,
    color: colors.text,
    flex: 1,
  },
  equipoDerecha: {
    textAlign: 'right',
  },
  goles: {
    ...typography.subtitle,
    color: colors.primaryDark,
    minWidth: 54,
    textAlign: 'center',
  },
  recurso: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
