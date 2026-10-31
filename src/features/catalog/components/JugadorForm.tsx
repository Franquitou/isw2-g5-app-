import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { colors, radii, spacing, typography } from '@/theme';
import type { Jugador } from '@/types';
import { catalogAdminError } from '../services/catalogAdminError';

interface FormValues {
  nombre: string;
  apellido: string;
  dni: string;
  numeroCamiseta: number | null;
}

interface Props {
  mode: 'create' | 'edit';
  initial?: Jugador;
  onSave: (values: FormValues) => Promise<void>;
}

/**
 * Formulario de RF-04.
 * El DNI se trata como texto y el equipo no se elige: al crear viene de la ruta
 * y al editar es inmutable.
 */
export function JugadorForm({ mode, initial, onSave }: Props) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [apellido, setApellido] = useState(initial?.apellido ?? '');
  const [dni, setDni] = useState(initial?.dni ?? '');
  const [camiseta, setCamiseta] = useState(initial?.numeroCamiseta ? String(initial.numeroCamiseta) : '');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const nombreLimpio = nombre.trim();
    const apellidoLimpio = apellido.trim();
    const dniLimpio = dni.trim();
    const camisetaLimpia = camiseta.trim();

    if (!nombreLimpio || nombreLimpio.length > 60) {
      setError('El nombre es obligatorio y no puede superar los 60 caracteres.');
      return;
    }
    if (!apellidoLimpio || apellidoLimpio.length > 60) {
      setError('El apellido es obligatorio y no puede superar los 60 caracteres.');
      return;
    }
    if (!dniLimpio || dniLimpio.length > 10) {
      setError('El DNI es obligatorio y no puede superar los 10 caracteres.');
      return;
    }

    let numeroCamiseta: number | null = null;
    if (camisetaLimpia.length > 0) {
      numeroCamiseta = Number(camisetaLimpia);
      if (!Number.isInteger(numeroCamiseta) || numeroCamiseta < 1 || numeroCamiseta > 99) {
        setError('El número de camiseta debe ser un entero entre 1 y 99, o quedar vacío.');
        return;
      }
    }

    setSending(true);
    setError(null);
    try {
      await onSave({
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        dni: dniLimpio,
        numeroCamiseta,
      });
    } catch (failure) {
      setError(catalogAdminError(failure));
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Nombre (obligatorio)</Text>
      <TextInput
        value={nombre}
        onChangeText={setNombre}
        maxLength={60}
        accessibilityLabel="Nombre del jugador"
        style={styles.input}
      />

      <Text style={styles.label}>Apellido (obligatorio)</Text>
      <TextInput
        value={apellido}
        onChangeText={setApellido}
        maxLength={60}
        accessibilityLabel="Apellido del jugador"
        style={styles.input}
      />

      <Text style={styles.label}>DNI (obligatorio, único en la liga)</Text>
      <TextInput
        value={dni}
        onChangeText={setDni}
        maxLength={10}
        keyboardType="number-pad"
        accessibilityLabel="DNI del jugador"
        style={styles.input}
      />

      <Text style={styles.label}>Número de camiseta (opcional, 1 a 99)</Text>
      <TextInput
        value={camiseta}
        onChangeText={setCamiseta}
        maxLength={2}
        keyboardType="number-pad"
        accessibilityLabel="Número de camiseta"
        style={styles.input}
      />

      <Text style={styles.hint}>
        {mode === 'create'
          ? 'El jugador queda en el plantel del equipo desde el que abriste el alta.'
          : 'El jugador no puede cambiar de equipo desde la edición.'}
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
