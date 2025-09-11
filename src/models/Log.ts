// src/models/Log.ts
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
@index({ level: 1 })
@index({ module: 1 })
@index({ action: 1 })
@index({ user: 1 })
@index({ createdAt: -1 })
@index({ 'entity.type': 1, 'entity.id': 1 })
export class Log {
  @prop({ required: true, enum: ['info', 'warning', 'error', 'debug'], default: 'info' })
  public level!: 'info' | 'warning' | 'error' | 'debug';

  @prop({ required: true, trim: true })
  public message!: string;

  @prop({ required: true, trim: true })
  public module!: string;

  @prop({ required: true, trim: true })
  public action!: string;

  @prop({ ref: () => User })
  public user?: Ref<User>;

  @prop({
    type: { type: String, trim: true },
    id: { type: String }
  })
  public entity?: {
    type: string;
    id: string;
  };

  @prop({ type: () => Object })
  public additionalData?: Record<string, any>;

  @prop({ trim: true })
  public ip?: string;

  @prop({ trim: true })
  public userAgent?: string;
}

export const LogModel = getModelForClass(Log);
