import {Repository} from 'typeorm';
import {Parameter} from '../models/parameter.entity';
import {AppDataSource} from '../config/database';

export class ParameterRepository {
  private repository: Repository<Parameter>;

  constructor() {
    this.repository = AppDataSource.getRepository(Parameter);
  }

  async findById(id: string): Promise<Parameter | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByName(name: string): Promise<Parameter | null> {
    return this.repository.findOne({
      where: { name },
    });
  }

}