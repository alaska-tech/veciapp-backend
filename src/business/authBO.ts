import { AccountRepository } from '../repositories/account.repository';
import { Account, AccountRole } from '../models/account.entity'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken';
import {SECRET, REFRESH_SECRET, TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION} from "../utils/constants";
import { v4 as uuidv4 } from "uuid";

//TODO: pasar estas interfaces a /types
interface LoginCredentials {
    email: string
    password: string
}

interface RegisterUserData {
    name: string;
    email: string;
    password: string;
    role: AccountRole;
}

interface RegisterCustomerData extends RegisterUserData {
    company?: string;
    phone?: string;
    address?: string;
}

interface RegisterVendorData extends RegisterUserData {
    businessName: string;
    phone?: string;
    address?: string;
    taxId?: string;
}

interface ResetPasswordData {
    email: string
}

interface NewPasswordData {
    token: string
    password: string
}

interface TokenPayload {
    foreignPersonId: string
    fullName: string
    email: string
    role: AccountRole
}

export class AuthBO {
    private accountRepository: AccountRepository
    private tokenSecret: string
    private refreshTokenSecret: string
    private tokenExpiration: string
    private refreshTokenExpiration: string

    constructor() {
        this.accountRepository = new AccountRepository();
        this.tokenSecret = SECRET || '1234';
        this.refreshTokenSecret = REFRESH_SECRET || '1234';
        this.tokenExpiration = TOKEN_EXPIRATION || '15m';
        this.refreshTokenExpiration = REFRESH_TOKEN_EXPIRATION || '7d';
    }

    async login(credentials: LoginCredentials): Promise<{ currentUser: Partial<Account>, token: string, refreshToken: string } | null> {
        const user = await this.accountRepository.findByEmail(credentials.email)
        if (!user) throw new Error('Usuario o contraseña incorrectos');

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error('Usuario o contraseña incorrectos');

        // Generar token JWT
        const token =  await this.generateToken(user)

        // Actualizar refresh token
        const refreshToken = await this.generateRefreshToken(user)
        await this.accountRepository.update(user.id, { refreshToken: refreshToken, lastLoginDate: new Date() })

        // Excluir password del objeto usuario
        const { password, ...userWithoutPassword } = user
        userWithoutPassword.refreshToken = refreshToken

        return {
            currentUser: userWithoutPassword,
            token,
            refreshToken
        }
    }

    async logout(userId: string): Promise<boolean> {
        // Invalidar el refresh token
        const user = await this.accountRepository.findById(userId);
        if (!user) return true;

        // Limpiar el refresh token
        await this.accountRepository.update(userId, { refreshToken: undefined });

        return true;
    }

    async refreshToken(token: string): Promise<{ refreshToken: string, accessToken: string  }> {
        try {
            // Verificar que el refresh token sea válido
            //const decoded = jwt.verify(token, this.refreshTokenSecret);

            const user = await this.accountRepository.findByResetToken(token);

            if (!user) {
                throw new Error("Refresh token inválido");
            }

            // Generar nuevos tokens
            const accessToken = this.generateToken(user);
            const refreshToken = this.generateRefreshToken(user);

            // Actualizar refresh token en la base de datos
            user.refreshToken = refreshToken;
            await this.accountRepository.update(user.id, user);

            return {
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw new Error("Error al refrescar el token");
        }
    }

    /*
        async resetPassword(data: ResetPasswordData): Promise<boolean> {
            const user = await this.userRepository.findByEmail(data.email)
            if (!user) return false

            // Generar token de restablecimiento
            const resetToken = randomBytes(20).toString('hex')
            const resetExpires = new Date()
            resetExpires.setHours(resetExpires.getHours() + 24*7) // Token válido por 1 semana

            // Actualizar usuario con el token
            await this.userRepository.update(user.id, {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires
            });

            // TODO: Aquí enviamos un email con el token
            // Para simplificar, solo devolvemos true

            return true;
        }

        async setNewPassword(data: NewPasswordData): Promise<boolean> {
            const user = await this.userRepository.findByResetToken(data.token);

            if (!user) return false;

            // Verificar si el token expiró
            const now = new Date();
            if (user.passwordResetExpires && user.passwordResetExpires < now) {
                return false;
            }

            // Hash de la nueva contraseña
            const hashedPassword = await bcrypt.hash(data.password, 10);

            // Actualizar usuario
            await this.userRepository.update(user.id, {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null
            });

            return true;
        }

        async validateSession(userId: string): Promise<Partial<UserEntity> | null> {
            const user = await this.userRepository.findById(userId);
            if (!user) return null;

            // Excluir campos sensibles
            const { password, refreshToken, passwordResetToken, passwordResetExpires, ...userInfo } = user;

            return userInfo;
        }
    */
    private generateToken(user: Account): string {
        const payload: TokenPayload = {
            foreignPersonId: user.foreignPersonId,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        };

        // Use a different approach to avoid TypeScript errors
        // @ts-ignore
        return jwt.sign(
          payload,
          Buffer.from(this.tokenSecret, 'utf-8'),
          { expiresIn: this.tokenExpiration }
        );
    }

    private generateRefreshToken(user: Account): string {
        // @ts-ignore
        return jwt.sign(
          { foreignPersonId: user.id, tokenVersion: uuidv4() },
          Buffer.from(this.refreshTokenSecret, 'utf-8'),
          { expiresIn: this.refreshTokenExpiration }
        );
    }
}

// import { AccountRepository } from '../repositories/account.repository';
// import { Account, AccountRole } from '../models/account.entity'
// import * as bcrypt from 'bcryptjs'
// import jwt, { Secret } from 'jsonwebtoken';
// import {SECRET, REFRESH_SECRET, TOKEN_EXPIRATION, REFRESH_TOKEN_EXPIRATION} from "../utils/constants";
// import { v4 as uuidv4 } from "uuid";
//
// //TODO: pasar estas interfaces a /types
// interface LoginCredentials {
//     email: string
//     password: string
// }
//
// interface RegisterUserData {
//     name: string;
//     email: string;
//     password: string;
//     role: AccountRole;
// }
//
// interface RegisterCustomerData extends RegisterUserData {
//     company?: string;
//     phone?: string;
//     address?: string;
// }
//
// interface RegisterVendorData extends RegisterUserData {
//     businessName: string;
//     phone?: string;
//     address?: string;
//     taxId?: string;
// }
//
// interface ResetPasswordData {
//     email: string
// }
//
// interface NewPasswordData {
//     token: string
//     password: string
// }
//
// interface TokenPayload {
//     foreignPersonId: string
//     fullName: string
//     email: string
//     role: AccountRole
// }
//
// export class AuthBO {
//     private accountRepository: AccountRepository
//     private tokenSecret: string
//     private refreshTokenSecret: string
//     private tokenExpiration: string
//     private refreshTokenExpiration: string
//
//     constructor() {
//         this.accountRepository = new AccountRepository();
//         this.tokenSecret = (SECRET || '1234') as string;
//         this.refreshTokenSecret = (REFRESH_SECRET || '1234') as string;
//         this.tokenExpiration = (TOKEN_EXPIRATION || '15m') as string;
//         this.refreshTokenExpiration = (REFRESH_TOKEN_EXPIRATION || '7d') as string;
//     }
//
//     async login(credentials: LoginCredentials): Promise<{ currentUser: Partial<Account>, token: string, refreshToken: string } | null> {
//         const user = await this.accountRepository.findByEmail(credentials.email)
//         if (!user) throw new Error('Usuario o contraseña incorrectos');
//
//         const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
//         if (!isPasswordValid) throw new Error('Usuario o contraseña incorrectos');
//
//         // Generar token JWT
//         const token = this.generateToken(user)
//
//         // Actualizar refresh token
//         const refreshToken = this.generateRefreshToken(user)
//         await this.accountRepository.update(user.id, { refreshToken, lastLoginDate: new Date() })
//
//         // Excluir password del objeto usuario
//         const { password, ...userWithoutPassword } = user
//
//         return {
//             currentUser: userWithoutPassword,
//             token,
//             refreshToken
//         }
//     }
//
//    async logout(userId: string): Promise<boolean> {
//         // Invalidar el refresh token
//         const user = await this.accountRepository.findById(userId);
//         if (!user) return true;
//
//         // Limpiar el refresh token
//         await this.accountRepository.update(userId, { refreshToken: undefined });
//
//         return true;
//     }
//
//     async refreshToken(token: string): Promise<object> {
//         try {
//             // Verificar que el refresh token sea válido
//             //const decoded = jwt.verify(token, this.refreshTokenSecret);
//
//             const user = await this.accountRepository.findByResetToken(token);
//
//             if (!user) {
//                 throw new Error("Refresh token inválido");
//             }
//
//             // Generar nuevos tokens
//             const accessToken = this.generateToken(user);
//             const refreshToken = this.generateRefreshToken(user);
//
//             // Actualizar refresh token en la base de datos
//             user.refreshToken = refreshToken;
//             await this.accountRepository.update(user.id, user);
//
//             return {
//                 accessToken,
//                 refreshToken
//             };
//         } catch (error) {
//             throw new Error("Error al refrescar el token");
//         }
//     }
//
//     /*
//         async resetPassword(data: ResetPasswordData): Promise<boolean> {
//             const user = await this.userRepository.findByEmail(data.email)
//             if (!user) return false
//
//             // Generar token de restablecimiento
//             const resetToken = randomBytes(20).toString('hex')
//             const resetExpires = new Date()
//             resetExpires.setHours(resetExpires.getHours() + 24*7) // Token válido por 1 semana
//
//             // Actualizar usuario con el token
//             await this.userRepository.update(user.id, {
//                 passwordResetToken: resetToken,
//                 passwordResetExpires: resetExpires
//             });
//
//             // TODO: Aquí enviamos un email con el token
//             // Para simplificar, solo devolvemos true
//
//             return true;
//         }
//
//         async setNewPassword(data: NewPasswordData): Promise<boolean> {
//             const user = await this.userRepository.findByResetToken(data.token);
//
//             if (!user) return false;
//
//             // Verificar si el token expiró
//             const now = new Date();
//             if (user.passwordResetExpires && user.passwordResetExpires < now) {
//                 return false;
//             }
//
//             // Hash de la nueva contraseña
//             const hashedPassword = await bcrypt.hash(data.password, 10);
//
//             // Actualizar usuario
//             await this.userRepository.update(user.id, {
//                 password: hashedPassword,
//                 passwordResetToken: null,
//                 passwordResetExpires: null
//             });
//
//             return true;
//         }
//
//         async validateSession(userId: string): Promise<Partial<UserEntity> | null> {
//             const user = await this.userRepository.findById(userId);
//             if (!user) return null;
//
//             // Excluir campos sensibles
//             const { password, refreshToken, passwordResetToken, passwordResetExpires, ...userInfo } = user;
//
//             return userInfo;
//         }
//     */
//     private generateToken(user: Account): string {
//         const payload: TokenPayload = {
//             foreignPersonId: user.foreignPersonId,
//             fullName: user.fullName,
//             email: user.email,
//             role: user.role
//         };
//
//         return jwt.sign(payload, this.tokenSecret as jwt.Secret,  { expiresIn: this.tokenExpiration });
//     }
//
//     private generateRefreshToken(user: Account): string {
//         return jwt.sign(
//             { foreignPersonId: user.id, tokenVersion: uuidv4() },
//             this.refreshTokenSecret as jwt.Secret,
//             { expiresIn: this.refreshTokenExpiration }
//         );
//     }
// }