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
  @prop({ ref: () => Company, required: true, type: () => String })
  public company!: Ref<Company>;

  @prop({ required: true, trim: true, type: String })
  public name!: string;

  @prop({ required: true, trim: true, type: String })
  public code!: string;

  @prop({ required: true, trim: true, type: String })
  public description!: string;

  @prop({ required: true, trim: true, type: String })
  public category!: string;

  @prop({ ref: () => Supplier, type: () => String })
  public supplier?: Ref<Supplier>;

  @prop({ required: true, trim: true, type: String })
  public unit!: string; // kg, litros, piezas, etc.

  @prop({ required: true, min: 0, default: 0, type: Number })
  public currentStock!: number;

  @prop({ required: true, min: 0, type: Number })
  public minimumStock!: number;

  @prop({ required: true, min: 0, type: Number })
  public maximumStock!: number;

  @prop({ required: true, min: 0, type: Number })
  public unitCost!: number; // Costo por unidad

  @prop({ required: true, min: 0, type: Number })
  public unitPrice!: number; // Precio de venta por unidad

  @prop({ trim: true, type: String })
  public batchNumber?: string;

  @prop({ default: true, type: Boolean })
  public active!: boolean;

  @prop({ trim: true, type: String })
  public notes?: string;

  @prop({ type: Object })
  public additionalData?: Record<string, any>;

  @prop({ default: Date.now, type: Date })
  public createdAt!: Date;

  @prop({ default: Date.now, type: Date })
  public updatedAt!: Date;
}

export const RawMaterialModel = getModelForClass(RawMaterial);
