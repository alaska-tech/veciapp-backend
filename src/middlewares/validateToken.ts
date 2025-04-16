import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Extiende la interfaz Request para incluir el usuario
declare global {
    namespace Express {
        interface Request {
            user?: any;
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
        res.status(401).json({ message: 'Token no proporcionado' });
        return;
    }

    try {
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, jwtSecret);

        // Añadir el usuario decodificado al request
        req.user = decoded;
        //req.isAuthenticated = true

        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

export default verifyToken;
