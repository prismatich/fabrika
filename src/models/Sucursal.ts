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
@index({ activa: 1 })
@index({ personaACargo: 1 })
export class Sucursal {
  @prop({ required: true, unique: true, trim: true })
  public nombre!: string;

  @prop({ required: true, trim: true })
  public direccion!: string;

  @prop({ required: true, trim: true })
  public personaACargo!: string;

  @prop({ required: true, trim: true })
  public telefono!: string;

  @prop({ trim: true, lowercase: true })
  public email?: string;

  @prop({ default: true })
  public activa!: boolean;

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const SucursalModel = getModelForClass(Sucursal);
