import { Request, Response } from 'express';
import { AuthBO } from '../business/authBO';
import {responseError, responseOk} from "../utils/standardResponseServer";

export class AuthUseCases {
    private authBO: AuthBO;

    constructor() {
        this.authBO = new AuthBO();
    }
//TODO: las respuestas y los request(req.body) deberian pasarse por la interface que ya tengo definida en /types

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    data: null,
                    error: { message: 'Email y contraseña son requeridos' },
                    status: 'error'
                });                return;
            }

            const result = await this.authBO.login({ email, password });

            if (!result) {
                res.status(401).json({
                    data: null,
                    error: { message: 'Credenciales inválidas' },
                    status: 'error'
                });                return;
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                data: null,
                error: { message: 'Error en el servidor', details: error.message },
                status: 'error'
            });
        }
    }

    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({
                    data: null,
                    error: { message: 'No autorizado' },
                    status: 'error'
                });
                return;
            }

            const success = await this.authBO.logout(userId);

            res.status(200).json( responseOk({ message: 'Sesión cerrada correctamente' }));
        } catch (error) {
            res.status(500).json( responseError({ message: 'Error en el servidor', details: error.message }));
        }
    }

    register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                res.status(400).json({
                    data: null,
                    error: { message: 'Todos los campos son requeridos' },
                    status: 'error'
                });
                return;
            }

            const result = await this.authBO.register({ name, email, password });

            res.status(201).json({
                data: result,
                error: null,
                status: 'success'
            });
        } catch (error) {
            if (error.message === 'El email ya está registrado') {
                res.status(409).json({
                    data: null,
                    error: { message: error.message },
                    status: 'error'
                });
                return;
            }

            res.status(500).json({
                data: null,
                error: { message: 'Error en el servidor', details: error.message },
                status: 'error'
            });
        }
    }

    reset = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({
                    data: null,
                    error: { message: 'Email es requerido' },
                    status: 'error'
                });
                return;
            }

            const success = await this.authBO.resetPassword({ email })
console.log(success)
            res.status(200).json({
                data: { message: 'Si el email existe, se enviará un enlace para restablecer la contraseña' },
                error: null,
                status: 'success'
            });
        } catch (error) {
            res.status(500).json({
                data: null,
                error: { message: 'Error en el servidor', details: error.message },
                status: 'error'
            });
        }
    }

    session = async (req: Request, res: Response): Promise<void> => {
        try {
            // El middleware verifyToken ya habría validado el token y añadido el userId al request, una nota!!!
            const userId = req.user?.userId

            if (!userId) {
                res.status(401).json({
                    data: null,
                    error: { message: 'No autorizado' },
                    status: 'error'
                });
                return;
            }

            const userInfo = await this.authBO.validateSession(userId);

            if (!userInfo) {
                res.status(404).json({
                    data: null,
                    error: { message: 'Usuario no encontrado' },
                    status: 'error'
                });                return;
            }

            res.status(200).json({
                data: { user: userInfo },
                error: null,
                status: 'success'
            });
        } catch (error) {
            res.status(500).json({
                data: null,
                error: { message: 'Error en el servidor', details: error.message },
                status: 'error'
            });
        }
    }
}
