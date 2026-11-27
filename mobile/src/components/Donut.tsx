import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme';
import { AppText } from './AppText';

interface Props {
  segments: { value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
  size?: number;
}

/** Category donut for "Where it went". */
export function Donut({ segments, centerValue, centerLabel, size = 128 }: Props) {
  const theme = useTheme();
  const r = size / 2 - 12;
  const c = size / 2;
  const total = segments.reduce((s, x) => s + x.value, 0);
  const gap = segments.length > 1 ? 0.07 : 0;
  let a0 = -Math.PI / 2;
  const arcs = segments.map((s, i) => {
    const sweep = (s.value / total) * Math.PI * 2;
    const a1 = a0 + Math.max(sweep - gap, 0.01);
    const p = (a: number) => `${(c + r * Math.cos(a)).toFixed(2)} ${(c + r * Math.sin(a)).toFixed(2)}`;
    const d = `M${p(a0)} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}`;
    a0 += sweep;
    return <Path key={i} d={d} stroke={s.color} strokeWidth={16} strokeLinecap="round" fill="none" />;
  });

  return (
    <View style={{ width: size, height: size }} importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size}>
        {segments.length === 1 ? <Circle cx={c} cy={c} r={r} stroke={segments[0].color} strokeWidth={16} fill="none" /> : arcs}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <AppText variant="headlineSmall" style={{ fontFamily: theme.font('700') }}>
          {centerValue}
        </AppText>
        <AppText variant="labelSmall" color="onSurfaceVariant">
          {centerLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
