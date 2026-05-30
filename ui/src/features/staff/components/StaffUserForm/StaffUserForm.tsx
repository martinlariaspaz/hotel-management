import { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Group,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  TextInput,
} from '@mantine/core';
import { Save, UserPlus } from 'lucide-react';
import {
  Controller,
  useForm,
  type RegisterOptions,
  type SubmitHandler,
} from 'react-hook-form';
import {
  USER_ROLE_VALUES,
  type UserRole,
} from '../../../auth';
import { useI18n, type TranslationKey } from '../../../../i18n';
import type {
  CreateStaffUserInput,
  UpdateStaffUserInput,
} from '../../repositories';
import type { StaffUser } from '../../types';

type StaffUserFormMode = 'create' | 'update';
type StaffUserFormSubmitValues = CreateStaffUserInput | UpdateStaffUserInput;

type StaffUserFormProps = {
  errorMessage: string | null;
  isSubmitting: boolean;
  mode: StaffUserFormMode;
  onCancel(): void;
  onSubmit(values: StaffUserFormSubmitValues): Promise<void>;
  staffUser?: StaffUser;
};

type StaffUserFormValues = {
  isActive: boolean;
  password: string;
  role: UserRole;
  username: string;
};

type StaffFieldName = keyof StaffUserFormValues;
type StaffFieldType = 'password' | 'role' | 'switch' | 'text';
type StaffValidationResult = boolean | Promise<boolean>;

type StaffFieldValidation = {
  messageKey: TranslationKey;
  name: string;
  validate(value: StaffUserFormValues[StaffFieldName]): StaffValidationResult;
};

type StaffFieldMetadata = {
  autoComplete?: string;
  labelKey: TranslationKey;
  name: StaffFieldName;
  placeholderKey?: TranslationKey;
  type: StaffFieldType;
  validations: readonly StaffFieldValidation[];
};

type StaffFormLayout = readonly (readonly StaffFieldMetadata[])[];

const createStaffFormLayout = [
  [
    {
      autoComplete: 'username',
      labelKey: 'staffSettingsPage.form.fields.username.label',
      name: 'username',
      placeholderKey: 'staffSettingsPage.form.fields.username.placeholder',
      type: 'text',
      validations: [
        {
          messageKey: 'staffSettingsPage.form.fields.username.required',
          name: 'required',
          validate: (value) => typeof value === 'string' && value.trim().length > 0,
        },
      ],
    },
    {
      labelKey: 'staffSettingsPage.form.fields.role.label',
      name: 'role',
      placeholderKey: 'staffSettingsPage.form.fields.role.placeholder',
      type: 'role',
      validations: [
        {
          messageKey: 'staffSettingsPage.form.fields.role.required',
          name: 'required',
          validate: (value) => typeof value === 'string' && value.length > 0,
        },
      ],
    },
  ],
  [
    {
      autoComplete: 'new-password',
      labelKey: 'staffSettingsPage.form.fields.password.label',
      name: 'password',
      placeholderKey: 'staffSettingsPage.form.fields.password.placeholder',
      type: 'password',
      validations: [
        {
          messageKey: 'staffSettingsPage.form.fields.password.required',
          name: 'required',
          validate: (value) => typeof value === 'string' && value.length > 0,
        },
        {
          messageKey: 'staffSettingsPage.form.fields.password.minLength',
          name: 'minLength',
          validate: (value) => typeof value === 'string' && value.length >= 8,
        },
      ],
    },
    {
      labelKey: 'staffSettingsPage.form.fields.isActive.label',
      name: 'isActive',
      type: 'switch',
      validations: [],
    },
  ],
] as const satisfies StaffFormLayout;

const updateStaffFormLayout = [
  [
    {
      labelKey: 'staffSettingsPage.form.fields.role.label',
      name: 'role',
      placeholderKey: 'staffSettingsPage.form.fields.role.placeholder',
      type: 'role',
      validations: [
        {
          messageKey: 'staffSettingsPage.form.fields.role.required',
          name: 'required',
          validate: (value) => typeof value === 'string' && value.length > 0,
        },
      ],
    },
    {
      labelKey: 'staffSettingsPage.form.fields.isActive.label',
      name: 'isActive',
      type: 'switch',
      validations: [],
    },
  ],
] as const satisfies StaffFormLayout;

const roleLabelKeys: Record<UserRole, TranslationKey> = {
  admin: 'common.roles.admin',
  housekeeping: 'common.roles.housekeeping',
  management: 'common.roles.management',
  reception: 'common.roles.reception',
};

function createRegisterOptions(
  field: StaffFieldMetadata,
  translate: (key: TranslationKey) => string,
): RegisterOptions<StaffUserFormValues, StaffFieldName> {
  const validate = field.validations.reduce<
    Record<string, (value: StaffUserFormValues[StaffFieldName]) => Promise<boolean | string>>
  >((rules, validation) => {
    return {
      ...rules,
      [validation.name]: async (value) => {
        const isValid = await validation.validate(value);
        return isValid || translate(validation.messageKey);
      },
    };
  }, {});

  return { validate };
}

function StaffUserForm({
  errorMessage,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
  staffUser,
}: StaffUserFormProps) {
  const { t } = useI18n();
  const defaultValues = useMemo<StaffUserFormValues>(
    () => ({
      username: staffUser?.username ?? '',
      password: '',
      role: staffUser?.role ?? 'reception',
      isActive: staffUser?.isActive ?? true,
    }),
    [staffUser],
  );
  const {
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<StaffUserFormValues>({ defaultValues });
  const submitting = isSubmitting || isFormSubmitting;
  const layout =
    mode === 'create' ? createStaffFormLayout : updateStaffFormLayout;
  const roleOptions = USER_ROLE_VALUES.map((role) => ({
    label: t(roleLabelKeys[role]),
    value: role,
  }));

  const submitHandler: SubmitHandler<StaffUserFormValues> = async (values) => {
    const payload =
      mode === 'create'
        ? {
            username: values.username.trim(),
            password: values.password,
            role: values.role,
            isActive: values.isActive,
          }
        : {
            role: values.role,
            isActive: values.isActive,
          };

    await onSubmit(payload).catch(() => undefined);
  };

  return (
    <form onSubmit={(event) => void handleSubmit(submitHandler)(event)}>
      <Stack gap="md">
        {layout.map((row) => (
          <SimpleGrid cols={{ base: 1, sm: row.length }} key={row[0].name}>
            {row.map((field) => {
              const fieldError = errors[field.name]?.message;

              if (field.type === 'role') {
                return (
                  <Controller
                    control={control}
                    key={field.name}
                    name="role"
                    render={({ field: controllerField }) => (
                      <Select
                        allowDeselect={false}
                        data={roleOptions}
                        disabled={submitting}
                        error={fieldError}
                        label={t(field.labelKey)}
                        onBlur={controllerField.onBlur}
                        onChange={(value) =>
                          controllerField.onChange(
                            (value ?? controllerField.value) as UserRole,
                          )
                        }
                        placeholder={
                          field.placeholderKey
                            ? t(field.placeholderKey)
                            : undefined
                        }
                        value={controllerField.value}
                      />
                    )}
                    rules={
                      createRegisterOptions(field, t) as RegisterOptions<
                        StaffUserFormValues,
                        'role'
                      >
                    }
                  />
                );
              }

              if (field.type === 'switch') {
                return (
                  <Controller
                    control={control}
                    key={field.name}
                    name="isActive"
                    render={({ field: controllerField }) => (
                      <Box className="staff-user-form-switch-field">
                        <Switch
                          checked={controllerField.value}
                          disabled={submitting}
                          label={t(field.labelKey)}
                          onBlur={controllerField.onBlur}
                          onChange={(event) =>
                            controllerField.onChange(event.currentTarget.checked)
                          }
                        />
                      </Box>
                    )}
                  />
                );
              }

              const inputProps = {
                autoComplete: field.autoComplete,
                disabled: submitting,
                error: fieldError,
                label: t(field.labelKey),
                placeholder: field.placeholderKey
                  ? t(field.placeholderKey)
                  : undefined,
                ...register(
                  field.name as 'password' | 'username',
                  createRegisterOptions(field, t) as RegisterOptions<
                    StaffUserFormValues,
                    'password' | 'username'
                  >,
                ),
              };

              return field.type === 'password' ? (
                <PasswordInput key={field.name} {...inputProps} />
              ) : (
                <TextInput key={field.name} {...inputProps} />
              );
            })}
          </SimpleGrid>
        ))}

        {errorMessage ? (
          <Alert color="red" variant="light">
            {errorMessage}
          </Alert>
        ) : null}

        <Group justify="flex-end">
          <Button disabled={submitting} onClick={onCancel} type="button" variant="default">
            {t('common.actions.cancel')}
          </Button>
          <Button
            leftSection={
              mode === 'create' ? <UserPlus size={18} /> : <Save size={18} />
            }
            loading={submitting}
            type="submit"
          >
            {mode === 'create'
              ? t('staffSettingsPage.form.createSubmit')
              : t('staffSettingsPage.form.updateSubmit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default StaffUserForm;
