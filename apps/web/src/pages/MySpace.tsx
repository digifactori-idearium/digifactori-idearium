import { Loader2, House } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CircularImage } from '@/components/ui/CircularImage';
import { useProfile } from '@/hooks/useProfile';

const MySpace: React.FC = () => {
  const { fetchProfile, loading } = useProfile();

  const [acc, setAcc] = useState<{
    profile: any;
    user: any;
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setAcc(data);
      } catch {
        /* handled in hook */
      }
    };
    loadProfile();
  }, [fetchProfile]);

  if (!acc || loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" />
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="magic-text flex items-center gap-2 text-3xl font-bold text-gray-800 mb-6 dark:text-white">
        <House /> Bienvenue {acc.profile.pseudo}
      </h1>

      <Carousel
        orientation="vertical"
        // Increased height to h-[400px] so the arrows + image have room
        className="w-full max-w-md mx-auto h-[400px] flex flex-col items-center justify-center p-6 overflow-visible"
      >
        <CarouselPrevious className="static translate-y-0 rotate-90 mb-4 hover:bg-gray-100 shrink-0" />

        <CarouselContent className="h-[200px] w-full overflow-visible">
          {/* Corrected: CircularImage is now INSIDE the CarouselItem */}
          <CarouselItem className="flex justify-center items-center overflow-visible">
            <CircularImage
              src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&w=2000&q=85"
              alt="monImage"
            />
          </CarouselItem>

          <CarouselItem className="flex justify-center items-center overflow-visible">
            <CircularImage
              src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&w=2000&q=85"
              alt="monImage"
            />
          </CarouselItem>

          <CarouselItem className="flex justify-center items-center overflow-visible">
            <CircularImage
              src="https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&w=2000&q=85"
              alt="monImage"
            />
          </CarouselItem>
        </CarouselContent>

        <CarouselNext className="static translate-y-0 rotate-90 mt-4 hover:bg-gray-100 shrink-0" />
      </Carousel>

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-700">Ideorama 1</h2>
          <p className="text-2xl font-bold mt-2 dark:text-black">La fôret</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-700">Ideorama 2</h2>
          <p className="text-2xl font-bold mt-2 dark:text-black">L'espace</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-700">Ideorama 3</h2>
          <p className="text-2xl font-bold mt-2 dark:text-black">Le volcan</p>
        </div>
      </div> */}
    </div>
  );
};

export default MySpace;
