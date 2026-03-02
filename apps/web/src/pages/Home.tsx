import React from 'react';

import DigifactoryLogo from '../assets/images/digifactory.png';
import ImageStage from '../assets/images/stage.jpg';
import UnamurLogo from '../assets/images/unamur.png';
import Card from '../components/home/Card';
import CardText from '../components/home/CardText';

import Hero from '@/components/home/Hero';
import HoneycombGrid from '@/components/home/HoneyComb';

// 👇 import de la scène 3D
import VoxelScene from '@/components/3d/VoxelScene';

const Home: React.FC = () => {
  return (
    <>
      <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <Hero />
        <HoneycombGrid />
      </div>

      {/* 🔥 SECTION 3D */}
      <section className="w-full max-w-6xl mx-auto px-6 mb-80">
        <h2 className="text-3xl font-bold text-center mb-8">
          Démonstration 3D interactive
        </h2>

        <div className="w-full h-[400px] rounded-xl overflow-hidden border">
          <VoxelScene />
        </div>

        <p className="text-center mt-4 text-muted-foreground">
          Cliquez sur le cube pour changer sa couleur
        </p>
      </section>

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