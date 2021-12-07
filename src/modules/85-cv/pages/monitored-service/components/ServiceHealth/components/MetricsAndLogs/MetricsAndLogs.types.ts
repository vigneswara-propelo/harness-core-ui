export enum DatasourceTypeEnum {
  APP_DYNAMICS = 'APP_DYNAMICS',
  SPLUNK = 'SPLUNK',
  STACKDRIVER = 'STACKDRIVER',
  STACKDRIVER_LOG = 'STACKDRIVER_LOG',
  KUBERNETES = 'KUBERNETES',
  NEW_RELIC = 'NEW_RELIC',
  PROMETHEUS = 'PROMETHEUS',
  DATADOG_METRICS = 'DATADOG_METRICS',
  DATADOG_LOG = 'DATADOG_LOG'
}

export interface MetricsAndLogsProps {
  serviceIdentifier: string
  environmentIdentifier: string
  startTime?: number
  endTime?: number
}
