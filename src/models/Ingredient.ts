// src/models/Ingredient.ts
import { prop, getModelForClass, modelOptions, Severity, index } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    collection: 'ingredients',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ name: 1 })
@index({ category: 1 })
@index({ supplier: 1 })
@index({ stock: 1 })
export class Ingredient {
  @prop({ required: true, unique: true, trim: true })
  public name!: string;

  @prop({ required: true, trim: true })
  public description!: string;

  @prop({ required: true, trim: true })
  public supplier!: string;

  @prop({ required: true, min: 0, default: 0 })
  public stock!: number;

  @prop({ required: true, trim: true })
  public category!: string;
}

export const IngredientModel = getModelForClass(Ingredient);
