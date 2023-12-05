/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isArray, isEmpty, get } from 'lodash-es'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikProps, FieldArray } from 'formik'
import {
  AllowedTypes,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Button,
  ButtonVariation,
  Layout,
  Container,
  RUNTIME_INPUT_VALUE
} from '@harness/uicore'

import { AwsLoadBalancerConfigYaml, AsgFixedInstances } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { StepViewType, setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
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

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { CDS_BASIC_ASG } = useFeatureFlags()
  const selectedStageSpec = selectedStage?.stage?.spec
  const selectedStageSpecEnv = selectedStageSpec?.environment
  const selectedStageSpecInfra = selectedStageSpec?.infrastructure

  const environmentRef = defaultTo(selectedStageSpecEnv?.environmentRef, selectedStageSpecInfra?.environmentRef)
  const infrastructureRef = selectedStageSpecEnv?.infrastructureDefinitions?.[0].identifier
  const shouldFetchLoadBalancers = shouldFetchFieldData([
    defaultTo(environmentRef, ''),
    defaultTo(infrastructureRef, '')
  ])

  const getInitialValues = React.useCallback(() => {
    const loadBalancer = initialValues.spec?.loadBalancer
    const prodListener = initialValues.spec?.prodListener
    const prodListenerArn = initialValues.spec?.prodListenerRuleArn
    const stageListener = initialValues.spec?.stageListener
    const stageListenerRuleArn = initialValues.spec?.stageListenerRuleArn
    const loadBalancersSpec = initialValues.spec?.loadBalancers

    const initialLoadBalancer = {
      loadBalancer: '',
      prodListener: '',
      prodListenerRuleArn: '',
      stageListener: '',
      stageListenerRuleArn: ''
    }

    let loadBalancersToUpdate: AsgAwsLoadBalancerConfigYaml[] | string = defaultTo(initialValues.spec?.loadBalancers, [
      initialLoadBalancer
    ])

    if (typeof loadBalancersSpec === 'string') {
      loadBalancersToUpdate = loadBalancersSpec
    } else if (
      (shouldFetchLoadBalancers && (isEmpty(loadBalancersSpec) || loadBalancer)) ||
      getMultiTypeFromValue(loadBalancer) === MultiTypeInputType.EXPRESSION
    ) {
      loadBalancersToUpdate = [
        {
          loadBalancer: defaultTo(loadBalancer, ''),
          prodListener: defaultTo(prodListener, ''),
          prodListenerRuleArn: prodListenerArn,
          stageListener: stageListener,
          stageListenerRuleArn: stageListenerRuleArn
        }
      ]
    } else if (isEmpty(loadBalancersToUpdate)) {
      loadBalancersToUpdate = [initialLoadBalancer]
    }

    const initVals = {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        loadBalancers: loadBalancersToUpdate,
        ...initialLoadBalancer,
        instances:
          !initialValues.spec?.instances && !!initialValues.spec?.useAlreadyRunningInstances
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
  }, [initialValues, shouldFetchLoadBalancers])

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
            loadBalancers: Yup.array()
              .of(
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
              .nullable(),
            instances: Yup.object().shape({
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

              <AsgSelectInstance formik={formik} readonly={readonly} allowableTypes={allowableTypes} />

              <Container>
                {getMultiTypeFromValue(get(formik.values, 'spec.loadBalancers')) === MultiTypeInputType.FIXED &&
                isArray(formik.values.spec?.loadBalancers) ? (
                  <FieldArray
                    name="spec.loadBalancers"
                    render={({ push, remove }) => {
                      return (
                        <>
                          <Layout.Horizontal
                            flex={{ alignItems: 'center', justifyContent: 'space-between' }}
                            margin={{ bottom: 'small' }}
                          >
                            <div>{getString('cd.ElastigroupBGStageSetup.awsLoadBalancerConfig')}</div>
                            <Layout.Horizontal>
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
                              <MultiTypeSelectorButton
                                allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                                type={getMultiTypeFromValue(get(formik.values, 'spec.loadBalancers'))}
                                onChange={value => {
                                  if (value === MultiTypeInputType.FIXED) {
                                    formik.setFieldValue('spec.loadBalancers', [
                                      {
                                        loadBalancer: '',
                                        prodListener: '',
                                        prodListenerRuleArn: '',
                                        stageListener: '',
                                        stageListenerRuleArn: ''
                                      }
                                    ])
                                  } else {
                                    formik.setFieldValue('spec.loadBalancers', RUNTIME_INPUT_VALUE)
                                  }
                                }}
                              />
                            </Layout.Horizontal>
                          </Layout.Horizontal>
                          {isArray(formik.values.spec?.loadBalancers) &&
                            (formik.values.spec?.loadBalancers || [])?.map((_id, i: number) => {
                              return (
                                <AsgBGStageSetupLoadBalancer
                                  key={i}
                                  formik={formik}
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
                ) : (
                  <>
                    <Layout.Vertical>
                      <Layout.Horizontal
                        flex={{ alignItems: 'center', justifyContent: 'space-between' }}
                        margin={{ bottom: 'small' }}
                      >
                        <div>{getString('cd.ElastigroupBGStageSetup.awsLoadBalancerConfig')}</div>
                        <Layout.Horizontal>
                          <MultiTypeSelectorButton
                            allowedTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                            type={getMultiTypeFromValue(get(formik.values, 'spec.loadBalancers'))}
                            onChange={value => {
                              if (value === MultiTypeInputType.FIXED) {
                                formik.setFieldValue('spec.loadBalancers', [
                                  {
                                    loadBalancer: '',
                                    prodListener: '',
                                    prodListenerRuleArn: '',
                                    stageListener: '',
                                    stageListenerRuleArn: ''
                                  }
                                ])
                              } else {
                                formik.setFieldValue('spec.loadBalancers', RUNTIME_INPUT_VALUE)
                              }
                            }}
                          />
                        </Layout.Horizontal>
                      </Layout.Horizontal>
                      <FormInput.Text
                        name="spec.loadBalancers"
                        placeholder={getString('cd.ElastigroupBGStageSetup.awsLoadBalancerConfig')}
                        disabled
                      />
                    </Layout.Vertical>
                  </>
                )}
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export const AsgBlueGreenDeployStepEditRef = React.forwardRef(AsgBlueGreenDeployStepEdit)
