import { config } from 'dotenv';

config({ path: '.env' });

export const port = process.env.PORT;

export const dbConfig = {
    host: process.env.DB_HOST,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    dbName: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT,
}
