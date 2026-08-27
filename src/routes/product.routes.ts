import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { validateDto } from "../middlewares/validate";
import { CreateProductDto } from "../dtos/CreateProductDto";
import { UpdateProductDto } from "../dtos/UpdateProductDto";
import { asyncHandler } from "../middlewares/asyncHandler";

const productRoutes = Router();
const productController = new ProductController();

productRoutes.post(
    '/products',
    validateDto(CreateProductDto),
    asyncHandler(
        (req, res) => productController.create(req, res)
    )
)

productRoutes.get(
    '/products',
    asyncHandler((req, res) => productController.findAll(req, res))
)

// searchByName antes da rota de buscar por ID
// colocar uma rota product barra "alguma coisa" depois do param ID pode bugar a requisição
// fazendo a req "supor" que o input para essa rota seja o do ID
productRoutes.get(
    '/products/search',
    asyncHandler((req, res) => productController.searchByName(req, res))
)

productRoutes.get(
    '/products/stock/available',
    asyncHandler((req, res) => productController.findAvailable(req, res))
)

productRoutes.get(
    '/products/stock/empty',
    asyncHandler((req, res) => productController.findOutOfStock(req, res))
)

productRoutes.get(
    '/products/filter',
    asyncHandler((req, res) => productController.findByPriceRange(req, res))
)

productRoutes.put(
    '/products/:id',
    validateDto(UpdateProductDto),
    asyncHandler((req, res) => productController.update(req, res))
)

productRoutes.delete(
    '/products/:id',
    asyncHandler((req, res) => productController.delete(req, res))
)

productRoutes.get(
    '/products/:id',
    asyncHandler((req, res) => productController.findOne(req, res))
)

export default productRoutes;