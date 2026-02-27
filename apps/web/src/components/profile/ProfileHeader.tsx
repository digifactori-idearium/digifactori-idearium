import { UserCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

const ProfileHeader: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex gap-2 flex-col md:flex-row justify-around items-center py-4">
      <div className="flex gap-2 justify-center items-center py-4">
        <UserCircle className="w-12 h-12 text-mauve" />
        <h1 className="magic-text text-center w-fit md:text-5xl text-3xl">
          MON PROFILE
        </h1>
      </div>

      {children}
    </div>
  );
};

export default ProfileHeader;
