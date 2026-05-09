import 'dotenv/config';
import { DataSource } from "typeorm";

export default new DataSource({
  type: "postgres",
  username: process.env.DB_USERNAME ?? "postgres",
  port: Number(process.env.DB_PORT) || 5432,
  host: process.env.DB_HOST ?? "localhost",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/database/migrations/*.js"],
});
