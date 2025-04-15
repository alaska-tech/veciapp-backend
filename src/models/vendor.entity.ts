import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export enum vendorState {
    CREATED = 'created',
    VERIFIED = 'verified',
    SUSPENDED = 'suspended',
}

@Entity('vendors')
export class vendor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    internalCode: string;

    @Column({ type: 'varchar', length: 255 })
    fullName: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    identification: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Column({ type: 'varchar', length: 20 })
    cellphone: string;

    @Column({ type: 'varchar', length: 100 })
    country: string;

    @Column({ type: 'varchar', length: 100 })
    city: string;

    @Column({ type: 'varchar', length: 255 })
    address: string;

    @Column({ type: 'int', nullable: true })
    age: number;

    @Column({ type: 'enum', enum: Gender, nullable: true })
    gender: Gender;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar: string;

    @Column({ default: false })
    isHabeasDataConfirm: boolean;

    @Column({ type: 'enum', enum: vendorState, default: vendorState.CREATED })
    state: vendorState;

    @Column({ type: 'jsonb', default: [] })
    stateHistory: Array<{ state: vendorState; changedAt: Date }>;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'float', default: 0 })
    rank: number;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    incomes: string;

    @Column({ type: 'jsonb', nullable: true })
    bankAccount: {
        number: string;
        entity: string;
        type: 'Ahorros' | 'Corriente' | string;
    };

    @Column({ type: 'varchar', length: 255, nullable: true })
    commercialRegistry: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    rut: string;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relación con User
    @OneToOne(() => UserEntity, user => user.vendor)
    @JoinColumn()
    user: UserEntity;
}


// import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
// import { UserEntity } from './user.entity';
//
// @Entity('vendors')
// export class VendorEntity {
//     @PrimaryGeneratedColumn('uuid')
//     id: string;
//
//     @Column({ type: 'varchar', length: 100 })
//     fullname: string;
//
//     @Column({ type: 'varchar', length: 20, nullable: true, default: null })
//     identification: string;
//
//     @Column({ type: 'varchar', length: 3, nullable: true, default: null })
//     age: number;
//
//     @Column({ type: 'varchar', length: 10, nullable: true, default: null  })
//     cellphone: string | null;
//
//     @Column({ type: 'varchar', length: 100, unique: true })
//     email: string;
//
//     @Column({ type: 'varchar', nullable: true, default: null  })
//     address: string | null;
//
//     @Column({ type: 'varchar', nullable: true, default: null  })
//     city: string | null;
//
//     @Column({ type: 'varchar', nullable: true, default: null  })
//     country: string | null;
//
//     @Column({ type: 'varchar', nullable: true, default: null  })
//     commercialRegistry: string | null;
//
//     @Column({ type: 'json', nullable: true, default: null  })
//     bankAccount: string | null;
//
//     @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0})
//     rank: string | null;
//
//     @Column({ type: 'json', nullable: true, default: null  })
//     incomes: any | null;
//
//     @Column({ type: 'boolean', default: false })
//     isActive: boolean;
//
//     @Column({ type: 'varchar', default: "created" })
//     state: string | null;
//
//     @Column({ type: 'boolean', default: false })
//     isEmailVerified: boolean;
//
//     @Column({ type: 'boolean', default: false })
//     isHabeasDataConfirm: boolean;
//
//     @CreateDateColumn()
//     createdAt: Date;
//
//     @UpdateDateColumn()
//     updatedAt: Date;
//
//     // Relación con User
//     @OneToOne(() => UserEntity, user => user.vendor)
//     @JoinColumn()
//     user: UserEntity;
// }