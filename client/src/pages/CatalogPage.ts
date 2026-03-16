import { fetchProducts, fetchCategories, fetchBrands } from '../api/productsApi';
import type { Product } from '../types/product';
import type { ProductFilters } from '../api/productsApi';

export class CatalogPage {
    private readonly root: HTMLElement;

    private products: Product[] = [];

    private categories: string[] = [];

    private brands: string[] = [];

    private filters: ProductFilters = {};

    constructor(root: HTMLElement) {
        this.root = root;
    }

    public async render(): Promise<void> {
        this.root.innerHTML = '<h1>Каталог</h1><p class="info">Загрузка...</p>';

        try {
            [this.categories, this.brands] = await Promise.all([
                fetchCategories(),
                fetchBrands(),
            ]);
            await this.loadProducts();
        } catch {
            this.root.innerHTML = '<h1>Каталог</h1><p class="error">Ошибка загрузки данных</p>';
        }
    }

    private async loadProducts(): Promise<void> {
        try {
            this.products = await fetchProducts(this.filters);
            this.renderPage();
        } catch {
            const container = this.root.querySelector('#products-grid');
            if (container) {
                container.innerHTML = '<p class="error">Ошибка загрузки товаров</p>';
            }
        }
    }

    private renderPage(): void {
        this.root.innerHTML = `
            <h1>Каталог</h1>
            <div class="catalog-layout">
                <aside class="filters-panel">
                    <h3>Фильтры</h3>

                    <div class="filter-group">
                        <label for="filter-search">Поиск</label>
                        <input type="text" id="filter-search" placeholder="Название товара..." value="${this.escapeHtml(this.filters.search ?? '')}" />
                    </div>

                    <div class="filter-group">
                        <label for="filter-category">Категория</label>
                        <select id="filter-category">
                            <option value="">Все категории</option>
                            ${this.categories.map((c) => `<option value="${this.escapeHtml(c)}" ${this.filters.category === c ? 'selected' : ''}>${this.escapeHtml(c)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="filter-brand">Бренд</label>
                        <select id="filter-brand">
                            <option value="">Все бренды</option>
                            ${this.brands.map((b) => `<option value="${this.escapeHtml(b)}" ${this.filters.brand === b ? 'selected' : ''}>${this.escapeHtml(b)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>Цена, ₽</label>
                        <div class="price-range">
                            <input type="number" id="filter-min-price" placeholder="От" min="0" value="${this.filters.minPrice ?? ''}" />
                            <span>—</span>
                            <input type="number" id="filter-max-price" placeholder="До" min="0" value="${this.filters.maxPrice ?? ''}" />
                        </div>
                    </div>

                    <div class="filter-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="filter-instock" ${this.filters.inStock ? 'checked' : ''} />
                            Только в наличии
                        </label>
                    </div>

                    <div class="filter-group">
                        <label for="filter-sortby">Сортировка</label>
                        <select id="filter-sortby">
                            <option value="">По умолчанию</option>
                            <option value="price" ${this.filters.sortBy === 'price' ? 'selected' : ''}>По цене</option>
                            <option value="name" ${this.filters.sortBy === 'name' ? 'selected' : ''}>По названию</option>
                            <option value="createdAt" ${this.filters.sortBy === 'createdAt' ? 'selected' : ''}>По дате</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="filter-sortorder">Порядок</label>
                        <select id="filter-sortorder">
                            <option value="asc" ${this.filters.sortOrder !== 'desc' ? 'selected' : ''}>По возрастанию</option>
                            <option value="desc" ${this.filters.sortOrder === 'desc' ? 'selected' : ''}>По убыванию</option>
                        </select>
                    </div>

                    <button id="apply-filters" type="button">Применить</button>
                    <button id="reset-filters" type="button" class="btn-secondary">Сбросить</button>
                </aside>

                <div class="products-section">
                    <div class="products-header">
                        <span class="products-count">Найдено: ${this.products.length}</span>
                    </div>
                    <div id="products-grid" class="products-grid">
                        ${this.renderProducts()}
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    private renderProducts(): string {
        if (this.products.length === 0) {
            return '<p class="info">Товары не найдены</p>';
        }

        return this.products
            .map(
                (p) => `
                <div class="product-card ${!p.inStock ? 'out-of-stock' : ''}">
                    <div class="product-info">
                        <h3 class="product-name">${this.escapeHtml(p.name)}</h3>
                        <p class="product-description">${this.escapeHtml(p.description)}</p>
                        <div class="product-meta">
                            <span class="product-category">${this.escapeHtml(p.category)}</span>
                            <span class="product-brand">${this.escapeHtml(p.brand)}</span>
                        </div>
                    </div>
                    <div class="product-footer">
                        <span class="product-price">${p.price.toLocaleString('ru-RU')} ₽</span>
                        <span class="product-stock ${p.inStock ? 'in-stock' : 'no-stock'}">${p.inStock ? 'В наличии' : 'Нет в наличии'}</span>
                    </div>
                </div>
            `,
            )
            .join('');
    }

    private bindEvents(): void {
        const applyBtn = document.getElementById('apply-filters');
        applyBtn?.addEventListener('click', () => this.applyFilters());

        const resetBtn = document.getElementById('reset-filters');
        resetBtn?.addEventListener('click', () => this.resetFilters());

        const searchInput = document.getElementById('filter-search');
        searchInput?.addEventListener('keydown', (e) => {
            if ((e as KeyboardEvent).key === 'Enter') {
                this.applyFilters();
            }
        });
    }

    private applyFilters(): void {
        const search = (document.getElementById('filter-search') as HTMLInputElement)?.value.trim();
        const category = (document.getElementById('filter-category') as HTMLSelectElement)?.value;
        const brand = (document.getElementById('filter-brand') as HTMLSelectElement)?.value;
        const minPriceStr = (document.getElementById('filter-min-price') as HTMLInputElement)?.value;
        const maxPriceStr = (document.getElementById('filter-max-price') as HTMLInputElement)?.value;
        const inStock = (document.getElementById('filter-instock') as HTMLInputElement)?.checked;
        const sortBy = (document.getElementById('filter-sortby') as HTMLSelectElement)?.value as ProductFilters['sortBy'];
        const sortOrder = (document.getElementById('filter-sortorder') as HTMLSelectElement)?.value as ProductFilters['sortOrder'];

        this.filters = {
            search: search || undefined,
            category: category || undefined,
            brand: brand || undefined,
            minPrice: minPriceStr ? Number(minPriceStr) : undefined,
            maxPrice: maxPriceStr ? Number(maxPriceStr) : undefined,
            inStock: inStock || undefined,
            sortBy: sortBy || undefined,
            sortOrder: sortOrder || undefined,
        };

        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = '<p class="info">Загрузка...</p>';
        }
        this.loadProducts();
    }

    private resetFilters(): void {
        this.filters = {};
        this.loadProducts();
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
