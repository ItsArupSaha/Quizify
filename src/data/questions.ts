import questions from "../../questions.json";

export type Question = {
  id: string;
  level: string;
  prompt: string;
  hint: string;
  input_format: string;
  tests: {
    input: string;
    output: string;
    hidden: boolean;
  }[];
};

export const allQuestions = questions as Question[];

export function getQuestionsByLevel(level: string): Question[] {
  return allQuestions.filter((q) => q.level === level);
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id);
}
