import { House, Wand } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { SuperButton } from '../components/global';

import { IdeoramaCreator } from '@/components/ideorama/IdeoramaCreator';
import IdeoramasGroup from '@/components/ideorama/IdeoramasGroup';
import { useUser } from '@/providers/UserProvider';
import { getAllIdeoramas } from '@/services/ideorama.service';



const MyIdeoramas: React.FC = () => {

    const user = useUser().user
    const [ideoramas, setIdeoramas] = useState<Ideorama[]>([])
    const [profile, setProfile] = useState<Partial<Profile>>({
  pseudo: "RobLaMenace",
  avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix'
  })

    const [createsNew, setCreatesNew] = useState(false)

    useEffect(() => {
        getAllIdeoramas(user?.id).then(res => {setIdeoramas(res.data.ideoramas); setProfile(res.data.profile)})
        
    }, [])

  return (
    <div className="min-h-screen p-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800 mb-6 dark:text-white">
        Your ideoramas, {profile.pseudo} <House />
      </h1>
        <SuperButton
          tooltip="Créer un nouveau idéorama"
          voiceText="Créer un nouveau idéorama"
          onClick={() => setCreatesNew(true)}
          className="main-btn"
        >
          <Wand /> Créer un nouveau idéorama
        </SuperButton>
        {createsNew && < IdeoramaCreator isOpen={createsNew} setIsOpen={setCreatesNew} userId={user?.id}/>}
      <IdeoramasGroup ideoramas={ideoramas} profile={profile} setIdeoramas={setIdeoramas}/>
    </div>
  );
};

export default MyIdeoramas;
