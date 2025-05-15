import {Branch, BranchState} from '../models/branch.entity';
import {ProductService} from '../models/productservice.entity';
import {Between, Repository} from 'typeorm';
import {VendorRepository} from '../repositories/vendor.repository';
import {AppDataSource} from '../config/database';
import {BranchCreateRequest, BranchManageStatusRequest, BranchStats, BranchUpdateRequest, NearbyBranchesOptions, PaginatedNearbyResponse } from "../types/branch";

import {PaginatedResponse} from "../types/serverResponse";
import {Vendor} from "../models/vendor.entity";
import { CloudinaryService } from '../services/uploadImages';


export class BranchBO {
    private vendorRepository: Repository<Vendor>
    private branchRepository: Repository<Branch>;
    private productServiceRepository: Repository<ProductService>;
    private cloudinaryService: CloudinaryService;

    constructor() {
        this.vendorRepository = AppDataSource.getRepository(Vendor);
        this.branchRepository = AppDataSource.getRepository(Branch);
        this.productServiceRepository = AppDataSource.getRepository(ProductService);
        this.cloudinaryService = new CloudinaryService();
    }

    // Métodos de negocio
    async createBranch(id: string, branchData: BranchCreateRequest): Promise<Branch> {
        // implementar validaciones de negocio
        if (!id) {
            throw new Error('El id del Veci-proveedor es requerido.');
        }

        if (!branchData.name) {
            throw new Error('El nombre de la tienda es requerido.');
        }

        if (branchData.rank) {
            throw new Error('No está permitido cambiar el campo de calificacion de la tienda');
        }

        if (branchData.state) {
            throw new Error('No está permitido cambiar el estado usando este servicio, use el servicio destinado para cambios de estado.');
        }

        // implementar reglas de negocio adicionales
        const existingVendor = await this.vendorRepository.findOneBy({id})
        console.log(existingVendor )
        if (!existingVendor) {
            throw new Error('El Veci-proveedor asociado a esta tienda no existe.')
        }

        let stateHistory = [];
        const newState: BranchState = BranchState.CREATED

        stateHistory.push({ state: newState, changedAt: new Date(), reason: "Tienda del Veci-proveedor creada por primera vez"});

        //TODO: crear el punto de georeferenciacion en caso de que llegue el campo

        // @ts-ignore
        const newBranch = this.branchRepository.create({
            ...branchData,
            country: "Colombia",
            city: "Santa Marta",
            stateHistory: stateHistory
        })

        // @ts-ignore
        return this.branchRepository.save(newBranch);
    }

    async getBranchById(id: string): Promise<Branch | null> {
        const branchDetail: Branch | null  = await this.branchRepository.findOneBy({ id });
        if (!branchDetail)throw new Error('La tienda solicitada no existe');

        const branchProducts = await this.productServiceRepository.find({
            where: {
                branchId: id
            }
        });
        Object.assign(branchDetail, {productServices: branchProducts });
        return branchDetail
    }

    async getBranchStats(startDate?: Date, endDate?: Date): Promise<BranchStats> {
        let whereCondition: any = {};

        if (startDate && endDate) {
            whereCondition.createdAt = Between(startDate, endDate);
        }

        const totalBranches = await this.branchRepository.count({
            where: whereCondition
        });

        const inactiveBranches = await this.branchRepository.count({
            where: {
                ...whereCondition,
                state: "inactive"
            }
        });

        const activeVendors = totalBranches - inactiveBranches;

        return {
            total_branches: totalBranches,
            active_branches: activeVendors,
            inactive_branches: inactiveBranches,
        };
    }

    async getAllBranches(limit: number, page: number): Promise<PaginatedResponse<Branch>> {
        const [data, total] = (limit && page) ? await this.branchRepository.findAndCount({
            take: limit,
            skip: (page - 1) * limit,
            order: {
                createdAt: 'DESC'
            }
        }) : await this.branchRepository.findAndCount();

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

    async updateBranch(id: string, branchData: BranchUpdateRequest): Promise<Branch | null> {
        const branch: Branch | null = await this.branchRepository.findOneBy({ id });
        if (!branch)throw new Error('La tienda no existe');

        // Aplicar reglas de negocio para la actualización
        if (branchData.vendorId) {
            throw new Error('No está permitido cambiar el dueño de la tienda');
        }

        if (branchData.rank) {
            throw new Error('No está permitido cambiar el campo de calificacion de la tienda');
        }

        if (branchData.state) {
            throw new Error('No está permitido cambiar el estado usando este servicio, use el servicio destinado para cambios de estado.');
        }

        // Actualizar y devolver el usuario
        Object.assign(branch, branchData);
        return this.branchRepository.save(branch);
    }

    async changeStatusBranch(id: string, branchData: BranchManageStatusRequest): Promise<Branch | null> {
        const branch: Branch | null = await this.branchRepository.findOneBy({ id });
        if (!branch)throw new Error('La tienda no existe');

        // Aplicar reglas de negocio para la actualización
        if (branchData.changeTo === BranchState.CREATED || branchData.changeTo === BranchState.VERIFIED) {
            throw new Error('El estado que desea cambiar no es permitido mediante este servicio. Solo puede cambiar estados de gestion de la tienda');
        }

        const newState: BranchState = branchData.changeTo
        branch.stateHistory.push({ state: newState, changedAt: new Date(), reason: branchData.reason || "El estado de la tienda se ha cambiado por el admin"});

        // Actualizar y devolver el usuario
        Object.assign(branch, {state: branchData.changeTo});
        return this.branchRepository.save(branch);
    }

    async deleteBranch(id: string): Promise<boolean> {
        const result = await this.branchRepository.softDelete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async getNearbyBranches(options: NearbyBranchesOptions): Promise<PaginatedNearbyResponse> {
        const {
            latitude,
            longitude,
            maxDistance = 5000, // Por defecto 5 km
            limit = 10,
            page = 1,
        } = options;

        // Validar que los parámetros necesarios estén presentes
        if (!latitude || !longitude) {
            throw new Error('Latitude and longitude are required');
        }

        // Crear el punto GeoJSON
        const point = {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)],
        };

        // Calcular el número de elementos a omitir
        const skip = (Number(page) - 1) * Number(limit);

        // Construir la consulta
        const query = this.branchRepository
            .createQueryBuilder('branch')
            .addSelect(
                `ST_Distance(
                branch.location,
                ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326)
            )`,
                'distance' // Solo un alias aquí
            )
            .where(
                `ST_DWithin(
                branch.location,
                ST_SetSRID(ST_GeomFromGeoJSON(:point), 4326),
                :maxDistance
            )`
            )
            .andWhere('branch.isActive = :isActive', { isActive: true }) // Usar booleano en lugar de string
            .setParameter('point', JSON.stringify(point))
            .setParameter('maxDistance', maxDistance)
            .orderBy('distance', 'ASC') // Ordenar por distancia ascendente
            .take(Number(limit)) // Número de resultados por página
            .skip(Number(skip)); // Saltar resultados según la página

        try {
            // Ejecutar la consulta
            const [results, total] = await query.getManyAndCount();
            const {raw, entities} = await query.getRawAndEntities();

            // Mapear los resultados para incluir la distancia
            const data = results.map((entity, index) => {

                return {
                    ...entity,
                    distance: parseFloat(raw ? raw[index].distance : '0'), // Distancia en metros
                };
            });

            // Devolver la respuesta paginada
            return {
                data,
                meta: {
                    total,
                    page: Number(page),
                    limit: Number(limit),
                    lastPage: Math.ceil(total / Number(limit)),
                },
            };
        } catch (error) {
            console.error('Error fetching nearby branches:', error);
            throw new Error('Failed to fetch nearby branches');
        }
    }

    async updateBranchLogo(id: string, logoUrl: string): Promise<Branch | null> {
        const branch: Branch | null = await this.branchRepository.findOneBy({ id });
        if (!branch) throw new Error('La tienda no existe');

        // Si ya había un logo, eliminarlo de Cloudinary
        if (branch.logo) {
            try {
                const publicId = this.cloudinaryService.extractPublicId(branch.logo);
                if (publicId) {
                    await this.cloudinaryService.deleteImage(publicId);
                }
            } catch (error) {
                console.error('Error al eliminar imagen anterior:', error);
                // Continuamos con la actualización incluso si falla la eliminación
            }
        }

        // Actualizar el logo
        branch.logo = logoUrl;
        return this.branchRepository.save(branch);
    }

    async addBranchImages(id: string, imageUrls: string[]): Promise<Branch | null> {
        const branch: Branch | null = await this.branchRepository.findOneBy({ id });
        if (!branch) throw new Error('La tienda no existe');

        // Si no hay imágenes previas, inicializar el array
        if (!branch.images) {
            branch.images = [];
        }

        // Verificar si no excede el límite de imágenes (por ejemplo, 10)
        if (branch.images.length + imageUrls.length > 10) {
            throw new Error('Excede el límite de 10 imágenes por tienda');
        }

        // Agregar las nuevas imágenes
        branch.images = [...branch.images, ...imageUrls];
        return this.branchRepository.save(branch);
    }

    async removeBranchImage(id: string, imageUrl: string): Promise<Branch | null> {
        const branch: Branch | null = await this.branchRepository.findOneBy({ id });
        if (!branch) throw new Error('La tienda no existe');

        // Verificar si la imagen existe en el array
        if (!branch.images || !branch.images.includes(imageUrl)) {
            throw new Error('La imagen no existe en esta tienda');
        }

        try {
            // Eliminar la imagen de Cloudinary
            const publicId = this.cloudinaryService.extractPublicId(imageUrl);
            if (publicId) {
                await this.cloudinaryService.deleteImage(publicId);
            }

            // Eliminar la imagen del array
            branch.images = branch.images.filter(img => img !== imageUrl);
            return this.branchRepository.save(branch);
        } catch (error) {
            throw new Error(`Error al eliminar la imagen: ${(error as Error).message}`);
        }
    }
}