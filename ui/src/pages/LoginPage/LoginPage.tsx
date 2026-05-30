import {
  Center,
  Paper,
  Stack,
} from '@mantine/core';
import {
  LoginForm,
  type LoginCredentials,
} from '../../features/auth';
import { useI18n } from '../../i18n';
import { LoginHeaderSection } from './sections';

type LoginPageProps = {
  hasError: boolean;
  isSubmitting: boolean;
  onSubmit(credentials: LoginCredentials): Promise<void>;
};

function LoginPage({
  hasError,
  isSubmitting,
  onSubmit,
}: LoginPageProps) {
  const { t } = useI18n();

  return (
    <Center className="login-page" component="main">
      <Paper
        aria-label={t('loginPage.header.ariaLabel')}
        className="login-panel"
        component="section"
        p={{ base: 'lg', sm: 'xl' }}
        shadow="md"
        withBorder
      >
        <Stack gap="xl">
          <LoginHeaderSection />
          <LoginForm
            hasError={hasError}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </Stack>
      </Paper>
    </Center>
  );
}

export default LoginPage;
