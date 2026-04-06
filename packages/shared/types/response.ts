export interface ResponseMeta {
  statusCode: number;
  statusText: string;
  duration: number;
  size: number;
}

export interface ProxyResponse {
  meta: ResponseMeta;
  headers: Record<string, string>;
  body: unknown;
  bodyRaw: string;
}

export interface ProxyError {
  error: string;
  code: number;
}
