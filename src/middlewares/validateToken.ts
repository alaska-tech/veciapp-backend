import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import {responseError} from "../utils/standardResponseServer";
import {SECRET} from "../utils/constants";

interface userToken {
    foreignPersonId: string;
    fullName: string;
    email: string;
    role: string;
}

// Extiende la interfaz Request para incluir el usuario
declare global {
    namespace Express {
        interface Request {
            // @ts-ignore
            user?: userToken | undefined;
        }
    }
}

const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    // Para las rutas de login y register, no necesitamos verificar el token
    if (req.path === '/login' || req.path === '/register' || req.path === '/reset-password') {
        return next();
    }

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json(responseError({ message: 'Token de autenticación no proporcionado' }));
        return;
    }

    try {
        const jwtSecret = SECRET || '1234';
        const decoded = jwt.verify(token, jwtSecret) as userToken;

        // Añadir el usuario decodificado al request
        req.user = decoded;

        next();
    } catch (error) {
        res.status(403).json(responseError({ message: 'Token inválido o expirado' }));
    }
};

export default verifyToken;
