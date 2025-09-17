// src/models/User.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { Company } from './Company';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  AdminSucursal = 'adminSucursal',
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
@index({ company: 1 })
@index({ email: 1, company: 1 }, { unique: true })
export class User {
  @prop({ ref: () => Company, required: true })
  public company!: Ref<Company>;

  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, trim: true, lowercase: true })
  public email!: string;

  @prop({ required: true })
  public password!: string;

  @prop({ 
    type: String, 
    enum: UserRole, 
    default: UserRole.USER 
  })
  public role!: UserRole;

  @prop()
  public lastLogin?: Date;
}

export const UserModel = getModelForClass(User);
