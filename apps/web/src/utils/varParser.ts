import { RequestConfig, EnvVariable } from '@apilot/shared';

const VAR_PATTERN = /\{\{(\w+)\}\}/g;

export function replaceVariables(
  text: string,
  variables: Record<string, string>
): string {
  return text.replace(VAR_PATTERN, (match, key) => {
    return key in variables ? variables[key] : match;
  });
}

function toRecord(variables: EnvVariable[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const v of variables) {
    if (v.enabled) {
      result[v.key] = v.value;
    }
  }
  return result;
}

export function applyVariablesToRequest(
  config: RequestConfig,
  variables: EnvVariable[]
): RequestConfig {
  const vars = toRecord(variables);
  return {
    ...config,
    url: replaceVariables(config.url, vars),
    params: config.params.map((p) => ({
      ...p,
      key: replaceVariables(p.key, vars),
      value: replaceVariables(p.value, vars),
    })),
    headers: config.headers.map((h) => ({
      ...h,
      key: replaceVariables(h.key, vars),
      value: replaceVariables(h.value, vars),
    })),
    body: replaceVariables(config.body, vars),
  };
}
