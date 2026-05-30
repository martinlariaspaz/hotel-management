import {
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { CircleCheck, CircleX, RefreshCcw } from 'lucide-react';
import { useHealthStatus } from '../../../../features/health';
import { useI18n, type TranslationKey } from '../../../../i18n';
import type { HealthState } from '../../../../features/health';

const healthLabelKeys: Record<HealthState, TranslationKey> = {
  checking: 'dashboardPage.apiStatus.health.checking',
  offline: 'dashboardPage.apiStatus.health.offline',
  online: 'dashboardPage.apiStatus.health.online',
};

const statusLabelKeys: Record<HealthState, TranslationKey> = {
  checking: 'common.status.checking',
  offline: 'common.status.offline',
  online: 'common.status.online',
};

function ApiStatusSection() {
  const { locale, t } = useI18n();
  const {
    healthState,
    isRefreshing,
    lastCheckedAt,
    refresh,
  } = useHealthStatus();

  const StatusIcon =
    healthState === 'online' || healthState === 'checking'
      ? CircleCheck
      : CircleX;
  const statusColor =
    healthState === 'online'
      ? 'teal'
      : healthState === 'checking'
        ? 'yellow'
        : 'red';
  const formattedLastChecked = lastCheckedAt
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(lastCheckedAt))
    : t('dashboardPage.apiStatus.lastCheckedFallback');

  return (
    <Paper
      className="api-card"
      component="aside"
      p="lg"
      shadow="xs"
      withBorder
    >
      <Stack gap="lg">
        <Group align="flex-start" justify="space-between">
          <Stack gap={2}>
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              {t('dashboardPage.apiStatus.eyebrow')}
            </Text>
            <Title order={2}>{t('dashboardPage.apiStatus.title')}</Title>
          </Stack>
          <Badge color={statusColor} variant="light">
            {t(statusLabelKeys[healthState])}
          </Badge>
        </Group>

        <Group className="api-status" gap="md" wrap="nowrap">
          <ThemeIcon color={statusColor} radius="xl" size={42} variant="light">
            <StatusIcon size={20} />
          </ThemeIcon>
          <Stack gap={2}>
            <Text fw={700}>{t(healthLabelKeys[healthState])}</Text>
            <Text c="dimmed" size="sm">
              {formattedLastChecked}
            </Text>
          </Stack>
        </Group>

        <Button
          fullWidth
          leftSection={<RefreshCcw size={18} />}
          loading={isRefreshing}
          onClick={refresh}
          type="button"
          variant="light"
        >
          {t('dashboardPage.apiStatus.refresh')}
        </Button>
      </Stack>
    </Paper>
  );
}

export default ApiStatusSection;
