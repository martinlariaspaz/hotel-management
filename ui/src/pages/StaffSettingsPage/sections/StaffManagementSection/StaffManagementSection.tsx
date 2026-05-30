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
import { UserPlus } from 'lucide-react';
import {
  StaffUserForm,
  StaffUsersTable,
  useStaffUsers,
  type CreateStaffUserInput,
  type UpdateStaffUserInput,
  type StaffUser,
} from '../../../../features/staff';
import { useI18n } from '../../../../i18n';
import { getRepositoryApiErrorTranslationKey } from '../../../../repositories';

function StaffManagementSection() {
  const { t } = useI18n();
  const {
    createError,
    createStaffUser,
    isCreating,
    isLoading,
    isUpdating,
    listError,
    updateError,
    updateStaffUser,
    users,
  } = useStaffUsers();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStaffUser, setEditingStaffUser] = useState<StaffUser | null>(
    null,
  );
  const listErrorMessage = listError
    ? t(getRepositoryApiErrorTranslationKey(listError))
    : null;
  const createErrorMessage = createError
    ? t(getRepositoryApiErrorTranslationKey(createError))
    : null;
  const updateErrorMessage = updateError
    ? t(getRepositoryApiErrorTranslationKey(updateError))
    : null;

  async function handleCreate(input: CreateStaffUserInput): Promise<void> {
    await createStaffUser(input);
    setIsCreateOpen(false);
  }

  async function handleUpdate(input: UpdateStaffUserInput): Promise<void> {
    if (!editingStaffUser) {
      return;
    }

    await updateStaffUser(editingStaffUser.id, input);
    setEditingStaffUser(null);
  }

  return (
    <Box
      aria-labelledby="staff-management-title"
      className="staff-management-section"
      component="section"
    >
      <Stack gap="lg">
        <Group align="flex-end" justify="space-between">
          <Stack gap={2}>
            <Text c="dimmed" fw={700} size="xs" tt="uppercase">
              {t('staffSettingsPage.management.eyebrow')}
            </Text>
            <Title id="staff-management-title" order={2}>
              {t('staffSettingsPage.management.title')}
            </Title>
          </Stack>
          <Button
            leftSection={<UserPlus size={18} />}
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            {t('staffSettingsPage.management.createAction')}
          </Button>
        </Group>

        {listErrorMessage ? (
          <Alert color="red" variant="light">
            {listErrorMessage}
          </Alert>
        ) : null}

        <StaffUsersTable
          isLoading={isLoading}
          onEdit={setEditingStaffUser}
          users={users}
        />
      </Stack>

      <Modal
        onClose={() => setIsCreateOpen(false)}
        opened={isCreateOpen}
        title={t('staffSettingsPage.form.createTitle')}
      >
        <StaffUserForm
          errorMessage={createErrorMessage}
          isSubmitting={isCreating}
          key={isCreateOpen ? 'create-open' : 'create-closed'}
          mode="create"
          onCancel={() => setIsCreateOpen(false)}
          onSubmit={(values) =>
            handleCreate(values as CreateStaffUserInput)
          }
        />
      </Modal>

      <Modal
        onClose={() => setEditingStaffUser(null)}
        opened={Boolean(editingStaffUser)}
        title={t('staffSettingsPage.form.updateTitle')}
      >
        {editingStaffUser ? (
          <StaffUserForm
            errorMessage={updateErrorMessage}
            isSubmitting={isUpdating}
            key={editingStaffUser.id}
            mode="update"
            onCancel={() => setEditingStaffUser(null)}
            onSubmit={(values) =>
              handleUpdate(values as UpdateStaffUserInput)
            }
            staffUser={editingStaffUser}
          />
        ) : null}
      </Modal>
    </Box>
  );
}

export default StaffManagementSection;
