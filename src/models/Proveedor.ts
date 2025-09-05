// src/models/Proveedor.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    collection: 'proveedores',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ nombre: 1 })
@index({ email: 1 })
@index({ telefono: 1 })
export class Proveedor {
  @prop({ required: true, trim: true })
  public nombre!: string;

  @prop({ required: true, trim: true })
  public email!: string;

  @prop({ required: true, trim: true })
  public telefono!: string;

  @prop({ trim: true })
  public direccion?: string;

  @prop({ trim: true })
  public ciudad?: string;

  @prop({ default: true })
  public activo!: boolean;

  @prop({ type: () => Object })
  public datosAdicionales?: Record<string, any>;
}

export const ProveedorModel = getModelForClass(Proveedor);
