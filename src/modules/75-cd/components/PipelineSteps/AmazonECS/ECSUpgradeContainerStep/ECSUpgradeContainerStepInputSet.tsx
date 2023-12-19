/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { connect } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { isValueRuntimeInput } from '@common/utils/utils'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ECSUpgradeContainerStepElementConfig } from '@pipeline/utils/types'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ECSUpgradeContainerStepInputSetProps {
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: ECSUpgradeContainerStepElementConfig
    path?: string
    readonly?: boolean
    allValues?: ECSUpgradeContainerStepElementConfig
  }
  stepViewType: StepViewType
}

const ECSUpgradeContainerStepInputSet = (props: ECSUpgradeContainerStepInputSetProps): React.ReactElement => {
  const { inputSetData, allowableTypes, stepViewType } = props
  const { template, path, readonly } = inputSetData
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const pathPrefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            name={`${pathPrefix}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            disabled={readonly}
          />
        </div>
      )}

      {isValueRuntimeInput(template?.spec?.newServiceInstanceCount) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${pathPrefix}spec.newServiceInstanceCount`}
            label={getString('instanceFieldOptions.instanceText')}
            multiTextInputProps={{
              textProps: {
                type: 'number'
              },
              disabled: readonly,
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            disabled={readonly}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            fieldPath="spec.newServiceInstanceCount"
            template={template}
          />
        </div>
      )}

      {isValueRuntimeInput(template?.spec?.downsizeOldServiceInstanceCount) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${pathPrefix}spec.downsizeOldServiceInstanceCount`}
            label={getString('cd.steps.ecsUpgradeContainerStep.downsizeInstanceCount')}
            placeholder={getString('cd.steps.ecsUpgradeContainerStep.downsizeInstanceUnitPlaceholder')}
            multiTextInputProps={{
              textProps: {
                type: 'number'
              },
              disabled: readonly,
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            disabled={readonly}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
            fieldPath="spec.downsizeOldServiceInstanceCount"
            template={template}
          />
        </div>
      )}
    </>
  )
}

export const ECSUpgradeContainerStepInputSetMode = connect(ECSUpgradeContainerStepInputSet)
