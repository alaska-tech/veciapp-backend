import { UserEntity } from '../models/user.entity';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import {isValidEmail} from "../utils/validateEmails";
import {SALT} from "../utils/constants";
import bcrypt from 'bcryptjs'

export class UserBO {
    private repository: Repository<UserEntity>;

    constructor() {
        this.repository = AppDataSource.getRepository(UserEntity);
    }

    // Métodos de negocio
    async createUser(userData: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
        // implementar validaciones de negocio
        if (!isValidEmail(userData.email)) {
            throw new Error('Email inválido');
        }
        // implementar reglas de negocio adicionales
        const hashedPassword = await this.hashPassword(userData.password);

        const newUser = this.repository.create({
            ...userData,
            password: hashedPassword
        });

        return this.repository.save(newUser);
    }

    async getUserById(id: string): Promise<UserEntity | null> {
        return this.repository.findOneBy({ id });
    }

    async getAllUsers(limit: number, page: number): Promise<[UserEntity[] | null, number]> {
        return this.repository.findAndCount({
            take: limit,
            skip: page
        });
    }

    async updateUser(id: string, userData: Partial<UserEntity>): Promise<UserEntity | null> {
        const user = await this.getUserById(id);
        if (!user) return null;

        // Aplicar reglas de negocio para la actualización
        if (userData.email && !isValidEmail(userData.email)) {
            throw new Error('Email inválido');
        }

        if (userData.password) {
            userData.password = await this.hashPassword(userData.password);
        }

        // Actualizar y devolver el usuario
        Object.assign(user, userData);
        return this.repository.save(user);
    }

    async deleteUser(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, SALT || 1234);
    }
}