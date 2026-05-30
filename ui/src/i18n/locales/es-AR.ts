import type { TranslationMessages } from "./en";

const esARTranslations = {
  common: {
    actions: {
      cancel: "Cancelar",
      deactivate: "Desactivar",
      edit: "Editar",
      save: "Guardar",
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
    accessDenied: {
      action: "Ir al panel",
      description: "Tu rol de personal no permite acceder a esta secciÃ³n.",
      eyebrow: "Control de acceso",
      title: "Acceso denegado",
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
      roomTypes: "Tipos de habitaci\u00f3n",
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
  staffSettingsPage: {
    header: {
      ariaLabel: "Configuraci\u00f3n del personal",
      eyebrow: "Administraci\u00f3n",
      title: "Acceso del personal",
    },
    management: {
      eyebrow: "Roles y permisos",
      title: "Usuarios del personal",
      createAction: "Crear usuario",
    },
    list: {
      loading: "Cargando usuarios",
      empty: "Todav\u00eda no hay usuarios del personal.",
      columns: {
        actions: "Acciones",
        role: "Rol",
        status: "Estado",
        username: "Usuario",
      },
      status: {
        active: "Activo",
        inactive: "Inactivo",
      },
    },
    form: {
      createTitle: "Crear usuario del personal",
      updateTitle: "Actualizar usuario del personal",
      createSubmit: "Crear usuario",
      updateSubmit: "Guardar cambios",
      fields: {
        username: {
          label: "Usuario",
          placeholder: "Ingrese un usuario",
          required: "El usuario es obligatorio",
        },
        password: {
          label: "Contrase\u00f1a",
          placeholder: "Ingrese una contrase\u00f1a",
          required: "La contrase\u00f1a es obligatoria",
          minLength: "La contrase\u00f1a debe tener al menos 8 caracteres",
        },
        role: {
          label: "Rol",
          placeholder: "Seleccione un rol",
          required: "El rol es obligatorio",
        },
        isActive: {
          label: "Usuario activo",
        },
      },
    },
  },
  roomTypesPage: {
    header: {
      ariaLabel: "Gesti\u00f3n de tipos de habitaci\u00f3n",
      eyebrow: "Inventario",
      title: "Tipos de habitaci\u00f3n",
    },
    management: {
      eyebrow: "Configuraci\u00f3n de categor\u00edas",
      title: "Categor\u00edas de inventario por noche",
      createAction: "Crear tipo de habitaci\u00f3n",
    },
    list: {
      loading: "Cargando tipos de habitaci\u00f3n",
      empty: "Todav\u00eda no hay tipos de habitaci\u00f3n.",
      noAmenities: "Sin amenities cargados",
      capacityValue: "{count} hu\u00e9spedes",
      columns: {
        actions: "Acciones",
        baseRate: "Tarifa base por noche",
        capacity: "Capacidad",
        name: "Tipo de habitaci\u00f3n",
        status: "Estado",
      },
      status: {
        active: "Activo",
        inactive: "Inactivo",
      },
    },
    form: {
      createTitle: "Crear tipo de habitaci\u00f3n",
      updateTitle: "Actualizar tipo de habitaci\u00f3n",
      createSubmit: "Crear tipo",
      updateSubmit: "Guardar cambios",
      fields: {
        name: {
          label: "Nombre",
          placeholder: "Ingrese un nombre de tipo de habitaci\u00f3n",
          required: "El nombre es obligatorio",
        },
        capacity: {
          label: "Capacidad",
          placeholder: "Ingrese una capacidad de hu\u00e9spedes",
          required: "La capacidad es obligatoria",
          min: "La capacidad debe ser de al menos 1 hu\u00e9sped",
        },
        baseNightlyRate: {
          label: "Tarifa base por noche",
          placeholder: "Ingrese una tarifa por noche",
          required: "La tarifa base por noche es obligatoria",
          min: "La tarifa base por noche debe ser positiva",
        },
        amenities: {
          label: "Amenities",
          placeholder: "Ingrese amenities separados por comas o l\u00edneas",
        },
        photoUrls: {
          label: "URLs de fotos",
          placeholder: "Ingrese URLs de fotos separadas por comas o l\u00edneas",
          url: "Cada URL de foto debe empezar con http:// o https://",
        },
      },
    },
    deactivate: {
      title: "Desactivar tipo de habitaci\u00f3n",
      description:
        "\u00bfDesactivar {name}? Dejar\u00e1 de ofrecerse para nueva configuraci\u00f3n de inventario, pero los registros existentes seguir\u00e1n disponibles.",
    },
  },
} as const satisfies TranslationMessages;

export default esARTranslations;
