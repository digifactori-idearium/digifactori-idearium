interface ValidationError {
  field: string;
  message: string;
}

interface LoginInput {
  email: string;
  pseudo: string;
  password: string;
}

interface UserInput {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  parental_code?: number;
  role: 'CHILD' | 'SUPERVISOR';
}

interface ProfileInput {
  pseudo: string;
  bio?: string;
  avatar?: string
}

type RegisterInput = {
  user: UserInput;
  profile: ProfileInput;
};

type SetProfileInput = {
  user?: Partial<UserInput>,
  profile: Partial<ProfileInput>
}
