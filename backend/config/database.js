import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// For Vercel/serverless: Explicitly import pg before Sequelize uses it
// This is critical for serverless deployments where native modules need explicit loading
// The import is done at module level to ensure it's available when Sequelize initializes
try {
  // Import pg module - this ensures it's bundled and available
  // Using side-effect import to load the module
  await import('pg');
} catch (error) {
  // Log error but don't throw - Sequelize will provide a better error message
  console.error('Warning: Could not pre-load pg module:', error.message);
  console.error('This may cause issues. Ensure pg is in package.json dependencies.');
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'postgres',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'fjWkV4asT-8G2iU',
  {
    host: process.env.DB_HOST || 'db.hvznlwaqqqiltaupvyrq.supabase.co',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;

