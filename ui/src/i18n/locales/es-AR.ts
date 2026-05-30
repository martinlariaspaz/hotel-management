import type { TranslationMessages } from "./en";

const esARTranslations = {
  common: {
    actions: {
      refresh: "Actualizar",
      signIn: "Ingresar",
      logout: "Cerrar sesión",
    },
    brand: {
      productName: "Hotel Management",
    },
    domainStatuses: {
      payment: {
        depositPaid: "Seña pagada",
        paid: "Pagado",
        partiallyPaid: "Pago parcial",
        refundDue: "Reintegro pendiente",
        refunded: "Reintegrado",
        unpaid: "Impago",
      },
      reservation: {
        cancelled: "Cancelada",
        checkedIn: "Check-in realizado",
        checkedOut: "Check-out realizado",
        confirmed: "Confirmada",
        noShow: "No se presentó",
        pendingConfirmation: "Pendiente de confirmación",
      },
      room: {
        available: "Disponible",
        cleaning: "En limpieza",
        dirty: "Sucia",
        maintenance: "Mantenimiento",
        occupied: "Ocupada",
        outOfService: "Fuera de servicio",
        reserved: "Reservada",
      },
    },
    roles: {
      admin: "Administración",
      housekeeping: "Limpieza",
      management: "Gerencia",
      reception: "Recepción",
    },
    colorScheme: {
      useDark: "Usar modo oscuro",
      useLight: "Usar modo claro",
    },
    language: {
      ariaLabel: "Idioma",
      englishShort: "EN",
      spanishShort: "ES",
    },
    status: {
      checking: "Comprobando",
      offline: "Sin conexión",
      online: "En línea",
    },
  },
  app: {
    title: "Hotel Management",
    errors: {
      authSessionExpired: "Tu sesión expiró. Iniciá sesión nuevamente.",
      businessConflict:
        "La acción entra en conflicto con las reglas operativas del hotel.",
      forbidden: "No tenés permiso para realizar esta acción.",
      unauthorized: "Iniciá sesión para continuar.",
      unexpected: "Algo salió mal. Intentá de nuevo.",
      validation: "Revisá la información e intentá de nuevo.",
    },
    sessionChecking: {
      eyebrow: "Hotel Management",
      title: "Validando sesión",
    },
  },
  appShell: {
    header: {
      closeNavigation: "Cerrar navegación",
      openNavigation: "Abrir navegación",
      title: "Operaciones",
    },
    navigation: {
      ariaLabel: "Navegación del personal",
      dashboard: "Panel",
      housekeeping: "Limpieza",
      payments: "Pagos",
      reports: "Reportes",
      reservations: "Reservas",
      rooms: "Habitaciones",
      settings: "Configuración",
    },
  },
  loginPage: {
    header: {
      ariaLabel: "Inicio de sesión de Hotel Management",
      eyebrow: "Hotel Management",
      title: "Acceso del personal",
    },
    form: {
      fields: {
        username: {
          label: "Usuario",
          placeholder: "Ingrese un: usuario",
          required: "El usuario es obligatorio",
        },
        password: {
          label: "Contraseña",
          placeholder: "Ingrese un: contraseña",
          required: "La contraseña es obligatoria",
        },
      },
      authError:
        "No pudimos iniciar sesión. Revisá tus credenciales e intentá de nuevo.",
      submit: "Ingresar",
    },
  },
  dashboardPage: {
    header: {
      ariaLabel: "Resumen del sistema",
      eyebrow: "Hotel Management",
      title: "Panel de operaciones",
      logout: "Cerrar sesión",
    },
    overview: {
      eyebrow: "Hoy",
      title: "Operación del hotel",
      badge: "Resumen diario",
      stats: {
        reservations: {
          label: "Reservas",
          value: "24",
          helper: "Semana actual",
        },
        rooms: {
          label: "Habitaciones",
          value: "18",
          helper: "Disponibles",
        },
        guests: {
          label: "Huéspedes",
          value: "46",
          helper: "Activos",
        },
      },
    },
    apiStatus: {
      eyebrow: "Backend",
      title: "Estado de conexión",
      health: {
        checking: "Comprobando API",
        offline: "API sin conexión",
        online: "API en línea",
      },
      lastCheckedFallback: "Sin comprobaciones previas",
      refresh: "Actualizar",
      error: "Falló la comprobación de salud",
    },
  },
} as const satisfies TranslationMessages;

export default esARTranslations;
