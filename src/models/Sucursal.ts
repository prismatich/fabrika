// src/models/Sucursal.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISucursal extends Document {
  nombre: string;
  direccion: string;
  personaACargo: string;
  telefono: string;
  email?: string;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SucursalSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  direccion: { 
    type: String, 
    required: true,
    trim: true 
  },
  personaACargo: { 
    type: String, 
    required: true,
    trim: true 
  },
  telefono: { 
    type: String, 
    required: true,
    trim: true 
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true
  },
  activa: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

SucursalSchema.index({ nombre: 1 });
SucursalSchema.index({ activa: 1 });
SucursalSchema.index({ personaACargo: 1 });

export const Sucursal = mongoose.models.Sucursal || mongoose.model<ISucursal>('Sucursal', SucursalSchema);
