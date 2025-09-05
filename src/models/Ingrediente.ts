// src/models/Ingrediente.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    collection: 'ingredientes',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ nombre: 1 })
@index({ categoria: 1 })
@index({ proveedor: 1 })
@index({ stock: 1 })
export class Ingrediente {
  @prop({ required: true, unique: true, trim: true })
  public nombre!: string;

  @prop({ required: true, trim: true })
  public descripcion!: string;

  @prop({ required: true, trim: true })
  public proveedor!: string;

  @prop({ required: true, min: 0, default: 0 })
  public stock!: number;

  @prop({ required: true, trim: true })
  public categoria!: string;
}

export const IngredienteModel = getModelForClass(Ingrediente);