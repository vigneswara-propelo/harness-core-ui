/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormikProps } from 'formik'
import { AllowedTypes, FormikForm, FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import type { RevertPRStepData } from './helper'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function OptionalConfiguration(props: {
  formik: FormikProps<RevertPRStepData>
  readonly?: boolean
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  return (
    <FormikForm>
      <div className={stepCss.stepPanel}>
        <div className={stepCss.formGroup}>
          <FormInput.MultiTextInput
            name="spec.prTitle"
            placeholder={getString('pipeline.prTitle')}
            label={getString('pipeline.prTitle')}
            isOptional
            optionalLabel={getString('common.optionalLabel')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
          />
        </div>
      </div>
    </FormikForm>
  )
}
