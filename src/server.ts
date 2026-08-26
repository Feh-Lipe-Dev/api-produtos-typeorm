import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './database/data-source';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());

app.use(productRoutes);
app.use(categoryRoutes);

app.use(errorHandler);

AppDataSource.initialize()
    .then(() => {
        console.log('Data Source inicializado com sucesso!');

        app.listen(3000, () => {
            console.log('Servidor rodando na porta 3000.');
        })
    }).catch((err) => {
        console.error('Erro ao inicializar o Data Source', err);
    })