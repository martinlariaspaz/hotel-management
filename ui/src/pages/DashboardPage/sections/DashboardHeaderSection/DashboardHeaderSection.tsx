import { Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Hotel } from 'lucide-react';
import { useI18n } from '../../../../i18n';

function DashboardHeaderSection() {
  const { t } = useI18n();

  return (
    <section
      aria-label={t('dashboardPage.header.ariaLabel')}
      className="dashboard-header"
    >
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
    </section>
  );
}

export default DashboardHeaderSection;
