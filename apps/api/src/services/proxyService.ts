import axios, { AxiosRequestConfig } from 'axios';
import { RequestConfig, ProxyResponse, AuthConfig } from '@apilot/shared';

function buildAuthHeaders(auth: AuthConfig): Record<string, string> {
  switch (auth.type) {
    case 'bearer':
      return { Authorization: `Bearer ${auth.token}` };
    case 'basic': {
      const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
      return { Authorization: `Basic ${encoded}` };
    }
    case 'apiKey':
      if (auth.in === 'header') {
        return { [auth.key]: auth.value };
      }
      return {};
    default:
      return {};
  }
}

function buildAuthParams(auth: AuthConfig): Record<string, string> {
  if (auth.type === 'apiKey' && auth.in === 'query') {
    return { [auth.key]: auth.value };
  }
  return {};
}

export async function executeRequest(config: RequestConfig): Promise<ProxyResponse> {
  const enabledHeaders: Record<string, string> = {};
  config.headers
    .filter(h => h.enabled && h.key)
    .forEach(h => { enabledHeaders[h.key] = h.value; });

  const enabledParams: Record<string, string> = {};
  config.params
    .filter(p => p.enabled && p.key)
    .forEach(p => { enabledParams[p.key] = p.value; });

  const authHeaders = buildAuthHeaders(config.auth);
  const authParams = buildAuthParams(config.auth);

  const headers = { ...enabledHeaders, ...authHeaders };
  const params = { ...enabledParams, ...authParams };

  let data: unknown = undefined;
  if (['POST', 'PUT', 'PATCH'].includes(config.method) && config.body && config.bodyType !== 'none') {
    if (config.bodyType === 'json') {
      try {
        data = JSON.parse(config.body);
        if (!headers['Content-Type'] && !headers['content-type']) {
          headers['Content-Type'] = 'application/json';
        }
      } catch {
        data = config.body;
      }
    } else {
      data = config.body;
    }
  }

  const axiosConfig: AxiosRequestConfig = {
    method: config.method,
    url: config.url,
    headers,
    params,
    data,
    timeout: 30000,
    validateStatus: () => true,
    responseType: 'text',
  };

  const startTime = Date.now();

  try {
    const axiosResponse = await axios(axiosConfig);
    const duration = Date.now() - startTime;

    const responseHeaders: Record<string, string> = {};
    Object.entries(axiosResponse.headers).forEach(([k, v]) => {
      responseHeaders[k] = String(v);
    });

    const bodyRaw = typeof axiosResponse.data === 'string' ? axiosResponse.data : JSON.stringify(axiosResponse.data);
    let body: unknown = bodyRaw;
    try {
      body = JSON.parse(bodyRaw);
    } catch {
      body = bodyRaw;
    }

    const size = Buffer.byteLength(bodyRaw, 'utf8');

    return {
      meta: {
        statusCode: axiosResponse.status,
        statusText: axiosResponse.statusText,
        duration,
        size,
      },
      headers: responseHeaders,
      body,
      bodyRaw,
    };
  } catch (err: unknown) {
    const error = err as Error & { code?: string };
    const networkError = new Error(`Network error: ${error.message}`) as Error & { statusCode: number };
    networkError.statusCode = 502;
    throw networkError;
  }
}
