import { VerificationOverview } from 'services/cv'
import { UseStringsReturn } from 'framework/strings'
import { EventTypeFullName } from './LogAnalysis.constants'
import { getClusterTypes } from './LogAnalysis.utils'
import { ClusterTypes } from './LogAnalysisView.container.types'
import { BaselineTestNodeType } from './LogAnalysisView.container.constants'

export const getInitialClustersFilterValue = ({
  overviewData,
  getString,
  filterAnomalous,
  overviewLoading
}: {
  overviewData?: VerificationOverview | null
  getString: UseStringsReturn['getString']
  filterAnomalous?: string
  overviewLoading?: boolean
}): ClusterTypes => {
  const { controlNodes } = overviewData || {}

  if (
    overviewLoading ||
    !overviewData ||
    (controlNodes?.nodeType === BaselineTestNodeType && controlNodes?.nodes?.[0]?.testStartTimestamp === undefined)
  ) {
    return []
  }

  let filterValues = getClusterTypes(getString).map(i => i.value) as ClusterTypes

  if (filterAnomalous === 'true') {
    filterValues = filterValues?.filter(clusterType => clusterType !== EventTypeFullName.KNOWN_EVENT)
  }

  return filterValues
}
