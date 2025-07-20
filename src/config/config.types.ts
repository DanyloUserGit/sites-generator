export interface AppConfig {
  port: number;
  jwt_secret: string;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
}
