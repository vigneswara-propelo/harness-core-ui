/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubSectionTestWrapper, { SubSectionTestWrapperProps } from '../../__tests__/SubSectionTestWrapper.mock'
import { SubSectionComponentProps } from '../../../subSection.types'
import SetFlagSwitch, { setFlagSwitchSchema } from '../SetFlagSwitch'

const renderComponent = (
  props: Partial<SubSectionComponentProps> = {},
  testWrapperProps: Partial<SubSectionTestWrapperProps> = {}
): RenderResult =>
  render(
    <SubSectionTestWrapper {...testWrapperProps}>
      <SetFlagSwitch prefixPath="test" title="Set Flag Switch" {...props} />
    </SubSectionTestWrapper>
  )

describe('SetFlagSwitch', () => {
  test('it should display a select box with On and Off options', async () => {
    renderComponent()

    expect(screen.getByText('cf.pipeline.flagConfiguration.switchTo')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('cf.pipeline.flagConfiguration.selectOnOrOff')
    expect(input).toBeInTheDocument()

    expect(screen.queryByText('common.ON')).not.toBeInTheDocument()
    expect(screen.queryByText('common.OFF')).not.toBeInTheDocument()

    await userEvent.click(input)

    expect(screen.getByText('common.ON')).toBeInTheDocument()
    expect(screen.getByText('common.OFF')).toBeInTheDocument()
  })
})

describe('setFlagSwitchSchema', () => {
  const getStringMock = jest.fn().mockImplementation(str => str)

  test('it should throw when state is not specified', async () => {
    expect(() => setFlagSwitchSchema(getStringMock).validateSync({ spec: {} })).toThrow(
      'cf.featureFlags.flagPipeline.validation.setFlagSwitch.state'
    )
  })

  test('it should not throw when state is specified', async () => {
    expect(() => setFlagSwitchSchema(getStringMock).validateSync({ spec: { state: 'ON' } })).not.toThrow()
  })
})
