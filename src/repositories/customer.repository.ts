import { Repository } from 'typeorm';
import { CustomerEntity } from '../models/customer.entity';
import { AppDataSource } from '../config/database';
import {UserEntity} from "../models/user.entity";

export class CustomerRepository {
    private repository: Repository<CustomerEntity>;

    constructor() {
        this.repository = AppDataSource.getRepository(CustomerEntity);
    }

    async findById(id: string): Promise<CustomerEntity | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['user']
        });
    }

    async findByEmail(email: string): Promise<CustomerEntity | null> {
        return this.repository.findOneBy({ email });
    }

    async findByUserId(userId: string): Promise<CustomerEntity | null> {
        return this.repository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });
    }

    async create(data: Partial<CustomerEntity>): Promise<CustomerEntity> {
        const customer = this.repository.create(data);
        return this.repository.save(customer);
    }

    async update(id: string, data: Partial<CustomerEntity>): Promise<CustomerEntity | null> {
        const customer = await this.findById(id);
        if (!customer) return null;

        Object.assign(customer, data);
        return this.repository.save(customer);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}