// src/models/Branch.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    collection: 'branches',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ name: 1 })
@index({ code: 1 })
@index({ city: 1 })
export class Branch {
  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, unique: true, trim: true })
  public code!: string;

  @prop({ required: true, trim: true })
  public address!: string;

  @prop({ required: true, trim: true })
  public city!: string;

  @prop({ trim: true })
  public phone?: string;

  @prop({ trim: true })
  public email?: string;

  @prop({ default: true })
  public active!: boolean;

  @prop({ type: () => Object })
  public additionalData?: Record<string, any>;
}

export const BranchModel = getModelForClass(Branch);
