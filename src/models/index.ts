// src/models/index.ts
// Exportar todos los modelos Typegoose

export { User, UserModel } from './User';
export { Ingrediente, IngredienteModel } from './Ingrediente,ts';
export { Receta, RecetaModel } from './Receta';
export { Log, LogModel } from './Logs';
export { Sucursal, SucursalModel } from './Sucursal';
export { Cliente, ClienteModel } from './Cliente';

// Tipos de exportación para uso en otros archivos
export type { User as IUser } from './User';
export type { Ingrediente as IIngrediente } from './Ingrediente,ts';
export type { Receta as IReceta } from './Receta';
export type { Log as ILog } from './Logs';
export type { Sucursal as ISucursal } from './Sucursal';
export type { Cliente as ICliente } from './Cliente';
