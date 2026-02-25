import React from 'react';

import DigifactoryLogo from '../assets/images/digifactory.png';
import ImageStage from '../assets/images/stage.jpg';
import UnamurLogo from '../assets/images/unamur.png';
import Card from '../components/home/Card';
import CardText from '../components/home/CardText';

import Hero from '@/components/home/Hero';
import HoneycombGrid from '@/components/home/HoneyComb';

const Home: React.FC = () => {
  return (
    <>
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <Hero />
        <HoneycombGrid />
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
          header="Une initiative de l'ASBL Digifactory"
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
