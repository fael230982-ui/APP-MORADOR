export type LoginPayload = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  unitId: string;
  condominiumId: string;
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type AuthContextData = {
  user: User | null;
  token: string | null;
  loading: boolean;
  signed: boolean;
  signIn: (payload: LoginPayload) => Promise<void>;
  signOut: () => void;
};