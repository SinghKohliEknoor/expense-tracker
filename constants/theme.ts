import { Platform } from 'react-native';

const tintColorLight = '#7C3AED';
const tintColorDark = '#A78BFA';

export const Colors = {
  light: {
    text: '#1C1C1E',
    background: '#F5F3FF',
    tint: tintColorLight,
    icon: '#9CA3AF',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    border: '#E5E7EB',
  },
  dark: {
    text: '#F9FAFB',
    background: '#0F0B1E',
    tint: tintColorDark,
    icon: '#6B7280',
    tabIconDefault: '#6B7280',
    tabIconSelected: tintColorDark,
    card: '#1A1030',
    border: '#2D2040',
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