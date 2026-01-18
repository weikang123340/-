
import { TimeParts, PaceParts } from '../types';

export function toTotalSeconds(parts: TimeParts): number {
  const h = parseInt(parts.hours || '0', 10);
  const m = parseInt(parts.minutes || '0', 10);
  const s = parseInt(parts.seconds || '0', 10);
  return h * 3600 + m * 60 + s;
}

export function fromTotalSeconds(totalSeconds: number): TimeParts {
  const h = Math.floor(totalSeconds / 3600);
  const remainder = totalSeconds % 3600;
  const m = Math.floor(remainder / 60);
  const s = Math.round(remainder % 60);
  return {
    hours: h.toString(),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0')
  };
}

export function paceToSecondsPerKm(parts: PaceParts): number {
  const m = parseInt(parts.minutes || '0', 10);
  const s = parseInt(parts.seconds || '0', 10);
  return m * 60 + s;
}

export function secondsPerKmToPace(totalSeconds: number): PaceParts {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.round(totalSeconds % 60);
  return {
    minutes: m.toString(),
    seconds: s.toString().padStart(2, '0')
  };
}
