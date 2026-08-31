import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";

declare module "express" {
    export interface Request {
        queryDto?: any;
    }
}

export function validateDto(dtoClass: any) {

    return async (req: Request, res: Response, next: NextFunction) => {
        const dto: object = plainToInstance(
            dtoClass, req.method === "GET" ? req.query : req.body);

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

        if (req.method === "GET") {
            req['queryDto'] = dto
            return next();
        }

        req.body = dto;
        next();
    }
}
