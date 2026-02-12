import { AxiosError } from 'axios';
import i18n from './i18n';
import type { ApiError } from '@/types/api';

export function getErrorCode(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined;
    return data?.code || 'UNKNOWN';
  }
  return 'UNKNOWN';
}

export function getErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  const key = `errors:${code}`;
  const translated = i18n.t(key);
  return translated === key ? i18n.t('errors:UNKNOWN') : translated;
}
