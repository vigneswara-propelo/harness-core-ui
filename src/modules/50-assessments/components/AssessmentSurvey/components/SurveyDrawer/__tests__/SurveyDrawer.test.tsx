import React from 'react'
import { render, screen } from '@testing-library/react'
import type { Question } from '@assessments/components/AssessmentSurvey/AssessmentSurvey'
import SurveyDrawer from '../SurveyDrawer'

const mockCurrentRowDetails: Question = {
  questionName:
    'Adding additional features or functions of a new product, requirements, or work that is not authorized',
  capability: 'Scope Creep',
  level: 'Level 3',
  userScore: 85,
  organizationScore: 32,
  benchmarkScore: 68,
  recommendations:
    'Scope creep can result in context switches for developers resulting in dissatisfaction, overwork and poor outcomes. Consider leveraging Agile Training and Tooling to understand and chart scope creep'
}
const currentSection = 'Planning and Requirements Process'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('SurveyDrawer', () => {
  test('renders the question text in the header', () => {
    render(
      <SurveyDrawer
        currentSection={currentSection}
        isOpen
        onHideCallback={jest.fn()}
        currentRowDetails={mockCurrentRowDetails}
      />
    )
    const questionText = screen.getByText(/Adding additional features?/i)
    expect(questionText).toBeInTheDocument()
  })

  test('renders the current section', () => {
    render(
      <SurveyDrawer
        currentSection={currentSection}
        isOpen
        onHideCallback={jest.fn()}
        currentRowDetails={mockCurrentRowDetails}
      />
    )
    const sectionText = screen.getByText(/Planning and Requirements Process?/i)
    expect(sectionText).toBeInTheDocument()
  })

  test('does not render the benchmark score if not available', () => {
    const mockCurrentRowDetailsWithoutBenchmark = {
      ...mockCurrentRowDetails,
      benchmarkScore: undefined
    }
    render(
      <SurveyDrawer
        currentSection={currentSection}
        isOpen
        onHideCallback={jest.fn()}
        currentRowDetails={mockCurrentRowDetailsWithoutBenchmark}
      />
    )
    const benchmarkScore = screen.queryByText('assessments.benchmark')
    expect(benchmarkScore).not.toBeInTheDocument()
  })
})
