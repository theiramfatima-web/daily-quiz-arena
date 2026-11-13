import { Category, QuizQuestion } from '../../types/quiz';

export function q(
  id: string,
  category: Category,
  question: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  fact: string
): QuizQuestion {
  return { id, category, question, options, correctIndex, fact };
}
