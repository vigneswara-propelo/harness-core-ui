/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import { DowntimeForm, DowntimeFormFields } from '../../CVCreateDowntime.types'
import { CreateDowntimeSteps } from './CreateDowntimeForm.types'

export const isFormDataValid = (
  formikProps: FormikProps<DowntimeForm>,
  selectedTabId: CreateDowntimeSteps
): boolean => {
  switch (selectedTabId) {
    case CreateDowntimeSteps.DEFINE_DOWNTIME:
      return validateDefineDowntimeSection(formikProps)
    default:
      return false
  }
}

export const validateDefineDowntimeSection = (formikProps: FormikProps<DowntimeForm>): boolean => {
  formikProps.setFieldTouched(DowntimeFormFields.NAME, true)
  formikProps.setFieldTouched(DowntimeFormFields.IDENTIFIER, true)
  formikProps.setFieldTouched(DowntimeFormFields.CATEGORY, true)

  const isNameValid = /^[0-9a-zA-Z-_\s]+$/.test(formikProps.values['name'])
  const { name, identifier, category } = formikProps.values
  if (!name || isEmpty(identifier) || isEmpty(category) || !isNameValid) {
    return false
  }
  return true
}

export const getErrorMessageByTabId = (
  formikProps: FormikProps<DowntimeForm>,
  selectedTabId: CreateDowntimeSteps
): string[] => {
  switch (selectedTabId) {
    case CreateDowntimeSteps.DEFINE_DOWNTIME:
      return errorDefineSLOSection(formikProps.errors)
    default:
      return []
  }
}

const errorDefineSLOSection = (errors: FormikProps<DowntimeForm>['errors']) => {
  const { name, identifier, category } = errors
  return [name, identifier, category].filter(item => Boolean(item)) as string[]
}
