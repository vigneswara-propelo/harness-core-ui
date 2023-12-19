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
  Layout,
  Button,
  Dialog,
  ButtonVariation
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import cx from 'classnames'
import type { IItemRendererProps } from '@blueprintjs/select'
import { connect, FormikContextType } from 'formik'

import { get, defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import ItemRendererWithMenuItem from '@common/components/ItemRenderer/ItemRendererWithMenuItem'

import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGetAzureWebAppDeploymentSlotsV2, useGetAzureWebAppNamesV2 } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MultiTypeFieldSelector } from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
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
} from '../AzureSlotDeployment/utils'

import type { AzureWebAppSwapSlotProps } from './SwapSlot.types'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from '../Common/Terraform/TerraformStep.module.scss'

export type AcceptableValue = boolean | string | number | SelectOption | string[]
export interface AzureSlotDeploymentDynamic {
  webAppNamePath?: string
  webAppSwapSlotPath?: string
  stageIdentifier?: string
  isRuntime?: boolean
}

export type AzureSwapSlotDeploymentDynamicProps = AzureWebAppSwapSlotProps & {
  /* eslint-disable */
  formik?: FormikContextType<any>
} & AzureSlotDeploymentDynamic
const AzureSwapSlotDeploymentDynamic = (props: AzureSwapSlotDeploymentDynamicProps): JSX.Element => {
  /* istanbul ignore next */
  const {
    readonly,
    selectedStage,
    formik,
    webAppNamePath = 'spec.webApp',
    webAppSwapSlotPath = 'spec.targetSlot',
    stageIdentifier = '',
    isRuntime = false,
    inputSetData
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()

  const getFieldValue = (name: string) => {
    return get(formik?.values, name)
  }

  const setFieldValue = (name: string, value: string) => {
    return formik?.setFieldValue(name, value)
  }
  const [dynamicWebNames, setDynamicWebNames] = useState<SelectOption[]>([])
  const [dynamicSwapSlots, setDynamicSwapSlots] = useState<SelectOption[]>([])
  const [webAppName, setWebAppName] = useState('')
  const [slotName, setSlotName] = useState(defaultTo(getFieldValue(webAppSwapSlotPath), ''))

  const infraIdRuntime = getInfraIdRuntime(stageIdentifier, formik?.values, 'infrastructure')
  const envIdRuntime = getEnvIdRuntime(stageIdentifier, formik?.values)

  const infraDefinitionId =
    get(formik?.values, 'template.templateInputs.spec.environment.infrastructureDefinitions[0].identifier') ||
    getInfraId(selectedStage) ||
    infraIdRuntime

  const envId =
    get(formik?.values, 'template.templateInputs.spec.environment.environmentRef') ||
    getEnvId(selectedStage) ||
    envIdRuntime

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

  const itemRenderer = (item: SelectOption, itemProps: IItemRendererProps) => (
    <ItemRendererWithMenuItem item={item} itemProps={itemProps} disabled={false} />
  )

  React.useEffect(() => {
    if (isRuntime && !getFieldValue(webAppSwapSlotPath)) {
      setFieldValue(webAppSwapSlotPath, '')
      setDynamicWebNames([])
      setDynamicSwapSlots([])
    }
  }, [isRuntime, infraIdRuntime, envIdRuntime])

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
      envId,
      infraDefinitionId,
      resourceGroup: resourceGroupId,
      connectorRef: connectorRefId,
      subscriptionId
    },
    lazy: true
  })

  const {
    data: webAppSwapSlotsData,
    loading: loadingWebSlots,
    refetch: refetchWebAppSlots,
    error: errorWebAppSwapSlot
  } = useGetAzureWebAppDeploymentSlotsV2({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      envId,
      infraDefinitionId,
      resourceGroup: resourceGroupId,
      connectorRef: connectorRefId,
      subscriptionId
    },
    lazy: true,
    webAppName
  })

  React.useEffect(() => {
    if (webAppNameData?.data?.webAppNames?.length) {
      setDynamicSwapSlots([])
      setDynamicWebNames(
        webAppNameData.data.webAppNames.map((name: string): SelectOption => {
          return {
            value: name,
            label: name
          } as SelectOption
        }) as SelectOption[]
      )
    }
  }, [webAppNameData?.data?.webAppNames])

  React.useEffect(() => {
    if (webAppSwapSlotsData?.data?.deploymentSlots?.length) {
      const slots: SelectOption[] = webAppSwapSlotsData.data.deploymentSlots.map(
        (slot: { name: string }): SelectOption => {
          return {
            value: slot.name,
            label: slot.name
          } as SelectOption
        }
      )
      setDynamicSwapSlots(slots)
    }
  }, [webAppSwapSlotsData])

  const envFixedInfraFixed =
    !!envId &&
    getMultiTypeFromValue(envId) === MultiTypeInputType.FIXED &&
    !!infraDefinitionId &&
    getMultiTypeFromValue(infraDefinitionId) === MultiTypeInputType.FIXED
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        enforceFocus={false}
        isOpen
        title={getString('cd.steps.azureWebAppInfra.targetSlotTitle')}
        style={{ width: 500, minHeight: 300 }}
        onClose={hideModal}
        usePortal
      >
        <>
          {!isRuntime || getMultiTypeFromValue(get(inputSetData?.template, `${webAppSwapSlotPath}`)) ? (
            <>
              <FormInput.MultiTypeInput
                selectItems={dynamicWebNames}
                multiTypeInputProps={{
                  defaultValue: webAppName,
                  expressions,
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                  allowableTypes: [MultiTypeInputType.FIXED],
                  selectProps: {
                    defaultSelectedItem: {
                      label: webAppName,
                      value: webAppName
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
                          : get(errorWebApp, 'data.message', null) ||
                            getString('cd.steps.azureWebAppInfra.webAppNameError')}
                      </Text>
                    )
                  },

                  onChange: e => {
                    setWebAppName((e as SelectOption)?.value as string)
                    if (getFieldValue(webAppSwapSlotPath) !== RUNTIME_INPUT_VALUE) {
                      setFieldValue(webAppSwapSlotPath, '')
                    }
                  },
                  onFocus: () => {
                    refetchWebAppNames()
                  }
                }}
                label={getString('cd.serviceDashboard.webApp')}
                placeholder={getString('cd.steps.azureWebAppInfra.webAppPlaceholder')}
                name={''}
              />
              <FormInput.MultiTypeInput
                selectItems={dynamicSwapSlots}
                multiTypeInputProps={{
                  multitypeInputValue:
                    getFieldValue(webAppNamePath) === RUNTIME_INPUT_VALUE ? MultiTypeInputType.RUNTIME : undefined,
                  expressions,
                  allowableTypes: [MultiTypeInputType.FIXED],
                  newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT,
                  selectProps: {
                    defaultSelectedItem: {
                      label: slotName,
                      value: slotName
                    } as SelectOption,
                    items: dynamicSwapSlots,
                    addClearBtn: true,
                    itemRenderer: itemRenderer,
                    allowCreatingNewItems: true,
                    addTooltip: true,

                    noResults: (
                      <Text padding={'small'}>
                        {loadingWebSlots
                          ? getString('loading')
                          : get(errorWebAppSwapSlot, 'data.message', null) ||
                            getString('cd.steps.azureWebAppInfra.targetSlotError')}
                      </Text>
                    )
                  },
                  onChange: e => {
                    setSlotName((e as SelectOption)?.value as string)
                  },
                  onFocus: () => {
                    refetchWebAppSlots()
                  }
                }}
                label={getString('cd.steps.azureWebAppInfra.targetSlotTitle')}
                placeholder={getString('cd.steps.azureWebAppInfra.targetSlotPlaceHolder')}
                name={webAppSwapSlotPath}
              />
            </>
          ) : null}
          <Layout.Horizontal spacing="small" padding="none" margin="none">
            <Button
              onClick={() => {
                setWebAppName(webAppName)
                setFieldValue(webAppSwapSlotPath, slotName)
                hideModal()
              }}
              text={getString('common.apply')}
              variation={ButtonVariation.PRIMARY}
            ></Button>
            <Button
              onClick={() => {
                hideModal()
              }}
              text={getString('cancel')}
              variation={ButtonVariation.TERTIARY}
            ></Button>
          </Layout.Horizontal>
        </>
      </Dialog>
    ),
    [
      webAppName,
      dynamicWebNames,
      dynamicSwapSlots,
      webAppSwapSlotPath,
      loadingWebSlots,
      loadingWebApp,
      formik?.values,
      slotName,
      setSlotName,
      isRuntime,
      refetchWebAppNames,
      refetchWebAppSlots
    ]
  )

  const isMultiEnvs = React.useMemo(() => {
    return isMultiEnv(selectedStage)
  }, [selectedStage])

  return envFixedInfraFixed && !isMultiEnvs && formik ? (
    <Layout.Vertical width={'67%'}>
      <MultiTypeFieldSelector
        name={webAppSwapSlotPath}
        formik={formik}
        label={getString('cd.steps.azureWebAppInfra.targetSlotTitle')}
        onTypeChange={() => {
          setSlotName('')
          setWebAppName('')
        }}
        allowedTypes={getAllowableTypes(selectedStage) as AllowedTypes}
      >
        <Layout.Vertical>
          <div className={cx(css.configFile, css.addMarginBottom)}>
            <div className={css.configField}>
              {!getFieldValue(webAppSwapSlotPath) && (
                <a
                  data-testid="editConfigButton"
                  className={css.configPlaceHolder}
                  data-name="config-edit"
                  onClick={() => showModal()}
                >
                  {getString('cd.configFilePlaceHolder')}
                </a>
              )}
              {getFieldValue(webAppSwapSlotPath) && (
                <Text font="normal" lineClamp={1} width={200} data-testid={getFieldValue(webAppSwapSlotPath)}>
                  {getFieldValue(webAppSwapSlotPath)}
                </Text>
              )}
              {getFieldValue(webAppSwapSlotPath) ? (
                <Button
                  minimal
                  icon="Edit"
                  withoutBoxShadow
                  iconProps={{ size: 16 }}
                  onClick={() => showModal()}
                  data-name="config-edit"
                  withoutCurrentColor={true}
                  className={css.editBtn}
                />
              ) : null}
            </div>
          </div>
        </Layout.Vertical>
      </MultiTypeFieldSelector>
    </Layout.Vertical>
  ) : (
    <>
      <div className={cx(stepCss.formGroup, stepCss.lg)}>
        <FormInput.MultiTextInput
          name={webAppSwapSlotPath}
          placeholder={getString('cd.steps.azureWebAppInfra.targetSlotSpecify')}
          label={getString('cd.steps.azureWebAppInfra.targetSlotTitle')}
          multiTextInputProps={{
            expressions,
            multitypeInputValue: isMultiEnvs
              ? MultiTypeInputType.EXPRESSION
              : getMultiTypeFromValue(getFieldValue(webAppSwapSlotPath)),
            allowableTypes: isMultiEnvs
              ? ([MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME] as AllowedTypes)
              : (getAllowableTypes(selectedStage) as AllowedTypes),
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          disabled={readonly}
        />
        {getMultiTypeFromValue(getFieldValue(webAppSwapSlotPath)) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            value={getFieldValue(webAppSwapSlotPath)}
            type="String"
            variableName={webAppSwapSlotPath}
            showRequiredField={false}
            showDefaultField={false}
            onChange={
              /* istanbul ignore next */ value => {
                setFieldValue(webAppSwapSlotPath, value)
              }
            }
            isReadonly={readonly}
          />
        )}
      </div>
    </>
  )
}

export const AzureSwapSlotDeploymentDynamicField = connect(AzureSwapSlotDeploymentDynamic)
