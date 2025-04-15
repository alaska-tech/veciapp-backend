import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

export enum ProductServiceState {
  AVAILABLE = 'available',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

@Entity('product_services')
export class ProductService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vendorId: string;

  @Column({ type: 'uuid' })
  branchId: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'jsonb', nullable: true })
  serviceScheduling: {
    professionalRequired: boolean;
    attentionLimitPerSlot: number;
    availableHours: {
      [day: string]: { open: string; close: string; isOpen: boolean };
    };
  };

  @Column({ type: 'varchar', length: 50 })
  type: string; // "product" o "service"

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 300 })
  shortDescription: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalPrice: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string; // Ej: "COP", "USD"

  @Column({ type: 'text', array: true, default: [] })
  images: string[];

  @Column({ type: 'varchar', length: 255 })
  mainImage: string;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'float', default: 0 })
  rank: number;

  @Column({ type: 'enum', enum: ProductServiceState, default: ProductServiceState.AVAILABLE })
  state: ProductServiceState;

  @Column({ type: 'int', default: 0 })
  inventory: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  presentation: string;

  @Column({ type: 'text', array: true, default: [] })
  ingredients: string[];

  @Column({ type: 'text', array: true, default: [] })
  allergens: string[];

  @Column({ default: false })
  isHighlighted: boolean;

  @Column({ default: false })
  isBestseller: boolean;

  @Column({ default: false })
  isNew: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
