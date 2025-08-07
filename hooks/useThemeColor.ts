/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';

export function useThemeColor(
  props: { dark?: string },
  colorName: keyof typeof Colors.dark
) {
  // Always use dark theme
  const colorFromProps = props.dark;
  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors.dark[colorName];
  }
}
