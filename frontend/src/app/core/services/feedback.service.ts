import { Injectable, computed, signal } from '@angular/core';

export type FeedbackKind = 'success' | 'error' | 'info';

export interface FeedbackMessage {
  kind: FeedbackKind;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly state = signal<FeedbackMessage | null>(null);

  readonly message = computed(() => this.state());

  showSuccess(text: string): void {
    this.state.set({ kind: 'success', text });
  }

  showError(text: string): void {
    this.state.set({ kind: 'error', text });
  }

  showInfo(text: string): void {
    this.state.set({ kind: 'info', text });
  }

  clear(): void {
    this.state.set(null);
  }
}
