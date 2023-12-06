/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import cx from 'classnames'
import { FieldArray, FormikContextType } from 'formik'
import { get, isArray } from 'lodash-es'
import React from 'react'
import { FormInput, Layout } from '@harness/uicore'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import { isValueRuntimeInput } from '@common/utils/utils'
import { TextFieldInputSetView } from '@modules/70-pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import MultiTypeFieldSelector from '@modules/10-common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { CookieCutterStepData, CookieCutterStepEditProps } from './CookieCutterStepEdit'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './CookieCutterStep.module.scss'

export default function CookieCutterStepInputSet(
  props: CookieCutterStepEditProps & { formik?: FormikContextType<CookieCutterStepData> }
): React.ReactElement {
  const { template, path, readonly, stepViewType, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <>
      {isValueRuntimeInput(get(template, 'spec.publicTemplateUrl')) && (
        <TextFieldInputSetView
          name={`${path}.spec.publicTemplateUrl`}
          label={getString('idp.cookieCutterStep.cookieCutterTemplateURL')}
          disabled={readonly}
          multiTextInputProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          placeholder={getString('idp.cookieCutterStep.cookieCutterTemplateURLDesc')}
          fieldPath="spec.publicTemplateUrl"
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {isArray(template?.spec?.cookieCutterVariables) && template?.spec?.cookieCutterVariables ? (
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.cookieCutterVariables"
            label={getString('idp.cookieCutterStep.configureTemplate')}
            defaultValueToReset={[]}
            disableTypeSelection
            isOptional={false}
          >
            <FieldArray
              name="spec.cookieCutterVariables"
              render={() => {
                return (
                  <div className={css.panel}>
                    <div className={css.cookieCutterVarHeader}>
                      <span className={css.label}>{getString('keyLabel')}</span>
                      <span className={css.label}>{getString('valueLabel')}</span>
                    </div>
                    {template.spec.cookieCutterVariables?.map((val, idx: number) => {
                      return (
                        <Layout.Horizontal key={val.key} spacing="medium">
                          <FormInput.Text
                            name={`spec.cookieCutterVariables[${idx}].name`}
                            placeholder={getString('name')}
                            disabled={readonly}
                          />

                          <FormInput.MultiTextInput
                            name={`spec.cookieCutterVariables[${idx}].value`}
                            placeholder={getString('valueLabel')}
                            multiTextInputProps={{
                              allowableTypes,
                              expressions,
                              disabled: readonly
                            }}
                            label=""
                            disabled={readonly}
                          />
                        </Layout.Horizontal>
                      )
                    })}
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
      ) : null}

      {isValueRuntimeInput(get(template, 'spec.outputDirectory')) && (
        <TextFieldInputSetView
          name={`${path}.spec.outputDirectory`}
          label={getString('idp.cookieCutterStep.outputDir')}
          disabled={readonly}
          multiTextInputProps={{
            allowableTypes,
            expressions
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          placeholder={getString('idp.cookieCutterStep.outputDirPlaceHolder')}
          fieldPath="spec.outputDirectory"
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
    </>
  )
}
