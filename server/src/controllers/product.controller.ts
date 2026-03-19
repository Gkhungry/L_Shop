import { Request, Response } from 'express';
import { getProducts, getCategories, getBrands, getProductById } from '../services/product.service';
import { ProductQueryParams } from '../types/product';

export async function getAllProducts(req: Request, res: Response): Promise<void> {
    const params: ProductQueryParams = {
        search: req.query.search as string | undefined,
        category: req.query.category as string | undefined,
        brand: req.query.brand as string | undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        inStock: req.query.inStock !== undefined ? req.query.inStock === 'true' : undefined,
        sortBy: req.query.sortBy as ProductQueryParams['sortBy'] | undefined,
        sortOrder: req.query.sortOrder as ProductQueryParams['sortOrder'] | undefined,
    };

    const products = await getProducts(params);
    res.status(200).json({ products });
}

export async function getProductCategories(_req: Request, res: Response): Promise<void> {
    const categories = await getCategories();
    res.status(200).json({ categories });
}

export async function getProductBrands(_req: Request, res: Response): Promise<void> {
    const brands = await getBrands();
    res.status(200).json({ brands });
}

export async function getProduct(req: Request<{ id: string }>, res: Response): Promise<void> {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
        res.status(404).json({ error: 'Товар не найден' });
        return;
    }

    res.status(200).json({ product });
}
