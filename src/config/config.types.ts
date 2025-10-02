export interface AppConfig {
  port: number;
  jwt_secret: string;
  openai_key: string;
  vercel_token: string;
  cloudflare_token: string;
  unsplash_access_key: string;
  mapbox_token: string;
  openrouter_key: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
}
