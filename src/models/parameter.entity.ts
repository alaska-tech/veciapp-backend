import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('parameters')
export class Parameter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  displayName: string; // Nombre para mostrar en el dashboard

  @Column({ type: 'varchar' })
  name: string; // Nombre en base de datos

  @Column({ type: 'varchar' })
  description: string; // Descripción del parámetro

  @Column({ type: 'varchar' })
  value: string; // Valor del parámetro

  @Column({ type: 'enum', enum: ['string', 'number', 'boolean', 'json'] })
  type: 'string' | 'number' | 'boolean' | 'json'; // Tipo de dato del parámetro

  @Column({ default: true })
  isActive: boolean; // Estado del parámetro (activo/inactivo)

  @Column({ type: 'text', nullable: true })
  createdBy: string; // Usuario que creó el parámetro

  @Column({ type: 'text', nullable: true })
  updatedBy: string; // Usuario que actualizó el parámetro

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}