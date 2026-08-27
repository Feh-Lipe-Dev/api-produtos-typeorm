import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Product } from "../entities/Product";
import { Category } from "../entities/Category";
import { ILike, MoreThan, Between } from "typeorm";
import { AppError } from "../errors/AppError";

export class ProductController {

    async create(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);
        const categoryRepository = AppDataSource.getRepository(Category);

        const { nome, descricao, preco, estoque, categoryId } = req.body;

        const category = await categoryRepository.findOneBy({
            id: Number(categoryId)
        })

        const existProduct = await productRepository.existsBy({ nome: req.body.nome });

        if (existProduct) {
            throw new AppError('Produto já cadastrado', 409);
        }

        if (!category) {
            throw new AppError('Categoria não encontrada', 404);
        }

        const product = productRepository.create({ nome, descricao, preco, estoque, category });

        const savedProduct = await productRepository.save(product); //persistência

        return res.status(201).json(savedProduct);
    }

    async findAll(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const products = await productRepository.find({
            relations: {
                category: true
            }
        });

        return res.status(200).json(products)
    }

    async findOne(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const id: number = Number(req.params.id);

        if (Number.isNaN(id)) {
            throw new AppError('ID do produto inválido', 400);
        }

        const product = await productRepository.findOne({
            where: { id },
            relations: {
                category: true
            }
        })

        if (!product) {
            throw new AppError('Produto não enconttrado.', 404)
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
            },
            relations: {
                category: true
            }
        })

        return res.status(200).json(products);
    }

    async update(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const id: number = Number(req.params.id);

        const product = await productRepository.findOneBy({ id })

        if (!product) {
            throw new AppError('Produto não enconttrado.', 404)
        }

        productRepository.merge(product, req.body);

        const updatedProduct = await productRepository.save(product);

        return res.status(200).json(updatedProduct);
    }

    async delete(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const id: number = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            throw new AppError('Produto não enconttrado.', 404)
        }

        const product = await productRepository.findOneBy({ id })

        if (!product) {
            return res.status(404).json({ message: 'Produto não enconttrado.' })
        }

        await productRepository.remove(product);

        return res.status(204).send();
    }

    async findAvailable(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const products = await productRepository.find({
            where: {
                estoque: MoreThan(0)
            },
            relations: {
                category: true
            }
        })

        return res.status(200).json(products);
    }

    async findOutOfStock(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const products = await productRepository.find({
            where: {
                estoque: 0
            },
            relations: {
                category: true
            }
        })

        return res.status(200).json(products);
    }

    async findByPriceRange(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const min: number = Number(req.query.min);
        const max: number = Number(req.query.max);

        if (isNaN(min) || isNaN(max)) {
            return res.status(400).json({
                error: 'os parâmetros min e max devem ser números!'
            });
        }

        if (min > max) {
            return res.status(400).json({
                error: 'O valor mínimo não pode ser maior que o valor máximo!'
            });
        }

        const products = await productRepository.find({
            where: {
                preco: Between(min, max)
            },
            relations: {
                category: true
            }
        })

        return res.json(products);
    }
}