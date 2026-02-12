import { useState, useCallback } from 'react';

export interface Feedback {
  variant: 'success' | 'error';
  message: string;
}

export function useFeedback() {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const clearFeedback = useCallback(() => setFeedback(null), []);

  return { feedback, setFeedback, clearFeedback } as const;
}
