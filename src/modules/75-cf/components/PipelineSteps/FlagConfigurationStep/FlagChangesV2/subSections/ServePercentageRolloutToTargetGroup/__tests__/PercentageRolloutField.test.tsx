/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import MockFeature from '@cf/utils/testData/data/mockFeature'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import SubSectionTestWrapper, { SubSectionTestWrapperProps } from '../../__tests__/SubSectionTestWrapper.mock'
import PercentageRolloutField, { PercentageRolloutFieldProps } from '../PercentageRolloutField'
import * as getAllowableTypesModule from '../../../utils/getAllowableTypes'

const renderComponent = (
  props: Partial<PercentageRolloutFieldProps> = {},
  wrapperProps: Partial<SubSectionTestWrapperProps> = {}
): RenderResult =>
  render(
    <SubSectionTestWrapper {...wrapperProps}>
      <PercentageRolloutField prefixPath="test" {...props} />
    </SubSectionTestWrapper>
  )

describe('PercentageRolloutField', () => {
  const getAllowableTypesMock = jest.spyOn(getAllowableTypesModule, 'getAllowableTypes')

  beforeEach(() => {
    jest.clearAllMocks()

    getAllowableTypesMock.mockReturnValue([
      MultiTypeInputType.FIXED,
      MultiTypeInputType.RUNTIME,
      MultiTypeInputType.EXPRESSION
    ])
  })

  test('it should switch to RUNTIME when FIXED is not allowed', async () => {
    getAllowableTypesMock.mockReturnValue([MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION])

    renderComponent()

    expect(await screen.findByPlaceholderText(RUNTIME_INPUT_VALUE)).toBeInTheDocument()
  })

  test('it should switch to EXPRESSION when FIXED and RUNTIME are not allowed', async () => {
    getAllowableTypesMock.mockReturnValue([MultiTypeInputType.EXPRESSION])

    renderComponent()

    expect(await screen.findByPlaceholderText('<+expression>')).toBeInTheDocument()
  })

  test('it should display as FIXED by default', async () => {
    renderComponent({}, { flag: MockFeature })

    expect(await screen.findAllByRole('spinbutton')).toHaveLength(MockFeature.variations.length)
  })

  test('it should change type when RUNTIME is selected', async () => {
    renderComponent({}, { flag: MockFeature })

    expect(await screen.findAllByRole('spinbutton')).not.toHaveLength(0)

    await userEvent.click(await screen.findByRole('button'))

    await userEvent.click(await screen.findByText('Runtime input'))

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    expect(await screen.findByPlaceholderText(RUNTIME_INPUT_VALUE)).toBeInTheDocument()
  })

  test('it should show a message when the mode is deployment form but no flag has been selected', async () => {
    renderComponent({}, { mode: StepViewType.DeploymentForm, flag: undefined })

    expect(await screen.findByText('cf.pipeline.flagConfiguration.pleaseSelectFlag')).toBeInTheDocument()
  })
})
