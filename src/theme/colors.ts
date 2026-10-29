/**
 * Paleta de colores compartida por toda la aplicación.
 * Los módulos deben usar estos tokens en lugar de valores hexadecimales sueltos
 * para mantener una identidad visual uniforme.
 */
export const colors = {
  background: '#F4F7F4',
  surface: '#FFFFFF',
  surfaceMuted: '#EAF0EB',
  primary: '#1B5E3A',
  primaryDark: '#123F27',
  primarySoft: '#DCEBE1',
  accent: '#F2C14E',
  text: '#14231A',
  textMuted: '#5A6B60',
  border: '#D7E2DA',
  danger: '#B3261E',
  dangerSoft: '#F9E3E1',
  success: '#2E7D32',
  warning: '#A86400',
} as const;

export type AppColor = keyof typeof colors;
