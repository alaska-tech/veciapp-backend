import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn, OneToOne, JoinColumn,
} from 'typeorm';
import {BranchState} from "./branch.entity";

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
}

export enum CustomerState {
    CREATED = 'created',
    VERIFIED = 'verified',
    SUSPENDED = 'suspended'
}

@Entity('customers')
export class Customer {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    fullName!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    identification!: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email!: string;

    @Column({ default: false })
    isEmailVerified!: boolean;

    @Column({ type: 'varchar', length: 20 })
    cellphone!: string;

    @Column({ type: 'varchar', length: 100 })
    country!: string;

    @Column({ type: 'varchar', length: 100 })
    city!: string;

    @Column({ type: 'varchar', length: 255 })
    address!: string;

    @Column({ type: 'int', nullable: true })
    age!: number;

    @Column({ type: 'date', nullable: true })
    birthdate!: Date;

    @Column({ type: 'enum', enum: Gender, nullable: true })
    gender!: Gender;

    @Column({ default: false })
    isHabeasDataConfirm!: boolean;

    @Column({ type: 'enum', enum: CustomerState, default: CustomerState.CREATED })
    state!: CustomerState;

    @Column({ type: 'jsonb', default: [] })
    stateHistory!: Array<{ state: CustomerState; changedAt: Date, reason: string }>;

    @Column({ default: true })
    isActive!: boolean;

    @Column({ type: 'float', default: 0 })
    score!: number;

    @Column({ type: 'text', array: true, default: [] })
    interests!: string[];

    @Column({ type: 'jsonb', nullable: true })
    locations!: Array<{ alias: string; coordinates: [number, number] }>;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar!: string;

    @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
    totalSpent!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    preferredPaymentMethod!: string;

    @Column({ type: 'text', array: true, default: [] })
    dietaryRestrictions!: string[];

    @Column({ type: 'timestamp', nullable: true })
    lastOrderDate!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    /*    @OneToOne(() => UserEntity, user => user.customer)
        @JoinColumn()
        user!: UserEntity*/
}
