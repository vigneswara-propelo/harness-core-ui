/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useFormikContext } from 'formik'
import { get, isObject } from 'lodash-es'

export function useHasError(fieldName: string): boolean {
  const { errors, touched, submitCount } = useFormikContext()
  const error = get(errors, fieldName)

  return !!(error && !isObject(error) && (submitCount > 0 || get(touched, fieldName)))
}
