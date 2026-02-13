interface ValidationError {
  field: string;
  message: string;
}

interface LoginInput {
  email: string;
  pseudo: string;
  password: string;
}

interface RegisterInput {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  parental_code: string;
  role: 'CHILD' | 'SUPERVISOR';
}
