import Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .allow('development', 'production', 'test')
    .default('development'),
  TOKEN_EXPIRY_TIME: Joi.number().default(3600),
  PORT: Joi.number().default(5000),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('30m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),

  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),

  API_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  CLIENT_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),
  DATABASE_URL: Joi.string().default(
    'postgresql://postgres:root@localhost:5432/FirstTest?schema=public',
  ),
})
  .unknown()
  .required();
