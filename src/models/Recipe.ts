// src/models/Recipe.ts
import 'reflect-metadata';
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { User } from './User';
import { Ingredient } from './Ingredient';
import { Company } from './Company';

  // Interfaz para ingredientes de receta con materias primas
export interface RecipeIngredient {
  rawMaterialId: string;
  quantity: number;
  unit: string;
}

@modelOptions({
  schemaOptions: {
    collection: 'recipes',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ company: 1 })
@index({ name: 1, company: 1 }, { unique: true })
@index({ category: 1 })
@index({ difficulty: 1 })
@index({ preparationTime: 1 })
export class Recipe {
  @prop({ ref: () => Company, required: true, type: () => String })
  public company!: Ref<Company>;

  @prop({ required: true, trim: true, type: String })
  public name!: string;

  @prop({ required: true, trim: true, type: String })
  public description!: string;

  @prop({ required: true, trim: true, type: String })
  public instructions!: string;

  @prop({ required: true, min: 1, type: Number })
  public preparationTime!: number; // en minutos

  @prop({ required: true, min: 1, type: Number })
  public servings!: number;

  @prop({ required: true, trim: true, type: String })
  public category!: string;

  @prop({ ref: () => User, type: () => String })
  public creator?: Ref<User>;

  @prop({ default: true, type: Boolean })
  public active!: boolean;

  @prop({ type: [Object] })
  public ingredients?: RecipeIngredient[];

  @prop({ default: Date.now, type: Date })
  public createdAt!: Date;

  @prop({ default: Date.now, type: Date })
  public updatedAt!: Date;
}

export const RecipeModel = getModelForClass(Recipe);
