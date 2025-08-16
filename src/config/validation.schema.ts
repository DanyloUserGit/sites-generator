import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(8000),

  JWT_SECRET: Joi.string().required(),
  OPENAI_KEY: Joi.string().required(),
  UNSPLASH_ACCESS_KEY: Joi.string().required(),
  MAPBOX_TOKEN: Joi.string().required(),
  VERCEL_ACCESS_TOKEN: Joi.string().required(),
  CLOUDFLARE_TOKEN: Joi.string().required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),
});
