export function getSafeUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  try {
    const origin = window.location.origin;
    if (origin && origin !== 'null' && origin.startsWith('http')) {
      return `${origin}${cleanPath}`;
    }
  } catch (e) {
    // Ignore error
  }
  return cleanPath;
}

export function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url = input;
  if (typeof input === 'string') {
    url = getSafeUrl(input);
  } else if (input instanceof URL) {
    url = input.toString();
  }
  return fetch(url, init);
}
