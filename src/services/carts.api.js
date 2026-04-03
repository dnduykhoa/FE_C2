import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function getCartApi() {
  try {
    const response = await httpClient.get('/carts');
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function addToCartApi(payload) {
  try {
    const response = await httpClient.post('/carts/items', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function updateCartItemApi(productId, payload) {
  try {
    const response = await httpClient.put(`/carts/items/${productId}`, payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function removeCartItemApi(productId) {
  try {
    const response = await httpClient.delete(`/carts/items/${productId}`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function clearCartApi() {
  try {
    const response = await httpClient.delete('/carts/clear');
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
