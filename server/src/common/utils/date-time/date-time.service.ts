import { Injectable } from '@nestjs/common';
import { add, sub } from 'date-fns';

@Injectable()
export class DateUtilsService {
  // Constante para un día en milisegundos
  public static readonly ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

  // Devuelve la fecha de 30 días a partir de la fecha actual
  thirtyDaysFromNow(): Date {
    return add(new Date(), { days: 30 });
  }

  // Devuelve la fecha de 45 minutos a partir de la fecha actual
  fortyFiveMinutesFromNow(): Date {
    return add(new Date(), { minutes: 45 });
  }

  // Devuelve la fecha de 10 minutos atrás
  tenMinutesAgo(): Date {
    return sub(new Date(), { minutes: 10 });
  }

  // Devuelve la fecha de 3 minutos atrás
  threeMinutesAgo(): Date {
    return sub(new Date(), { minutes: 3 });
  }

  // Devuelve la fecha de 1 hora a partir de la fecha actual
  anHourFromNow(): Date {
    return add(new Date(), { hours: 1 });
  }

  // Calcula la fecha de expiración basada en el formato proporcionado
  calculateExpirationDate(expiresIn: string = '15m'): Date {
    const match = expiresIn.match(/^(\d+)([mhd])$/);
    if (!match) {
      throw new Error('Invalid format. Use "15m", "1h", or "2d".');
    }

    const [, value, unit] = match;
    const duration = parseInt(value, 10);

    // Calcula la fecha de expiración según la unidad
    switch (unit) {
      case 'm':
        return add(new Date(), { minutes: duration });
      case 'h':
        return add(new Date(), { hours: duration });
      case 'd':
        return add(new Date(), { days: duration });
      default:
        throw new Error('Invalid unit. Use "m", "h", or "d".');
    }
  }
}
