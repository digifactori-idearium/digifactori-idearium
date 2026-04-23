import { UserCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

const ProfileHeader: React.FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-6 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-mauve/10">
          <UserCircle className="w-10 h-10 text-mauve" />
        </div>

        <h1 className="magic-text text-3xl md:text-5xl font-semibold tracking-tight w-fit">
          MON PROFILE
        </h1>
      </div>

      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};

export default ProfileHeader;
