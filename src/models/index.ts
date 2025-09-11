// src/models/index.ts
// Exportar todos los modelos Typegoose

export { User, UserModel } from './User';
export { Ingredient, IngredientModel } from './Ingredient';
export { Recipe, RecipeModel } from './Recipe';
export { RawMaterial, RawMaterialModel } from './RawMaterial';
export { Customer, CustomerModel } from './Customer';
export { Supplier, SupplierModel } from './Supplier';
export { Branch, BranchModel } from './Branch';
export { Log, LogModel } from './Log';

// Tipos de exportación para uso en otros archivos
export type { User as IUser } from './User';
export type { Ingredient as IIngredient } from './Ingredient';
export type { Recipe as IRecipe } from './Recipe';
export type { RawMaterial as IRawMaterial } from './RawMaterial';
export type { Customer as ICustomer } from './Customer';
export type { Supplier as ISupplier } from './Supplier';
export type { Branch as IBranch } from './Branch';
export type { Log as ILog } from './Log';