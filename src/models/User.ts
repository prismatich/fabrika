// src/models/User.ts
import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';

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
export class User {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, unique: true, trim: true, lowercase: true })
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
