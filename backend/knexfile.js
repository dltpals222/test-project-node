const path = require('path');

require('dotenv').config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === 'local' || !process.env.NODE_ENV
      ? '.env.local'
      : `.env.${process.env.NODE_ENV}`,
  ),
});

const base = {
  client: 'pg',
  migrations: { tableName: 'knex_migrations', directory: './migrations' },
  seeds: { directory: './seeds' },
};

module.exports = {
  local: {
    ...base,
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'dummy',
      password: process.env.DB_PASSWORD || 'dev_password_123',
      database: process.env.DB_NAME || 'dummy_dev',
    },
  },
  development: {
    ...base,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
  },
  production: {
    ...base,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
    },
  },
};
