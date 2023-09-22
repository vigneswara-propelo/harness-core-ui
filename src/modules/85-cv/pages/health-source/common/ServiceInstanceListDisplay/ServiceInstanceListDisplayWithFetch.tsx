import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, useToaster } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { QueryRecordsRequest, useGetSampleLogData, useGetSampleMetricData } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { HealthSourceConfig } from '../../connectors/CommonHealthSource/CommonHealthSource.types'
import ServiceInstanceListDisplay from './ServiceInstanceListDisplay'
import {
  getLogRecordsRequestBody,
  getRecordsRequestBodyWithServiceInstance,
  getServiceInstanceIdentifierValue
} from './ServiceInstanceListDisplay.utils'
import { FormikValuesType, ServiceInstanceListDisplayWithFetchProps } from './ServiceInstanceList.types'

const ServiceInstanceListDisplayWithFetch = (props: ServiceInstanceListDisplayWithFetchProps): JSX.Element | null => {
  const {
    connectorIdentifier,
    healthSourceType,
    healthSourceConfig = {} as HealthSourceConfig,
    isLogHealthSource = false
  } = props

  const { values } = useFormikContext<FormikValuesType>()

  const { SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW } = useFeatureFlags()

  const { showError } = useToaster()

  const [serviceInstanceNames, setServiceInstanceNames] = useState<string[] | null>(null)

  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  const fieldsToFetchRecords = healthSourceConfig?.customMetrics?.queryAndRecords?.fieldsToFetchRecords

  const formValues = useMemo(
    () => ({
      ...values,
      serviceInstanceField: getServiceInstanceIdentifierValue(values)
    }),
    [values]
  )

  const { mutate: fetchHealthSourceTimeSeriesData, error: timeseriesDataError } = useGetSampleMetricData({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  const { error: logsError, mutate: fetchSampleLogs } = useGetSampleLogData({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  useEffect(() => {
    if (timeseriesDataError || logsError) {
      showError(getErrorMessage(timeseriesDataError || logsError))
      setServiceInstanceNames(null)
    }
  }, [showError, timeseriesDataError, logsError])

  const handleFetchDataForMetrics = useCallback(async (): Promise<void> => {
    try {
      const serviceInstanceAddedQueryParams = getRecordsRequestBodyWithServiceInstance({
        connectorIdentifier,
        healthSourceType,
        query: values?.query ?? '',
        fieldsToFetchRecords,
        values: formValues
      })
      const sampleData = await fetchHealthSourceTimeSeriesData(serviceInstanceAddedQueryParams)

      setServiceInstanceNames(sampleData?.resource?.serviceInstances as string[])
    } catch (e) {
      setServiceInstanceNames(null)
    }
  }, [
    connectorIdentifier,
    fetchHealthSourceTimeSeriesData,
    fieldsToFetchRecords,
    formValues,
    healthSourceType,
    values?.query
  ])

  const handleFetchDataForLogs = useCallback(async (): Promise<void> => {
    try {
      const sampleLogsPayloadWithServiceInstance = getLogRecordsRequestBody({
        connectorIdentifier,
        formValues,
        healthSourceType,
        query: formValues?.query ?? ''
      })

      const sampleDataLogs = await fetchSampleLogs(sampleLogsPayloadWithServiceInstance as QueryRecordsRequest)

      setServiceInstanceNames(sampleDataLogs?.resource?.serviceInstances as string[])
    } catch (e) {
      setServiceInstanceNames(null)
    }
  }, [connectorIdentifier, fetchSampleLogs, formValues, healthSourceType])

  const { getString } = useStrings()

  if (!SRM_CV_UI_HEALTHSOURCE_SERVICE_INSTANCE_PREVIEW) {
    return null
  }

  return (
    <>
      <Button
        margin={{ bottom: 'medium' }}
        onClick={isLogHealthSource ? handleFetchDataForLogs : handleFetchDataForMetrics}
        variation={ButtonVariation.SECONDARY}
        data-testid="serviceInstanceFetchButton"
      >
        {getString('cv.monitoringSources.serviceInstanceNameFetchButtonTitle')}
      </Button>
      <ServiceInstanceListDisplay serviceInstanceList={serviceInstanceNames as string[]} />
    </>
  )
}

export default ServiceInstanceListDisplayWithFetch
