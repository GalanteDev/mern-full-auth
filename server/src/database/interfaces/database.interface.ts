export interface UserPreferences {
  enable2FA: boolean;
  emailNotification: boolean;
  twoFactorSecret?: string;
}
