import { Alert, Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { LogIn } from 'lucide-react';
import {
  useForm,
  type RegisterOptions,
  type SubmitHandler,
} from 'react-hook-form';
import { useI18n, type TranslationKey } from '../../../../i18n';
import type { LoginCredentials } from '../../repositories';

type LoginFormProps = {
  errorMessage: string | null;
  isSubmitting: boolean;
  onSubmit(credentials: LoginCredentials): Promise<void>;
};

type LoginFormValues = LoginCredentials;
type LoginFieldName = keyof LoginFormValues;
type LoginFieldType = 'password' | 'text';
type LoginValidationResult = boolean | Promise<boolean>;

type LoginFieldValidation = {
  messageKey: TranslationKey;
  name: string;
  validate(value: string, values: LoginFormValues): LoginValidationResult;
};

type LoginFieldMetadata = {
  autoComplete: string;
  labelKey: TranslationKey;
  name: LoginFieldName;
  placeholderKey: TranslationKey;
  type: LoginFieldType;
  validations: readonly LoginFieldValidation[];
};

type LoginFormLayout = readonly (readonly LoginFieldMetadata[])[];

function hasTextValue(value: string): boolean {
  return value.trim().length > 0;
}

const loginFormLayout = [
  [
    {
      autoComplete: 'username',
      labelKey: 'loginPage.form.fields.username.label',
      name: 'username',
      placeholderKey: 'loginPage.form.fields.username.placeholder',
      type: 'text',
      validations: [
        {
          messageKey: 'loginPage.form.fields.username.required',
          name: 'required',
          validate: hasTextValue,
        },
      ],
    },
  ],
  [
    {
      autoComplete: 'current-password',
      labelKey: 'loginPage.form.fields.password.label',
      name: 'password',
      placeholderKey: 'loginPage.form.fields.password.placeholder',
      type: 'password',
      validations: [
        {
          messageKey: 'loginPage.form.fields.password.required',
          name: 'required',
          validate: hasTextValue,
        },
      ],
    },
  ],
] as const satisfies LoginFormLayout;

function createRegisterOptions(
  field: LoginFieldMetadata,
  translate: (key: TranslationKey) => string,
): RegisterOptions<LoginFormValues, LoginFieldName> {
  const validate = field.validations.reduce<
    Record<
      string,
      (
        value: string,
        values: LoginFormValues,
      ) => Promise<boolean | string>
    >
  >((rules, validation) => {
    return {
      ...rules,
      [validation.name]: async (value, values) => {
        const isValid = await validation.validate(value, values);
        return isValid || translate(validation.messageKey);
      },
    };
  }, {});

  return { validate };
}

function LoginForm({
  errorMessage,
  isSubmitting,
  onSubmit,
}: LoginFormProps) {
  const { t } = useI18n();
  const {
    formState: { errors, isSubmitting: isFormSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    defaultValues: {
      password: '',
      username: '',
    },
  });
  const submitting = isSubmitting || isFormSubmitting;

  const submitHandler: SubmitHandler<LoginFormValues> = async (values) => {
    await onSubmit(values).catch(() => undefined);
  };

  return (
    <form onSubmit={(event) => void handleSubmit(submitHandler)(event)}>
      <Stack gap="md">
        {loginFormLayout.map((row) =>
          row.map((field) => {
            const fieldError = errors[field.name]?.message;
            const inputProps = {
              autoComplete: field.autoComplete,
              disabled: submitting,
              error: fieldError,
              label: t(field.labelKey),
              placeholder: t(field.placeholderKey),
              size: 'md' as const,
              ...register(field.name, createRegisterOptions(field, t)),
            };

            return field.type === 'password' ? (
              <PasswordInput key={field.name} {...inputProps} />
            ) : (
              <TextInput key={field.name} {...inputProps} />
            );
          }),
        )}

        {errorMessage ? (
          <Alert color="red" variant="light">
            {errorMessage}
          </Alert>
        ) : null}

        <Button
          disabled={submitting}
          fullWidth
          leftSection={<LogIn size={18} />}
          loading={submitting}
          size="md"
          type="submit"
        >
          {t('loginPage.form.submit')}
        </Button>
      </Stack>
    </form>
  );
}

export default LoginForm;
