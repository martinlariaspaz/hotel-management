import { useEffect, type ReactNode } from 'react';
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
import { AuthenticatedAppShell } from './features/navigation';
import { RoleProtectedRoute, useAuth, type UserRole } from './features/auth';
import { isSupportedLocale, useI18n } from './i18n';
import {
  DashboardPage,
  LoginPage,
  RoomsPage,
  RoomTypesPage,
  StaffSettingsPage,
} from './pages';
import { getRepositoryApiErrorTranslationKey } from './repositories';

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

function AppToolbarControls() {
  return (
    <Group gap="xs" wrap="nowrap">
      <LocaleControl />
      <ColorSchemeToggle />
    </Group>
  );
}

function PublicAppToolbar() {
  return (
    <div className="app-toolbar">
      <AppToolbarControls />
    </div>
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
  const loginErrorMessage = loginError
    ? t(
        getRepositoryApiErrorTranslationKey(loginError, {
          unauthorized: 'loginPage.form.authError',
        }),
      )
    : null;

  useEffect(() => {
    document.title = t('app.title');
  }, [t]);

  function renderAuthenticatedRoute(
    children: ReactNode,
    allowedRoles?: readonly UserRole[],
  ) {
    if (!isAuthenticated || !user) {
      return <Navigate replace to="/login" />;
    }

    return (
      <AuthenticatedAppShell
        isLoggingOut={isLoggingOut}
        onLogout={() => void logout()}
        utilityControls={<AppToolbarControls />}
        user={user}
      >
        {allowedRoles ? (
          <RoleProtectedRoute allowedRoles={allowedRoles} userRole={user.role}>
            {children}
          </RoleProtectedRoute>
        ) : (
          children
        )}
      </AuthenticatedAppShell>
    );
  }

  if (authStatus === 'checking') {
    return (
      <>
        <PublicAppToolbar />
        <SessionCheckingScreen />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route
          element={
            isAuthenticated ? (
              <Navigate replace to="/dashboard" />
            ) : (
              <>
                <PublicAppToolbar />
                <LoginPage
                  errorMessage={loginErrorMessage}
                  isSubmitting={isLoggingIn}
                  onSubmit={login}
                />
              </>
            )
          }
          path="/login"
        />
        <Route
          element={renderAuthenticatedRoute(<DashboardPage />)}
          path="/dashboard"
        />
        <Route
          element={renderAuthenticatedRoute(<RoomTypesPage />, ['admin'])}
          path="/room-types"
        />
        <Route
          element={renderAuthenticatedRoute(<RoomsPage />, [
            'admin',
            'reception',
            'housekeeping',
          ])}
          path="/rooms"
        />
        <Route
          element={renderAuthenticatedRoute(<StaffSettingsPage />, ['admin'])}
          path="/settings"
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
