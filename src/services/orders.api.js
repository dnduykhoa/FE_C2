import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function createOrderApi(payload) {
  try {
    const response = await httpClient.post('/orders', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getMyOrdersApi(params = {}) {
  try {
    const response = await httpClient.get('/orders', { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getAllOrdersAdminApi(params = {}) {
  try {
    const response = await httpClient.get('/orders/admin/all', { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getOrderDetailApi(id) {
  try {
    const response = await httpClient.get(`/orders/${id}`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function cancelOrderApi(id) {
  try {
    const response = await httpClient.put(`/orders/${id}/cancel`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function updateOrderStatusApi(id, payload) {
  try {
    const response = await httpClient.put(`/orders/${id}/status`, payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
