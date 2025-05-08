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
    EMAIL_PASS,
    VENDOR_VALIDATE_EMAIL_URL,
} = process.env
