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
