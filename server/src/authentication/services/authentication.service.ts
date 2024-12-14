import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../../database/repositories/user.repository';
import { RegisterDto, LoginDto } from '../interfaces/auth.interfaces';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { VerificationCodeRepository } from '../../database/repositories/verificationCode.repository';
import { VerificationEnum } from '../../common/enums/verification-code.enum';
import { Types } from 'mongoose';
import { Logger } from '@nestjs/common';
import { SessionRepository } from '../../database/repositories/session.respository';
import { JwtTokenService, RefreshTPayload } from '../services/jwt.service';
import { DateUtilsService } from '../../common/utils/date-time/date-time.service';
import { HashingService } from '../../common/utils/hashing/hashing.service';
import { UniqueCodeService } from '../../common/utils/unique-code/unique-code.service';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../email/email.service.js';
import { verifyEmailTemplate } from '../../email/templates/template.js';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger(AuthenticationService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly verificationCodeRepository: VerificationCodeRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly dateUtilsService: DateUtilsService,
    private readonly hashingService: HashingService,
    private readonly uniqueCodeService: UniqueCodeService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService
  ) {}

  public async register(registerData: RegisterDto) {
    const { name, email, password } = registerData;

    const existingUser = await this.userRepository.findOneByEmail(email);

    if (existingUser) {
      throw new ConflictException({
        message: 'User already exists with this email',
        error: HttpErrorByCode[409],
      });
    }

    const hashedPassword = await this.hashingService.hashValue(password);

    const newUser = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    const verification = await this.verificationCodeRepository.create({
      userId: newUser._id as Types.ObjectId,
      code: this.uniqueCodeService.generateUniqueCode(),
      type: VerificationEnum.EMAIL_VERIFICATION,
      expiresAt: this.dateUtilsService.fortyFiveMinutesFromNow(),
    });

    const verificationUrl = `${process.env.APP_ORIGIN}/confirm-account?code=${verification.code}`;

    await this.emailService.sendEmail({
      to: newUser.email,
      ...verifyEmailTemplate(verificationUrl),
    });

    return { user: newUser };
  }

  public async login(loginData: LoginDto, userAgent: string) {
    const { email, password } = loginData;

    this.logger.log(`Login attempt for email: ${email}`);
    const user = await this.userRepository.findOneByEmail(email);

    if (!user) {
      this.logger.warn(`Login failed: User with email ${email} not found`);
      throw new BadRequestException({
        message: 'Invalid email or password provided',
        error: HttpErrorByCode[400],
      });
    }

    const isPasswordValid = await this.hashingService.compareValue(
      password,
      user.password
    );
    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new BadRequestException({
        message: 'Invalid email or password provided',
        error: HttpErrorByCode[400],
      });
    }

    if (user.userPreferences.enable2FA) {
      this.logger.log(`2FA required for user ID: ${user._id}`);
      return {
        user: null,
        mfaRequired: true,
        accessToken: '',
        refreshToken: '',
      };
    }

    const expiredAt = this.dateUtilsService.thirtyDaysFromNow();

    this.logger.log(`Creating session for user ID: ${user._id}`);
    const session = await this.sessionRepository.create({
      userId: user._id as Types.ObjectId,
      userAgent,
      expiredAt,
    });

    this.logger.log(`Signing tokens for user ID: ${user._id}`);
    const accessToken = this.jwtTokenService.signAccessToken({
      userId: user._id,
      sessionId: session._id,
    });

    const refreshToken = this.jwtTokenService.signRefreshToken({
      sessionId: session._id,
    });

    this.logger.log(`Login successful for user ID: ${user._id}`);
    return {
      user,
      accessToken,
      refreshToken,
      mfaRequired: false,
    };
  }

  public async validateUser(userId: string) {
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  public async refreshToken(refreshToken: string) {
    const secret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_REFRESH_SECRET is not defined in environment variables'
      );
    }

    const { payload, error } =
      this.jwtTokenService.verifyRefreshToken<RefreshTPayload>(refreshToken);

    if (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!payload || typeof payload.sessionId !== 'string') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessionRepository.findById(
      new Types.ObjectId(payload.sessionId)
    );
    if (!session) {
      throw new UnauthorizedException('Session does not exist');
    }
    if (session.expiredAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    const sessionRequireRefresh =
      session.expiredAt.getTime() - Date.now() <=
      DateUtilsService.ONE_DAY_IN_MS;

    if (sessionRequireRefresh) {
      session.expiredAt = this.dateUtilsService.calculateExpirationDate(
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')
      );
      await this.sessionRepository.update(String(session._id), session);
    }

    const newRefreshToken = sessionRequireRefresh
      ? this.jwtTokenService.signRefreshToken({ sessionId: session._id })
      : undefined;

    const accessToken = this.jwtTokenService.signAccessToken({
      userId: session._id,
      sessionId: session._id,
    });

    return {
      accessToken,
      newRefreshToken,
    };
  }

  public async verifyEmail(code: string) {
    const validCode =
      await this.verificationCodeRepository.findByVerificationCode(code);

    if (!validCode) {
      throw new BadRequestException({
        message: 'Invalid or expired verification code',
        error: HttpErrorByCode[400],
      });
    }

    const updatedUser = await this.userRepository.findByIdAndUpdate(
      validCode.userId
    );

    if (!updatedUser) {
      throw new BadRequestException({
        message: 'Unabble to verify email address',
        error: HttpErrorByCode[400],
      });
    }

    validCode.deleteOne();

    return { user: updatedUser };
  }
}
