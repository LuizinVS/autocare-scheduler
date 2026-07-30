import { HttpParams } from '@angular/common/http';

type QueryValue = string | number | boolean | Date | null | undefined;

export function buildHttpParams(values: Record<string, QueryValue>): HttpParams {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined || value === '') {
      continue;
    }

    params = params.set(key, value instanceof Date ? value.toISOString() : String(value));
  }

  return params;
}
