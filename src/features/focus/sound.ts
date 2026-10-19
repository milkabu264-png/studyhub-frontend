// Сигнал окончания фокуса — три мягких ноты через Web Audio, без звуковых файлов.
//
// Браузеры разрешают звук только после действия пользователя, поэтому
// unlockSound() вызывается по нажатию «Старт», а playChime() — когда время вышло.

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    context ??= new AudioContext();
    return context;
  } catch {
    return null;
  }
}

export function unlockSound() {
  void getContext()?.resume().catch(() => undefined);
}

//true — звук сыграл; false — браузер его заблокировал
export async function playChime(): Promise<boolean> {
  const ctx = getContext();

  if (!ctx) {
    return false;
  }

  if (ctx.state !== "running") {
    //resume может зависнуть без действия пользователя — ждём не дольше 300 мс
    await Promise.race([
      ctx.resume().catch(() => undefined),
      new Promise((resolve) => setTimeout(resolve, 300)),
    ]);
  }

  if (ctx.state !== "running") {
    return false;
  }

  const notes = [659.25, 783.99, 1046.5];

  notes.forEach((frequency, index) => {
    const start = ctx.currentTime + index * 0.28;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.25, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + 1);
  });

  return true;
}
