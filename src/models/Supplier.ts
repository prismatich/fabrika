// src/models/Supplier.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { Company } from './Company';

@modelOptions({
  schemaOptions: {
    collection: 'suppliers',
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
export class Supplier {
  @prop({ ref: () => Company, required: true })
  public company!: Ref<Company>;

  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, trim: true })
  public email!: string;

  @prop({ required: true, trim: true })
  public phone!: string;

  @prop({ trim: true })
  public address?: string;

  @prop({ trim: true })
  public city?: string;

  @prop({ default: true })
  public active!: boolean;

  @prop({ type: () => Object })
  public additionalData?: Record<string, any>;
}

export const SupplierModel = getModelForClass(Supplier);
