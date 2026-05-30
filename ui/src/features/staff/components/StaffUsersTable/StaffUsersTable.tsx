import {
  ActionIcon,
  Badge,
  Center,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { Pencil } from 'lucide-react';
import type { UserRole } from '../../../auth';
import { useI18n, type TranslationKey } from '../../../../i18n';
import type { StaffUser } from '../../types';

type StaffUsersTableProps = {
  isLoading: boolean;
  onEdit(staffUser: StaffUser): void;
  users: StaffUser[];
};

const roleLabelKeys: Record<UserRole, TranslationKey> = {
  admin: 'common.roles.admin',
  housekeeping: 'common.roles.housekeeping',
  management: 'common.roles.management',
  reception: 'common.roles.reception',
};

function StaffUsersTable({
  isLoading,
  onEdit,
  users,
}: StaffUsersTableProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <Paper p="xl" withBorder>
        <Center mih={160}>
          <Stack align="center" gap="sm">
            <Loader size="sm" />
            <Text c="dimmed">{t('staffSettingsPage.list.loading')}</Text>
          </Stack>
        </Center>
      </Paper>
    );
  }

  if (users.length === 0) {
    return (
      <Paper p="xl" withBorder>
        <Center mih={160}>
          <Text c="dimmed" ta="center">
            {t('staffSettingsPage.list.empty')}
          </Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper className="staff-table-panel" withBorder>
      <Table.ScrollContainer minWidth={640}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('staffSettingsPage.list.columns.username')}</Table.Th>
              <Table.Th>{t('staffSettingsPage.list.columns.role')}</Table.Th>
              <Table.Th>{t('staffSettingsPage.list.columns.status')}</Table.Th>
              <Table.Th ta="right">
                {t('staffSettingsPage.list.columns.actions')}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Text fw={700}>{user.username}</Text>
                </Table.Td>
                <Table.Td>{t(roleLabelKeys[user.role])}</Table.Td>
                <Table.Td>
                  <Badge
                    color={user.isActive ? 'teal' : 'gray'}
                    variant="light"
                  >
                    {user.isActive
                      ? t('staffSettingsPage.list.status.active')
                      : t('staffSettingsPage.list.status.inactive')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <Tooltip label={t('common.actions.edit')}>
                      <ActionIcon
                        aria-label={t('common.actions.edit')}
                        onClick={() => onEdit(user)}
                        radius="md"
                        variant="subtle"
                      >
                        <Pencil size={18} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

export default StaffUsersTable;
