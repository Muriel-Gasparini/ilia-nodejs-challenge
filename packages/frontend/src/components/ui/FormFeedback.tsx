import { InlineFeedback } from './InlineFeedback';
import type { Feedback } from '@/hooks/use-feedback';

interface FormFeedbackProps {
  feedback: Feedback | null;
  onDismiss: () => void;
}

export function FormFeedback({ feedback, onDismiss }: FormFeedbackProps) {
  if (!feedback) return null;

  return (
    <InlineFeedback
      variant={feedback.variant}
      message={feedback.message}
      className="mb-4"
      autoDismissMs={feedback.variant === 'success' ? 5000 : 0}
      onDismiss={onDismiss}
    />
  );
}
