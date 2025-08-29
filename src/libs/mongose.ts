// src/libs/mongoose.ts
import mongoose from 'mongoose';

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/testing';

// Cache de la conexión para reutilizar en Astro
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToMongoDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToMongoDB;
