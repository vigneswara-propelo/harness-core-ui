/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { identity, pickBy, omit, set } from 'lodash-es'
import type { AllowedTypes } from '@harness/uicore'
import { Layout } from '@harness/uicore'
import { connect } from 'formik'
import type { DeploymentStageConfig, StepElementConfig, StepGroupElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { StageType } from '@pipeline/utils/stageHelpers'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepMode } from '@pipeline/utils/stepUtils'
import { isValueRuntimeInput } from '@common/utils/utils'
import type { StepViewType } from '../AbstractSteps/Step'
import { ExecutionWrapperInputSetForm } from './ExecutionWrapperInputSetForm'
import type { StageInputSetFormProps } from './StageInputSetForm'
import { ConditionalExecutionForm } from './StageAdvancedInputSetForm/ConditionalExecutionForm'
import { LoopingStrategyInputSetForm } from './StageAdvancedInputSetForm/LoopingStrategyInputSetForm'
import { FailureStrategiesInputSetForm } from './StageAdvancedInputSetForm/FailureStrategiesInputSetForm'
import { StepWidget } from '../AbstractSteps/StepWidget'
import { StepType } from '../PipelineSteps/PipelineStepInterface'

export function StepGroupFormSetInternal(props: {
  template: StepGroupElementConfig
  formik: StageInputSetFormProps['formik']
  path: string
  allValues?: any
  values?: any
  readonly?: boolean
  viewType: StepViewType
  allowableTypes: AllowedTypes
  executionIdentifier?: string
  customStepProps?: {
    stageIdentifier: string
    selectedStage?: DeploymentStageConfig
    stageType?: StageType
  }
}): JSX.Element {
  const { template, allValues, values, path, formik, readonly, viewType, allowableTypes, customStepProps } = props
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      {template?.delegateSelectors && (
        <MultiTypeDelegateSelector
          inputProps={{ readonly }}
          allowableTypes={allowableTypes}
          label={getString('delegate.DelegateSelector')}
          name={`${path}.delegateSelectors`}
          disabled={readonly}
        />
      )}
      {template?.when && (
        <ConditionalExecutionForm
          isReadonly={!!readonly}
          path={`${path}.when`}
          allowableTypes={allowableTypes}
          mode={StepMode.STEP_GROUP}
          viewType={viewType}
          template={template?.when}
        />
      )}
      {template?.strategy && (
        <LoopingStrategyInputSetForm
          stageType={customStepProps?.stageType as StageType}
          allowableTypes={allowableTypes}
          path={`${path}.strategy`}
          readonly={readonly}
          viewType={viewType}
          template={template?.strategy}
        />
      )}
      {isValueRuntimeInput(template?.failureStrategies as unknown as string) && (
        <FailureStrategiesInputSetForm
          stageType={customStepProps?.stageType as StageType}
          path={`${path}.failureStrategies`}
          readonly={readonly}
          viewType={viewType}
          mode={StepMode.STEP_GROUP}
        />
      )}
      <StepWidget<Partial<StepElementConfig>>
        factory={factory}
        readonly={readonly}
        path={path}
        allowableTypes={allowableTypes}
        template={omit(template, 'steps') as Partial<StepElementConfig>}
        initialValues={values || {}}
        allValues={allValues || {}}
        type={StepType.StepGroup}
        onUpdate={data => {
          if (values) {
            const execObj = {
              ...data
            }
            if (data.stepGroupInfra) {
              execObj['stepGroupInfra'] = {
                ...pickBy(data.stepGroupInfra, identity)
              }
            }
            formik?.setValues(set(formik?.values, path, execObj))
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
      <ExecutionWrapperInputSetForm
        stepsTemplate={template?.steps}
        formik={formik}
        readonly={readonly}
        path={`${path}.steps`}
        allValues={allValues?.steps}
        values={values?.steps}
        viewType={viewType}
        allowableTypes={allowableTypes}
        customStepProps={customStepProps}
      />
    </Layout.Vertical>
  )
}

export const StepGroupForm = connect(StepGroupFormSetInternal)
