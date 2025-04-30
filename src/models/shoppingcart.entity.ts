import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shopping_cart')
export class ShoppingCart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  customerId!: string;

  @Column({ type: 'uuid' })
  productServiceId!: string;

  @Column({ type: 'uuid' })
  branchId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: string;

  @Column({ type: 'timestamp' })
  addedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
