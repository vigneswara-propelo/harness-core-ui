/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { AllowedTypes, Container, FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import Card from '@cv/components/Card/Card'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getMultiTypeInputProps } from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/VerificationJobFields/VerificationJobFields.utils'
import { ANALYSIS_DURATION_OPTIONS } from './BaseAnalyzeDeploymentImpact.constants'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function BaseAnalyzeDeploymentImpact(props: {
  isNewStep?: boolean
  stepViewType?: StepViewType
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { isNewStep, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <Card>
      <>
        {stepViewType !== StepViewType.Template && (
          <Container className={cx(stepCss.formGroup, stepCss.md)}>
            <FormInput.InputWithIdentifier
              isIdentifierEditable={isNewStep}
              inputLabel={getString('pipelineSteps.stepNameLabel')}
            />
          </Container>
        )}
        <Container className={cx(stepCss.formGroup, stepCss.md)}>
          <FormInput.MultiTypeInput
            name={'spec.duration'}
            data-testid="duration"
            label={getString('duration')}
            selectItems={ANALYSIS_DURATION_OPTIONS}
            multiTypeInputProps={getMultiTypeInputProps(expressions, allowableTypes)}
            useValue
          />
        </Container>
        <Container className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            name="timeout"
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{ enableConfigureOptions: true, expressions, allowableTypes }}
          />
        </Container>
      </>
    </Card>
  )
}
