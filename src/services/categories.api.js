import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function getCategoriesApi() {
  try {
    const response = await httpClient.get('/categories');
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
