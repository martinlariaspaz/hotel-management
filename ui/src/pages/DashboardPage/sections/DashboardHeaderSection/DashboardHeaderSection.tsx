import { Badge, Button, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Hotel, LogOut, UserRound } from 'lucide-react';
import type { AuthUser } from '../../../../features/auth';
import { useI18n } from '../../../../i18n';

type DashboardHeaderSectionProps = {
  isLoggingOut: boolean;
  onLogout(): void;
  user: AuthUser;
};

function DashboardHeaderSection({
  isLoggingOut,
  onLogout,
  user,
}: DashboardHeaderSectionProps) {
  const { t } = useI18n();

  return (
    <section
      aria-label={t('dashboardPage.header.ariaLabel')}
      className="dashboard-header"
    >
      <Group align="flex-start" gap="lg" justify="space-between">
        <Group align="center" gap="md" wrap="nowrap">
          <ThemeIcon radius="md" size={56} variant="gradient">
            <Hotel size={28} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              {t('dashboardPage.header.eyebrow')}
            </Text>
            <Title className="dashboard-title" order={1}>
              {t('dashboardPage.header.title')}
            </Title>
          </Stack>
        </Group>

        <Group className="dashboard-actions" gap="sm">
          <Badge
            leftSection={<UserRound size={14} />}
            size="lg"
            variant="light"
          >
            {user.username}
          </Badge>
          <Button
            leftSection={<LogOut size={18} />}
            loading={isLoggingOut}
            onClick={onLogout}
            type="button"
            variant="filled"
          >
            {t('dashboardPage.header.logout')}
          </Button>
        </Group>
      </Group>
    </section>
  );
}

export default DashboardHeaderSection;
