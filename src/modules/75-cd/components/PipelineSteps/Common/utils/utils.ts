/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as Yup from 'yup'
import { StringsMap } from 'stringTypes'
import { Connectors } from '@platform/connectors/constants'

export const serverlessStepAllowedConnectorTypes = [Connectors.GCP, Connectors.AWS, Connectors.DOCKER]

export const getEnvirontmentVariableValidationSchema = (
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
): Yup.NotRequiredArraySchema<Yup.Shape<object | undefined, { key: string }>> => {
  return Yup.array().of(
    Yup.object().shape({
      key: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString('keyLabel') }))
    })
  )
}
