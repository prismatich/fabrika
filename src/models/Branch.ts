// src/models/Branch.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { Company } from './Company';

@modelOptions({
  schemaOptions: {
    collection: 'branches',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ company: 1 })
@index({ name: 1, company: 1 })
@index({ code: 1, company: 1 }, { unique: true })
@index({ city: 1 })
export class Branch {
  @prop({ ref: () => Company, required: true })
  public company!: Ref<Company>;

  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, trim: true })
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
