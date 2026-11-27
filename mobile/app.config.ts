import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Extends app.json. EXPO_BASE_URL is set only for the GitHub Pages web
 * preview (served under /GOfinancialBuild/); phone builds ignore it.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
