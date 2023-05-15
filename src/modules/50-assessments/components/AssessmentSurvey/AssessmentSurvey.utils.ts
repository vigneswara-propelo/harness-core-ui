import type { SelectOption } from '@harness/uicore'
import type { BenchmarkDTO } from 'services/assessments'
import type { SectionsGroupedQuestions } from './AssessmentSurvey'

export function getBenchMarkItems(benchmarksData: BenchmarkDTO[] | null): SelectOption[] {
  let benchmarkResponses: SelectOption[] = []
  if (Array.isArray(benchmarksData) && benchmarksData.length) {
    benchmarkResponses = benchmarksData.map(el => {
      const { benchmarkName, benchmarkId } = el || {}
      return {
        label: benchmarkName,
        value: benchmarkId
      }
    })
  }
  return benchmarkResponses
}

export function getDefaultBenchMark(benchmarksData: BenchmarkDTO[]): SelectOption {
  const defaultSelectedBenchmark = benchmarksData.find(el => el.isDefault === true)
  const { benchmarkName = '', benchmarkId = '' } = defaultSelectedBenchmark || {}
  const defaultBenchMark = {
    label: benchmarkName,
    value: benchmarkId
  }
  return defaultBenchMark
}

export function getFilteredResultsForLevel(
  selectedLevel: SelectOption | null,
  responses: SectionsGroupedQuestions[]
): SectionsGroupedQuestions[] {
  let filteredResults: SectionsGroupedQuestions[] = []
  if (selectedLevel?.value === 'all') {
    return responses
  } else {
    filteredResults = responses?.filter(currentResponse => currentResponse?.level === selectedLevel?.value) || []
  }

  return filteredResults
}

export function getFilteredResultsForSearch(
  responses: SectionsGroupedQuestions[],
  search: string | null
): SectionsGroupedQuestions[] {
  let filteredResults: SectionsGroupedQuestions[] = []
  filteredResults = responses.filter(response =>
    response?.sectionName?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase() as string)
  )
  return filteredResults
}
