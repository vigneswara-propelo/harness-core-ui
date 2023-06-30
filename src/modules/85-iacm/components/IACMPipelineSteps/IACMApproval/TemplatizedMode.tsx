import React, { ReactElement } from 'react'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { connect } from 'formik'

import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

import { IACMApprovalTemplatizedProps } from './types'

const IACMApprovalTemplatizedMode = (props: IACMApprovalTemplatizedProps): ReactElement => {
  const { inputSetData, allowableTypes, readonly, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { template, path } = inputSetData || {}
  const prefix = path ? `${path}.` : ''

  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          name={`${prefix}timeout`}
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{
            allowableTypes,
            expressions,
            disabled: readonly,
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: stepViewType === StepViewType.DeploymentForm
            }
          }}
          disabled={readonly}
          fieldPath="timeout"
          template={template}
        />
      )}
    </>
  )
}

export default connect(IACMApprovalTemplatizedMode)
