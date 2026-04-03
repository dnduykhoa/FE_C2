import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function createConversationApi(payload) {
  try {
    const response = await httpClient.post('/messages/conversations', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getMyConversationsApi(params = {}) {
  try {
    const response = await httpClient.get('/messages/my-conversations', { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getConversationMessagesApi(id, params = {}) {
  try {
    const response = await httpClient.get(`/messages/conversations/${id}/messages`, { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function sendCustomerMessageApi(id, payload) {
  try {
    const response = await httpClient.post(`/messages/conversations/${id}/messages`, payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function markConversationReadApi(id) {
  try {
    const response = await httpClient.post(`/messages/conversations/${id}/read`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getAdminConversationsApi(params = {}) {
  try {
    const response = await httpClient.get('/messages/admin/conversations', { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function assignConversationApi(id) {
  try {
    const response = await httpClient.post(`/messages/admin/conversations/${id}/assign`);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function sendAdminMessageApi(id, payload) {
  try {
    const response = await httpClient.post(`/messages/admin/conversations/${id}/messages`, payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function updateConversationStatusApi(id, payload) {
  try {
    const response = await httpClient.patch(`/messages/admin/conversations/${id}/status`, payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
