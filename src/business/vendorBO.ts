import { Vendor } from '../models/vendor.entity';
import { Account } from '../models/account.entity';
import { Between, Repository } from 'typeorm';
import { VendorRepository } from '../repositories/vendor.repository';
import { AppDataSource } from '../config/database';
import {isValidEmail} from "../utils/validateEmails";
import {SALT} from "../utils/constants";
import bcrypt from 'bcrypt'
import mailer from '../services/mailer'
import {encrypt, decrypt} from "../utils/encrypt";
import {VendorCreateRequest, VendorStats, VendorStatsRequestExtended} from "../types/vendor";

export class VendorBO {
    private repository: Repository<Vendor>;
    private accountRepository: Repository<Account>;
    private vendorRepository: VendorRepository

    constructor() {
        this.repository = AppDataSource.getRepository(Vendor);
        this.vendorRepository = new VendorRepository();
        this.accountRepository = AppDataSource.getRepository(Account);
    }

    // Métodos de negocio

    async createVendor(vendorData: VendorCreateRequest): Promise<Vendor> {

        // implementar validaciones de negocio
        if (!vendorData.internalCode) {
            throw new Error('El código interno del Veci-proveedor es requerido.');
        }

        if (!vendorData.email) {
            throw new Error('El Email del Veci-proveedor es requerido.');
        }

        if (!isValidEmail(vendorData.email)) {
            throw new Error('Email ingresado es inválido.');
        }

        if (!vendorData.fullName) {
            throw new Error('El nombre del Veci-proveedor es requerido');
        }

        // implementar reglas de negocio adicionales
        const existingVendor = await this.vendorRepository.findByEmail(vendorData.email)
        if (existingVendor) {
            throw new Error('El Veci-proveedor ya habia sido registrado antes.')
        }

        let stateHistory = [];
        stateHistory.push({ state: 'created', changedAt: new Date()});

        const newUser = await this.repository.create({ ...vendorData, country: "Colombia", city: "Santa Marta", stateHistory: stateHistory })
        const response = await this.repository.save(newUser);

        if (response?.id) {
            //Crear hash para enviar correo
            const objectToHash = {
                email: response.email,
                role: 'vendor',
                id: response.id,
                code: response.internalCode,
                fullname: response.fullname
            }
            const hash = encrypt(JSON.stringify(objectToHash))
            console.log('el hash para validar', hash)

            //enviar correo de bienvenida, para confirmar y crear contrasena
            mailer({
                email: response.email,
                fullname: response.fullName,
                state: response.state,
                title: 'Ya eres parte de VeciApp, falta poco para terminar tu registro',
                message: 'Ahora presiona el botón para continnuar con el proceso de crear tu cuenta de Veci-proveedor',
                anchor: 'http://localhost:3001/api/v1/vendors/validate-email/'+hash,
                template: 'confirm-email'
            })
        }

        return response;
    }

    async getVendorById(id: string): Promise<Vendor | null> {
        return this.repository.findOneBy({ id });
    }

    async getVendorStats(startDate?: Date, endDate?: Date): Promise<VendorStats> {
        let whereCondition: any = {};

        if (startDate && endDate) {
            whereCondition.createdAt = Between(startDate, endDate);
        }

        const totalVendors = await this.repository.count({
            where: whereCondition
        });

        const activeVendors = await this.repository.count({
            where: {
                ...whereCondition,
                isActive: true
            }
        });

        const inactiveVendors = totalVendors - activeVendors;

        return {
            total_vendors: totalVendors,
            active_vendors: activeVendors,
            inactive_vendors: inactiveVendors
        };
    }

    async getAllVendors(limit: number, page: number): Promise<[Vendor[] | null, number]> {
        return (limit && page) ? this.repository.findAndCount({
            take: parseInt(limit),
            skip: parseInt(page)
        }) : this.repository.findAndCount();
    }

    async updateVendor(id: string, vendorData: Partial<Vendor>): Promise<Vendor | null> {
        const vendor = await this.getVendorById(id);
        if (!vendor) return null;

        // Aplicar reglas de negocio para la actualización
        if (vendorData.email && !isValidEmail(vendorData.email)) {
            throw new Error('Email inválido');
        }

        /*if (vendorData.password) {
            vendorData.password = await this.hashPassword(vendorData.password);
        }
*/
        // Actualizar y devolver el usuario
        Object.assign(vendor, vendorData);
        return this.repository.save(vendor);
    }

    async deleteVendor(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async validateEmail(hash: string, internalCode: string, password: string): Promise<object | null> {
        const hashDecrypt: string = decrypt(hash)
        const dataConfirm = JSON.parse(hashDecrypt)
        console.log('el desencriptado para validar', hashDecrypt)
        if (dataConfirm && dataConfirm.email) {
            const pendingVendor = await this.vendorRepository.findByEmail(dataConfirm.email)
            if (!pendingVendor) throw new Error('El Veci-proveedor solicitado no existe');
            if (pendingVendor?.isEmailVerified ) throw new Error('La Url ya expiró');
            //if (dataConfirm.code !== internalCode) throw new Error('El código de Veci-proveedor que ha ingresado no es correcto!.');

            pendingVendor.stateHistory.push({ state: 'verified', changedAt: new Date()});

            // Actualizar y devolver el usuario
            Object.assign(pendingVendor, {isEmailVerified: true, updatedAt: new Date(), state: 'verified'});
            const updateResponse = await this.repository.save(pendingVendor);

            if (!updateResponse) throw new Error('No fue posible verificar al Veci-proveedor solicitado');

            //Crear la cuenta de este vendedor
            const encrypPassword = await this.hashPassword("123456") //TODO: solo pruebas mientras se hace el front
            //const encrypPassword = await this.hashPassword(password)
            const newAccount = await this.accountRepository.create({ fullName: pendingVendor.fullName, email: pendingVendor.email, password: encrypPassword , foreignPersonId: pendingVendor.id, foreignPersonType: "vendor", role: "vendor" })
            const response = await this.accountRepository.save(newAccount);

            if (response?.id) {
                console.log("La cuenta del Veci-proveedor ha sido creada con exito!")
            }

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