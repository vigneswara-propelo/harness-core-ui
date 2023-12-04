/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik } from 'formik'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import FlagChangesContextProvider, { FlagChangesContextProviderProps } from '../../FlagChangesContextProvider'
import FlagChanges, { FlagChangesProps } from '../FlagChanges'

jest.mock('../FlagChangesForm', () => ({
  __esModule: true,
  default: () => <span data-testid="flag-changes-form" />
}))

const renderComponent = (
  initialFormValues: Record<string, unknown> = {},
  props: Partial<FlagChangesProps> = {},
  flagChangesProviderProps: Partial<FlagChangesContextProviderProps> = {}
): RenderResult =>
  render(
    <TestWrapper>
      <Formik initialValues={initialFormValues} onSubmit={jest.fn()}>
        <FlagChangesContextProvider
          flag={mockFeature}
          environmentIdentifier="env123"
          mode={StepViewType.Edit}
          {...flagChangesProviderProps}
        >
          <FlagChanges {...props} />
        </FlagChangesContextProvider>
      </Formik>
    </TestWrapper>
  )

describe('FlagChanges', () => {
  test('it should display the form if the flag and environment are selected', async () => {
    renderComponent({ spec: { environment: 'env123', feature: 'feat123' } })

    expect(screen.queryByText('cf.pipeline.flagConfiguration.pleaseSelectAFeatureFlag')).not.toBeInTheDocument()
    expect(screen.getByTestId('flag-changes-form')).toBeInTheDocument()
  })

  test('it should display the type selector when in edit mode and default to fixed', async () => {
    renderComponent(undefined, undefined, { mode: StepViewType.Edit })

    expect(await screen.findByRole('button')).toContainElement(document.querySelector('.icon.fixed'))
  })

  test('it should switch to runtime when selected', async () => {
    renderComponent(undefined, undefined, { mode: StepViewType.Edit })

    const typeBtn = await screen.findByRole('button')
    expect(screen.queryByText('cf.pipeline.flagConfiguration.flagChangesV2Runtime')).not.toBeInTheDocument()

    await userEvent.click(typeBtn)
    await userEvent.click(await screen.findByText('Runtime input'))

    expect(typeBtn).toContainElement(document.querySelector('.icon.runtime'))
    expect(await screen.findByText('cf.pipeline.flagConfiguration.flagChangesV2Runtime')).toBeInTheDocument()
  })

  test('it should default to runtime if the initial instructions are set as runtime', async () => {
    renderComponent(undefined, undefined, { mode: StepViewType.Edit, initialInstructions: RUNTIME_INPUT_VALUE })

    expect(await screen.findByRole('button')).toContainElement(document.querySelector('.icon.runtime'))
  })

  test('it should switch to fixed when selected', async () => {
    renderComponent(undefined, undefined, { mode: StepViewType.Edit, initialInstructions: RUNTIME_INPUT_VALUE })

    const typeBtn = await screen.findByRole('button')
    expect(await screen.findByText('cf.pipeline.flagConfiguration.flagChangesV2Runtime')).toBeInTheDocument()

    await userEvent.click(typeBtn)
    await userEvent.click(await screen.findByText('Fixed value'))

    expect(typeBtn).toContainElement(document.querySelector('.icon.fixed'))
    expect(screen.queryByText('cf.pipeline.flagConfiguration.flagChangesV2Runtime')).not.toBeInTheDocument()
  })

  test('it should not show the type selector when not in the edit mode', async () => {
    renderComponent(undefined, undefined, { mode: StepViewType.DeploymentForm })

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
