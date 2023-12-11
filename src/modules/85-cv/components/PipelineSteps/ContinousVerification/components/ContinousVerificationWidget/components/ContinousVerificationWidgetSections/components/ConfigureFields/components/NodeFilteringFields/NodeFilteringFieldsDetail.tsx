import React from 'react'
import { useFormikContext } from 'formik'
import { Color, FontVariation } from '@harness/design-system'
import { AllowedTypes, FormInput, Text } from '@harness/uicore'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import { VerificationTypes } from '../../constants'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import styles from './NodeFilteringFieldsDetail.module.scss'

interface NodeFilteringFieldsDetailProps {
  allowableTypes: AllowedTypes
}

export default function NodeFilteringFieldsDetail({ allowableTypes }: NodeFilteringFieldsDetailProps): JSX.Element {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const { values: formikValues } = useFormikContext<ContinousVerificationData>()

  const verificationType = formikValues?.spec?.type

  const {
    CV_UI_DISPLAY_NODE_REGEX_FILTER: isRegexNodeFilterFFEnabled,
    CV_UI_DISPLAY_SHOULD_USE_NODES_FROM_CD_CHECKBOX: isFilterFromCDEnabled
  } = useFeatureFlags()

  const canShowRegexFields = isRegexNodeFilterFFEnabled && verificationType !== VerificationTypes.Auto

  return (
    <>
      <FormInput.CheckBox
        name="spec.spec.failIfAnyCustomMetricInNoAnalysis"
        label={getString('cv.verifyStep.shouldFailWhenNoAnalysisForMetrics')}
      />

      {isFilterFromCDEnabled && (
        <>
          <FormInput.CheckBox
            name="spec.spec.shouldUseCDNodes"
            label={getString('cv.verifyStep.shouldUseCDNodesLabel')}
          />

          <Text
            icon="info-messaging"
            font={{ variation: FontVariation.BODY }}
            color={Color.GREY_700}
            className={styles.nodeFilterStyle}
            margin={{ bottom: 'large' }}
          >
            {getString('cv.verifyStep.shouldUseCDNodesDescription')}
          </Text>
        </>
      )}

      {canShowRegexFields && (
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
              tooltipProps={{ dataTooltipId: 'controlNodeRegexFilterInput' }}
              name="spec.spec.controlNodeRegExPattern"
              placeholder={getString('cv.verifyStep.controlNodePlaceholder')}
              multiTextInputProps={{ expressions, allowableTypes }}
            />
          </div>

          <div className={stepCss.formGroup}>
            <FormInput.MultiTextInput
              label={getString('cv.verifyStep.testNodeLabel')}
              tooltipProps={{ dataTooltipId: 'testNodeRegexFilterInput' }}
              name="spec.spec.testNodeRegExPattern"
              placeholder={getString('cv.verifyStep.testNodePlaceholder')}
              multiTextInputProps={{ expressions, allowableTypes }}
            />
          </div>
        </>
      )}
    </>
  )
}
