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

    async findOne(req: Request, res: Response): Promise<Response> {
        const categoryRepository = AppDataSource.getRepository(Category);

        const id: number = Number(req.params.id);

        const category = await categoryRepository.findOne({
            where: { id },
            relations: {
                products: true
            }
        })

        if (!category) {
            res.status(404).json({ message: 'Categoria não encontrada.' })
        }

        return res.json(category);
    }
}