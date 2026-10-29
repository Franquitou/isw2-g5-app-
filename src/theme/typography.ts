import type { TextStyle } from 'react-native';

/**
 * Tipografías del sistema. No se cargan fuentes externas en esta base para
 * evitar dependencias y pasos de instalación adicionales.
 */
export const typography = {
  title: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  subtitle: { fontSize: 18, fontWeight: '600', lineHeight: 24 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
} satisfies Record<string, TextStyle>;
