import { Heart } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

const RoomsGroup = () => {
  const rooms = [
    {
      title: 'Mystical Blue Swirl',
      image:
        'https://cdn.shadcnstudio.com/ss-assets/components/card/image-7.png?width=368&format=auto',
      likes: 30,
      ownerName: 'Noah',
      ownerAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Noah',
    },
    {
      title: 'Fiery Sunset Gradient',
      image:
        'https://cdn.shadcnstudio.com/ss-assets/components/card/image-4.png?width=368&format=auto',
      likes: 100,
      ownerName: 'Felix',
      ownerAvatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
    },
    {
      title: 'Cosmic Blue Waves',
      image:
        'https://cdn.shadcnstudio.com/ss-assets/components/card/image-5.png?width=368&format=auto',
      likes: 1082,
      ownerName: 'Emma',
      ownerAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Emma',
    },
  ];

  const testRooms = Array(8).fill(rooms).flat();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {testRooms.map((room, index) => (
        <Card
          key={index}
          className="overflow-hidden pt-0 bg-sidebar dark:bg-sidebar shadow-[0_0_20px_rgba(0,0,0,0.2)] border-2 border-white/5 group-hover:border-white/20 relative group cursor-pointer transition-transform duration-300 hover:z-50 hover:scale-107"
        >
          <CardContent className="px-0">
            <img
              src={room.image}
              alt={room.description}
              className="aspect-video w-full object-cover"
            />
          </CardContent>
          <div className="flex items-center justify-between px-6 pt-4">
            <div className="space-y-0.5">
              <p className="text-xl font-bold tracking-tight text-foreground/90">
                {room.title}
              </p>
              <div className="flex items-center gap-3 text-muted-foreground/80">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold text-mauve">
                    {room.likes}
                  </span>
                  <Heart className="w-5 h-5 fill-mauve stroke-mauve" />
                </div>{' '}
              </div>
            </div>
            <Avatar className="h-14 w-14 border-2 border-white/20 shadow-sm shrink-0">
              <AvatarImage src={room.ownerAvatar} alt="Profile" />
              <AvatarFallback>{room.ownerName}</AvatarFallback>
            </Avatar>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RoomsGroup;
