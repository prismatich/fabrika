// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  lastLogin?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
