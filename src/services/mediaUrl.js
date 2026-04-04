const devProxyPattern = /localhost:3000|127\.0\.0\.1:3000/;

export function resolveMediaUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '';
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return '';
  }

  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const configuredBaseURL = import.meta.env.VITE_API_BASE_URL || '';
  const useDevProxy = import.meta.env.DEV && devProxyPattern.test(configuredBaseURL);

  if (!configuredBaseURL || useDevProxy) {
    return normalizedPath;
  }

  try {
    return new URL(normalizedPath, configuredBaseURL).toString();
  } catch (error) {
    return normalizedPath;
  }
}
