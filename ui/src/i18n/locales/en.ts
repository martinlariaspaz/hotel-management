const enTranslations = {
  common: {
    actions: {
      cancel: 'Cancel',
      edit: 'Edit',
      refresh: 'Refresh',
      save: 'Save',
      signIn: 'Sign in',
      logout: 'Logout',
    },
    brand: {
      productName: 'Hotel Management',
    },
    domainStatuses: {
      payment: {
        depositPaid: 'Deposit paid',
        paid: 'Paid',
        partiallyPaid: 'Partially paid',
        refundDue: 'Refund due',
        refunded: 'Refunded',
        unpaid: 'Unpaid',
      },
      reservation: {
        cancelled: 'Cancelled',
        checkedIn: 'Checked in',
        checkedOut: 'Checked out',
        confirmed: 'Confirmed',
        noShow: 'No-show',
        pendingConfirmation: 'Pending confirmation',
      },
      room: {
        available: 'Available',
        cleaning: 'Cleaning',
        dirty: 'Dirty',
        maintenance: 'Maintenance',
        occupied: 'Occupied',
        outOfService: 'Out of service',
        reserved: 'Reserved',
      },
    },
    roles: {
      admin: 'Admin',
      housekeeping: 'Housekeeping',
      management: 'Management',
      reception: 'Reception',
    },
    colorScheme: {
      useDark: 'Use dark mode',
      useLight: 'Use light mode',
    },
    language: {
      ariaLabel: 'Language',
      englishShort: 'EN',
      spanishShort: 'ES',
    },
    status: {
      checking: 'Checking',
      offline: 'Offline',
      online: 'Online',
    },
  },
  app: {
    title: 'Hotel Management',
    errors: {
      authSessionExpired: 'Your session expired. Please sign in again.',
      businessConflict: 'The action conflicts with hotel operating rules.',
      forbidden: 'You do not have permission to perform this action.',
      unauthorized: 'Please sign in to continue.',
      unexpected: 'Something went wrong. Please try again.',
      validation: 'Check the information and try again.',
    },
    sessionChecking: {
      eyebrow: 'Hotel Management',
      title: 'Validating session',
    },
    accessDenied: {
      action: 'Go to dashboard',
      description: 'Your staff role does not allow access to this area.',
      eyebrow: 'Access control',
      title: 'Access denied',
    },
  },
  appShell: {
    header: {
      closeNavigation: 'Close navigation',
      openNavigation: 'Open navigation',
      title: 'Operations',
    },
    navigation: {
      ariaLabel: 'Staff navigation',
      dashboard: 'Dashboard',
      housekeeping: 'Housekeeping',
      payments: 'Payments',
      reports: 'Reports',
      reservations: 'Reservations',
      rooms: 'Rooms',
      settings: 'Settings',
    },
  },
  loginPage: {
    header: {
      ariaLabel: 'Hotel Management login',
      eyebrow: 'Hotel Management',
      title: 'Staff access',
    },
    form: {
      fields: {
        username: {
          label: 'Username',
          placeholder: 'Enter a username',
          required: 'Username is required',
        },
        password: {
          label: 'Password',
          placeholder: 'Enter a password',
          required: 'Password is required',
        },
      },
      authError: 'Unable to sign in. Check your credentials and try again.',
      submit: 'Sign in',
    },
  },
  dashboardPage: {
    header: {
      ariaLabel: 'System summary',
      eyebrow: 'Hotel Management',
      title: 'Operations panel',
      logout: 'Logout',
    },
    overview: {
      eyebrow: 'Today',
      title: 'Hotel operation',
      badge: 'Daily overview',
      stats: {
        reservations: {
          label: 'Reservations',
          value: '24',
          helper: 'Current week',
        },
        rooms: {
          label: 'Rooms',
          value: '18',
          helper: 'Available',
        },
        guests: {
          label: 'Guests',
          value: '46',
          helper: 'Active',
        },
      },
    },
    apiStatus: {
      eyebrow: 'Backend',
      title: 'Connection status',
      health: {
        checking: 'Checking API',
        offline: 'API offline',
        online: 'API online',
      },
      lastCheckedFallback: 'No previous checks',
      refresh: 'Refresh',
      error: 'Health check failed',
    },
  },
  staffSettingsPage: {
    header: {
      ariaLabel: 'Staff settings',
      eyebrow: 'Admin',
      title: 'Staff access',
    },
    management: {
      eyebrow: 'Roles and permissions',
      title: 'Staff users',
      createAction: 'Create staff user',
    },
    list: {
      loading: 'Loading staff users',
      empty: 'No staff users yet.',
      columns: {
        actions: 'Actions',
        role: 'Role',
        status: 'Status',
        username: 'Username',
      },
      status: {
        active: 'Active',
        inactive: 'Inactive',
      },
    },
    form: {
      createTitle: 'Create staff user',
      updateTitle: 'Update staff user',
      createSubmit: 'Create user',
      updateSubmit: 'Save changes',
      fields: {
        username: {
          label: 'Username',
          placeholder: 'Enter a username',
          required: 'Username is required',
        },
        password: {
          label: 'Password',
          placeholder: 'Enter a password',
          required: 'Password is required',
          minLength: 'Password must have at least 8 characters',
        },
        role: {
          label: 'Role',
          placeholder: 'Select a role',
          required: 'Role is required',
        },
        isActive: {
          label: 'Active user',
        },
      },
    },
  },
} as const;

type WidenStringLeaves<TValue> = TValue extends string
  ? string
  : {
      readonly [TKey in keyof TValue]: WidenStringLeaves<TValue[TKey]>;
    };

export type TranslationMessages = WidenStringLeaves<typeof enTranslations>;

export default enTranslations;
