import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

//import { Customer } from "./Customer"
//import { Vendor } from "./Vendor"

export enum AccountType {
    CUSTOMER = "customer",
    VENDOR = "vendor",
    ADMIN = "admin"
}

@Entity('account')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

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

    @Column({ nullable: true })
    refreshToken: string;

    @Column({ nullable: true })
    passwordResetToken: string;

    @Column({ nullable: true })
    passwordResetExpires: Date;

    @Column({
        type: "boolean",
        default: false
    })
    isVerified: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    //TODO: Organizar las relaciones
    /*
    // Relaciones
    @OneToOne(() => Customer, customer => customer.account, { nullable: true })
    customer?: Customer;

    @OneToOne(() => Vendor, vendor => vendor.account, { nullable: true })
    vendor?: Vendor;
    */
}