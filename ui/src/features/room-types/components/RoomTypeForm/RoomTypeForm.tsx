import { useMemo } from 'react';
import {
  Alert,
  Button,
  Group,
  SimpleGrid,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';
import { Save, Tags } from 'lucide-react';
import {
  useForm,
  type RegisterOptions,
  type SubmitHandler,
} from 'react-hook-form';
import { useI18n, type TranslationKey } from '../../../../i18n';
import type {
  CreateRoomTypeInput,
  UpdateRoomTypeInput,
} from '../../repositories';
import type { RoomType } from '../../types';

type RoomTypeFormMode = 'create' | 'update';
type RoomTypeFormSubmitValues = CreateRoomTypeInput | UpdateRoomTypeInput;

type RoomTypeFormProps = {
  errorMessage: string | null;
  isSubmitting: boolean;
  mode: RoomTypeFormMode;
  onCancel(): void;
  onSubmit(values: RoomTypeFormSubmitValues): Promise<void>;
  roomType?: RoomType;
};

type RoomTypeFormValues = {
  amenities: string;
  baseNightlyRate: number;
  capacity: number;
  name: string;
  photoUrls: string;
};

type RoomTypeFieldName = keyof RoomTypeFormValues;
type RoomTypeFieldType = 'number' | 'text' | 'textarea';
type RoomTypeValidationResult = boolean | Promise<boolean>;

type RoomTypeFieldValidation = {
  messageKey: TranslationKey;
  name: string;
  validate(
    value: RoomTypeFormValues[RoomTypeFieldName],
  ): RoomTypeValidationResult;
};

type RoomTypeFieldMetadata = {
  labelKey: TranslationKey;
  name: RoomTypeFieldName;
  placeholderKey: TranslationKey;
  type: RoomTypeFieldType;
  validations: readonly RoomTypeFieldValidation[];
};

type RoomTypeFormLayout = readonly (readonly RoomTypeFieldMetadata[])[];

const roomTypeFormLayout = [
  [
    {
      labelKey: 'roomTypesPage.form.fields.name.label',
      name: 'name',
      placeholderKey: 'roomTypesPage.form.fields.name.placeholder',
      type: 'text',
      validations: [
        {
          messageKey: 'roomTypesPage.form.fields.name.required',
          name: 'required',
          validate: (value) =>
            typeof value === 'string' && value.trim().length > 0,
        },
      ],
    },
    {
      labelKey: 'roomTypesPage.form.fields.capacity.label',
      name: 'capacity',
      placeholderKey: 'roomTypesPage.form.fields.capacity.placeholder',
      type: 'number',
      validations: [
        {
          messageKey: 'roomTypesPage.form.fields.capacity.required',
          name: 'required',
          validate: (value) => Number.isFinite(value),
        },
        {
          messageKey: 'roomTypesPage.form.fields.capacity.min',
          name: 'min',
          validate: (value) =>
            typeof value === 'number' && Number.isInteger(value) && value >= 1,
        },
      ],
    },
  ],
  [
    {
      labelKey: 'roomTypesPage.form.fields.baseNightlyRate.label',
      name: 'baseNightlyRate',
      placeholderKey: 'roomTypesPage.form.fields.baseNightlyRate.placeholder',
      type: 'number',
      validations: [
        {
          messageKey: 'roomTypesPage.form.fields.baseNightlyRate.required',
          name: 'required',
          validate: (value) => Number.isFinite(value),
        },
        {
          messageKey: 'roomTypesPage.form.fields.baseNightlyRate.min',
          name: 'min',
          validate: (value) => typeof value === 'number' && value >= 1,
        },
      ],
    },
  ],
  [
    {
      labelKey: 'roomTypesPage.form.fields.amenities.label',
      name: 'amenities',
      placeholderKey: 'roomTypesPage.form.fields.amenities.placeholder',
      type: 'textarea',
      validations: [],
    },
    {
      labelKey: 'roomTypesPage.form.fields.photoUrls.label',
      name: 'photoUrls',
      placeholderKey: 'roomTypesPage.form.fields.photoUrls.placeholder',
      type: 'textarea',
      validations: [
        {
          messageKey: 'roomTypesPage.form.fields.photoUrls.url',
          name: 'url',
          validate: (value) =>
            typeof value === 'string' && parseList(value).every(isHttpUrl),
        },
      ],
    },
  ],
] as const satisfies RoomTypeFormLayout;

function parseList(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function createRegisterOptions(
  field: RoomTypeFieldMetadata,
  translate: (key: TranslationKey) => string,
): RegisterOptions<RoomTypeFormValues, RoomTypeFieldName> {
  const validate = field.validations.reduce<
    Record<
      string,
      (
        value: RoomTypeFormValues[RoomTypeFieldName],
      ) => Promise<boolean | string>
    >
  >((rules, validation) => {
    return {
      ...rules,
      [validation.name]: async (value) => {
        const isValid = await validation.validate(value);
        return isValid || translate(validation.messageKey);
      },
    };
  }, {});

  return {
    validate,
    valueAsNumber: field.type === 'number',
  };
}

function RoomTypeForm({
  errorMessage,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
  roomType,
}: RoomTypeFormProps) {
  const { t } = useI18n();
  const defaultValues = useMemo<RoomTypeFormValues>(
    () => ({
      name: roomType?.name ?? '',
      capacity: roomType?.capacity ?? 1,
      baseNightlyRate: roomType?.baseNightlyRate ?? 1,
      amenities: roomType?.amenities.join('\n') ?? '',
      photoUrls: roomType?.photoUrls.join('\n') ?? '',
    }),
    [roomType],
  );
  const {
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<RoomTypeFormValues>({ defaultValues });
  const submitting = isSubmitting || isFormSubmitting;

  const submitHandler: SubmitHandler<RoomTypeFormValues> = async (values) => {
    const payload: CreateRoomTypeInput = {
      name: values.name.trim(),
      capacity: values.capacity,
      baseNightlyRate: values.baseNightlyRate,
      amenities: parseList(values.amenities),
      photoUrls: parseList(values.photoUrls),
    };

    await onSubmit(payload).catch(() => undefined);
  };

  return (
    <form onSubmit={(event) => void handleSubmit(submitHandler)(event)}>
      <Stack gap="md">
        {roomTypeFormLayout.map((row) => (
          <SimpleGrid cols={{ base: 1, sm: row.length }} key={row[0].name}>
            {row.map((field) => {
              const fieldError = errors[field.name]?.message;
              const inputProps = {
                disabled: submitting,
                error: fieldError,
                label: t(field.labelKey),
                placeholder: t(field.placeholderKey),
                ...register(field.name, createRegisterOptions(field, t)),
              };

              if (field.type === 'textarea') {
                return (
                  <Textarea
                    autosize
                    key={field.name}
                    minRows={3}
                    {...inputProps}
                  />
                );
              }

              return (
                <TextInput
                  inputMode={field.type === 'number' ? 'decimal' : undefined}
                  key={field.name}
                  min={field.type === 'number' ? 1 : undefined}
                  type={field.type === 'number' ? 'number' : 'text'}
                  {...inputProps}
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
            leftSection={
              mode === 'create' ? <Tags size={18} /> : <Save size={18} />
            }
            loading={submitting}
            type="submit"
          >
            {mode === 'create'
              ? t('roomTypesPage.form.createSubmit')
              : t('roomTypesPage.form.updateSubmit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default RoomTypeForm;

