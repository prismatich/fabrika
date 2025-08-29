// src/models/Log.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILog extends Document {
  nivel: 'info' | 'warning' | 'error' | 'debug';
  mensaje: string;
  modulo: string;
  accion: string;
  usuario?: Types.ObjectId;
  entidad?: {
    tipo: string;
    id: Types.ObjectId;
  };
  datosAdicionales?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const LogSchema: Schema = new Schema({
  nivel: { 
    type: String, 
    required: true, 
    enum: ['info', 'warning', 'error', 'debug'],
    default: 'info'
  },
  mensaje: { 
    type: String, 
    required: true,
    trim: true 
  },
  modulo: { 
    type: String, 
    required: true,
    trim: true 
  },
  accion: { 
    type: String, 
    required: true,
    trim: true 
  },
  usuario: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  entidad: {
    tipo: { 
      type: String, 
      trim: true 
    },
    id: { 
      type: Schema.Types.ObjectId 
    }
  },
  datosAdicionales: { 
    type: Schema.Types.Mixed 
  },
  ip: { 
    type: String,
    trim: true 
  },
  userAgent: { 
    type: String,
    trim: true 
  }
}, {
  timestamps: true
});


LogSchema.index({ nivel: 1 });
LogSchema.index({ modulo: 1 });
LogSchema.index({ accion: 1 });
LogSchema.index({ usuario: 1 });
LogSchema.index({ createdAt: -1 });
LogSchema.index({ 'entidad.tipo': 1, 'entidad.id': 1 });



export const Log = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
