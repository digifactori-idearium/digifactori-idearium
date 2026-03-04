import React from 'react';

import DigifactoryLogo from '../assets/images/digifactory.png';
import ImageStage from '../assets/images/stage.jpg';
import UnamurLogo from '../assets/images/unamur.png';
import Card from '../components/home/Card';
import CardText from '../components/home/CardText';

import Hero from '@/components/home/Hero';
import VoxelColor from '@/components/3d/VoxelColor';
import HoneycombGrid from '@/components/home/HoneyComb';

const Home: React.FC = () => {
  return (
    <>
      {/* HERO */}
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <Hero />
        <HoneycombGrid />
      </div>

      {/*  SECTION 3D */}
      <section className="w-full max-w-6xl mx-auto px-6 mb-32">
        <h2 className="text-3xl font-bold text-center mb-8">
          Démonstration 3D interactive
        </h2>

        <div className="w-full h-[400px] rounded-xl overflow-hidden border">
          <VoxelColor />
        </div>

        <p className="text-center mt-4 text-muted-foreground">
          Sélectionnez une couleur dans la palette puis cliquez sur un cube.
        </p>
      </section>

      {/* SECTION STAGE */}
      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl mx-auto mb-32 px-6">
        <Card image={ImageStage} animation="fade-right" />
        <CardText
          animation="fade-left"
          header="Un stage pour les enfants"
          text="Les enfants plongent dans le monde de la programmation"
        />
      </div>

      {/* SECTION DIGIFACTORY */}
      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl mx-auto mb-32 px-6">
        <Card image={DigifactoryLogo} animation="fade-right" />
        <CardText
          animation="fade-left"
          header="Une initiative de l'ASBL digiFactory"
          text="digiFactory oeuvre à créer des contenus pour former des citoyens capables de relever les défis émergents de l'ère numérique"
        />
      </div>

      {/* SECTION UNAMUR */}
      <div className="flex flex-col md:flex-row items-center w-full max-w-6xl mx-auto mb-32 px-6">
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