import { Request, Response } from 'express';
import { CustomerBO } from '../business/customerBO';
import {
    CustomerCreateRequestExtended,
    CustomerCreateResponse,
    CustomerGetRequestExtended,
    CustomerManageStatusRequestExtended,
    CustomerPaginationRequestExtended,
    CustomerResponse,
    CustomerStats,
    CustomerStatsRequestExtended,
    CustomerUpdateRequestExtended,
    CustomerValidateEmailRequestExtended
} from "../types/customer";
import {ApiResponse} from "../types/serverResponse";
import {responseError, responseOk} from "../utils/standardResponseServer";


export class CustomerUseCases {
    private customerBO: CustomerBO = new CustomerBO();

    createCustomer = async (req: CustomerCreateRequestExtended, res: Response<ApiResponse<CustomerCreateResponse>>): Promise<void> => {
        try {
            const customer = await this.customerBO.createCustomer(req.body);
            res.status(201).json(responseOk({ id: customer.id, message: 'Bienvenido a Veciapp, has sido creado con exito!'}));
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    getCustomerById = async (req: CustomerGetRequestExtended, res: Response<ApiResponse<CustomerResponse>>): Promise<void> => {
        try {
            const customer = await this.customerBO.getCustomerById(req.params.id);
            if (customer) {
                res.status(200).json(responseOk(customer));
            } else {
                res.status(404).json(responseError({ code: 'NOT_FOUND', message: 'El cliente no se encuentra en la base de datos' }));
            }
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }));
        }
    }

    getStats = async (req: CustomerStatsRequestExtended, res: Response<ApiResponse<CustomerStats>>): Promise<void> => {
        try {
            // Extraemos los parámetros de consulta
            const startStr = req.query.start as string | undefined;
            const endStr = req.query.end as string | undefined;

            let startDate: Date | undefined;
            let endDate: Date | undefined;

            // Procesamos las fechas solo si están presentes
            if (startStr) {
                startDate = new Date(startStr);
                // Validamos que la fecha de inicio sea válida
                if (isNaN(startDate.getTime())) {
                    res.status(400).json(responseError({ message: 'Formato de fecha de inicio inválido. Use YYYY-MM-DD' } as any));
                    return;
                }
            }

            if (endStr) {
                endDate = new Date(endStr);
                // Validamos que la fecha final sea válida
                if (isNaN(endDate.getTime())) {
                    res.status(400).json(responseError({ message: 'Formato de fecha final inválido. Use YYYY-MM-DD' } as any));
                    return;
                }
                // Aseguramos que la fecha final sea el último momento del día
                endDate.setHours(23, 59, 59, 999);
            }

            // Si se proporciona solo una fecha, respondemos con error
            if ((startDate && !endDate) || (!startDate && endDate)) {
                res.status(400).json(responseError({ message: 'Debe proporcionar ambas fechas (start y end) o ninguna' } as any));
                return;
            }

            const stats = await this.customerBO.getCustomerStats(startDate, endDate);

            res.status(200).json(responseOk(stats));
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message } as any));
        }
    }

    getAllCustomers = async (req: CustomerPaginationRequestExtended, res: Response<ApiResponse<any>>): Promise<void> => {
        try {
            const customers = await this.customerBO.getAllCustomers(Number(req.query.limit), Number(req.query.page));
            res.status(200).json(responseOk(customers));
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }  as any));
        }
    }

    updateCustomer = async (req: CustomerUpdateRequestExtended, res: Response<ApiResponse<CustomerCreateResponse>>): Promise<void> => {
        try {
            const vendor = await this.customerBO.updateCustomer(req.params.id, req.body);
            if (vendor) {
                res.status(200).json(responseOk({ id: vendor.id, message: 'Tus datos han sido actualizados con exito!'}));
            } else {
                res.status(404).json(responseError({ message: 'El cliente no se encontró en la base de datos' }));
            }
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    manageStatus = async (req: CustomerManageStatusRequestExtended, res: Response<ApiResponse<CustomerCreateResponse>>): Promise<void> => {
        try {
            const vendor = await this.customerBO.changeStatusCustomer(req.params.id, req.body);
            if (vendor) {
                res.status(200).json(responseOk({ id: vendor.id, message: 'El estado del cliente ha sido actualizado con exito!'}));
            } else {
                res.status(404).json(responseError({ message: 'El cliente no fue encontrado en la base de datos' }));
            }
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    validateEmail = async (req: CustomerValidateEmailRequestExtended, res: Response<ApiResponse<CustomerResponse>>): Promise<void> => {
        try {
            const customer = await this.customerBO.validateEmail(req);
            if (customer) {
                res.status(200).json(responseOk(customer));
            } else {
                res.status(404).json(responseError({ message: 'El link que esta intentando usar es inválido o ya expiró' }));
            }
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }));
        }
    }
}
