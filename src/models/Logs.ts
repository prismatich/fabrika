// src/models/Logs.ts
import { prop, getModelForClass, modelOptions, Severity, index, type Ref } from '@typegoose/typegoose';
import { User } from './User';

@modelOptions({
  schemaOptions: {
    collection: 'logs',
    timestamps: true
  },
  options: {
    allowMixed: Severity.ALLOW
  }
})
@index({ nivel: 1 })
@index({ modulo: 1 })
@index({ accion: 1 })
@index({ usuario: 1 })
@index({ createdAt: -1 })
@index({ 'entidad.tipo': 1, 'entidad.id': 1 })
export class Log {
  @prop({ required: true, enum: ['info', 'warning', 'error', 'debug'], default: 'info' })
  public nivel!: 'info' | 'warning' | 'error' | 'debug';

  @prop({ required: true, trim: true })
  public mensaje!: string;

  @prop({ required: true, trim: true })
  public modulo!: string;

  @prop({ required: true, trim: true })
  public accion!: string;

  @prop({ ref: () => User })
  public usuario?: Ref<User>;

  @prop({
    tipo: { type: String, trim: true },
    id: { type: String }
  })
  public entidad?: {
    tipo: string;
    id: string;
  };

  @prop({ type: () => Object })
  public datosAdicionales?: Record<string, any>;

  @prop({ trim: true })
  public ip?: string;

  @prop({ trim: true })
  public userAgent?: string;
}

export const LogModel = getModelForClass(Log);