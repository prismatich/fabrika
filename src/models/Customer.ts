// src/models/Customer.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    collection: 'customers',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ name: 1 })
@index({ email: 1 })
@index({ phone: 1 })
@index({ active: 1 })
@index({ createdAt: -1 })
export class Customer {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, trim: true })
  public phone!: string;

  @prop({ required: true, unique: true, trim: true, lowercase: true })
  public email!: string;

  @prop({ trim: true })
  public address?: string;

  @prop()
  public birthDate?: Date;

  @prop({ enum: ['male', 'female', 'other'] })
  public gender?: 'male' | 'female' | 'other';

  @prop({ default: true })
  public active!: boolean;

  @prop({ type: () => [String], trim: true })
  public preferences?: string[];

  @prop({ trim: true })
  public notes?: string;

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const CustomerModel = getModelForClass(Customer);
