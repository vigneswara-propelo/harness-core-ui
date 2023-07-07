/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { identity, pickBy, set, isEmpty, defaultTo } from 'lodash-es'
import { AllowedTypes, Icon, Label, Layout, Popover, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { Classes, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { StageType } from '@pipeline/utils/stageHelpers'
import type {
  DeploymentStageConfig,
  ExecutionWrapperConfig,
  StepElementConfig,
  StepGroupElementConfig,
  ExecutionElementConfig
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { isValueRuntimeInput } from '@common/utils/utils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepMode } from '@pipeline/utils/stepUtils'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepViewType } from '../AbstractSteps/Step'
import { StepWidget } from '../AbstractSteps/StepWidget'
import { CollapseForm } from './CollapseForm'
import type { StageInputSetFormProps } from './StageInputSetForm'
import { StepForm } from './StepInputSetForm'
import { FailureStrategiesInputSetForm } from './StageAdvancedInputSetForm/FailureStrategiesInputSetForm'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export function getStepFromStage(stepId: string, steps?: ExecutionWrapperConfig[]): ExecutionWrapperConfig | undefined {
  let responseStep: ExecutionWrapperConfig | undefined = undefined
  steps?.forEach(item => {
    if (item?.step?.identifier === stepId) {
      responseStep = item
    } else if (item?.stepGroup?.identifier === stepId) {
      responseStep = item
    } else if (item?.parallel) {
      return item.parallel.forEach(node => {
        if (node?.step?.identifier === stepId || node?.stepGroup?.identifier === stepId) {
          responseStep = node
        }
      })
    }
  })
  return responseStep
}

function HeaderComponent({
  stepGroup,
  iconElement
}: {
  stepGroup: StepGroupElementConfig | undefined
  iconElement: JSX.Element
}): JSX.Element {
  const { getString } = useStrings()

  return (
    <Label>
      {iconElement}
      {getString('pipeline.execution.stepGroupTitlePrefix')}
      {getString('pipeline.stepLabel', stepGroup)}
    </Label>
  )
}

export function ExecutionWrapperInputSetForm(props: {
  stepsTemplate?: ExecutionWrapperConfig[]
  formik: StageInputSetFormProps['formik']
  path: string
  allValues?: ExecutionWrapperConfig[]
  values?: ExecutionWrapperConfig[]
  readonly?: boolean
  viewType: StepViewType
  allowableTypes: AllowedTypes
  executionIdentifier?: string
  customStepProps?: {
    stageIdentifier: string
    selectedStage?: DeploymentStageConfig
    stageType?: StageType
    provisioner?: ExecutionElementConfig['steps']
  }
  parentIconData?: JSX.Element
}): JSX.Element {
  const {
    stepsTemplate,
    allValues,
    values,
    path,
    formik,
    readonly,
    viewType,
    allowableTypes,
    executionIdentifier,
    customStepProps,
    parentIconData
  } = props
  const { getString } = useStrings()

  const collapseHeaderPopoverContent = (stepGroup?: StepGroupElementConfig): JSX.Element => {
    return (
      <Text color={Color.WHITE} padding="medium">
        {getString('pipeline.execution.stepGroupTitlePrefix')}
        {getString('pipeline.stepLabel', stepGroup)}
      </Text>
    )
  }

  const collapseHeaderPopoverBody = (index: number): JSX.Element => {
    return (
      <React.Fragment key={`icon-${index}`}>
        <Icon padding={{ right: 'small' }} name={'step-group'} />
        <Icon padding={{ right: 'small' }} name={'chevron-right'} />
      </React.Fragment>
    )
  }

  return (
    <>
      {stepsTemplate?.map((item, index) => {
        /* istanbul ignore else */ if (item.step) {
          const originalStep = getStepFromStage(item.step?.identifier || /* istanbul ignore next */ '', allValues)
          const initialValues = getStepFromStage(item.step?.identifier || /* istanbul ignore next */ '', values)
          return originalStep && /* istanbul ignore next */ originalStep.step ? (
            /* istanbul ignore next */ <StepForm
              key={item.step.identifier || index}
              template={item}
              allValues={originalStep}
              values={initialValues}
              path={`${path}[${index}].step`}
              readonly={readonly}
              viewType={viewType}
              allowableTypes={allowableTypes}
              customStepProps={customStepProps}
              onUpdate={data => {
                /* istanbul ignore next */
                if (initialValues) {
                  if (!initialValues.step) {
                    initialValues.step = {
                      identifier: originalStep.step?.identifier || '',
                      name: originalStep.step?.name || '',
                      type: (originalStep.step as StepElementConfig)?.type || ''
                    }
                  }

                  const execObj = {
                    ...data,
                    spec: {
                      ...pickBy(data.spec, identity)
                    }
                  }

                  initialValues.step = {
                    ...execObj,
                    identifier: originalStep.step?.identifier || '',
                    name: originalStep.step?.name || '',
                    type: (originalStep.step as StepElementConfig)?.type || ''
                  }

                  formik?.setValues(set(formik?.values, `${path}[${index}].step`, initialValues.step))
                }
              }}
            />
          ) : null
        } else if (item.parallel) {
          return item.parallel.map((nodep, indexp) => {
            if (nodep.step) {
              const originalStep = getStepFromStage(nodep.step?.identifier || '', allValues)
              const initialValues = getStepFromStage(nodep.step?.identifier || '', values)
              return originalStep && originalStep.step ? (
                <StepForm
                  key={nodep.step.identifier || index}
                  template={nodep}
                  allValues={originalStep}
                  values={initialValues}
                  readonly={readonly}
                  viewType={viewType}
                  path={`${path}[${index}].parallel[${indexp}].step`}
                  allowableTypes={allowableTypes}
                  customStepProps={customStepProps}
                  onUpdate={data => {
                    if (initialValues) {
                      if (!initialValues.step) {
                        initialValues.step = {
                          identifier: originalStep.step?.identifier || '',
                          name: originalStep.step?.name || '',
                          type: (originalStep.step as StepElementConfig)?.type || '',
                          timeout: '10m'
                        }
                      }
                      initialValues.step = {
                        ...data,
                        identifier: originalStep.step?.identifier || '',
                        name: originalStep.step?.name || '',
                        type: (originalStep.step as StepElementConfig)?.type || '',
                        timeout: '10m'
                      }
                      formik?.setValues(
                        set(formik?.values, `${path}[${index}].parallel[${indexp}].step`, initialValues.step)
                      )
                    }
                  }}
                />
              ) : null
            } else if (nodep.stepGroup) {
              const isTemplateStepGroup = !isEmpty(nodep.stepGroup?.template?.templateInputs)
              const stepGroup = getStepFromStage(nodep.stepGroup.identifier, allValues)
              const initialValues = getStepFromStage(nodep.stepGroup?.identifier || '', values)
              const isStepGroupFailureStrategyRuntime = isTemplateStepGroup
                ? isValueRuntimeInput(nodep.stepGroup?.template?.templateInputs?.failureStrategies as unknown as string)
                : isValueRuntimeInput(nodep.stepGroup?.failureStrategies as unknown as string)

              const iconElement = (
                <>
                  {parentIconData}
                  <Popover
                    interactionKind={PopoverInteractionKind.HOVER}
                    position={Position.BOTTOM_RIGHT}
                    className={Classes.DARK}
                    content={collapseHeaderPopoverContent(stepGroup?.stepGroup)}
                  >
                    {collapseHeaderPopoverBody(index)}
                  </Popover>
                </>
              )

              return (
                <Layout.Vertical spacing="medium" padding={{ top: 'medium' }} key={nodep.stepGroup.identifier || index}>
                  <CollapseForm
                    header={
                      <HeaderComponent
                        stepGroup={isTemplateStepGroup ? nodep.stepGroup : stepGroup?.stepGroup}
                        iconElement={iconElement}
                      />
                    }
                    headerProps={{ font: { size: 'normal' } }}
                    headerColor="var(--black)"
                  >
                    <StepWidget<Partial<StepElementConfig>>
                      factory={factory}
                      readonly={readonly}
                      path={`${path}[${index}].stepGroup`}
                      allowableTypes={allowableTypes}
                      template={item.stepGroup as Partial<StepElementConfig>}
                      initialValues={initialValues?.stepGroup || {}}
                      allValues={stepGroup?.stepGroup || {}}
                      type={StepType.StepGroup}
                      onUpdate={data => {
                        if (initialValues) {
                          if (!initialValues.stepGroup) {
                            initialValues.stepGroup = {
                              identifier: stepGroup?.stepGroup?.identifier || '',
                              name: stepGroup?.stepGroup?.name || ''
                            }
                          }
                          const execObj = {
                            ...data
                          }
                          if (data.stepGroupInfra) {
                            execObj['stepGroupInfra'] = {
                              ...pickBy(data.stepGroupInfra, identity)
                            }
                          }
                          initialValues.stepGroup = {
                            ...execObj,
                            identifier: stepGroup?.stepGroup?.identifier || '',
                            name: stepGroup?.stepGroup?.name || ''
                          }
                          formik?.setValues(set(formik?.values, `${path}[${index}].stepGroup`, initialValues.stepGroup))
                        }
                      }}
                      stepViewType={viewType}
                      customStepProps={
                        customStepProps
                          ? {
                              ...customStepProps,
                              selectedStage: {
                                stage: {
                                  spec: customStepProps?.selectedStage
                                }
                              }
                            }
                          : null
                      }
                    />

                    {isStepGroupFailureStrategyRuntime && (
                      <div className={cx(stepCss.formGroup, { [stepCss.md]: viewType !== StepViewType.TemplateUsage })}>
                        <FailureStrategiesInputSetForm
                          readonly={readonly}
                          path={
                            isTemplateStepGroup
                              ? `${path}[${index}].parallel[${indexp}].stepGroup.template.templateInputs.failureStrategies`
                              : `${path}[${index}].parallel[${indexp}].stepGroup.failureStrategies`
                          }
                          viewType={viewType}
                          stageType={defaultTo(customStepProps?.stageType, StageType.DEPLOY)}
                          mode={StepMode.STEP_GROUP}
                        />
                      </div>
                    )}

                    <ExecutionWrapperInputSetForm
                      executionIdentifier={executionIdentifier}
                      stepsTemplate={
                        isTemplateStepGroup ? nodep.stepGroup?.template?.templateInputs?.steps : nodep.stepGroup.steps
                      }
                      formik={formik}
                      readonly={readonly}
                      path={
                        isTemplateStepGroup
                          ? `${path}[${index}].parallel[${indexp}].stepGroup.template.templateInputs.steps`
                          : `${path}[${index}].parallel[${indexp}].stepGroup.steps`
                      }
                      allValues={defaultTo(
                        stepGroup?.stepGroup?.steps,
                        stepGroup?.stepGroup?.template?.templateInputs?.steps
                      )}
                      values={
                        isTemplateStepGroup
                          ? nodep.stepGroup?.template?.templateInputs?.steps
                          : initialValues?.stepGroup?.steps
                      }
                      viewType={viewType}
                      allowableTypes={allowableTypes}
                      customStepProps={customStepProps}
                      parentIconData={iconElement}
                    />
                  </CollapseForm>
                </Layout.Vertical>
              )
            } else {
              return null
            }
          })
        } else if (item.stepGroup) {
          const isTemplateStepGroup = !isEmpty(item?.stepGroup?.template?.templateInputs)
          const stepGroup = getStepFromStage(item.stepGroup.identifier, allValues)
          const initialValues = getStepFromStage(item.stepGroup?.identifier || '', values)
          const isStepGroupFailureStrategyRuntime = isTemplateStepGroup
            ? isValueRuntimeInput(item?.stepGroup?.template?.templateInputs?.failureStrategies as unknown as string)
            : isValueRuntimeInput(item?.stepGroup?.failureStrategies as unknown as string)

          const iconElement = (
            <>
              {parentIconData}
              <Popover
                interactionKind={PopoverInteractionKind.HOVER}
                position={Position.BOTTOM_RIGHT}
                className={Classes.DARK}
                content={collapseHeaderPopoverContent(stepGroup?.stepGroup)}
              >
                {collapseHeaderPopoverBody(index)}
              </Popover>
            </>
          )
          return (
            <Layout.Vertical spacing="medium" padding={{ top: 'medium' }} key={item.stepGroup.identifier || index}>
              <CollapseForm
                header={<HeaderComponent stepGroup={stepGroup?.stepGroup} iconElement={iconElement} />}
                headerProps={{ font: { size: 'normal' } }}
                headerColor="var(--black)"
              >
                <StepWidget<Partial<StepElementConfig>>
                  factory={factory}
                  readonly={readonly}
                  path={`${path}[${index}].stepGroup`}
                  allowableTypes={allowableTypes}
                  template={item.stepGroup as Partial<StepElementConfig>}
                  initialValues={initialValues?.stepGroup || {}}
                  allValues={stepGroup?.stepGroup || {}}
                  type={StepType.StepGroup}
                  onUpdate={data => {
                    if (initialValues) {
                      if (!initialValues.stepGroup) {
                        initialValues.stepGroup = {
                          identifier: stepGroup?.stepGroup?.identifier || '',
                          name: stepGroup?.stepGroup?.name || ''
                        }
                      }
                      const execObj = {
                        ...data
                      }
                      if (data.stepGroupInfra) {
                        execObj['stepGroupInfra'] = {
                          ...pickBy(data.stepGroupInfra, identity)
                        }
                      }
                      initialValues.stepGroup = {
                        ...execObj,
                        identifier: stepGroup?.stepGroup?.identifier || '',
                        name: stepGroup?.stepGroup?.name || ''
                      }
                      formik?.setValues(set(formik?.values, `${path}[${index}].stepGroup`, initialValues.stepGroup))
                    }
                  }}
                  stepViewType={viewType}
                  customStepProps={
                    customStepProps
                      ? {
                          ...customStepProps,
                          selectedStage: {
                            stage: {
                              spec: customStepProps?.selectedStage
                            }
                          }
                        }
                      : null
                  }
                />

                {isStepGroupFailureStrategyRuntime && (
                  <div className={cx(stepCss.formGroup, { [stepCss.md]: viewType !== StepViewType.TemplateUsage })}>
                    <FailureStrategiesInputSetForm
                      readonly={readonly}
                      path={
                        isTemplateStepGroup
                          ? `${path}[${index}].stepGroup.template.templateInputs.failureStrategies`
                          : `${path}[${index}].stepGroup.failureStrategies`
                      }
                      viewType={viewType}
                      stageType={defaultTo(customStepProps?.stageType, StageType.DEPLOY)}
                      mode={StepMode.STEP_GROUP}
                    />
                  </div>
                )}
                <ExecutionWrapperInputSetForm
                  executionIdentifier={executionIdentifier}
                  stepsTemplate={
                    isTemplateStepGroup ? item.stepGroup?.template?.templateInputs?.steps : item.stepGroup.steps
                  }
                  formik={formik}
                  readonly={readonly}
                  path={
                    isTemplateStepGroup
                      ? `${path}[${index}].stepGroup.template.templateInputs.steps`
                      : `${path}[${index}].stepGroup.steps`
                  }
                  allValues={defaultTo(
                    stepGroup?.stepGroup?.steps,
                    stepGroup?.stepGroup?.template?.templateInputs?.steps
                  )}
                  values={
                    isTemplateStepGroup
                      ? initialValues?.stepGroup?.template?.templateInputs?.steps
                      : initialValues?.stepGroup?.steps
                  }
                  viewType={viewType}
                  allowableTypes={allowableTypes}
                  customStepProps={customStepProps}
                  parentIconData={iconElement}
                />
              </CollapseForm>
            </Layout.Vertical>
          )
        } else {
          return null
        }
      })}
    </>
  )
}
