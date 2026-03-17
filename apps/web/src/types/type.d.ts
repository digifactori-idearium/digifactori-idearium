
interface Option {
  text: string;
  value: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
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


type Ideorama = {
  id: string;
  name: string;
  description: string | null;
  theme: string;
  brightness: string;
  isPublic: boolean;
  backgroundColor: string;
  leftWallColor: string;
  rightWallColor: string;
  floorColor: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  model: string;
}
