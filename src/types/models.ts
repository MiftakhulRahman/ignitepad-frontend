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
  username: string; // <-- TAMBAHKAN INI
  email: string;
  nim: string | null;
  nidn: string | null;
  niyp: string | null;
  bio: string | null;
  avatar: string | null;
  roles: Role[];
  // properti opsional dari profil publik
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
}