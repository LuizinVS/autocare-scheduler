import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { FeedbackService } from '../services/feedback.service';

function resolveErrorMessage(error: HttpErrorResponse): string {
  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  if (error.error?.message && typeof error.error.message === 'string') {
    return error.error.message;
  }

  if (Array.isArray(error.error?.errors) && error.error.errors.length > 0) {
    const first = error.error.errors[0];
    if (typeof first === 'string') {
      return first;
    }

    if (first?.defaultMessage) {
      return first.defaultMessage;
    }
  }

  switch (error.status) {
    case 404:
      return 'Recurso não encontrado.';
    case 409:
      return 'Conflito ao processar a requisição.';
    case 400:
      return 'Dados inválidos. Verifique o formulário.';
    case 0:
      return 'Não foi possível conectar à API.';
    default:
      return error.message || 'Ocorreu um erro inesperado.';
  }
}

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const feedback = inject(FeedbackService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        feedback.showError(resolveErrorMessage(error));
      }

      return throwError(() => error);
    })
  );
};
