import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UtilsModule } from './common/utils/utils.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DatabaseModule,
    AuthenticationModule,
    UtilsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
