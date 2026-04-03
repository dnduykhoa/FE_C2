import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function getRolesApi() {
  try {
    const response = await httpClient.get('/roles');
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function createRoleApi(payload) {
  try {
    const response = await httpClient.post('/roles', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function updateRoleApi(id, payload) {
  try {
    const response = await httpClient.put(`/roles/${id}`, payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function deleteRoleApi(id) {
  try {
    const response = await httpClient.delete(`/roles/${id}`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}