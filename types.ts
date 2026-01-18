
export type CalcMode = 'PACE' | 'TIME' | 'DISTANCE';

export interface TimeParts {
  hours: string;
  minutes: string;
  seconds: string;
}

export interface PaceParts {
  minutes: string;
  seconds: string;
}

export interface CommonDistance {
  label: string;
  value: number; // in km
}
