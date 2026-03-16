import { Router } from 'express';
import {
    getAllProducts,
    getProductCategories,
    getProductBrands,
    getProduct,
} from '../controllers/product.controller';

const router = Router();

router.get('/', getAllProducts);
router.get('/categories', getProductCategories);
router.get('/brands', getProductBrands);
router.get('/:id', getProduct);

export default router;
