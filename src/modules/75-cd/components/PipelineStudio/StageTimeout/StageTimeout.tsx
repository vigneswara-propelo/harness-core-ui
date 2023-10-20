/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { Formik, ExpressionAndRuntimeTypeProps } from '@harness/uicore'
import { get, noop } from 'lodash-es'
import { StageElementWrapper } from '@modules/70-pipeline/utils/pipelineTypes'
import { usePipelineContext } from '@modules/70-pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@modules/70-pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import { getDurationValidationSchema } from '@modules/10-common/components/MultiTypeDuration/helper'
import { FormMultiTypeDurationField } from '@modules/10-common/components/MultiTypeDuration/MultiTypeDuration'
import { StageElementConfig } from 'services/pipeline-ng'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface StageTimeoutProps<T extends StageElementConfig = StageElementConfig> {
  data?: StageElementWrapper<T>
  onChange: (values: T) => void
  isReadonly: boolean
}

export function StageTimeout<T extends StageElementConfig = StageElementConfig>({
  data,
  onChange,
  isReadonly
}: StageTimeoutProps<T>): JSX.Element {
  const { allowableTypes } = usePipelineContext()
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  return (
    <Formik<{ timeout?: string }>
      initialValues={{
        timeout: get(data, 'stage.timeout', '')
      }}
      onSubmit={noop}
      formName="stageTimeout"
      validationSchema={Yup.object().shape({
        timeout: getDurationValidationSchema({
          minimum: '10s',
          minimumErrorMessage: getString('validation.timeout10SecMinimum')
        })
      })}
    >
      {() => {
        return (
          <div className={cx(stepCss.formGroup, stepCss.sm)}>
            <FormMultiTypeDurationField
              name="timeout"
              label={getString('pipelineSteps.timeoutLabel')}
              multiTypeDurationProps={{
                enableConfigureOptions: true,
                expressions,
                disabled: isReadonly,
                allowableTypes
              }}
              onChange={(value: ExpressionAndRuntimeTypeProps['value']) => {
                onChange({ ...(get(data, 'stage') as T), timeout: value as string })
              }}
              disabled={isReadonly}
            />
          </div>
        )
      }}
    </Formik>
  )
}
