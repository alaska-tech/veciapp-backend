declare namespace Express {
    export interface Request {
        user?: {
            foreignPersonId: string;
            email: string;
            role: string;
        };
    }
}