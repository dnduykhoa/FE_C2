import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function getReviewsByProductApi(productId) {
  try {
    const response = await httpClient.get(`/reviews/product/${productId}`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getMyReviewsApi() {
  try {
    const response = await httpClient.get('/reviews/my-reviews');
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function createReviewApi(payload) {
  try {
    const response = await httpClient.post('/reviews', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function updateReviewApi(id, payload) {
  try {
    const response = await httpClient.put(`/reviews/${id}`, payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function deleteReviewApi(id) {
  try {
    const response = await httpClient.delete(`/reviews/${id}`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
