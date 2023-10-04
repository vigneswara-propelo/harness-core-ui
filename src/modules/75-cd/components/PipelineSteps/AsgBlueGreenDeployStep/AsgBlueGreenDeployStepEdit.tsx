/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, isArray, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import produce from 'immer'
import cx from 'classnames'
import { FormikProps, FieldArray } from 'formik'
import {
  AllowedTypes,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption,
  Button,
  ButtonVariation,
  Layout,
  Container,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'

import {
  listenerRulesPromise,
  ResponseListString,
  useElasticLoadBalancers,
  useListeners,
  AwsLoadBalancerConfigYaml,
  AsgFixedInstances
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectConfigureOptions } from '@common/components/ConfigureOptions/SelectConfigureOptions/SelectConfigureOptions'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { NameTimeoutField } from '../Common/GenericExecutionStep/NameTimeoutField'
import AsgSelectInstance from './AsgSelectInstance/AsgSelectInstance'
import AsgBGStageSetupLoadBalancer from './AsgBGLoadBalancers/AsgBlueGreenDeployLoadBalancers'
import type {
  AsgBlueGreenDeployStepInitialValues,
  AsgBlueGreenDeployCustomStepProps,
  AsgAwsLoadBalancerConfigYaml
} from './AsgBlueGreenDeployStep'
import { shouldFetchFieldData } from '../PipelineStepsUtil'
import { InstancesType } from '../ElastigroupSetupStep/ElastigroupSetupTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './AsgBlueGreenDeployStep.module.scss'

export interface AsgBlueGreenDeployStepProps {
  initialValues: AsgBlueGreenDeployStepInitialValues
  onUpdate?: (data: AsgBlueGreenDeployStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: AsgBlueGreenDeployStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  customStepProps: AsgBlueGreenDeployCustomStepProps
}

export interface AsgLoadBalancer {
  loadBalancer: string | null
  prodListenerPort: string | null
  prodListenerRuleArn: string | null
  stageListenerPort: string | null
  stageListenerRuleArn: string | null
  loadBalancers: AwsLoadBalancerConfigYaml[]
}

const AsgBlueGreenDeployStepEdit = (
  props: AsgBlueGreenDeployStepProps,
  formikRef: StepFormikFowardRef<AsgBlueGreenDeployStepInitialValues>
): React.ReactElement => {
  const {
    initialValues,
    onUpdate,
    isNewStep = true,
    readonly,
    onChange,
    allowableTypes,
    stepViewType,
    customStepProps
  } = props
  const { selectedStage } = customStepProps

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [listenerList, setListenerList] = useState<SelectOption[]>([])
  const [prodListenerRules, setProdListenerRules] = useState<SelectOption[]>([])
  const [prodListenerRulesLoading, setProdListenerRulesLoading] = useState<boolean>(false)
  const [stageListenerRules, setStageListenerRules] = useState<SelectOption[]>([])
  const [stageListenerRulesLoading, setStageListenerRulesLoading] = useState<boolean>(false)
  const { expressions } = useVariablesExpression()
  const { CDS_ASG_V2, CDS_BASIC_ASG } = useFeatureFlags()
  const environmentRef = defaultTo(
    selectedStage?.stage?.spec?.environment?.environmentRef,
    selectedStage?.stage?.spec?.infrastructure?.environmentRef
  )
  const infrastructureRef = selectedStage?.stage?.spec?.environment?.infrastructureDefinitions?.[0].identifier

  const awsConnectorRef = selectedStage?.stage?.spec?.infrastructure?.infrastructureDefinition?.spec.connectorRef
  const region = selectedStage?.stage?.spec?.infrastructure?.infrastructureDefinition?.spec.region

  const shouldFetchLoadBalancers = shouldFetchFieldData([
    defaultTo(environmentRef, ''),
    defaultTo(infrastructureRef, '')
  ])
  const shouldFetchListeners =
    shouldFetchFieldData([initialValues.spec.loadBalancer]) ||
    shouldFetchFieldData([
      defaultTo(environmentRef, ''),
      defaultTo(infrastructureRef, ''),
      initialValues.spec.loadBalancer
    ])
  const shouldFetch = shouldFetchLoadBalancers

  const {
    data: loadBalancers,
    loading: loadingLoadBalancers,
    refetch: refetchLoadBalancers
  } = useElasticLoadBalancers({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      awsConnectorRef,
      region,
      envId: environmentRef,
      infraDefinitionId: infrastructureRef
    },
    lazy: !shouldFetchLoadBalancers
  })
  const loadBalancerOptions: SelectOption[] = React.useMemo(() => {
    return defaultTo(loadBalancers?.data, []).map(loadBalancer => ({
      value: loadBalancer,
      label: loadBalancer
    }))
  }, [loadBalancers?.data])

  const {
    data: listeners,
    loading: loadingListeners,
    refetch: refetchListeners
  } = useListeners({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      envId: environmentRef,
      infraDefinitionId: infrastructureRef,
      awsConnectorRef,
      region,
      elasticLoadBalancer: initialValues.spec.loadBalancer
    },
    lazy: !shouldFetchListeners
  })
  React.useEffect(() => {
    const listenerData = defaultTo(listeners?.data, {})
    const listenerOptions = Object.keys(listenerData).map(listenerKey => ({
      value: listenerData[listenerKey],
      label: listenerKey
    }))
    setListenerList(listenerOptions)
  }, [listeners?.data])

  React.useEffect(() => {
    if (shouldFetchFieldData([initialValues.spec.loadBalancer, initialValues.spec.prodListener])) {
      fetchProdListenerRules(initialValues.spec.loadBalancer, initialValues.spec.prodListener, undefined, true)
    }
    if (shouldFetchFieldData([initialValues.spec.loadBalancer, initialValues.spec.stageListener])) {
      fetchStageListenerRules(initialValues.spec.loadBalancer, initialValues.spec.stageListener, undefined, true)
    }
  }, [initialValues.spec.loadBalancer, initialValues.spec.prodListener, initialValues.spec.stageListener])

  const fetchLoadBalancers = (e: React.FocusEvent<HTMLInputElement>): void => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }
    if (!loadingLoadBalancers) {
      if ((awsConnectorRef && region) || (environmentRef && infrastructureRef)) {
        refetchLoadBalancers()
      }
    }
  }

  const fetchListeners = (e: React.FocusEvent<HTMLInputElement>, selectedLoadBalancer: string): void => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }

    if (!loadingListeners) {
      if (
        shouldFetchFieldData([awsConnectorRef, region, selectedLoadBalancer]) ||
        shouldFetchFieldData([defaultTo(environmentRef, ''), defaultTo(infrastructureRef, ''), selectedLoadBalancer])
      ) {
        refetchListeners({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            envId: environmentRef,
            infraDefinitionId: infrastructureRef,
            awsConnectorRef,
            region,
            elasticLoadBalancer: selectedLoadBalancer
          }
        })
      }
    }
  }

  const fetchProdListenerRules = (
    selectedLoadBalancer: string,
    selectedProdListener: string,
    e?: React.FocusEvent<HTMLInputElement>,
    fromEffect = false
  ): void => {
    if (
      (!fromEffect && e?.target?.type !== 'text') ||
      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
    ) {
      return
    }

    if (
      shouldFetchFieldData([awsConnectorRef, region, selectedLoadBalancer, selectedProdListener]) ||
      shouldFetchFieldData([
        defaultTo(environmentRef, ''),
        defaultTo(infrastructureRef, ''),
        selectedLoadBalancer,
        selectedProdListener
      ])
    ) {
      setProdListenerRulesLoading(true)
      listenerRulesPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          envId: environmentRef,
          infraDefinitionId: infrastructureRef,
          awsConnectorRef,
          region,
          elasticLoadBalancer: selectedLoadBalancer,
          listenerArn: selectedProdListener
        }
      })
        .then((response: ResponseListString) => {
          setProdListenerRulesLoading(false)
          const listenerRulesData = defaultTo(response?.data, [])
          const listenerRulesOptions = listenerRulesData.map(listenerRule => ({
            value: listenerRule,
            label: listenerRule
          }))
          setProdListenerRules(listenerRulesOptions)
        })
        .catch(() => {
          setProdListenerRulesLoading(false)
          setProdListenerRules([])
        })
    }
  }

  const fetchStageListenerRules = (
    selectedLoadBalancer: string,
    selectedStageListener: string,
    e?: React.FocusEvent<HTMLInputElement>,
    fromEffect = false
  ): void => {
    if (
      (!fromEffect && e?.target?.type !== 'text') ||
      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
    ) {
      return
    }

    if (
      shouldFetchFieldData([awsConnectorRef, region, selectedLoadBalancer, selectedStageListener]) ||
      shouldFetchFieldData([
        defaultTo(environmentRef, ''),
        defaultTo(infrastructureRef, ''),
        selectedLoadBalancer,
        selectedStageListener
      ])
    ) {
      setStageListenerRulesLoading(true)
      listenerRulesPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          envId: environmentRef,
          infraDefinitionId: infrastructureRef,
          awsConnectorRef,
          region,
          elasticLoadBalancer: selectedLoadBalancer,
          listenerArn: selectedStageListener
        }
      })
        .then((response: ResponseListString) => {
          setStageListenerRulesLoading(false)
          const listenerRulesData = defaultTo(response?.data, [])
          const listenerRulesOptions = listenerRulesData.map(listenerRule => ({
            value: listenerRule,
            label: listenerRule
          }))
          setStageListenerRules(listenerRulesOptions)
        })
        .catch(() => {
          setStageListenerRulesLoading(false)
          setStageListenerRules([])
        })
    }
  }

  const onLoadBalancerChange = (
    selectedLoadBalancer: string,
    formik: FormikProps<AsgBlueGreenDeployStepInitialValues>
  ): void => {
    const updatedValues = produce(formik.values, draft => {
      draft.spec.loadBalancer = selectedLoadBalancer
      if (getMultiTypeFromValue(formik.values.spec.prodListener) === MultiTypeInputType.FIXED) {
        draft.spec.prodListener = ''
      }
      if (getMultiTypeFromValue(formik.values.spec.prodListenerRuleArn) === MultiTypeInputType.FIXED) {
        draft.spec.prodListenerRuleArn = ''
      }
      if (getMultiTypeFromValue(formik.values.spec.stageListener) === MultiTypeInputType.FIXED) {
        draft.spec.stageListener = ''
      }
      if (getMultiTypeFromValue(formik.values.spec.stageListenerRuleArn) === MultiTypeInputType.FIXED) {
        draft.spec.stageListenerRuleArn = ''
      }
    })
    formik.setValues(updatedValues)
    setListenerList([])
    setProdListenerRules([])
    setStageListenerRules([])
  }
  const getInitialValues = React.useCallback(() => {
    let initialLoadBalancer = {
      loadBalancer: defaultTo(initialValues.spec?.loadBalancer, ''),
      prodListener: defaultTo(initialValues.spec?.prodListener, ''),
      prodListenerRuleArn: defaultTo(initialValues.spec?.prodListenerRuleArn, ''),
      stageListener: defaultTo(initialValues.spec?.stageListener, ''),
      stageListenerRuleArn: defaultTo(initialValues.spec?.stageListenerRuleArn, '')
    }
    let loadBalancersToUpdate: AsgAwsLoadBalancerConfigYaml[] = defaultTo(initialValues?.spec?.loadBalancers, [
      initialLoadBalancer
    ])
    if (CDS_ASG_V2) {
      initialLoadBalancer = {
        loadBalancer: '',
        prodListener: '',
        prodListenerRuleArn: '',
        stageListener: '',
        stageListenerRuleArn: ''
      }
      if (!shouldFetchLoadBalancers) {
        loadBalancersToUpdate = [
          {
            loadBalancer: RUNTIME_INPUT_VALUE,
            prodListener: RUNTIME_INPUT_VALUE,
            prodListenerRuleArn: RUNTIME_INPUT_VALUE,
            stageListener: RUNTIME_INPUT_VALUE,
            stageListenerRuleArn: RUNTIME_INPUT_VALUE
          }
        ]
      } else if (
        shouldFetchLoadBalancers &&
        (isEmpty(initialValues.spec?.loadBalancers) || initialValues.spec?.loadBalancer)
      ) {
        loadBalancersToUpdate = [
          {
            loadBalancer: defaultTo(initialValues.spec?.loadBalancer, ''),
            prodListener: defaultTo(initialValues.spec?.prodListener, ''),
            prodListenerRuleArn: initialValues.spec?.prodListenerRuleArn,
            stageListener: initialValues.spec?.stageListener,
            stageListenerRuleArn: initialValues.spec?.stageListenerRuleArn
          }
        ]
      }
    }

    const initVals = {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        loadBalancers: loadBalancersToUpdate,
        ...initialLoadBalancer,
        instances: !CDS_ASG_V2
          ? undefined
          : !initialValues.spec?.instances && !!initialValues.spec?.useAlreadyRunningInstances
          ? { type: InstancesType.CurrentRunning, spec: {} }
          : !initialValues.spec?.instances && !initialValues.spec?.useAlreadyRunningInstances
          ? {
              type: InstancesType.Fixed,
              spec: {
                desired: 1,
                max: 1,
                min: 1
              }
            }
          : { ...initialValues.spec?.instances }
      }
    }

    return initVals
  }, [initialValues, shouldFetchLoadBalancers, shouldFetch])

  const initValues = getInitialValues() as AsgBlueGreenDeployStepInitialValues

  function commonValidation(this: Yup.TestContext, value: any, valueString: string): boolean | Yup.ValidationError {
    if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED && typeof value !== 'number') {
      return this.createError({
        message: getString('cd.ElastigroupStep.valueCannotBe', {
          value: valueString
        })
      })
    }
    if (value < 0) {
      return this.createError({
        message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
          value: valueString,
          value2: 0
        })
      })
    }
    return true
  }

  const formikRefValues = (): AsgBlueGreenDeployStepInitialValues =>
    (formikRef as React.MutableRefObject<FormikProps<unknown> | null>)?.current
      ?.values as AsgBlueGreenDeployStepInitialValues

  return (
    <>
      <Formik<AsgBlueGreenDeployStepInitialValues>
        onSubmit={(values: AsgBlueGreenDeployStepInitialValues) => {
          onUpdate?.(values)
        }}
        formName="AsgBlueGreenDeployStepEdit"
        initialValues={initValues}
        validate={data => {
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            loadBalancer: Yup.string().when(' ', {
              is: () => !CDS_ASG_V2,
              then: Yup.string().required(
                getString('common.validation.fieldIsRequired', {
                  name: getString('common.loadBalancer')
                })
              ),
              otherwise: Yup.string().nullable()
            }),
            prodListener: Yup.string().when(' ', {
              is: () => !CDS_ASG_V2,
              then: Yup.string().required(
                getString('common.validation.fieldIsRequired', {
                  name: getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')
                })
              ),
              otherwise: Yup.string().nullable()
            }),
            prodListenerRuleArn: Yup.string().when(' ', {
              is: () => {
                return !CDS_ASG_V2
              },
              then: Yup.string().required(
                getString('common.validation.fieldIsRequired', {
                  name: getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')
                })
              ),
              otherwise: Yup.string().nullable()
            }),
            stageListener: Yup.string().when(' ', {
              is: () => {
                return !CDS_ASG_V2
              },
              then: Yup.string().required(
                getString('common.validation.fieldIsRequired', {
                  name: getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')
                })
              ),
              otherwise: Yup.string().nullable()
            }),
            stageListenerRuleArn: Yup.string().when(' ', {
              is: () => {
                return !CDS_ASG_V2
              },
              then: Yup.string().required(
                getString('common.validation.fieldIsRequired', {
                  name: getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')
                })
              ),
              otherwise: Yup.string().nullable()
            }),
            loadBalancers: Yup.array().when(' ', {
              is: () => {
                return !!CDS_ASG_V2
              },
              then: Yup.array().of(
                Yup.object().shape({
                  loadBalancer: Yup.string().required(
                    getString('common.validation.fieldIsRequired', {
                      name: getString('common.loadBalancer')
                    })
                  ),
                  prodListener: Yup.string().required(
                    getString('common.validation.fieldIsRequired', {
                      name: getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')
                    })
                  ),
                  prodListenerRuleArn: Yup.string().required(
                    getString('common.validation.fieldIsRequired', {
                      name: getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')
                    })
                  ),
                  stageListener: Yup.string().required(
                    getString('common.validation.fieldIsRequired', {
                      name: getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')
                    })
                  ),
                  stageListenerRuleArn: Yup.string().required(
                    getString('common.validation.fieldIsRequired', {
                      name: getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')
                    })
                  )
                })
              )
            }),

            instances: Yup.object().when(' ', {
              is: () => !!CDS_ASG_V2,
              then: Yup.object().shape({
                type: Yup.string().trim().required(getString('common.validation.typeIsRequired')),
                spec: Yup.object().when('type', {
                  is: 'Fixed',
                  then: Yup.object().shape({
                    desired: Yup.mixed().test({
                      test(value): boolean | Yup.ValidationError {
                        const otherValues = formikRefValues()?.spec?.instances?.spec as AsgFixedInstances
                        if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
                          if (value < otherValues?.min) {
                            return this.createError({
                              message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
                                value: getString('cd.ElastigroupStep.desiredInstances'),
                                value2: getString('cd.ElastigroupStep.minInstances')
                              })
                            })
                          } else if (value > otherValues?.max) {
                            return this.createError({
                              message: getString('cd.ElastigroupStep.valueCannotBeGreaterThan', {
                                value: getString('cd.ElastigroupStep.desiredInstances'),
                                value2: getString('cd.ElastigroupStep.maxInstances')
                              })
                            })
                          }
                        }
                        return commonValidation.call(this, value, getString('cd.ElastigroupStep.desiredInstances'))
                      }
                    }),
                    min: Yup.mixed().test({
                      test(value): boolean | Yup.ValidationError {
                        const otherValues = formikRefValues()?.spec?.instances?.spec as AsgFixedInstances
                        if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
                          if (value > otherValues?.desired) {
                            return this.createError({
                              message: getString('cd.ElastigroupStep.valueCannotBeGreaterThan', {
                                value: getString('cd.ElastigroupStep.minInstances'),
                                value2: getString('cd.ElastigroupStep.desiredInstances')
                              })
                            })
                          } else if (value > otherValues?.max) {
                            return this.createError({
                              message: getString('cd.ElastigroupStep.valueCannotBeGreaterThan', {
                                value: getString('cd.ElastigroupStep.minInstances'),
                                value2: getString('cd.ElastigroupStep.maxInstances')
                              })
                            })
                          }
                        }
                        return commonValidation.call(this, value, getString('cd.ElastigroupStep.minInstances'))
                      }
                    }),
                    max: Yup.mixed().test({
                      test(value): boolean | Yup.ValidationError {
                        const otherValues = formikRefValues()?.spec?.instances?.spec as AsgFixedInstances
                        if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED) {
                          if (value < otherValues?.min) {
                            return this.createError({
                              message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
                                value: getString('cd.ElastigroupStep.maxInstances'),
                                value2: getString('cd.ElastigroupStep.minInstances')
                              })
                            })
                          } else if (value < otherValues?.desired) {
                            return this.createError({
                              message: getString('cd.ElastigroupStep.valueCannotBeLessThan', {
                                value: getString('cd.ElastigroupStep.maxInstances'),
                                value2: getString('cd.ElastigroupStep.desiredInstances')
                              })
                            })
                          }
                        }
                        return commonValidation.call(this, value, getString('cd.ElastigroupStep.maxInstances'))
                      }
                    })
                  })
                })
              })
            })
          })
        })}
      >
        {(formik: FormikProps<AsgBlueGreenDeployStepInitialValues>) => {
          setFormikRef(formikRef, formik)
          return (
            <FormikForm>
              <NameTimeoutField
                allowableTypes={allowableTypes}
                isNewStep={isNewStep}
                readonly={readonly}
                stepViewType={stepViewType}
              />

              <div className={stepCss.divider} />
              {CDS_BASIC_ASG ? (
                <Container className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.MultiTextInput
                    name="spec.asgName"
                    label={getString('cd.serviceDashboard.asgName')}
                    placeholder={getString('cd.asgPlaceholder')}
                    disabled={readonly}
                    multiTextInputProps={{
                      expressions,
                      disabled: readonly,
                      allowableTypes
                    }}
                  />
                  {getMultiTypeFromValue(formik.values.spec?.asgName) === MultiTypeInputType.RUNTIME && !readonly && (
                    <ConfigureOptions
                      value={formik.values.spec?.asgName as string}
                      type="String"
                      variableName="spec.asgName"
                      showRequiredField={false}
                      showDefaultField={false}
                      onChange={value => {
                        formik.setFieldValue('spec.asgName', value)
                      }}
                      isReadonly={readonly}
                    />
                  )}
                </Container>
              ) : null}
              {CDS_ASG_V2 ? (
                <AsgSelectInstance formik={formik} readonly={readonly} allowableTypes={allowableTypes} />
              ) : (
                <FormMultiTypeCheckboxField
                  name="spec.useAlreadyRunningInstances"
                  label={getString('cd.useAlreadyRunningInstance')}
                  disabled={readonly}
                  multiTypeTextbox={{ expressions, allowableTypes }}
                />
              )}

              {!CDS_ASG_V2 ? (
                <>
                  <div className={css.configureServiceTitle}>{getString('cd.loadBalancerConfig')}</div>

                  <div className={cx(stepCss.formGroup, stepCss.lg)}>
                    <FormInput.MultiTypeInput
                      name="spec.loadBalancer"
                      selectItems={loadBalancerOptions}
                      useValue
                      multiTypeInputProps={{
                        selectProps: {
                          items: loadBalancerOptions,
                          popoverClassName: css.dropdownMenu,
                          allowCreatingNewItems: true,
                          loadingItems: loadingLoadBalancers
                        },
                        onChange: selectedValue => {
                          const selectedValueString =
                            typeof selectedValue === 'string'
                              ? selectedValue
                              : ((selectedValue as SelectOption)?.value as string)
                          onLoadBalancerChange(selectedValueString, formik)
                        },
                        onFocus: fetchLoadBalancers
                      }}
                      label={getString('common.loadBalancer')}
                      placeholder={loadingLoadBalancers ? getString('loading') : getString('select')}
                      disabled={readonly}
                    />
                    {getMultiTypeFromValue(formik.values.spec.loadBalancer) === MultiTypeInputType.RUNTIME && (
                      <SelectConfigureOptions
                        options={loadBalancerOptions}
                        value={formik.values.spec.loadBalancer as string}
                        type="String"
                        variableName="spec.loadBalancer"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          onLoadBalancerChange(value, formik)
                        }}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                  <div className={css.configureServiceTitle}>
                    {getString('cd.steps.ecsBGCreateServiceStep.sectionHeaders.configureProductionService')}
                  </div>
                  <div className={cx(stepCss.formGroup, stepCss.lg)}>
                    <FormInput.MultiTypeInput
                      name="spec.prodListener"
                      selectItems={listenerList}
                      useValue
                      multiTypeInputProps={{
                        selectProps: {
                          items: listenerList,
                          popoverClassName: css.dropdownMenu,
                          allowCreatingNewItems: true,
                          loadingItems: loadingListeners
                        },
                        onChange: selectedValue => {
                          const selectedValueString =
                            typeof selectedValue === 'string'
                              ? selectedValue
                              : ((selectedValue as SelectOption)?.value as string)
                          const updatedValues = produce(formik.values, draft => {
                            draft.spec.prodListener = selectedValueString
                            if (getMultiTypeFromValue(draft.spec.prodListenerRuleArn) === MultiTypeInputType.FIXED) {
                              draft.spec.prodListenerRuleArn = ''
                            }
                          })
                          formik.setValues(updatedValues)
                        },
                        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                          fetchListeners(e, formik.values.spec.loadBalancer)
                        }
                      }}
                      label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')}
                      placeholder={loadingListeners ? getString('loading') : getString('select')}
                      disabled={readonly}
                    />
                    {getMultiTypeFromValue(formik.values.spec.prodListener) === MultiTypeInputType.RUNTIME && (
                      <SelectConfigureOptions
                        options={listenerList}
                        value={formik.values.spec.prodListener as string}
                        type="String"
                        variableName="spec.prodListener"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          const updatedValues = produce(formik.values, draft => {
                            draft.spec.prodListener = value
                            if (getMultiTypeFromValue(draft.spec.prodListenerRuleArn) === MultiTypeInputType.FIXED) {
                              draft.spec.prodListenerRuleArn = ''
                            }
                          })
                          formik.setValues(updatedValues)
                        }}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                  <div className={cx(stepCss.formGroup, stepCss.lg)}>
                    <FormInput.MultiTypeInput
                      name="spec.prodListenerRuleArn"
                      selectItems={prodListenerRules}
                      useValue
                      multiTypeInputProps={{
                        selectProps: {
                          items: prodListenerRules,
                          popoverClassName: css.dropdownMenu,
                          allowCreatingNewItems: true,
                          loadingItems: prodListenerRulesLoading
                        },
                        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                          fetchProdListenerRules(formik.values.spec.loadBalancer, formik.values.spec.prodListener, e)
                        }
                      }}
                      label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')}
                      placeholder={prodListenerRulesLoading ? getString('loading') : getString('select')}
                      disabled={readonly}
                    />
                    {getMultiTypeFromValue(formik.values.spec.prodListenerRuleArn) === MultiTypeInputType.RUNTIME && (
                      <SelectConfigureOptions
                        options={prodListenerRules}
                        value={formik.values.spec.prodListenerRuleArn as string}
                        type="String"
                        variableName="spec.prodListenerRuleArn"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('spec.prodListenerRuleArn', value)
                        }}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                  <div className={css.configureServiceTitle}>
                    {getString('cd.steps.ecsBGCreateServiceStep.sectionHeaders.configureStageService')}
                  </div>
                  <div className={cx(stepCss.formGroup, stepCss.lg)}>
                    <FormInput.MultiTypeInput
                      name="spec.stageListener"
                      selectItems={listenerList}
                      useValue
                      multiTypeInputProps={{
                        selectProps: {
                          items: listenerList,
                          popoverClassName: css.dropdownMenu,
                          allowCreatingNewItems: true,
                          loadingItems: loadingListeners
                        },
                        onChange: selectedValue => {
                          const selectedValueString =
                            typeof selectedValue === 'string'
                              ? selectedValue
                              : ((selectedValue as SelectOption)?.value as string)
                          const updatedValues = produce(formik.values, draft => {
                            draft.spec.stageListener = selectedValueString
                            if (getMultiTypeFromValue(draft.spec.stageListenerRuleArn) === MultiTypeInputType.FIXED) {
                              draft.spec.stageListenerRuleArn = ''
                            }
                          })
                          formik.setValues(updatedValues)
                        },
                        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                          fetchListeners(e, formik.values.spec.loadBalancer)
                        }
                      }}
                      label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')}
                      placeholder={loadingListeners ? getString('loading') : getString('select')}
                      disabled={readonly}
                    />
                    {getMultiTypeFromValue(formik.values.spec.stageListener) === MultiTypeInputType.RUNTIME && (
                      <SelectConfigureOptions
                        options={listenerList}
                        value={formik.values.spec.stageListener as string}
                        type="String"
                        variableName="spec.stageListener"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          const updatedValues = produce(formik.values, draft => {
                            draft.spec.stageListener = value
                            if (getMultiTypeFromValue(draft.spec.stageListenerRuleArn) === MultiTypeInputType.FIXED) {
                              draft.spec.stageListenerRuleArn = ''
                            }
                          })
                          formik.setValues(updatedValues)
                        }}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                  <div className={cx(stepCss.formGroup, stepCss.lg)}>
                    <FormInput.MultiTypeInput
                      name="spec.stageListenerRuleArn"
                      selectItems={stageListenerRules}
                      useValue
                      multiTypeInputProps={{
                        selectProps: {
                          items: stageListenerRules,
                          popoverClassName: css.dropdownMenu,
                          allowCreatingNewItems: true,
                          loadingItems: stageListenerRulesLoading
                        },
                        onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                          fetchStageListenerRules(formik.values.spec.loadBalancer, formik.values.spec.stageListener, e)
                        }
                      }}
                      label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')}
                      placeholder={stageListenerRulesLoading ? getString('loading') : getString('select')}
                      disabled={readonly}
                    />
                    {getMultiTypeFromValue(formik.values.spec.stageListenerRuleArn) === MultiTypeInputType.RUNTIME && (
                      <SelectConfigureOptions
                        options={stageListenerRules}
                        value={formik.values.spec.stageListenerRuleArn as string}
                        type="String"
                        variableName="spec.stageListenerRuleArn"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={value => {
                          formik.setFieldValue('spec.stageListenerRuleArn', value)
                        }}
                        isReadonly={readonly}
                      />
                    )}
                  </div>
                </>
              ) : null}

              {CDS_ASG_V2 && isArray(formik.values.spec?.loadBalancers) ? (
                <FieldArray
                  name="spec.loadBalancers"
                  render={({ push, remove }) => {
                    return (
                      <>
                        <Layout.Horizontal>
                          <div>{getString('cd.ElastigroupBGStageSetup.awsLoadBalancerConfig')}</div>
                          <Button
                            variation={ButtonVariation.LINK}
                            data-testid="add-aws-loadbalance"
                            onClick={() =>
                              push({
                                loadBalancer: '',
                                prodListener: '',
                                prodListenerRuleArn: '',
                                stageListener: '',
                                stageListenerRuleArn: ''
                              })
                            }
                          >
                            {getString('plusAdd')}
                          </Button>
                        </Layout.Horizontal>
                        {isArray(formik.values.spec?.loadBalancers) &&
                          (formik.values.spec?.loadBalancers || [])?.map((_id, i: number) => {
                            return (
                              <AsgBGStageSetupLoadBalancer
                                key={i}
                                formik={formik as any}
                                readonly={readonly}
                                remove={remove}
                                index={i}
                                envId={defaultTo(environmentRef, '')}
                                infraId={defaultTo(infrastructureRef, '')}
                              />
                            )
                          })}
                      </>
                    )
                  }}
                />
              ) : null}
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const AsgBlueGreenDeployStepEditRef = React.forwardRef(AsgBlueGreenDeployStepEdit)
