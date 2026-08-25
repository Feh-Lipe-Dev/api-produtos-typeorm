import { Router } from "express";
import { ProductController } from "../controllers/ProductController";

const productRoutes = Router();
const productController = new ProductController();

productRoutes.post(
    '/products',
    (req, res) => productController.create(req, res)
)

productRoutes.get(
    '/products',
    (req, res) => productController.findAll(req, res)
)

// searchByName antes da rota de buscar por ID
// colocar uma rota product barra "alguma coisa" depois do param ID pode bugar a requisição
// fazendo a req "supor" que o input para essa rota seja o do ID
productRoutes.get(
    '/products/search',
    (req, res) => productController.searchByName(req, res)
)

productRoutes.get(
    '/products/stock/available',
    (req, res) => productController.findAvailable(req, res)
)

productRoutes.get(
    '/products/stock/empty',
    (req, res) => productController.findOutOfStock(req, res)
)

productRoutes.get(
    '/products/filter',
    (req, res) => productController.findByPriceRange(req, res)
)

productRoutes.put(
    '/products/:id',
    (req, res) => productController.update(req, res)
)

productRoutes.delete(
    '/products/:id',
    (req, res) => productController.delete(req, res)
)

productRoutes.get(
    '/products/:id',
    (req, res) => productController.findOne(req, res)
)

export default productRoutes;