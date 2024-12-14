import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SessionDocument } from '../models/session.model';
import { BaseRepository } from './entity.repository';

@Injectable()
export class SessionRepository extends BaseRepository<SessionDocument> {
  constructor(@InjectModel('Session') private sessionModel: Model<SessionDocument>) {
    super(sessionModel);
  }

  async findById(sessionId: Types.ObjectId): Promise<SessionDocument | null> {
    return this.sessionModel.findById(sessionId).exec();
  }

  async update(id: string, sessionData: Partial<SessionDocument>): Promise<SessionDocument | null> {
    const objectId = new Types.ObjectId(id);
    return this.sessionModel.findByIdAndUpdate(objectId, sessionData, { new: true }).exec();
  }
}
