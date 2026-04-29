let voicesReady = false;

function getChineseVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'zh-CN') ||
    voices.find((v) => v.lang.startsWith('zh')) ||
    null
  );
}

export function initVoices() {
  if (!window.speechSynthesis) return;
  const load = () => {
    if (window.speechSynthesis.getVoices().length > 0) voicesReady = true;
  };
  load();
  window.speechSynthesis.onvoiceschanged = load;
  setTimeout(load, 100);
  setTimeout(load, 500);
}

export function speakChinese(text: string) {
  if (!window.speechSynthesis || !text) return;
  const speakNow = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    const voice = getChineseVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };
  if (!voicesReady) {
    window.speechSynthesis.getVoices();
    setTimeout(speakNow, 120);
  } else {
    speakNow();
  }
}
