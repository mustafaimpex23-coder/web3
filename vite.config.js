import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const fromProject = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(async ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.VITE_PORT || 5173);
  const previewPort = Number(env.VITE_PREVIEW_PORT || 4173);
  const plugins = [];

  // Do not even load the polyfill package in development. It is only needed
  // while producing the browser bundle, and loading it during dependency
  // optimization can prevent the dev page from becoming available.
  if (command === 'build') {
    const { nodePolyfills } = await import('vite-plugin-node-polyfills');
    plugins.push(
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        protocolImports: true,
      }),
    );
  }

  return {
    base: env.VITE_BASE_URL || '/',
    plugins,
    server: {
      host: '0.0.0.0',
      port,
      strictPort: true,
      hmr: {
        clientPort: Number(env.VITE_HMR_CLIENT_PORT || port),
      },
    },
    preview: {
      host: '0.0.0.0',
      port: previewPort,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': fromProject('./src'),
        '@game': fromProject('./src/game'),
        '@web3': fromProject('./src/web3'),
        '@assets': fromProject('./public'),
      },
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      chunkSizeWarningLimit: 800,
    },
  };
});
