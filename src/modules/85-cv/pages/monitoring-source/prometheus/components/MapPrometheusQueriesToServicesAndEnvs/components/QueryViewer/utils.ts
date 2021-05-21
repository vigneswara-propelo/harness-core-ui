import type { MultiSelectOption } from '@wings-software/uicore'
import type Highcharts from 'highcharts'
import { isNumber } from 'lodash-es'
import type { PrometheusSampleData } from 'services/cv'
import { formatJSON } from '@cv/pages/monitoring-source/google-cloud-operations/GoogleCloudOperationsMonitoringSourceUtils'
import type { MapPrometheusQueryToService } from '@cv/pages/monitoring-source/prometheus/constants'
import { chartsConfig } from '@cv/pages/monitoring-source/google-cloud-operations/MapGCOMetricsToServices/GCOWidgetChartConfig'

type PrometheusHighchartsOptionAndRecords = {
  options: Highcharts.Options
  records: string[]
}

type CreateQueryReturnValue = {
  query: string
  canValidateQuery: boolean
}

export function transformPrometheusSampleData(
  sampleData?: PrometheusSampleData[]
): PrometheusHighchartsOptionAndRecords {
  if (!sampleData?.length) {
    return { options: {}, records: [] }
  }

  const data: Highcharts.SeriesLineOptions[] = []
  const transformedValue: PrometheusHighchartsOptionAndRecords = { options: {}, records: [] }
  for (const sample of sampleData) {
    const option: Highcharts.SeriesLineOptions = {
      name: '',
      data: [],
      type: 'line'
    }

    const formattedJson = formatJSON(sample.metricDetails)
    if (formattedJson) {
      transformedValue.records.push(formattedJson)
    }

    for (const point of sample?.data || []) {
      if (point?.timestamp && isNumber(point.value)) {
        option.data?.push([point.timestamp * 1000, point.value])
      }
    }

    data.push(option)
  }

  transformedValue.options = chartsConfig(data)
  return transformedValue
}

function convertFilterToQueryString(filters?: MultiSelectOption[]): string {
  if (!filters?.length) {
    return ''
  }

  let convertedString = ''
  for (const filter of filters) {
    if (filter.label !== filter.value) {
      const splitString = filter.label.split(':')
      convertedString += `\t\t${splitString[0]}="${splitString[1]}",\n`
    }
  }

  return convertedString
}

export function createPrometheusQuery(values?: MapPrometheusQueryToService): CreateQueryReturnValue {
  let queryString = ''
  if (!values) {
    return { query: queryString, canValidateQuery: false }
  }

  const convertedEnvFilter = convertFilterToQueryString(values.envFilter)
  const convertedServiceFilter = convertFilterToQueryString(values.serviceFilter)

  queryString += `${convertedEnvFilter}${convertedServiceFilter}${convertFilterToQueryString(values.additionalFilter)}`

  if (queryString?.length) {
    queryString = `\n${queryString}`
  }

  // remove trailing comma if there is one
  if (queryString[queryString.length - 2] === ',') {
    queryString = queryString.substr(0, queryString.length - 2) + '\n'
  }

  if (values.prometheusMetric) {
    queryString = `${values.prometheusMetric}\t{\n${queryString}\n}`
  }

  if (values.aggregator) {
    queryString = `${values.aggregator}(\n\t${queryString})`
  }

  return {
    query: queryString,
    canValidateQuery: Boolean(values.prometheusMetric?.length)
  }
}
