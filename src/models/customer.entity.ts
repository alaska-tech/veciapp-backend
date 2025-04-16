import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

interface Point {
    x: number; // longitud
    y: number; // latitud
}

@Entity('customers')
export class CustomerEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    fullname: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    identification: string | null;

    @Column({ type: 'varchar', length: 10, nullable: true })
    cellphone: string | null;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    address: string | null;

    @Column({ type: 'varchar', nullable: true })
    city: string | null;

    @Column({ type: 'varchar', nullable: true })
    country: string | null;

    @Column("point", { array: true, nullable: true })
    locations: Point[] | null;

    @Column({ type: "jsonb", nullable: true })
    interests: Array<[number, number]> | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0})
    score: string | null;

    @Column({ type: 'boolean', default: false })
    isActive: boolean;

    @Column({ type: 'varchar', nullable: true, default: "created" })
    state: string | null;

    @Column({ type: 'varchar', nullable: true, default: null })
    codeOtpAuthorization: string | null;

    @Column({ type: 'boolean', default: false })
    isEmailVerified: boolean;

    @Column({ type: 'boolean', default: false })
    isHabeasDataConfirm: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToOne(() => UserEntity, user => user.customer)
    @JoinColumn()
    user: UserEntity
}