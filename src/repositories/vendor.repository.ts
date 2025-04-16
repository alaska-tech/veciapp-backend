import { Repository } from 'typeorm';
import { VendorEntity } from '../models/vendor.entity';
import { AppDataSource } from '../config/database';
import {CustomerEntity} from "../models/customer.entity";

export class VendorRepository {
    private repository: Repository<VendorEntity>;

    constructor() {
        this.repository = AppDataSource.getRepository(VendorEntity);
    }

    async findById(id: string): Promise<VendorEntity | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['user']
        });
    }

    async findByUserId(userId: string): Promise<VendorEntity | null> {
        return this.repository.findOne({
            where: { user: { id: userId } },
            relations: ['user']
        });
    }

    async findByEmail(email: string): Promise<VendorEntity | null> {
        return this.repository.findOneBy({ email });
    }

    async create(data: Partial<VendorEntity>): Promise<VendorEntity> {
        const vendor = this.repository.create(data);
        return this.repository.save(vendor);
    }

    async update(id: string, data: Partial<VendorEntity>): Promise<VendorEntity | null> {
        const vendor = await this.findById(id);
        if (!vendor) return null;

        Object.assign(vendor, data);
        return this.repository.save(vendor);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}
