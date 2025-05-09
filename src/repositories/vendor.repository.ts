import {Repository} from 'typeorm';
import {Vendor} from '../models/vendor.entity';
import {AppDataSource} from '../config/database';

export class VendorRepository {
    private repository: Repository<Vendor>;

    constructor() {
        this.repository = AppDataSource.getRepository(Vendor);
    }

    async findById(id: string): Promise<Vendor | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['user']
        });
    }

    // async findByUserId(userId: string): Promise<Vendor | null> {
    //     return this.repository.findOne({
    //         where: { user: { id: userId } },
    //         relations: ['user']
    //     });
    // }

    async findByEmail(email: string): Promise<Vendor | null> {
        return this.repository.findOneBy({ email });
    }

    async create(data: Partial<Vendor>): Promise<Vendor> {
        const vendor = this.repository.create(data);
        return this.repository.save(vendor);
    }

    async update(id: string, data: Partial<Vendor>): Promise<Vendor | null> {
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
