/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#D4AF37';
const tintColorDark = '#D4AF37';

export const Colors = {
  light: {
    text: '#0B0D0F',
    background: '#0B0D0F',
    tint: tintColorLight,
    icon: '#8C8577',
    tabIconDefault: '#8C8577',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#EDE7DB',
    background: '#0B0D0F',
    tint: tintColorDark,
    icon: '#8C8577',
    tabIconDefault: '#8C8577',
    tabIconSelected: tintColorDark,
  },
};

export const AppColors = {
  background: '#0B0D0F',
  cardDark: '#111417',
  cardLight: '#E5E5E5',
  border: '#1A1E24',
  borderSubtle: '#2A2E35',
  textPrimary: '#EDE7DB',
  textSecondary: '#B8B2A7',
  textTertiary: '#8C8577',
  accent: '#D4AF37',
  accentLight: '#FFD966',
  error: '#ff6b6b',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
