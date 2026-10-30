import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { colors, radii, spacing, typography } from '@/theme';
import type { Rol } from '@/types';
import { userError } from '../services/userError';
import type { Usuario } from '../types';

interface FormValues {
  username: string;
  password: string;
  nombreCompleto: string;
  rol: Rol;
}

interface Props {
  mode: 'create' | 'edit';
  initial?: Usuario;
  isOwnAdmin?: boolean;
  onSave: (values: FormValues) => Promise<void>;
}

/** Formulario RF-02: PUT exige todos los campos editables y nunca cambia username. */
export function UsuarioForm({ mode, initial, isOwnAdmin = false, onSave }: Props) {
  const [username, setUsername] = useState(initial?.username ?? '');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState(initial?.nombreCompleto ?? '');
  const [rol, setRol] = useState<Rol>(initial?.rol ?? 'DELEGADO');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!nombreCompleto.trim() || nombreCompleto.length > 100) {
      setError('El nombre completo es obligatorio y no puede superar 100 caracteres.');
      return;
    }
    if (mode === 'create' && (!username.trim() || username.length > 40 || password.length < 8)) {
      setError('Ingresá un usuario de hasta 40 caracteres y una contraseña de al menos 8.');
      return;
    }
    if (isOwnAdmin && rol !== 'ADMIN') {
      setError('No podés quitarte el rol de administrador.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await onSave({ username, password, nombreCompleto, rol });
      setPassword('');
    } catch (failure) {
      setError(userError(failure));
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Usuario</Text>
      {mode === 'create' ? (
        <TextInput value={username} onChangeText={setUsername} autoCapitalize="none"
          autoCorrect={false} accessibilityLabel="Usuario" style={styles.input} />
      ) : <Text style={styles.readonly}>{username} (no se puede modificar)</Text>}

      <Text style={styles.label}>Nombre completo</Text>
      <TextInput value={nombreCompleto} onChangeText={setNombreCompleto}
        accessibilityLabel="Nombre completo" style={styles.input} />

      {mode === 'create' ? (
        <>
          <Text style={styles.label}>Contraseña inicial (mínimo 8 caracteres)</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry
            accessibilityLabel="Contraseña inicial" style={styles.input} />
        </>
      ) : null}

      <Text style={styles.label}>Rol</Text>
      <View style={styles.roles}>
        {(['DELEGADO', 'ADMIN'] as const).map((option) => (
          <Pressable key={option} accessibilityRole="button"
            disabled={isOwnAdmin && option !== 'ADMIN'}
            onPress={() => setRol(option)}
            style={[styles.role, rol === option && styles.selected,
              isOwnAdmin && option !== 'ADMIN' && styles.disabled]}>
            <Text style={styles.roleText}>{option}</Text>
          </Pressable>
        ))}
      </View>
      {isOwnAdmin ? <Text style={styles.hint}>RN-08: no podés quitarte el rol ADMIN.</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ActionButton title={sending ? 'Guardando…' : 'Guardar'} onPress={() => { void submit(); }} disabled={sending} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  label: { ...typography.label, color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm,
    padding: spacing.md, backgroundColor: colors.surface, color: colors.text },
  readonly: { ...typography.body, color: colors.textMuted },
  roles: { flexDirection: 'row', gap: spacing.sm },
  role: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, padding: spacing.md },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  disabled: { opacity: 0.45 },
  roleText: { ...typography.label, color: colors.text },
  hint: { ...typography.caption, color: colors.textMuted },
  error: { ...typography.body, color: colors.danger },
});
