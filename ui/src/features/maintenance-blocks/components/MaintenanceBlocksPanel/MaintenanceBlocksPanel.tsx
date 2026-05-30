import {
  ActionIcon,
  Alert,
  Badge,
  Center,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { CalendarRange, XCircle } from 'lucide-react';
import { useI18n } from '../../../../i18n';
import type { MaintenanceBlock, MaintenanceBlockStatus } from '../../types';

type MaintenanceBlocksPanelProps = {
  blocks: MaintenanceBlock[];
  canCancel: boolean;
  endDate: string;
  errorMessage: string | null;
  isCancelling: boolean;
  isLoading: boolean;
  onCancel(block: MaintenanceBlock): void;
  onEndDateChange(value: string): void;
  onStartDateChange(value: string): void;
  startDate: string;
};

const statusColor: Record<MaintenanceBlockStatus, string> = {
  active: 'orange',
  cancelled: 'gray',
};

function getStatusLabel(
  status: MaintenanceBlockStatus,
  translate: ReturnType<typeof useI18n>['t'],
): string {
  return status === 'active'
    ? translate('roomsPage.maintenance.status.active')
    : translate('roomsPage.maintenance.status.cancelled');
}

function MaintenanceBlocksPanel({
  blocks,
  canCancel,
  endDate,
  errorMessage,
  isCancelling,
  isLoading,
  onCancel,
  onEndDateChange,
  onStartDateChange,
  startDate,
}: MaintenanceBlocksPanelProps) {
  const { t } = useI18n();

  return (
    <Stack gap="md">
      <Paper className="maintenance-filter-panel" p="md" withBorder>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput
            label={t('roomsPage.maintenance.filters.startDate.label')}
            leftSection={<CalendarRange size={16} />}
            onChange={(event) => onStartDateChange(event.currentTarget.value)}
            placeholder={t('roomsPage.maintenance.filters.startDate.placeholder')}
            type="date"
            value={startDate}
          />
          <TextInput
            label={t('roomsPage.maintenance.filters.endDate.label')}
            leftSection={<CalendarRange size={16} />}
            onChange={(event) => onEndDateChange(event.currentTarget.value)}
            placeholder={t('roomsPage.maintenance.filters.endDate.placeholder')}
            type="date"
            value={endDate}
          />
        </SimpleGrid>
      </Paper>

      {errorMessage ? (
        <Alert color="red" variant="light">
          {errorMessage}
        </Alert>
      ) : null}

      {isLoading ? (
        <Paper p="xl" withBorder>
          <Center mih={120}>
            <Stack align="center" gap="sm">
              <Loader size="sm" />
              <Text c="dimmed">{t('roomsPage.maintenance.list.loading')}</Text>
            </Stack>
          </Center>
        </Paper>
      ) : null}

      {!isLoading && blocks.length === 0 ? (
        <Paper p="xl" withBorder>
          <Center mih={120}>
            <Text c="dimmed" ta="center">
              {t('roomsPage.maintenance.list.empty')}
            </Text>
          </Center>
        </Paper>
      ) : null}

      {!isLoading && blocks.length > 0 ? (
        <Paper className="maintenance-blocks-table-panel" withBorder>
          <Table.ScrollContainer minWidth={780}>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('roomsPage.maintenance.list.columns.room')}</Table.Th>
                  <Table.Th>{t('roomsPage.maintenance.list.columns.dates')}</Table.Th>
                  <Table.Th>{t('roomsPage.maintenance.list.columns.reason')}</Table.Th>
                  <Table.Th>{t('roomsPage.maintenance.list.columns.status')}</Table.Th>
                  <Table.Th ta="right">
                    {t('roomsPage.maintenance.list.columns.actions')}
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {blocks.map((block) => (
                  <Table.Tr key={block.id}>
                    <Table.Td>
                      <Text fw={700}>{block.room.roomNumber}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>
                        {t('roomsPage.maintenance.list.dateRange')
                          .replace('{startDate}', block.startDate)
                          .replace('{endDate}', block.endDate)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text lineClamp={2}>{block.reason}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={statusColor[block.status]} variant="light">
                        {getStatusLabel(block.status, t)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group justify="flex-end">
                        {canCancel && block.status === 'active' ? (
                          <Tooltip label={t('roomsPage.maintenance.cancel.action')}>
                            <ActionIcon
                              aria-label={t('roomsPage.maintenance.cancel.action')}
                              disabled={isCancelling}
                              onClick={() => onCancel(block)}
                              radius="md"
                              variant="subtle"
                            >
                              <XCircle size={18} />
                            </ActionIcon>
                          </Tooltip>
                        ) : null}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      ) : null}
    </Stack>
  );
}

export default MaintenanceBlocksPanel;
