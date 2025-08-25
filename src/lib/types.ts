export interface Question {
  id?: string
  questionText: string
  questionType: 'mcq' | 'constructed_response' | 'fill_blank' | 'mapping'
  score: number
  options?: QuestionOption[]
  fillBlankContent?: string
  mappingColumns?: MappingColumn[]
  correctAnswers: string[]
}

export interface QuestionOption {
  id?: string
  optionText: string
  optionKey: string
  isCorrect: boolean
}

export interface MappingColumn {
  id?: string
  columnType: 'left' | 'right'
  itemText: string
}

export interface TestData {
  title: string
  description: string
  duration: number
  totalQuestions: number
  totalScore: number
  passingScore: number
  questions: Question[]
}
