// src/models/Recipe.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { User } from './User';
import { Ingredient } from './Ingredient';

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
@index({ name: 1 })
@index({ category: 1 })
@index({ difficulty: 1 })
@index({ preparationTime: 1 })
export class Recipe {
  @prop({ required: true, unique: true, trim: true })
  public name!: string;

  @prop({ required: true, trim: true })
  public description!: string;

  @prop({ required: true, trim: true })
  public instructions!: string;

  @prop({ required: true, min: 1 })
  public preparationTime!: number; // en minutos

  @prop({ required: true, min: 1 })
  public servings!: number;

  @prop({ required: true, trim: true })
  public category!: string;

  @prop({ ref: () => User })
  public creator?: Ref<User>;

  @prop({ default: true })
  public active!: boolean;

  @prop({ type: () => [Object] })
  public ingredients?: RecipeIngredient[];

  @prop({ default: Date.now })
  public createdAt!: Date;

  @prop({ default: Date.now })
  public updatedAt!: Date;
}

export const RecipeModel = getModelForClass(Recipe);
