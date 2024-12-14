import { Injectable } from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { DateUtilsService } from '../../common/utils/date-time/date-time.service';

type CookiePayloadType = {
  res: Response;
  accessToken: string;
  refreshToken: string;
};

// Rutas definidas como constantes
const REFRESH_TOKEN_PATH = '/authentication/refresh';
const ACCESS_TOKEN_PATH = '/';

@Injectable()
export class CookiesService {
  private readonly defaults: CookieOptions;

  constructor(
    private readonly configService: ConfigService,
    private readonly dateUtilsService: DateUtilsService
  ) {
    // Configuración predeterminada para las cookies
    this.defaults = {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'strict'
          : 'lax',
    };
  }

  /**
   * Opciones para la cookie de refreshToken
   */
  getRefreshTokenCookieOptions(): CookieOptions {
    const expiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN');
    const expires = this.dateUtilsService.calculateExpirationDate(expiresIn);
    return {
      ...this.defaults,
      expires,
      path: REFRESH_TOKEN_PATH, // Usar la ruta predefinida
    };
  }

  /**
   * Opciones para la cookie de accessToken
   */
  getAccessTokenCookieOptions(): CookieOptions {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN');
    const expires = this.dateUtilsService.calculateExpirationDate(expiresIn);
    return {
      ...this.defaults,
      expires,
      path: ACCESS_TOKEN_PATH, // Usar la ruta predefinida
    };
  }

  /**
   * Configurar cookies de autenticación en la respuesta
   */
  setAuthenticationCookies({
    res,
    accessToken,
    refreshToken,
  }: CookiePayloadType): Response {
    return res
      .cookie('accessToken', accessToken, this.getAccessTokenCookieOptions())
      .cookie(
        'refreshToken',
        refreshToken,
        this.getRefreshTokenCookieOptions()
      );
  }

  clearAuthenticationCookies(res: Response): Response {
    return res
      .clearCookie('accessToken', { path: ACCESS_TOKEN_PATH })
      .clearCookie('refreshToken', { path: REFRESH_TOKEN_PATH });
  }
}
