/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Formik from 'formik'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import CustomMetricSideNav from '../components/CustomMetricSideNav'
import { formikValuesMock } from './CustomMetric.utils.mock'

jest.mock(
  '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav',
  () =>
    ({ onSelect }: { onSelect: (name: string) => void }) => {
      return (
        <>
          <button data-testid="invalidMetricSelect" onClick={() => onSelect('1234')}>
            invalid metric
          </button>
          <button data-testid="validMetricSelect" onClick={() => onSelect('cw-metric-4')}>
            valid metric
          </button>
        </>
      )
    }
)

describe('AppDIgnoreThresholdTabContent', () => {
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')

  const setFieldValueMock = jest.fn()
  const onAddMock = jest.fn()
  const onDeleteMock = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useFormikContextMock.mockReturnValue({
      isValid: true,
      setFieldValue: setFieldValueMock,
      values: formikValuesMock
    } as unknown as any)
  })

  test('should render the component', async () => {
    const { container } = render(
      <TestWrapper>
        <Formik.Formik initialValues={formikValuesMock} onSubmit={() => Promise.resolve()}>
          <CustomMetricSideNav onAddMetric={onAddMock} onDeleteMetric={onDeleteMock} />
        </Formik.Formik>
      </TestWrapper>
    )

    screen.debug(container)

    await userEvent.click(screen.getByTestId('invalidMetricSelect'))

    expect(setFieldValueMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByTestId('validMetricSelect'))

    expect(setFieldValueMock).toHaveBeenCalled()
  })
})
