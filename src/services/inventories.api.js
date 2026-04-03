import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function getInventoriesApi(params = {}) {
  try {
    const response = await httpClient.get('/inventories', { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function createInventoryApi(payload) {
  try {
    const response = await httpClient.post('/inventories', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function increaseStockApi(payload) {
  try {
    const response = await httpClient.post('/inventories/increase-stock', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function decreaseStockApi(payload) {
  try {
    const response = await httpClient.post('/inventories/decrease-stock', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function adjustStockApi(payload) {
  try {
    const response = await httpClient.put('/inventories/adjust-stock', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function deleteInventoryByProductApi(productId) {
  try {
    const response = await httpClient.delete(`/inventories/product/${productId}`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
