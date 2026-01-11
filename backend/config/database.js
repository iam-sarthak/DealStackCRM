import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// For Vercel/serverless: Explicitly import and use pg module
// This is critical for serverless deployments where native modules need explicit loading
let pgModule;
try {
  // Import pg module - this ensures it's bundled and available
  // Sequelize expects the module object with Pool, Client, etc.
  const pgImport = await import('pg');
  // Use default export if available, otherwise use the namespace
  pgModule = pgImport.default || pgImport;
  
  // Verify the module has the expected structure
  if (!pgModule && !pgImport.Pool) {
    throw new Error('pg module structure is invalid');
  }
} catch (error) {
  console.error('Critical: Could not load pg module:', error.message);
  console.error('Please ensure pg is installed: npm install pg');
  throw new Error('PostgreSQL driver (pg) is required. Please install: npm install pg');
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'postgres',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    // Explicitly specify pg module for Vercel/serverless compatibility
    dialectModule: pgModule,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // SSL configuration for Supabase and other cloud providers
    dialectOptions: {
      ssl: process.env.DB_SSL !== 'false' ? {
        require: true,
        rejectUnauthorized: false // Supabase uses self-signed certificates
      } : false
    },
    // Optimized pool settings for serverless/Vercel
    pool: {
      max: process.env.NODE_ENV === 'production' ? 2 : 5, // Lower for serverless
      min: 0,
      acquire: 30000,
      idle: 10000,
      // For serverless: close idle connections quickly
      evict: 1000
    },
    // Additional options for better serverless compatibility
    retry: {
      max: 3
    }
  }
);

export default sequelize;

