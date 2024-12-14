import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './models/user.model';
import { VerificationCodeSchema } from './models/verificationCode.model';
import { SessionSchema } from './models/session.model';
import { UserRepository } from './repositories/user.repository';
import { VerificationCodeRepository } from './repositories/verificationCode.repository';
import { SessionRepository } from './repositories/session.respository';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'VerificationCode', schema: VerificationCodeSchema },
      { name: 'Session', schema: SessionSchema },
    ]),
  ],
  providers: [UserRepository, VerificationCodeRepository, SessionRepository],
  exports: [
    UserRepository,
    VerificationCodeRepository,
    SessionRepository,
    MongooseModule,
  ],
})
export class DatabaseModule {}
