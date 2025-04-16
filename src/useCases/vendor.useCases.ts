import { Request, Response } from 'express';
import { VendorBO } from '../business/vendorBO';

export class VendorUseCases {
    private vendorBO: VendorBO = new VendorBO();


//TODO: las respuestas y los request(req.body) deberian pasarse por la interface que ya tengo definida en /types
    createVendor = async (req: Request, res: Response): Promise<void> => {
        try {
            const vendor = await this.vendorBO.createVendor(req.body);
            res.status(201).json({
                data: vendor,
                error: null,
                status: 'success'
            });
        } catch (error) {
            res.status(400).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }

    getVendorById = async (req: Request, res: Response): Promise<void> => {
        try {
            const vendor = await this.vendorBO.getVendorById(req.params.id);
            if (vendor) {
                res.status(200).json({
                    data: vendor,
                    error: null,
                    status: 'success'
                });
            } else {
                res.status(404).json({
                    data: null,
                    error: { message: 'Vendedor no encontrado' },
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



    getAllVendors = async (req: Request, res: Response): Promise<void> => {
        try {
            //TODO: agregar el body a una interface para controlar lo que se recibe
            const vendor = await this.vendorBO.getAllVendors(req.body.limit, req.body.page);
            res.status(200).json({
                data: vendor,
                error: null,
                status: 'success'
            });

        } catch (error) {
            res.status(500).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }

    updateVendor = async (req: Request, res: Response): Promise<void> => {
        try {
            const vendor = await this.vendorBO.updateVendor(req.params.id, req.body);
            if (vendor) {
                res.status(200).json({
                    data: vendor,
                    error: null,
                    status: 'success'
                });
            } else {
                res.status(404).json({
                    data: null,
                    error: { message: 'Vendedor no encontrado' },
                    status: 'error'
                });
            }
        } catch (error) {
            res.status(400).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }

    deleteVendor = async (req: Request, res: Response): Promise<void> => {
        try {
            const success = await this.vendorBO.deleteVendor(req.params.id);
            if (success) {
                res.status(200).json({
                    data: { message: 'Vendedor eliminado correctamente' },
                    error: null,
                    status: 'success'
                });
            } else {
                res.status(404).json({
                    data: null,
                    error: { message: 'Vendedor no encontrado' },
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
            const vendor = await this.vendorBO.validateEmail(req.params.hash);
            if (vendor) {
                res.status(200).json({
                    data: vendor,
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
        } catch (error) {
            res.status(500).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }
}