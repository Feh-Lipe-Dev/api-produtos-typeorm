import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Product } from "../entities/Product";
import { ILike } from "typeorm";

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

    async searchByName(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const name: string = String(req.query.nome || '');

        if (!name.trim()) {
            return res.status(400).json({ message: 'O parâmetro "nome" é obrigatório!' });
        }

        const products = await productRepository.find({
            where: {
                nome: ILike(`%${name}%`)
            }
        })

        return res.status(200).json(products);
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

    async delete(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const id: number = Number(req.params.id);

        const product = await productRepository.findOneBy({id})

        if(!product){
            return res.status(404).json({ message: 'Produto não enconttrado.'})
        }

        await productRepository.remove(product);

        return res.status(204).send();
    }
}