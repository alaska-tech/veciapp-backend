import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

export const error404Handler = (req: Request, res: Response, next: NextFunction): void => {
    next(createError(404));
};

// Error handler con tipos completos
export const errorHandler = (
    err: createError.HttpError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    //res.send({ message: err.message });

    res.send({
        data: null,
        error: {
            code: err.status || 500,
            message: err.message
        },
        status: "Error"
    });
};