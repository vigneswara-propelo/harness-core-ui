import type { MonitoredServiceConfig } from './MonitoredServiceListWidget.types'

export function getIfModuleIsCD(config: MonitoredServiceConfig | undefined): boolean {
  return config?.module === 'cd'
}
