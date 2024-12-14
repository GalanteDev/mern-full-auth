import { Module } from '@nestjs/common';
import { UserRepository } from '../database/repositories/user.repository';
import { VerificationCodeRepository } from '../database/repositories/verificationCode.repository';
import { AuthenticationService } from './services/authentication.service';
import { AuthenticationController } from './controllers/authentication.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy.js';
import { CookiesService } from './services/cookies.service';
import { JwtTokenService } from './services/jwt.service';
import { UtilsModule } from '../common/utils/utils.module.js';
import { SessionRepository } from '../database/repositories/session.respository.js';
import { DatabaseModule } from '../database/database.module.js';
import { UniqueCodeService } from '../common/utils/unique-code/unique-code.service.js';
import { EmailModule } from '../email/email.module.js';
import { EmailService } from '../email/email.service.js';
import { resendProvider } from '../email/resend.provider.js';

@Module({
  imports: [
    ConfigModule,
    UtilsModule,
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
      inject: [ConfigService],
    }),
    EmailModule,
  ],
  providers: [
    AuthenticationService,
    UserRepository,
    VerificationCodeRepository,
    JwtStrategy,
    JwtTokenService,
    CookiesService,
    SessionRepository,
    UniqueCodeService,
    ConfigService,
    EmailService,
    resendProvider,
  ],
  controllers: [AuthenticationController],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
