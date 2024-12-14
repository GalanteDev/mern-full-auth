import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { resendProvider } from './resend.provider.js';

@Module({
  providers: [EmailService, resendProvider],
  exports: [EmailService, resendProvider],
})
export class EmailModule {}
