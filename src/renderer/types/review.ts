export const REVIEW_QUESTIONS = [
  '本周最大的收获是什么？',
  '哪里可以做得更好？',
  '下周最重要的三件事？',
] as const

export interface WeeklyReview {
  answers: [string, string, string]
  updatedAt: string
}
