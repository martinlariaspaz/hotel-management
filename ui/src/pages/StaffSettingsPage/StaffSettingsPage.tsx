import { Container, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Settings } from 'lucide-react';
import { useI18n } from '../../i18n';
import { StaffManagementSection } from './sections';

function StaffSettingsPage() {
  const { t } = useI18n();

  return (
    <div className="staff-settings-page">
      <Container className="staff-settings-container" size="xl">
        <Stack gap="xl">
          <section
            aria-label={t('staffSettingsPage.header.ariaLabel')}
            className="staff-settings-header"
          >
            <Group align="center" gap="md" wrap="nowrap">
              <ThemeIcon radius="md" size={56} variant="gradient">
                <Settings size={28} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                  {t('staffSettingsPage.header.eyebrow')}
                </Text>
                <Title className="staff-settings-title" order={1}>
                  {t('staffSettingsPage.header.title')}
                </Title>
              </Stack>
            </Group>
          </section>

          <StaffManagementSection />
        </Stack>
      </Container>
    </div>
  );
}

export default StaffSettingsPage;
