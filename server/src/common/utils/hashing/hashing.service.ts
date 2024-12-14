import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  private readonly saltRounds = 10; // Configurable según tus necesidades

  /**
   * Hash a given value
   * @param value - The value to hash
   * @returns The hashed value
   */
  async hashValue(value: string): Promise<string> {
    return await bcrypt.hash(value, this.saltRounds);
  }

  /**
   * Compare a value against a hash
   * @param value - The value to compare
   * @param hash - The hash to compare against
   * @returns True if they match, false otherwise
   */
  async compareValue(value: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(value, hash);
  }
}
