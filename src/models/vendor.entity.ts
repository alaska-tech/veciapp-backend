import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('vendors')
export class VendorEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    fullname: string;

    @Column({ type: 'varchar', length: 20, nullable: true, default: null })
    identification: string;

    @Column({ type: 'varchar', length: 3, nullable: true, default: null })
    age: number;

    @Column({ type: 'varchar', length: 10, nullable: true, default: null  })
    cellphone: string | null;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', nullable: true, default: null  })
    address: string | null;

    @Column({ type: 'varchar', nullable: true, default: null  })
    city: string | null;

    @Column({ type: 'varchar', nullable: true, default: null  })
    country: string | null;

    @Column({ type: 'varchar', nullable: true, default: null  })
    commercialRegistry: string | null;

    @Column({ type: 'json', nullable: true, default: null  })
    bankAccount: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.0})
    rank: string | null;

    @Column({ type: 'json', nullable: true, default: null  })
    incomes: any | null;

    @Column({ type: 'boolean', default: false })
    isActive: boolean;

    @Column({ type: 'varchar', default: "created" })
    state: string | null;

    @Column({ type: 'boolean', default: false })
    isEmailVerified: boolean;

    @Column({ type: 'boolean', default: false })
    isHabeasDataConfirm: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Relación con User
    @OneToOne(() => UserEntity, user => user.vendor)
    @JoinColumn()
    user: UserEntity;
}