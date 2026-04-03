import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function getMyPaymentsApi(params = {}) {
  try {
    const response = await httpClient.get('/payments/my-payments', { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getPaymentDetailApi(id) {
  try {
    const response = await httpClient.get(`/payments/${id}`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
