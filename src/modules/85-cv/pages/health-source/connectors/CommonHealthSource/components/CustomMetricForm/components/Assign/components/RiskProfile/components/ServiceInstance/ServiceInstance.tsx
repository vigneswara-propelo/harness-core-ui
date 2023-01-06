/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { useFormikContext } from 'formik'
import { Container, FormInput, FormError, MultiTypeInputType } from '@harness/uicore'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useStrings } from 'framework/strings'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import CustomMetricsSectionHeader from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CustomMetricsSectionHeader'
import { ServiceInstanceLabel } from '@cv/pages/health-source/common/ServiceInstanceLabel/ServiceInstanceLabel'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { getIsConnectorRuntimeOrExpression } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
interface ServiceInstanceProps {
  serviceInstance?: string
  continuousVerificationEnabled?: boolean
}

export default function ServiceInstance({
  serviceInstance,
  continuousVerificationEnabled
}: ServiceInstanceProps): JSX.Element {
  const { getString } = useStrings()
  const { errors, touched } = useFormikContext<CommonCustomMetricFormikInterface>()
  const showFieldError = Boolean(Object.keys(touched).length)
  const { isTemplate, expressions, sourceData } = useContext(SetupSourceTabsContext)
  const isConnectorRuntimeOrExpression = getIsConnectorRuntimeOrExpression(sourceData.connectorRef)
  return (
    <Container>
      {continuousVerificationEnabled ? (
        <>
          <CustomMetricsSectionHeader
            sectionTitle={getString('cv.monitoringSources.commonHealthSource.assign.serviceInstance.title')}
            sectionSubTitle={getString('cv.monitoringSources.commonHealthSource.assign.serviceInstance.helptext')}
          />
          {isTemplate ? (
            <Container width="350px">
              <FormInput.MultiTextInput
                label={<ServiceInstanceLabel />}
                name={CustomMetricFormFieldNames.SERVICE_INSTANCE}
                multiTextInputProps={{
                  value: serviceInstance,
                  expressions,
                  allowableTypes: isConnectorRuntimeOrExpression
                    ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                    : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                }}
              />
            </Container>
          ) : (
            <Container width="350px">
              <FormInput.Text name={CustomMetricFormFieldNames.SERVICE_INSTANCE} label={<ServiceInstanceLabel />} />
            </Container>
          )}
        </>
      ) : null}
      {errors.serviceInstance && showFieldError && (
        <Container margin={{ top: 'small', bottom: 'small' }}>
          <FormError name={CustomMetricFormFieldNames.SLI} errorMessage={errors.serviceInstance} />
        </Container>
      )}
    </Container>
  )
}
