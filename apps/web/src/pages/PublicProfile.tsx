import { Heart } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { getPublicIdeoramasByPseudo } from '@/services/ideorama.service';
import { getPublicProfile } from '@/services/profile.service';

const PublicProfile: React.FC = () => {
    const { pseudo } = useParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<
        Pick<Profile, 'id' | 'userId' | 'pseudo' | 'avatar' | 'bio'> | null
    >(null);
    const [ideoramas, setIdeoramas] = useState<Ideorama[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pseudo) return;

        const loadPublicProfile = async () => {
            try {
                const [profileResponse, ideoramasResponse] = await Promise.all([
                    getPublicProfile(pseudo),
                    getPublicIdeoramasByPseudo(pseudo),
                ]);

                setProfile(profileResponse.data);
                setIdeoramas(ideoramasResponse.data);
            } finally {
                setLoading(false);
            }
        };

        loadPublicProfile();
    }, [pseudo]);

    if (loading) {
        return <div className="min-h-screen p-6">Chargement du profil...</div>;
    }

    if (!profile) {
        return <div className="min-h-screen p-6">Profil introuvable.</div>;
    }

    return (
        <div className="min-h-screen p-6">
            <div className="flex flex-col items-center gap-4 mb-10">
                <Avatar className="h-28 w-28 border-4 border-white/30 shadow-md">
                    <AvatarImage
                        src={
                            profile.avatar ||
                            'https://api.dicebear.com/7.x/bottts/svg?seed=PublicUser'
                        }
                        alt={profile.pseudo}
                    />
                    <AvatarFallback>{profile.pseudo}</AvatarFallback>
                </Avatar>

                <h1 className="magic-text md:text-5xl text-3xl font-bold">
                    {profile.pseudo}
                </h1>

                {profile.bio && (
                    <p className="max-w-xl text-center text-muted-foreground">
                        {profile.bio}
                    </p>
                )}
            </div>

            <h2 className="magic-text text-center md:text-4xl text-2xl font-bold mb-8">
                Ses idéoramas publics
            </h2>

            {ideoramas.length === 0 ? (
                <p className="text-center">Aucun idéorama public pour le moment.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {ideoramas.map((ideorama, index) => (
                        <Card
                            key={ideorama.id ?? index}
                            className="overflow-hidden pt-0 bg-sidebar dark:bg-sidebar shadow-[0_0_20px_rgba(0,0,0,0.2)] border-2 border-white/5 dark:border-white/20 group-hover:border-white/20 relative group cursor-pointer transition-transform duration-300 hover:z-50 hover:scale-107"
                            onClick={() => navigate(`/app/ideorama/${ideorama.id}`)}
                        >
                            <CardContent className="px-0">
                                <img
                                    src="https://cdn.shadcnstudio.com/ss-assets/components/card/image-7.png?width=368&format=auto"
                                    alt={ideorama.description || ideorama.name}
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

                                    <div className="flex items-center gap-1">
                                        <span className="text-lg font-semibold text-mauve">
                                            50
                                        </span>
                                        <Heart className="w-5 h-5 fill-mauve stroke-mauve" />
                                    </div>
                                </div>

                                <Avatar className="h-14 w-14 border-2 border-white/20 shadow-sm shrink-0">
                                    <AvatarImage
                                        src={
                                            profile.avatar ||
                                            'https://api.dicebear.com/7.x/bottts/svg?seed=PublicUser'
                                        }
                                        alt={profile.pseudo}
                                    />
                                    <AvatarFallback>{profile.pseudo}</AvatarFallback>
                                </Avatar>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicProfile;