/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, FormInput, AllowedTypes, useToaster, Text, Layout } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import Card from '@cv/components/Card/Card'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAllMonitoredServicesWithTimeSeriesHealthSources, useGetMonitoredService } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import type { RowData } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import { getMonitoredServiceRef } from '@cv/components/PipelineSteps/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.utils'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import { getMultiTypeInputProps } from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/VerificationJobFields/VerificationJobFields.utils'
import { AnalyzeDeploymentImpactData } from '@cv/components/PipelineSteps/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.types'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import {
  checkIfMonitoredServiceIsNotPresent,
  getIsMonitoredServiceDefaultInput,
  getMonitoredServiceIdentifier,
  getMonitoredServiceOptions,
  getShouldFetchMonitoredServiceData,
  getShouldRenderNotifications,
  getUpdatedSpecs,
  shouldUpdateSpecs
} from './ConfiguredMonitoredService.utils'
import AnalyseStepHealthSourcesList from './components/AnalyseStepHealthSourcesList/AnalyseStepHealthSourcesList'
import ConfigureMonitoredServiceDetails from './components/ConfigureMonitoredServiceDetails/ConfigureMonitoredServiceDetails'
import AnalyseStepNotifications from './components/AnalyseStepNotifications/AnalyseStepNotifications'
import DetailNotPresent from './components/DetailNotPresent/DetailNotPresent'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ConfiguredMonitoredService.module.scss'

interface ConfiguredMonitoredServiceProps {
  allowableTypes: AllowedTypes
  formik: FormikProps<AnalyzeDeploymentImpactData>
  serviceIdentifier: string
  environmentIdentifier: string
  hasMultiServiceOrEnv: boolean
  stepViewType?: StepViewType
}

export default function ConfiguredMonitoredService(props: ConfiguredMonitoredServiceProps): JSX.Element {
  const {
    stepViewType,
    allowableTypes,
    serviceIdentifier,
    environmentIdentifier,
    hasMultiServiceOrEnv,
    formik: { values: formValues, setFieldValue }
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { showError } = useToaster()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [healthSourcesList, setHealthSourcesList] = useState<RowData[]>([])
  const monitoredServiceRef = getMonitoredServiceRef(formValues.spec) as string

  const isTemplate = stepViewType === StepViewType.Template
  const isAccountLevel = !orgIdentifier && !projectIdentifier && !!accountId
  const monitoredServiceIdentifier = getMonitoredServiceIdentifier(
    monitoredServiceRef,
    serviceIdentifier,
    environmentIdentifier
  )

  const queryParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  }, [accountId, orgIdentifier, projectIdentifier])

  const {
    data: monitoredServicesData,
    loading: monitoredServicesLoading,
    error: monitoredServicesDataError,
    refetch: monitoredServicesDataRefetch
  } = useGetAllMonitoredServicesWithTimeSeriesHealthSources({
    queryParams,
    lazy: true
  })

  useEffect(() => {
    if (!isAccountLevel) {
      monitoredServicesDataRefetch()
    }
  }, [isAccountLevel])

  const {
    data: monitoredServiceData,
    refetch: fetchMonitoredServiceData,
    loading: monitoredServiceLoading,
    error: monitoredServiceError
  } = useGetMonitoredService({
    identifier: monitoredServiceIdentifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  const monitoredService = monitoredServiceData?.data?.monitoredService
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const shouldFetchMonitoredServiceDetails = useMemo(() => {
    //when monitoredServiceData is selected from the dropdown
    const isMonitoredServiceDefaultInput = getIsMonitoredServiceDefaultInput(
      monitoredServiceRef,
      serviceIdentifier,
      environmentIdentifier,
      hasMultiServiceOrEnv,
      isTemplate
    )
    return getShouldFetchMonitoredServiceData({
      isAccountLevel,
      isMonitoredServiceDefaultInput,
      monitoredService,
      formValues,
      monitoredServiceRef,
      setFieldValue
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentIdentifier, monitoredService, monitoredServiceRef, serviceIdentifier, hasMultiServiceOrEnv])

  useEffect(() => {
    if (shouldFetchMonitoredServiceDetails) {
      fetchMonitoredServiceData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchMonitoredServiceDetails, environmentIdentifier, monitoredServiceRef, serviceIdentifier])

  useEffect(() => {
    if (shouldUpdateSpecs(shouldFetchMonitoredServiceDetails, monitoredService)) {
      let newSpecs = { ...formValues.spec }
      newSpecs = getUpdatedSpecs(monitoredService, formValues, monitoredServiceRef)
      setFieldValue('spec', newSpecs)
      setHealthSourcesList(monitoredService?.sources?.healthSources as RowData[])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredService, monitoredServiceRef, shouldFetchMonitoredServiceDetails])

  useEffect(() => {
    const error = monitoredServicesDataError || monitoredServiceError
    if (error && !checkIfMonitoredServiceIsNotPresent((error?.data as Error)?.message, monitoredServiceIdentifier)) {
      showError(getErrorMessage(error))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServicesDataError, monitoredServiceError])

  const monitoredServicesOptions = useMemo(
    () => getMonitoredServiceOptions(serviceIdentifier, environmentIdentifier, monitoredServicesData?.data),
    [monitoredServicesData, serviceIdentifier, environmentIdentifier]
  )

  const shouldRenderNotifications = useMemo(() => {
    return getShouldRenderNotifications(
      monitoredServiceError,
      monitoredServiceIdentifier,
      shouldFetchMonitoredServiceDetails,
      monitoredServiceLoading
    )
  }, [monitoredServiceError, monitoredServiceIdentifier, monitoredServiceLoading, shouldFetchMonitoredServiceDetails])

  const renderConfiguredMonitoredService = (): JSX.Element => {
    if (
      checkIfMonitoredServiceIsNotPresent((monitoredServiceError?.data as Error)?.message, monitoredServiceIdentifier)
    ) {
      return (
        <Layout.Vertical padding={{ top: 'small' }}>
          <DetailNotPresent
            detailNotPresentMessage={getString('cv.analyzeStep.monitoredService.monitoredServiceNotPresent')}
          />
          <ConfigureMonitoredServiceDetails
            linkTo={routes.toCVAddMonitoringServicesSetup({ accountId, orgIdentifier, projectIdentifier })}
            detailToConfigureText={getString('cv.analyzeStep.monitoredService.createMonitoredService')}
            refetchDetails={fetchMonitoredServiceData}
          />
        </Layout.Vertical>
      )
    } else if (monitoredServiceLoading) {
      return (
        <Container flex padding="medium">
          {getString('cv.analyzeStep.monitoredService.fetchingMonitoredService')}
        </Container>
      )
    } else if (shouldFetchMonitoredServiceDetails) {
      return (
        <>
          <AnalyseStepHealthSourcesList
            healthSourcesList={healthSourcesList}
            identifier={monitoredServiceIdentifier}
            fetchMonitoredServiceData={fetchMonitoredServiceData}
          />
        </>
      )
    } else {
      return <></>
    }
  }

  return (
    <>
      <Card>
        <>
          <Text font={{ size: 'normal', weight: 'semi-bold' }} padding={{ bottom: 'medium' }} color={Color.GREY_800}>
            {getString('cv.monitoredServices.heading')}
          </Text>
          <Text color={Color.BLACK} padding={{ bottom: 'medium' }}>
            {getString('platform.connectors.cdng.monitoredService.monitoredServiceDef')}
          </Text>
          <Container className={stepCss.formGroup}>
            <Layout.Vertical>
              <FormInput.MultiTypeInput
                name="spec.monitoredService.spec.monitoredServiceRef"
                label={getString('cv.monitoredServices.heading')}
                useValue
                placeholder={
                  monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectMonitoredService')
                }
                selectItems={monitoredServicesOptions}
                multiTypeInputProps={{
                  ...getMultiTypeInputProps(expressions, allowableTypes),
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
                }}
              />
              {!monitoredService?.enabled && (
                <Container className={css.msDisabledWarning}>
                  <Text font={{ size: 'small' }} intent={Intent.WARNING}>
                    {getString('cv.analyzeDeploymentImpact.msDisabledWarning')}
                  </Text>
                </Container>
              )}
            </Layout.Vertical>
          </Container>

          {renderConfiguredMonitoredService()}
        </>
      </Card>
      {shouldRenderNotifications ? <AnalyseStepNotifications identifier={monitoredServiceIdentifier} /> : null}
    </>
  )
}
