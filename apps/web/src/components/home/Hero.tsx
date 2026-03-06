import { Play, Sparkles } from 'lucide-react';

import { VoiceLink } from '../global';

export default function Hero() {
  return (
    <section className="w-full relative min-h-[90vh] flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none"></div>

        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-6 py-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 mb-8 animate-bounce">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
            L'aventure numérique commence ici
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
          <span className="block text-gray-900 dark:text-white">
            Bienvenue dans
          </span>
          <span className="bg-linear-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            l'Idéarium 2.0 👋
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Un hackathon de 3 jours où les enfants de{' '}
          <span className="text-indigo-600 font-bold">6 à 12 ans</span>{' '}
          deviennent les architectes du futur. Explore les salles et transforme
          tes idées en code !
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <VoiceLink
            to="/rooms"
            voiceText="Explorez les Ideorama"
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white! transition-all duration-300 bg-mauve rounded-2xl hover:bg-mauve/80 hover:shadow-[0_0_30px_-10px_rgba(79,70,229,0.6)]"
          >
            Explorez les Ideorama
            <Play className="ml-2 h-5 w-5 fill-current group-hover:translate-x-1 transition-transform" />
          </VoiceLink>

          <VoiceLink
            to="https://www.d1g1factory.org/"
            target="_blank"
            voiceText="En savoir plus sur digiFactory"
            rel="noopener noreferrer"
            className="px-8 py-4 font-semibold text-gray-700 dark:text-gray-300 rounded-2xl border-2 border-gray-200 dark:border-gray-800 hover:border-mauve! dark:hover:border-mauve/80! hover:text-mauve! transition-all duration-300"
          >
            Le projet digiFactory
          </VoiceLink>
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="absolute top-20 left-20 w-12 h-12 border-2 border-indigo-200 dark:border-indigo-900 rounded-xl rotate-12 animate-spin-slow"></div>
        <div className="absolute bottom-40 right-20 w-8 h-8 bg-pink-400/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-10 w-4 h-4 bg-indigo-400/30 rounded-full"></div>
      </div>
    </section>
  );
}
