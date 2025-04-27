import {Parameter} from "../models/parameter.entity";
import {Repository} from "typeorm";
import {AppDataSource} from "../config/database";
import {CreateParameterRequestExtended} from "../types/parameters";

export class ParameterBO {
    private repository: Repository<Parameter>;

    constructor() {
        this.repository = AppDataSource.getRepository(Parameter);
    }

    // Métodos de negocio
    async getIsActive(id: string): Promise<boolean> {
        const parameter = await this.getParameterById(id);
        if (!parameter) {
            throw new Error('El parámetro no existe');
        }
        return parameter.isActive;
    }

    async toggleParameterStatus(id: string): Promise<Parameter | null> {

        if (userRole !== 'admin') {
            throw new Error('No tienes permisos para realizar esta acción');
        }

        const parameter = await this.getParameterById(id);
        if (!parameter) {
            throw new Error('El parámetro no existe');
        }

        parameter.isActive = !parameter.isActive; // Cambia de true a false o viceversa
        return this.repository.save(parameter);
    }

    async getParameterById(id: string): Promise<Parameter | null> {
        return this.repository.findOneBy({ id });
    }

    async getParameterByName(name: string): Promise<Parameter | null> {
        return this.repository.findOneBy({ name });
    }

    async getAllParameters(limit: number, page: number): Promise<[Parameter[] | null, number]> {
        return this.repository.findAndCount({
            take: limit,
            skip: page
        });
    }

    async createParameter(parameterData: CreateParameterRequestExtended ): Promise<Parameter> {
        // implementar validaciones de negocio
        const parameterDataBody = parameterData.body

        if (!parameterDataBody.displayName) {
            throw new Error('El nombre para mostrar es requerido');
        }

        if (!parameterDataBody.name) {
            throw new Error('El nombre del usuario es requerido');
        }

        if (!parameterDataBody.description) {
            throw new Error('La descripción del parámetro es requerida');
        }

        if (!parameterDataBody.value) {
            throw new Error('El valor del parámetro es requerido');
        }

        // implementar reglas de negocio adicionales
        const existingParameter = await this.getParameterByName(parameterDataBody.name)
        if (existingParameter) {
            throw new Error('El parámetro ya había sido registrado antes.')
        }

        const newParameter = await this.repository.create({ ...parameterDataBody })

        const response = await this.repository.save(newParameter);

        return response;
    }

    async updateParameter(id: string, parameterData: Partial<Parameter>): Promise<Parameter | null> {
        const parameter = await this.getParameterById(id)
        if (!parameter) return null;

        Object.assign(parameter, {
            displayName: parameterData.displayName,
            name: parameterData.name,
            description: parameterData.description,
            value: parameterData.value,
            type: parameterData.type,
        });
        return this.repository.save(parameter);
    }

    async deleteParameter(id: string): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }
}