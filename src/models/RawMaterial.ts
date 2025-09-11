// src/models/RawMaterial.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { Supplier } from './Supplier';

@modelOptions({
  schemaOptions: {
    collection: 'raw_materials',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ name: 1 })
@index({ code: 1 })
@index({ category: 1 })
@index({ supplier: 1 })
@index({ unit: 1 })
@index({ active: 1 })
@index({ createdAt: -1 })
export class RawMaterial {
  @prop({ required: true, unique: true, trim: true })
  public name!: string;

  @prop({ required: true, unique: true, trim: true })
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
  public storageLocation?: string;

  @prop({ trim: true })
  public batchNumber?: string;

  @prop()
  public expirationDate?: Date;

  @prop({ trim: true })
  public origin?: string; // País o región de origen

  @prop({ enum: ['excellent', 'good', 'fair', 'poor'], default: 'good' })
  public quality!: 'excellent' | 'good' | 'fair' | 'poor';

  @prop({ default: true })
  public active!: boolean;

  @prop({ type: () => [String], trim: true })
  public tags?: string[];

  @prop({ trim: true })
  public notes?: string;

  @prop({ type: () => Object })
  public specifications?: Record<string, any>; // Especificaciones técnicas

  @prop({ type: () => Object })
  public additionalData?: Record<string, any>;

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const RawMaterialModel = getModelForClass(RawMaterial);
