import type { Duration, TimeAgoPopover } from '@common/components'
import type { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useQueryParamsOptions } from '@common/hooks/useQueryParams'
import { PolicyViolationsDrawer } from '@modules/70-pipeline/pages/execution/ExecutionArtifactsView/PolicyViolations/PolicyViolationsDrawer'
import { SLSAVerification } from '@modules/70-pipeline/pages/execution/ExecutionArtifactsView/ArtifactsTable/ArtifactTableCells'

export interface SSCACustomMicroFrontendProps {
  customHooks: {
    useQueryParams: typeof useQueryParams
    useUpdateQueryParams: typeof useUpdateQueryParams
    useQueryParamsOptions: typeof useQueryParamsOptions
  }
  customComponents: {
    Duration: typeof Duration
    PolicyViolationsDrawer: typeof PolicyViolationsDrawer
    SLSAVerification: typeof SLSAVerification
    TimeAgoPopover: typeof TimeAgoPopover
  }
}
