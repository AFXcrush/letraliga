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

export function playVictorySound() {
  const context = getAudioContext();
  if (!context) return;
  context.resume().catch(() => {});

  const start = context.currentTime + 0.04;
  const notes = [
    { frequency: 523.25, offset: 0, duration: 0.24, gain: 0.1 },
    { frequency: 659.25, offset: 0.16, duration: 0.26, gain: 0.11 },
    { frequency: 783.99, offset: 0.32, duration: 0.28, gain: 0.12 },
    { frequency: 1046.5, offset: 0.5, duration: 0.64, gain: 0.15 },
    { frequency: 392, offset: 0.5, duration: 0.64, gain: 0.055 },
    { frequency: 659.25, offset: 0.5, duration: 0.64, gain: 0.05 },
  ];

  notes.forEach(({ frequency, offset, duration, gain: peakGain }) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const noteStart = start + offset;
    const noteEnd = noteStart + duration;

    oscillator.type = frequency < 500 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, noteStart);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(peakGain, noteStart + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteEnd + 0.02);
  });
}
