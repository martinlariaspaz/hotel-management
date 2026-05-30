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
      unexpected: "Algo salió mal. Intentá de nuevo.",
    },
    sessionChecking: {
      eyebrow: "Hotel Management",
      title: "Validando sesión",
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
