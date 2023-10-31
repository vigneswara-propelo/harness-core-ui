import React from 'react'
import { FeatureFlag } from '@modules/10-common/featureFlags'
import { useFeatureFlag } from '@modules/10-common/hooks/useFeatureFlag'
import MFEWrapper from '@modules/85-cv/MFEWrapper'
import ServiceHealth from './ServiceHealth'
import { ServiceHealthProps } from './ServiceHealth.types'
import { MetricsAndLogsProps } from './components/MetricsAndLogs/MetricsAndLogs.types'

export const ServiceHealthMFEWrapper = (
  prop: ServiceHealthProps & { MetricsAndLogs?: React.FC<MetricsAndLogsProps> }
): JSX.Element => {
  const isMFEEnabled = useFeatureFlag(FeatureFlag.SRM_MICRO_FRONTEND)
  return isMFEEnabled ? (
    <MFEWrapper renderComponent={{ componentName: 'ServiceHealth', componentProps: { ...prop } }} />
  ) : (
    <ServiceHealth {...prop} />
  )
}
