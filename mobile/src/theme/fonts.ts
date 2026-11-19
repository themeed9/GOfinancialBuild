import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';

/** Only the weights the design tokens use are bundled. */
export const FONT_FILES = { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold };

type Weight = '400' | '500' | '600' | '700';

const FAMILY: Record<Weight, keyof typeof FONT_FILES> = {
  '400': 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
};

/**
 * Android picks a weight only when each weight is its own font family,
 * so text sets `fontFamily` from this instead of `fontWeight`.
 */
export function fontForWeight(weight: string): string {
  return FAMILY[(weight as Weight) in FAMILY ? (weight as Weight) : '400'];
}
