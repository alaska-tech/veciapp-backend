import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  orderNumber!: string;

  @Column({ type: 'uuid' })
  customerId!: string;

  @Column({ type: 'uuid' })
  vendorId!: string;

  @Column({ type: 'uuid' })
  branchId!: string;

  @Column({ type: 'json' })
  products: any; // Snapshot de productos al momento de compra

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount!: string;

  @Column({ nullable: true })
  discountCode!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  deliveryFee!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  serviceFee!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: string;

  @Column({ default: 'COP' })
  currency!: string;

  @Column()
  paymentMethod!: string;

  @Column({ type: 'enum', enum: ['pending', 'paid', 'failed'] })
  paymentStatus!: 'pending' | 'paid' | 'failed';

  @Column({ type: 'enum', enum: ['received', 'preparing', 'shipped', 'delivered'] })
  orderStatus!: 'received' | 'preparing' | 'shipped' | 'delivered';

  @Column({ type: 'json', default: [] })
  orderStatusHistory!: any[];

  @Column({ type: 'enum', enum: ['delivery', 'pickup'] })
  deliveryType!: 'delivery' | 'pickup';

  @Column({ type: 'json', nullable: true })
  deliveryAddress!: any;

  @Column({ type: 'json', nullable: true })
  deliveryLocationCoordinates!: { lat: number; lng: number };

  @Column({ default: false })
  isRated!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
