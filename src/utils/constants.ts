import dotenv from "dotenv";
dotenv.config()

export const {
    PORT,
    NODE_ENV,
    SECRET,
    SALT,
    IV,
    TOKEN_EXPIRATION,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    EMAIL_USER,
    EMAIL_PASS
} = process.env
