import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err);

    if (err instanceof AppError) {
        return res.status(400).json({
            message: err.message
        })
    }

    return res.status(500).json({
        message: "Erro interno no servidor."
    })
}