let audioCtx: AudioContext | null = null;
let soundEnabled = true;

export function setSoundEnabledState(enabled: boolean): void {
  soundEnabled = enabled;
}

function getContext(): AudioContext | null {
  if (!soundEnabled || typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.08,
  delay = 0
): void {
  const ctx = getContext();
  if (!ctx) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainPeak, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playCorrectSound(): void {
  playTone(523.25, 0.12, 'triangle', 0.09, 0);
  playTone(659.25, 0.14, 'triangle', 0.09, 0.07);
  playTone(783.99, 0.22, 'triangle', 0.08, 0.14);
}

export function playWrongSound(): void {
  playTone(260, 0.14, 'sawtooth', 0.045, 0);
  playTone(195, 0.22, 'sawtooth', 0.045, 0.1);
}

export function playLifelineSound(): void {
  playTone(440, 0.09, 'sine', 0.07, 0);
  playTone(587.33, 0.14, 'sine', 0.07, 0.06);
}

export function playFinishSound(): void {
  playTone(523.25, 0.14, 'triangle', 0.08, 0);
  playTone(659.25, 0.14, 'triangle', 0.08, 0.09);
  playTone(783.99, 0.14, 'triangle', 0.08, 0.18);
  playTone(1046.5, 0.32, 'triangle', 0.09, 0.27);
}
