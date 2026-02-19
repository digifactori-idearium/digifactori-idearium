import React from 'react';
import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  const rooms = [
    ["Room1","Room2","Room3","Room4"],
    ["Room5","Room6","Room7","Room8", "Room45","Room14"],
    ["Room9","Room10","Room11","Room12","Room13","Room14"]
  ];

  // Taille de l'hexagone pour calculer décalage
  const hexWidth = 90;  // en px, à adapter selon ton css
  const hexHeight = 90;  // aspect-ratio 1:0.87
  const verticalGap = hexHeight * 0.2; // distance verticale entre lignes

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome Home 👋</h1>
      <p className="text-gray-600 text-center max-w-md">
        This is a simple placeholder Home page. You can customize this section
        with hero content, navigation, or landing information.
      </p>

      <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
        Get Started
      </button>

      {/* Nid d'abeille dynamique */}
      <div className="flex flex-col items-center mt-12">
        {rooms.map((row, rowIndex) => {
          
          // Décalage pour les lignes impaires (nid d'abeille)
          const beeOffset = rowIndex % 2 !== 0 ? hexWidth / 2 : 0;
          const length = row.length;
          
          return (
            <div
              key={rowIndex}
              className="flex gap-0 justify-center"
              style={{
                marginTop: rowIndex === 0 ? 0 : -verticalGap,
                transform: `translateX(${beeOffset}px)`, // centré + décalage nid d'abeille
              }}
            >
              {row.map((room) => (
                <Button
                  key={room}
                  variant="hex"
                  size="hex"
                  onClick={() => alert(`${room} clicked`)}
                >
                  {room}
                </Button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
