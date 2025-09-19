// src/models/RawMaterial.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { Supplier } from './Supplier';
import { Company } from './Company';

@modelOptions({
  schemaOptions: {
    collection: 'raw_materials',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ company: 1 })
@index({ name: 1, company: 1 }, { unique: true })
@index({ code: 1, company: 1 }, { unique: true })
@index({ category: 1 })
@index({ supplier: 1 })
@index({ unit: 1 })
@index({ active: 1 })
@index({ createdAt: -1 })
export class RawMaterial {
  @prop({ ref: () => Company, required: true })
  public company!: Ref<Company>;

  @prop({ required: true, trim: true })
  public name!: string;

  @prop({ required: true, trim: true })
  public code!: string;

  @prop({ required: true, trim: true })
  public description!: string;

  @prop({ required: true, trim: true })
  public category!: string;

  @prop({ ref: () => Supplier })
  public supplier?: Ref<Supplier>;

  @prop({ required: true, trim: true })
  public unit!: string; // kg, litros, piezas, etc.

  @prop({ required: true, min: 0, default: 0 })
  public currentStock!: number;

  @prop({ required: true, min: 0 })
  public minimumStock!: number;

  @prop({ required: true, min: 0 })
  public maximumStock!: number;

  @prop({ required: true, min: 0 })
  public unitCost!: number; // Costo por unidad

  @prop({ required: true, min: 0 })
  public unitPrice!: number; // Precio de venta por unidad

  @prop({ trim: true })
  public batchNumber?: string;

  @prop({ default: true })
  public active!: boolean;

  @prop({ trim: true })
  public notes?: string;

  @prop({ type: () => Object })
  public additionalData?: Record<string, any>;

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const RawMaterialModel = getModelForClass(RawMaterial);
