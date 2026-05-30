import { StrictMode } from 'react';
import {
  createTheme,
  localStorageColorSchemeManager,
  MantineProvider,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { RealtimeProvider } from './features/realtime';
import {
  createRepositories,
  RepositoryProvider,
} from './repositories';
import { I18nProvider } from './i18n';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
const colorSchemeManager = localStorageColorSchemeManager({
  key: 'hotel-management.color-scheme',
});
const repositories = createRepositories();
const theme = createTheme({
  defaultRadius: 'md',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '700',
  },
  primaryColor: 'teal',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider
      colorSchemeManager={colorSchemeManager}
      defaultColorScheme="auto"
      theme={theme}
    >
      <I18nProvider>
        <RepositoryProvider repositories={repositories}>
          <QueryClientProvider client={queryClient}>
            <RealtimeProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </RealtimeProvider>
          </QueryClientProvider>
        </RepositoryProvider>
      </I18nProvider>
    </MantineProvider>
  </StrictMode>,
);
