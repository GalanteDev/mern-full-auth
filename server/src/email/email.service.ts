import { Inject, Injectable } from '@nestjs/common';
import { RESEND_CLIENT } from './resend.provider';
import { Resend } from 'resend';

type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

@Injectable()
export class EmailService {
  private readonly mailerSender: string;

  constructor(@Inject(RESEND_CLIENT) private readonly resendClient: Resend) {
    this.mailerSender =
      process.env.NODE_ENV === 'development'
        ? `no-reply <onboarding@resend.dev>`
        : `no-reply <your-production-email@example.com>`;
  }

  async sendEmail({
    to,
    from = this.mailerSender,
    subject,
    text,
    html,
  }: Params): Promise<void> {
    await this.resendClient.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      text,
      subject,
      html,
    });
  }
}
