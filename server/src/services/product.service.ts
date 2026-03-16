import { promises as fs } from 'fs';
import path from 'path';
import { Product, ProductQueryParams } from '../types/product';

const PRODUCTS_FILE_PATH = path.join(__dirname, '..', '..', 'products.json');

async function readProducts(): Promise<Product[]> {
    try {
        const raw = await fs.readFile(PRODUCTS_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw) as Product[];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e: unknown) {
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
            return [];
        }
        throw e;
    }
}

export async function getProducts(params: ProductQueryParams): Promise<Product[]> {
    let products = await readProducts();

    if (params.search) {
        const search = params.search.toLowerCase();
        products = products.filter(
            (p) =>
                p.name.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search),
        );
    }

    if (params.category) {
        products = products.filter((p) => p.category === params.category);
    }

    if (params.brand) {
        products = products.filter((p) => p.brand === params.brand);
    }

    if (params.minPrice !== undefined) {
        products = products.filter((p) => p.price >= params.minPrice!);
    }

    if (params.maxPrice !== undefined) {
        products = products.filter((p) => p.price <= params.maxPrice!);
    }

    if (params.inStock !== undefined) {
        products = products.filter((p) => p.inStock === params.inStock);
    }

    if (params.sortBy) {
        const order = params.sortOrder === 'desc' ? -1 : 1;
        products.sort((a, b) => {
            const field = params.sortBy!;
            if (field === 'price') {
                return (a.price - b.price) * order;
            }
            return a[field].localeCompare(b[field]) * order;
        });
    }

    return products;
}

export async function getCategories(): Promise<string[]> {
    const products = await readProducts();
    const categories = new Set(products.map((p) => p.category));
    return Array.from(categories).sort();
}

export async function getBrands(): Promise<string[]> {
    const products = await readProducts();
    const brands = new Set(products.map((p) => p.brand));
    return Array.from(brands).sort();
}

export async function getProductById(id: string): Promise<Product | null> {
    const products = await readProducts();
    return products.find((p) => p.id === id) ?? null;
}
