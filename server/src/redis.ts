import RedisStore from 'connect-redis';
import { createClient } from 'redis';

export const createRedisStore = async () => {
  const redisClient = createClient();
  redisClient.connect().catch(console.error);
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'myapp:',
    disableTouch: true, // disable touch to prevent session expiration
  });
  return redisStore;
};
