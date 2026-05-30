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
import { BedDouble, Save } from 'lucide-react';
import {
  Controller,
  useForm,
  type RegisterOptions,
  type SubmitHandler,
} from 'react-hook-form';
import { useI18n, type TranslationKey } from '../../../../i18n';
import type { CreateRoomInput, UpdateRoomInput } from '../../repositories';
import type { Room } from '../../types';

export type RoomFormRoomTypeOption = {
  id: string;
  name: string;
};

type RoomFormMode = 'create' | 'update';
type RoomFormSubmitValues = CreateRoomInput | UpdateRoomInput;

type RoomFormProps = {
  errorMessage: string | null;
  isSubmitting: boolean;
  mode: RoomFormMode;
  onCancel(): void;
  onSubmit(values: RoomFormSubmitValues): Promise<void>;
  room?: Room;
  roomTypes: readonly RoomFormRoomTypeOption[];
};

type RoomFormValues = {
  floor: string;
  notes: string;
  roomNumber: string;
  roomTypeId: string;
};

type RoomFieldName = keyof RoomFormValues;
type RoomFieldType = 'select' | 'text' | 'textarea';
type RoomFieldValidationResult = boolean | Promise<boolean>;

type RoomFieldValidation = {
  messageKey: TranslationKey;
  name: string;
  validate(value: RoomFormValues[RoomFieldName]): RoomFieldValidationResult;
};

type RoomFieldMetadata = {
  labelKey: TranslationKey;
  name: RoomFieldName;
  placeholderKey: TranslationKey;
  type: RoomFieldType;
  validations: readonly RoomFieldValidation[];
};

type RoomFormLayout = readonly (readonly RoomFieldMetadata[])[];

const roomFormLayout = [
  [
    {
      labelKey: 'roomsPage.form.fields.roomNumber.label',
      name: 'roomNumber',
      placeholderKey: 'roomsPage.form.fields.roomNumber.placeholder',
      type: 'text',
      validations: [
        {
          messageKey: 'roomsPage.form.fields.roomNumber.required',
          name: 'required',
          validate: (value) =>
            typeof value === 'string' && value.trim().length > 0,
        },
      ],
    },
    {
      labelKey: 'roomsPage.form.fields.roomType.label',
      name: 'roomTypeId',
      placeholderKey: 'roomsPage.form.fields.roomType.placeholder',
      type: 'select',
      validations: [
        {
          messageKey: 'roomsPage.form.fields.roomType.required',
          name: 'required',
          validate: (value) =>
            typeof value === 'string' && value.trim().length > 0,
        },
      ],
    },
  ],
  [
    {
      labelKey: 'roomsPage.form.fields.floor.label',
      name: 'floor',
      placeholderKey: 'roomsPage.form.fields.floor.placeholder',
      type: 'text',
      validations: [],
    },
  ],
  [
    {
      labelKey: 'roomsPage.form.fields.notes.label',
      name: 'notes',
      placeholderKey: 'roomsPage.form.fields.notes.placeholder',
      type: 'textarea',
      validations: [],
    },
  ],
] as const satisfies RoomFormLayout;

function normalizeOptionalText(value: string): string | undefined {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function createRegisterOptions(
  field: RoomFieldMetadata,
  translate: (key: TranslationKey) => string,
): RegisterOptions<RoomFormValues, RoomFieldName> {
  const validate = field.validations.reduce<
    Record<
      string,
      (value: RoomFormValues[RoomFieldName]) => Promise<boolean | string>
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
  };
}

function RoomForm({
  errorMessage,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
  room,
  roomTypes,
}: RoomFormProps) {
  const { t } = useI18n();
  const roomTypeSelectData = useMemo(
    () =>
      roomTypes.map((roomType) => ({
        label: roomType.name,
        value: roomType.id,
      })),
    [roomTypes],
  );
  const defaultValues = useMemo<RoomFormValues>(
    () => ({
      roomNumber: room?.roomNumber ?? '',
      roomTypeId: room?.roomType.id ?? '',
      floor: room?.floor ?? '',
      notes: room?.notes ?? '',
    }),
    [room],
  );
  const {
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<RoomFormValues>({ defaultValues });
  const submitting = isSubmitting || isFormSubmitting;

  const submitHandler: SubmitHandler<RoomFormValues> = async (values) => {
    const payload: CreateRoomInput = {
      roomNumber: values.roomNumber.trim(),
      roomTypeId: values.roomTypeId,
      floor: normalizeOptionalText(values.floor),
      notes: normalizeOptionalText(values.notes),
    };

    await onSubmit(payload).catch(() => undefined);
  };

  return (
    <form onSubmit={(event) => void handleSubmit(submitHandler)(event)}>
      <Stack gap="md">
        {roomFormLayout.map((row) => (
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
                        data={roomTypeSelectData}
                        onChange={(value) => controllerField.onChange(value ?? '')}
                        value={controllerField.value}
                      />
                    )}
                    rules={createRegisterOptions(field, t)}
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
                    {...register(field.name, createRegisterOptions(field, t))}
                  />
                );
              }

              return (
                <TextInput
                  key={field.name}
                  {...inputProps}
                  {...register(field.name, createRegisterOptions(field, t))}
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
              mode === 'create' ? <BedDouble size={18} /> : <Save size={18} />
            }
            loading={submitting}
            type="submit"
          >
            {mode === 'create'
              ? t('roomsPage.form.createSubmit')
              : t('roomsPage.form.updateSubmit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default RoomForm;

