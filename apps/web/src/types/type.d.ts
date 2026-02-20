interface Option {
  text: string;
  value: string;
}

type User = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  parental_code: string | null;
  role: 'CHILD' | 'SUPERVISOR';
};

type UserSession = {
  id: string;
  email: string;
  role: 'CHILD' | 'SUPERVISOR';
  token: string;
};

type Profile = {
  id: string;
  userId: string;
  pseudo: string;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Role = 'CHILD' | 'SUPERVISOR';
