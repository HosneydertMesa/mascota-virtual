'use strict';

(() => {
  const SAMPLE_RATE = 16000;
  let activeAudio = null;
  let activeUrl = null;
  let disabledUntil = 0;

  function clampSample(value) {
    return Math.max(-1, Math.min(1, value));
  }

  function createSamples(duration, sampler) {
    const length = Math.max(1, Math.floor(SAMPLE_RATE * duration));
    const samples = new Float32Array(length);
    for (let index = 0; index < length; index++) {
      const time = index / SAMPLE_RATE;
      const attack = Math.min(1, time / 0.025);
      const release = Math.min(1, (duration - time) / 0.06);
      samples[index] = clampSample(sampler(time, duration) * attack * release);
    }
    return samples;
  }

  function samplesFor(sound) {
    if (sound === 'meow') {
      return createSamples(0.55, (time, duration) => {
        const progress = time / duration;
        const frequency = progress < 0.45
          ? 720 - progress * 620
          : 440 + (progress - 0.45) * 350;
        return Math.sin(2 * Math.PI * frequency * time) * 0.22
          + Math.sin(2 * Math.PI * frequency * 2.02 * time) * 0.045;
      });
    }

    if (sound === 'purr') {
      return createSamples(1.15, time => {
        const pulse = 0.55 + 0.45 * Math.sin(2 * Math.PI * 24 * time);
        const rumble = Math.sin(2 * Math.PI * 52 * time) + 0.35 * Math.sin(2 * Math.PI * 104 * time);
        return rumble * pulse * 0.055 + (Math.random() * 2 - 1) * 0.012;
      });
    }

    if (sound === 'bark') {
      return createSamples(0.52, time => {
        const first = time < 0.16 ? 1 : 0;
        const secondTime = time - 0.25;
        const second = secondTime >= 0 && secondTime < 0.16 ? 0.82 : 0;
        const localTime = first ? time : Math.max(0, secondTime);
        const envelope = first || second ? Math.max(0, 1 - localTime / 0.16) : 0;
        const base = Math.sin(2 * Math.PI * (170 - localTime * 390) * localTime);
        const noise = Math.random() * 2 - 1;
        return (base * 0.18 + noise * 0.11) * envelope * (first + second);
      });
    }

    if (sound === 'whine') {
      return createSamples(0.62, (time, duration) => {
        const frequency = 460 + 310 * (time / duration);
        return Math.sin(2 * Math.PI * frequency * time) * 0.15;
      });
    }

    if (sound === 'sniff') {
      return createSamples(0.42, time => {
        const pulseOne = time < 0.09 ? 1 - time / 0.09 : 0;
        const shifted = time - 0.21;
        const pulseTwo = shifted >= 0 && shifted < 0.1 ? 1 - shifted / 0.1 : 0;
        return (Math.random() * 2 - 1) * (pulseOne + pulseTwo) * 0.11;
      });
    }

    return null;
  }

  function encodeWav(samples) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeText = (offset, text) => {
      for (let index = 0; index < text.length; index++) view.setUint8(offset + index, text.charCodeAt(index));
    };

    writeText(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeText(8, 'WAVE');
    writeText(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, SAMPLE_RATE, true);
    view.setUint32(28, SAMPLE_RATE * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeText(36, 'data');
    view.setUint32(40, samples.length * 2, true);
    for (let index = 0; index < samples.length; index++) {
      view.setInt16(44 + index * 2, Math.round(clampSample(samples[index]) * 32767), true);
    }
    return buffer;
  }

  function cleanup() {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.removeAttribute('src');
      activeAudio = null;
    }
    if (activeUrl) {
      URL.revokeObjectURL(activeUrl);
      activeUrl = null;
    }
  }

  function play(sound) {
    if (Date.now() < disabledUntil) return false;
    const samples = samplesFor(sound);
    if (!samples) return false;
    cleanup();

    activeUrl = URL.createObjectURL(new Blob([encodeWav(samples)], { type: 'audio/wav' }));
    activeAudio = new Audio(activeUrl);
    activeAudio.volume = 0.72;
    activeAudio.addEventListener('ended', cleanup, { once: true });
    activeAudio.addEventListener('error', () => {
      disabledUntil = Date.now() + 30000;
      cleanup();
    }, { once: true });
    activeAudio.play().catch(() => {
      disabledUntil = Date.now() + 30000;
      cleanup();
    });
    return true;
  }

  window.petAudio = { play, unlock: () => true };
})();
