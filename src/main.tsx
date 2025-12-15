/// <reference types="vite/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HAI3Provider, apiRegistry, store } from '@hai3/uicore';
import { Toaster } from '@hai3/uikit';
import '@hai3/uikit/styles'; // UI Kit styles
import '@/uikit/uikitRegistry'; // Auto-registers UI Kit (components + icons)
import '@/screensets/screensetRegistry'; // Auto-registers screensets (includes API services + mocks + i18n loaders)
import '@/themes/themeRegistry'; // Auto-registers themes
import App from './App';

// Initialize API services (using mock mode by default for dev)
interface LegacyState {
  'layout/app'?: { useMockApi?: boolean };
  uicore?: { app?: { useMockApi?: boolean } };
}
const state = store.getState() as unknown as LegacyState;
const initialUseMockApi = state?.['layout/app']?.useMockApi ?? state?.uicore?.app?.useMockApi ?? true;
apiRegistry.initialize({
  useMockApi: initialUseMockApi,
  mockDelay: 500,
});

/**
 * Render application
 * Bootstrap happens automatically when Layout mounts
 *
 * Flow:
 * 1. App renders → Layout mounts → bootstrap dispatched
 * 2. Components show skeleton loaders (translationsReady = false)
 * 3. User fetched → language set → translations loaded
 * 4. Components re-render with actual text (translationsReady = true)
 * 5. HAI3Provider includes AppRouter for URL-based navigation
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HAI3Provider>
      <App />
      <Toaster />
    </HAI3Provider>
  </StrictMode>
);
