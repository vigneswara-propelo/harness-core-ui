/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty } from 'lodash-es'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { AllowedTypes, MultiTypeInputType } from '@harness/uicore'

import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'framework/strings/StringsContext'
import { isValueRuntimeInput } from '@common/utils/utils'
import { MultiTypeListInputSet } from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { AwsSamBuildStepInitialValues, AwsSamDeployStepInitialValues } from '@pipeline/utils/types'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import { AwsSamServerlessStepCommonOptionalFieldsInputSet } from '../Common/AwsSamServerlessStepCommonOptionalFields/AwsSamServerlessStepCommonOptionalFieldsInputSet'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AwsSamBuildDeployStepInitialValues = AwsSamBuildStepInitialValues | AwsSamDeployStepInitialValues

interface AwsSamBuildDeployStepOptionalFieldsInputSetProps {
  initialValues: AwsSamBuildDeployStepInitialValues
  allowableTypes: AllowedTypes
  inputSetData: {
    allValues?: AwsSamBuildDeployStepInitialValues
    template?: AwsSamBuildDeployStepInitialValues
    path?: string
    readonly?: boolean
  }
  formik?: FormikProps<PipelineInfoConfig>
  isAwsSamBuildStep?: boolean
}

export function AwsSamBuildDeployStepOptionalFieldsInputSet(
  props: AwsSamBuildDeployStepOptionalFieldsInputSetProps
): React.ReactElement {
  const { inputSetData, allowableTypes, formik, isAwsSamBuildStep } = props
  const { template, path, readonly } = inputSetData

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const prefix = isEmpty(path) ? '' : `${path}.`

  const renderMultiTypeListInputSet = ({
    fieldName,
    fieldLabel
  }: {
    fieldName: string
    fieldLabel: keyof StringsMap
  }): React.ReactElement => (
    <div className={cx(stepCss.formGroup, stepCss.md)}>
      <MultiTypeListInputSet
        name={fieldName}
        multiTextInputProps={{
          expressions,
          allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
          newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
        }}
        formik={formik}
        multiTypeFieldSelectorProps={{
          label: getString('optionalField', { name: getString(fieldLabel) }),
          allowedTypes: [MultiTypeInputType.FIXED]
        }}
        disabled={readonly}
      />
    </div>
  )

  return (
    <>
      {isValueRuntimeInput(
        get(template, isAwsSamBuildStep ? `spec.buildCommandOptions` : `spec.deployCommandOptions`)
      ) &&
        renderMultiTypeListInputSet({
          fieldName: isAwsSamBuildStep ? `${prefix}spec.buildCommandOptions` : `${prefix}spec.deployCommandOptions`,
          fieldLabel: isAwsSamBuildStep
            ? 'cd.steps.awsSamBuildStep.awsSamBuildCommandOptions'
            : 'cd.steps.awsSamDeployStep.awsSamDeployCommandOptions'
        })}

      <AwsSamServerlessStepCommonOptionalFieldsInputSet
        inputSetData={inputSetData}
        allowableTypes={allowableTypes}
        formik={formik}
      />
    </>
  )
}
