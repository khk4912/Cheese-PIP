import { version } from './package.json'
import { defineConfig } from 'wxt'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  outDir: 'dist',
  zip: {
    artifactTemplate: 'Cheese-PIP-v{{version}}-{{browser}}.zip',
    exclude: ['.DS_Store']
  },
  manifest: {
    name: 'Cheese-PIP',
    description: '치지직에 녹화, 스크린샷 등 다양한 기능을 추가합니다.',
    action: {
      default_title: 'Cheese-PIP'
    },
    permissions: ['storage', 'downloads'],
    web_accessible_resources: [
      {
        resources: ['src/*', 'pages/*', 'chunks/*', 'assets/*', 'ffmpeg/*', 'monkeypatch/*', '*.html'],
        matches: ['<all_urls>']
      }
    ],
    content_security_policy: {
      extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
      sandbox: "sandbox allow-scripts allow-forms allow-popups allow-modals; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; child-src 'self';"
    },
    browser_specific_settings: {
      gecko: {
        id: 'chzzk_pip@kosame.dev'
      }
    }
  },

  vite: () =>
    ({
      define: {
        'import.meta.env.VITE_APP_VERSION': JSON.stringify(version)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@/entrypoints': path.resolve(__dirname, 'src/entrypoints'),
          '@/components': path.resolve(__dirname, 'src/components'),
          '@/utils': path.resolve(__dirname, 'src/utils'),
          '@/types': path.resolve(__dirname, 'src/types'),
          '@/assets': path.resolve(__dirname, 'src/assets'),
        }
      },
      plugins: [svgr()],
      css: {
        modules: {
          localsConvention: 'camelCase',
        }
      },
      optimizeDeps: {
        exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
      },
    }),

  imports: {
    eslintrc: {
      enabled: 9
    }
  }
})
