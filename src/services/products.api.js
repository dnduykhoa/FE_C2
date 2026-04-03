import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function getProductsApi(params = {}) {
  try {
    const response = await httpClient.get('/products', { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function searchProductsApi(params = {}) {
  try {
    const response = await httpClient.get('/products/search', { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getProductDetailApi(id) {
  try {
    const response = await httpClient.get(`/products/${id}`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
