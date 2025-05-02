import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Point } from "geojson";


export enum BranchState {
  ACTIVE = 'active',
  TEMP_CLOSED = 'temporarily_closed',
  MAINTENANCE = 'maintenance',
  INACTIVE = 'inactive',
}

export enum BusinessType {
  INDIVIDUAL = 'individual',
  COMPANY = 'company',
}

@Entity('branches')
export class Branch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  vendorId!: string;

  // Si tienes la relación con Vendor:
  // @ManyToOne(() => Seller)
  // @JoinColumn({ name: 'vendorId' })
  // vendor: Seller;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  location!: {
    lat: number;
    lng: number;
  };

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'float', default: 0 })
  rank!: number;

  @Column({ type: 'enum', enum: BranchState, default: BranchState.ACTIVE })
  state!: BranchState;

  @Column({ type: 'enum', enum: BusinessType, default: BusinessType.INDIVIDUAL })
  businessType!: BusinessType;

  @Column({ type: 'jsonb', nullable: true })
  operatingHours!: {
    [day: string]: { open: string; close: string; isOpen: boolean };
  };

  @Column({ type: 'varchar', length: 255, nullable: true })
  logo!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  managerName!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  managerPhone!: string;

  @Column({ type: 'text', array: true, default: [] })
  images!: string[];

  @Column({ default: false })
  isPickupAvailable!: boolean;

  @Column({ default: false })
  isDeliveryAvailable!: boolean;

  @Column({ type: 'text', array: true, default: [] })
  availablePaymentMethods!: string[];

  @Column({ type: 'text', nullable: true })
  description!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
