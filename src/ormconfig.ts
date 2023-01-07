import * as dotenv from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
dotenv.config();

export const typeormConfig = {
  type: 'mysql' as const,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASENAME,
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  // entities: ['src/**/*.entity.{ts,js}'],
  // entities: ['../**/*.entity.{ts,js}'],
  // entities: ['dist/**/*.entity.js'],
  // entities: [User, School, News, Subscribe],
  charset: 'utf8mb4',
  synchronize: false,
  logging: false,
  migrations: ['src/db-migrations/*.{ts,mts}'],
};

export const dataSourceInstance = new DataSource(typeormConfig);