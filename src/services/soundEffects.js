let audioContext = null;

function getAudioContext() {
  const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  return audioContext;
}

export function unlockSoundEffects() {
  const context = getAudioContext();
  if (context?.state === "suspended") context.resume().catch(() => {});
}

export function playWordConfirmedSound() {
  const context = getAudioContext();
  if (!context) return;
  context.resume().catch(() => {});

  const start = context.currentTime;
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = start + index * 0.075;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.22);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + 0.23);
  });
}
