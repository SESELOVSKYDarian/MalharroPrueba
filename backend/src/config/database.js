import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dialect = process.env.DB_DIALECT || 'sqlite';

const baseConfig = {
  logging: false,
};

let sequelize;

if (dialect === 'sqlite') {
  const storage = process.env.DB_STORAGE || path.join(__dirname, '../../storage/database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    ...baseConfig,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect,
      dialectOptions: dialect === 'postgres' ? { ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : undefined } : undefined,
      ...baseConfig,
    },
  );
}

export default sequelize;
