export interface Role {
  name: string;
  pivot: {
    model_type: string;
    model_id: number;
    role_id: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  nim: string | null;
  nidn: string | null;
  niyp: string | null;
  bio: string | null;
  avatar: string | null;
  roles: Role[];
  // Tambahkan properti lain jika Anda membutuhkannya
}