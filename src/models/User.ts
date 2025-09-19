// src/models/User.ts
import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { Company } from './Company';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  ADMIN_SUCURSAL = 'adminSucursal',
  SUPERADMIN = 'superadmin'
}

@modelOptions({
  schemaOptions: {
    collection: 'users',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
export class User {
  @prop({ ref: () => Company, required: true, type: () => String })
  public company!: Ref<Company>;

  @prop({ required: true, trim: true, type: String })
  public name!: string;

  @prop({ required: true, trim: true, lowercase: true, type: String })
  public email!: string;

  @prop({ required: true, type: String })
  public password!: string;

  @prop({ 
    type: String,
    enum: Object.values(UserRole), 
    default: UserRole.USER 
  })
  public role!: UserRole;

  @prop({ type: Date })
  public lastLogin?: Date;

  @prop({ default: true, type: Boolean })
  public active!: boolean;
}

export const UserModel = getModelForClass(User);
