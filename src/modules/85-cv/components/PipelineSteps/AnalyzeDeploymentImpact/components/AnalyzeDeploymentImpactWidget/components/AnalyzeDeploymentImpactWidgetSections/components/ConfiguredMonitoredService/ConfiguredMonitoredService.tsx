/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, FormInput, AllowedTypes, useToaster, Text, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import Card from '@cv/components/Card/Card'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAllMonitoredServicesWithTimeSeriesHealthSources, useGetMonitoredService } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { RowData } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import { getMonitoredServiceRef } from '@cv/components/PipelineSteps/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.utils'
import routes from '@common/RouteDefinitions'
import { getMultiTypeInputProps } from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/VerificationJobFields/VerificationJobFields.utils'
import {
  getEnvironmentIdentifierFromStage,
  getServiceIdentifierFromStage
} from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/MonitoredService/MonitoredService.utils'
import { AnalyzeDeploymentImpactData } from '@cv/components/PipelineSteps/AnalyzeDeploymentImpact/AnalyzeDeploymentImpact.types'
import {
  getIsMonitoredServiceDefaultInput,
  getMonitoredServiceIdentifier,
  getMonitoredServiceNotPresentErrorMessage,
  getMonitoredServiceOptions,
  getUpdatedSpecs,
  isMonitoredServiceValidFixedInput
} from './ConfiguredMonitoredService.utils'
import AnalyseStepHealthSourcesList from './components/AnalyseStepHealthSourcesList/AnalyseStepHealthSourcesList'
import ConfigureMonitoredServiceDetails from './components/ConfigureMonitoredServiceDetails/ConfigureMonitoredServiceDetails'
import AnalyseStepNotifications from './components/AnalyseStepNotifications/AnalyseStepNotifications'
import DetailNotPresent from './components/DetailNotPresent/DetailNotPresent'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ConfiguredMonitoredServiceProps {
  allowableTypes: AllowedTypes
  formik: FormikProps<AnalyzeDeploymentImpactData>
}

export default function ConfiguredMonitoredService(props: ConfiguredMonitoredServiceProps): JSX.Element {
  const {
    allowableTypes,
    formik: { values: formValues, setFieldValue }
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [healthSourcesList, setHealthSourcesList] = useState<RowData[]>([])
  const monitoredServiceRef = (getMonitoredServiceRef(formValues.spec) || formValues.spec.monitoredServiceRef) as string

  const {
    state: {
      selectionState: { selectedStageId },
      pipeline
    },
    getStageFromPipeline
  } = usePipelineContext()
  const selectedStage = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId as string)?.stage

  const environmentIdentifier = useMemo(() => {
    return getEnvironmentIdentifierFromStage(selectedStage)
  }, [selectedStage])

  const serviceIdentifier = useMemo(() => {
    return getServiceIdentifierFromStage(selectedStage, pipeline)
  }, [pipeline, selectedStage])

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
    error: monitoredServicesDataError
  } = useGetAllMonitoredServicesWithTimeSeriesHealthSources({
    queryParams
  })

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

  const shouldFetchMonitoredServiceDetails = useMemo(() => {
    //when monitoredServiceData is selected from the dropdown
    const isMonitoredServiceDefaultInput = getIsMonitoredServiceDefaultInput(
      monitoredServiceRef,
      serviceIdentifier,
      environmentIdentifier
    )
    // storing if monitored service is default input inside formik
    if (isMonitoredServiceDefaultInput) {
      let newSpecs = getUpdatedSpecs(monitoredService, formValues, monitoredServiceRef)
      newSpecs = { ...newSpecs, isMonitoredServiceDefaultInput: true } as AnalyzeDeploymentImpactData['spec']
      setFieldValue('spec', newSpecs)
      return false
    } else {
      setFieldValue('spec.isMonitoredServiceDefaultInput', false)
      return isMonitoredServiceValidFixedInput(monitoredServiceRef)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentIdentifier, monitoredServiceRef, serviceIdentifier])

  useEffect(() => {
    if (shouldFetchMonitoredServiceDetails) {
      fetchMonitoredServiceData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldFetchMonitoredServiceDetails, environmentIdentifier, monitoredServiceRef, serviceIdentifier])

  useEffect(() => {
    if (monitoredService) {
      let newSpecs = { ...formValues.spec }
      newSpecs = getUpdatedSpecs(monitoredService, formValues, monitoredServiceRef)
      setFieldValue('spec', newSpecs)
      setHealthSourcesList(monitoredService?.sources?.healthSources as RowData[])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredService])

  useEffect(() => {
    const error = monitoredServicesDataError || monitoredServiceError
    if (
      error &&
      (error?.data as Error)?.message !== getMonitoredServiceNotPresentErrorMessage(monitoredServiceIdentifier)
    ) {
      showError(getErrorMessage(error))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServicesDataError, monitoredServiceError])

  const monitoredServicesOptions = useMemo(
    () => getMonitoredServiceOptions(serviceIdentifier, environmentIdentifier, monitoredServicesData?.data),
    [monitoredServicesData, serviceIdentifier, environmentIdentifier]
  )

  const renderConfiguredMonitoredService = (): JSX.Element => {
    if (
      (monitoredServiceError?.data as Error)?.message ===
      getMonitoredServiceNotPresentErrorMessage(monitoredServiceIdentifier)
    ) {
      return (
        <Layout.Vertical padding={{ top: 'small' }}>
          <DetailNotPresent
            detailNotPresentMessage={getString('cv.analyzeStep.monitoredService.monitoredServiceNotPresent')}
          />
          <ConfigureMonitoredServiceDetails
            linkTo={routes.toCVAddMonitoredServiceForServiceAndEnv({
              accountId,
              orgIdentifier,
              projectIdentifier,
              serviceIdentifier,
              environmentIdentifier
            })}
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
            {getString('connectors.cdng.monitoredService.monitoredServiceDef')}
          </Text>
          <Container className={stepCss.formGroup}>
            <FormInput.MultiTypeInput
              name="spec.monitoredService.spec.monitoredServiceRef"
              label={getString('cv.monitoredServices.heading')}
              useValue
              placeholder={
                monitoredServicesLoading ? getString('loading') : getString('cv.slos.selectMonitoredService')
              }
              selectItems={monitoredServicesOptions}
              multiTypeInputProps={{
                ...getMultiTypeInputProps(expressions, allowableTypes)
              }}
            />
          </Container>
          {renderConfiguredMonitoredService()}
        </>
      </Card>
      {shouldFetchMonitoredServiceDetails ? <AnalyseStepNotifications identifier={monitoredServiceIdentifier} /> : null}
    </>
  )
}
