import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { colors, radii, spacing, typography } from '@/theme';
import type { Equipo } from '@/types';
import { catalogAdminError } from '../services/catalogAdminError';

interface FormValues {
  nombre: string;
  barrio: string | null;
}

interface Props {
  mode: 'create' | 'edit';
  initial?: Equipo;
  onSave: (values: FormValues) => Promise<void>;
}

/**
 * Formulario de RF-03.
 * El torneo no se elige acá: al crear viene de la ruta y al editar es inmutable.
 */
export function EquipoForm({ mode, initial, onSave }: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [barrio, setBarrio] = useState(initial?.barrio ?? '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const nombreLimpio = nombre.trim();
    const barrioLimpio = barrio.trim();
    if (!nombreLimpio) {
      setError('El nombre del equipo es obligatorio.');
      return;
    }
    if (nombreLimpio.length > 80) {
      setError('El nombre no puede superar los 80 caracteres.');
      return;
    }
    if (barrioLimpio.length > 80) {
      setError('El barrio no puede superar los 80 caracteres.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await onSave({ nombre: nombreLimpio, barrio: barrioLimpio.length > 0 ? barrioLimpio : null });
    } catch (failure) {
      setError(catalogAdminError(failure));
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Nombre del equipo (obligatorio)</Text>
      <TextInput
        value={nombre}
        onChangeText={setNombre}
        maxLength={80}
        accessibilityLabel="Nombre del equipo"
        style={styles.input}
      />

      <Text style={styles.label}>Barrio (opcional)</Text>
      <TextInput
        value={barrio}
        onChangeText={setBarrio}
        maxLength={80}
        accessibilityLabel="Barrio del equipo"
        style={styles.input}
      />
      <Text style={styles.hint}>
        {mode === 'create'
          ? 'El equipo queda inscripto en el torneo desde el que abriste el alta.'
          : 'El equipo no puede cambiar de torneo desde la edición.'}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ActionButton
        title={sending ? 'Guardando…' : 'Guardar'}
        onPress={() => { void submit(); }}
        disabled={sending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  label: { ...typography.label, color: colors.text },
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
