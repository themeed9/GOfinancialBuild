import { View } from 'react-native';

import { displayAmountInput } from '@/core/keypad';
import type { AmountParseResult } from '@/core/money';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

type ParseError = Extract<AmountParseResult, { ok: false }>['error'];

export const AMOUNT_ERRORS: Record<ParseError, string> = {
  empty: 'Enter an amount first',
  zero: 'The amount must be more than zero',
  invalid: 'That amount is not valid',
  'too-many-decimals': 'Too many decimal places for this currency',
  'too-large': 'That amount is too large',
};

interface Props {
  text: string;
  currency: string;
  locale: string;
  /** Shown under the amount: a hint, or an error when `isError` */
  message: string;
  isError: boolean;
}

/** The typed amount, large, with a hint or error below it. */
export function AmountEntry({ text, currency, locale, message, isError }: Props) {
  const theme = useTheme();
  const display = displayAmountInput(text, currency, locale);

  return (
    <View style={{ alignItems: 'center', paddingVertical: theme.spacing.md }}>
      <AppText
        accessibilityLabel={`Amount ${display}`}
        accessibilityLiveRegion="polite"
        maxFontSizeMultiplier={1.5}
        adjustsFontSizeToFit
        numberOfLines={1}
        style={{
          fontFamily: theme.font('700'),
          fontSize: 48,
          lineHeight: 58,
          color: text === '' ? theme.colors.outline : theme.colors.primary,
        }}>
        {display}
      </AppText>
      <AppText
        variant="bodyMedium"
        color={isError ? 'error' : 'onSurfaceVariant'}
        accessibilityLiveRegion={isError ? 'assertive' : 'none'}
        accessibilityRole={isError ? 'alert' : undefined}
        style={{ marginTop: theme.spacing.xxs, textAlign: 'center' }}>
        {message}
      </AppText>
    </View>
  );
}
