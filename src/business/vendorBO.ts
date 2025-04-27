import {Vendor, vendorState} from '../models/vendor.entity';
import {Account} from '../models/account.entity';
import {Branch} from "../models/branch.entity";
import {Between, Repository} from 'typeorm';
import {VendorRepository} from '../repositories/vendor.repository';
import {AppDataSource} from '../config/database';
import {isValidEmail} from "../utils/validateEmails";
import mailer from '../services/mailer'
import {decrypt, encrypt, hashPassword} from "../utils/encrypt";
import {
    VendorCreateRequest,
    VendorManageStatusRequest,
    VendorStats,
    VendorValidateEmailRequestExtended
} from "../types/vendor";

export class VendorBO {
    private repository: Repository<Vendor>;
    private accountRepository: Repository<Account>;
    private branchRepository: Repository<Branch>;
    private vendorRepository: VendorRepository

    constructor() {
        this.repository = AppDataSource.getRepository(Vendor);
        this.vendorRepository = new VendorRepository();
        this.accountRepository = AppDataSource.getRepository(Account);
        this.branchRepository = AppDataSource.getRepository(Branch);
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
        const [existingVendor] = await Promise.all([this.vendorRepository.findByEmail(vendorData.email)])
        if (existingVendor) {
            throw new Error('El Veci-proveedor ya habia sido registrado antes.')
        }

        let stateHistory = [];
        const newState: vendorState = vendorState.CREATED

        stateHistory.push({ state: newState, changedAt: new Date(), reason: "Veci-proveedor creado por primera vez"});

        const newUser: Vendor & Vendor[] = await this.repository.create({ ...vendorData, country: "Colombia", city: "Santa Marta", stateHistory: stateHistory })
        const response: Vendor = await this.repository.save(newUser);

        if (response && response?.id) {
            //Crear hash para enviar correo
            const objectToHash = {
                email: response.email,
                role: 'vendor',
                id: response.id,
                code: response.internalCode,
                fullname: response.fullName
            }
            const hash = encrypt(JSON.stringify(objectToHash))

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
        const vendorDetail: Vendor  = await this.repository.findOneBy({ id });
        if (!vendorDetail)throw new Error('El Veci-vendedor no existe');

        const vendorBranches = await this.branchRepository.find({
            where: {
                vendorId: id
            }
        });
        Object.assign(vendorDetail, {branches: vendorBranches });
        return vendorDetail
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

        const verifiedPending = await this.repository.count({
            where: {
                ...whereCondition,
                isEmailVerified: false
            }
        });

        const inactiveVendors = totalVendors - activeVendors;

        return {
            total_vendors: totalVendors,
            active_vendors: activeVendors,
            inactive_vendors: inactiveVendors,
            verified_pending: verifiedPending
        };
    }

    async getAllVendors(limit: number, page: number): Promise<Vendor[]> {
        return (limit && page) ? this.repository.find({
            take: limit,
            skip: page
        }) : this.repository.find();
    }

    async updateVendor(id: string, vendorData: Partial<Vendor>): Promise<Vendor | null> {
        const vendor = await this.getVendorById(id);
        if (!vendor)throw new Error('El Veci-vendedor no existe');

        // Aplicar reglas de negocio para la actualización
        if (vendorData.isActive === false) {
            throw new Error('El Veci-proveedor se encuentra inactivo y no se permiten operaciones');
        }

        if (vendorData.email) {
            throw new Error('No está permitido cambiar el email del Veci-proveedor');
        }

        if (vendorData.internalCode) {
            throw new Error('No está permitido cambiar el código interno del Veci-proveedor');
        }

        if (vendorData.state) {
            throw new Error('No está permitido cambiar el estado usando este servicio, use el servicio servicio destinado para cambios de estado.');
        }

        // Actualizar y devolver el usuario
        Object.assign(vendor, vendorData);
        return this.repository.save(vendor);
    }

    async changeStatusVendor(id: string, vendorData: VendorManageStatusRequest): Promise<Vendor | null> {
        const vendor = await this.getVendorById(id);
        if (!vendor)throw new Error('El Veci-vendedor no existe');

        // Aplicar reglas de negocio para la actualización
        if (vendorData.changeTo === vendorState.CREATED || vendorData.changeTo === vendorState.VERIFIED) {
            throw new Error('El estado que desea cambiar no es permitido mediante este servicio. Solo puede cambiar estados de gestion del Veci-proveedor');
        }

        const newState: vendorState = vendorData.changeTo
        vendor.stateHistory.push({ state: newState, changedAt: new Date(), reason: vendorData.reason || "El estado del Veci-proveedor se ha cambiado por el admin"});

        // Actualizar y devolver el usuario
        Object.assign(vendor, {state: vendorData.changeTo});
        return this.repository.save(vendor);
    }

    async deleteVendor(id: string): Promise<boolean> {
        const result = await this.repository.softDelete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async validateEmail(req: VendorValidateEmailRequestExtended): Promise<object | null> {
        const hashDecrypt: string = decrypt(req.body.hash)
        const dataConfirm = JSON.parse(hashDecrypt)

        if (dataConfirm && dataConfirm.email) {
            const pendingVendor = await this.vendorRepository.findByEmail(dataConfirm.email)
            if (!pendingVendor) throw new Error('El Veci-proveedor solicitado no existe');
            if (pendingVendor?.isEmailVerified ) throw new Error('La Url ya expiró');
            if (dataConfirm.code !== req.body.code) throw new Error('El código Veci-proveedor que ha ingresado no es correcto!.');

            //Crear el historico de estados
            const newState: vendorState = vendorState.VERIFIED
            pendingVendor.stateHistory.push({ state: newState, changedAt: new Date(), reason: "Veci-proveedor ha verificado su correo y ha autorizado crear una cuenta."});

            // Actualizar y devolver el usuario
            Object.assign(pendingVendor, {isEmailVerified: true, updatedAt: new Date(), state: newState});
            const updateResponse = await this.repository.save(pendingVendor);

            if (!updateResponse) throw new Error('No fue posible verificar al Veci-proveedor solicitado');

            //Crear la cuenta de este vendedor
            const encrypPassword = await hashPassword(req.body.pass)
            const newAccount: Account & Account[] = this.accountRepository.create({ fullName: pendingVendor.fullName, email: pendingVendor.email, password: encrypPassword , foreignPersonId: pendingVendor.id, foreignPersonType: "vendor", role: "vendor" })
            const response: Account[] = await this.accountRepository.save(newAccount);

            if (response) {
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
}