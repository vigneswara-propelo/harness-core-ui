/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { Container, Formik, FormikForm } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import type {
  CommonHealthSourceConfigurations,
  CommonCustomMetricFormikInterface,
  HealthSourceConfig
} from './CommonHealthSource.types'
import CustomMetricFormContainer from './components/CustomMetricForm/CustomMetricFormContainer'
import { getCurrentQueryData, getInitialValuesForHealthSourceConfigurations } from './CommonHealthSource.utils'
import { initGroupedCreatedMetrics } from '../../common/CommonCustomMetric/CommonCustomMetric.utils'
import CommonHealthSourceProvider from './components/CustomMetricForm/components/CommonHealthSourceContext/CommonHealthSourceContext'
import { getCanShowMetricThresholds } from '../../common/MetricThresholds/MetricThresholds.utils'
import MetricThresholdProvider from './components/MetricThresholds/MetricThresholdProvider'
import { DEFAULT_HEALTH_SOURCE_QUERY } from './CommonHealthSource.constants'
import css from './CommonHealthSource.module.scss'

export interface CommonHealthSourceProps {
  data: CommonHealthSourceConfigurations
  onSubmit: (configureHealthSourceData: CommonHealthSourceConfigurations) => void
  onPrevious: (formikValues: CommonHealthSourceConfigurations) => void
  isTemplate?: boolean
  expressions?: string[]
  healthSourceConfig: HealthSourceConfig
  connectorRef: string
}

export default function CommonHealthSource({
  data: configurationsPageData,
  onPrevious,
  isTemplate,
  expressions,
  healthSourceConfig,
  onSubmit,
  connectorRef
}: CommonHealthSourceProps): JSX.Element {
  const { getString } = useStrings()
  const isMetricThresholdEnabled = !isTemplate
  const healthSourceConfigurationsInitialValues = getInitialValuesForHealthSourceConfigurations(configurationsPageData)

  return (
    <Formik<CommonHealthSourceConfigurations>
      enableReinitialize
      initialValues={healthSourceConfigurationsInitialValues}
      formName="healthSourceConfigurationsForm"
      onSubmit={noop}
    >
      {formik => {
        const { customMetricsMap, selectedMetric: currentSelectedMetric = '' } = formik.values
        const createdMetrics = Array.from(customMetricsMap.keys()) || [DEFAULT_HEALTH_SOURCE_QUERY]
        const groupedCreatedMetrics = initGroupedCreatedMetrics(customMetricsMap, getString)
        const hasEmptySet = customMetricsMap.has('')
        if (hasEmptySet) {
          customMetricsMap.delete('')
        }
        const isShowMetricThreshold = getCanShowMetricThresholds({
          isMetricThresholdConfigEnabled: Boolean(healthSourceConfig?.metricThresholds?.enabled),
          isMetricPacksEnabled: Boolean(healthSourceConfig?.metricPacks?.enabled),
          groupedCreatedMetrics,
          isMetricThresholdEnabled
        })

        return (
          <>
            {/* Non custom fields section can be added here */}

            <CommonHealthSourceProvider updateParentFormik={formik.setFieldValue}>
              <FormikForm>
                <Formik<CommonCustomMetricFormikInterface>
                  enableReinitialize
                  formName={'customMetricForm'}
                  validateOnMount
                  initialValues={getCurrentQueryData(customMetricsMap, currentSelectedMetric)}
                  onSubmit={noop}
                >
                  {() => {
                    return (
                      <FormikForm className={css.formFullheight}>
                        <CustomMetricFormContainer
                          setConfigurationsFormikFieldValue={formik.setFieldValue}
                          mappedMetrics={customMetricsMap}
                          selectedMetric={currentSelectedMetric}
                          connectorIdentifier={connectorRef}
                          isMetricThresholdEnabled={isMetricThresholdEnabled}
                          createdMetrics={createdMetrics}
                          isTemplate={isTemplate}
                          expressions={expressions}
                          healthSourceConfig={healthSourceConfig}
                          groupedCreatedMetrics={groupedCreatedMetrics}
                        />
                      </FormikForm>
                    )
                  }}
                </Formik>
                {/* ⭐️ Metric threshold section  */}
                {isShowMetricThreshold && (
                  <MetricThresholdProvider
                    formikValues={formik.values}
                    groupedCreatedMetrics={groupedCreatedMetrics}
                    metricPacks={[]}
                    isOnlyCustomMetricHealthSource={!healthSourceConfig?.metricPacks?.enabled}
                  />
                )}
              </FormikForm>
              {/* Empty space at bottom */}
              <Container height={200} />
            </CommonHealthSourceProvider>
            {/* Metric threshold section can be added here */}
            <DrawerFooter
              isSubmit
              onPrevious={() => onPrevious(formik.values)}
              onNext={() => {
                formik.validateForm()

                if (formik.isValid) {
                  onSubmit(formik.values)
                }
              }}
            />
          </>
        )
      }}
    </Formik>
  )
}
