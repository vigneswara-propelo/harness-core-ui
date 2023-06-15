import type { FilterTypes } from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.types'
import type { PageMonitoredServicePlatformResponse } from 'services/cv'
import type { MonitoredServiceConfig } from '../../MonitoredServiceListWidget.types'

export interface CommonMonitoredServiceListViewProps {
  setPage: (n: number) => void
  selectedFilter: FilterTypes
  onEditService: (identifier: string) => void
  onDeleteService: (identifier: string) => Promise<void>
  monitoredServiceListData?: PageMonitoredServicePlatformResponse
  config: MonitoredServiceConfig
}
