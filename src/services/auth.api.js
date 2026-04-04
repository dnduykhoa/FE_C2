import httpClient from './httpClient';
import { normalizeError, normalizeSuccess } from './responseAdapter';

export async function loginApi(payload) {
  try {
    const response = await httpClient.post('/auth/login', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function registerApi(payload) {
  try {
    const response = await httpClient.post('/auth/register', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function forgotPasswordApi(payload) {
  try {
    const response = await httpClient.post('/auth/forgot-password', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function resetPasswordApi(payload) {
  try {
    const response = await httpClient.post('/auth/reset-password', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function logoutApi() {
  try {
    const response = await httpClient.post('/auth/logout');
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function getMeApi() {
  try {
    const response = await httpClient.get('/auth/me');
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function updateMyProfileApi(payload) {
  try {
    const response = await httpClient.patch('/auth/me', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function changeMyPasswordApi(payload) {
  try {
    const response = await httpClient.put('/auth/me/password', payload);
    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}

export async function uploadMyAvatarApi(file) {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await httpClient.post('/auth/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return normalizeSuccess(response.data);
  } catch (error) {
    return normalizeError(error);
  }
}
