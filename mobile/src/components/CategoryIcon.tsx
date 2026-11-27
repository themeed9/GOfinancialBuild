import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { Category } from '@/core/types';

interface Props {
  category: Category;
  size?: number;
  /** 'circle' on rows, 'square' in Insight lists */
  shape?: 'circle' | 'square';
}

/** Category glyph on a soft tint of its colour. */
export function CategoryIcon({ category, size = 32, shape = 'circle' }: Props) {
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: shape === 'circle' ? size / 2 : size / 3,
        backgroundColor: `${category.color}24`,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
        <Path d={category.iconPath} fill={category.color} />
      </Svg>
    </View>
  );
}
