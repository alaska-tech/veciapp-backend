import { Repository } from 'typeorm'
import { UserEntity } from '../models/user.entity'
import { AppDataSource } from '../config/database'

export class UserRepository {
    private repository: Repository<UserEntity>

    constructor() {
        this.repository = AppDataSource.getRepository(UserEntity);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.repository.findOneBy({ email });
    }

    async findById(id: string): Promise<UserEntity | null> {
        return this.repository.findOneBy({ id });
    }

    async findByResetToken(token: string): Promise<UserEntity | null> {
        return this.repository.findOneBy({ passwordResetToken: token });
    }

    async create(userData: Partial<UserEntity>): Promise<UserEntity> {
        const user = this.repository.create(userData);
        return this.repository.save(user);
    }

    async update(id: string, data: Partial<UserEntity>): Promise<UserEntity | null> {
        const user = await this.findById(id);
        if (!user) return null;

        Object.assign(user, data);
        return this.repository.save(user);
    }
}