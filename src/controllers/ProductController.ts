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

    async findAll(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const products = await productRepository.find();

        return res.status(200).json(products)
    }

    async findOne(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const id: number = Number(req.params.id);

        const product = await productRepository.findOneBy({id})

        if(!product){
            return res.status(404).json({ message: 'Produto não enconttrado.'})
        }

        return res.status(200).json(product);
    }

    async update(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const id: number = Number(req.params.id);

        const product = await productRepository.findOneBy({id})

        if(!product){
            return res.status(404).json({ message: 'Produto não enconttrado.'})
        }

        productRepository.merge(product, req.body);

        const updatedProduct = await productRepository.save(product);

        return res.status(200).json(updatedProduct);
    }
}