import { Router } from "express";
import { ProductController } from "../controllers/ProductController";

const productRoutes = Router();
const productController = new ProductController();

productRoutes.post(
    '/products',
    (req, res) => productController.create(req, res)
)

export default productRoutes;