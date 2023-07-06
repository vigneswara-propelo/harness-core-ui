import React from 'react'
import { FontVariation } from '@harness/design-system'
import { AllowedTypes, FormInput, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface NodeFilteringFieldsDetailProps {
  allowableTypes: AllowedTypes
}

export default function NodeFilteringFieldsDetail({ allowableTypes }: NodeFilteringFieldsDetailProps): JSX.Element {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  return (
    <>
      <Text margin={{ bottom: 'small' }} font={{ variation: FontVariation.BODY2 }}>
        {getString('cv.verifyStep.nodeFilteringTitle')}
      </Text>
      <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.BODY2_SEMI }}>
        {getString('cv.verifyStep.nodeFilteringDescription')}
      </Text>

      <div className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          label={getString('cv.verifyStep.controlNodeLabel')}
          name="spec.spec.controlNodeRegExPattern"
          placeholder={getString('cv.verifyStep.controlNodePlaceholder')}
          multiTextInputProps={{ expressions, allowableTypes }}
        />
      </div>

      <div className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          label={getString('cv.verifyStep.testNodeLabel')}
          name="spec.spec.testNodeRegExPattern"
          placeholder={getString('cv.verifyStep.testNodePlaceholder')}
          multiTextInputProps={{ expressions, allowableTypes }}
        />
      </div>
    </>
  )
}
