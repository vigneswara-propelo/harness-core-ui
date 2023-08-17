/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, FormEvent, useCallback } from 'react'
import { useFormikContext } from 'formik'
import { Checkbox } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useGetSelectedStaleFlags } from '../../hooks/useGetSelectedStaleFlags'

const StaleFlagsSelectAll: FC = () => {
  const { getString } = useStrings()
  const selectedStaleFlags = useGetSelectedStaleFlags()
  const { setFieldValue, values } = useFormikContext<{ staleFlags: Record<string, boolean> }>()

  const flatValues = JSON.stringify(values)
  const flagsCount = Object.keys(values.staleFlags).length

  const onChange = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      Object.keys(values.staleFlags).forEach(flagIdentifier => {
        setFieldValue(`staleFlags.${flagIdentifier}`, e.currentTarget.checked)
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setFieldValue, flatValues]
  )

  return (
    <Checkbox
      onChange={onChange}
      data-testid="selectAllStale"
      aria-label={getString('cf.staleFlagAction.checkAllStaleFlags')}
      indeterminate={selectedStaleFlags.length > 0 && selectedStaleFlags.length < flagsCount}
      checked={selectedStaleFlags.length === flagsCount}
    />
  )
}

export default StaleFlagsSelectAll
