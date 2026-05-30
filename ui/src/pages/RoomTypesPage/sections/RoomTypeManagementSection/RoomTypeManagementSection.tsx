import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Tags } from 'lucide-react';
import {
  RoomTypeForm,
  RoomTypesTable,
  useRoomTypes,
  type CreateRoomTypeInput,
  type RoomType,
  type UpdateRoomTypeInput,
} from '../../../../features/room-types';
import { useI18n } from '../../../../i18n';
import { getRepositoryApiErrorTranslationKey } from '../../../../repositories';

function RoomTypeManagementSection() {
  const { t } = useI18n();
  const {
    createError,
    createRoomType,
    deactivateError,
    deactivateRoomType,
    isCreating,
    isDeactivating,
    isLoading,
    isUpdating,
    listError,
    roomTypes,
    updateError,
    updateRoomType,
  } = useRoomTypes();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(
    null,
  );
  const [deactivatingRoomType, setDeactivatingRoomType] =
    useState<RoomType | null>(null);
  const listErrorMessage = listError
    ? t(getRepositoryApiErrorTranslationKey(listError))
    : null;
  const createErrorMessage = createError
    ? t(getRepositoryApiErrorTranslationKey(createError))
    : null;
  const updateErrorMessage = updateError
    ? t(getRepositoryApiErrorTranslationKey(updateError))
    : null;
  const deactivateErrorMessage = deactivateError
    ? t(getRepositoryApiErrorTranslationKey(deactivateError))
    : null;

  async function handleCreate(input: CreateRoomTypeInput): Promise<void> {
    await createRoomType(input);
    setIsCreateOpen(false);
  }

  async function handleDeactivate(): Promise<void> {
    if (!deactivatingRoomType) {
      return;
    }

    await deactivateRoomType(deactivatingRoomType.id);
    setDeactivatingRoomType(null);
  }

  async function handleUpdate(input: UpdateRoomTypeInput): Promise<void> {
    if (!editingRoomType) {
      return;
    }

    await updateRoomType(editingRoomType.id, input);
    setEditingRoomType(null);
  }

  return (
    <Box
      aria-labelledby="room-type-management-title"
      className="room-type-management-section"
      component="section"
    >
      <Stack gap="lg">
        <Group align="flex-end" justify="space-between">
          <Stack gap={2}>
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              {t('roomTypesPage.management.eyebrow')}
            </Text>
            <Title id="room-type-management-title" order={2}>
              {t('roomTypesPage.management.title')}
            </Title>
          </Stack>
          <Button
            leftSection={<Tags size={18} />}
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            {t('roomTypesPage.management.createAction')}
          </Button>
        </Group>

        {listErrorMessage ? (
          <Alert color="red" variant="light">
            {listErrorMessage}
          </Alert>
        ) : null}

        <RoomTypesTable
          isLoading={isLoading}
          onDeactivate={setDeactivatingRoomType}
          onEdit={setEditingRoomType}
          roomTypes={roomTypes}
        />
      </Stack>

      <Modal
        onClose={() => setIsCreateOpen(false)}
        opened={isCreateOpen}
        title={t('roomTypesPage.form.createTitle')}
      >
        <RoomTypeForm
          errorMessage={createErrorMessage}
          isSubmitting={isCreating}
          key={isCreateOpen ? 'create-open' : 'create-closed'}
          mode="create"
          onCancel={() => setIsCreateOpen(false)}
          onSubmit={(values) =>
            handleCreate(values as CreateRoomTypeInput)
          }
        />
      </Modal>

      <Modal
        onClose={() => setEditingRoomType(null)}
        opened={Boolean(editingRoomType)}
        title={t('roomTypesPage.form.updateTitle')}
      >
        {editingRoomType ? (
          <RoomTypeForm
            errorMessage={updateErrorMessage}
            isSubmitting={isUpdating}
            key={editingRoomType.id}
            mode="update"
            onCancel={() => setEditingRoomType(null)}
            onSubmit={(values) =>
              handleUpdate(values as UpdateRoomTypeInput)
            }
            roomType={editingRoomType}
          />
        ) : null}
      </Modal>

      <Modal
        onClose={() => setDeactivatingRoomType(null)}
        opened={Boolean(deactivatingRoomType)}
        title={t('roomTypesPage.deactivate.title')}
      >
        <Stack gap="md">
          <Text>
            {t('roomTypesPage.deactivate.description').replace(
              '{name}',
              deactivatingRoomType?.name ?? '',
            )}
          </Text>

          {deactivateErrorMessage ? (
            <Alert color="red" variant="light">
              {deactivateErrorMessage}
            </Alert>
          ) : null}

          <Group justify="flex-end">
            <Button
              disabled={isDeactivating}
              onClick={() => setDeactivatingRoomType(null)}
              type="button"
              variant="default"
            >
              {t('common.actions.cancel')}
            </Button>
            <Button
              color="red"
              loading={isDeactivating}
              onClick={() => void handleDeactivate()}
              type="button"
            >
              {t('common.actions.deactivate')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

export default RoomTypeManagementSection;

