import 'dotenv-safe/config';
import { DataSource } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Updoot } from './entities/Updoot';
import { __prod__ } from './constants';

export const PostgresDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  logging: true,
  synchronize: __prod__ ? false : true,
  migrations: [path.join(__dirname, './migrations/*')],
  entities: [User, Post, Updoot],
});
