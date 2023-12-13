/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { FormikContextType } from 'formik'
import { get } from 'lodash-es'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import { isValueRuntimeInput } from '@common/utils/utils'
import { TextFieldInputSetView } from '@modules/70-pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import MultiTypeSecretInput from '@modules/27-platform/secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import { SlackNotifyStepData, SlackNotifyStepEditProps } from './SlackNotifyStepEdit'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function SlackNotifyStepInputSet(
  props: SlackNotifyStepEditProps & { formik?: FormikContextType<SlackNotifyStepData> }
): React.ReactElement {
  const { template, path, readonly, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      {isValueRuntimeInput(get(template, 'spec.slackId')) && (
        <TextFieldInputSetView
          name={`${path}.spec.slackId`}
          label={getString('idp.slackNotifyStep.slackChannelId')}
          disabled={readonly}
          multiTextInputProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          placeholder={getString('idp.slackNotifyStep.slackIdPlaceholder')}
          fieldPath="spec.slackId"
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}

      {isValueRuntimeInput(get(template, 'spec.messageContent')) && (
        <TextFieldInputSetView
          name={`${path}.spec.messageContent`}
          label={getString('message')}
          disabled={readonly}
          multiTextInputProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          placeholder={getString('pipeline.terraformStep.messagePlaceholder')}
          fieldPath="spec.messageContent"
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}

      {isValueRuntimeInput(get(template, 'spec.token', '')) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeSecretInput
            expressions={expressions}
            name={`${path}spec.token`}
            label={getString('idp.slackNotifyStep.slackSecretKey')}
            disabled={readonly}
          />
        </div>
      )}
    </>
  )
}
