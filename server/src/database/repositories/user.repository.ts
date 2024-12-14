// src/database/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from '../models/user.model';
import { BaseRepository } from './entity.repository';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel('User') private userModel: Model<UserDocument>) {
    super(userModel);
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByIdAndUpdate(userId: Types.ObjectId) {
    return this.userModel
      .findByIdAndUpdate(
        userId,
        {
          isEmailVerified: true,
        },
        { new: true }
      )
      .exec();
  }
}
