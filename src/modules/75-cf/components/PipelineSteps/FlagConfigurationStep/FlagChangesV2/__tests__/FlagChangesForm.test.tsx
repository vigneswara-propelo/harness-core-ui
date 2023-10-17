/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import type { FlagConfigurationStepFormDataValues } from '../../types'
import { FeatureFlagConfigurationInstruction } from '../../types'
import { mockSetFlagSwitchFieldValues } from '../subSections/__tests__/utils.mocks'
import FlagChangesForm, { allSubSections, FlagChangesFormProps } from '../FlagChangesForm'
import SubSection, { SubSectionProps } from '../SubSection'

const mockInitialValues = {
  identifier: 'step',
  name: 'step',
  type: 'type',
  spec: {
    feature: 'feature',
    environment: 'env',
    instructions: []
  }
}

const renderComponent = (
  props: Partial<FlagChangesFormProps> = {},
  initialValues: Partial<FlagConfigurationStepFormDataValues> = mockInitialValues
): RenderResult =>
  render(
    <TestWrapper>
      <Formik onSubmit={jest.fn()} initialValues={initialValues}>
        <FlagChangesForm prefixPath="prefix" initialInstructions={get(initialValues, 'spec.instructions')} {...props} />
      </Formik>
    </TestWrapper>
  )

const totalSubSections = allSubSections.length
jest.mock('../subSections/SetFlagSwitch/SetFlagSwitch', () => ({
  default: ({ onRemove }: SubSectionProps) => (
    <SubSection title="Sub Section" onRemove={onRemove}>
      Sub section
    </SubSection>
  ),
  __esModule: true
}))

describe('FlagChangesForm', () => {
  test('it should display the Add Flag Change button', async () => {
    renderComponent()

    expect(screen.getByRole('button', { name: 'cf.pipeline.flagConfiguration.addFlagChange' })).toBeInTheDocument()
  })

  test('it should not display the Add Flag Change button when all sub sections have been added', async () => {
    renderComponent()

    const addFlagChangeBtn = screen.getByRole('button', { name: 'cf.pipeline.flagConfiguration.addFlagChange' })

    for (let subSectionNumber = 0; subSectionNumber < totalSubSections; subSectionNumber++) {
      await userEvent.click(addFlagChangeBtn)
      await userEvent.click(document.querySelector('.bp3-menu-item')!)
    }

    expect(addFlagChangeBtn).not.toBeInTheDocument()
  })

  test('it should add new subsection when selected from Add Flag Change menu', async () => {
    renderComponent()

    const initialCount = screen.queryAllByTestId('flag-changes-subsection').length

    await userEvent.click(screen.getByRole('button', { name: 'cf.pipeline.flagConfiguration.addFlagChange' }))
    await userEvent.click(document.querySelector('.bp3-menu-item')!)

    expect(screen.getAllByTestId('flag-changes-subsection')).toHaveLength(initialCount + 1)
  })

  test('it should removed a subsection when the remove button is clicked', async () => {
    renderComponent()

    await userEvent.click(screen.getByRole('button', { name: 'cf.pipeline.flagConfiguration.addFlagChange' }))
    await userEvent.click(document.querySelector('.bp3-menu-item')!)

    const initialCount = screen.getAllByTestId('flag-changes-subsection').length

    await userEvent.click(screen.getByRole('button', { name: 'cf.pipeline.flagConfiguration.removeFlagChange' }))
    expect(screen.queryAllByTestId('flag-changes-subsection')).toHaveLength(initialCount - 1)
  })

  test('it should render with subsections when initialInstructions includes instructions', async () => {
    renderComponent({
      initialInstructions: [
        mockSetFlagSwitchFieldValues().spec?.instructions?.[0]
      ] as FeatureFlagConfigurationInstruction[]
    })

    expect(screen.getAllByTestId('flag-changes-subsection')).toHaveLength(1)
  })
})
