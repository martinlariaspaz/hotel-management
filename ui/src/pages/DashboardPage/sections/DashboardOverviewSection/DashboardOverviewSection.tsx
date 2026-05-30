import {
  Badge,
  Box,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { BedDouble, CalendarDays, Users, type LucideIcon } from 'lucide-react';
import { useI18n, type TranslationKey } from '../../../../i18n';

type DashboardStat = {
  color: string;
  helperKey: TranslationKey;
  icon: LucideIcon;
  labelKey: TranslationKey;
  valueKey: TranslationKey;
};

const stats: DashboardStat[] = [
  {
    color: 'blue',
    helperKey: 'dashboardPage.overview.stats.reservations.helper',
    icon: CalendarDays,
    labelKey: 'dashboardPage.overview.stats.reservations.label',
    valueKey: 'dashboardPage.overview.stats.reservations.value',
  },
  {
    color: 'teal',
    helperKey: 'dashboardPage.overview.stats.rooms.helper',
    icon: BedDouble,
    labelKey: 'dashboardPage.overview.stats.rooms.label',
    valueKey: 'dashboardPage.overview.stats.rooms.value',
  },
  {
    color: 'violet',
    helperKey: 'dashboardPage.overview.stats.guests.helper',
    icon: Users,
    labelKey: 'dashboardPage.overview.stats.guests.label',
    valueKey: 'dashboardPage.overview.stats.guests.value',
  },
];

function DashboardOverviewSection() {
  const { t } = useI18n();

  return (
    <Box
      aria-labelledby="dashboard-overview-title"
      className="dashboard-section"
      component="section"
    >
      <Group align="flex-end" justify="space-between" mb="md">
        <Stack gap={2}>
          <Text c="dimmed" fw={700} size="xs" tt="uppercase">
            {t('dashboardPage.overview.eyebrow')}
          </Text>
          <Title id="dashboard-overview-title" order={2}>
            {t('dashboardPage.overview.title')}
          </Title>
        </Stack>
        <Badge color="gray" visibleFrom="sm" variant="light">
          {t('dashboardPage.overview.badge')}
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Paper
              className="stat-card"
              component="article"
              key={stat.labelKey}
              p="md"
              withBorder
            >
              <Group align="flex-start" gap="md" wrap="nowrap">
                <ThemeIcon
                  aria-hidden="true"
                  color={stat.color}
                  radius="md"
                  size={46}
                  variant="light"
                >
                  <Icon size={22} />
                </ThemeIcon>
                <Stack gap={6}>
                  <Text c="dimmed" fw={700} size="sm">
                    {t(stat.labelKey)}
                  </Text>
                  <Text className="stat-value" fw={800}>
                    {t(stat.valueKey)}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {t(stat.helperKey)}
                  </Text>
                </Stack>
              </Group>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}

export default DashboardOverviewSection;
