import { Request, Response } from 'express';
import { CustomerBO } from '../business/customerBO';

export class CustomerUseCases {
    private customerBO: CustomerBO = new CustomerBO();

//TODO: las respuestas y los request(req.body) deberian pasarse por la interface que ya tengo definida en /types
    createCustomer = async (req: Request, res: Response): Promise<void> => {
        try {
            const customer = await this.customerBO.createCustomer(req.body);
            res.status(201).json({
                data: customer,
                error: null,
                status: 'success'
            });
        } catch (error: any) {
            res.status(400).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }

    getCustomerById = async (req: Request, res: Response): Promise<void> => {
        try {
            const customer = await this.customerBO.getCustomerById(req.params.id);
            if (customer) {
                res.status(200).json({
                    data: customer,
                    error: null,
                    status: 'success'
                });
            } else {
                res.status(404).json({
                    data: null,
                    error: { message: 'Usuario no encontrado' },
                    status: 'error'
                });
            }
        } catch (error) {
            res.status(500).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }



    getAllCustomers = async (req: Request, res: Response): Promise<void> => {
        try {
            //TODO: agregar el body a una interface para controlar lo que se recibe
            const customer = await this.customerBO.getAllCustomers(req.body.limit, req.body.page);
            res.status(200).json({
                data: customer,
                error: null,
                status: 'success'
            });

        } catch (error: any) {
            res.status(500).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }

    updateCustomer = async (req: Request, res: Response): Promise<void> => {
        try {
            const customer = await this.customerBO.updateCustomer(req.params.id, req.body);
            if (customer) {
                res.status(200).json({
                    data: customer,
                    error: null,
                    status: 'success'
                });
            } else {
                res.status(404).json({
                    data: null,
                    error: { message: 'Usuario no encontrado' },
                    status: 'error'
                });
            }
        } catch (error: any) {
            res.status(400).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }

    deleteCustomer = async (req: Request, res: Response): Promise<void> => {
        try {
            const success = await this.customerBO.deleteCustomer(req.params.id);
            if (success) {
                res.status(200).json({
                    data: { message: 'Usuario eliminado correctamente' },
                    error: null,
                    status: 'success'
                });
            } else {
                res.status(404).json({
                    data: null,
                    error: { message: 'Usuario no encontrado' },
                    status: 'error'
                });
            }
        } catch (error) {
            res.status(500).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }

    validateEmail = async (req: Request, res: Response): Promise<void> => {
        try {
            const customer = await this.customerBO.validateEmail(req.params.hash);
            if (customer) {
                res.status(200).json({
                    data: customer,
                    error: null,
                    status: 'success'
                });
            } else {
                res.status(404).json({
                    data: null,
                    error: { message: 'El link es inválido o ya expiró' },
                    status: 'error'
                });
            }
        } catch (error: any) {
            res.status(500).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }
}