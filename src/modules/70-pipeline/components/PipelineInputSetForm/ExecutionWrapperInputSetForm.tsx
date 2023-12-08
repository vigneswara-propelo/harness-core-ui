/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { identity, pickBy, set, isEmpty, defaultTo, isUndefined, omit } from 'lodash-es'
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
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepViewType } from '../AbstractSteps/Step'
import { StepWidget } from '../AbstractSteps/StepWidget'
import { CollapseForm } from './CollapseForm'
import type { StageInputSetFormProps } from './StageInputSetForm'
import { StepForm } from './StepInputSetForm'
import { FailureStrategiesInputSetForm } from './StageAdvancedInputSetForm/FailureStrategiesInputSetForm'
import { NodeWrapperEntity } from '../PipelineDiagram/Nodes/utils'
import { ConditionalExecutionForm } from './StageAdvancedInputSetForm/ConditionalExecutionForm'
import { LoopingStrategyInputSetForm } from './StageAdvancedInputSetForm/LoopingStrategyInputSetForm'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export function getStepFromStage(
  stepId = '',
  steps?: ExecutionWrapperConfig[],
  nodeType: NodeWrapperEntity = NodeWrapperEntity.step
): ExecutionWrapperConfig | undefined {
  for (const item of steps || []) {
    if (item?.stepGroup?.identifier === stepId && nodeType === NodeWrapperEntity.stepGroup) {
      return item
    } else if (item?.step?.identifier === stepId && nodeType === NodeWrapperEntity.step) {
      return item
    } else if (item?.parallel) {
      const result = getStepFromStage(stepId, item.parallel, nodeType)
      if (result !== undefined) {
        return result
      }
    }
  }

  return undefined
}

function StepGroupRuntimeForm(props: {
  stepGroupItem: StepGroupElementConfig
  viewType: StepViewType
  allowableTypes: AllowedTypes
  formik: StageInputSetFormProps['formik']
  path: string
  index: number
  indexp?: number
  allValues?: ExecutionWrapperConfig[]
  values?: ExecutionWrapperConfig[]
  readonly?: boolean
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
    stepGroupItem,
    viewType,
    allowableTypes,
    formik,
    path,
    index,
    indexp,
    allValues,
    values,
    readonly,
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
  const collapseHeaderPopoverBody = (popoverIndex: number): JSX.Element => {
    return (
      <React.Fragment key={`icon-${popoverIndex}`}>
        <Icon padding={{ right: 'small' }} name={'step-group'} />
        <Icon padding={{ right: 'small' }} name={'chevron-right'} />
      </React.Fragment>
    )
  }

  const stepGroupPath = !isUndefined(indexp)
    ? `${path}[${index}].parallel[${indexp}].stepGroup`
    : `${path}[${index}].stepGroup`
  const isTemplateStepGroup = !isEmpty(stepGroupItem?.template?.templateInputs)
  const stepGroup = getStepFromStage(stepGroupItem?.identifier, allValues, NodeWrapperEntity.stepGroup)
  const initialValues = getStepFromStage(stepGroupItem?.identifier, values, NodeWrapperEntity.stepGroup)
  const isStepGroupDelegateSelectorRuntime = isTemplateStepGroup
    ? !isEmpty(stepGroupItem?.template?.templateInputs?.delegateSelectors as unknown as string)
    : !isEmpty(stepGroupItem?.delegateSelectors as unknown as string)
  const isStepGroupConditionalExecutionRuntime = isTemplateStepGroup
    ? !isEmpty(stepGroupItem?.template?.templateInputs?.when as unknown as string)
    : !isEmpty(stepGroupItem?.when as unknown as string)
  const isStepGroupLoopingStrategyRuntime = isTemplateStepGroup
    ? !isEmpty(stepGroupItem?.template?.templateInputs?.strategy as unknown as string)
    : !isEmpty(stepGroupItem?.strategy as unknown as string)
  const isStepGroupFailureStrategyRuntime = isTemplateStepGroup
    ? isValueRuntimeInput(stepGroupItem?.template?.templateInputs?.failureStrategies as unknown as string)
    : isValueRuntimeInput(stepGroupItem?.failureStrategies as unknown as string)

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
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }} key={stepGroupItem?.identifier || index}>
      <CollapseForm
        header={
          <HeaderComponent
            stepGroup={isTemplateStepGroup ? stepGroupItem : stepGroup?.stepGroup}
            iconElement={iconElement}
          />
        }
        headerProps={{ font: { size: 'normal' } }}
        headerColor="var(--black)"
      >
        <StepWidget<Partial<StepElementConfig>>
          factory={factory}
          readonly={readonly}
          path={stepGroupPath}
          allowableTypes={allowableTypes}
          template={stepGroupItem as Partial<StepElementConfig>}
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
        {isStepGroupDelegateSelectorRuntime && (
          <div className={cx(stepCss.formGroup, { [stepCss.md]: viewType !== StepViewType.TemplateUsage })}>
            <MultiTypeDelegateSelector
              inputProps={{ readonly }}
              allowableTypes={allowableTypes}
              label={getString('delegate.DelegateSelector')}
              name={
                isTemplateStepGroup
                  ? `${stepGroupPath}.template.templateInputs.delegateSelectors`
                  : `${stepGroupPath}.delegateSelectors`
              }
              disabled={readonly}
            />
          </div>
        )}
        {isStepGroupConditionalExecutionRuntime && (
          <div className={cx(stepCss.formGroup)}>
            <ConditionalExecutionForm
              isReadonly={!!readonly}
              path={isTemplateStepGroup ? `${stepGroupPath}.template.templateInputs.when` : `${stepGroupPath}.when`}
              allowableTypes={allowableTypes}
              viewType={viewType}
              template={isTemplateStepGroup ? stepGroupItem?.template?.templateInputs?.when : stepGroupItem.when}
              mode={StepMode.STEP_GROUP}
            />
          </div>
        )}
        {isStepGroupLoopingStrategyRuntime && (
          <div className={cx(stepCss.formGroup)}>
            <LoopingStrategyInputSetForm
              stageType={customStepProps?.stageType as StageType}
              allowableTypes={allowableTypes}
              path={
                isTemplateStepGroup ? `${stepGroupPath}.template.templateInputs.strategy` : `${stepGroupPath}.strategy`
              }
              readonly={readonly}
              viewType={viewType}
              template={
                isTemplateStepGroup ? stepGroupItem?.template?.templateInputs?.strategy : stepGroupItem.strategy
              }
            />
          </div>
        )}
        {isStepGroupFailureStrategyRuntime && (
          <div className={cx(stepCss.formGroup, { [stepCss.md]: viewType !== StepViewType.TemplateUsage })}>
            <FailureStrategiesInputSetForm
              readonly={readonly}
              path={
                isTemplateStepGroup
                  ? `${stepGroupPath}.template.templateInputs.failureStrategies`
                  : `${stepGroupPath}.failureStrategies`
              }
              viewType={viewType}
              stageType={defaultTo(customStepProps?.stageType, StageType.DEPLOY)}
              mode={StepMode.STEP_GROUP}
            />
          </div>
        )}
        {/* For template stepGroup - render config entities apart from steps (variables/stepGroupInfra) */}
        {isTemplateStepGroup && (
          <StepWidget<Partial<StepElementConfig>>
            factory={factory}
            readonly={readonly}
            path={`${stepGroupPath}.template.templateInputs`}
            allowableTypes={allowableTypes}
            template={omit(stepGroupItem?.template?.templateInputs, 'steps')}
            initialValues={(initialValues?.stepGroup?.template?.templateInputs as Partial<StepElementConfig>) || {}}
            allValues={defaultTo(stepGroup?.stepGroup, stepGroup?.stepGroup?.template?.templateInputs) || {}}
            type={StepType.StepGroup}
            stepViewType={StepViewType.TemplateUsage}
          />
        )}
        <ExecutionWrapperInputSetForm
          executionIdentifier={executionIdentifier}
          stepsTemplate={isTemplateStepGroup ? stepGroupItem?.template?.templateInputs?.steps : stepGroupItem.steps}
          formik={formik}
          readonly={readonly}
          path={isTemplateStepGroup ? `${stepGroupPath}.template.templateInputs.steps` : `${stepGroupPath}.steps`}
          allValues={defaultTo(stepGroup?.stepGroup?.steps, stepGroup?.stepGroup?.template?.templateInputs?.steps)}
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

  return (
    <>
      {stepsTemplate?.map((item, index) => {
        /* istanbul ignore else */ if (item.step) {
          const originalStep = getStepFromStage(item.step?.identifier, allValues, NodeWrapperEntity.step)
          const initialValues = getStepFromStage(item.step?.identifier, values, NodeWrapperEntity.step)
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
              const originalStep = getStepFromStage(nodep.step?.identifier, allValues, NodeWrapperEntity.step)
              const initialValues = getStepFromStage(nodep.step?.identifier, values, NodeWrapperEntity.step)
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
              return (
                <StepGroupRuntimeForm
                  stepGroupItem={nodep.stepGroup}
                  allValues={allValues}
                  values={values}
                  parentIconData={parentIconData}
                  readonly={readonly}
                  path={path}
                  allowableTypes={allowableTypes}
                  viewType={viewType}
                  customStepProps={customStepProps}
                  formik={formik}
                  executionIdentifier={executionIdentifier}
                  index={index}
                  indexp={indexp}
                />
              )
            } else {
              return null
            }
          })
        } else if (item.stepGroup) {
          return (
            <StepGroupRuntimeForm
              stepGroupItem={item.stepGroup}
              allValues={allValues}
              values={values}
              parentIconData={parentIconData}
              readonly={readonly}
              path={path}
              allowableTypes={allowableTypes}
              viewType={viewType}
              customStepProps={customStepProps}
              formik={formik}
              executionIdentifier={executionIdentifier}
              index={index}
            />
          )
        } else {
          return null
        }
      })}
    </>
  )
}
