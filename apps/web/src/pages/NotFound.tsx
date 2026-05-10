import { useLocation } from 'react-router-dom';

import { VoiceButton, VoiceLink } from '@/components/common/button';

interface NotFoundState {
  title?: string;
  message?: string;
  backTo?: string;
  backLabel?: string;
}

export default function NotFound() {
  const { state } = useLocation() as { state: NotFoundState | null };

  const title = state?.title ?? 'Oups ! Page introuvable';
  const message =
    state?.message ??
    "La page que vous recherchez n'existe pas ou a été déplacée.";
  const backTo = state?.backTo ?? '/';
  const backLabel = state?.backLabel ?? "Retour à l'accueil";

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-xl w-full">
        <h1 className="text-7xl sm:text-8xl font-extrabold text-pink-500">
          404
        </h1>

        <h2 className="mt-4 text-2xl sm:text-3xl font-bold">{title}</h2>

        <p className="mt-4 text-gray-400 text-sm sm:text-base">{message}</p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <VoiceLink
            voiceText={backLabel}
            to={backTo}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-background hover:bg-background/75 transition text-center"
          >
            {backLabel}
          </VoiceLink>

          <VoiceButton
            variant={'ghost'}
            voiceText={'Revenir en arrière'}
            onClick={() => window.history.back()}
            className="w-full sm:w-auto p-6! rounded-2xl! border border-mauve hover:bg-mauve  text-mauve hover:text-white transition"
          >
            Revenir en arrière
          </VoiceButton>
        </div>
      </div>
    </div>
  );
}
