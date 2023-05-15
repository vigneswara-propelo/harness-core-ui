import type { SelectOption } from '@harness/uicore'
import type { BenchmarkDTO } from 'services/assessments'
import type { SectionsGroupedQuestions } from '../AssessmentSurvey'
import {
  getBenchMarkItems,
  getDefaultBenchMark,
  getFilteredResultsForLevel,
  getFilteredResultsForSearch
} from '../AssessmentSurvey.utils'

describe('AssessmentSurvey', () => {
  test('returns an empty array when the benchmarksData parameter is null', () => {
    const result = getBenchMarkItems(null)
    expect(result).toEqual([])
  })

  test('returns an empty array when the benchmarksData parameter is an empty array', () => {
    const result = getBenchMarkItems([])
    expect(result).toEqual([])
  })

  test('returns an empty array when the benchmarksData parameter is null', () => {
    const result = getBenchMarkItems(null)
    expect(result).toEqual([])
  })

  test('returns an array of SelectOption objects when given valid input', () => {
    const mockData: BenchmarkDTO[] = [
      { benchmarkName: 'Benchmark 1', benchmarkId: '1' },
      { benchmarkName: 'Benchmark 2', benchmarkId: '2' }
    ]
    const expectedOutput: SelectOption[] = [
      { label: 'Benchmark 1', value: '1' },
      { label: 'Benchmark 2', value: '2' }
    ]
    const result = getBenchMarkItems(mockData)
    expect(result).toEqual(expectedOutput)
  })

  test('returns an empty SelectOption object when the benchmarksData parameter is an empty array', () => {
    const result = getDefaultBenchMark([])
    expect(result).toEqual({ label: '', value: '' })
  })

  test('returns an empty SelectOption object if no BenchmarkDTO object has isDefault set to true', () => {
    const mockData: BenchmarkDTO[] = [
      { benchmarkName: 'Benchmark 1', benchmarkId: '1', isDefault: false },
      { benchmarkName: 'Benchmark 2', benchmarkId: '2', isDefault: false }
    ]
    const result = getDefaultBenchMark(mockData)
    expect(result).toEqual({ label: '', value: '' })
  })

  test('returns a SelectOption object with the correct label and value properties', () => {
    const mockData: BenchmarkDTO[] = [
      { benchmarkName: 'Benchmark 1', benchmarkId: '1', isDefault: false },
      { benchmarkName: 'Benchmark 2', benchmarkId: '2', isDefault: true },
      { benchmarkName: 'Benchmark 3', benchmarkId: '3', isDefault: false }
    ]
    const expectedOutput: SelectOption = { label: 'Benchmark 2', value: '2' }
    const result = getDefaultBenchMark(mockData)
    expect(result).toEqual(expectedOutput)
  })
})

describe('test getFilteredResultsForLevel method', () => {
  const responses = [
    { level: 'Level 3' },
    { level: 'Level 2' },
    { level: 'Level 1' },
    { level: 'Level 3' },
    { level: 'Level 2' }
  ] as SectionsGroupedQuestions[]

  test('should return an empty array when selectedScore is null', () => {
    const selectedScore = null
    const filteredResults = getFilteredResultsForLevel(selectedScore, responses)
    expect(filteredResults).toEqual([])
  })

  test('should return an array of responses with scores between 0 and 3 when selectedScore is "Level 3"', () => {
    const selectedScore = { value: 'Level 3', label: 'Level 3' }
    const filteredResults = getFilteredResultsForLevel(selectedScore, responses)
    expect(filteredResults).toEqual([{ level: 'Level 3' }, { level: 'Level 3' }])
  })

  test('should return an array of responses with scores between 4 and 7 when selectedScore is "4_7"', () => {
    const selectedScore = { value: 'Level 2', label: 'Level 2' }
    const filteredResults = getFilteredResultsForLevel(selectedScore, responses)
    expect(filteredResults).toEqual([{ level: 'Level 2' }, { level: 'Level 2' }])
  })

  test('should return an array of responses with scores between 8 and 10 when selectedScore is "8_10"', () => {
    const selectedScore = { value: 'Level 1', label: 'Level 1' }
    const filteredResults = getFilteredResultsForLevel(selectedScore, responses)
    expect(filteredResults).toEqual([{ level: 'Level 1' }])
  })

  test('should return an array of all responses when selectedScore is "all"', () => {
    const selectedScore = { value: 'all', label: 'All' }
    const filteredResults = getFilteredResultsForLevel(selectedScore, responses)
    expect(filteredResults).toEqual(responses)
  })
})

describe('test getFilteredResultsForSearch method', () => {
  const mockResponses = [
    {
      sectionName: 'What is your name?',
      userScore: 8
    },
    {
      sectionName: 'What is your favorite color?',
      userScore: 5
    },
    {
      sectionName: 'What is your favorite food?',
      userScore: 10
    }
  ] as SectionsGroupedQuestions[]

  test('returns filtered results when search matches question text', () => {
    const filteredResults = getFilteredResultsForSearch(mockResponses, 'favorite')
    expect(filteredResults).toHaveLength(2)
    expect((filteredResults?.[0] as any)?.sectionName).toEqual('What is your favorite color?')
  })

  test('returns empty array when search does not match any question text', () => {
    const filteredResults = getFilteredResultsForSearch(mockResponses, 'unknown')
    expect(filteredResults).toHaveLength(0)
  })
})
