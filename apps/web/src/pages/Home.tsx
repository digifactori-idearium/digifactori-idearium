import React from 'react';

import DigifactoryLogo from '../assets/images/digifactory.jpg';
import ImageStage from '../assets/images/stage.jpg';
import UnamurLogo from '../assets/images/unamur.png';
import Card from '../components/home/Card';
import CardText from '../components/home/CardText';

const Home: React.FC = () => {
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

        <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
          Commencer
        </button>
      </div>
      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl mx-auto mb-80 px-6">
        <Card image={ImageStage} animation="fade-right" />
        <CardText
          animation="fade-left"
          header="Un stage pour les enfants"
          text="Immersez les enfants dans le monde de la programmation"
        />
      </div>
      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl mx-auto mb-80 px-6">
        <Card image={DigifactoryLogo} animation="fade-right" />
        <CardText
          animation="fade-left"
          header="Une innitiative de l'ASBL Digifactory"
          text="digifactory oeuvre à créer des contenus pour former des citoyens capables de relever les défis émergents de l'ère numériqu"
        />
      </div>
      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl mx-auto mb-80 px-6">
        <Card image={UnamurLogo} animation="fade-right" />
        <CardText
          animation="fade-left"
          header="En collaboration avec l'UNamur"
          text="Un stage immersif dans les locaux de l'UNamur."
        />
      </div>
    </>
  );
};

export default Home;
