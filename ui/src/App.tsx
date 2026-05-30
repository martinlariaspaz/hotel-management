import { useEffect } from 'react';
import {
  ActionIcon,
  Center,
  Group,
  Loader,
  Paper,
  SegmentedControl,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { Hotel, Moon, Sun } from 'lucide-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './features/auth';
import { isSupportedLocale, useI18n } from './i18n';
import { DashboardPage, LoginPage } from './pages';

function ColorSchemeToggle() {
  const { t } = useI18n();
  const { toggleColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: false,
  });
  const ToggleIcon = computedColorScheme === 'dark' ? Sun : Moon;
  const label =
    computedColorScheme === 'dark'
      ? t('common.colorScheme.useLight')
      : t('common.colorScheme.useDark');

  return (
    <Tooltip label={label} position="left">
      <ActionIcon
        aria-label={label}
        onClick={toggleColorScheme}
        radius="md"
        size="lg"
        variant="default"
      >
        <ToggleIcon size={18} />
      </ActionIcon>
    </Tooltip>
  );
}

function LocaleControl() {
  const { locale, setLocale, t } = useI18n();

  return (
    <SegmentedControl
      aria-label={t('common.language.ariaLabel')}
      data={[
        { label: t('common.language.englishShort'), value: 'en' },
        { label: t('common.language.spanishShort'), value: 'es-AR' },
      ]}
      onChange={(value) => {
        if (isSupportedLocale(value)) {
          setLocale(value);
        }
      }}
      radius="md"
      size="xs"
      value={locale}
    />
  );
}

function AppToolbar() {
  return (
    <Group className="app-toolbar" gap="xs" wrap="nowrap">
      <LocaleControl />
      <ColorSchemeToggle />
    </Group>
  );
}

function SessionCheckingScreen() {
  const { t } = useI18n();

  return (
    <Center className="login-page" component="main">
      <Paper className="login-panel" p="xl" shadow="md" withBorder>
        <Stack align="center" gap="md">
          <ThemeIcon radius="md" size={52} variant="light">
            <Hotel size={26} />
          </ThemeIcon>
          <Stack align="center" gap={4}>
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              {t('app.sessionChecking.eyebrow')}
            </Text>
            <Title order={1} ta="center">
              {t('app.sessionChecking.title')}
            </Title>
          </Stack>
          <Loader size="sm" />
        </Stack>
      </Paper>
    </Center>
  );
}

function App() {
  const { t } = useI18n();
  const {
    authStatus,
    user,
    login,
    logout,
    loginError,
    isLoggingIn,
    isLoggingOut,
  } = useAuth();
  const isAuthenticated = authStatus === 'authenticated' && Boolean(user);

  useEffect(() => {
    document.title = t('app.title');
  }, [t]);

  if (authStatus === 'checking') {
    return (
      <>
        <AppToolbar />
        <SessionCheckingScreen />
      </>
    );
  }

  return (
    <>
      <AppToolbar />
      <Routes>
        <Route
          element={
            isAuthenticated ? (
              <Navigate replace to="/dashboard" />
            ) : (
              <LoginPage
                hasError={Boolean(loginError)}
                isSubmitting={isLoggingIn}
                onSubmit={login}
              />
            )
          }
          path="/login"
        />
        <Route
          element={
            isAuthenticated && user ? (
              <DashboardPage
                isLoggingOut={isLoggingOut}
                onLogout={() => void logout()}
                user={user}
              />
            ) : (
              <Navigate replace to="/login" />
            )
          }
          path="/dashboard"
        />
        <Route
          element={
            <Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />
          }
          path="/"
        />
        <Route
          element={
            <Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />
          }
          path="*"
        />
      </Routes>
    </>
  );
}

export default App;
