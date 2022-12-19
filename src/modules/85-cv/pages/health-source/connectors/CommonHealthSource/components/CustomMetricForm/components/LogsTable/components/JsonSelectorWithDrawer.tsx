import React from 'react'
import { useFormikContext } from 'formik'
import { AllowedTypes, Container, Layout, NoDataCard, Text } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import JsonSelector from '@cv/components/JsonSelector/JsonSelector'
import type { JsonRawSelectedPathType } from '@cv/components/JsonSelector/JsonSelectorType'
import type {
  CommonCustomMetricFormikInterface,
  FieldMapping
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import {
  logsTableDefaultConfigs,
  FIELD_ENUM
} from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { formatJSONPath } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson.utils'
import JsonSelectorButton from './LogsTableComponent/components/JsonSelectorButton'
import css from './JsonSelectorWithDrawer.module.scss'

interface JsonSelectorWithDrawerProps {
  fieldMappings?: FieldMapping[]
  jsonData?: Record<string, any>
  disableFields?: boolean
  isTemplate?: boolean
  expressions?: string[]
  allowedTypes?: AllowedTypes
}

export default function JsonSelectorWithDrawer(props: JsonSelectorWithDrawerProps): JSX.Element | null {
  const { getString } = useStrings()

  // const { isTemplate } = useContext(SetupSourceTabsContext)

  const { fieldMappings, disableFields, jsonData } = props

  // const allowedTypes =
  //   isConnectorRuntimeOrExpression || isQueryRuntimeOrExpression
  //     ? [MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
  //     : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]

  const { values, setFieldValue } = useFormikContext<CommonCustomMetricFormikInterface>()

  const isDisabled = disableFields

  const filteredFieldsMapping = fieldMappings?.filter(field => field.type === FIELD_ENUM.JSON_SELECTOR)

  const {
    showDrawer: showHealthSourceDrawer,
    hideDrawer: hideHealthSourceDrawer,
    setDrawerHeaderProps
  } = useDrawer({
    createHeader: (headerProps: { titleLable: string }) => {
      const headerText = `${getString(
        'cv.monitoringSources.commonHealthSource.logsTable.jsonSelectorDrawerTitlePrefix'
      )} ${headerProps.titleLable || ''}`

      return <Text font={{ variation: FontVariation.FORM_TITLE }}>{headerText}</Text>
    },
    createDrawerContent: drawerProps => {
      return (
        <Container padding="medium" height="100%">
          {!isEmpty(jsonData) ? (
            <JsonSelector
              json={jsonData || {}}
              onPathSelect={(pathSelected: JsonRawSelectedPathType) => {
                const pathArray = [...pathSelected.path, pathSelected.key]
                const selectedPath = formatJSONPath(pathArray)
                drawerProps?.formikFieldUpdateFn(selectedPath)

                hideHealthSourceDrawer()
              }}
            />
          ) : (
            <Container className={css.noRecords}>
              <NoDataCard
                icon="warning-sign"
                message={getString('cv.monitoringSources.commonHealthSource.logsTable.noSampleAvailable')}
              />
            </Container>
          )}
        </Container>
      )
    },
    drawerOptions: logsTableDefaultConfigs,
    className: css.logsTableJsonDrawer
  })

  const openDrawer = (fieldName: string, label: string): void => {
    const formikFieldUpdateFn = setFieldValue.bind(null, fieldName)
    setDrawerHeaderProps?.({
      titleLable: label
    })
    showHealthSourceDrawer({
      formikFieldUpdateFn
    })
  }

  if (!filteredFieldsMapping || !Array.isArray(fieldMappings)) {
    return null
  }

  return (
    <>
      {filteredFieldsMapping.map(field => {
        return (
          <Layout.Vertical key={field.identifier} spacing={'small'} style={{ marginBottom: 'var(--spacing-medium)' }}>
            <Text style={{ fontSize: 13, fontWeight: 'normal' }}>{field.label}</Text>

            <JsonSelectorButton
              className={css.jsonSelectorButton}
              displayText={(values[field.identifier] as string) || field.label}
              onClick={() => openDrawer(field.identifier, field.label)}
              disabled={isDisabled}
              icon="plus"
            />
          </Layout.Vertical>
        )
      })}
    </>
  )
}
