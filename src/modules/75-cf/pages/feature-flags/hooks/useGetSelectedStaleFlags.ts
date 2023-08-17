/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useFormikContext } from 'formik'
import { useMemo } from 'react'

export function useGetSelectedStaleFlags(): string[] {
  const { values } = useFormikContext<{ staleFlags: Record<string, boolean> }>()
  const flatValues = JSON.stringify(values.staleFlags)

  return useMemo<string[]>(
    () =>
      Object.entries(values.staleFlags)
        .filter(([, selected]) => selected)
        .map(([key]) => key),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [flatValues]
  )
}
