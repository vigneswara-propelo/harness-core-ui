import React from 'react'
import { Button, ButtonVariation, Layout } from '@harness/uicore'
import { FieldMapping } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import CommonHealthSourceField from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonCustomMetricFormContainer/CommonCustomMetricFormContainerLayout/components/CommonHealthSourceField/CommonHealthSourceField'
import { getIsConnectorRuntimeOrExpression } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import { HealthSourceParamValuesRequest, QueryRecordsRequest } from 'services/cv'
import { useStrings } from 'framework/strings'

interface FieldsToFetchRecordsProps {
  fieldsToFetchRecords: FieldMapping[]
  connectorIdentifier: string
  healthSourceType: QueryRecordsRequest['healthSourceType']
  handleFetchRecords: () => void
  isQueryButtonDisabled: boolean
  runQueryBtnTooltip: string
}

export default function FieldsToFetchRecords(props: FieldsToFetchRecordsProps): JSX.Element {
  const {
    fieldsToFetchRecords,
    connectorIdentifier,
    healthSourceType,
    handleFetchRecords,
    isQueryButtonDisabled,
    runQueryBtnTooltip
  } = props
  const { getString } = useStrings()
  const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(connectorIdentifier)
  return (
    <>
      {fieldsToFetchRecords?.map((field: FieldMapping) => {
        return (
          <CommonHealthSourceField
            key={field?.identifier}
            field={field}
            isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
            connectorIdentifier={connectorIdentifier}
            providerType={healthSourceType as HealthSourceParamValuesRequest['providerType']}
          />
        )
      })}
      <Layout.Horizontal spacing={'large'}>
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('cv.monitoringSources.gcoLogs.fetchRecords')}
          onClick={handleFetchRecords}
          disabled={isQueryButtonDisabled}
          tooltip={runQueryBtnTooltip}
        />
      </Layout.Horizontal>
    </>
  )
}
