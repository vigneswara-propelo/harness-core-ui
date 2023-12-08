/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FormInput, MultiTypeInputType } from '@harness/uicore'
import { FormikContextType, useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormValues, Validation } from '@common/components/ConfigureOptions/ConfigureOptionsUtils'
import AllowedValuesFields from '@common/components/ConfigureOptions/AllowedValuesField'
import { usePipelineContextY1 } from '../../PipelineContext/PipelineContextY1'
import { RuntimeInputsFormData } from '../RuntimeInputList'
import { RuntimeInputType } from './utils'
import css from './AddEditRuntimeInputs.module.scss'

export default function OptionalConfiguration({ index }: { index: number }): JSX.Element {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const formik = useFormikContext<RuntimeInputsFormData>()
  const {
    values: { inputs },
    setFieldValue
  } = formik

  const { isReadonly } = usePipelineContextY1()

  return (
    <>
      <FormInput.CheckBox
        label={getString('common.configureOptions.askDuringExecution')}
        name={`inputs[${index}].runtime`}
      />
      {inputs[index]?.type !== RuntimeInputType.object ? (
        <>
          <div className={css.validationOptions}>
            <FormInput.RadioGroup
              name={`inputs[${index}].validator.validation`}
              label={getString('common.configureOptions.validation')}
              items={[
                { label: getString('none'), value: Validation.None },
                { label: getString('allowedValues'), value: Validation.AllowedValues },
                { label: getString('common.configureOptions.regex'), value: Validation.Regex }
              ]}
              disabled={isReadonly}
              radioGroup={{ inline: true }}
            />

            {inputs[index]?.validator?.validation === Validation.AllowedValues ? (
              <AllowedValuesFields
                name={`inputs[${index}].validator.allowed`}
                isReadonly={isReadonly}
                variableType={inputs[index]?.type}
                formik={formik as unknown as FormikContextType<FormValues>}
                onChange={values => {
                  setFieldValue(`inputs[${index}].validator.allowed`, values)
                }}
              />
            ) : null}
            {inputs[index]?.validator?.validation === Validation.Regex ? (
              <FormInput.TextArea
                label={getString('common.configureOptions.regex')}
                name={`inputs[${index}].validator.regex`}
                disabled={isReadonly}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setFieldValue(`inputs[${index}].validator.regex`, event.target.value)
                }}
              />
            ) : null}
          </div>

          <FormInput.MultiTextInput
            name={`inputs[${index}].default`}
            label={getString('common.configureOptions.defaultValue')}
            isOptional
            disabled={isReadonly}
            multiTextInputProps={{
              defaultValueToReset: '',
              expressions,
              textProps: {
                type: inputs[index]?.type === RuntimeInputType.number ? 'number' : 'text'
              },
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
            }}
            data-testid="runtime-input-default-value"
          />
        </>
      ) : null}
    </>
  )
}
