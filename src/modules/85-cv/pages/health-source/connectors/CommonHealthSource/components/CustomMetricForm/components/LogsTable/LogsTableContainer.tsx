import React, { useCallback, useContext, useEffect, useState } from 'react'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { QueryRecordsRequest, RestResponseLogRecordsResponse, useGetSampleLogData } from 'services/cv'
import { useStrings } from 'framework/strings'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import {
  getFieldsDefaultValuesFromConfig,
  getRequestBodyForSampleLogs
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import JsonSelectorWithDrawer from './components/JsonSelectorWithDrawer'
import LogsTableComponent from './components/LogsTableComponent/LogsTableComponent'
import CustomMetricsSectionHeader from '../CustomMetricsSectionHeader'

interface CommonHealthSourceLogsTable {
  query: string
  connectorIdentifier: string
  providerType: QueryRecordsRequest['providerType']
  fieldMappings?: FieldMapping[]
  isTemplate?: boolean
  expressions?: string[]
  isConnectorRuntimeOrExpression?: boolean
  disableLogFields?: boolean
  sampleRecords: Record<string, any>[]
}

export default function LogsTableContainer(props: CommonHealthSourceLogsTable): JSX.Element {
  const { query, fieldMappings, connectorIdentifier, providerType, sampleRecords, disableLogFields } = props

  const { values, setValues } = useFormikContext<CommonCustomMetricFormikInterface>()

  const [logsSampleData, setLogsSampleData] = useState<RestResponseLogRecordsResponse>()

  const { isTemplate } = useContext(SetupSourceTabsContext)

  // const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(sourceData.connectorRef)

  // const isQueryRuntimeOrExpression = getIsQueryRuntimeOrExpression(values.query)

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const {
    loading: logsLoading,
    error: logsError,
    mutate: fetchSampleLogs
  } = useGetSampleLogData({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  const isLogFieldsDisabled = disableLogFields || !query || !sampleRecords || logsLoading

  const { getString } = useStrings()

  useEffect(() => {
    if (!isTemplate) {
      const defaultValuesToUpdateFormik = getFieldsDefaultValuesFromConfig(values, fieldMappings)

      if (!isEmpty(defaultValuesToUpdateFormik)) {
        setValues({ ...values, ...defaultValuesToUpdateFormik })
      }
    }
  }, [values])

  // useEffect(() => {
  //   if ((isQueryRuntimeOrExpression || isConnectorRuntimeOrExpression) && isTemplate) {
  //     // check if fields are fixed or empty
  //     // 1. update the fields to runtime

  //     const defaultValuesToUpdateFormik = getTemplateValuesForConfigFields(values, fieldMappings)

  //     if (!isEmpty(defaultValuesToUpdateFormik)) {
  //       setValues({ ...values, ...defaultValuesToUpdateFormik })
  //     }
  //   }
  // }, [isQueryRuntimeOrExpression, isConnectorRuntimeOrExpression, isTemplate, fieldMappings, values.query, setValues])

  const handleFetchSampleLogs = useCallback(async () => {
    const fetchSampleLogsPayload = getRequestBodyForSampleLogs(providerType, {
      connectorIdentifier,
      query,
      serviceInstance: values?.serviceInstance as string
    })

    const sampleData = await fetchSampleLogs(fetchSampleLogsPayload as QueryRecordsRequest)

    if (sampleData) {
      setLogsSampleData(sampleData)
    }
  }, [fetchSampleLogs, providerType, query, connectorIdentifier, values])

  return (
    <Container margin={{ top: 'medium' }}>
      <CustomMetricsSectionHeader
        sectionTitle={getString('cv.monitoringSources.commonHealthSource.logsTable.title')}
        sectionSubTitle={getString('cv.monitoringSources.commonHealthSource.logsTable.subTitle')}
      />

      <Container width={300}>
        <JsonSelectorWithDrawer
          fieldMappings={fieldMappings}
          jsonData={sampleRecords}
          disableFields={isLogFieldsDisabled}
        />
      </Container>

      <Layout.Horizontal spacing="medium" margin={{ bottom: 'medium', top: 'medium' }}>
        <Button onClick={handleFetchSampleLogs} disabled={isLogFieldsDisabled} variation={ButtonVariation.SECONDARY}>
          {getString('cv.monitoringSources.commonHealthSource.logsTable.sampleLogButtonText')}
        </Button>

        {logsLoading && <Text icon="spinner">{getString('cv.processing')}</Text>}
      </Layout.Horizontal>

      <LogsTableComponent
        loading={logsLoading}
        error={logsError}
        fetchSampleRecords={handleFetchSampleLogs}
        sampleData={logsSampleData?.resource?.logRecords}
      />
    </Container>
  )
}
