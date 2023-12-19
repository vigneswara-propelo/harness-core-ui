/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty } from 'lodash-es'
import { connect, FormikProps } from 'formik'
import cx from 'classnames'
import { AllowedTypes, MultiTypeInputType } from '@harness/uicore'

import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import { StringsMap } from 'stringTypes'
import { isValueRuntimeInput } from '@common/utils/utils'
import MultiTypeMapInputSet from '@modules/70-pipeline/components/InputSetView/MultiTypeMapInputSet/MultiTypeMapInputSet'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { AwsCDKRollBackStepInitialValues } from '@pipeline/utils/types'
import { getHasValuesAsRuntimeInputFromTemplate } from '@pipeline/utils/CIUtils'

import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface AwsCDKRollBackStepInputSetProps {
  initialValues: AwsCDKRollBackStepInitialValues
  allowableTypes: AllowedTypes
  inputSetData: {
    allValues?: AwsCDKRollBackStepInitialValues
    template?: AwsCDKRollBackStepInitialValues
    path?: string
    readonly?: boolean
  }
  formik?: FormikProps<PipelineInfoConfig>
}

function AwsCDKRollBackStepInputSet(props: AwsCDKRollBackStepInputSetProps): React.ReactElement {
  const { inputSetData, allowableTypes, formik } = props
  const { template, path, readonly } = inputSetData

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const prefix = isEmpty(path) ? '' : `${path}.`

  const renderMultiTypeMapInputSet = ({
    fieldName,
    fieldLabel,
    restrictToSingleEntry,
    appliedInputSetValue,
    templateFieldName,
    keyValuePlaceholders
  }: {
    fieldName: string
    fieldLabel: keyof StringsMap
    restrictToSingleEntry?: boolean
    appliedInputSetValue?: { [key: string]: string }
    templateFieldName?: string
    keyValuePlaceholders?: Array<string>
  }): React.ReactElement => (
    <div className={cx(stepCss.formGroup, stepCss.md)}>
      <MultiTypeMapInputSet
        name={fieldName}
        valueMultiTextInputProps={{
          allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
          expressions,
          newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
        }}
        multiTypeFieldSelectorProps={{
          label: getString('optionalField', { name: getString(fieldLabel) }),
          allowedTypes: [MultiTypeInputType.FIXED]
        }}
        disabled={readonly}
        formik={formik}
        restrictToSingleEntry={restrictToSingleEntry}
        appliedInputSetValue={appliedInputSetValue}
        hasValuesAsRuntimeInput={getHasValuesAsRuntimeInputFromTemplate({ template, templateFieldName })}
        keyValuePlaceholders={keyValuePlaceholders}
        configureOptionsProps={{ hideExecutionTimeField: true }}
      />
    </div>
  )

  return (
    <>
      {isValueRuntimeInput(get(template, `timeout`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            name={`${prefix}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly,
              width: 416.5,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            disabled={readonly}
          />
        </div>
      )}
      {isValueRuntimeInput(get(template, `spec.provisionerIdentifier`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.provisionerIdentifier`}
            label={getString('pipelineSteps.provisionerIdentifier')}
            placeholder={getString('pipelineSteps.provisionerIdentifier')}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            fieldPath={`spec.provisionerIdentifier`}
            template={template}
          />
        </div>
      )}
      {!isEmpty(get(template, `spec.envVariables`)) &&
        renderMultiTypeMapInputSet({
          fieldName: `${prefix}spec.envVariables`,
          fieldLabel: 'environmentVariables',
          templateFieldName: 'spec.envVariables',
          appliedInputSetValue: get(formik?.values, `${prefix}spec.envVariables`)
        })}
    </>
  )
}

export const AwsCDKRollBackStepInputSetMode = connect(AwsCDKRollBackStepInputSet)
