import { DataSource } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';
import path from 'path';

export const PostgresDataSource = new DataSource({
  type: 'postgres',
  database: 'redditclone',
  username: 'postgres',
  password: 'postgres',
  logging: true,
  synchronize: true,
  migrations: [path.join(__dirname, './migrations/*')],
  entities: [User, Post],
});
