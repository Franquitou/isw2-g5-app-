import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { AppScreen, SectionCard } from '@/components';
import { ActionButton } from '@/features/auth/components/ActionButton';
import { userError } from '@/features/users/services/userError';
import { usersApi } from '@/features/users/services/usersApi';
import { colors, radii, spacing, typography } from '@/theme';

/** RF-02: asigna nueva contraseña a un usuario; no la conserva tras cerrar el formulario. */
export default function CambiarPasswordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = Number(id);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (password.length < 8 || password !== confirm) {
      setError('La contraseña debe tener al menos 8 caracteres y coincidir en ambos campos.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await usersApi.cambiarPassword(userId, password);
      setPassword('');
      setConfirm('');
      router.replace(`/usuarios/${userId}`);
    } catch (failure) {
      setError(userError(failure));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppScreen>
      <SectionCard title="Cambiar contraseña" subtitle="Mínimo 8 caracteres">
        <View style={styles.form}>
          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry
            accessibilityLabel="Nueva contraseña" style={styles.input} />
          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput value={confirm} onChangeText={setConfirm} secureTextEntry
            accessibilityLabel="Confirmar contraseña" style={styles.input} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <ActionButton title={saving ? 'Guardando…' : 'Guardar contraseña'}
            onPress={() => { void submit(); }} disabled={saving} />
          <ActionButton title="Cancelar" onPress={() => router.replace(`/usuarios/${userId}`)} secondary />
        </View>
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  label: { ...typography.label, color: colors.text },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm,
    padding: spacing.md, backgroundColor: colors.surface, color: colors.text },
  error: { ...typography.body, color: colors.danger },
});
