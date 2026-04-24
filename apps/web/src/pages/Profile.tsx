import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfile } from "@/services/profile.service";

const ProfilePage: React.FC = () => {

  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!userId) return;
    getProfile(userId).then(res => {
        setProfile(res.data.profile);
        console.log(res.data.profile);
    })
  }, [userId]);

  return <div>
    <p>{profile?.pseudo}</p>
    <p>{profile?.bio}</p>
    <Avatar className="h-14 w-14 border-2 border-white/20 shadow-sm shrink-0">
        <AvatarImage
          src={
            profile?.avatar ||
            'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'
          }
          alt="Profile"
        />
        <AvatarFallback>{profile?.pseudo}</AvatarFallback>
    </Avatar>
    </div>;
};

export default ProfilePage;
