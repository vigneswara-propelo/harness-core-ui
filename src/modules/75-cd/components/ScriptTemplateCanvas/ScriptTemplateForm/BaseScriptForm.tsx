/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, AllowedTypes } from '@harness/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'

import { setFormikRef, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { LocationType } from '@cd/components/PipelineSteps/CommandScripts/CommandScriptsTypes'
import { ShellScriptFormData, variableSchema } from '@cd/components/PipelineSteps/ShellScriptStep/shellScriptTypes'
import BaseScript from '@cd/components/BaseScript/BaseScript'
import { getInitialValues } from '../../PipelineSteps/ShellScriptStep/helper'

interface ShellScriptWidgetProps {
  initialValues: ShellScriptFormData
  updateTemplate?: (data: ShellScriptFormData) => void
  onChange?: (data: ShellScriptFormData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
}

export function BaseScriptForm(
  { initialValues, updateTemplate, onChange, allowableTypes }: ShellScriptWidgetProps,
  formikRef: StepFormikFowardRef
): JSX.Element {
  const { getString } = useStrings()

  const validationSchema = Yup.object().shape({
    spec: Yup.object().shape({
      shell: Yup.string().trim().required(getString('validation.scriptTypeRequired')),
      source: Yup.object().shape({
        spec: Yup.object()
          .when(['type'], {
            is: type => {
              return type === LocationType.INLINE
            },
            then: Yup.object().shape({
              script: Yup.string().trim().required(getString('common.scriptRequired'))
            })
          })
          .when(['type'], {
            is: type => {
              return type === LocationType.HARNESS
            },
            then: Yup.object().shape({
              file: Yup.string()
                .trim()
                .required(getString('fieldRequired', { field: getString('common.git.filePath') }))
            })
          })
      }),
      environmentVariables: variableSchema(getString),
      outputVariables: variableSchema(getString)
    })
  })

  return (
    <Formik<ShellScriptFormData>
      onSubmit={/* istanbul ignore next */ submit => updateTemplate?.(submit)}
      validate={formValues => {
        onChange?.(formValues)
      }}
      formName="shellScriptForm"
      initialValues={getInitialValues(initialValues)}
      validationSchema={validationSchema}
    >
      {(formik: FormikProps<ShellScriptFormData>) => {
        setFormikRef(formikRef, formik)

        return <BaseScript formik={formik} readonly={false} allowableTypes={allowableTypes} />
      }}
    </Formik>
  )
}

export const BaseScriptWithRef = React.forwardRef(BaseScriptForm)
