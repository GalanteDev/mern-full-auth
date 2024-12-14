import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from '../services/authentication.service';
import { CookiesService } from '../services/cookies.service';
import { Response } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { UserDocument } from '../../database/models/user.model';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;
  let authService: AuthenticationService;
  let cookiesService: CookiesService;
  let res: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: CookiesService,
          useValue: {
            setAuthenticationCookies: jest.fn(),
            clearAuthenticationCookies: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
    authService = module.get<AuthenticationService>(AuthenticationService);
    cookiesService = module.get<CookiesService>(CookiesService);
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  });

  describe('login', () => {
    it('should login successfully and set cookies', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };

      // Mocked full UserDocument structure
      const userDocumentMock = {
        _id: '1',
        email: 'test@test.com',
        name: 'Test User',
        password: 'hashedpassword',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as UserDocument;

      const loginResponse = {
        user: userDocumentMock, // Using the full mock UserDocument
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        mfaRequired: false,
      };

      jest.spyOn(authService, 'login').mockResolvedValue(loginResponse);
      jest.spyOn(cookiesService, 'setAuthenticationCookies').mockReturnValue(res);

      await controller.login({ headers: { 'user-agent': 'test-agent' } } as any, res, loginDto);

      expect(authService.login).toHaveBeenCalledWith(
        { ...loginDto, userAgent: 'test-agent' },
        'test-agent'
      );
      expect(cookiesService.setAuthenticationCookies).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return mfaRequired if MFA is enabled', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };

      // Mocked full UserDocument structure
      const userDocumentMock = {
        _id: '1',
        email: 'test@test.com',
        name: 'Test User',
        password: 'hashedpassword',
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as UserDocument;

      const loginResponse = {
        user: userDocumentMock, // Using the full mock UserDocument
        accessToken: '',
        refreshToken: '',
        mfaRequired: true,
      };

      jest.spyOn(authService, 'login').mockResolvedValue(loginResponse);

      await controller.login({ headers: { 'user-agent': 'test-agent' } } as any, res, loginDto);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Verify MFA authentication',
        mfaRequired: true,
        user: loginResponse.user,
      });
    });

    it('should handle invalid credentials', async () => {
      const loginDto = { email: 'test@test.com', password: 'wrongpassword' };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(
        controller.login({ headers: { 'user-agent': 'test-agent' } } as any, res, loginDto)
      ).rejects.toThrowError(UnauthorizedException);
    });
  });
});
