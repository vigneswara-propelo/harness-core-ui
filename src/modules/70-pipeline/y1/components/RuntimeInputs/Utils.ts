/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import { UseStringsReturn } from 'framework/strings'
import { Validation } from '@common/components/ConfigureOptions/ConfigureOptionsUtils'
import { RuntimeInput } from '../InputsForm/types'

export const DEFAULT_RUNTIME_INPUT = {
  name: '',
  type: 'string',
  selected: false,
  validator: {
    validation: Validation.None,
    allowed: []
  }
}

export const getValidationTypeFromValidator = (validator: RuntimeInput['validator']): Validation => {
  if (validator?.allowed && validator.allowed.length > 0) return Validation.AllowedValues
  if (validator?.regex && validator.regex.length > 0) return Validation.Regex
  return Validation.None
}

export const getValidatorSchema = (getString: UseStringsReturn['getString']): Yup.ObjectSchema => {
  return Yup.object().shape({
    validation: Yup.string().required(),
    regex: Yup.string().when('validation', {
      is: Validation.Regex,
      then: Yup.string()
        .trim()
        .test({
          test(val: string): boolean | Yup.ValidationError {
            if (isEmpty(val)) {
              return this.createError({
                message: getString('common.configureOptions.validationErrors.regExIsRequired')
              })
            }
            let isValid = true
            try {
              val?.length > 0 && new RegExp(val)
            } catch (_e) {
              isValid = false
            }
            if (!isValid) {
              return this.createError({
                message: getString('common.configureOptions.validationErrors.regExNotValid')
              })
            }
            return true
          }
        })
    }),
    allowed: Yup.array(Yup.string()).when('validation', {
      is: Validation.AllowedValues,
      then: Yup.array(Yup.string()).min(1, getString('common.configureOptions.validationErrors.minOneAllowedValue'))
    })
  })
}

export const getDefaultSchema = (getString: UseStringsReturn['getString']): Yup.StringSchema => {
  return Yup.string()
    .trim()
    .when('validator.validation', {
      is: Validation.Regex,
      then: Yup.string()
        .trim()
        .test(
          'matchesRegex',
          getString('common.configureOptions.validationErrors.defaultRegExValid'),
          function (value) {
            try {
              const regex = new RegExp(this.parent.validator.regex)
              if (!regex.test(value)) {
                return this.createError({
                  message: getString('common.configureOptions.validationErrors.defaultRegExValid')
                })
              }
            } catch (_e) {
              // Do nothing
            }
            return true
          }
        )
    })
    .when('validator.validation', {
      is: Validation.AllowedValues,
      then: Yup.string().test(
        'isAllowedValue',
        getString('common.configureOptions.validationErrors.defaultAllowedValid'),
        function (value) {
          return this.parent.validator.allowed.includes(value)
        }
      )
    })
}
