import Auth from '@/components/auth';

const AuthPage = () => {
  const con: string = 'connexion';
  return (
    <div className="bg">
      <Auth connexion={con} />
    </div>
  );
};

export default AuthPage;
