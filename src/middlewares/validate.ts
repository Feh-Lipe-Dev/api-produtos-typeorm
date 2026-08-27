import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

export function validateDto(dtoClass: any) {

    return async (req: Request, res: Response, next: NextFunction) => {
        const dto: object = plainToInstance(dtoClass, req.body);

        const errors = await validate(dto)

        if (errors.length > 0) {
            const validationErrors =
                errors.map(error => ({
                    fields: error.property,
                    messages: Object.values(
                        error.constraints ?? {}
                    )
                }))

            throw new AppError(
                JSON.stringify(validationErrors, null, 2), 400
            )
        }

        req.body = dto;
        next();
    }
}
