import type { TranslationMessages } from "./en";

const esARTranslations = {
  common: {
    actions: {
      cancel: "Cancelar",
      clear: "Limpiar",
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
  roomsPage: {
    header: {
      ariaLabel: "Inventario y tablero de estado de habitaciones",
      eyebrow: "Operaciones",
      title: "Habitaciones",
    },
    management: {
      eyebrow: "Inventario de habitaciones",
      title: "Habitaciones f\u00edsicas",
      createAction: "Crear habitaci\u00f3n",
    },
    filters: {
      status: {
        label: "Estado",
        placeholder: "Seleccione un estado",
      },
      roomType: {
        label: "Tipo de habitaci\u00f3n",
        placeholder: "Seleccione un tipo de habitaci\u00f3n",
      },
      floor: {
        label: "Piso",
        placeholder: "Ingrese un piso",
      },
    },
    list: {
      loading: "Cargando habitaciones",
      empty: "No hay habitaciones para estos filtros.",
      noFloor: "Sin piso",
      capacityValue: "{count} hu\u00e9spedes",
      statusControlAriaLabel: "Actualizar estado de la habitaci\u00f3n {roomNumber}",
      columns: {
        actions: "Acciones",
        floor: "Piso",
        roomNumber: "Habitaci\u00f3n",
        roomType: "Tipo de habitaci\u00f3n",
        status: "Estado",
      },
    },
    board: {
      eyebrow: "Tablero de estado",
      title: "Operaci\u00f3n de habitaciones por estado",
      loading: "Cargando tablero de habitaciones",
      noRoomsForStatus: "No hay habitaciones en este estado.",
      roomCount: "{count} habitaciones",
    },
    maintenance: {
      eyebrow: "Mantenimiento",
      title: "Bloqueos de habitaciones",
      createFromBoard: "Bloquear habitaci\u00f3n {roomNumber}",
      status: {
        active: "Activo",
        cancelled: "Cancelado",
      },
      filters: {
        startDate: {
          label: "Fecha de inicio",
          placeholder: "AAAA-MM-DD",
        },
        endDate: {
          label: "Fecha de fin",
          placeholder: "AAAA-MM-DD",
        },
        invalidRange: "Eleg\u00ed una fecha de fin posterior a la de inicio.",
      },
      list: {
        loading: "Cargando bloqueos de mantenimiento",
        empty: "No hay bloqueos activos en este rango.",
        dateRange: "{startDate} al {endDate}",
        columns: {
          actions: "Acciones",
          dates: "Fechas",
          reason: "Motivo",
          room: "Habitaci\u00f3n",
          status: "Estado",
        },
      },
      form: {
        createTitle: "Crear bloqueo de mantenimiento",
        createSubmit: "Crear bloqueo",
        fields: {
          room: {
            label: "Habitaci\u00f3n",
            placeholder: "Seleccione una habitaci\u00f3n",
            required: "La habitaci\u00f3n es obligatoria",
          },
          startDate: {
            label: "Fecha de inicio",
            placeholder: "AAAA-MM-DD",
            required: "La fecha de inicio es obligatoria",
            date: "Ingres\u00e1 una fecha de inicio v\u00e1lida",
          },
          endDate: {
            label: "Fecha de fin",
            placeholder: "AAAA-MM-DD",
            required: "La fecha de fin es obligatoria",
            date: "Ingres\u00e1 una fecha de fin v\u00e1lida",
            afterStart:
              "La fecha de fin debe ser posterior a la fecha de inicio",
          },
          reason: {
            label: "Motivo",
            placeholder: "Ingrese un motivo de mantenimiento",
            required: "El motivo es obligatorio",
          },
        },
      },
      cancel: {
        action: "Cancelar bloqueo",
        title: "Cancelar bloqueo de mantenimiento",
        description:
          "\u00bfCancelar el bloqueo de mantenimiento de la habitaci\u00f3n {roomNumber} del {startDate} al {endDate}?",
        confirm: "Cancelar bloqueo",
      },
    },
    form: {
      createTitle: "Crear habitaci\u00f3n",
      updateTitle: "Actualizar habitaci\u00f3n",
      createSubmit: "Crear habitaci\u00f3n",
      updateSubmit: "Guardar cambios",
      fields: {
        roomNumber: {
          label: "N\u00famero de habitaci\u00f3n",
          placeholder: "Ingrese un n\u00famero de habitaci\u00f3n",
          required: "El n\u00famero de habitaci\u00f3n es obligatorio",
        },
        roomType: {
          label: "Tipo de habitaci\u00f3n",
          placeholder: "Seleccione un tipo de habitaci\u00f3n",
          required: "El tipo de habitaci\u00f3n es obligatorio",
        },
        floor: {
          label: "Piso",
          placeholder: "Ingrese un piso",
        },
        notes: {
          label: "Notas",
          placeholder: "Ingrese notas operativas",
        },
      },
    },
  },
  publicBookingPage: {
    header: {
      ariaLabel: "Reserva p\u00fablica de habitaciones",
      eyebrow: "Reserva para hu\u00e9spedes",
      title: "Busc\u00e1 tu estad\u00eda",
      description:
        "Consult\u00e1 tipos de habitaci\u00f3n disponibles y envi\u00e1 una solicitud para revisi\u00f3n del hotel.",
      staffAccess: "Ingreso del personal",
    },
    search: {
      eyebrow: "Disponibilidad",
      title: "Buscar fechas",
      submit: "Buscar habitaciones",
      fields: {
        checkIn: {
          label: "Check-in",
          placeholder: "AAAA-MM-DD",
          required: "La fecha de check-in es obligatoria",
          date: "Ingres\u00e1 una fecha de check-in v\u00e1lida",
        },
        checkOut: {
          label: "Check-out",
          placeholder: "AAAA-MM-DD",
          required: "La fecha de check-out es obligatoria",
          date: "Ingres\u00e1 una fecha de check-out v\u00e1lida",
          afterCheckIn:
            "La fecha de check-out debe ser posterior al check-in",
        },
        guests: {
          label: "Hu\u00e9spedes",
          placeholder: "Ingrese una cantidad de hu\u00e9spedes",
          required: "La cantidad de hu\u00e9spedes es obligatoria",
          min: "La cantidad de hu\u00e9spedes debe ser de al menos 1",
        },
      },
    },
    results: {
      eyebrow: "Habitaciones",
      title: "Tipos de habitaci\u00f3n disponibles",
      summary:
        "Estad\u00eda del {checkIn} al {checkOut} para {guests} hu\u00e9spedes.",
      idle:
        "Eleg\u00ed fechas y cantidad de hu\u00e9spedes para ver tipos disponibles.",
      idleDescription:
        "Empez\u00e1 con una b\u00fasqueda de fechas para comparar habitaciones y precios.",
      loading: "Buscando tipos de habitaci\u00f3n disponibles",
      empty: "No hay tipos de habitaci\u00f3n disponibles para esta b\u00fasqueda.",
      card: {
        availableCount: "{count} disponibles",
        capacity: "{count} hu\u00e9spedes",
        deposit: "Se\u00f1a de la primera noche: {amount}",
        nightlyPrice: "Precio por noche",
        noAmenities: "Sin amenities cargados",
        noPhoto: "Foto pr\u00f3ximamente",
        photoAlt: "Foto de la habitaci\u00f3n {name}",
        selectAction: "Solicitar esta habitaci\u00f3n",
        selectedAction: "Seleccionada",
        totalPrice: "Total por {nights} noches",
      },
    },
    request: {
      eyebrow: "Solicitud",
      title: "Solicitud de reserva",
      empty:
        "Seleccion\u00e1 un tipo de habitaci\u00f3n disponible para completar la solicitud.",
    },
    form: {
      title: "Datos del hu\u00e9sped",
      description:
        "Solicit\u00e1 {roomType}; el hotel revisar\u00e1 la disponibilidad.",
      backToResults: "Volver a resultados",
      submit: "Enviar solicitud",
      fields: {
        guestName: {
          label: "Nombre completo",
          placeholder: "Ingrese un nombre completo",
          required: "El nombre completo es obligatorio",
        },
        email: {
          label: "Email",
          placeholder: "Ingrese un email",
          required: "El email es obligatorio",
          format: "Ingres\u00e1 un email v\u00e1lido",
        },
        phone: {
          label: "Tel\u00e9fono",
          placeholder: "Ingrese un tel\u00e9fono",
          required: "El tel\u00e9fono es obligatorio",
        },
        guests: {
          label: "Hu\u00e9spedes",
          placeholder: "Ingrese una cantidad de hu\u00e9spedes",
          required: "La cantidad de hu\u00e9spedes es obligatoria",
          min: "La cantidad de hu\u00e9spedes debe ser de al menos 1",
          capacity:
            "La cantidad de hu\u00e9spedes supera la capacidad de este tipo de habitaci\u00f3n",
        },
        notes: {
          label: "Notas",
          placeholder:
            "Ingrese notas de llegada o pedidos especiales",
        },
        policyAccepted: {
          label:
            "Acepto la pol\u00edtica de se\u00f1a y cancelaci\u00f3n para esta solicitud de reserva.",
          placeholder: "Acept\u00e1 la pol\u00edtica de reserva",
          required:
            "Acept\u00e1 la pol\u00edtica de reserva para continuar",
        },
      },
    },
    policies: {
      firstNightDeposit: "Se\u00f1a de la primera noche: {amount}",
      freeCancellation48:
        "La cancelaci\u00f3n sin cargo est\u00e1 disponible hasta 48 horas antes del check-in. Las cancelaciones tard\u00edas y los no show pueden retener la se\u00f1a de la primera noche.",
    },
  },
  publicBookingRequestPage: {
    header: {
      ariaLabel: "Solicitud de reserva pendiente",
      status: "Pendiente de revisi\u00f3n",
      title: "Solicitud recibida",
      description:
        "Tu solicitud de reserva qued\u00f3 pendiente de revisi\u00f3n del hotel. En este paso no se realiza ning\u00fan pago.",
    },
    nextSteps: {
      expiresAt: "El hotel deber\u00eda revisarla antes de {expiresAt}.",
      noExpiration:
        "El hotel la revisar\u00e1 y se contactar\u00e1 por email o tel\u00e9fono.",
    },
    summary: {
      title: "Resumen de la reserva",
      reference: "Referencia",
      nextStep: "Pr\u00f3ximo paso",
      roomType: "Tipo de habitaci\u00f3n",
      dates: "Fechas",
      dateRange: "{checkIn} al {checkOut}",
      guests: "Hu\u00e9spedes",
      guestCount: "{count} hu\u00e9spedes",
      guest: "Hu\u00e9sped",
      total: "Total estimado",
      deposit: "Regla de se\u00f1a",
      cancellation: "Pol\u00edtica de cancelaci\u00f3n",
      notAvailable: "No disponible",
    },
    missingState: {
      title: "Referencia guardada",
      description:
        "Us\u00e1 esta referencia cuando contactes al hotel. El resumen detallado est\u00e1 disponible inmediatamente despu\u00e9s de enviar una solicitud.",
    },
    actions: {
      newSearch: "Buscar de nuevo",
    },
  },
} as const satisfies TranslationMessages;

export default esARTranslations;
