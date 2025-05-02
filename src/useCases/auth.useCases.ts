import { Request, Response } from 'express';
import { AuthBO } from '../business/authBO';
import {responseError, responseOk} from "../utils/standardResponseServer";

export class AuthUseCases {
    private authBO: AuthBO;

    constructor() {
        this.authBO = new AuthBO();
    }

    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json(responseError({ message: 'Email y contraseña son requeridos' }));
                return;
            }

            const result = await this.authBO.login({ email, password });

            if (!result) {
                res.status(401).json(responseError({ message: 'Credenciales inválidas' }));
                return;
            }

            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
            });

            res.status(200).json(responseOk({token: result.token, user: result.currentUser}));
        } catch (error: any) {
            res.status(500).json(responseError({ message: error.message }));
        }
    }

    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.foreignPersonId;
            if (!userId) {
                res.status(401).json(responseError({ message: 'Usted no está autorizado' }));
                return;
            }

            await this.authBO.logout(userId);

            res.clearCookie("refreshToken");

            res.status(200).json( responseOk({ message: 'Sesión cerrada correctamente' }));
        } catch (error: any) {
            res.status(500).json( responseError({ message: error.message }));
        }
    }

    refresh = async (req: Request, res: Response):Promise<void> => {
        try {
            // Obtener token de cookie o del cuerpo de la petición
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!refreshToken) {
                res.status(400).json(responseError({ message: "Refresh token es requerido" }));
            }

            const tokens: { refreshToken: string, accessToken: string  } = await this.authBO.refreshToken(refreshToken);

            // Actualizar cookie
            if (!tokens) {
                res.status(401).json(responseError({ message: "Refresh token inválido" }));
            } else {
                res.cookie("refreshToken", tokens.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
                });

                res.status(200).json(responseOk({
                    message: "Token actualizado exitosamente",
                    accessToken: tokens.accessToken
                }))
            }

        } catch (error: any) {
            res.status(401).json(responseError({ message: error.message }));
        }
    };

    forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json(responseError({ message: "El email es requerido" }));
            }

            //Enviar un correo para reestablecer password, por ahora devolvemos un token
            // const resetToken = await this.authBO.forgotPassword(email);

            res.status(200).json(responseOk({
                message: "Se ha enviado un email con instrucciones para restablecer la contraseña",
                //resetToken // no retornar esto en producción, aca solo en pruebas
            }));
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    };

    resetPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                res.status(400).json({ message: "Token y nueva contraseña son requeridos" });
            }

            // await this.authBO.resetPassword(token, newPassword);

            res.status(200).json(responseOk({ message: "Contraseña actualizada exitosamente" }));
        } catch (error: any) {
            res.status(400).json(responseError({ message: error.message }));
        }
    };
}
