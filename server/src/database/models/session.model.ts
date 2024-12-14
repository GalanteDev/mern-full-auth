import { Schema, Document, Types } from 'mongoose';

export interface SessionDocument extends Document {
  userId: Types.ObjectId;
  userAgent?: string;
  expiredAt: Date;
  createdAt: Date;
}

export const SessionSchema = new Schema<SessionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  userAgent: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiredAt: {
    type: Date,
    required: true,
  },
});
