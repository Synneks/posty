import { Request, Response } from 'express';
import { SessionData } from 'express-session';
import { Redis } from 'ioredis';

import 'express-session';
declare module 'express-session' {
  interface SessionData {
    [key: string]: any;
    cookie: Cookie;
  }
}

export type MyContext = {
  redis: Redis;
  req: Request & { session: SessionData };
  res: Response;
};
