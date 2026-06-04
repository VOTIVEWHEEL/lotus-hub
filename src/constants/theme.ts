export const Colors = {
  // Primary palette — deep forest + lotus petal
  primary: '#5B8A6F',        // Lotus green
  primaryLight: '#7FB199',
  primaryDark: '#3D6B54',
  accent: '#E8A87C',         // Warm amber
  accentLight: '#F2C9A8',
  accentDark: '#C4854A',

  // Backgrounds
  bg: '#0D0F14',             // Deep night
  bgCard: '#161920',
  bgElevated: '#1E2230',
  bgSurface: '#252A38',

  // Text
  textPrimary: '#F0EDE8',
  textSecondary: '#9B9FAD',
  textMuted: '#5C6070',
  textInverse: '#0D0F14',

  // Semantic
  success: '#5B8A6F',
  warning: '#E8A87C',
  error: '#E07070',
  info: '#6B8FBF',

  // Feature colors
  tasks: '#6B8FBF',
  notes: '#9B7FBF',
  courses: '#5B8A6F',
  habits: '#E8A87C',
  timer: '#E07070',
  community: '#7FBF9B',

  // Borders
  border: '#2A2F3F',
  borderLight: '#353A4A',

  // Overlays
  overlay: 'rgba(13,15,20,0.85)',
  overlayLight: 'rgba(13,15,20,0.5)',
};

export const Typography = {
  // Display — Playfair Display feel via system serif
  display: {
    fontFamily: 'Lora_700Bold',
    letterSpacing: -0.5,
  },
  // Heading
  heading: {
    fontFamily: 'Lora_600SemiBold',
    letterSpacing: -0.3,
  },
  // Body
  body: {
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
  bodyMedium: {
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.1,
  },
  bodySemiBold: {
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.05,
  },
  // Mono
  mono: {
    fontFamily: 'JetBrainsMono_400Regular',
    letterSpacing: 0.5,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
};
