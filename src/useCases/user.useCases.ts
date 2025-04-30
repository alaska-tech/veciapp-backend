import { Request, Response } from 'express';
import { UserBO } from '../business/userBO';

export class UserUseCases {
    private userBO: UserBO = new UserBO();


//TODO: las respuestas y los request(req.body) deberian pasarse por la interface que ya tengo definida en /types
    createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.userBO.createUser(req.body);
            res.status(201).json({
                data: user,
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

    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.userBO.getUserById(req.params.id);
            if (user) {
                res.status(200).json({
                    data: user,
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

    getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            //TODO: agregar el body a una interface para controlar lo que se recibe
            const user = await this.userBO.getAllUsers(req.body.limit, req.body.page);
            if (user) {
                res.status(200).json({
                    data: user,
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
            res.status(500).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }

    updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.userBO.updateUser(req.params.id, req.body);
            if (user) {
                res.status(200).json({
                    data: user,
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
            res.status(400).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }

    deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const success = await this.userBO.deleteUser(req.params.id);
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
        } catch (error: any) {
            res.status(500).json({
                data: null,
                error: { message: error.message },
                status: 'error'
            });
        }
    }
}