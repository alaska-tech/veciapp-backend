import {Request, Response} from "express";
import {ParameterBO} from "../business/parameterBO";

export class ParameterUseCases {
  private parameterBO: ParameterBO = new ParameterBO();

  toggleParameterStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const parameter = await this.parameterBO.toggleParameterStatus(
        req.params.id,
        req.body.userRole
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
    } catch (error) {
      res.status(400).json({
        data: null,
        error: { message: error.message },
        status: "error",
      });
    }
  }

  createParameter = async (req: Request, res: Response): Promise<void> => {
    try {
      const parameter = await this.parameterBO.createParameter(req.body);
      res.status(201).json({
        data: parameter,
        error: null,
        status: "success",
      });
    } catch (error) {
      res.status(400).json({
        data: null,
        error: { message: error.message },
        status: "error",
      });
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
    } catch (error) {
      res.status(500).json({
        data: null,
        error: { message: error.message },
        status: "error",
      });
    }
  }

  getAllParameters = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10, page = 1 } = req.query;
      const [parameters, count] = await this.parameterBO.getAllParameters(
        Number(limit),
        Number(page)
      );
      res.status(200).json({
        data: parameters,
        count,
        error: null,
        status: "success",
      });
    } catch (error) {
      res.status(500).json({
        data: null,
        error: { message: error.message },
        status: "error",
      });
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      res.status(500).json({
        data: null,
        error: { message: error.message },
        status: "error",
      });
    }
  }

}