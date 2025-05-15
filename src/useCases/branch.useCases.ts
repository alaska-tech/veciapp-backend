import { Response } from 'express';
import { BranchBO } from '../business/branchBO';
import {
    BranchCreateRequestExtended,
    BranchGetRequestExtended,
    BranchPaginationRequestExtended,
    BranchResponse,
    BranchUpdateRequestExtended,
    BranchValidateEmailRequestExtended,
    BranchCreateRequest,
    BranchStatsRequestExtended,
    BranchCreateResponse,
    BranchStats,
    BranchManageStatusRequestExtended,
    NearbyBranchPaginationRequestExtended,
    FileUploadRequestExtended,
    RemoveImageRequestExtended
} from '../types/branch';
import {ApiResponse} from '../types/serverResponse';
import {responseError, responseOk} from "../utils/standardResponseServer";

export class BranchUseCases {
    private branchBO: BranchBO = new BranchBO();

    createBranch = async (req: BranchCreateRequestExtended, res: Response<ApiResponse<BranchCreateResponse>>): Promise<void> => {
        try {
            const branch = await this.branchBO.createBranch(req.params.vendorId ,req.body);
            res.status(201).json(responseOk({ id: branch.id, message: 'Se ha creado una nueva tienda para el Veci-proveedor!'}));
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    getAllBranches = async (req: BranchPaginationRequestExtended, res: Response<ApiResponse<any>>): Promise<void> => {
        try {
            const branches = await this.branchBO.getAllBranches(Number(req.query.limit), Number(req.query.page));
            res.status(200).json(responseOk(branches));
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }  as any));
        }
    }

    getNearbyBranches = async (req: NearbyBranchPaginationRequestExtended, res: Response<ApiResponse<any>>): Promise<void> => {
        try {
            const branches = await this.branchBO.getNearbyBranches(req.query);
            res.status(200).json(responseOk(branches));
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }  as any));
        }
    }

    getBranchById = async (req: BranchGetRequestExtended, res: Response<ApiResponse<BranchResponse>>): Promise<void> => {
        try {
            const branch = await this.branchBO.getBranchById(req.params.id);
            if (branch) {
                res.status(200).json(responseOk(branch));
            } else {
                res.status(404).json(responseError({ message: 'Tienda no encontrada' }));
            }
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }));
        }
    }

    getStats = async (req: BranchStatsRequestExtended, res: Response<ApiResponse<BranchStats>>): Promise<void> => {
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

            const stats = await this.branchBO.getBranchStats(startDate, endDate);

            res.status(200).json(responseOk(stats));
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message } as any));
        }
    }

    updateBranch = async (req: BranchUpdateRequestExtended, res: Response<ApiResponse<BranchCreateResponse>>): Promise<void> => {
        try {
            const vendor = await this.branchBO.updateBranch(req.params.id, req.body);
            if (vendor) {
                res.status(200).json(responseOk({ id: vendor.id, message: 'La tienda ha sido actualizada con exito!'}));
            } else {
                res.status(404).json(responseError({ message: 'Tienda no encontrada' }));
            }
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    manageStatus = async (req: BranchManageStatusRequestExtended, res: Response<ApiResponse<BranchCreateResponse>>): Promise<void> => {
        try {
            const branch = await this.branchBO.changeStatusBranch(req.params.id, req.body);
            if (branch) {
                res.status(200).json(responseOk({ id: branch.id, message: 'El estado de la tienda ha sido actualizado con exito!'}));
            } else {
                res.status(404).json(responseError({ message: 'Tienda no encontrada' }));
            }
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    deleteBranch = async (req: BranchGetRequestExtended, res: Response<ApiResponse<{message: string}>>): Promise<void> => {
        try {
            const success = await this.branchBO.deleteBranch(req.params.id);
            if (success) {
                res.status(200).json(responseOk({ message: 'La tienda se ha eliminado correctamente' }));
            } else {
                res.status(404).json(responseError({ message: 'Tienda no encontrada' }));
            }
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }));
        }
    }

    uploadLogo = async (req: FileUploadRequestExtended, res: Response<ApiResponse<BranchCreateResponse>>): Promise<void> => {
        try {
            if (!req.body.logo) {
                res.status(400).json(responseError({ message: 'No se ha proporcionado una imagen para el logo' }));
                return;
            }

            const branch = await this.branchBO.updateBranchLogo(req.params.id, req.body.logo);
            if (branch) {
                res.status(200).json(responseOk({ id: branch.id, message: 'El logo de la tienda ha sido actualizado con éxito!' }));
            } else {
                res.status(404).json(responseError({ message: 'Tienda no encontrada' }));
            }
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    uploadImages = async (req: FileUploadRequestExtended, res: Response<ApiResponse<BranchCreateResponse>>): Promise<void> => {
        try {
            if (!req.body.images || !Array.isArray(req.body.images) || req.body.images.length === 0) {
                res.status(400).json(responseError({ message: 'No se han proporcionado imágenes para cargar' }));
                return;
            }

            const branch = await this.branchBO.addBranchImages(req.params.id, req.body.images);
            if (branch) {
                res.status(200).json(responseOk({
                    id: branch.id,
                    message: `Se han agregado ${req.body.images.length} imágenes a la tienda con éxito!`
                }));
            } else {
                res.status(404).json(responseError({ message: 'Tienda no encontrada' }));
            }
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }

    removeImage = async (req: RemoveImageRequestExtended, res: Response<ApiResponse<BranchCreateResponse>>): Promise<void> => {
        try {
            if (!req.body.imageUrl) {
                res.status(400).json(responseError({ message: 'No se ha proporcionado la URL de la imagen a eliminar' }));
                return;
            }

            const branch = await this.branchBO.removeBranchImage(req.params.id, req.body.imageUrl);
            if (branch) {
                res.status(200).json(responseOk({ id: branch.id, message: 'La imagen ha sido eliminada con éxito!' }));
            } else {
                res.status(404).json(responseError({ message: 'Tienda no encontrada o imagen no encontrada' }));
            }
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    }
}