import { useMemo } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Group,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { ArrowLeft, Send } from 'lucide-react';
import {
  Controller,
  useForm,
  type RegisterOptions,
  type SubmitHandler,
} from 'react-hook-form';
import type {
  AvailabilitySearchCriteria,
  PublicRoomTypeAvailability,
} from '../../../availability';
import { useI18n, type TranslationKey } from '../../../../i18n';
import type { PublicReservationRequest } from '../../types';

type PublicBookingFormProps = {
  criteria: AvailabilitySearchCriteria;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCancelSelection(): void;
  onSubmit(input: PublicReservationRequest): Promise<void>;
  roomTypeAvailability: PublicRoomTypeAvailability;
};

type PublicBookingFormValues = {
  email: string;
  guestName: string;
  guests: number;
  notes: string;
  phone: string;
  policyAccepted: boolean;
};

type PublicBookingFieldName = keyof PublicBookingFormValues;
type PublicBookingFieldType =
  | 'checkbox'
  | 'email'
  | 'number'
  | 'tel'
  | 'text'
  | 'textarea';
type PublicBookingValidationResult = boolean | Promise<boolean>;

type PublicBookingFieldValidation = {
  messageKey: TranslationKey;
  name: string;
  validate(
    value: PublicBookingFormValues[PublicBookingFieldName],
  ): PublicBookingValidationResult;
};

type PublicBookingFieldMetadata = {
  autoComplete?: string;
  labelKey: TranslationKey;
  name: PublicBookingFieldName;
  placeholderKey: TranslationKey;
  type: PublicBookingFieldType;
  validations: readonly PublicBookingFieldValidation[];
};

type PublicBookingFormLayout = readonly (readonly PublicBookingFieldMetadata[])[];

function isRequiredText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  );
}

function createPublicBookingFormLayout(
  roomCapacity: number,
): PublicBookingFormLayout {
  return [
    [
      {
        autoComplete: 'name',
        labelKey: 'publicBookingPage.form.fields.guestName.label',
        name: 'guestName',
        placeholderKey: 'publicBookingPage.form.fields.guestName.placeholder',
        type: 'text',
        validations: [
          {
            messageKey: 'publicBookingPage.form.fields.guestName.required',
            name: 'required',
            validate: isRequiredText,
          },
        ],
      },
      {
        autoComplete: 'email',
        labelKey: 'publicBookingPage.form.fields.email.label',
        name: 'email',
        placeholderKey: 'publicBookingPage.form.fields.email.placeholder',
        type: 'email',
        validations: [
          {
            messageKey: 'publicBookingPage.form.fields.email.required',
            name: 'required',
            validate: isRequiredText,
          },
          {
            messageKey: 'publicBookingPage.form.fields.email.format',
            name: 'email',
            validate: isValidEmail,
          },
        ],
      },
    ],
    [
      {
        autoComplete: 'tel',
        labelKey: 'publicBookingPage.form.fields.phone.label',
        name: 'phone',
        placeholderKey: 'publicBookingPage.form.fields.phone.placeholder',
        type: 'tel',
        validations: [
          {
            messageKey: 'publicBookingPage.form.fields.phone.required',
            name: 'required',
            validate: isRequiredText,
          },
        ],
      },
      {
        labelKey: 'publicBookingPage.form.fields.guests.label',
        name: 'guests',
        placeholderKey: 'publicBookingPage.form.fields.guests.placeholder',
        type: 'number',
        validations: [
          {
            messageKey: 'publicBookingPage.form.fields.guests.required',
            name: 'required',
            validate: (value) => Number.isFinite(value),
          },
          {
            messageKey: 'publicBookingPage.form.fields.guests.min',
            name: 'min',
            validate: (value) =>
              typeof value === 'number' &&
              Number.isInteger(value) &&
              value >= 1,
          },
          {
            messageKey: 'publicBookingPage.form.fields.guests.capacity',
            name: 'capacity',
            validate: (value) =>
              typeof value === 'number' &&
              Number.isInteger(value) &&
              value <= roomCapacity,
          },
        ],
      },
    ],
    [
      {
        labelKey: 'publicBookingPage.form.fields.notes.label',
        name: 'notes',
        placeholderKey: 'publicBookingPage.form.fields.notes.placeholder',
        type: 'textarea',
        validations: [],
      },
    ],
    [
      {
        labelKey: 'publicBookingPage.form.fields.policyAccepted.label',
        name: 'policyAccepted',
        placeholderKey:
          'publicBookingPage.form.fields.policyAccepted.placeholder',
        type: 'checkbox',
        validations: [
          {
            messageKey:
              'publicBookingPage.form.fields.policyAccepted.required',
            name: 'required',
            validate: (value) => value === true,
          },
        ],
      },
    ],
  ];
}

function normalizeOptionalText(value: string): string | undefined {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

function createRegisterOptions(
  field: PublicBookingFieldMetadata,
  translate: (key: TranslationKey) => string,
): RegisterOptions<PublicBookingFormValues, PublicBookingFieldName> {
  const validate = field.validations.reduce<
    Record<
      string,
      (
        value: PublicBookingFormValues[PublicBookingFieldName],
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

function PublicBookingForm({
  criteria,
  errorMessage,
  isSubmitting,
  onCancelSelection,
  onSubmit,
  roomTypeAvailability,
}: PublicBookingFormProps) {
  const { t } = useI18n();
  const layout = useMemo(
    () => createPublicBookingFormLayout(roomTypeAvailability.capacity),
    [roomTypeAvailability.capacity],
  );
  const defaultValues = useMemo<PublicBookingFormValues>(
    () => ({
      email: '',
      guestName: '',
      guests: criteria.guests,
      notes: '',
      phone: '',
      policyAccepted: false,
    }),
    [criteria.guests],
  );
  const {
    control,
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<PublicBookingFormValues>({ defaultValues });
  const submitting = isSubmitting || isFormSubmitting;

  const submitHandler: SubmitHandler<PublicBookingFormValues> = async (
    values,
  ) => {
    const payload: PublicReservationRequest = {
      checkInDate: criteria.checkIn,
      checkOutDate: criteria.checkOut,
      guest: {
        email: values.email.trim(),
        name: values.guestName.trim(),
        phone: values.phone.trim(),
      },
      guestCount: values.guests,
      notes: normalizeOptionalText(values.notes),
      policyAccepted: true,
      roomTypeId: roomTypeAvailability.id,
    };

    await onSubmit(payload).catch(() => undefined);
  };

  return (
    <form onSubmit={(event) => void handleSubmit(submitHandler)(event)}>
      <Stack gap="md">
        <Stack gap={4}>
          <Text fw={700}>{t('publicBookingPage.form.title')}</Text>
          <Text c="dimmed" size="sm">
            {t('publicBookingPage.form.description').replace(
              '{roomType}',
              roomTypeAvailability.name,
            )}
          </Text>
        </Stack>

        {layout.map((row) => (
          <SimpleGrid cols={{ base: 1, sm: row.length }} key={row[0].name}>
            {row.map((field) => {
              const fieldError = errors[field.name]?.message;
              const inputProps = {
                autoComplete: field.autoComplete,
                disabled: submitting,
                error: fieldError,
                label: t(field.labelKey),
                placeholder: t(field.placeholderKey),
              };

              if (field.type === 'checkbox') {
                return (
                  <Controller
                    control={control}
                    key={field.name}
                    name="policyAccepted"
                    render={({ field: controllerField }) => (
                      <Checkbox
                        checked={controllerField.value}
                        disabled={submitting}
                        error={fieldError}
                        label={t(field.labelKey)}
                        onBlur={controllerField.onBlur}
                        onChange={(event) =>
                          controllerField.onChange(event.currentTarget.checked)
                        }
                      />
                    )}
                    rules={
                      createRegisterOptions(field, t) as RegisterOptions<
                        PublicBookingFormValues,
                        'policyAccepted'
                      >
                    }
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
                    {...register(
                      field.name,
                      createRegisterOptions(field, t),
                    )}
                  />
                );
              }

              return (
                <TextInput
                  inputMode={field.type === 'number' ? 'numeric' : undefined}
                  key={field.name}
                  max={
                    field.type === 'number'
                      ? roomTypeAvailability.capacity
                      : undefined
                  }
                  min={field.type === 'number' ? 1 : undefined}
                  type={field.type === 'number' ? 'number' : field.type}
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

        <Group justify="space-between">
          <Button
            disabled={submitting}
            leftSection={<ArrowLeft size={18} />}
            onClick={onCancelSelection}
            type="button"
            variant="default"
          >
            {t('publicBookingPage.form.backToResults')}
          </Button>
          <Button
            leftSection={<Send size={18} />}
            loading={submitting}
            type="submit"
          >
            {t('publicBookingPage.form.submit')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export default PublicBookingForm;
