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

import { AuthenticationService } from '../services/authentication.service';
import {
  loginSchema,
  verificationEmailSchema,
} from '../validators/auth.validator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CookiesService } from '../services/cookies.service';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDtoSwagger } from '../dtos/Swagger.interfaces.js';
import { LoginDto, RegisterDto } from '../dtos/register.interfaces.js';

type CustomRequest = {
  cookies: { refreshToken?: string };
  headers: Record<string, string | string[]>;
};
@ApiTags('Authentication')
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly cookiesService: CookiesService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerData: RegisterDto) {
    return this.authService.register(registerData);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in an existing user' })
  @ApiResponse({
    status: 200,
    description:
      'User logged in successfully. Cookies are set for authentication.',
    headers: {
      'Set-Cookie': {
        description: 'Authentication cookies (accessToken, refreshToken)',
        schema: {
          type: 'string',
          example:
            'accessToken=eyJhbGci...; HttpOnly; Path=/; Secure, refreshToken=eyJhbGci...; HttpOnly; Path=/; Secure',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid email or password' })
  @ApiBody({ type: LoginDtoSwagger })
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
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Refresh access token using refresh token stored in cookies',
  })
  @ApiResponse({
    status: 200,
    description:
      'Access token refreshed successfully. Cookies for authentication are updated.',
    headers: {
      'Set-Cookie': {
        description:
          'New cookies (accessToken, refreshToken) are set in the response.',
        schema: {
          type: 'string',
          example:
            'accessToken=eyJhbGci...; HttpOnly; Path=/; Secure, refreshToken=eyJhbGci...; HttpOnly; Path=/; Secure',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token not found or invalid',
  })
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
  @ApiOperation({ summary: 'Verify email address using a verification code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired verification code',
  })
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
  @ApiBearerAuth() // Indica que este endpoint requiere autenticación JWT
  @ApiOperation({ summary: 'Access a protected resource' })
  @ApiResponse({
    status: 200,
    description: 'Access granted to protected resource',
  })
  getProtectedResource() {
    return { message: 'This is a protected resource' };
  }
}
