import { Heart, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


import DeleteIdeoramaDialog from './deleteIdeoramaDialog';

import { SuperButton } from '@/components/global/SuperButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { deleteIdeorama } from '@/services/ideorama.service';

const IdeoramasGroup: React.FC<{ideoramas: Ideorama[], profile: Partial<Profile>, setIdeoramas: React.Dispatch<React.SetStateAction<Ideorama[]>>}> = ({ideoramas, profile, setIdeoramas}) => {
  const navigate = useNavigate()
  const [ideoramaToDelete, setIdeoramaToDelete] = useState<Ideorama|null>(null)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {ideoramas.map((ideorama, index) => (
        <Card
          key={index}
          id = {`card-${index}`}
          className="overflow-hidden pt-0 bg-sidebar dark:bg-sidebar shadow-[0_0_20px_rgba(0,0,0,0.2)] border-2 border-white/5 group-hover:border-white/20 relative group cursor-pointer transition-transform duration-300 hover:z-50 hover:scale-107"
          onClick={() => {navigate(`/app/ideorama/${ideorama.id}`)}}
        >
          <CardContent className="px-0">
            <img
              src={'https://cdn.shadcnstudio.com/ss-assets/components/card/image-7.png?width=368&format=auto'}
              alt={ideorama.description || ""}
              className="aspect-video w-full object-cover"
            />
          </CardContent>
          <div className="flex items-center justify-between px-6 pt-4">
            <div className="space-y-0.5">
              <p className="text-xl font-bold tracking-tight text-foreground/90">
                {ideorama.name}
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground/90">
                {profile.pseudo}
              </p>
              <div className="flex items-center gap-3 text-muted-foreground/80">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold text-mauve">
                    {/* {ideorama.likes} */}
                    {50}
                  </span>
                  <Heart className="w-5 h-5 fill-mauve stroke-mauve" />
                </div>{' '}
              </div>
              <SuperButton
                tooltip="Supprime ton idéorama"
                voiceText="Supprime ton idéorama"
                onClick={(e) => {e.stopPropagation(); setIdeoramaToDelete(ideorama)}}
                className="main-btn"
              >
                <Trash2 /> Supprimer
              </SuperButton>
            </div>
            <Avatar className="h-14 w-14 border-2 border-white/20 shadow-sm shrink-0">
              <AvatarImage src={profile.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma'} alt="Profile" />
              <AvatarFallback>{profile.pseudo}</AvatarFallback>
            </Avatar>
          </div>
        </Card>
      ))}
    {ideoramaToDelete != null &&
      <DeleteIdeoramaDialog 
      ideoramaName={ideoramaToDelete.name}
      onConfirm={() => {
        deleteIdeorama(ideoramaToDelete.id);
        setIdeoramaToDelete(null);
        setIdeoramas(ideoramas.filter(ideoram => ideoram.id != ideoramaToDelete.id))}}
      onCancel={()=>setIdeoramaToDelete(null)}/>
    }
    </div>
  );
};

export default IdeoramasGroup;
