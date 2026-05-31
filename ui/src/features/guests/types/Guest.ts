export type GuestContact = {
  email: string;
  phone: string;
};

export type GuestInput = GuestContact & {
  name: string;
  notes?: string;
};

export type Guest = GuestInput & {
  createdAt: string;
  id: string;
  updatedAt: string;
};

export type { Guest as default };
