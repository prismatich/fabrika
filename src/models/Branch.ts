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
  @prop({ ref: () => Company, required: true, type: () => String })
  public company!: Ref<Company>;

  @prop({ required: true, trim: true, type: String })
  public name!: string;

  @prop({ required: true, trim: true, type: String })
  public code!: string;

  @prop({ required: true, trim: true, type: String })
  public address!: string;

  @prop({ required: true, trim: true, type: String })
  public city!: string;

  @prop({ trim: true, type: String })
  public phone?: string;

  @prop({ trim: true, lowercase: true, type: String })
  public email?: string;

  @prop({ default: true, type: Boolean })
  public active!: boolean;
}

export const BranchModel = getModelForClass(Branch);
