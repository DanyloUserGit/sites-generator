export default () => ({
  port: parseInt(process.env.PORT, 10) || 8000,
  jwt_secret: process.env.JWT_SECRET,
  openai_key: process.env.OPENAI_KEY,
  vercel_token: process.env.VERCEL_ACCESS_TOKEN,
  unsplash_access_key: process.env.UNSPLASH_ACCESS_KEY,
  cloudflare_token: process.env.CLOUDFLARE_TOKEN,
  mapbox_token: process.env.MAPBOX_TOKEN,
  openrouter_key: process.env.OPENROUTER_KEY,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
});
