import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      // These inject Base44's own editor/analytics runtime (hot-reload notifier, navigation
      // tracker, analytics beacon, visual-edit-agent) into every page -- all only meaningful
      // when editing inside Base44's own visual editor. We're migrating OFF Base44, so they're
      // disabled: they were crashing pages ("_.filter is not a function") and posting to
      // /api/apps/null/analytics/track/batch (appId is null since there's no Base44 app config
      // anymore).
      hmrNotifier: false,
      navigationNotifier: false,
      analyticsTracker: false,
      visualEditAgent: false
    }),
    react(),
  ]
});