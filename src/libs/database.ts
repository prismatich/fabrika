// src/libs/database.ts
import mongoose from 'mongoose';
import { getModelForClass } from '@typegoose/typegoose';

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fabrika';

// Opciones de conexión
const connectionOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Función para conectar a la base de datos
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, connectionOptions);
    console.log('✅ Conexión a MongoDB establecida exitosamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    throw error;
  }
}

// Función para desconectar de la base de datos
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('✅ Desconexión de MongoDB exitosa');
  } catch (error) {
    console.error('❌ Error al desconectar de MongoDB:', error);
    throw error;
  }
}

// Función para verificar el estado de la conexión
export function getConnectionStatus(): string {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}

// Eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('🔄 Mongoose conectado a MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión de Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔄 Mongoose desconectado de MongoDB');
});

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});
