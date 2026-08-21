import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Product } from "../entities/Product";

export class ProductController {

    async create(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const product = productRepository.create(req.body);

        const saveProduct = await productRepository.save(product);

        return res.status(201).json(saveProduct);
    }
}