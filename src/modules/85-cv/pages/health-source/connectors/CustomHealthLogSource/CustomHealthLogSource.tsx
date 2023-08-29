/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useState } from 'react'
import { Container, Formik, FormikForm, Utils, Layout, Accordion, FormInput, useToaster } from '@harness/uicore'
import { cloneDeep, isNil, noop } from 'lodash-es'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import { useStrings } from 'framework/strings'
import { MultiItemsSideNav } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import DrawerFooter from '../../common/DrawerFooter/DrawerFooter'
import {
  initializeSelectedQueryMap,
  updateSelectedMetricsMap,
  validateSetupSource,
  submitForm
} from './CustomHealthLogSource.utils'
import type { CustomHealthLogSetupSource, SelectedAndMappedQueries } from './CustomHealthLogSource.types'
import QueryMapping from '../CustomHealthSource/components/QueryMapping/QueryMapping'
import JsonPathSelection from './components/JsonPathSelection/JsonPathSelection'
import { CustomHealthLogFieldNames, DEFAULT_CUSTOM_LOG_SETUP_SOURCE } from './CustomHealthLogSource.constants'
import type { MapCustomHealthToService } from '../CustomHealthSource/CustomHealthSource.types'
import customHealthCss from '../CustomHealthSource/CustomHealthSource.module.scss'
import css from './CustomHealthLogSource.module.scss'

export default function CustomHealthLogSource(props: any): JSX.Element {
  const { data: sourceData, onSubmit } = props

  const { getString } = useStrings()
  const { onPrevious } = useContext(SetupSourceTabsContext)
  const [rerenderKey, setRerenderKey] = useState('')
  const [{ selectedQuery, mappedQueries }, setMappedQueries] = useState<SelectedAndMappedQueries>(
    initializeSelectedQueryMap(sourceData)
  )

  const { showPrimary } = useToaster()

  const [{ createdQueries, selectedIndex }, setCreatedQueries] = useState({
    createdQueries: Array.from(mappedQueries.keys()) || [
      getString('cv.monitoringSources.datadogLogs.datadogLogsQuery')
    ],
    selectedIndex: 0
  })

  const [sampleDataLoading, setSampleDataLoading] = useState(false)
  const [recordsData, setRecordsData] = useState<Record<string, unknown> | undefined>()
  const areJsonMappingFieldsDisabled = isNil(recordsData) || sampleDataLoading

  return (
    <Formik<CustomHealthLogSetupSource>
      key={rerenderKey}
      formName="customHealthLogSource"
      enableReinitialize={true}
      validate={data => validateSetupSource(data, getString, createdQueries, selectedIndex)}
      initialValues={
        mappedQueries.get(selectedQuery) || {
          ...cloneDeep(DEFAULT_CUSTOM_LOG_SETUP_SOURCE),
          queryName: `Custom Log ${Utils.randomId()}`
        }
      }
      onSubmit={noop}
    >
      {formikProps => {
        return (
          <FormikForm>
            <SetupSourceLayout
              leftPanelContent={
                <MultiItemsSideNav
                  defaultMetricName={selectedQuery}
                  tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
                  addFieldLabel={getString('cv.monitoringSources.addQuery')}
                  createdMetrics={createdQueries}
                  defaultSelectedMetric={selectedQuery}
                  renamedMetric={formikProps.values.queryName}
                  isValidInput={Object.keys(formikProps.errors).length === 0}
                  onRemoveMetric={(removedQuery, updatedQueryName, updatedList, selectedQueryIndex) => {
                    setMappedQueries(oldState => {
                      const { selectedQuery: oldQuery, mappedQueries: oldMappedQueries } = oldState
                      const updatedMap = new Map(oldMappedQueries)

                      if (updatedMap.has(removedQuery)) {
                        updatedMap.delete(removedQuery)
                      } else {
                        // handle case where user updates the metric name for current selected metric
                        updatedMap.delete(oldQuery)
                      }

                      // update map with current values
                      if (formikProps.values.queryName !== removedQuery) {
                        updatedMap.set(updatedQueryName, { ...formikProps.values })
                      } else {
                        setRerenderKey(Utils.randomId())
                      }

                      setCreatedQueries({ createdQueries: updatedList, selectedIndex: selectedQueryIndex })
                      return { selectedQuery: updatedQueryName, mappedQueries: updatedMap }
                    })
                  }}
                  onSelectMetric={(newMetric, updatedList, selectedQueryIndex) => {
                    setCreatedQueries({ createdQueries: updatedList, selectedIndex: selectedQueryIndex })
                    setMappedQueries(oldState => {
                      return updateSelectedMetricsMap({
                        updatedQueryName: newMetric,
                        oldQueryName: oldState.selectedQuery,
                        mappedQuery: oldState.mappedQueries,
                        formikProps
                      })
                    })
                    setRerenderKey(Utils.randomId())
                  }}
                />
              }
              content={
                <Container className={customHealthCss.main}>
                  <SetupSourceCardHeader
                    mainHeading={getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
                    subHeading={getString('cv.monitoringSources.prometheus.customizeQuery')}
                  />
                  <Layout.Horizontal className={customHealthCss.content} spacing="xlarge">
                    <Accordion activeId="querymapping" className={customHealthCss.accordian}>
                      <Accordion.Panel
                        id="querymapping"
                        summary={getString('cv.customHealthSource.Querymapping.title')}
                        details={
                          <Container>
                            <FormInput.Text
                              name={CustomHealthLogFieldNames.QUERY_NAME}
                              label={getString('cv.monitoringSources.queryName')}
                              className={css.customHealthLogFieldWidth}
                              onChange={e => {
                                const val = (e.target as any).value
                                formikProps.setFieldValue('queryName', val)
                                setCreatedQueries(oldQueries => {
                                  const updatedQueries = [...oldQueries.createdQueries]
                                  updatedQueries[oldQueries.selectedIndex] = val
                                  return { selectedIndex: oldQueries.selectedIndex, createdQueries: updatedQueries }
                                })

                                setMappedQueries(oldObj => {
                                  const newMap = new Map(oldObj.mappedQueries)
                                  const oldValue = newMap.get(oldObj.selectedQuery)
                                  newMap.delete(oldObj.selectedQuery)
                                  newMap.set(val, oldValue as CustomHealthLogSetupSource)
                                  return { selectedQuery: val, mappedQueries: newMap }
                                })
                              }}
                            />
                            <QueryMapping
                              onFieldChange={formikProps.setFieldValue}
                              formValue={
                                {
                                  requestMethod: formikProps.values.requestMethod,
                                  query: formikProps.values.query || '',
                                  startTime: formikProps.values.startTime,
                                  endTime: formikProps.values.endTime,
                                  pathURL: formikProps.values.pathURL
                                } as MapCustomHealthToService
                              }
                              connectorIdentifier={sourceData.connectorRef}
                              onFetchRecordsSuccess={setRecordsData}
                              setLoading={setSampleDataLoading}
                              recordsData={recordsData}
                              isQueryExecuted={!isNil(recordsData)}
                            />
                          </Container>
                        }
                      />
                      <Accordion.Panel
                        id="queryJSONPaths"
                        summary={getString('cv.customHealthSource.Querymapping.jsonPathTitle')}
                        details={
                          <JsonPathSelection
                            className={css.customHealthLogFieldWidth}
                            sampleRecord={recordsData}
                            onChange={formikProps.setFieldValue}
                            disableFields={areJsonMappingFieldsDisabled}
                            valueForQueryValueJsonPath={formikProps.values.queryValueJsonPath}
                            valueForTimestampJsonPath={formikProps.values.timestampJsonPath}
                            valueForServiceInstanceJsonPath={formikProps.values.serviceInstanceJsonPath}
                          />
                        }
                      />
                    </Accordion>
                  </Layout.Horizontal>
                </Container>
              }
            />
            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={() =>
                submitForm({
                  formikProps,
                  onSubmit,
                  sourceData,
                  mappedQueries,
                  getString,
                  selectedIndex,
                  createdQueries,
                  showPrimary
                })
              }
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
