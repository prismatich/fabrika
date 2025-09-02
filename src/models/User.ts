// src/models/User.ts
import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';

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

  @prop()
  public lastLogin?: Date;

  @prop({ default: Date.now })
  public createdAt!: Date;
}

export const UserModel = getModelForClass(User);
