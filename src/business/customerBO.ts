import { CustomerEntity } from '../models/customer.entity';
import { Repository } from 'typeorm';
import { CustomerRepository } from '../repositories/customer.repository';
import { AppDataSource } from '../config/database';
import {isValidEmail} from "../utils/validateEmails";
import {SALT} from "../utils/constants";
import bcrypt from 'bcryptjs'
import mailer from '../services/mailer'
import {encrypt, decrypt} from "../utils/encrypt";
import {generateOTP} from "../utils/codeGenerator";

export class CustomerBO {
    private repository: Repository<CustomerEntity>;
    private customerRepository: CustomerRepository

    constructor() {
        this.repository = AppDataSource.getRepository(CustomerEntity);
        this.customerRepository = new CustomerRepository();
    }

    // Métodos de negocio
    async createCustomer(customerData: Omit<CustomerEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CustomerEntity> {
        // implementar validaciones de negocio
        if (!isValidEmail(customerData.email)) {
            throw new Error('Email inválido');
        }

        if (!customerData.email) {
            throw new Error('La dirección de correo es requerida');
        }

        if (!customerData.fullname) {
            throw new Error('El nombre del usuario es requerido');
        }

        // implementar reglas de negocio adicionales
        const existingCustomer = await this.customerRepository.findByEmail(customerData.email)
        if (existingCustomer) {
            throw new Error('El cliente ya habia sido registrado antes.')
        }

        //Creamos un codigo otp para un cliente nuevo
        const newOtp = generateOTP()
        const otpSplit = newOtp.split('')

        Object.assign(customerData, {codeOtpAuthorization: newOtp});

        const newUser = await this.repository.create({ ...customerData })

        const response = await this.repository.save(newUser);

        if (response?.id) {
            //Crear hash para enviar correo
            const objectToHash = {
                email: response.email,
                role: 'customer',
                id: response.id,
                fullname: response.fullname
            }
            const hash = encrypt(JSON.stringify(objectToHash))

            console.log('el hash para validar', hash)
            console.log("otp split:", otpSplit)

            //enviar correo de bienvenida, para confirmar otp
            mailer({
                email: response.email,
                fullname: response.fullname,
                state: response.state,
                title: 'Ya eres parte de VeciApp, falta poco para terminar tu registro',
                message: '',
                otpdigit1: otpSplit[0],
                otpdigit2: otpSplit[1],
                otpdigit3: otpSplit[2],
                otpdigit4: otpSplit[3],
                otpdigit5: otpSplit[4],
                otpdigit6: otpSplit[5],
                template: 'otp'
            });

            Object.assign(response, {hash: hash});
        }

        return response;
    }

    async getCustomerById(id: string): Promise<CustomerEntity | null> {
        return this.repository.findOneBy({ id });
    }

    async getAllCustomers(limit: number, page: number): Promise<[CustomerEntity[] | null, number]> {
        return this.repository.findAndCount({
            take: limit,
            skip: page
        });
    }

    async updateCustomer(id: string, customerData: Partial<CustomerEntity>): Promise<CustomerEntity | null> {
        const customer = await this.getCustomerById(id);
        if (!customer) return null;

        // Aplicar reglas de negocio para la actualización
        if (customerData.email && !isValidEmail(customerData.email)) {
            throw new Error('Email inválido');
        }

        if (customerData.password) {
            customerData.password = await this.hashPassword(customerData.password);
        }

        // Actualizar y devolver el usuario
        Object.assign(customer, customerData);
        return this.repository.save(customer);
    }

    async deleteCustomer(id: string): Promise<boolean> {
        const result = await this.repository.softDelete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async validateEmail(hash: string): Promise<object | null> {
        const hashDecrypt: string = decrypt(hash)
        const dataConfirm = JSON.parse(hashDecrypt)
        console.log('el desencriptado para validar', hashDecrypt)
        if (dataConfirm && dataConfirm.email) {
            const pendingCustomer = await this.customerRepository.findByEmail(dataConfirm.email)
            if (!pendingCustomer) throw new Error('El vendedor solicitado no existe');
            if (pendingCustomer?.isEmailVerified ) throw new Error('La Url ya expiró');

            // Actualizar y devolver el usuario
            Object.assign(pendingCustomer, {isEmailVerified: true, updatedAt: new Date(), state: 'verified'});
            const updateResponse = await this.repository.save(pendingCustomer);

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