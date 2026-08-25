import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Category } from "../entities/Category";

export class CategoryController {

    async create(req: Request, res: Response): Promise<Response> {
        const categoryRepository = AppDataSource.getRepository(Category);

        const category = categoryRepository.create(req.body);
        const savedCategory = await categoryRepository.save(category);

        return res.status(201).json(savedCategory);
    }
}