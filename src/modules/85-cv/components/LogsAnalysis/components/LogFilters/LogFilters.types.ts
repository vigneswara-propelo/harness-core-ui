import type { MultiSelectOption } from '@harness/uicore'
import type { ClusterTypes } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysisView.container.types'
import { EventTypeFullName } from '../../LogAnalysis.constants'

export interface LogFiltersProps {
  clusterTypeFilters: ClusterTypes
  onFilterChange: (checked: boolean, itemName: EventTypeFullName) => void
  monitoredServiceIdentifier: string
  onHealthSouceChange: (selectedHealthSources: MultiSelectOption[]) => void
  selectedHealthSources: MultiSelectOption[]
}
