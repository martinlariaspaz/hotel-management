import { Container, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { BedDouble } from 'lucide-react';
import { useI18n } from '../../i18n';
import { RoomManagementSection } from './sections';

function RoomsPage() {
  const { t } = useI18n();

  return (
    <div className="rooms-page">
      <Container className="rooms-container" size="xl">
        <Stack gap="xl">
          <section
            aria-label={t('roomsPage.header.ariaLabel')}
            className="rooms-header"
          >
            <Group align="center" gap="md" wrap="nowrap">
              <ThemeIcon radius="md" size={56} variant="gradient">
                <BedDouble size={28} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                  {t('roomsPage.header.eyebrow')}
                </Text>
                <Title className="rooms-title" order={1}>
                  {t('roomsPage.header.title')}
                </Title>
              </Stack>
            </Group>
          </section>

          <RoomManagementSection />
        </Stack>
      </Container>
    </div>
  );
}

export default RoomsPage;

