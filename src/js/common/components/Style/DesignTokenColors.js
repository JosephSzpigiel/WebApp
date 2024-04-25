const primitiveColorNames = {
  blue50: '#E6F3FF',
  blueUI50: '#E2F2FD',
  blueUI700: '#1073D4',
  blueUI800: '#0E62C2',
  blueUI900: '#0943A3',
  grayUI50: '#EEEEEE',
  grayUI100: '#DADADA',
  grayUI200: '#C5C5C5',
  grayUI300: '#B0B0B0',
  grayUI500: '#848484',
  grayUI600: '#6E6E6E',
  steel200: '#C8D4DF',
};

// These are semanticColorNames
const DesignTokenColors = {
  info50: primitiveColorNames.blueUI50,
  info700: primitiveColorNames.blueUI700,
  info800: primitiveColorNames.blueUI800,
  info900: primitiveColorNames.blueUI900,
  neutralUI50: primitiveColorNames.grayUI50,
  neutralUI100: primitiveColorNames.grayUI100,
  neutralUI200: primitiveColorNames.grayUI200,
  neutralUI300: primitiveColorNames.grayUI300,
  neutralUI500: primitiveColorNames.grayUI500,
  neutralUI600: primitiveColorNames.grayUI600,
  primary50: primitiveColorNames.blue50,
  secondary200: primitiveColorNames.steel200,
};

export default DesignTokenColors;
