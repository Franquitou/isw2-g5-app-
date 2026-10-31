import { Alert, Platform } from 'react-native';

/**
 * Pide confirmación antes de una acción destructiva o irreversible.
 * En web usa `window.confirm`; en Android/iOS usa `Alert`.
 */
export function confirmarAccion(titulo: string, mensaje: string, alConfirmar: () => void): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${titulo}. ${mensaje}`)) {
      alConfirmar();
    }
    return;
  }
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Confirmar', style: 'destructive', onPress: alConfirmar },
  ]);
}
