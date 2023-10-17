/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from 'formik'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import FlagChanges, { FlagChangesProps } from '../FlagChanges'

jest.mock('../FlagChangesForm', () => ({
  __esModule: true,
  default: () => <span data-testid="flag-changes-form" />
}))

const renderComponent = (
  initialFormValues: Record<string, unknown> = {},
  props: Partial<FlagChangesProps> = {}
): RenderResult =>
  render(
    <TestWrapper>
      <Formik initialValues={initialFormValues} onSubmit={jest.fn()}>
        <FlagChanges {...props} />
      </Formik>
    </TestWrapper>
  )

describe('FlagChanges', () => {
  test('it should display the form if the flag and environment are selected', async () => {
    renderComponent({ spec: { environment: 'env123', feature: 'feat123' } })

    expect(screen.queryByText('cf.pipeline.flagConfiguration.pleaseSelectAFeatureFlag')).not.toBeInTheDocument()
    expect(screen.getByTestId('flag-changes-form')).toBeInTheDocument()
  })
})
