import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateDto(dtoClass: any) {

    return async (req: Request, res: Response, next: NextFunction) => {
        const dto: object = plainToInstance(dtoClass, req.body);

        const errors = await validate(dto)

        if (errors.length > 0) {
            return res.status(400).json({
                message: "Dados inválidos",
                errors
            })
        }

        req.body = dto;
        next();
    }
}