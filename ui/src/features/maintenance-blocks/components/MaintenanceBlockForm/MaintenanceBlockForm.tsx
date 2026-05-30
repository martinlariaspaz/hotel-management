import { useMemo } from 'react';
import {
  Alert,
  Button,
  Group,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';
import { Save, Wrench } from 'lucide-react';
import {
  Controller,
  useForm,
  type RegisterOptions,
  type SubmitHandler,
  type UseFormGetValues,
} from 'react-hook-form';
import { useI18n, type TranslationKey } from '../../../../i18n';
import {
  isDateOnlyValue,
  isMaintenanceBlockDateRangeValid,
} from '../../business';
import type { CreateMaintenanceBlockInput } from '../../repositories';

export type MaintenanceBlockRoomOption = {
  id: string;
  label: string;
};

type MaintenanceBlockFormProps = {
  defaultRoomId?: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  lockRoom?: boolean;
  onCancel(): void;
  onSubmit(values: CreateMaintenanceBlockInput): Promise<void>;
  roomOptions: readonly MaintenanceBlockRoomOption[];
};

type MaintenanceBlockFormValues = {
  endDate: string;
  reason: string;
  roomId: string;
  startDate: string;
};

type MaintenanceBlockFieldName = keyof MaintenanceBlockFormValues;
type MaintenanceBlockFieldType = 'date' | 'select' | 'textarea';
type MaintenanceBlockValidationResult = boolean | Promise<boolean>;

type MaintenanceBlockFieldValidation = {
  messageKey: TranslationKey;
  name: string;
  validate(
    value: MaintenanceBlockFormValues[MaintenanceBlockFieldName],
    values: MaintenanceBlockFormValues,
  ): MaintenanceBlockValidationResult;
};

type MaintenanceBlockFieldMetadata = {
  labelKey: TranslationKey;
  name: MaintenanceBlockFieldName;
  placeholderKey: TranslationKey;
  type: MaintenanceBlockFieldType;
  validations: readonly MaintenanceBlockFieldValidation[];
};

type MaintenanceBlockFormLayout = readonly (readonly MaintenanceBlockFieldMetadata[])[];

const maintenanceBlockFormLayout = [
  [
    {
      labelKey: 'roomsPage.maintenance.form.fields.room.label',
      name: 'roomId',
      placeholderKey: 'roomsPage.maintenance.form.fields.room.placeholder',
      type: 'select',
      validations: [
        {
          messageKey: 'roomsPage.maintenance.form.fields.room.required',
          name: 'required',
          validate: (value) =>
            typeof value === 'string' && value.trim().length > 0,
        },
      ],
    },
  ],
  [
    {
      labelKey: 'roomsPage.maintenance.form.fields.startDate.label',
      name: 'startDate',
      placeholderKey: 'roomsPage.maintenance.form.fields.startDate.placeholder',
      type: 'date',
      validations: [
        {
          messageKey: 'roomsPage.maintenance.form.fields.startDate.required',
          name: 'required',
          validate: (value) =>
            typeof value === 'string' && value.trim().length > 0,
        },
        {
          messageKey: 'roomsPage.maintenance.form.fields.startDate.date',
          name: 'date',
          validate: (value) => typeof value === 'string' && isDateOnlyValue(value),
        },
      ],
    },
    {
      labelKey: 'roomsPage.maintenance.form.fields.endDate.label',
      name: 'endDate',
      placeholderKey: 'roomsPage.maintenance.form.fields.endDate.placeholder',
      type: 'date',
      validations: [
        {
          messageKey: 'roomsPage.maintenance.form.fields.endDate.required',
          name: 'required',
          validate: (value) =>
            typeof value === 'string' && value.trim().length > 0,
        },
        {
          messageKey: 'roomsPage.maintenance.form.fields.endDate.date',
          name: 'date',
          validate: (value) => typeof value === 'string' && isDateOnlyValue(value),
        },
        {
          messageKey: 'roomsPage.maintenance.form.fields.endDate.afterStart',
          name: 'afterStart',
          validate: (value, values) =>
            typeof value === 'string' &&
            isMaintenanceBlockDateRangeValid(values.startDate, value),
        },
      ],
    },
  ],
  [
    {
      labelKey: 'roomsPage.maintenance.form.fields.reason.label',
      name: 'reason',
      placeholderKey: 'roomsPage.maintenance.form.fields.reason.placeholder',
      type: 'textarea',
      validations: [
        {
          messageKey: 'roomsPage.maintenance.form.fields.reason.required',
          name: 'required',
          validate: (value) =>
            typeof value === 'string' && value.trim().length > 0,
        },
      ],
    },
  ],
] as const satisfies MaintenanceBlockFormLayout;

function createRegisterOptions(
  field: MaintenanceBlockFieldMetadata,
  translate: (key: TranslationKey) => string,
  getValues: UseFormGetValues<MaintenanceBlockFormValues>,
): RegisterOptions<MaintenanceBlockFormValues, MaintenanceBlockFieldName> {
  const validate = field.validations.reduce<
    Record<
      string,
      (
        value: MaintenanceBlockFormValues[MaintenanceBlockFieldName],
      ) => Promise<boolean | string>
    >
  >((rules, validation) => {
    return {
      ...rules,
      [validation.name]: async (value) => {
        const isValid = await validation.validate(value, getValues());
        return isValid || translate(validation.messageKey);
      },
    };
  }, {});

  return {
    validate,
  };
}

function MaintenanceBlockForm({
  defaultRoomId,
  errorMessage,
  isSubmitting,
  lockRoom = false,
  onCancel,
  onSubmit,
  roomOptions,
}: MaintenanceBlockFormProps) {
  const { t } = useI18n();
  const roomSelectData = useMemo(
    () =>
      roomOptions.map((room) => ({
        label: room.label,
        value: room.id,
      })),
    [roomOptions],
  );
  const defaultValues = useMemo<MaintenanceBlockFormValues>(
    () => ({
      roomId: defaultRoomId ?? '',
      startDate: '',
      endDate: '',
      reason: '',
    }),
    [defaultRoomId],
  );
  const {
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
    getValues,
    handleSubmit,
    register,
  } = useForm<MaintenanceBlockFormValues>({ defaultValues });
  const submitting = isSubmitting || isFormSubmitting;

  const submitHandler: SubmitHandler<MaintenanceBlockFormValues> = async (
    values,
  ) => {
    const payload: CreateMaintenanceBlockInput = {
      roomId: values.roomId,
      startDate: values.startDate,
      endDate: values.endDate,
      reason: values.reason.trim(),
    };

    await onSubmit(payload).catch(() => undefined);
  };

  return (
    <form onSubmit={(event) => void handleSubmit(submitHandler)(event)}>
      <Stack gap="md">
        {maintenanceBlockFormLayout.map((row) => (
          <SimpleGrid cols={{ base: 1, sm: row.length }} key={row[0].name}>
            {row.map((field) => {
              const fieldError = errors[field.name]?.message;
              const inputProps = {
                disabled: submitting,
                error: fieldError,
                label: t(field.labelKey),
                placeholder: t(field.placeholderKey),
              };

              if (field.type === 'select') {
                return (
                  <Controller
                    control={control}
                    key={field.name}
                    name={field.name}
                    render={({ field: controllerField }) => (
                      <Select
                        {...inputProps}
                        data={roomSelectData}
                        disabled={submitting || lockRoom}
                        onChange={(value) => controllerField.onChange(value ?? '')}
                        value={controllerField.value}
                      />
                    )}
                    rules={createRegisterOptions(field, t, getValues)}
                  />
                );
              }

              if (field.type === 'textarea') {
                return (
                  <Textarea
                    autosize
                    key={field.name}
                    minRows={3}
                    {...inputProps}
                    {...register(field.name, createRegisterOptions(field, t, getValues))}
                  />
                );
              }

              return (
                <TextInput
                  key={field.name}
                  type="date"
                  {...inputProps}
                  {...register(field.name, createRegisterOptions(field, t, getValues))}
                />
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
          <Button
            disabled={submitting}
            onClick={onCancel}
            type="button"
            variant="default"
          >
            {t('common.actions.cancel')}
          </Button>
          <Button
            leftSection={lockRoom ? <Wrench size={18} /> : <Save size={18} />}
            loading={submitting}
            type="submit"
          >
            {t('roomsPage.maintenance.form.createSubmit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default MaintenanceBlockForm;
