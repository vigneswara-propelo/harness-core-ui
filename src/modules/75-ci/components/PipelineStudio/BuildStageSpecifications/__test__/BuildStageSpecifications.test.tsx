/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import BuildStageSpecifications from '../BuildStageSpecifications'
import {
  getDummyPipelineContextValue,
  mockedPipelineContextValueForCloudInfra,
  mockedPipelineContextValueForNonCloudInfra
} from './BuildStageSpecificationsTestHelpers'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  useGetSettingValue: jest.fn().mockImplementation(() => ({ data: { value: 'false' } }))
}))

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as any),
  debounce: jest.fn(fn => {
    fn.flush = jest.fn()
    return fn
  }),
  noop: jest.fn()
}))
jest.mock('@pipeline/components/ErrorsStrip/ErrorsStripBinded', () => () => <></>)

describe('BuildStageSpecifications tests', () => {
  const pipelineContextMockValue = getDummyPipelineContextValue()
  test('renders correctly', async () => {
    const { container, getAllByText, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMockValue}>
          <BuildStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(getByText('stageDetails')).toBeDefined()
    expect(getAllByText('pipelineSteps.build.stageSpecifications.sharedPaths').length).toBe(2)

    // Toggle Clone Codebase
    act(() => {
      fireEvent.click(getByText('cloneCodebaseLabel'))
    })

    // Open Advanced section
    act(() => {
      fireEvent.click(getByText('advancedTitle'))
    })

    expect(getByText('pipeline.stageVariables')).toBeTruthy()

    expect(getByText('pipelineSteps.timeoutLabel')).toBeInTheDocument()

    expect(container).toMatchSnapshot()
  })

  test('Render for Non Cloud infra for new configuration mode', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={mockedPipelineContextValueForNonCloudInfra}>
          <BuildStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(getByText('pipeline.cacheIntelligence.label')).toBeInTheDocument()
    expect(getByText('ci.cacheIntelligence.enable')).toBeInTheDocument()

    const switches = container.querySelectorAll('input[type="checkbox"]')
    expect(switches.length).toBe(2) // clone codebase and enable cache intelligence

    const enableCacheIntelSwitch = switches[1]
    expect(enableCacheIntelSwitch).not.toHaveClass('bp3-disabled')

    await act(async () => {
      fireEvent.click(enableCacheIntelSwitch)
    })
    // Should not be able to enable Cache Intelligence on Non cloud infra
    expect(enableCacheIntelSwitch.getAttribute('checked')).toBeFalsy()
  })

  test('Render for Cloud infra for new configuration mode', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={mockedPipelineContextValueForCloudInfra}>
          <BuildStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(getByText('pipeline.cacheIntelligence.label')).toBeInTheDocument()
    expect(getByText('ci.cacheIntelligence.enable')).toBeInTheDocument()

    const switches = container.querySelectorAll('input[type="checkbox"]')
    expect(switches.length).toBe(2) // clone codebase and enable cache intelligence

    const enableCacheIntelSwitch = switches[1]
    expect(enableCacheIntelSwitch).not.toHaveClass('bp3-disabled')

    /* Paths and key are visible only when Caching is enabled */

    expect(screen.queryByText('pipelineSteps.paths')).not.toBeInTheDocument()
    expect(screen.queryByText('keyLabel')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.click(enableCacheIntelSwitch)
    })

    expect(enableCacheIntelSwitch).not.toHaveAttribute('checked')

    expect(getByText('pipelineSteps.paths')).toBeInTheDocument()
    expect(getByText('keyLabel')).toBeInTheDocument()
  })

  test('Switch infrastructure to verify Cache intelligence section behaviour', async () => {
    const { container, rerender } = render(
      <TestWrapper>
        <PipelineContext.Provider value={mockedPipelineContextValueForNonCloudInfra}>
          <BuildStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const switchSelector = 'label.bp3-switch'
    const checkBoxSelector = 'input[type="checkbox"]'

    expect(container.querySelectorAll(switchSelector)?.[1]).toBeDefined()
    expect(container.querySelectorAll(switchSelector)[1]).toHaveClass('bp3-disabled')
    expect(container.querySelectorAll(checkBoxSelector)[1]).toHaveAttribute('disabled')

    rerender(
      <TestWrapper>
        <PipelineContext.Provider value={mockedPipelineContextValueForCloudInfra}>
          <BuildStageSpecifications />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(container.querySelectorAll(switchSelector)[1])
    })

    expect(container.querySelectorAll(switchSelector)[1]).not.toHaveClass('bp3-disabled')
    expect(container.querySelectorAll(checkBoxSelector)[1]).not.toHaveAttribute('disabled')
    expect(container.querySelectorAll(checkBoxSelector)[1]).toHaveAttribute('checked')
  })
})
