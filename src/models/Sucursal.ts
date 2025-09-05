// src/models/Sucursal.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    collection: 'sucursales',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ nombre: 1 })
@index({ codigo: 1 })
@index({ ciudad: 1 })
export class Sucursal {
  @prop({ required: true, trim: true })
  public nombre!: string;

  @prop({ required: true, unique: true, trim: true })
  public codigo!: string;

  @prop({ required: true, trim: true })
  public direccion!: string;

  @prop({ required: true, trim: true })
  public ciudad!: string;

  @prop({ trim: true })
  public telefono?: string;

  @prop({ trim: true })
  public email?: string;

  @prop({ default: true })
  public activa!: boolean;

  @prop({ type: () => Object })
  public datosAdicionales?: Record<string, any>;
}

export const SucursalModel = getModelForClass(Sucursal);
