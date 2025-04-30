// import dotenv from "dotenv";
// dotenv.config();
//
// export const PORT: string = process.env.PORT ?? "3000";
// export const NODE_ENV: string = process.env.NODE_ENV ?? "development";
// export const SECRET: string = process.env.SECRET ?? "1234";
// export const REFRESH_SECRET: string = process.env.REFRESH_SECRET ?? "1234";
// export const SALT: string = process.env.SALT ?? "10";
// export const IV: string = process.env.IV ?? "";
// export const TOKEN_EXPIRATION: string = process.env.TOKEN_EXPIRATION ?? "15m";
// export const REFRESH_TOKEN_EXPIRATION: string = process.env.REFRESH_TOKEN_EXPIRATION ?? "7d";
// export const DB_HOST: string = process.env.DB_HOST ?? "localhost";
// export const DB_PORT: string = process.env.DB_PORT ?? "5432";
// export const DB_USER: string = process.env.DB_USER ?? "postgres";
// export const DB_PASSWORD: string = process.env.DB_PASSWORD ?? "password";
// export const DB_NAME: string = process.env.DB_NAME ?? "postgres";
// export const EMAIL_USER: string = process.env.EMAIL_USER ?? "";
// export const EMAIL_PASS: string = process.env.EMAIL_PASS ?? "";

import dotenv from "dotenv";
dotenv.config()

export const {
    PORT,
    NODE_ENV,
    SECRET,
    REFRESH_SECRET,
    SALT,
    IV,
    TOKEN_EXPIRATION,
    REFRESH_TOKEN_EXPIRATION,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    EMAIL_USER,
    EMAIL_PASS
} = process.env
