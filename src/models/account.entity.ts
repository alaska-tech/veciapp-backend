import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ForeignPersonType {
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

export enum AccountRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  CUSTOMER = 'customer',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'uuid' })
  foreignPersonId: string;

  @Column({ type: 'enum', enum: ForeignPersonType })
  foreignPersonType: ForeignPersonType;

  @Column({ type: 'enum', enum: AccountRole })
  role: AccountRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'text', nullable: true })
  passwordResetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  @Column({ type: 'timestamp', nullable: true })
  hasPasswordChange: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}