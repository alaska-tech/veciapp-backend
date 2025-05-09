import { Repository } from 'typeorm'
import { Account } from '../models/account.entity'
import { AppDataSource } from '../config/database'

export class AccountRepository {
    private repository: Repository<Account>

    constructor() {
        this.repository = AppDataSource.getRepository(Account);
    }

    async findByEmail(email: string): Promise<Account | null> {
        return this.repository.findOneBy({ email });
    }

    async findById(id: string): Promise<Account | null> {
        return this.repository.findOneBy({ id });
    }

    async findByResetToken(token: string): Promise<Account | null> {
        return this.repository.findOneBy({ refreshToken: token });
    }

    async create(userData: Partial<Account>): Promise<Account> {
        const user = this.repository.create(userData);
        return this.repository.save(user);
    }

    async update(id: string, data: Partial<Account>): Promise<Account | null> {
        const user = await this.findById(id);
        if (!user) return null;

        Object.assign(user, data);
        return this.repository.save(user);
    }
}