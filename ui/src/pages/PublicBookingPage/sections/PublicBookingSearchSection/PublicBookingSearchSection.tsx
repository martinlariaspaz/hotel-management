import { useMemo } from 'react';
import {
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { CalendarSearch } from 'lucide-react';
import {
  useForm,
  type RegisterOptions,
  type SubmitHandler,
} from 'react-hook-form';
import {
  isAvailabilityDateOnlyValue,
  parseAvailabilityGuestCount,
  type AvailabilitySearchCriteria,
} from '../../../../features/availability';
import { useI18n, type TranslationKey } from '../../../../i18n';

type PublicBookingSearchSectionProps = {
  isLoading: boolean;
  onSearch(criteria: AvailabilitySearchCriteria): void;
};

type PublicBookingSearchFormValues = {
  checkIn: string;
  checkOut: string;
  guests: number;
};

type PublicBookingSearchFieldName = keyof PublicBookingSearchFormValues;
type PublicBookingSearchFieldType = 'date' | 'number';
type PublicBookingSearchValidationResult = boolean | Promise<boolean>;

type PublicBookingSearchFieldValidation = {
  messageKey: TranslationKey;
  name: string;
  validate(
    value: PublicBookingSearchFormValues[PublicBookingSearchFieldName],
    values: PublicBookingSearchFormValues,
  ): PublicBookingSearchValidationResult;
};

type PublicBookingSearchFieldMetadata = {
  labelKey: TranslationKey;
  name: PublicBookingSearchFieldName;
  placeholderKey: TranslationKey;
  type: PublicBookingSearchFieldType;
  validations: readonly PublicBookingSearchFieldValidation[];
};

type PublicBookingSearchLayout = readonly (readonly PublicBookingSearchFieldMetadata[])[];

const publicBookingSearchLayout = [
  [
    {
      labelKey: 'publicBookingPage.search.fields.checkIn.label',
      name: 'checkIn',
      placeholderKey: 'publicBookingPage.search.fields.checkIn.placeholder',
      type: 'date',
      validations: [
        {
          messageKey: 'publicBookingPage.search.fields.checkIn.required',
          name: 'required',
          validate: (value) => typeof value === 'string' && value.length > 0,
        },
        {
          messageKey: 'publicBookingPage.search.fields.checkIn.date',
          name: 'date',
          validate: (value) =>
            typeof value === 'string' && isAvailabilityDateOnlyValue(value),
        },
      ],
    },
    {
      labelKey: 'publicBookingPage.search.fields.checkOut.label',
      name: 'checkOut',
      placeholderKey: 'publicBookingPage.search.fields.checkOut.placeholder',
      type: 'date',
      validations: [
        {
          messageKey: 'publicBookingPage.search.fields.checkOut.required',
          name: 'required',
          validate: (value) => typeof value === 'string' && value.length > 0,
        },
        {
          messageKey: 'publicBookingPage.search.fields.checkOut.date',
          name: 'date',
          validate: (value) =>
            typeof value === 'string' && isAvailabilityDateOnlyValue(value),
        },
        {
          messageKey: 'publicBookingPage.search.fields.checkOut.afterCheckIn',
          name: 'afterCheckIn',
          validate: (value, values) =>
            typeof value === 'string' &&
            typeof values.checkIn === 'string' &&
            isAvailabilityDateOnlyValue(value) &&
            isAvailabilityDateOnlyValue(values.checkIn) &&
            value > values.checkIn,
        },
      ],
    },
    {
      labelKey: 'publicBookingPage.search.fields.guests.label',
      name: 'guests',
      placeholderKey: 'publicBookingPage.search.fields.guests.placeholder',
      type: 'number',
      validations: [
        {
          messageKey: 'publicBookingPage.search.fields.guests.required',
          name: 'required',
          validate: (value) => Number.isFinite(value),
        },
        {
          messageKey: 'publicBookingPage.search.fields.guests.min',
          name: 'min',
          validate: (value) => {
            const guestCount = parseAvailabilityGuestCount(value);

            return guestCount !== null && guestCount >= 1;
          },
        },
      ],
    },
  ],
] as const satisfies PublicBookingSearchLayout;

function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + days);

  return nextDate;
}

function createDefaultValues(): PublicBookingSearchFormValues {
  const today = new Date();

  return {
    checkIn: formatDateInputValue(addDays(today, 1)),
    checkOut: formatDateInputValue(addDays(today, 2)),
    guests: 2,
  };
}

function createRegisterOptions(
  field: PublicBookingSearchFieldMetadata,
  getValues: () => PublicBookingSearchFormValues,
  translate: (key: TranslationKey) => string,
): RegisterOptions<PublicBookingSearchFormValues, PublicBookingSearchFieldName> {
  const validate = field.validations.reduce<
    Record<
      string,
      (
        value: PublicBookingSearchFormValues[PublicBookingSearchFieldName],
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
    valueAsNumber: field.type === 'number',
  };
}

function PublicBookingSearchSection({
  isLoading,
  onSearch,
}: PublicBookingSearchSectionProps) {
  const { t } = useI18n();
  const defaultValues = useMemo(() => createDefaultValues(), []);
  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
  } = useForm<PublicBookingSearchFormValues>({ defaultValues });

  const submitHandler: SubmitHandler<PublicBookingSearchFormValues> = (
    values,
  ) => {
    const guests = parseAvailabilityGuestCount(values.guests);

    if (guests === null) {
      return;
    }

    onSearch({
      checkIn: values.checkIn,
      checkOut: values.checkOut,
      guests,
    });
  };

  return (
    <Box
      aria-labelledby="public-booking-search-title"
      className="public-booking-search-section"
      component="section"
    >
      <Paper className="public-booking-search-panel" p="lg" radius="md" withBorder>
        <form onSubmit={(event) => void handleSubmit(submitHandler)(event)}>
          <Stack gap="lg">
            <Group align="flex-end" justify="space-between">
              <Stack gap={2}>
                <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                  {t('publicBookingPage.search.eyebrow')}
                </Text>
                <Title id="public-booking-search-title" order={2}>
                  {t('publicBookingPage.search.title')}
                </Title>
              </Stack>
            </Group>

            {publicBookingSearchLayout.map((row) => (
              <SimpleGrid cols={{ base: 1, md: row.length }} key={row[0].name}>
                {row.map((field) => (
                  <TextInput
                    disabled={isLoading}
                    error={errors[field.name]?.message}
                    inputMode={field.type === 'number' ? 'numeric' : undefined}
                    key={field.name}
                    label={t(field.labelKey)}
                    min={field.type === 'number' ? 1 : undefined}
                    placeholder={t(field.placeholderKey)}
                    type={field.type === 'number' ? 'number' : 'date'}
                    {...register(
                      field.name,
                      createRegisterOptions(field, getValues, t),
                    )}
                  />
                ))}
              </SimpleGrid>
            ))}

            <Group justify="flex-end">
              <Button
                leftSection={<CalendarSearch size={18} />}
                loading={isLoading}
                type="submit"
              >
                {t('publicBookingPage.search.submit')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}

export default PublicBookingSearchSection;
