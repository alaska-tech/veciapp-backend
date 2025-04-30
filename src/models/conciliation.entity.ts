import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('conciliations')
export class Conciliation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  vendorId!: string;

  @Column({ type: 'uuid' })
  branchId!: string;

  @Column({ type: 'varchar' })
  cohort!: string;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp' })
  endDate!: Date;

  @Column({ type: 'json' })
  orders: any; // Detalle de órdenes incluidas

  @Column({ type: 'int' })
  ordersCount!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  paymentAmount!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  profit!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fee!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  taxAmount!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  netAmount!: string;

  @Column({ default: 'COP' })
  currency!: string;

  @Column({ type: 'enum', enum: ['pending', 'processed', 'paid'] })
  status!: 'pending' | 'processed' | 'paid';

  @Column({ type: 'timestamp', nullable: true })
  paymentDate!: Date;

  @Column({ nullable: true })
  paymentReference!: string;

  @Column({ nullable: true })
  paymentMethod!: string;

  @Column({ type: 'json', nullable: true })
  bankAccount: any; // Datos bancarios utilizados para la transferencia

  @Column({ nullable: true })
  notes!: string;

  @Column({ type: 'uuid' })
  generatedBy!: string; // ID del usuario que generó la conciliación

  @Column({ type: 'uuid', nullable: true })
  approvedBy!: string; // ID del usuario que aprobó la conciliación

  @Column({ nullable: true })
  invoiceNumber!: string;

  @Column({ nullable: true })
  invoiceUrl!: string; // URL del documento de factura

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
