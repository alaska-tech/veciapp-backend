import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  orderId!: string;

  @Column({ type: 'uuid' })
  customerId!: string;

  @Column({ type: 'uuid' })
  vendorId!: string;

  @Column({ type: 'enum', enum: ['debit_card', 'credit_card', 'cash', 'transfer'] })
  type!: 'debit_card' | 'credit_card' | 'cash' | 'transfer';

  @Column({ type: 'enum', enum: ['pending', 'completed', 'failed', 'refunded'] })
  state!: 'pending' | 'completed' | 'failed' | 'refunded';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Column({ default: 'COP' })
  currency!: string;

  @Column({ type: 'text' })
  references!: string;

  @Column({ nullable: true })
  transactionId!: string;

  @Column({ nullable: true })
  authorizationCode!: string;

  @Column({ nullable: true })
  gatewayId!: string;

  @Column({ nullable: true })
  gatewayName!: string;

  @Column({ type: 'json', nullable: true })
  rawResponse: any;

  @Column({ type: 'json', nullable: true })
  cardInfo: any; // Últimos 4 dígitos y otros datos relevantes

  @Column({ nullable: true })
  cardBrand!: string;

  @Column({ type: 'timestamp' })
  paymentDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate!: Date;

  @Column({ nullable: true })
  failureReason!: string;

  @Column({ nullable: true })
  invoiceNumber!: string;

  @Column({ nullable: true })
  receiptUrl!: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
