export interface AppConfig {
  port: number;
  jwt_secret: string;
  openai_key: string;
  unsplash_access_key: string;
  mapbox_token: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
}
