import { ApiProperty } from '@nestjs/swagger';

export class RegisterDtoSwagger {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  name!: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email!: string;

  @ApiProperty({ example: 'securePassword123', description: 'User password' })
  password!: string;

  @ApiProperty({
    example: 'securePassword123',
    description: 'Password confirmation',
  })
  confirmPassword!: string;
}

export class LoginDtoSwagger {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email!: string;

  @ApiProperty({ example: 'securePassword123', description: 'User password' })
  password!: string;
}
