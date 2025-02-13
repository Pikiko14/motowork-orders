import Configuration from './configuration';

export const connectionRedis: any = {
  host: Configuration.get('REDIS_HOST') || "localhost",
  port: parseInt(Configuration.get('REDIS_PORT')),
};
