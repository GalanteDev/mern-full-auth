// import { ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
// import { TestingModule, Test } from '@nestjs/testing';
// import { Types } from 'mongoose';
// import { VerificationEnum } from '../../common/enums/verification-code.enum';
// import { DateUtilsService } from '../../common/utils/date-time/date-time.service';
// import { HashingService } from '../../common/utils/hashing/hashing.service';
// import { UserDocument } from '../../database/models/user.model';
// import { RegisterDto, LoginDto } from '../interfaces/auth.interfaces';
// import { AuthenticationService } from './authentication.service';
// import { JwtTokenService } from './jwt.service';
// import { SessionDocument } from '../../database/models/session.model';
// import { SessionRepository } from '../../database/repositories/session.respository';
// import { UserRepository } from '../../database/repositories/user.repository';
// import { VerificationCodeRepository } from '../../database/repositories/verificationCode.repository';
// import { UniqueCodeService } from '../../common/utils/unique-code/unique-code.service';

// describe('AuthenticationService', () => {
//   let service: AuthenticationService;
//   let userRepository: UserRepository;
//   let verificationCodeRepository: VerificationCodeRepository;
//   let sessionRepository: SessionRepository;
//   let jwtTokenService: JwtTokenService;
//   let dateUtilsService: DateUtilsService;
//   let hashingService: HashingService;
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   let uniqueCodeService: UniqueCodeService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthenticationService,
//         {
//           provide: UserRepository,
//           useValue: {
//             findOneByEmail: jest.fn(),
//             create: jest.fn(),
//             findOneById: jest.fn(),
//           },
//         },
//         {
//           provide: VerificationCodeRepository,
//           useValue: {
//             create: jest.fn(),
//           },
//         },
//         {
//           provide: SessionRepository,
//           useValue: {
//             create: jest.fn(),
//           },
//         },
//         {
//           provide: JwtTokenService,
//           useValue: {
//             signJwtToken: jest.fn(),
//           },
//         },
//         {
//           provide: DateUtilsService,
//           useValue: {
//             fortyFiveMinutesFromNow: jest
//               .fn()
//               .mockReturnValue(new Date('2024-12-06T23:02:00.745Z')),
//             thirtyDaysFromNow: jest.fn(),
//           },
//         },
//         {
//           provide: HashingService,
//           useValue: {
//             hashValue: jest.fn(),
//             compareValue: jest.fn(),
//           },
//         },
//         {
//           provide: UniqueCodeService,
//           useValue: {
//             generateUniqueCode: jest.fn().mockReturnValue('mockedUniqueCode'),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<AuthenticationService>(AuthenticationService);
//     userRepository = module.get<UserRepository>(UserRepository);
//     verificationCodeRepository = module.get<VerificationCodeRepository>(VerificationCodeRepository);
//     sessionRepository = module.get<SessionRepository>(SessionRepository);
//     jwtTokenService = module.get<JwtTokenService>(JwtTokenService);
//     dateUtilsService = module.get<DateUtilsService>(DateUtilsService);
//     hashingService = module.get<HashingService>(HashingService);
//     uniqueCodeService = module.get<UniqueCodeService>(UniqueCodeService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('register', () => {
//     it('should create a new user and verification code', async () => {
//       const registerDto: RegisterDto = {
//         name: 'John Doe',
//         email: 'john@example.com',
//         password: 'password',
//         confirmPassword: 'password',
//       };

//       const newUser = {
//         _id: new Types.ObjectId(),
//         name: registerDto.name,
//         email: registerDto.email,
//         password: 'hashedpassword',
//         isEmailVerified: false,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         userPreferences: {
//           enable2FA: false,
//         },
//       } as UserDocument;

//       jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(null);
//       jest.spyOn(hashingService, 'hashValue').mockResolvedValue('hashedpassword');
//       jest.spyOn(userRepository, 'create').mockResolvedValue(newUser);

//       // Verifica los mocks de código único y fecha de expiración
//       const mockedCode = 'mockedUniqueCode';
//       const mockedDate = new Date();
//       mockedDate.setMinutes(mockedDate.getMinutes() + 45); // Fecha relativa a 45 minutos en el futuro

//       jest.spyOn(uniqueCodeService, 'generateUniqueCode').mockReturnValue(mockedCode);
//       jest.spyOn(dateUtilsService, 'fortyFiveMinutesFromNow').mockReturnValue(mockedDate);

//       const result = await service.register(registerDto);

//       expect(hashingService.hashValue).toHaveBeenCalledWith(registerDto.password);
//       expect(userRepository.create).toHaveBeenCalledWith({
//         name: registerDto.name,
//         email: registerDto.email,
//         password: 'hashedpassword',
//       });
//       expect(verificationCodeRepository.create).toHaveBeenCalledWith({
//         userId: newUser._id,
//         code: mockedCode,
//         type: VerificationEnum.EMAIL_VERIFICATION,
//         expiresAt: mockedDate,
//       });
//       expect(result).toEqual({ user: newUser });
//     });

//     it('should throw ConflictException if user already exists', async () => {
//       const registerDto: RegisterDto = {
//         name: 'John Doe',
//         email: 'john@example.com',
//         password: 'password',
//         confirmPassword: 'password',
//       };

//       jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue({} as UserDocument);

//       await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
//     });
//   });

//   describe('login', () => {
//     it('should create a new session and return tokens', async () => {
//       const loginDto: LoginDto = {
//         email: 'john@example.com',
//         password: 'password',
//       };
//       const user: UserDocument = {
//         _id: new Types.ObjectId(),
//         name: 'John Doe',
//         email: 'john@example.com',
//         password: 'hashedpassword',
//         isEmailVerified: false,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         userPreferences: {
//           enable2FA: false,
//         },
//       } as UserDocument;
//       const session = {
//         _id: new Types.ObjectId(),
//         userId: user._id,
//         userAgent: 'test-agent',
//         expiredAt: new Date(),
//         createdAt: new Date(),
//       } as SessionDocument;

//       jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(user);
//       jest.spyOn(hashingService, 'compareValue').mockResolvedValue(true);
//       jest.spyOn(sessionRepository, 'create').mockResolvedValue(session);
//       jest.spyOn(jwtTokenService, 'signJwtToken').mockReturnValue('fakeAccessToken');
//       jest.spyOn(dateUtilsService, 'thirtyDaysFromNow').mockReturnValue(new Date());

//       const result = await service.login(loginDto, 'test-agent');

//       expect(result).toEqual({
//         user,
//         accessToken: 'fakeAccessToken',
//         refreshToken: 'fakeAccessToken',
//         mfaRequired: false,
//       });
//       expect(userRepository.findOneByEmail).toHaveBeenCalledWith(loginDto.email);
//       expect(hashingService.compareValue).toHaveBeenCalledWith(loginDto.password, user.password);
//       expect(sessionRepository.create).toHaveBeenCalledWith({
//         userId: user._id,
//         userAgent: 'test-agent',
//         expiredAt: expect.any(Date),
//       });
//       expect(jwtTokenService.).toHaveBeenCalledWith({
//         userId: user._id,
//         sessionId: session._id,
//       });
//       expect(jwtTokenService.signJwtToken).toHaveBeenCalledWith(
//         {
//           sessionId: session._id,
//         },
//         expect.objectContaining({ expiresIn: '7d' })
//       );
//     });

//     it('should throw BadRequestException if user not found', async () => {
//       const loginDto: LoginDto = {
//         email: 'john@example.com',
//         password: 'password',
//       };

//       jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(null);

//       await expect(service.login(loginDto, 'test-agent')).rejects.toThrow(BadRequestException);
//     });

//     it('should throw BadRequestException if password is invalid', async () => {
//       const loginDto: LoginDto = {
//         email: 'john@example.com',
//         password: 'password',
//       };
//       const user: UserDocument = {
//         _id: new Types.ObjectId(),
//         name: 'John Doe',
//         email: 'john@example.com',
//         password: 'hashedpassword',
//         isEmailVerified: false,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         userPreferences: {
//           enable2FA: false,
//         },
//       } as UserDocument;

//       jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(user);
//       jest.spyOn(hashingService, 'compareValue').mockResolvedValue(false);

//       await expect(service.login(loginDto, 'test-agent')).rejects.toThrow(BadRequestException);
//     });

//     it('should return MFA required if 2FA is enabled', async () => {
//       const loginDto: LoginDto = {
//         email: 'john@example.com',
//         password: 'password',
//       };
//       const user: UserDocument = {
//         _id: new Types.ObjectId(),
//         name: 'John Doe',
//         email: 'john@example.com',
//         password: 'hashedpassword',
//         isEmailVerified: false,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         userPreferences: {
//           enable2FA: true,
//         },
//       } as UserDocument;

//       jest.spyOn(userRepository, 'findOneByEmail').mockResolvedValue(user);
//       jest.spyOn(hashingService, 'compareValue').mockResolvedValue(true);

//       const result = await service.login(loginDto, 'test-agent');

//       expect(result).toEqual({
//         user: null,
//         mfaRequired: true,
//         accessToken: '',
//         refreshToken: '',
//       });
//     });
//   });

//   describe('validateUser', () => {
//     it('should validate the user successfully', async () => {
//       const userId = '1';
//       const userMock = {
//         _id: '1',
//         email: 'test@test.com',
//         name: 'Test User',
//         password: 'hashedpassword',
//         isEmailVerified: true,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       } as UserDocument;

//       jest.spyOn(userRepository, 'findOneById').mockResolvedValue(userMock);

//       const result = await service.validateUser(userId);

//       expect(result).toEqual(userMock);
//     });

//     it('should throw an UnauthorizedException if user is not found', async () => {
//       const userId = '1';

//       jest.spyOn(userRepository, 'findOneById').mockResolvedValue(null);

//       await expect(service.validateUser(userId)).rejects.toThrow(UnauthorizedException);
//     });
//   });
// });
