/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormikProps } from 'formik'
import { get, isEmpty } from 'lodash-es'
import cx from 'classnames'
import { AllowedTypes, MultiTypeInputType } from '@harness/uicore'

import { StringsMap } from 'stringTypes'
import { useStrings } from 'framework/strings'
import { PipelineInfoConfig } from 'services/pipeline-ng'
import { isValueRuntimeInput } from '@common/utils/utils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { getImagePullPolicyOptions } from '@common/utils/ContainerRunStepUtils'
import MultiTypeMapInputSet from '@modules/70-pipeline/components/InputSetView/MultiTypeMapInputSet/MultiTypeMapInputSet'
import { getHasValuesAsRuntimeInputFromTemplate } from '@pipeline/utils/CIUtils'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { SelectInputSetView } from '@pipeline/components/InputSetView/SelectInputSetView/SelectInputSetView'
import type {
  AwsSamBuildStepInitialValues,
  AwsSamDeployStepInitialValues,
  ServerlessAwsLambdaPrepareRollbackV2StepInitialValues
} from '@pipeline/utils/types'
import { useFeatureFlags } from '@modules/10-common/hooks/useFeatureFlag'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export type AwsSamServerlessStepInitialValues =
  | AwsSamBuildStepInitialValues
  | AwsSamDeployStepInitialValues
  | ServerlessAwsLambdaPrepareRollbackV2StepInitialValues

interface AwsSamServerlessStepCommonOptionalFieldsInputSetProps {
  allowableTypes: AllowedTypes
  inputSetData: {
    allValues?: AwsSamServerlessStepInitialValues
    template?: AwsSamServerlessStepInitialValues
    path?: string
    readonly?: boolean
  }
  formik?: FormikProps<PipelineInfoConfig>
}

export function AwsSamServerlessStepCommonOptionalFieldsInputSet(
  props: AwsSamServerlessStepCommonOptionalFieldsInputSetProps
): React.ReactElement {
  const { inputSetData, allowableTypes, formik } = props
  const { template, path, readonly } = inputSetData

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { NG_EXPRESSIONS_NEW_INPUT_ELEMENT } = useFeatureFlags()

  const prefix = isEmpty(path) ? '' : `${path}.`

  const renderMultiTypeMapInputSet = ({
    fieldName,
    fieldLabel,
    keyLabel,
    valueLabel,
    restrictToSingleEntry,
    appliedInputSetValue,
    templateFieldName,
    keyValuePlaceholders
  }: {
    fieldName: string
    fieldLabel: keyof StringsMap
    keyLabel?: keyof StringsMap
    valueLabel?: keyof StringsMap
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
        keyLabel={keyLabel ? getString(keyLabel) : ''}
        valueLabel={valueLabel ? getString(valueLabel) : ''}
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
      {isValueRuntimeInput(get(template, `spec.privileged`)) && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.privileged`}
            label={getString('optionalField', { name: getString('pipeline.buildInfra.privileged') })}
            multiTypeTextbox={{
              expressions,
              allowableTypes,
              disabled: readonly,
              width: 416.5,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            tooltipProps={{ dataTooltipId: 'privileged' }}
            disabled={readonly}
          />
        </div>
      )}

      {isValueRuntimeInput(get(template, `spec.imagePullPolicy`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <SelectInputSetView
            name={`${prefix}spec.imagePullPolicy`}
            label={getString('optionalField', { name: getString('pipelineSteps.pullLabel') })}
            selectItems={getImagePullPolicyOptions(getString)}
            placeholder={getString('select')}
            disabled={readonly}
            useValue={true}
            multiTypeInputProps={{
              expressions,
              allowableTypes,
              selectProps: { addClearBtn: true, items: getImagePullPolicyOptions(getString) },
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            template={template}
            fieldPath={`spec.imagePullPolicy`}
          />
        </div>
      )}

      {isValueRuntimeInput(get(template, `spec.runAsUser`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.runAsUser`}
            label={getString('optionalField', { name: getString('pipeline.stepCommonFields.runAsUser') })}
            placeholder="1000"
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            fieldPath={`spec.runAsUser`}
            template={template}
          />
        </div>
      )}

      {isValueRuntimeInput(get(template, `spec.resources.limits.memory`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.resources.limits.memory`}
            label={getString('optionalField', { name: getString('pipelineSteps.limitMemoryLabel') })}
            placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitMemoryLabel') })}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            fieldPath={`spec.resources.limits.memory`}
            template={template}
          />
        </div>
      )}

      {isValueRuntimeInput(get(template, `spec.resources.limits.cpu`)) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            name={`${prefix}spec.resources.limits.cpu`}
            label={getString('optionalField', { name: getString('pipelineSteps.limitCPULabel') })}
            placeholder={getString('common.enterPlaceholder', { name: getString('pipelineSteps.limitCPULabel') })}
            disabled={readonly}
            multiTextInputProps={{
              expressions,
              allowableTypes,
              newExpressionComponent: NG_EXPRESSIONS_NEW_INPUT_ELEMENT
            }}
            fieldPath={`spec.resources.limits.cpu`}
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
