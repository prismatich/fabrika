// src/models/Cliente.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    collection: 'clientes',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ nombre: 1 })
@index({ correo: 1 })
@index({ telefono: 1 })
@index({ activo: 1 })
@index({ createdAt: -1 })
export class Cliente {
  @prop({ required: true, trim: true })
  public nombre!: string;

  @prop({ required: true, trim: true })
  public telefono!: string;

  @prop({ required: true, unique: true, trim: true, lowercase: true })
  public correo!: string;

  @prop({ trim: true })
  public direccion?: string;

  @prop()
  public fechaNacimiento?: Date;

  @prop({ enum: ['masculino', 'femenino', 'otro'] })
  public genero?: 'masculino' | 'femenino' | 'otro';

  @prop({ default: true })
  public activo!: boolean;

  @prop({ type: () => [String], trim: true })
  public preferencias?: string[];

  @prop({ trim: true })
  public notas?: string;

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const ClienteModel = getModelForClass(Cliente);
