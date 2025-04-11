import { VendorEntity } from '../models/vendor.entity';
import { Repository } from 'typeorm';
import { VendorRepository } from '../repositories/vendor.repository';
import { AppDataSource } from '../config/database';
import {isValidEmail} from "../utils/validateEmails";
import {SALT} from "../utils/constants";
import bcrypt from 'bcrypt'
import mailer from '../services/mailer'
import {encrypt, decrypt} from "../utils/encrypt";

export class VendorBO {
    private repository: Repository<VendorEntity>;
    private vendorRepository: VendorRepository

    constructor() {
        this.repository = AppDataSource.getRepository(VendorEntity);
        this.vendorRepository = new VendorRepository();
    }

    // Métodos de negocio
    async createVendor(vendorData: Omit<VendorEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<VendorEntity> {
        // implementar validaciones de negocio
        if (!isValidEmail(vendorData.email)) {
            throw new Error('Email inválido');
        }

        if (!vendorData.fullname) {
            throw new Error('El nombre del vendedor es requerido');
        }

        // implementar reglas de negocio adicionales
        const existingVendor = await this.vendorRepository.findByEmail(vendorData.email)
        if (existingVendor) {
            throw new Error('El vendedor ya habia sido registrado antes.')
        }

        const newUser = await this.repository.create({ ...vendorData })

        const response = await this.repository.save(newUser);

        if (response?.id) {
            //Crear hash para enviar correo
            const objectToHash = {
                email: response.email,
                role: 'vendor',
                id: response.id,
                fullname: response.fullname
            }
            const hash = encrypt(JSON.stringify(objectToHash))
            console.log('el hash para validar', hash)

            //enviar correo de bienvenida, para confirmar y crear contrasena
            mailer({
                email: response.email,
                fullname: response.fullname,
                state: response.state,
                title: 'Ya eres parte de VeciApp, falta poco para terminar tu registro',
                message: 'Ahora asigna una clave para tu cuenta de vendedor',
                anchor: 'http://localhost:3001/api/v1/vendors/validate-email/'+hash,
                template: 'confirm-email'
            })
        }

        return response;
    }

    async getVendorById(id: string): Promise<VendorEntity | null> {
        return this.repository.findOneBy({ id });
    }

    async getAllVendors(limit: number, page: number): Promise<[VendorEntity[] | null, number]> {
        return this.repository.findAndCount({
            take: limit,
            skip: page
        });
    }

    async updateVendor(id: string, vendorData: Partial<VendorEntity>): Promise<VendorEntity | null> {
        const vendor = await this.getVendorById(id);
        if (!vendor) return null;

        // Aplicar reglas de negocio para la actualización
        if (vendorData.email && !isValidEmail(vendorData.email)) {
            throw new Error('Email inválido');
        }

        if (vendorData.password) {
            vendorData.password = await this.hashPassword(vendorData.password);
        }

        // Actualizar y devolver el usuario
        Object.assign(vendor, vendorData);
        return this.repository.save(vendor);
    }

    async deleteVendor(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async validateEmail(hash: string): Promise<object | null> {
        const hashDecrypt: string = decrypt(hash)
        const dataConfirm = JSON.parse(hashDecrypt)
        console.log('el desencriptado para validar', hashDecrypt)
        if (dataConfirm && dataConfirm.email) {
            const pendingVendor = await this.vendorRepository.findByEmail(dataConfirm.email)
            if (!pendingVendor) throw new Error('El vendedor solicitado no existe');
            if (pendingVendor?.isEmailVerified ) throw new Error('La Url ya expiró');

            // Actualizar y devolver el usuario
            Object.assign(pendingVendor, {isEmailVerified: true, updatedAt: new Date(), state: 'verified'});
            const updateResponse = await this.repository.save(pendingVendor);

            if (!updateResponse) throw new Error('No fue posible verificar al vendedor solicitado');

            return {
                isEmailVerified: true,
                email: updateResponse.email
            }
        } else {
            throw new Error('La Url proporsionada no es válida');
        }
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, SALT)
    }
}