import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Product } from "../entities/Product";
import { Category } from "../entities/Category";
import { MoreThan, Between } from "typeorm";
import { AppError } from "../errors/AppError";
import { CreateProductDto } from "../dtos/CreateProductDto";
import { SearchProductDto } from "../dtos/SearchProductDto";

export class ProductController {

    // --- CRIAR PRODUTO --- \\
    async create(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);
        const categoryRepository = AppDataSource.getRepository(Category);

        const { nome, descricao, preco, estoque, categoryId } = req.body as
            CreateProductDto;

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

    // --- LISTAR PRODUTOS --- \\
    async findAll(req: Request, res: Response): Promise<Response> {

        const productRepository = AppDataSource.getRepository(Product);

        const products = await productRepository.find({
            relations: {
                category: true
            }
        });

        return res.status(200).json(products)
    }

    // --- BUSCA POR ID --- \\
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

    // --- BUSCA GENERALIZADA --- \\
    async search(req: Request, res: Response): Promise<Response> {
        const {
            nome,
            categoryId,
            minPrice,
            maxPrice,
            category,
            sort,
            order,
            page,
            limit
        } = req.queryDto as SearchProductDto;

        const repository = AppDataSource.getRepository(Product);

        const query = repository.
            createQueryBuilder("product")
            .leftJoinAndSelect("product.category", "category");

        if (nome) {
            query.andWhere(
                "product.nome ILIKE :nome", { nome: `%${nome}%` }
            );
        }

        if (categoryId) {
            query.andWhere("product.categoryId = :categoryId", { categoryId: Number(categoryId) });
        }

        if (category) {
            query.andWhere("category.nome ILIKE :category", { category: `${category}%` });
        }

        if (minPrice) {
            query.andWhere("product.preco >= :minPrice", { minPrice: Number(minPrice) });
        }

        if (maxPrice) {
            query.andWhere("product.preco <= :maxPrice", { maxPrice: Number(maxPrice) });
        }

        const allowedSortFields: Record<string, string> = {
            name: "product.nome",
            price: "product.preco",
            stock: "product.estoque"
        }

        const sortField = allowedSortFields[String(sort)] ?? "product.nome";
        const sortOrder = String(order).toUpperCase() === "DESC" ? "DESC" : "ASC";
        query.orderBy(sortField, sortOrder);

        const currentPage = Number(page) || 1;
        const itemsPerPage = Number(limit) || 10;
        const offset = (currentPage - 1) * itemsPerPage;
        query.skip(offset).take(itemsPerPage);

        const [products, total] = await query.getManyAndCount();
        const totalPages = Math.ceil(total / itemsPerPage);

        return res.json({
            data: products,
            pagination: {
                page: currentPage,
                limit: itemsPerPage,
                total,
                totalPages
            }
        })
    }

    // --- ATUALIZR PRODUTO --- \\
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

    // --- EXCLUSÃO --- \\
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

    // --- BUSCA DE PRODUTO COM ESTOQUE --- \\
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

    // --- BUSCA DE PRODUTO SEM ESTOQUE --- \\
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

    // --- BUSCA POR FAIXA DE PREÇO --- \\
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