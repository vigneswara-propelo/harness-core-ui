/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import type { GitOpsRevertPRProps } from './helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function GitOpsRevertPRInputStep({
  inputSetData,
  readonly,
  allowableTypes,
  stepViewType
}: GitOpsRevertPRProps): React.ReactElement {
  const { expressions } = useVariablesExpression()
  const path = inputSetData?.path || ''
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { getString } = useStrings()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes,
            expressions,
            disabled: readonly,
            newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
          }}
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={readonly}
          fieldPath={'timeout'}
          template={inputSetData?.template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.commitId) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTextInput
            name={`${prefix}spec.commitId`}
            placeholder={getString('common.commitId')}
            multiTextInputProps={{
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            label={getString('common.commitId')}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.prTitle) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <FormInput.MultiTextInput
            name={`${prefix}spec.prTitle`}
            placeholder={getString('pipeline.prTitle')}
            multiTextInputProps={{
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            label={getString('pipeline.prTitle')}
          />
        </div>
      )}
    </>
  )
}

export default GitOpsRevertPRInputStep
