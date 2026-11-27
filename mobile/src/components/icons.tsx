import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  color: string;
  size?: number;
}

const stroke = (color: string) => ({
  stroke: color,
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
});

export function PlusIcon({ color, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" {...stroke(color)} strokeWidth={2.2} />
    </Svg>
  );
}

export function PencilIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M16.6 3.6a2.1 2.1 0 0 1 3 3L7.5 18.7 3.5 20l1.3-4z M14.5 5.7l3 3" {...stroke(color)} />
    </Svg>
  );
}

export function DashboardIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="3" width="18" height="18" rx="2" {...stroke(color)} />
      <Path d="M3 9h18M3 15h18M9 3v18M15 3v18" {...stroke(color)} />
    </Svg>
  );
}

export function HistoryIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="9" {...stroke(color)} />
      <Path d="M12 7v5l3 2" {...stroke(color)} />
    </Svg>
  );
}

export function InsightIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 3v17h17" {...stroke(color)} />
      <Path d="M7 16l4-5 3 3 6-8" {...stroke(color)} />
    </Svg>
  );
}

export function CloseIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" {...stroke(color)} strokeWidth={2} />
    </Svg>
  );
}

export function BackspaceIcon({ color, size = 26 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7z M12 9l6 6M18 9l-6 6" {...stroke(color)} />
    </Svg>
  );
}

/** GOfinancial mark (from Images/logoAlt.svg). */
export function LogoMark({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={(size * 97) / 125} viewBox="0 0 125 97">
      <Path
        fill={color}
        d="M75.5206 9.54852C49.0478 29.0377 28.2187 27.6843 21.1133 24.5714L10.1506 54.6175C27.3661 64.0372 53.1892 49.0684 63.9489 40.4066C86.8487 25.9521 106.649 30.1883 113.687 34.1132C114.986 29.7281 121.198 11.9849 124.853 4.47322C105.363 -5.5962 83.8441 3.66117 75.5206 9.54852Z"
      />
      <Path
        fill={color}
        d="M65.37 48.1209C38.8972 67.61 18.0681 66.2566 10.9627 63.1438L0 93.1898C17.2154 102.61 43.0386 87.6408 53.7983 78.9789C76.6981 64.5245 96.4985 68.7607 103.536 72.6856C104.836 68.3005 111.048 50.5572 114.702 43.0456C95.2128 32.9761 73.6935 42.2335 65.37 48.1209Z"
      />
    </Svg>
  );
}

export function EyeIcon({ color, size = 22, crossed = false }: IconProps & { crossed?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" {...stroke(color)} />
      <Circle cx="12" cy="12" r="3" {...stroke(color)} />
      {crossed && <Path d="M4 4l16 16" {...stroke(color)} />}
    </Svg>
  );
}

export function BackIcon({ color, size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" {...stroke(color)} strokeWidth={2.2} />
    </Svg>
  );
}

export function PersonIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={color} />
    </Svg>
  );
}

export function ChevronIcon({ color, size = 18, direction = 'right' }: IconProps & { direction?: 'left' | 'right' | 'down' }) {
  const d = direction === 'left' ? 'M15 6l-6 6 6 6' : direction === 'down' ? 'M6 9l6 6 6-6' : 'M9 6l6 6-6 6';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={d} {...stroke(color)} strokeWidth={2.2} />
    </Svg>
  );
}

export function FlameIcon({ color, size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M19.48 12.35c-1.57-4.08-7.16-4.3-5.81-10.23.1-.44-.37-.78-.75-.55C9.29 3.71 6.68 8 8.87 13.62c.18.46-.36.89-.75.59-1.81-1.37-2-3.34-1.84-4.75.06-.52-.62-.77-.91-.34C4.69 10.16 4 11.84 4 14.37c.38 5.6 5.11 7.32 6.81 7.54 2.43.31 5.06-.14 6.95-1.87 2.08-1.93 2.84-5.01 1.72-7.69z"
      />
    </Svg>
  );
}

/** Material-style filled icon from 24×24 path data (settings rows). */
export function PathIcon({ color, size = 22, d }: IconProps & { d: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={d} fill={color} />
    </Svg>
  );
}
