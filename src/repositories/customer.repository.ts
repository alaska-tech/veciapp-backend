import {Repository} from 'typeorm';
import {Customer} from '../models/customer.entity';
import {AppDataSource} from '../config/database';

export class CustomerRepository {
    private repository: Repository<Customer>;

    constructor() {
        this.repository = AppDataSource.getRepository(Customer);
    }

    async findById(id: string): Promise<Customer | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['user']
        });
    }

    async findByEmail(email: string): Promise<Customer | null> {
        return this.repository.findOneBy({ email });
    }

    // async findByUserId(userId: string): Promise<Customer | null> {
    //     return this.repository.findOne({
    //         where: { user: { id: userId } },
    //         relations: ['user']
    //     });
    // }

    async create(data: Partial<Customer>): Promise<Customer> {
        const customer = this.repository.create(data);
        return this.repository.save(customer);
    }

    async update(id: string, data: Partial<Customer>): Promise<Customer | null> {
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