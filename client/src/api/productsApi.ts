import type { Product } from '../types/product';

const BASE_URL = 'http://localhost:3000/api/products';

interface ProductsResponse {
    products: Product[];
}

interface CategoriesResponse {
    categories: string[];
}

interface BrandsResponse {
    brands: string[];
}

export interface ProductFilters {
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: 'price' | 'name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

function buildQueryParams(filters: ProductFilters): string {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
    if (filters.inStock !== undefined) params.set('inStock', String(filters.inStock));
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

    const qs = params.toString();
    return qs ? `?${qs}` : '';
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
    const url = `${BASE_URL}${buildQueryParams(filters)}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Ошибка загрузки товаров');
    }
    const data: ProductsResponse = await response.json();
    return data.products;
}

export async function fetchCategories(): Promise<string[]> {
    const response = await fetch(`${BASE_URL}/categories`);
    if (!response.ok) {
        throw new Error('Ошибка загрузки категорий');
    }
    const data: CategoriesResponse = await response.json();
    return data.categories;
}

export async function fetchBrands(): Promise<string[]> {
    const response = await fetch(`${BASE_URL}/brands`);
    if (!response.ok) {
        throw new Error('Ошибка загрузки брендов');
    }
    const data: BrandsResponse = await response.json();
    return data.brands;
}
