import type { Duration } from '@common/components'
import type { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type * as sscsService from 'services/sscs'

export interface SSCSCustomMicroFrontendProps {
  services: typeof sscsService
  customHooks: {
    useQueryParams: typeof useQueryParams
    useUpdateQueryParams: typeof useUpdateQueryParams
  }
  customComponents: {
    Duration: typeof Duration
  }
}
