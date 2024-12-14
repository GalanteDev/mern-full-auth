import { Schema, Document, Types as MongooseTypes } from 'mongoose';
import { VerificationEnum } from '../../common/enums/verification-code.enum';

export interface VerificationCodeDocument extends Document {
  userId: MongooseTypes.ObjectId;
  code: string;
  type: VerificationEnum;
  expiresAt: Date;
  createdAt: Date;
}

export const VerificationCodeSchema = new Schema<VerificationCodeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: true,
    },
    code: {
      type: String,
      unique: true,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    collection: 'verification_codes',
  }
);
