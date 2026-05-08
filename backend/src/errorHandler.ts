import { NextFunction, Request, Response, RequestHandler } from "express";
import { ZodError } from "zod";

class AppError extends Error {
    statusCode?: number;

    constructor(message: string) {
        super(message);
    }
}

export function errorHandler(
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";
    let details: object | undefined;

    // Handle Zod validation errors
    if (error instanceof ZodError) {
        statusCode = 400;
        message = "Validation error";
        details = error.issues.map((issue) => ({
            field: issue.path.join(".") || "root",
            message: issue.message,
        }));
    }

    if (process.env.NODE_ENV === "development") {
        res.status(statusCode).json({
            success: false,
            error: {
                message,
                ...(details && { details }),
                stack: error.stack,
                statusCode,
            },
        });
    } else {
        res.status(statusCode).json({
            success: false,
            error: {
                message: statusCode === 500 ? "Internal Server Error" : message,
                ...(details && { details }),
            },
        });
    }
}

export function createError(
    statusCode: number = 500,
    message: string | Error
): AppError {
    const error = new AppError(
        typeof message === "string" ? message : message.name
    );
    error.statusCode = statusCode;
    return error;
}

export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
}
