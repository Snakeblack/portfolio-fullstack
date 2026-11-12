const madridFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Madrid',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export interface MadridClock {
  /** Hora de Madrid, 0-23. */
  hour: number;
  /** «18:42». */
  label: string;
  /** Entre las 22:00 y las 6:59, cuando no se espera respuesta. */
  night: boolean;
}

export function madridClock(date: Date): MadridClock {
  const parts = madridFormat.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  return { hour, label: `${hour}:${minute}`, night: hour >= 22 || hour < 7 };
}
