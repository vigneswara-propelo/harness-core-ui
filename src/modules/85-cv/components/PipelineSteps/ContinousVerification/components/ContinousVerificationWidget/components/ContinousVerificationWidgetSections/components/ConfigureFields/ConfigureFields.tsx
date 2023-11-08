/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { FormInput, AllowedTypes } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useStrings } from 'framework/strings'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import { defaultDeploymentTag, VerificationTypes } from './constants'
import { BaselineSelect, Duration, VerificationSensitivity } from '../VerificationJobFields/VerificationJobFields'
import NodeFilteringFields from './components/NodeFilteringFields/NodeFilteringFields'
import { canShowNodeFilterOptions, isValidNodeFilteringType } from './ConfigureFields.utils'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function ConfigureFields(props: {
  formik: FormikProps<ContinousVerificationData>
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const {
    formik: { values: formValues, setFieldValue },
    formik,
    allowableTypes
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const {
    CV_UI_DISPLAY_NODE_REGEX_FILTER: isRegexNodeFilterFFEnabled,
    CV_UI_DISPLAY_SHOULD_USE_NODES_FROM_CD_CHECKBOX: isFilterFromCDEnabled,
    CV_UI_DISPLAY_FAIL_IF_ANY_CUSTOM_METRIC_IN_NO_ANALYSIS: isFailOnNoCustomMetricsAnalysisEnabled
  } = useFeatureFlags()

  useEffect(() => {
    if (!isValidNodeFilteringType(formValues?.spec?.type)) {
      setFieldValue('spec.spec.controlNodeRegExPattern', undefined)
      setFieldValue('spec.spec.testNodeRegExPattern', undefined)
      setFieldValue('spec.spec.shouldUseCDNodes', undefined)
    }
  }, [formValues?.spec?.type])

  const renderConfigOptions = (): JSX.Element => {
    switch (formValues?.spec?.type) {
      case VerificationTypes.SimpleVerification:
        return (
          <>
            <div className={stepCss.formGroup} data-testid="simpleVerification_form">
              <Duration
                name={`spec.spec.duration`}
                label={getString('duration')}
                expressions={expressions}
                formik={formik}
                allowableTypes={allowableTypes}
              />
            </div>
          </>
        )
      case VerificationTypes.LoadTest:
        return (
          <>
            <div className={stepCss.formGroup}>
              <VerificationSensitivity
                label={getString('sensitivity')}
                name={`spec.spec.sensitivity`}
                expressions={expressions}
                formik={formik}
                allowableTypes={allowableTypes}
              />
            </div>
            <div className={stepCss.formGroup}>
              <Duration
                name={`spec.spec.duration`}
                label={getString('duration')}
                expressions={expressions}
                formik={formik}
                allowableTypes={allowableTypes}
              />
            </div>
            <div className={stepCss.formGroup}>
              <BaselineSelect
                name={`spec.spec.baseline`}
                label={getString('platform.connectors.cdng.baseline')}
                expressions={expressions}
                formik={formik}
                allowableTypes={allowableTypes}
              />
            </div>
          </>
        )
      case VerificationTypes.Bluegreen:
      case VerificationTypes.Canary:
      case VerificationTypes.Rolling:
      case VerificationTypes.Auto:
        return (
          <>
            <div className={stepCss.formGroup}>
              <VerificationSensitivity
                label={getString('sensitivity')}
                name={`spec.spec.sensitivity`}
                expressions={expressions}
                formik={formik}
                allowableTypes={allowableTypes}
              />
            </div>
            <div className={stepCss.formGroup}>
              <Duration
                name={`spec.spec.duration`}
                label={getString('duration')}
                expressions={expressions}
                formik={formik}
                allowableTypes={allowableTypes}
              />
            </div>
            <div className={stepCss.formGroup}>
              {/* Note - This has to be removed for now but might be required in future, hence commenting the code */}
              {/* <TrafficSplit
                name={`spec.spec.trafficsplit`}
                label={getString('platform.connectors.cdng.trafficsplit')}
                expressions={expressions}
                formik={formik}
              /> */}
            </div>
          </>
        )
      default:
        return <></>
    }
  }

  useEffect(() => {
    const deploymentTag = formValues?.spec?.spec?.deploymentTag || defaultDeploymentTag
    const updatedSpecs = {
      spec: {
        ...formValues.spec.spec,
        deploymentTag
      }
    }
    setFieldValue('spec', { ...formValues.spec, ...updatedSpecs })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const canShowFailOnNoAnalysisCheckbox = formValues?.spec?.type !== VerificationTypes.SimpleVerification

  return (
    <>
      {renderConfigOptions()}
      <div className={stepCss.formGroup}>
        <FormInput.MultiTextInput
          label={getString('platform.connectors.cdng.artifactTag')}
          name="spec.spec.deploymentTag"
          multiTextInputProps={{ expressions, allowableTypes }}
        />
      </div>
      {canShowFailOnNoAnalysisCheckbox && (
        <div className={stepCss.formGroup}>
          <FormInput.CheckBox
            name="spec.spec.failOnNoAnalysis"
            label={getString('platform.connectors.cdng.failOnNoAnalysis')}
          />
        </div>
      )}

      {canShowNodeFilterOptions({
        analysisType: formValues?.spec?.type,
        isFilterFromCDEnabled,
        isRegexNodeFilterFFEnabled,
        isFailOnNoCustomMetricsAnalysisEnabled
      }) && <NodeFilteringFields allowableTypes={allowableTypes} />}
    </>
  )
}
