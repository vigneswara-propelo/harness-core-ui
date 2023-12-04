/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { cloneDeep, get, set } from 'lodash-es'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { FlagConfigurationStepFormDataValues } from '../../types'
import { CFPipelineInstructionType } from '../../types'
import FlagChangesForm, { allSubSections, FlagChangesFormProps } from '../FlagChangesForm'
import SubSection, { SubSectionProps } from '../SubSection'
import FlagChangesContextProvider from '../../FlagChangesContextProvider'

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
        <FlagChangesContextProvider
          flag={get(initialValues, 'spec.feature')}
          environmentIdentifier={get(initialValues, 'spec.environment')}
          initialInstructions={get(initialValues, 'spec.instructions')}
          mode={StepViewType.Edit}
        >
          <FlagChangesForm prefixPath="prefix" {...props} />
        </FlagChangesContextProvider>
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
    const initialInstructions = [
      { identifier: 'test1', type: CFPipelineInstructionType.SET_FEATURE_FLAG_STATE, spec: { state: 'on' } },
      { identifier: 'test2', type: CFPipelineInstructionType.SET_DEFAULT_ON_VARIATION, spec: { variation: 'var1' } },
      { identifier: 'test3', type: CFPipelineInstructionType.SET_DEFAULT_OFF_VARIATION, spec: { variation: 'var2' } },
      {
        identifier: 'test4',
        type: CFPipelineInstructionType.ADD_TARGETS_TO_VARIATION_TARGET_MAP,
        spec: { variation: 'var2', targets: ['t1', 't2'] }
      },
      {
        identifier: 'test5',
        type: CFPipelineInstructionType.ADD_SEGMENT_TO_VARIATION_TARGET_MAP,
        spec: { variation: 'var2', segments: ['tg1', 'tg2'] }
      },
      {
        identifier: 'test6',
        type: CFPipelineInstructionType.ADD_RULE,
        spec: {
          distribution: {
            variations: [
              { variation: 'var1', weight: 50 },
              { variation: 'var2', weight: 50 }
            ],
            clauses: [{ values: ['tg1'] }]
          }
        }
      }
    ]

    const initialValues = cloneDeep(mockInitialValues)
    set(initialValues, 'spec.instructions', initialInstructions)

    renderComponent(undefined, initialValues)

    expect(await screen.findAllByTestId('flag-changes-subsection')).toHaveLength(initialInstructions.length)
  })
})
