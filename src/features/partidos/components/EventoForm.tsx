import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { colors, radii, spacing, typography } from '@/theme';
import type { EventoCreateRequest, Jugador, TipoEvento } from '@/types';
import { partidoError } from '../services/partidoError';
import { ETIQUETA_EVENTO } from '../utils/partidoLabels';

export interface JugadorConEquipo {
  jugador: Jugador;
  equipo: string;
}

interface Props {
  jugadores: JugadorConEquipo[];
  onSave: (values: EventoCreateRequest) => Promise<void>;
}

const TIPOS: TipoEvento[] = ['GOL', 'AMARILLA', 'ROJA'];

/** Formulario de RF-08: jugador, tipo y minuto de un evento. */
export function EventoForm({ jugadores, onSave }: Props) {
  const [jugadorId, setJugadorId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoEvento>('GOL');
  const [minuto, setMinuto] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (jugadorId === null) {
      setError('Elegí el jugador.');
      return;
    }
    const valor = Number(minuto.trim());
    if (!Number.isInteger(valor) || valor < 1 || valor > 120) {
      setError('El minuto debe ser un entero entre 1 y 120.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await onSave({ jugadorId, tipo, minuto: valor });
    } catch (failure) {
      setError(partidoError(failure));
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Jugador</Text>
      <View style={styles.chips}>
        {jugadores.map(({ jugador, equipo }) => (
          <Pressable
            key={jugador.id}
            accessibilityRole="button"
            onPress={() => setJugadorId(jugador.id)}
            style={[styles.chip, jugadorId === jugador.id && styles.chipActivo]}
          >
            <Text style={[styles.chipTexto, jugadorId === jugador.id && styles.chipTextoActivo]}>
              {equipo} · {jugador.apellido}, {jugador.nombre}
              {jugador.numeroCamiseta ? ` (#${jugador.numeroCamiseta})` : ''}
            </Text>
          </Pressable>
        ))}
      </View>
      {jugadores.length === 0 ? <Text style={styles.hint}>No hay jugadores activos en los dos equipos.</Text> : null}

      <Text style={styles.label}>Tipo de evento</Text>
      <View style={styles.chips}>
        {TIPOS.map((opcion) => (
          <Pressable
            key={opcion}
            accessibilityRole="button"
            onPress={() => setTipo(opcion)}
            style={[styles.chip, tipo === opcion && styles.chipActivo]}
          >
            <Text style={[styles.chipTexto, tipo === opcion && styles.chipTextoActivo]}>
              {ETIQUETA_EVENTO[opcion]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Minuto (1 a 120)</Text>
      <TextInput
        value={minuto}
        onChangeText={setMinuto}
        keyboardType="number-pad"
        maxLength={3}
        placeholder="35"
        accessibilityLabel="Minuto del evento"
        style={styles.input}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ActionButton
        title={sending ? 'Guardando…' : 'Registrar evento'}
        onPress={() => { void submit(); }}
        disabled={sending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  label: { ...typography.label, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActivo: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chipTexto: { ...typography.label, color: colors.text },
  chipTextoActivo: { color: colors.primaryDark },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  hint: { ...typography.caption, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
