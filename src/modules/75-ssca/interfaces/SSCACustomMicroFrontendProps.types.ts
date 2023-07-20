import type { Duration } from '@common/components'
import type { useQueryParams, useUpdateQueryParams } from '@common/hooks'

export interface SSCACustomMicroFrontendProps {
  customHooks: {
    useQueryParams: typeof useQueryParams
    useUpdateQueryParams: typeof useUpdateQueryParams
  }
  customComponents: {
    Duration: typeof Duration
  }
}
