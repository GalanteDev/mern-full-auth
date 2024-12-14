// src/database/repositories/verificationCode.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VerificationCodeDocument } from '../models/verificationCode.model';
import { BaseRepository } from './entity.repository';
import { VerificationEnum } from '../../common/enums/verification-code.enum.js';

@Injectable()
export class VerificationCodeRepository extends BaseRepository<VerificationCodeDocument> {
  constructor(
    @InjectModel('VerificationCode') private verificationCodeModel: Model<VerificationCodeDocument>
  ) {
    super(verificationCodeModel);
  }
  async findByVerificationCode(code: string): Promise<VerificationCodeDocument | null> {
    return this.verificationCodeModel
      .findOne({
        code,
        type: VerificationEnum.EMAIL_VERIFICATION,
        expiresAt: { $gte: new Date() },
      })
      .exec();
  }
}
