import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UniqueCodeService {
  /**
   * Generate a unique code
   * @returns A unique code string with a length of 25 characters
   */
  generateUniqueCode(): string {
    return uuidv4().replace(/-/g, '').substring(0, 25);
  }
}
