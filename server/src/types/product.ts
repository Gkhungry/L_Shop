export type ProductId = string;

export interface Product {
    id: ProductId;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    inStock: boolean;
    createdAt: string;
}

export interface ProductQueryParams {
    search?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sortBy?: 'price' | 'name' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}
