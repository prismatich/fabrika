// src/models/Customer.ts
import 'reflect-metadata';
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { Company } from './Company';

@modelOptions({
  schemaOptions: {
    collection: 'customers',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ company: 1 })
@index({ name: 1, company: 1 })
@index({ email: 1, company: 1 }, { unique: true })
@index({ phone: 1 })
@index({ active: 1 })
@index({ createdAt: -1 })
export class Customer {
  @prop({ ref: () => Company, required: true, type: () => String })
  public company!: Ref<Company>;

  @prop({ required: true, trim: true, type: String })
  public name!: string;

  @prop({ required: true, trim: true, type: String })
  public phone!: string;

  @prop({ required: true, trim: true, lowercase: true, type: String })
  public email!: string;

  @prop({ trim: true, type: String })
  public address?: string;

  @prop({ type: Date })
  public birthDate?: Date;

  @prop({ type: String, enum: ['M', 'F', 'O'] })
  public gender?: 'M' | 'F' | 'O';

  @prop({ default: true, type: Boolean })
  public active!: boolean;

  @prop({ trim: true, type: String })
  public preferences?: string;

  @prop({ trim: true, type: String })
  public notes?: string;
}

export const CustomerModel = getModelForClass(Customer);
