import { Response } from 'express';
import { VendorBO } from '../business/vendorBO';
import {
    VendorCreateRequestExtended,
    VendorGetRequestExtended,
    VendorPaginationRequestExtended,
    VendorResponse,
    VendorUpdateRequestExtended,
    VendorValidateEmailRequestExtended,
    VendorCreateResponse,
    VendorStatsRequestExtended,
    VendorStats, VendorManageStatusRequestExtended
} from '../types/vendor';
import {ApiResponse} from '../types/serverResponse';
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

    getStats = async (req: VendorStatsRequestExtended, res: Response<ApiResponse<VendorStats>>): Promise<void> => {
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

            const stats = await this.vendorBO.getVendorStats(startDate, endDate);

            res.status(200).json(responseOk(stats));
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message } as any));
        }
    }

    getAllVendors = async (req: VendorPaginationRequestExtended, res: Response<ApiResponse<any>>): Promise<void> => {
        try {
            const vendors = await this.vendorBO.getAllVendors(Number(req.params.limit), Number(req.params.page));
            res.status(200).json(responseOk(vendors));
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }  as any));
        }
    }

    updateVendor = async (req: VendorUpdateRequestExtended, res: Response<ApiResponse<VendorCreateResponse>>): Promise<void> => {
        try {
            const vendor = await this.vendorBO.updateVendor(req.params.id, req.body);
            if (vendor) {
                res.status(200).json(responseOk({ id: vendor.id, message: 'El Veci-proveedor ha sido actualizado con exito!'}));
            } else {
                res.status(404).json(responseError({ message: 'Veci-proveedor no encontrado' }));
            }
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    manageStatus = async (req: VendorManageStatusRequestExtended, res: Response<ApiResponse<VendorCreateResponse>>): Promise<void> => {
        try {
            const vendor = await this.vendorBO.changeStatusVendor(req.params.id, req.body);
            if (vendor) {
                res.status(200).json(responseOk({ id: vendor.id, message: 'El estado del Veci-proveedor ha sido actualizado con exito!'}));
            } else {
                res.status(404).json(responseError({ message: 'Veci-proveedor no encontrado' }));
            }
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    deleteVendor = async (req: VendorGetRequestExtended, res: Response<ApiResponse<{message: string}>>): Promise<void> => {
        try {
            const success = await this.vendorBO.deleteVendor(req.params.id);
            if (success) {
                res.status(200).json(responseOk({ message: 'El Veci-proveedor se ha eliminado correctamente' }));
            } else {
                res.status(404).json(responseError({ message: 'Veci-proveedor no encontrado' }));
            }
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }));
        }
    }

    validateEmail = async (req: VendorValidateEmailRequestExtended, res: Response<ApiResponse<VendorResponse>>): Promise<void> => {
        try {
            const vendor = await this.vendorBO.validateEmail(req);
            if (vendor) {
                res.status(200).json(responseOk(vendor));
            } else {
                res.status(404).json(responseError({ message: 'El link es inválido o ya expiró' }));
            }
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }));
        }
    }
}