import { DataSource } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';
import { Updoot } from './entities/Updoot';

export const PostgresDataSource = new DataSource({
  type: 'postgres',
  database: 'redditclone',
  username: 'postgres',
  password: 'postgres',
  logging: true,
  synchronize: true,
  migrations: [path.join(__dirname, './migrations/*')],
  entities: [User, Post, Updoot],
});
