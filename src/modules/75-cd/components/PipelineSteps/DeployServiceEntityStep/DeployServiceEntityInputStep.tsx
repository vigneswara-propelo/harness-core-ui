/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  AllowedTypes,
  EXECUTION_TIME_INPUT_VALUE,
  getMultiTypeFromValue,
  Layout,
  MultiTypeInputType,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  useToaster
} from '@harness/uicore'
import { cloneDeep, defaultTo, get, isEmpty, merge, set } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import { v4 as uuid } from 'uuid'
import produce from 'immer'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ServiceDefinition, ServiceResponseDTO, ServiceYamlV2 } from 'services/cd-ng'
import { useStageFormContext } from '@pipeline/context/StageFormContext'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { useDeepCompareEffect } from '@common/hooks'
import { isMultiTypeExpression, isValueFixed, isValueRuntimeInput } from '@common/utils/utils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { MultiTypeServiceField } from '@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getScopedValueFromDTO } from '@common/components/EntityReference/EntityReference.types'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { usePipelineContext } from '@modules/70-pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { DeployServiceEntityData, DeployServiceEntityCustomProps } from './DeployServiceEntityUtils'
import { useGetServicesData } from './useGetServicesData'
import css from './DeployServiceEntityStep.module.scss'

export interface DeployServiceEntityInputStepProps extends DeployServiceEntityCustomProps {
  initialValues: DeployServiceEntityData
  readonly: boolean
  inputSetData?: {
    template?: DeployServiceEntityData
    path?: string
    readonly?: boolean
  }
  allowableTypes: AllowedTypes
  stepViewType: StepViewType
}

export function DeployServiceEntityInputStep({
  initialValues,
  inputSetData,
  allowableTypes,
  deploymentType,
  gitOpsEnabled,
  deploymentMetadata,
  customDeploymentData
}: DeployServiceEntityInputStepProps): React.ReactElement | null {
  const { getString } = useStrings()
  const { showWarning } = useToaster()
  const { expressions } = useVariablesExpression()
  const { updateStageFormTemplate, pipelineGitMetaData } = useStageFormContext()
  const {
    state: { storeMetadata }
  } = usePipelineContext()
  const isStageTemplateInputSetForm = inputSetData?.path?.startsWith('template.templateInputs')
  const formik = useFormikContext()

  const { templateRef: deploymentTemplateIdentifier, versionLabel } = customDeploymentData || {}
  const shouldAddCustomDeploymentData =
    deploymentType === ServiceDeploymentType.CustomDeployment && deploymentTemplateIdentifier

  const serviceValue = get(initialValues, `service.serviceRef`)
  const servicesValue: ServiceYamlV2[] = get(initialValues, `services.values`, [])
  const serviceTemplate = inputSetData?.template?.service?.serviceRef
  const servicesTemplate = inputSetData?.template?.services?.values
  const deployParallelTemplate = inputSetData?.template?.services?.metadata?.parallel
  const { CDS_SUPPORT_SERVICE_INPUTS_AS_EXECUTION_INPUTS: areServiceInputsSupportedAsExecutionInputs } =
    useFeatureFlags()
  // This is required only for single service

  const parentStoreMetadata = !isEmpty(storeMetadata) ? storeMetadata : pipelineGitMetaData
  const [serviceInputType, setServiceInputType] = useState<MultiTypeInputType>(getMultiTypeFromValue(serviceValue))
  const selectedServicesGitDetails = useMemo(() => {
    if (serviceValue && isValueFixed(serviceValue)) {
      return { [serviceValue]: get(initialValues, 'service.gitBranch') }
    }

    if (Array.isArray(servicesValue)) {
      const gitBranchMap: Record<string, string> = {}
      servicesValue.forEach(svcValue => {
        if (svcValue.serviceRef && svcValue.gitBranch) {
          gitBranchMap[svcValue.serviceRef] = svcValue.gitBranch
        }
      })
      return gitBranchMap
    }
    return {}
  }, [serviceValue, servicesValue, initialValues])

  const serviceIdentifiers: string[] = useMemo(() => {
    if (serviceValue && !isValueRuntimeInput(serviceValue)) {
      return [serviceValue]
    }

    if (Array.isArray(servicesValue)) {
      return servicesValue.map(svc => svc.serviceRef)
    }

    return []
  }, [serviceValue, servicesValue])

  const uniquePath = React.useRef(`_pseudo_field_${uuid()}`)
  const {
    servicesData,
    servicesList,
    loadingServicesData,
    loadingServicesList,
    updatingData,
    nonExistingServiceIdentifiers
  } = useGetServicesData({
    gitOpsEnabled,
    deploymentMetadata,
    deploymentType: deploymentType as ServiceDefinition['type'],
    serviceIdentifiers,
    ...(shouldAddCustomDeploymentData ? { deploymentTemplateIdentifier, versionLabel } : {}),
    serviceGitBranches: selectedServicesGitDetails,
    lazyService: isMultiTypeExpression(serviceInputType),
    parentStoreMetadata: parentStoreMetadata
  })
  const isMultiSvcTemplate =
    getMultiTypeFromValue(servicesTemplate as unknown as string) === MultiTypeInputType.RUNTIME ||
    (Array.isArray(servicesTemplate) &&
      servicesTemplate.some(svc => getMultiTypeFromValue(svc.serviceRef) === MultiTypeInputType.RUNTIME))

  // This contains the full path to the service being referenced. Used specifically to update the template
  const fullPathPrefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  // This is the path prefix for updating inner formik values.
  // The inner formik receives the outer formik values object reduced to an object which has a key as one of the below prefixes
  const localPathPrefix = isMultiSvcTemplate ? 'services.' : 'service.'

  useDeepCompareEffect(() => {
    if (nonExistingServiceIdentifiers.length) {
      showWarning(
        getString('cd.identifiersDoNotExist', {
          entity: getString('service'),
          nonExistingIdentifiers: nonExistingServiceIdentifiers.join(', ')
        })
      )
    }
  }, [nonExistingServiceIdentifiers])

  useDeepCompareEffect(() => {
    // if this is a multi service template, then set up a dummy field,
    // so that services can be updated in this dummy field
    if (isMultiSvcTemplate) {
      if (isValueRuntimeInput(get(formik.values, `${localPathPrefix}values`))) {
        formik.setFieldValue(uniquePath.current, RUNTIME_INPUT_VALUE)
      } else {
        formik.setFieldValue(
          uniquePath.current,
          serviceIdentifiers.map(svcId => ({
            label: defaultTo(servicesList.find(s => s.identifier === svcId)?.name, svcId),
            value: svcId
          }))
        )
      }
    }
  }, [servicesList])

  useEffect(() => {
    const clonedFormikValue = cloneDeep(formik.values) as any
    if (getMultiTypeFromValue(deployParallelTemplate) === MultiTypeInputType.RUNTIME)
      set(
        clonedFormikValue,
        `${localPathPrefix}metadata.parallel`,
        get(formik, `values.${localPathPrefix}metadata.parallel`) || false
      )

    formik.setValues({ ...clonedFormikValue })
  }, [])

  useDeepCompareEffect(() => {
    if (serviceInputType === MultiTypeInputType.EXPRESSION) {
      return
    }

    // if no value is selected, clear the inputs and template
    if (serviceIdentifiers.length === 0) {
      if (isValueRuntimeInput(servicesValue as unknown as string)) {
        return
      } else if (isMultiSvcTemplate) {
        updateStageFormTemplate(RUNTIME_INPUT_VALUE, `${fullPathPrefix}values`)
        formik.setFieldValue(`${localPathPrefix}values`, [])
      } else {
        updateStageFormTemplate(RUNTIME_INPUT_VALUE, `${fullPathPrefix}serviceInputs`)
        formik.setFieldValue(`${localPathPrefix}serviceInputs`, RUNTIME_INPUT_VALUE)
      }
      return
    }

    // updated template data based on selected services
    const newServicesTemplate: ServiceYamlV2[] = serviceIdentifiers.map(svcId => {
      return {
        serviceRef: RUNTIME_INPUT_VALUE,
        serviceInputs: servicesData.find(svcTpl => getScopedValueFromDTO(svcTpl.service) === svcId)?.serviceInputs
      }
    })

    if (!servicesData.length) {
      return
    }
    // updated values based on selected services
    const newServicesValues: ServiceYamlV2[] = serviceIdentifiers.map(svcId => {
      const svcTemplate = servicesData.find(svcTpl => getScopedValueFromDTO(svcTpl.service) === svcId)?.serviceInputs
      const svcFormikValues = get(formik.values, `${localPathPrefix}values`)
      let serviceInputs =
        isMultiSvcTemplate && Array.isArray(svcFormikValues)
          ? svcFormikValues?.find((svc: ServiceYamlV2) => svc.serviceRef === svcId)?.serviceInputs
          : get(formik.values, `${localPathPrefix}serviceInputs`)

      if (!serviceInputs || isValueRuntimeInput(serviceInputs)) {
        serviceInputs = svcTemplate ? clearRuntimeInput(svcTemplate) : undefined
      } else {
        serviceInputs = !isEmpty(svcTemplate) ? merge(clearRuntimeInput(svcTemplate), serviceInputs) : svcTemplate
      }

      return {
        serviceRef: svcId,
        serviceInputs
      }
    })

    if (isMultiSvcTemplate) {
      updateStageFormTemplate(newServicesTemplate, `${fullPathPrefix}values`)
      formik.setFieldValue(`${localPathPrefix}values`, newServicesValues)
    } else {
      updateStageFormTemplate(
        defaultTo(
          newServicesTemplate[0].serviceInputs,
          isStageTemplateInputSetForm && getMultiTypeFromValue(serviceValue) === MultiTypeInputType.RUNTIME
            ? RUNTIME_INPUT_VALUE
            : undefined
        ),
        `${fullPathPrefix}serviceInputs`
      )
      formik.setFieldValue(
        `${localPathPrefix}serviceInputs`,
        defaultTo(
          newServicesValues[0].serviceInputs,
          isStageTemplateInputSetForm && getMultiTypeFromValue(serviceValue) === MultiTypeInputType.RUNTIME
            ? RUNTIME_INPUT_VALUE
            : undefined
        )
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [servicesData, serviceIdentifiers])

  function handleServicesChange(
    values: string | SelectOption[],
    serviceGitBranches?: Record<string, string | undefined>
  ): void {
    if (isValueRuntimeInput(values)) {
      updateStageFormTemplate(RUNTIME_INPUT_VALUE, `${fullPathPrefix}values`)
      formik.setFieldValue(`${localPathPrefix}values`, RUNTIME_INPUT_VALUE)
    } else {
      const newValues = Array.isArray(values)
        ? values.map(val => {
            let serviceInputs: any = RUNTIME_INPUT_VALUE
            const existingServiceInputs = servicesValue.find((ser: any) => ser.serviceRef === (val.value as string))
            if (existingServiceInputs) {
              serviceInputs = existingServiceInputs.serviceInputs
            }

            return {
              serviceRef: val.value as string,
              serviceInputs: serviceInputs
            }
          })
        : undefined

      formik.setValues(
        produce(formik.values, (draft: ServiceResponseDTO) => {
          set(draft, uniquePath.current, values)
          set(draft, `${localPathPrefix}values`, newValues)
          set(draft, 'serviceGitBranches', serviceGitBranches)
        })
      )
    }
  }

  const loading = loadingServicesList || loadingServicesData || updatingData

  const commonProps = {
    name: isMultiSvcTemplate ? uniquePath.current : `${localPathPrefix}serviceRef`,
    tooltipProps: { dataTooltipId: 'specifyYourService' },
    label: isMultiSvcTemplate
      ? getString('cd.pipelineSteps.serviceTab.specifyYourServices')
      : getString('cd.pipelineSteps.serviceTab.specifyYourService'),
    disabled: inputSetData?.readonly || (isMultiSvcTemplate ? loading : false)
  }

  const allowableTypesWithoutExecution = (allowableTypes as MultiTypeInputType[])?.filter(
    item => item !== MultiTypeInputType.EXECUTION_TIME
  ) as AllowedTypes

  const allowableTypesWithoutExpressionExecution = (allowableTypes as MultiTypeInputType[])?.filter(
    item => item !== MultiTypeInputType.EXPRESSION && item !== MultiTypeInputType.EXECUTION_TIME
  ) as AllowedTypes

  const onServiceInputTypeChange = (type: MultiTypeInputType): void => {
    setServiceInputType(type)
    if (type === MultiTypeInputType.EXPRESSION) {
      const serviceInputsValueToBeUpdated = areServiceInputsSupportedAsExecutionInputs
        ? EXECUTION_TIME_INPUT_VALUE
        : undefined

      updateStageFormTemplate(serviceInputsValueToBeUpdated, `${fullPathPrefix}serviceInputs`)
      formik.setFieldValue(`${localPathPrefix}serviceInputs`, serviceInputsValueToBeUpdated)
    }
  }

  return (
    <>
      <Layout.Horizontal style={{ flexDirection: 'column' }}>
        <div className={css.inputFieldLayout}>
          {getMultiTypeFromValue(serviceTemplate) === MultiTypeInputType.RUNTIME ? (
            <MultiTypeServiceField
              {...commonProps}
              deploymentType={deploymentType as ServiceDeploymentType}
              gitOpsEnabled={gitOpsEnabled}
              deploymentMetadata={deploymentMetadata}
              placeholder={getString('cd.pipelineSteps.serviceTab.selectService')}
              setRefValue={true}
              isNewConnectorLabelVisible={false}
              width={300}
              multiTypeProps={{
                expressions,
                allowableTypes: allowableTypesWithoutExecution,
                defaultValueToReset: '',
                onTypeChange: onServiceInputTypeChange
              }}
            />
          ) : null}
        </div>
        {isMultiSvcTemplate ? (
          <>
            <MultiTypeServiceField
              {...commonProps}
              deploymentType={deploymentType as ServiceDeploymentType}
              gitOpsEnabled={gitOpsEnabled}
              deploymentMetadata={deploymentMetadata}
              placeholder={getString('services')}
              isMultiSelect={true}
              onMultiSelectChange={handleServicesChange}
              // This is required to update values when the type has changed
              onChange={item => handleServicesChange(item as SelectOption[])}
              width={300}
              isNewConnectorLabelVisible={false}
              multiTypeProps={{
                expressions,
                allowableTypes: allowableTypesWithoutExpressionExecution
              }}
              multitypeInputValue={
                typeof servicesValue === 'string' ? getMultiTypeFromValue(servicesValue) : MultiTypeInputType.FIXED
              }
            />
            <div className={css.inputFieldLayout}>
              {getMultiTypeFromValue(deployParallelTemplate) === MultiTypeInputType.RUNTIME ? (
                <FormMultiTypeCheckboxField
                  label={getString('cd.pipelineSteps.serviceTab.multiServicesParallelDeployLabel')}
                  name={`${localPathPrefix}metadata.parallel`}
                  disabled={inputSetData?.readonly}
                  checkboxStyle={{ flexGrow: 'unset' }}
                  multiTypeTextbox={{
                    expressions,
                    allowableTypes: allowableTypesWithoutExpressionExecution,
                    width: 300
                  }}
                />
              ) : null}
            </div>
          </>
        ) : null}
        {loading ? <Spinner className={css.inputSetSpinner} size={16} /> : null}
      </Layout.Horizontal>
    </>
  )
}
