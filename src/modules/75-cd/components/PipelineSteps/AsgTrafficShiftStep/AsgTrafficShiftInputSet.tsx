import React from 'react'
import { isEmpty, get, defaultTo } from 'lodash-es'
import cx from 'classnames'
import { FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { isRuntime } from '../CloudFormation/CloudFormationHelper'
import type { AsgTrafficShiftProps } from './AsgTrafficShiftStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const AsgTrafficShiftInputStep: React.FC<AsgTrafficShiftProps> = ({
  template,
  readonly,
  path,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {isRuntime(defaultTo(get(template, 'timeout'), '')) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            disabled={readonly}
          />
        </div>
      )}
      {isRuntime(defaultTo(get(template, 'spec.weight'), '')) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTextInput
            name={`${prefix}spec.weight`}
            placeholder={getString('cd.asgWeight')}
            label={getString('cd.asgWeight')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes,
              textProps: { type: 'number' }
            }}
          />
        </div>
      )}
      {isRuntime(defaultTo(get(template, 'spec.downsizeOldAsg'), '')) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            name={`${prefix}spec.downsizeOldAsg`}
            label={getString('cd.downsizeOldAsg')}
            disabled={readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
    </>
  )
}
