import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';

const config: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  // OAuth must preserve the configured loopback host through the callback.
  skipProxyUrlNormalize: true,
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ] }];
  },
};
export default config;
