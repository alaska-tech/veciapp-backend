import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';

import { Customer } from './customer.entity';
import { vendor } from './vendor.entity';

export enum AccountType {
    CUSTOMER = "customer",
    VENDOR = "vendor",
    ADMIN = "admin"
}

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    fullname: string;

    @Column({
        type: "varchar",
        length: 255,
        unique: true
    })
    email: string;

    @Column({
        type: "varchar",
        length: 255,
        select: false // para que la contraseña no se devuelva en consultas
    })
    password: string;

    @Column()
    foreignPerson: string;

    @Column({
        type: "enum",
        enum: AccountType,
        default: AccountType.CUSTOMER
    })
    role: AccountType;

    @Column({
        type: "boolean",
        default: false
    })
    isActive: boolean;

    @Column({ type: 'varchar', nullable: true })
    refreshToken: string | null;

    @Column({ type: 'varchar', nullable: true })
    passwordResetToken: string | null;

    @Column({ type: 'varchar', nullable: true })
    passwordResetExpires: Date | null;

    @Column({
        type: "boolean",
        default: false
    })
    isVerified: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relaciones
/*    @OneToOne(() => Customer, customer => customer.user)
    customer: Customer;

    @OneToOne(() => vendor, vendor => vendor.user)
    vendor: vendor;*/
}