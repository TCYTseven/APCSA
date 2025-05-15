/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryPurple = '#9C47FF'; // Neon purple for accents and highlights
const secondaryOrange = '#FF7A00'; // For action items and secondary highlights

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: primaryPurple,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryPurple,
    accent: primaryPurple,
    secondary: secondaryOrange,
    card: 'rgba(0,0,0,0.05)',
    progressGood: '#4CD964', // Green for good progress
    progressMid: '#FFCC00', // Yellow for mid progress
    progressBad: '#FF3B30', // Red for needs improvement
  },
  dark: {
    text: '#ECEDEE',
    background: '#000000', // Pure black background
    tint: primaryPurple,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryPurple,
    accent: primaryPurple,
    secondary: secondaryOrange,
    card: 'rgba(255,255,255,0.1)', // Slightly lighter than background for cards
    progressGood: '#4CD964', // Green for good progress
    progressMid: '#FFCC00', // Yellow for mid progress
    progressBad: '#FF3B30', // Red for needs improvement
  },
};
