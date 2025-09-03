// src/models/Receta.ts
import { prop, getModelForClass, modelOptions, Severity, index, Ref } from '@typegoose/typegoose';
import { User } from './User';
import { Ingrediente } from './Ingrediente.ts';

@modelOptions({
  schemaOptions: {
    collection: 'recetas',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ nombre: 1 })
@index({ categoria: 1 })
@index({ dificultad: 1 })
@index({ tiempoPreparacion: 1 })
export class Receta {
  @prop({ required: true, unique: true, trim: true })
  public nombre!: string;

  @prop({ required: true, trim: true })
  public descripcion!: string;

  @prop({ required: true, trim: true })
  public instrucciones!: string;

  @prop({ required: true, enum: ['facil', 'medio', 'dificil'], default: 'medio' })
  public dificultad!: 'facil' | 'medio' | 'dificil';

  @prop({ required: true, min: 1 })
  public tiempoPreparacion!: number; // en minutos

  @prop({ required: true, min: 1 })
  public porciones!: number;

  @prop({ required: true, trim: true })
  public categoria!: string;

  @prop({ type: () => [String], trim: true })
  public tags?: string[];

  @prop({ type: () => [String], trim: true })
  public alergenos?: string[];

  @prop({ type: () => [String], trim: true })
  public utensilios?: string[];

  @prop({ type: () => [String], trim: true })
  public tecnicas?: string[];

  @prop({ ref: () => User })
  public creador?: Ref<User>;

  @prop({ default: true })
  public activa!: boolean;

  @prop({ default: 0 })
  public calificacionPromedio!: number;

  @prop({ default: 0 })
  public numeroCalificaciones!: number;

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const RecetaModel = getModelForClass(Receta); 
