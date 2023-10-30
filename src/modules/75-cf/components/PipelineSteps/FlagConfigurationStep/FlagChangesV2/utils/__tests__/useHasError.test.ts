/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import * as Formik from 'formik'
import { useHasError } from '../useHasError'

describe('useHasError', () => {
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')

  beforeEach(() => {
    jest.clearAllMocks()
    useFormikContextMock.mockReturnValue({ errors: {}, touched: {}, submitCount: 0 } as any)
  })

  test('it should return false when the field does not have an error', async () => {
    const output = renderHook(() => useHasError('my.field'))

    expect(output.result.current).toBeFalsy()
  })

  test('it should return false when the field has an error, but the form has not been submitted or touched', async () => {
    useFormikContextMock.mockReturnValue({
      errors: { my: { field: 'SOME ERROR' } },
      submitCount: 0,
      touched: {}
    } as any)
    const output = renderHook(() => useHasError('my.field'))

    expect(output.result.current).toBeFalsy()
  })

  test('it should return true when the field has an error and the form has been submitted', async () => {
    useFormikContextMock.mockReturnValue({
      errors: { my: { field: 'SOME ERROR' } },
      submitCount: 1,
      touched: {}
    } as any)
    const output = renderHook(() => useHasError('my.field'))

    expect(output.result.current).toBeTruthy()
  })

  test('it should return true when the field has an error and the field has been touched', async () => {
    useFormikContextMock.mockReturnValue({
      errors: { my: { field: 'SOME ERROR' } },
      submitCount: 0,
      touched: { my: { field: true } }
    } as any)
    const output = renderHook(() => useHasError('my.field'))

    expect(output.result.current).toBeTruthy()
  })
})
