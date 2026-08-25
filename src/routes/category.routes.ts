import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";

const categoryRoutes = Router();
const categoryController = new CategoryController;

categoryRoutes.post(
    '/categories',
    (req, res) => categoryController.create(req, res)
)

export default categoryRoutes;