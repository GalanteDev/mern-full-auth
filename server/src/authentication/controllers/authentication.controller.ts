import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from '../interfaces/auth.interfaces';
import { AuthenticationService } from '../services/authentication.service';
import {
  loginSchema,
  verificationEmailSchema,
} from '../validators/auth.validator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CookiesService } from '../services/cookies.service';
import { Response } from 'express';

type CustomRequest = {
  cookies: { refreshToken?: string };
  headers: Record<string, string | string[]>;
};

@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly cookiesService: CookiesService
  ) {}

  @Post('register')
  async register(@Body() registerData: RegisterDto) {
    return this.authService.register(registerData);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req()
    req: Request & {
      headers: { 'user-agent'?: string };
    },
    @Res() res: Response,
    @Body() loginData: LoginDto
  ) {
    const userAgent = req.headers['user-agent'];
    const body: LoginDto = loginSchema.parse({
      email: loginData.email,
      password: loginData.password,
      userAgent: userAgent || '',
    });

    const { user, accessToken, refreshToken, mfaRequired } =
      await this.authService.login(body, userAgent || '');

    if (mfaRequired) {
      res.status(HttpStatus.OK).json({
        message: 'Verify MFA authentication',
        mfaRequired,
        user,
      });
      return;
    }

    this.cookiesService.setAuthenticationCookies({
      res,
      accessToken,
      refreshToken,
    });

    res.status(HttpStatus.OK).json({
      message: 'User login successfully',
      mfaRequired,
      user,
    });
  }

  @Get('refresh-token')
  async refreshToken(
    @Req() req: CustomRequest,
    @Res() res: Response
  ): Promise<any> {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new HttpException(
        'Refresh token not found',
        HttpStatus.UNAUTHORIZED
      );
    }

    const { accessToken, newRefreshToken } =
      await this.authService.refreshToken(refreshToken);

    if (newRefreshToken) {
      res.cookie(
        'refreshToken',
        newRefreshToken,
        this.cookiesService.getRefreshTokenCookieOptions()
      );
    }

    res
      .status(HttpStatus.OK)
      .cookie(
        'accessToken',
        accessToken,
        this.cookiesService.getAccessTokenCookieOptions()
      )
      .json({
        message: 'Refresh access token successfully',
      });
  }

  @Post('verify/email')
  async verifyEmail(
    @Body() body: { email: string; verificationCode: string },
    @Res() res: Response
  ) {
    const { code } = verificationEmailSchema.parse(body);

    await this.authService.verifyEmail(code);

    return res.status(HttpStatus.OK).json({
      message: 'Email verified successfully',
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('protected')
  getProtectedResource() {
    return { message: 'This is a protected resource' };
  }
}
