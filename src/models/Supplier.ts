// src/models/Supplier.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    collection: 'suppliers',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ name: 1 })
@index({ email: 1 })
@index({ phone: 1 })
export class Supplier {
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
