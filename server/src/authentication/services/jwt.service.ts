import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { SessionDocument } from '../../database/models/session.model';
import { UserDocument } from '../../database/models/user.model';

export type AccessTPayload = {
  userId: UserDocument['_id'];
  sessionId: SessionDocument['_id'];
};

export type RefreshTPayload = {
  sessionId: SessionDocument['_id'];
};

@Injectable()
export class JwtTokenService {
  readonly accessTokenSignOptions: JwtSignOptions;
  readonly refreshTokenSignOptions: JwtSignOptions;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.accessTokenSignOptions = {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      secret: this.configService.get<string>('JWT_SECRET'),
      audience: ['user'],
    };

    this.refreshTokenSignOptions = {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      audience: ['user'],
    };
  }

  signAccessToken(payload: AccessTPayload): string {
    return this.jwtService.sign(payload, this.accessTokenSignOptions);
  }

  signRefreshToken(payload: RefreshTPayload): string {
    return this.jwtService.sign(payload, this.refreshTokenSignOptions);
  }

  verifyAccessToken<TPayload extends object = AccessTPayload>(
    token: string
  ): { payload?: TPayload; error?: string } {
    try {
      const payload = this.jwtService.verify<TPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return { payload };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error occurred' };
    }
  }

  verifyRefreshToken<TPayload extends object = RefreshTPayload>(
    token: string
  ): { payload?: TPayload; error?: string } {
    try {
      const payload = this.jwtService.verify<TPayload>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      return { payload };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error occurred' };
    }
  }
}
