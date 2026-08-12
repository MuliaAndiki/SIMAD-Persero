interface ColorConfig {
  background: string;
  foreground: string;
}

interface ThemeConfig {
  light: {
    background: string;
    foreground: string;
    card: ColorConfig;
    popover: ColorConfig;
    primary: ColorConfig;
    secondary: ColorConfig;
    muted: ColorConfig;
    accent: ColorConfig;
    destructive: ColorConfig;
    warning: ColorConfig;
    success: ColorConfig;
    info: ColorConfig;
    border: string;
    input: string;
    ring: string;
  };
  dark: {
    background: string;
    foreground: string;
    card: ColorConfig;
    popover: ColorConfig;
    primary: ColorConfig;
    secondary: ColorConfig;
    muted: ColorConfig;
    accent: ColorConfig;
    destructive: ColorConfig;
    warning: ColorConfig;
    success: ColorConfig;
    info: ColorConfig;
    border: string;
    input: string;
    ring: string;
  };
}

export const themeConfig: ThemeConfig = {
  light: {
    background: '#FFFFFF',
    foreground: '#0B2D4D',
    card: {
      background: '#FFFFFF',
      foreground: '#0B2D4D',
    },
    popover: {
      background: '#FFFFFF',
      foreground: '#0B2D4D',
    },
    primary: {
      background: '#0066B3',
      foreground: '#FFFFFF',
    },
    secondary: {
      background: '#EAF5FC',
      foreground: '#005BAC',
    },
    muted: {
      background: '#F3F8FC',
      foreground: 'rgba(11, 45, 77, 0.6)',
    },
    accent: {
      background: '#FFF8D6',
      foreground: '#005BAC',
    },
    destructive: {
      background: '#DC2626',
      foreground: '#FFFFFF',
    },
    warning: {
      background: '#FFD100',
      foreground: '#0B2D4D',
    },
    success: {
      background: '#16A34A',
      foreground: '#FFFFFF',
    },
    info: {
      background: '#0284C7',
      foreground: '#FFFFFF',
    },
    border: 'rgba(11, 45, 77, 0.2)',
    input: 'rgba(11, 45, 77, 0.2)',
    ring: 'rgba(0, 102, 179, 0.3)',
  },
  dark: {
    background: '#071A2B',
    foreground: '#F5FAFF',
    card: {
      background: '#0D263D',
      foreground: '#F5FAFF',
    },
    popover: {
      background: '#0D263D',
      foreground: '#F5FAFF',
    },
    primary: {
      background: '#1685D4',
      foreground: '#FFFFFF',
    },
    secondary: {
      background: '#123B5D',
      foreground: '#EAF5FC',
    },
    muted: {
      background: '#102D45',
      foreground: 'rgba(245, 250, 255, 0.6)',
    },
    accent: {
      background: '#3A3210',
      foreground: '#FFD100',
    },
    destructive: {
      background: '#EF4444',
      foreground: '#FFFFFF',
    },
    warning: {
      background: '#FFD100',
      foreground: '#0B2D4D',
    },
    success: {
      background: '#22C55E',
      foreground: '#FFFFFF',
    },
    info: {
      background: '#38BDF8',
      foreground: '#071A2B',
    },
    border: 'rgba(245, 250, 255, 0.1)',
    input: 'rgba(245, 250, 255, 0.15)',
    ring: 'rgba(22, 133, 212, 0.3)',
  },
};
