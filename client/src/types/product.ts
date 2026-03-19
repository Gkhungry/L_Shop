export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    inStock: boolean;
    createdAt: string;
    rarity?: string;
    wear?: string;
    image?: string;
    stolenFrom?: string | null;
}
