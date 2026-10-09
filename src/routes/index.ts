import { Router } from 'express';
import productsRouter from './products.routes';

const router = Router();

router.use('/api/v1/products', productsRouter);

export default router;