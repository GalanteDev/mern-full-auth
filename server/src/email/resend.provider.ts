import { Resend } from 'resend';
import { Provider } from '@nestjs/common';

export const RESEND_CLIENT = 'RESEND_CLIENT';

export const resendProvider: Provider = {
  provide: RESEND_CLIENT,
  useFactory: () => {
    return new Resend(process.env.RESEND_API_KEY);
  },
};
