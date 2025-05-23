import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { ProductService } from './productservice.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  @Index()
  userId!: string;

  @Column({ type: 'uuid' })
  @Index()
  productServiceId!: string;

  @ManyToOne(() => ProductService)
  @JoinColumn({ name: 'productServiceId' })
  productService!: ProductService;

  @CreateDateColumn()
  createdAt!: Date;
}