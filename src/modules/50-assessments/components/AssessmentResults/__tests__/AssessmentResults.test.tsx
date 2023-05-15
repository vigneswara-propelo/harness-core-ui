import React from 'react'
import { render } from '@testing-library/react'
import { useGetAssessmentResults } from 'services/assessments'
import AssessmentResults from '../AssessmentResults'
import { getScoreComparisonChartOptions } from '../AssessmentResults.utils'
import { mockedResponsesData } from '../AssessmentResults.constants'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  useParams: () => ({ resultsCode: '123' })
}))

jest.mock('@assessments/components/SideNav/SideNav', () => {
  // eslint-disable-next-line react/display-name
  return () => {
    return <>Side nav</>
  }
})

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

jest.mock('@auth-settings/utils', () => ({
  getErrorMessage: jest.fn()
}))
jest.mock('services/assessments', () => ({
  useGetAssessmentResults: jest
    .fn()
    .mockImplementation(() => ({ data: mockedResponsesData, loading: false, error: null, refetch: jest.fn() })),
  useSendAssessmentInvite: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false, error: null }))
}))
jest.mock('copy-to-clipboard', () => jest.fn())

describe('getScoreComparisonChartOptions', () => {
  test('overrides default chart options with provided options', () => {
    const options = getScoreComparisonChartOptions(
      {
        userScore: 50,
        questionOrgScore: 60,
        questionBenchMarkScore: 70
      },
      {
        chart: {
          height: 200
        },
        series: [
          {
            name: 'Test Score',
            // eslint-disable-next-line
            // @ts-ignore
            data: [90],
            color: '#ff0000'
          }
        ]
      }
    )

    expect(options).toBeDefined()
    expect(options.series).toHaveLength(3)
    expect(options.chart?.height).toBe(200)
    expect(options?.series?.[0]?.name).toBe('Test Score')
    expect(options?.series?.[0].color).toBe('#ff0000')
  })

  test('sets default values if some arguments are missing', () => {
    const options = getScoreComparisonChartOptions({ userScore: 50 })
    const { series = [] } = options
    expect(options).toBeDefined()
    expect(series).toHaveLength(3)
  })
})

describe('AssessmentResults', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders loading spinner when results are loading', () => {
    ;(useGetAssessmentResults as jest.Mock).mockImplementation(() => ({
      data: null,
      error: null,
      loading: true,
      refetch: jest.fn()
    }))
    const { getByTestId } = render(<AssessmentResults />)
    expect(getByTestId('page-spinner')).toBeInTheDocument()
  })
})
