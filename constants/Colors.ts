// Radix Colors - Dark mode palette
// Colors copied from @radix-ui/colors for React Native compatibility

// Violet scale (primary)
const violet = {
  violet1: '#14121f',
  violet2: '#1b1525',
  violet3: '#291f43',
  violet4: '#33255b',
  violet5: '#3c2e69',
  violet6: '#473876',
  violet7: '#56468b',
  violet8: '#6958ad',
  violet9: '#6e56cf',
  violet10: '#7c66dc',
  violet11: '#9e8cfc',
  violet12: '#e2ddfe',
};

// Blue scale (secondary)
const blue = {
  blue1: '#0d1520',
  blue2: '#111927',
  blue3: '#0d2847',
  blue4: '#003362',
  blue5: '#004074',
  blue6: '#104d87',
  blue7: '#205d9e',
  blue8: '#2870bd',
  blue9: '#0090ff',
  blue10: '#3b9eff',
  blue11: '#70b8ff',
  blue12: '#c2e6ff',
};

// Green scale (success/active)
const green = {
  green1: '#0e1512',
  green2: '#121b17',
  green3: '#132d21',
  green4: '#113b29',
  green5: '#174933',
  green6: '#20573e',
  green7: '#28684a',
  green8: '#2f7c57',
  green9: '#30a46c',
  green10: '#33b074',
  green11: '#3dd68c',
  green12: '#b1f1cb',
};

// Gray scale (neutral)
const gray = {
  gray1: '#111111',
  gray2: '#191919',
  gray3: '#222222',
  gray4: '#2a2a2a',
  gray5: '#313131',
  gray6: '#3a3a3a',
  gray7: '#484848',
  gray8: '#606060',
  gray9: '#6e6e6e',
  gray10: '#7b7b7b',
  gray11: '#b4b4b4',
  gray12: '#eeeeee',
};

// Semantic color tokens
export const Colors = {
  // Background colors
  background: violet.violet1,
  backgroundSubtle: violet.violet2,
  backgroundHover: violet.violet3,
  
  // Card/Surface colors
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceHover: 'rgba(255, 255, 255, 0.08)',
  surfaceActive: 'rgba(158, 140, 252, 0.15)',
  
  // Primary brand colors
  primary: violet.violet9,
  primaryHover: violet.violet10,
  primaryText: violet.violet11,
  
  // Secondary colors
  secondary: blue.blue9,
  secondaryHover: blue.blue10,
  secondaryText: blue.blue11,
  
  // Status colors
  success: green.green9,
  successSubtle: green.green4,
  successText: green.green11,
  
  inactive: gray.gray8,
  inactiveSubtle: gray.gray3,
  inactiveText: gray.gray10,
  
  // Text colors
  text: gray.gray12,
  textSubtle: gray.gray11,
  textMuted: gray.gray9,
  
  // Border colors
  border: 'rgba(255, 255, 255, 0.1)',
  borderHover: 'rgba(255, 255, 255, 0.15)',
  
  // Glass effect colors
  glass: 'rgba(255, 255, 255, 0.03)',
  glassStrong: 'rgba(255, 255, 255, 0.08)',
};

export default Colors;

