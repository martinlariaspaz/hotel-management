import { Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Hotel } from 'lucide-react';
import { useI18n } from '../../../../i18n';

function LoginHeaderSection() {
  const { t } = useI18n();

  return (
    <Group align="center" gap="md" wrap="nowrap">
      <ThemeIcon radius="md" size={54} variant="gradient">
        <Hotel size={28} />
      </ThemeIcon>
      <Stack gap={2}>
        <Text c="dimmed" fw={700} size="xs" tt="uppercase">
          {t('loginPage.header.eyebrow')}
        </Text>
        <Title className="login-title" order={1}>
          {t('loginPage.header.title')}
        </Title>
      </Stack>
    </Group>
  );
}

export default LoginHeaderSection;
