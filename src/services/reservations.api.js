import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function getMyReservationsApi(params = {}) {
  try {
    const response = await httpClient.get('/reservations', { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function createReservationApi(payload) {
  try {
    const response = await httpClient.post('/reservations', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function updateReservationApi(id, payload) {
  try {
    const response = await httpClient.put(`/reservations/${id}`, payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function cancelReservationApi(id) {
  try {
    const response = await httpClient.delete(`/reservations/${id}`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
