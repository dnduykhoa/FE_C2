import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function getUsersApi() {
  try {
    const response = await httpClient.get('/users');
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function updateUserRoleApi(id, payload) {
  try {
    const response = await httpClient.put(`/users/${id}/role`, payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}