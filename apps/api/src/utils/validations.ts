import { prisma, Role, type User } from '../config/client.config';

const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const userwithemail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return userwithemail;
  } catch {
    return null;
  }
};

const validateRegistration = async (
  acc: RegisterInput
): Promise<ValidationError[]> => {
  const user = acc.user;
  const profile = acc.profile;
  const exists = await getUserByEmail(user.email);

  const errors: ValidationError[] = [];
  if (!user.email)
    errors.push({ field: 'email', message: 'Email is required' });
  if (!user.first_name)
    errors.push({ field: 'fullName', message: 'First name is required' });
  if (!user.last_name)
    errors.push({ field: 'fullName', message: 'Last name is required' });
  if (!profile.pseudo)
    errors.push({ field: 'pseudo', message: 'Pseudo name is required' });
  if (!user.password)
    errors.push({ field: 'password', message: 'password is required' });
  if (![Role.CHILD, Role.SUPERVISOR].includes(user.role))
    errors.push({ field: 'role', message: 'Unknown Type' });
  if (!user.role)
    errors.push({ field: 'role', message: 'User Type is required' });
  if (exists) errors.push({ field: 'email', message: 'Email already exists' });
  return errors;
};

const validateLogin = (input: Partial<LoginInput>): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!input.email || !input.pseudo)
    errors.push({
      field: `${input.email ? 'email' : 'pseudo'}`,
      message: `${input.email ? 'Email' : 'Pseudo'} is required`,
    });
  if (!input.password)
    errors.push({ field: 'password', message: 'Password is required' });
  return errors;
};


const validateProfile = (profile: ProfileInput): ValidationError[] => {

  const errors: ValidationError[] = [];
  if (!profile.pseudo)
    errors.push({ field: 'pseudo', message: 'pseudo is required' });
  return errors;
};

export { validateLogin, validateProfile, validateRegistration };

