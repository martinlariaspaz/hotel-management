import type { ReactNode } from 'react';
import {
  Button,
  Center,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../../i18n';
import type { UserRole } from '../../types';

type RoleProtectedRouteProps = {
  allowedRoles: readonly UserRole[];
  children: ReactNode;
  userRole: UserRole;
};

function RoleProtectedRoute({
  allowedRoles,
  children,
  userRole,
}: RoleProtectedRouteProps) {
  const navigate = useNavigate();
  const { t } = useI18n();

  if (allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  return (
    <Center className="access-denied-page">
      <Paper
        aria-live="polite"
        className="access-denied-panel"
        p="xl"
        shadow="xs"
        withBorder
      >
        <Stack align="center" gap="md">
          <ThemeIcon color="red" radius="md" size={52} variant="light">
            <ShieldAlert size={26} />
          </ThemeIcon>
          <Stack align="center" gap={4}>
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              {t('app.accessDenied.eyebrow')}
            </Text>
            <Title order={1} ta="center">
              {t('app.accessDenied.title')}
            </Title>
            <Text c="dimmed" maw={420} ta="center">
              {t('app.accessDenied.description')}
            </Text>
          </Stack>
          <Button
            leftSection={<LayoutDashboard size={18} />}
            onClick={() => navigate('/dashboard')}
            type="button"
            variant="light"
          >
            {t('app.accessDenied.action')}
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}

export default RoleProtectedRoute;
