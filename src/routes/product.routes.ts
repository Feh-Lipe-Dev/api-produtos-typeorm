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

productRoutes.get(
    '/products/:id',
    (req, res) => productController.findOne(req, res)
)

export default productRoutes;