import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

const configuredChatPrefix = import.meta.env.VITE_CHAT_API_PREFIX || '/support-chat';
const chatPrefix = configuredChatPrefix.startsWith('/') ? configuredChatPrefix : `/${configuredChatPrefix}`;

function withChatPrefix(path) {
  return `${chatPrefix}${path}`;
}

export async function createConversationApi(payload) {
  try {
    const response = await httpClient.post(withChatPrefix('/conversations'), payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getMyConversationsApi(params = {}) {
  try {
    const response = await httpClient.get(withChatPrefix('/my-conversations'), { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getConversationMessagesApi(id, params = {}) {
  try {
    const response = await httpClient.get(withChatPrefix(`/conversations/${id}/messages`), { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function sendCustomerMessageApi(id, payload) {
  try {
    const response = await httpClient.post(withChatPrefix(`/conversations/${id}/messages`), payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function markConversationReadApi(id) {
  try {
    const response = await httpClient.post(withChatPrefix(`/conversations/${id}/read`));
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getAdminConversationsApi(params = {}) {
  try {
    const response = await httpClient.get(withChatPrefix('/admin/conversations'), { params });
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function assignConversationApi(id) {
  try {
    const response = await httpClient.post(withChatPrefix(`/admin/conversations/${id}/assign`));
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function sendAdminMessageApi(id, payload) {
  try {
    const response = await httpClient.post(withChatPrefix(`/admin/conversations/${id}/messages`), payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function updateConversationStatusApi(id, payload) {
  try {
    const response = await httpClient.patch(withChatPrefix(`/admin/conversations/${id}/status`), payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
