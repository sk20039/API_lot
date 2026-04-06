export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export type AuthType = 'none' | 'bearer' | 'basic' | 'apiKey';

export interface BearerAuth {
  type: 'bearer';
  token: string;
}

export interface BasicAuth {
  type: 'basic';
  username: string;
  password: string;
}

export interface ApiKeyAuth {
  type: 'apiKey';
  key: string;
  value: string;
  in: 'header' | 'query';
}

export interface NoAuth {
  type: 'none';
}

export type AuthConfig = NoAuth | BearerAuth | BasicAuth | ApiKeyAuth;

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: string;
  bodyType: 'none' | 'json' | 'text' | 'form';
  auth: AuthConfig;
}
