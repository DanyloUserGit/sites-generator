export default () => ({
  port: parseInt(process.env.PORT, 10) || 8000,
  jwt_secret: process.env.JWT_SECRET,
  openai_key: process.env.OPENAI_KEY,
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
});
