/**
 * App theme. `Colors`/`Fonts` below are kept from the Expo starter because a few
 * starter helpers still import them. `Theme` is our EPL design system, translated
 * from the web client's ACTUALLY-APPLIED theme (client/src/styles/theme.css +
 * client/src/styles/fonts.css). Note: the design is a DARK, neon-green theme —
 * not the leftover client/default_shadcn_theme.css.
 */

import { Platform } from 'react-native';

/** EPL design tokens — use this in app screens. */
export const Theme = {
  colors: {
    primary: '#39ff14', // neon green
    primaryForeground: '#030603', // near-black text on green buttons
    background: '#0b0d0b', // near-black app background
    foreground: '#e4ede4', // light body text
    card: '#121512',
    cardForeground: '#e4ede4',
    muted: '#1a1f1a', // input / subtle surfaces
    mutedForeground: '#6b7d6b', // secondary / label text
    accent: '#39ff14',
    accentForeground: '#030603',
    secondary: '#162216',
    secondaryForeground: '#e4ede4',
    destructive: '#e03e3e', // error text / messages (no alert boxes)
    destructiveForeground: '#ffffff',
    border: 'rgba(57, 255, 20, 0.1)', // faint green hairline
    input: '#1a1f1a',
    inputBackground: '#1a1f1a',
    ring: 'rgba(57, 255, 20, 0.35)', // focus glow
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 },
  radius: { sm: 2, md: 3, lg: 4, xl: 6, full: 999 }, // web --radius = 0.2rem (very sharp)
  fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28, display: 34 },
} as const;

/**
 * Intended font families (from the web design). These only render after the fonts
 * are loaded via @expo-google-fonts/* — until then React Native falls back to the
 * system font, which is fine. We'll wire real font loading in a later step.
 */
export const FontFamily = {
  display: 'BarlowCondensed_700Bold', // uppercase headings / scores
  body: 'DMSans_400Regular',
  mono: 'JetBrainsMono_500Medium', // labels / numbers / odds
} as const;

// --- kept from Expo starter (do not remove: use-theme-color.ts / icon helpers rely on these) ---
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
