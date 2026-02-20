import { Play } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import DigifactoryLogo from '../assets/images/digifactory.png';
import ImageStage from '../assets/images/stage.jpg';
import UnamurLogo from '../assets/images/unamur.png';
import Card from '../components/home/Card';
import CardText from '../components/home/CardText';

import { Button } from '@/components/ui/button';

const Home: React.FC = () => {
  const rooms = [
    ['Room1', 'Room2', 'Room3', 'Room4'],
    ['Room5', 'Room6', 'Room7', 'Room8', 'Room45', 'Room14'],
    ['Room9', 'Room10', 'Room11', 'Room12', 'Room13', 'Room14'],
  ];

  // Taille de l'hexagone pour calculer décalage
  const hexWidth = 90; // en px, à adapter selon ton css
  const hexHeight = 90; // aspect-ratio 1:0.87
  const verticalGap = hexHeight * 0.2; // distance verticale entre lignes

  return (
    <>
      <div className="w-full min-h-screen flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 dark:text-white">
          Bienvenue dans l'Idéarium 👋
        </h1>
        <p className="text-gray-600 text-center max-w-md dark:text-white">
          Idéarium 2.0 est une initiative éducative de digiFactory, une
          organisation à but non lucratif basée à Namur et fondée en 2019. Le
          projet propose un atelier de 3 jours pour les enfants de 6 à 12 ans,
          sur le modèle d'un hackathon, afin de les initier au développement
          logiciel au sens large.
        </p>

        <Link
          to="/app"
          role="button"
          className="mt-8 bg-background! text-foreground! hover:bg-background/90! relative group overflow-hidden px-4 py-2 rounded-2xl"
        >
          <span className="relative z-10 flex items-center">
            Se lancer <Play className="ml-2 h-4 w-4" />
          </span>
          {/* Subtle gradient hover effect on button */}
          <div className="absolute inset-0 h-full w-full scale-0 rounded-md transition-all duration-300 group-hover:scale-105 group-hover:bg-metatron-gradient opacity-20" />
        </Link>

        {/* Nid d'abeille dynamique */}
        <div className="flex flex-col items-center mt-12">
          {rooms.map((row, rowIndex) => {
            // Décalage pour les lignes impaires (nid d'abeille)
            const beeOffset = rowIndex % 2 !== 0 ? hexWidth / 2 : 0;
            //const length = row.length;

            return (
              <div
                key={rowIndex}
                className="flex gap-0 justify-center"
                style={{
                  marginTop: rowIndex === 0 ? 0 : -verticalGap,
                  transform: `translateX(${beeOffset}px)`, // centré + décalage nid d'abeille
                }}
              >
                {row.map(room => (
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

      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl mx-auto mb-80 px-6">
        <Card image={ImageStage} animation="fade-right" />
        <CardText
          animation="fade-left"
          header="Un stage pour les enfants"
          text="Les enfants plongent dans le monde de la programmation"
        />
      </div>
      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl mx-auto mb-80 px-6">
        <Card image={DigifactoryLogo} animation="fade-right" />
        <CardText
          animation="fade-left"
          header="Une innitiative de l'ASBL Digifactory"
          text="digifactory oeuvre à créer des contenus pour former des citoyens capables de relever les défis émergents de l'ère numérique"
        />
      </div>
      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl mx-auto mb-80 px-6">
        <Card image={UnamurLogo} animation="fade-right" />
        <CardText
          animation="fade-left"
          header="En collaboration avec l'UNamur"
          text="Un stage immersif à l'UNamur"
        />
      </div>
    </>
  );
};

export default Home;
