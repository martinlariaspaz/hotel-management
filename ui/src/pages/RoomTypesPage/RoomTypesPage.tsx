import { Container, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Tags } from 'lucide-react';
import { useI18n } from '../../i18n';
import { RoomTypeManagementSection } from './sections';

function RoomTypesPage() {
  const { t } = useI18n();

  return (
    <div className="room-types-page">
      <Container className="room-types-container" size="xl">
        <Stack gap="xl">
          <section
            aria-label={t('roomTypesPage.header.ariaLabel')}
            className="room-types-header"
          >
            <Group align="center" gap="md" wrap="nowrap">
              <ThemeIcon radius="md" size={56} variant="gradient">
                <Tags size={28} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                  {t('roomTypesPage.header.eyebrow')}
                </Text>
                <Title className="room-types-title" order={1}>
                  {t('roomTypesPage.header.title')}
                </Title>
              </Stack>
            </Group>
          </section>

          <RoomTypeManagementSection />
        </Stack>
      </Container>
    </div>
  );
}

export default RoomTypesPage;

