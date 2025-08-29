// src/models/Cliente.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICliente extends Document {
  nombre: string;
  telefono: string;
  correo: string;
  direccion?: string;
  fechaNacimiento?: Date;
  genero?: 'masculino' | 'femenino' | 'otro';
  activo: boolean;
  preferencias?: string[];
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClienteSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: true, 
    trim: true 
  },
  telefono: { 
    type: String, 
    required: true, 
    trim: true 
  },
  correo: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true 
  },
  direccion: { 
    type: String,
    trim: true 
  },
  fechaNacimiento: { 
    type: Date 
  },
  genero: { 
    type: String, 
    enum: ['masculino', 'femenino', 'otro'] 
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
  preferencias: [{ 
    type: String,
    trim: true 
  }],
  notas: { 
    type: String,
    trim: true 
  }
}, {
  timestamps: true
});

ClienteSchema.index({ nombre: 1 });
ClienteSchema.index({ correo: 1 });
ClienteSchema.index({ telefono: 1 });
ClienteSchema.index({ activo: 1 });
ClienteSchema.index({ createdAt: -1 });

export const Cliente = mongoose.models.Cliente || mongoose.model<ICliente>('Cliente', ClienteSchema);
