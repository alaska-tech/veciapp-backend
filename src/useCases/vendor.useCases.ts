import { Response } from 'express';
import { VendorBO } from '../business/vendorBO';
import {
    ApiResponse,
    VendorCreateRequestExtended,
    VendorGetRequestExtended,
    VendorPaginationRequestExtended,
    VendorResponse,
    VendorPaginatedResponse,
    VendorUpdateRequestExtended,
    VendorValidateEmailRequestExtended,
    VendorCreateResponse
} from '../types/vendor';
import {responseError, responseOk} from "../utils/standardResponseServer";

export class VendorUseCases {
    private vendorBO: VendorBO = new VendorBO();

    createVendor = async (req: VendorCreateRequestExtended, res: Response<ApiResponse<VendorCreateResponse>>): Promise<void> => {
        try {
            const vendor = await this.vendorBO.createVendor(req.body);
            res.status(201).json(responseOk({ id: vendor.id, message: 'El Veci-proveedor ha sido creado con exito!'}));
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    getVendorById = async (req: VendorGetRequestExtended, res: Response<ApiResponse<VendorResponse>>): Promise<void> => {
        try {
            const vendor = await this.vendorBO.getVendorById(req.params.id);
            if (vendor) {
                res.status(200).json(responseOk(vendor));
            } else {
                res.status(404).json(responseError({ code: 'NOT_FOUND', message: 'Veci-proveedor no encontrado' }));
            }
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }));
        }
    }

    getAllVendors = async (req: VendorPaginationRequestExtended, res: Response<ApiResponse<VendorPaginatedResponse>>): Promise<void> => {
        try {
            const vendors = await this.vendorBO.getAllVendors(req.params.limit, req.params.page);
            res.status(200).json({
                data: vendors,
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

    updateVendor = async (req: VendorUpdateRequestExtended, res: Response<ApiResponse<VendorResponse>>): Promise<void> => {
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

    deleteVendor = async (req: VendorGetRequestExtended, res: Response<ApiResponse<{message: string}>>): Promise<void> => {
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

    validateEmail = async (req: VendorValidateEmailRequestExtended, res: Response<ApiResponse<VendorResponse>>): Promise<void> => {
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