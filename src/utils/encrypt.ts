import crypto from 'crypto'
import {SECRET, IV, SALT} from "./constants";
import bcrypt from 'bcryptjs'

//encriptar

const constantSecret = SECRET || '123456';
const constantIv = IV || '1234567890123456';

export const encrypt = (text: string)=> {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(constantSecret), Buffer.from(constantIv, 'hex'));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

//desencriptar
export const decrypt = (text: string)=> {
    const iv = Buffer.from(constantIv, 'hex');
    const encryptedText = text;
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(constantSecret), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

//hashPassword
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT || 1234);
}