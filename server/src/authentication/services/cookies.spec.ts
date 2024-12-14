import { Test, TestingModule } from '@nestjs/testing';
import { CookiesService } from './cookies.service';
import { ConfigService } from '@nestjs/config';
import { DateUtilsService } from '../../common/utils/date-time/date-time.service';
import { Response } from 'express';

type Config = {
  BASE_PATH: string;
  JWT_REFRESH_EXPIRES_IN: string;
  JWT_EXPIRES_IN: string;
};

describe('CookiesService', () => {
  let cookiesService: CookiesService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;
  let dateUtilsService: DateUtilsService;

  const mockConfigService: Partial<ConfigService> = {
    get: jest.fn((key: string) => {
      const mockConfig: Config = {
        BASE_PATH: '/api',
        JWT_REFRESH_EXPIRES_IN: '7d',
        JWT_EXPIRES_IN: '15m',
      };
      return mockConfig[key as keyof Config];
    }),
  };

  const mockDateUtilsService: Partial<DateUtilsService> = {
    calculateExpirationDate: jest.fn((expiresIn: string) => {
      if (expiresIn === '7d') return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      if (expiresIn === '15m') return new Date(Date.now() + 15 * 60 * 1000);
      return new Date();
    }),
  };

  const mockResponse: Partial<Response> = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CookiesService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DateUtilsService, useValue: mockDateUtilsService },
      ],
    }).compile();

    cookiesService = module.get<CookiesService>(CookiesService);
    configService = module.get<ConfigService>(ConfigService);
    dateUtilsService = module.get<DateUtilsService>(DateUtilsService);
  });

  it('should be defined', () => {
    expect(cookiesService).toBeDefined();
  });

  describe('setAuthenticationCookies', () => {
    it('should set accessToken and refreshToken cookies with the correct options', () => {
      const accessToken = 'mockAccessToken';
      const refreshToken = 'mockRefreshToken';

      cookiesService.setAuthenticationCookies({
        res: mockResponse as Response,
        accessToken,
        refreshToken,
      });

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        accessToken,
        expect.objectContaining({
          expires: expect.any(Date),
          path: '/',
        })
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        refreshToken,
        expect.objectContaining({
          expires: expect.any(Date),
          path: '/api/auth/refresh',
        })
      );
    });
  });

  describe('clearAuthenticationCookies', () => {
    it('should clear accessToken and refreshToken cookies', () => {
      cookiesService.clearAuthenticationCookies(mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('accessToken');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refreshToken', {
        path: '/api/auth/refresh',
      });
    });
  });

  describe('getAccessTokenCookieOptions', () => {
    it('should return correct options for accessToken', () => {
      const jwtExpiresIn = '15m';
      const expirationDate = new Date(Date.now() + 15 * 60 * 1000);

      jest.spyOn(dateUtilsService, 'calculateExpirationDate').mockReturnValueOnce(expirationDate);

      const options = (cookiesService as any).getAccessTokenCookieOptions();

      expect(dateUtilsService.calculateExpirationDate).toHaveBeenCalledWith(jwtExpiresIn);
      expect(options).toEqual(
        expect.objectContaining({
          expires: expirationDate,
          path: '/',
          httpOnly: true,
        })
      );
    });
  });

  describe('getRefreshTokenCookieOptions', () => {
    it('should return correct options for refreshToken', () => {
      const jwtRefreshExpiresIn = '7d';
      const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      jest.spyOn(dateUtilsService, 'calculateExpirationDate').mockReturnValueOnce(expirationDate);

      const options = (cookiesService as any).getRefreshTokenCookieOptions();

      expect(dateUtilsService.calculateExpirationDate).toHaveBeenCalledWith(jwtRefreshExpiresIn);
      expect(options).toEqual(
        expect.objectContaining({
          expires: expirationDate,
          path: '/api/auth/refresh',
          httpOnly: true,
        })
      );
    });
  });
});
