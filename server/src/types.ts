import { Connection, EntityManager, IDatabaseDriver } from '@mikro-orm/core';
import { Request, Response } from 'express';
import { Session, SessionData } from 'express-session';
import { Redis } from 'ioredis';

import 'express-session';
declare module 'express-session' {
  interface SessionData {
    [key: string]: any;
    cookie: Cookie;
  }
}

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  redis: Redis;
  req: Request & { session: SessionData };
  res: Response;
};
