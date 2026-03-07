type SpeakOptions = {
  lang?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
  voiceName?: string;
};

export function speak(text: string, options: SpeakOptions = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  const {
    lang = 'fr-FR',
    pitch = 1.2,
    rate = 1,
    volume = 1,
    voiceName,
  } = options;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.lang = lang;
  utterance.pitch = pitch;
  utterance.rate = rate;
  utterance.volume = volume;

  const voices = window.speechSynthesis.getVoices();

  if (voiceName) {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) utterance.voice = voice;
  } else {
    const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frenchVoice) utterance.voice = frenchVoice;
  }

  window.speechSynthesis.speak(utterance);
}
