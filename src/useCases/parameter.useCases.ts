import { Request, Response } from "express";
import { ParameterBO } from "../business/parameterBO";
import {
  ToggleParameterStatusRequestExtended,
  ToggleParameterStatusResponse,
  ApiResponse,
  CreateParameterRequestExtended,
  CreateParameterResponse,
  GetAllParameterRequestExtended, ParameterResponse,
  GetParameterByNameResponse, ParametersData,
  UpdateParameterRequestExtended,
} from "../types/parameters"
import { responseError, responseOk } from "../utils/standardResponseServer";

export class ParameterUseCases {
  private parameterBO: ParameterBO = new ParameterBO();

  toggleParameterStatus = async (req: ToggleParameterStatusRequestExtended, res: Response<ApiResponse<ToggleParameterStatusResponse>>): Promise<void> => {
    try {
      const parameter = await this.parameterBO.toggleParameterStatus(req.params.id);

      if (parameter) {
        const toggle: ToggleParameterStatusResponse = {
          id: parameter.id,
          isActive: parameter.isActive,
          message: "El estado del parametro se ha cambiado satisfactoriamente"
        }

        res.status(200).json(responseOk(toggle));
      } else {
        res.status(404).json(responseError({ message: "Parámetro no encontrado" }));
      }
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }));
    }
  }

  createParameter = async (req: CreateParameterRequestExtended, res: Response<ApiResponse<CreateParameterResponse>>): Promise<void> => {
    try {
      const parameter = await this.parameterBO.createParameter(req);
      res.status(201).json(responseOk({
        id: parameter.id,
        message: "Parametro creado satisfactoriamente!"
      }));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }))
    }
  }

  getParameterById = async (req: Request, res: Response): Promise<void> => {
    try {
      const parameter = await this.parameterBO.getParameterById(req.params.id);
      if (parameter) {
        res.status(200).json({
          data: parameter,
          error: null,
          status: "success",
        });
      } else {
        res.status(404).json({
          data: null,
          error: { message: "Parámetro no encontrado" },
          status: "error",
        });
      }
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message }))
    }
  }

  getAllParameters = async (req: GetAllParameterRequestExtended, res: Response<ApiResponse<any>>): Promise<void> => {
    try {
      const { limit, page } = req.query;
      const parameters = await this.parameterBO.getAllParameters(
        Number(limit),
        Number(page)
      );
      res.status(200).json(responseOk(parameters));
    } catch (error: any) {
      res.status(400).json(responseError({ message: error.message } as any))
    }
  }

  updateParameter = async (req: Request, res: Response): Promise<void> => {
    try {
      const parameter = await this.parameterBO.updateParameter(
        req.params.id,
        req.body
      );
      if (parameter) {
        res.status(200).json({
          data: parameter,
          error: null,
          status: "success",
        });
      } else {
        res.status(404).json({
          data: null,
          error: { message: "Parámetro no encontrado" },
          status: "error",
        });
      }
    } catch (error: any) {
      res.status(400).json({
        data: null,
        error: { message: error.message },
        status: "error",
      });
    }
  }

  deleteParameter = async (req: Request, res: Response): Promise<void> => {
    try {
      const success = await this.parameterBO.deleteParameter(req.params.id);
      if (success) {
        res.status(200).json({
          data: { message: "Parámetro eliminado correctamente" },
          error: null,
          status: "success",
        });
      } else {
        res.status(404).json({
          data: null,
          error: { message: "Parámetro no encontrado" },
          status: "error",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        data: null,
        error: { message: error.message },
        status: "error",
      });
    }
  }

  getParameterByName = async (req: Request, res: Response): Promise<void> => {
    try {
      const parameter = await this.parameterBO.getParameterByName(req.params.name);
      if (parameter) {
        res.status(200).json({
          data: parameter,
          error: null,
          status: "success",
        });
      } else {
        res.status(404).json({
          data: null,
          error: { message: "Parámetro no encontrado" },
          status: "error",
        });
      }
    } catch (error: any) {
      res.status(500).json({
        data: null,
        error: { message: error.message },
        status: "error",
      });
    }
  }

}