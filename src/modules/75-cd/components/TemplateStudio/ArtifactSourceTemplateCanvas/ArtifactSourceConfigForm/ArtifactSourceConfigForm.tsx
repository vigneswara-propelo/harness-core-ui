/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, noop } from 'lodash-es'
import { FormikProps } from 'formik'
import { Container, Formik } from '@harness/uicore'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { useStrings } from 'framework/strings'
import type {
  ArtifactSourceConfigDetails,
  ArtifactSourceConfigFormData
} from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/types'
import { getValidationSchema } from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/ArtifactSourceConfigForm/ArtifactSourceConfigFormUtils'
import { ArtifactSourceSpecificationsWithRef } from './ArtifactSourceSpecifications'
import css from './ArtifactSourceConfigForm.module.scss'

export interface ArtifactSourceConfigFormProps {
  artifactSourceConfigInitialValues: ArtifactSourceConfigDetails
  updateTemplate: (data: ArtifactSourceConfigFormData) => void
}

function ArtifactSourceConfigForm(props: ArtifactSourceConfigFormProps, formikRef: TemplateFormRef): JSX.Element {
  const { artifactSourceConfigInitialValues, updateTemplate } = props
  const artifactSourceConfigFormRef = React.useRef<FormikProps<ArtifactSourceConfigFormData> | null>()
  const artifactDetailsFormRef = React.useRef<any | null>()
  const { getString } = useStrings()

  const getArtifactSourceConfigInitialValues = (): ArtifactSourceConfigFormData => {
    return {
      artifactType: artifactSourceConfigInitialValues?.type,
      artifactConfig: { spec: artifactSourceConfigInitialValues?.spec },
      connectorId: artifactSourceConfigInitialValues?.spec?.connectorRef
    }
  }

  /* istanbul ignore next */ React.useImperativeHandle(formikRef, () => ({
    resetForm() {
      artifactSourceConfigFormRef?.current?.resetForm()
      artifactDetailsFormRef?.current?.resetForm()
    },
    async submitForm() {
      await artifactSourceConfigFormRef?.current?.submitForm()
      await artifactDetailsFormRef?.current?.submitForm()
    },
    getErrors() {
      return {
        ...defaultTo(artifactSourceConfigFormRef?.current?.errors, {}),
        ...defaultTo(artifactDetailsFormRef?.current?.errors, {})
      }
    }
  }))

  return (
    <Container className={css.artifactSourceConfigFormContainer}>
      <Formik
        formName="ArtifactSourceConfigForm"
        onSubmit={noop}
        initialValues={getArtifactSourceConfigInitialValues()}
        validationSchema={getValidationSchema(getString)}
        validate={updateTemplate}
      >
        {formik => {
          artifactSourceConfigFormRef.current = formik
          return (
            <ArtifactSourceSpecificationsWithRef
              ref={artifactDetailsFormRef}
              formik={formik}
              updateTemplate={updateTemplate}
            />
          )
        }}
      </Formik>
    </Container>
  )
}

export const ArtifactSourceConfigFormWithRef = React.forwardRef(ArtifactSourceConfigForm)
