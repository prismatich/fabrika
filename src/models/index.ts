// src/models/index.ts
// Exportar todos los modelos Typegoose

export { User, UserModel } from './User';
export { Ingrediente, IngredienteModel } from './Ingrediente';
export { Sucursal, SucursalModel } from './Sucursal';
export { Proveedor, ProveedorModel } from './Proveedor';
export { Log, LogModel } from './Logs';

// Tipos de exportación para uso en otros archivos
export type { User as IUser } from './User';
export type { Ingrediente as IIngrediente } from './Ingrediente';
export type { Sucursal as ISucursal } from './Sucursal';
export type { Proveedor as IProveedor } from './Proveedor';
export type { Log as ILog } from './Logs';