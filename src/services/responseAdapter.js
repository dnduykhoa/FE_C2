export function normalizeSuccess(raw) {
  if (raw && typeof raw.success === 'boolean') {
    return {
      ok: raw.success,
      data: raw.data,
      message: raw.message || '',
      errorCode: raw.errorCode || '',
      pagination: raw.pagination || null,
      raw: raw
    };
  }

  return {
    ok: true,
    data: raw,
    message: '',
    errorCode: '',
    pagination: null,
    raw: raw
  };
}

export function normalizeError(error) {
  const payload = error?.response?.data || {};
  return {
    ok: false,
    data: null,
    message: payload.message || error.message || 'Co loi xay ra',
    errorCode: payload.errorCode || 'UNKNOWN_ERROR',
    errors: payload.errors || []
  };
}
