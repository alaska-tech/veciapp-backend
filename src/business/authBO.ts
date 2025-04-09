import { UserRepository } from '../repositories/user.repository'
import { UserEntity } from '../models/user.entity'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { randomBytes } from 'crypto'
import {SALT, SECRET} from "../utils/constants";

//TODO: pasar estas interfaces a /types
interface LoginCredentials {
    email: string
    password: string
}

interface RegisterData {
    name: string
    email: string
    password: string
}

interface ResetPasswordData {
    email: string
}

interface NewPasswordData {
    token: string
    password: string
}

interface TokenPayload {
    userId: string
    email: string
    role: string
}

export class AuthBO {
    private userRepository: UserRepository
    private jwtSecret: string
    private tokenExpiration: string

    constructor() {
        this.userRepository = new UserRepository();
        this.jwtSecret = SECRET || '1234'
        this.tokenExpiration = process.env.TOKEN_EXPIRATION || '24h'
    }

    async login(credentials: LoginCredentials): Promise<{ user: Partial<UserEntity>, token: string } | null> {
        const user = await this.userRepository.findByEmail(credentials.email)
        if (!user) return null

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) return null

        // Generar token JWT
        const token = this.generateToken(user)

        // Actualizar refresh token
        const refreshToken = randomBytes(40).toString('hex')
        await this.userRepository.update(user.id, { refreshToken })

        // Excluir password del objeto usuario
        const { password, ...userWithoutPassword } = user

        return {
            user: userWithoutPassword,
            token
        }
    }

    async logout(userId: string): Promise<boolean> {
        // Invalidar el refresh token
        const user = await this.userRepository.findById(userId);
        if (!user) return false;

        // Limpiar el refresh token
        await this.userRepository.update(userId, { refreshToken: null });

        return true;
    }

    async register(userData: RegisterData): Promise<{ user: Partial<UserEntity>, token: string } | null> {
        // Verificar si el email ya existe
        const existingUser = await this.userRepository.findByEmail(userData.email)
        if (existingUser) {
            throw new Error('El email ya está registrado')
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 10)

        // Crear nuevo usuario
        const newUser = await this.userRepository.create({
            ...userData,
            password: hashedPassword,
            isActive: true
        })

        // Generar token JWT
        const token = this.generateToken(newUser)

        // Actualizar refresh token
        const refreshToken = randomBytes(40).toString('hex')
        await this.userRepository.update(newUser.id, { refreshToken })

        // Excluir password del objeto usuario, para evitar devolverlo
        const { password, ...userWithoutPassword } = newUser

        return {
            user: userWithoutPassword,
            token
        };
    }

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

    private generateToken(user: UserEntity): string {
        const payload: TokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.tokenExpiration });
    }
}