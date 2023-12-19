import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  FormInput,
  RUNTIME_INPUT_VALUE,
  SelectOption,
  Text,
  AllowedTypes,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Layout
} from '@harness/uicore'
import cx from 'classnames'
import type { IItemRendererProps } from '@blueprintjs/select'
import { connect, FormikContextType } from 'formik'

import { get } from 'lodash-es'
import { useStrings } from 'framework/strings'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGetAzureWebAppDeploymentSlotsV2, useGetAzureWebAppNamesV2 } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import type { AzureSlotDeploymentProps } from './AzureSlotDeploymentInterface.types'
import {
  getEnvId,
  getInfraId,
  getInfraIdRuntime,
  getEnvIdRuntime,
  getAllowableTypes,
  isMultiEnv,
  resourceGroupPath,
  connectorPath,
  subscriptionPath,
  getInfraParamsFixedValue
} from './utils'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AcceptableValue = boolean | string | number | SelectOption | string[]
export interface AzureSlotDeploymentDynamic {
  webAppNamePath?: string
  webAppSlotPath?: string
  stageIdentifier?: string
  isRuntime?: boolean
}

export type AzureSlotDeploymentDynamicProps = AzureSlotDeploymentProps & {
  /* eslint-disable */
  formik?: FormikContextType<any>
} & AzureSlotDeploymentDynamic
const AzureSlotDeploymentDynamic = (props: AzureSlotDeploymentDynamicProps): JSX.Element => {
  /* istanbul ignore next */
  const {
    readonly,
    selectedStage,
    formik,
    webAppNamePath = 'spec.webApp',
    webAppSlotPath = 'spec.deploymentSlot',
    stageIdentifier = '',
    isRuntime = false,
    inputSetData,
    allValues
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [dynamicWebNames, setDynamicWebNames] = useState<SelectOption[]>([])
  const [dynamicSlots, setDynamicSlots] = useState<SelectOption[]>([])
  const infraIdRuntime = getInfraIdRuntime(stageIdentifier, formik?.values, 'infrastructure')
  const envIdRuntime = getEnvIdRuntime(stageIdentifier, formik?.values)
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const infraDefinitionId = getInfraParamsFixedValue([
    get(formik?.values, 'template.templateInputs.spec.environment.infrastructureDefinitions[0].identifier'),
    getInfraId(selectedStage),
    infraIdRuntime
  ])

  const envId = getInfraParamsFixedValue([
    get(formik?.values, 'template.templateInputs.spec.environment.environmentRef'),
    getEnvId(selectedStage),
    envIdRuntime
  ])
  const resourceGroupId = getInfraParamsFixedValue([
    get(formik?.values, resourceGroupPath),
    getInfraId(selectedStage, 'resourceGroup'),
    getInfraIdRuntime(stageIdentifier, formik?.values, 'resourceGroup')
  ])

  const connectorRefId = getInfraParamsFixedValue([
    get(formik?.values, connectorPath),
    getInfraIdRuntime(stageIdentifier, formik?.values, 'connectorRef'),
    getInfraId(selectedStage, 'connectorRef')
  ])

  const subscriptionId = getInfraParamsFixedValue([
    get(formik?.values, subscriptionPath),
    getInfraId(selectedStage, 'subscriptionId'),
    getInfraIdRuntime(stageIdentifier, formik?.values, 'subscriptionId')
  ])

  const envFixedInfraFixed =
    !!envId &&
    getMultiTypeFromValue(envId) === MultiTypeInputType.FIXED &&
    !!infraDefinitionId &&
    getMultiTypeFromValue(infraDefinitionId) === MultiTypeInputType.FIXED

  const itemRenderer = (item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={false} />
  )

  const getFieldValue = (name: string) => {
    return get(formik?.values, name)
  }

  const setFieldValue = (name: string, value: string) => {
    return formik?.setFieldValue(name, value)
  }

  const environmentIdParam = envId || getEnvId(selectedStage) || getEnvIdRuntime(stageIdentifier, formik?.values)
  const infrastructureIdParam =
    infraDefinitionId || getInfraId(selectedStage) || getInfraIdRuntime(stageIdentifier, formik?.values)
  const {
    data: webAppNameData,
    loading: loadingWebApp,
    refetch: refetchWebAppNames,
    error: errorWebApp
  } = useGetAzureWebAppNamesV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      envId: environmentIdParam,
      infraDefinitionId: infrastructureIdParam,
      resourceGroup: resourceGroupId,
      connectorRef: connectorRefId,
      subscriptionId
    },
    lazy: true
  })
  const {
    data: webAppSlotsData,
    loading: loadingWebSlots,
    refetch: refetchWebAppSlots,
    error: webAppSlotsError
  } = useGetAzureWebAppDeploymentSlotsV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      envId: environmentIdParam,
      infraDefinitionId: infrastructureIdParam,
      resourceGroup: resourceGroupId,
      connectorRef: connectorRefId,
      subscriptionId
    },
    lazy: true,
    webAppName: getFieldValue(webAppNamePath) || get(allValues, 'spec.webApp')
  })

  React.useEffect(() => {
    if (webAppNameData) {
      setDynamicSlots([])
      setDynamicWebNames(
        webAppNameData?.data?.webAppNames?.map((name: string): SelectOption => {
          return {
            value: name,
            label: name
          } as SelectOption
        }) as SelectOption[]
      )
    }
  }, [webAppNameData])

  React.useEffect(() => {
    if (webAppSlotsData) {
      setDynamicSlots(
        webAppSlotsData?.data?.deploymentSlots?.map((slot: { name: string }): SelectOption => {
          return {
            value: slot?.name,
            label: slot?.name
          } as SelectOption
        }) as SelectOption[]
      )
    }
  }, [webAppSlotsData])

  const isMultiEnvs = React.useMemo(() => {
    return isMultiEnv(selectedStage)
  }, [selectedStage])

  return envFixedInfraFixed && !isMultiEnvs ? (
    <Layout.Vertical width={'67%'}>
      {!isRuntime ||
      getMultiTypeFromValue(get(inputSetData?.template, `spec.webApp`)) === MultiTypeInputType.RUNTIME ? (
        <FormInput.MultiTypeInput
          selectItems={dynamicWebNames}
          useValue
          multiTypeInputProps={{
            defaultValue: getFieldValue(webAppNamePath),
            expressions,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes,
            selectProps: {
              defaultSelectedItem: {
                label: getFieldValue(webAppNamePath),
                value: getFieldValue(webAppNamePath)
              } as SelectOption,
              items: dynamicWebNames,

              addClearBtn: true,
              itemRenderer: itemRenderer,
              allowCreatingNewItems: true,
              addTooltip: true,
              noResults: (
                <Text padding={'small'}>
                  {loadingWebApp
                    ? getString('loading')
                    : get(errorWebApp, 'data.message', null) || getString('cd.steps.azureWebAppInfra.webAppNameError')}
                </Text>
              )
            },

            onChange: e => {
              if (e === RUNTIME_INPUT_VALUE) {
                setFieldValue(webAppNamePath, RUNTIME_INPUT_VALUE)
                return
              }
            },
            onFocus: () => {
              setDynamicSlots([])
              refetchWebAppNames()
            }
          }}
          label={getString('cd.serviceDashboard.webApp')}
          placeholder={getString('cd.steps.azureWebAppInfra.webAppPlaceholder')}
          name={webAppNamePath}
        />
      ) : null}
      {!isRuntime || getMultiTypeFromValue(get(inputSetData?.template, `${webAppSlotPath}`)) ? (
        <FormInput.MultiTypeInput
          selectItems={dynamicSlots}
          useValue
          multiTypeInputProps={{
            expressions,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes,
            selectProps: {
              defaultSelectedItem: {
                label: getFieldValue(webAppSlotPath),
                value: getFieldValue(webAppSlotPath)
              } as SelectOption,
              items: dynamicSlots,
              addClearBtn: true,
              itemRenderer: itemRenderer,
              allowCreatingNewItems: true,
              addTooltip: true,

              noResults: (
                <Text padding={'small'}>
                  {loadingWebSlots
                    ? getString('loading')
                    : get(webAppSlotsError, 'data.message', null) ||
                      getString('cd.steps.azureWebAppInfra.targetSlotError')}
                </Text>
              )
            },

            onFocus: () => {
              refetchWebAppSlots()
            }
          }}
          label={getString('cd.serviceDashboard.deploymentSlotTitle')}
          placeholder={getString('cd.steps.azureWebAppInfra.deploymentSlotPlaceHolder')}
          name={webAppSlotPath}
        />
      ) : null}
    </Layout.Vertical>
  ) : (
    <>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          name={webAppNamePath}
          placeholder={getString('cd.serviceDashboard.webAppPlaceholder')}
          label={getString('cd.serviceDashboard.webApp')}
          multiTextInputProps={{
            expressions,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes,
            multitypeInputValue: MultiTypeInputType.EXPRESSION,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          disabled={readonly}
        />
        {getMultiTypeFromValue(getFieldValue(webAppNamePath)) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={getFieldValue(webAppNamePath)}
            type="String"
            variableName="spec.webApp"
            showRequiredField={false}
            showDefaultField={false}
            onChange={
              /* istanbul ignore next */ value => {
                setFieldValue(webAppNamePath, value)
              }
            }
            isReadonly={readonly}
          />
        )}
      </div>

      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          name={webAppSlotPath}
          placeholder={getString('cd.serviceDashboard.deploymentSlotPlaceholder')}
          label={getString('cd.serviceDashboard.deploymentSlotTitle')}
          multiTextInputProps={{
            expressions,
            multitypeInputValue: MultiTypeInputType.EXPRESSION,
            allowableTypes: getAllowableTypes(selectedStage) as AllowedTypes,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          disabled={readonly}
        />
        {getMultiTypeFromValue(getFieldValue(webAppSlotPath)) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={getFieldValue(webAppSlotPath)}
            type="String"
            variableName={webAppSlotPath}
            showRequiredField={false}
            showDefaultField={false}
            onChange={
              /* istanbul ignore next */ value => {
                setFieldValue(webAppSlotPath, value)
              }
            }
            isReadonly={readonly}
          />
        )}
      </div>
    </>
  )
}

export const AzureSlotDeploymentDynamicField = connect(AzureSlotDeploymentDynamic)
