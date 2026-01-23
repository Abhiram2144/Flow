/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#ff99cc';
const tintColorDark = '#ff99cc';

export const Colors = {
  light: {
    text: '#ffffff',
    background: '#1a1d23',
    tint: tintColorLight,
    icon: '#a3a3a3',
    tabIconDefault: '#a3a3a3',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ffffff',
    background: '#1a1d23',
    tint: tintColorDark,
    icon: '#a3a3a3',
    tabIconDefault: '#a3a3a3',
    tabIconSelected: tintColorDark,
  },
};

export const AppColors = {
  // Light mode
  background: '#1a1d23',
  card: '#2f3436',
  cardForeground: '#ffffff',
  popover: '#2f3436',
  popoverForeground: '#ffffff',
  primary: '#ff99cc',
  primaryForeground: '#000000',
  secondary: '#33cc33',
  secondaryForeground: '#000000',
  muted: '#444444',
  mutedForeground: '#a3a3a3',
  accent: '#87ceeb',
  accentForeground: '#000000',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#444444',
  input: '#444444',
  ring: '#ff99cc',
  chart1: '#ff99cc',
  chart2: '#33cc33',
  chart3: '#87ceeb',
  chart4: '#ffff00',
  chart5: '#ffcc00',
  sidebar: '#1a1d23',
  sidebarForeground: '#ffffff',
  sidebarPrimary: '#ff99cc',
  sidebarPrimaryForeground: '#000000',
  sidebarAccent: '#87ceeb',
  sidebarAccentForeground: '#000000',
  sidebarBorder: '#444444',
  sidebarRing: '#ff99cc',
  // Typography
  textPrimary: '#ffffff',
  textSecondary: '#a3a3a3',
  textTertiary: '#737373',
  // Shadows
  shadow: 'oklch(0 0 0 / 0.10)',
  // Dark mode overrides (to be used with a theme switcher)
  dark: {
    background: '#1a1d23',
    card: '#2f3436',
    cardForeground: '#ffffff',
    popover: '#2f3436',
    popoverForeground: '#ffffff',
    primary: '#ff99cc',
    primaryForeground: '#000000',
    secondary: '#33cc33',
    secondaryForeground: '#000000',
    muted: '#444444',
    mutedForeground: '#a3a3a3',
    accent: '#87ceeb',
    accentForeground: '#000000',
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    border: '#444444',
    input: '#444444',
    ring: '#ff99cc',
    chart1: '#ff99cc',
    chart2: '#33cc33',
    chart3: '#87ceeb',
    chart4: '#ffff00',
    chart5: '#ffcc00',
    sidebar: '#1a1d23',
    sidebarForeground: '#ffffff',
    sidebarPrimary: '#ff99cc',
    sidebarPrimaryForeground: '#000000',
    sidebarAccent: '#87ceeb',
    sidebarAccentForeground: '#000000',
    sidebarBorder: '#444444',
    sidebarRing: '#ff99cc',
    textPrimary: '#ffffff',
    textSecondary: '#a3a3a3',
    textTertiary: '#737373',
    shadow: 'oklch(0 0 0 / 0.10)',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Poppins',
    serif: 'Georgia',
    rounded: 'Poppins',
    mono: 'Roboto Mono',
  },
  default: {
    sans: 'Poppins',
    serif: 'Georgia',
    rounded: 'Poppins',
    mono: 'Roboto Mono',
  },
  web: {
    sans: 'Poppins, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    serif: 'Georgia, Times New Roman, serif',
    rounded: 'Poppins, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    mono: 'Roboto Mono, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
  },
});
