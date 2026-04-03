import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getCategoriesApi } from '../../services/categories.api';
import { getProductsApi, searchProductsApi } from '../../services/products.api';

export default function ProductsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 8,
    categoryId: '',
    minPrice: '',
    maxPrice: '',
    keyword: ''
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesApi
  });

  const productsQuery = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      if (filters.keyword.trim()) {
        return searchProductsApi({ keyword: filters.keyword.trim(), page: filters.page, limit: filters.limit });
      }

      return getProductsApi({
        page: filters.page,
        limit: filters.limit,
        categoryId: filters.categoryId || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined
      });
    }
  });

  const categories = categoriesQuery.data?.data || [];
  const products = productsQuery.data?.data || [];
  const pagination = productsQuery.data?.pagination;

  const totalPages = useMemo(() => pagination?.pages || 1, [pagination]);

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  return (
    <section>
      <div className="paper-block">
        <h1>San pham gom co</h1>
        <div className="filter-grid">
          <input
            type="text"
            placeholder="Tim theo ten hoac mo ta"
            value={filters.keyword}
            onChange={(event) => updateFilter('keyword', event.target.value)}
          />
          <select value={filters.categoryId} onChange={(event) => updateFilter('categoryId', event.target.value)}>
            <option value="">Tat ca danh muc</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Gia tu"
            value={filters.minPrice}
            onChange={(event) => updateFilter('minPrice', event.target.value)}
          />
          <input
            type="number"
            placeholder="Gia den"
            value={filters.maxPrice}
            onChange={(event) => updateFilter('maxPrice', event.target.value)}
          />
        </div>
      </div>

      {productsQuery.isLoading ? <p>Dang tai san pham...</p> : null}
      {!productsQuery.isLoading && products.length === 0 ? <p>Chua co san pham phu hop.</p> : null}

      <div className="product-grid">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <div className="thumb-placeholder" />
            <h3>{product.name}</h3>
            <p className="muted-text">{product.category?.name || 'Khong ro danh muc'}</p>
            <p className="price-text">{Number(product.price || 0).toLocaleString('vi-VN')} VND</p>
            <Link className="btn secondary" to={`/products/${product.id}`}>Xem chi tiet</Link>
          </article>
        ))}
      </div>

      <div className="pagination-row">
        <button className="btn secondary" type="button" disabled={filters.page <= 1} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}>
          Trang truoc
        </button>
        <span>Trang {filters.page} / {totalPages}</span>
        <button className="btn secondary" type="button" disabled={filters.page >= totalPages} onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}>
          Trang sau
        </button>
      </div>
    </section>
  );
}
