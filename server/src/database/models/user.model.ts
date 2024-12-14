import { Schema, Document } from 'mongoose';
import { UserPreferences } from '../interfaces/database.interface';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  userPreferences: UserPreferences;
  comparePassword(value: string): Promise<boolean>;
}

const userPreferencesSchema = new Schema<UserPreferences>({
  enable2FA: { type: Boolean, default: false },
  emailNotification: { type: Boolean, default: true },
  twoFactorSecret: { type: String, required: false },
});

export const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    userPreferences: { type: userPreferencesSchema, default: {} },
  },
  {
    timestamps: true,
  }
);

// Método de instancia para comparar la contraseña (sin HashingService aquí)
UserSchema.methods.comparePassword = async function (value: string) {
  return this.password === value; // Comparación simplificada para ilustrar
};

// Transformación JSON (para eliminar campos sensibles)
UserSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.userPreferences.twoFactorSecret;
    return ret;
  },
});
