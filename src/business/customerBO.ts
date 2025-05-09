import { Customer, CustomerState } from '../models/customer.entity';
import {Between, Repository} from 'typeorm';
import { CustomerRepository } from '../repositories/customer.repository';
import { AppDataSource } from '../config/database';
import {isValidEmail} from "../utils/validateEmails";
import {SALT, CUSTOMER_VALIDATE_EMAIL_URL} from "../utils/constants";
import bcrypt from 'bcryptjs'
import mailer from '../services/mailer'
import {encrypt, decrypt, hashPassword} from "../utils/encrypt";
import {generateOTP} from "../utils/codeGenerator";
import {PaginatedResponse} from "../types/serverResponse";
import {Vendor, vendorState} from "../models/vendor.entity";
import {Account} from "../models/account.entity";
import {Branch} from "../models/branch.entity";
import {VendorRepository} from "../repositories/vendor.repository";
import {
    CustomerCreateRequest,
    CustomerManageStatusRequest,
    CustomerStats,
    CustomerUpdateRequest,
    CustomerValidateEmailRequestExtended
} from "../types/customer";

export class CustomerBO {
    private repository: Repository<Customer>;
    private accountRepository: Repository<Account>;
    private branchRepository: Repository<Branch>;
    private customerRepository: CustomerRepository

    constructor() {
        this.repository = AppDataSource.getRepository(Customer);
        this.customerRepository = new CustomerRepository();
        this.accountRepository = AppDataSource.getRepository(Account);
        this.branchRepository = AppDataSource.getRepository(Branch);
    }

    // Métodos de negocio
    async createCustomer(customerData: CustomerCreateRequest): Promise<Customer> {

        // implementar validaciones de negocio
        if (!customerData.email) {
            throw new Error('Requerimos tu Email para crear tu cuenta.');
        }

        if (!isValidEmail(customerData.email)) {
            throw new Error('El Email que has ingresado no es válido.');
        }

        if (!customerData.password) {
            throw new Error('Requerimos que ingreses una clave para crear tu cuenta.');
        }

        if (!customerData.fullName) {
            throw new Error('Requerimos que ingreses tu nombre completo!');
        }

        // implementar reglas de negocio adicionales
        const [existingCustomer] = await Promise.all([this.customerRepository.findByEmail(customerData.email)])
        if (existingCustomer) {
            throw new Error('Ya tenemos a otro cliente registrado con este mismo Email.')
        }

        let stateHistory = [];
        const newState: CustomerState = CustomerState.CREATED

        stateHistory.push({ state: newState, changedAt: new Date(), reason: "Cliente creado por primera vez"});

        // @ts-ignore
        const newUser = this.repository.create({
            ...customerData,
            country: "Colombia",
            city: "Santa Marta",
            stateHistory: stateHistory
        })

        // @ts-ignore
        const response: Customer = await this.repository.save(newUser);

        if (response && response?.id) {
            //Crear hash para enviar correo
            const objectToHash = {
                email: customerData.email,
                password: customerData.password,
                role: 'customer',
                id: response.id,
                fullname: customerData.fullName
            }
            const hash = encrypt(JSON.stringify(objectToHash))

            //enviar correo de bienvenida, para confirmar y crear contrasena
            mailer({
                email: customerData.email,
                fullname: customerData.fullName,
                title: 'Ya eres parte de VeciApp, falta poco para terminar tu registro',
                message: 'Ahora presiona el botón para confirmar con el proceso de crear tu cuenta y disfrutar de todos los beneficios',
                anchor: CUSTOMER_VALIDATE_EMAIL_URL + '?h=' + hash,
                template: 'customer-confirm-email'
            })
        }
        return response;
    }

    async getCustomerById(id: string): Promise<Customer | null> {
        const customerDetail: Customer | null  = await this.repository.findOneBy({ id });
        if (!customerDetail)throw new Error('El Cliente solicitado no existe');

        //TODO: se pueden devolver las compras del cliente
        /*const customerOrders = await this.orderRepository.find({
            where: {
                customerId: id
            }
        });
        Object.assign(customerDetail, {orders: customerOrders });*/

        return customerDetail
    }

    async getCustomerStats(startDate?: Date, endDate?: Date): Promise<CustomerStats> {
        let whereCondition: any = {};

        if (startDate && endDate) {
            whereCondition.createdAt = Between(startDate, endDate);
        }

        const totalCustomers = await this.repository.count({
            where: whereCondition
        });

        const activeCustomers = await this.repository.count({
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

        const inactiveCustomers = totalCustomers - activeCustomers;

        return {
            total_customers: totalCustomers,
            active_customers: activeCustomers,
            inactive_customers: inactiveCustomers,
            verified_pending: verifiedPending
        };
    }

    async getAllCustomers(limit: number, page: number): Promise<PaginatedResponse<Customer>> {
        const [data, total] = (limit && page) ? await this.repository.findAndCount({
            take: limit,
            skip: (page - 1) * limit,
            order: {
                createdAt: 'DESC'
            }
        }) : await this.repository.findAndCount();

        return {
            data,
            meta: {
                total,
                page,
                limit,
                lastPage: Math.ceil(total / limit)
            }
        };

    }

    async updateCustomer(id: string, customerData: CustomerUpdateRequest): Promise<Customer | null> {
        const vendor = await this.getCustomerById(id);
        if (!vendor)throw new Error('El cliente no fue encontrado en la base de datos');

        // Aplicar reglas de negocio para la actualización
        if (customerData.isActive === false) {
            throw new Error('El cliente se encuentra inactivo y no se permiten operaciones');
        }

        if (customerData.email) {
            throw new Error('No está permitido cambiar el email del cliente');
        }

        if (customerData.state) {
            throw new Error('No está permitido cambiar el estado usando este servicio, use el servicio servicio destinado para cambios de estado.');
        }

        // Actualizar y devolver el usuario
        Object.assign(vendor, customerData);
        return this.repository.save(vendor);
    }

    async changeStatusCustomer(id: string, customerData: CustomerManageStatusRequest): Promise<Customer | null> {
        const customer = await this.getCustomerById(id);
        if (!customer)throw new Error('El cliente solicitado no existe');

        // Aplicar reglas de negocio para la actualización
        if (customerData.changeTo === CustomerState.CREATED || customerData.changeTo === CustomerState.VERIFIED) {
            throw new Error('El estado que desea cambiar no es permitido mediante este servicio. Solo puede cambiar estados de gestión del cliente');
        }

        const newState: CustomerState = customerData.changeTo
        customer.stateHistory.push({ state: newState, changedAt: new Date(), reason: customerData.reason || "El estado del cliente ha sido cambiado por el admin"});

        // Actualizar y devolver al usuario
        Object.assign(customer, {state: customerData.changeTo});
        return this.repository.save(customer);
    }

    async validateEmail(req: CustomerValidateEmailRequestExtended): Promise<object | null> {
        const hashDecrypt: string = decrypt(req.body.hash)
        const dataConfirm = JSON.parse(hashDecrypt)

        if (dataConfirm && dataConfirm.email) {
            const pendingCustomer = await this.customerRepository.findByEmail(dataConfirm.email)
            if (!pendingCustomer) throw new Error('Esta url no pertenece a un cliente registrado');
            if (pendingCustomer?.isEmailVerified ) throw new Error('La url que está usando ya expiró');

            //Crear el historico de estados
            const newState: CustomerState = CustomerState.VERIFIED
            pendingCustomer.stateHistory.push({ state: newState, changedAt: new Date(), reason: "El cliente ha verificado su correo y ha autorizado crear una cuenta."});

            // Actualizar y devolver el usuario
            Object.assign(pendingCustomer, {isEmailVerified: true, updatedAt: new Date(), state: newState});
            const updateResponse = await this.repository.save(pendingCustomer);

            if (!updateResponse) throw new Error('No fue posible verificar al cliente solicitado');

            //Crear la cuenta de este vendedor
            const encrypPassword = await hashPassword(dataConfirm.password)
            // @ts-ignore
            const newAccount = this.accountRepository.create({ fullName: pendingCustomer.fullName, email: pendingCustomer.email, password: encrypPassword , foreignPersonId: pendingCustomer.id, foreignPersonType: "customer", role: "customer" })
            const response = await this.accountRepository.save(newAccount);

            if (response) {
                console.log("La cuenta del Cliente ha sido creada con exito!")
            }

            return {
                isEmailVerified: true,
                email: updateResponse.email
            }
        } else {
            throw new Error('La Url usada no es válida');
        }
    }
}
