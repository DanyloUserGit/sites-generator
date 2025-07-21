export interface AppConfig {
  port: number;
  jwt_secret: string;
  openai_key: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
}
