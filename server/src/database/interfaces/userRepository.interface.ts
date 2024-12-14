import { UserDocument } from '../models/user.model';

export interface IUserRepository {
  findOneByEmail(email: string): Promise<UserDocument | null>;
  create(data: Partial<UserDocument>): Promise<UserDocument>;
}
