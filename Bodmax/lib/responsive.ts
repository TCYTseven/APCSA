import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Device type detection
export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;

// Screen dimensions
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Responsive scaling functions
export const scaleFont = (size: number): number => {
  if (isSmallDevice) return size * 0.9;
  if (isLargeDevice) return size * 1.05;
  return size;
};

export const scaleSpacing = (spacing: number): number => {
  if (isSmallDevice) return spacing * 0.85;
  if (isLargeDevice) return spacing * 1.1;
  return spacing;
};

export const scaleSize = (size: number): number => {
  const scale = Math.min(width / 375, height / 667); // Base on iPhone 8 dimensions
  return size * scale;
};

// Safe area helpers
export const getTabBarHeight = (insetBottom: number): number => {
  const baseHeight = 70;
  if (Platform.OS === 'ios') {
    return baseHeight + insetBottom;
  }
  return baseHeight;
};

export const getHeaderHeight = (insetTop: number): number => {
  const baseHeight = 60;
  return baseHeight + insetTop;
};

// Common responsive dimensions
export const RESPONSIVE_DIMENSIONS = {
  // Padding and margins
  screenPadding: Math.max(20, width * 0.05),
  cardPadding: Math.max(16, width * 0.04),
  smallPadding: Math.max(8, width * 0.02),
  
  // Font sizes
  titleFont: Math.min(28, width * 0.07),
  headingFont: Math.min(24, width * 0.06),
  bodyFont: Math.min(16, width * 0.04),
  captionFont: Math.min(14, width * 0.035),
  smallFont: Math.min(12, width * 0.03),
  
  // Button dimensions
  buttonHeight: Math.max(48, height * 0.06),
  buttonRadius: Math.max(24, height * 0.03),
  
  // Icon sizes
  iconSmall: Math.min(16, width * 0.04),
  iconMedium: Math.min(24, width * 0.06),
  iconLarge: Math.min(32, width * 0.08),
  
  // Card dimensions
  cardBorderRadius: 16,
  cardMaxWidth: Math.min(400, width * 0.9),
};

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: 360,  // Small phones
  sm: 414,  // Standard phones
  md: 768,  // Tablets
  lg: 1024, // Large tablets
  xl: 1280, // Desktop
};

// Device type checks
export const isTablet = width >= BREAKPOINTS.md;
export const isDesktop = width >= BREAKPOINTS.xl;
export const isMobile = width < BREAKPOINTS.md;

// Utility function to get responsive value based on screen size
export const getResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default: T;
}): T => {
  if (width >= BREAKPOINTS.xl && values.xl !== undefined) return values.xl;
  if (width >= BREAKPOINTS.lg && values.lg !== undefined) return values.lg;
  if (width >= BREAKPOINTS.md && values.md !== undefined) return values.md;
  if (width >= BREAKPOINTS.sm && values.sm !== undefined) return values.sm;
  if (width >= BREAKPOINTS.xs && values.xs !== undefined) return values.xs;
  return values.default;
};

// Typography scale
export const getTypographyScale = () => ({
  h1: getResponsiveValue({
    xs: 24,
    sm: 28,
    md: 32,
    lg: 36,
    default: 24,
  }),
  h2: getResponsiveValue({
    xs: 20,
    sm: 24,
    md: 28,
    lg: 32,
    default: 20,
  }),
  h3: getResponsiveValue({
    xs: 18,
    sm: 20,
    md: 24,
    lg: 28,
    default: 18,
  }),
  body: getResponsiveValue({
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    default: 14,
  }),
  caption: getResponsiveValue({
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    default: 12,
  }),
});

// Spacing scale
export const getSpacingScale = () => ({
  xs: getResponsiveValue({
    xs: 4,
    sm: 6,
    md: 8,
    default: 4,
  }),
  sm: getResponsiveValue({
    xs: 8,
    sm: 12,
    md: 16,
    default: 8,
  }),
  md: getResponsiveValue({
    xs: 16,
    sm: 20,
    md: 24,
    default: 16,
  }),
  lg: getResponsiveValue({
    xs: 24,
    sm: 32,
    md: 40,
    default: 24,
  }),
  xl: getResponsiveValue({
    xs: 32,
    sm: 48,
    md: 64,
    default: 32,
  }),
}); 